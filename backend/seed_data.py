import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from payouts.models import Merchant, LedgerEntry

def seed():
    print("Initializing merchant data...")
    
    merchants_data = [
        {'name': 'Ranjit Kumar', 'email': 'ranjit@example.com'},
        {'name': 'Playto Agency', 'email': 'agency@playto.so'},
        {'name': 'Freelancer John', 'email': 'john@freelance.com'},
    ]
    
    for m_data in merchants_data:
        merchant, created = Merchant.objects.get_or_create(
            email=m_data['email'],
            defaults={'name': m_data['name']}
        )
        
        if merchant.ledger_entries.count() == 0:
            # 4000 INR total initial credits
            credits = [100000, 250000, 50000]
            for amount in credits:
                LedgerEntry.objects.create(
                    merchant=merchant,
                    amount_paise=amount,
                    entry_type='CREDIT',
                    description="Initial Credit"
                )
            print(f"Set up {merchant.name} with ₹4,000.00")

    # Superuser for admin panel
    from django.contrib.auth.models import User
    if not User.objects.filter(username='admin').exists():
        User.objects.create_superuser('admin', 'admin@example.com', 'admin123')

if __name__ == '__main__':
    seed()
