from rest_framework import serializers
from .models import Merchant, Payout, LedgerEntry

class MerchantSerializer(serializers.ModelSerializer):
    balance_paise = serializers.ReadOnlyField()

    class Meta:
        model = Merchant
        fields = ['id', 'name', 'email', 'balance_paise']

class PayoutSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payout
        fields = ['id', 'merchant', 'amount_paise', 'bank_account_id', 'status', 'idempotency_key', 'created_at', 'updated_at']
        read_only_fields = ['status', 'idempotency_key']

class LedgerEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = LedgerEntry
        fields = ['id', 'merchant', 'amount_paise', 'entry_type', 'payout', 'description', 'created_at']
