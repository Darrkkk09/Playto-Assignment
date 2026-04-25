import pytest
import uuid
import threading
from django.urls import reverse
from rest_framework.test import APIClient
from .models import Merchant, LedgerEntry, Payout

@pytest.mark.django_db(transaction=True)
class TestPayoutEngine:
    def setup_method(self):
        self.client = APIClient()
        self.merchant = Merchant.objects.create(name="Test Merchant", email="test@example.com")
        # Give initial balance: 100 INR = 10000 paise
        LedgerEntry.objects.create(
            merchant=self.merchant,
            amount_paise=10000,
            entry_type='CREDIT'
        )

    def test_idempotency(self):
        """
        Submitting same key twice should return identical response and create only one payout.
        """
        url = reverse('payout-list-create', kwargs={'merchant_id': self.merchant.id})
        ikey = str(uuid.uuid4())
        payload = {'amount_paise': 6000, 'bank_account_id': 'BANK1'}
        
        # First call
        response1 = self.client.post(url, payload, HTTP_IDEMPOTENCY_KEY=ikey, format='json')
        assert response1.status_code == 201
        
        # Second call
        response2 = self.client.post(url, payload, HTTP_IDEMPOTENCY_KEY=ikey, format='json')
        assert response2.status_code == 201
        assert response1.data['id'] == response2.data['id']
        
        # Check DB
        assert Payout.objects.filter(merchant=self.merchant).count() == 1

    def test_concurrency_overdraw(self):
        """
        Merchant with 100 balance tries to withdraw 60 twice simultaneously.
        Only one should succeed.
        """
        url = reverse('payout-list-create', kwargs={'merchant_id': self.merchant.id})
        
        results = []
        def make_request():
            # New client per thread
            client = APIClient()
            ikey = str(uuid.uuid4())
            res = client.post(url, {'amount_paise': 6000, 'bank_account_id': 'BANK1'}, HTTP_IDEMPOTENCY_KEY=ikey, format='json')
            results.append(res)

        threads = [threading.Thread(target=make_request) for _ in range(2)]
        for t in threads: t.start()
        for t in threads: t.join()

        successes = [r for r in results if r.status_code == 201]
        failures = [r for r in results if r.status_code == 400]

        assert len(successes) == 1
        assert len(failures) == 1
        assert failures[0].data['error'] == "Insufficient balance"
        
        # Final balance should be 4000
        assert self.merchant.balance_paise == 4000
