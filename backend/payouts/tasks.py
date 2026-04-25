from huey.contrib.djhuey import db_task, db_periodic_task
from huey import crontab
from django.db import transaction
from django.utils import timezone
from .models import Payout, LedgerEntry
import random

@db_task()
def process_payout(payout_id):
    try:
        payout = Payout.objects.get(id=payout_id)
        
        if payout.status not in ['PENDING', 'PROCESSING']:
            return

        payout.status = 'PROCESSING'
        payout.save()

        # Simulate bank processing outcomes
        rand = random.random()
        
        if rand < 0.7:
            # Success
            with transaction.atomic():
                payout.status = 'COMPLETED'
                payout.save()
        elif rand < 0.9:
            # Fail - Reverse the ledger entry
            with transaction.atomic():
                payout.status = 'FAILED'
                payout.save()
                
                LedgerEntry.objects.create(
                    merchant=payout.merchant,
                    amount_paise=payout.amount_paise,
                    entry_type='REFUND',
                    payout=payout,
                    description=f"Refund for failed payout {payout.id}"
                )
        else:
            # Timeout simulation - will be picked up by cron
            pass

    except Payout.DoesNotExist:
        pass

@db_periodic_task(crontab(minute='*'))
def retry_stuck_payouts():
    threshold = timezone.now() - timezone.timedelta(seconds=30)
    
    # Retry logic for timeouts
    stuck = Payout.objects.filter(status='PROCESSING', updated_at__lt=threshold, retry_count__lt=3)
    for p in stuck:
        p.retry_count += 1
        p.save()
        process_payout(p.id)

    # Permanent failures after max retries
    dead = Payout.objects.filter(status='PROCESSING', updated_at__lt=threshold, retry_count__gte=3)
    for p in dead:
        with transaction.atomic():
            p.status = 'FAILED'
            p.save()
            LedgerEntry.objects.create(
                merchant=p.merchant,
                amount_paise=p.amount_paise,
                entry_type='REFUND',
                payout=p,
                description=f"Failed after max retries"
            )
