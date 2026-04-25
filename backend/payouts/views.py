from rest_framework import status, views
from rest_framework.response import Response
from django.db import transaction
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import Merchant, Payout, LedgerEntry, IdempotencyRecord
from .serializers import MerchantSerializer, PayoutSerializer, LedgerEntrySerializer
import uuid

class MerchantBalanceView(views.APIView):
    def get(self, request, merchant_id):
        merchant = get_object_or_404(Merchant, id=merchant_id)
        available_balance = merchant.balance_paise
        
        held_balance = Payout.objects.filter(
            merchant=merchant, 
            status__in=['PENDING', 'PROCESSING']
        ).aggregate(total=Sum('amount_paise'))['total'] or 0
        
        return Response({
            'merchant_id': merchant.id,
            'name': merchant.name,
            'available_balance_paise': available_balance,
            'held_balance_paise': held_balance,
        })

class PayoutListCreateView(views.APIView):
    def get(self, request, merchant_id):
        payouts = Payout.objects.filter(merchant_id=merchant_id).order_by('-created_at')
        serializer = PayoutSerializer(payouts, many=True)
        return Response(serializer.data)

    def post(self, request, merchant_id):
        merchant = get_object_or_404(Merchant, id=merchant_id)
        
        # Idempotency check
        idempotency_key = request.headers.get('Idempotency-Key')
        if not idempotency_key:
            return Response({"error": "Idempotency-Key header is required"}, status=400)
        
        try:
            ikey = uuid.UUID(idempotency_key)
        except ValueError:
            return Response({"error": "Invalid Idempotency-Key format"}, status=400)

        existing_record = IdempotencyRecord.objects.filter(merchant=merchant, key=ikey).first()
        if existing_record:
            if (timezone.now() - existing_record.created_at).total_seconds() < 86400:
                return Response(existing_record.response_body, status=existing_record.response_code)
            existing_record.delete()

        amount_paise = request.data.get('amount_paise')
        bank_account_id = request.data.get('bank_account_id')

        if not amount_paise or not bank_account_id:
            return Response({"error": "amount_paise and bank_account_id are required"}, status=400)

        try:
            amount_paise = int(amount_paise)
            if amount_paise <= 0:
                raise ValueError()
        except ValueError:
            return Response({"error": "Invalid amount_paise"}, status=400)

        try:
            with transaction.atomic():
                # Lock merchant row to prevent race conditions
                locked_merchant = Merchant.objects.select_for_update().get(id=merchant_id)
                
                if locked_merchant.balance_paise < amount_paise:
                    error_resp = {"error": "Insufficient balance"}
                    self._save_idempotency(merchant, ikey, 400, error_resp)
                    return Response(error_resp, status=400)

                payout = Payout.objects.create(
                    merchant=locked_merchant,
                    amount_paise=amount_paise,
                    bank_account_id=bank_account_id,
                    status='PENDING',
                    idempotency_key=ikey
                )

                # Deduct from balance immediately (Ledger record)
                LedgerEntry.objects.create(
                    merchant=locked_merchant,
                    amount_paise=-amount_paise, 
                    entry_type='DEBIT',
                    payout=payout,
                    description=f"Payout request {payout.id}"
                )

                serializer = PayoutSerializer(payout)
                success_resp = serializer.data
                self._save_idempotency(merchant, ikey, 201, success_resp)
            
            # Trigger worker outside the atomic transaction
            from .tasks import process_payout
            process_payout(payout.id)
                
            return Response(success_resp, status=201)

        except Exception as e:
            return Response({"error": "Internal server error"}, status=500)

    def _save_idempotency(self, merchant, key, code, body):
        IdempotencyRecord.objects.create(
            merchant=merchant,
            key=key,
            response_code=code,
            response_body=body
        )

class MerchantTransactionsView(views.APIView):
    def get(self, request, merchant_id):
        entries = LedgerEntry.objects.filter(merchant_id=merchant_id).order_by('-created_at')
        serializer = LedgerEntrySerializer(entries, many=True)
        return Response(serializer.data)
