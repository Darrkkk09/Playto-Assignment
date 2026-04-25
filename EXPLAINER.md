# 🚀 Playto Payout Engine: How It Works

I built this payout engine to manage merchant withdrawals in a safe and practical way. The goal was not only speed, but also making sure money handling stays correct in every situation.

---

## 1. Preventing Double Withdrawals

### Problem:
What if a merchant clicks the withdraw button twice at the same time?

This could create two payout requests and cause extra money to be deducted.

### Solution:
I used **database locking**.

When one payout request starts, the merchant record gets locked for a moment. Any second request has to wait until the first one finishes.

### Result:
Only one request is processed at a time, so balance stays safe.

---

## 2. Handling Repeat Requests

### Problem:
Sometimes internet may fail after clicking withdraw. The user may think it failed and click again.

### Solution:
Each request gets a unique **Idempotency Key**.

If the same request comes again, the system checks the key and returns the old result instead of processing twice.

### Result:
No duplicate payouts.

---

## 3. Keeping Balance Accurate

### Problem:
Keeping only one balance number in database can be risky if something goes wrong.

### Solution:
I used a **ledger system**.

Instead of editing balance directly, every transaction is stored as a separate entry:

- Credit = money added
- Debit = money deducted

Balance is calculated from all entries.

### Result:
Full history is available and balance remains trustworthy.

---

## 4. Background Processing

### Problem:
Bank or payout processing can take time. Users should not wait too long.

### Solution:
I used **Huey background workers**.

When user requests payout:

- Request is accepted instantly
- Status becomes Pending
- Actual processing happens in background

If payout fails, refund is added automatically.

### Result:
Better user experience and smoother processing.

---

# 🛠️ Tech Stack

- **Backend:** Django + Django REST Framework  
- **Frontend:** React + Tailwind CSS  
- **Worker Queue:** Huey  
- **Database:** PostgreSQL  
- **Hosting:** Render + Vercel  

---

# Final Goal

The system was built to make payouts:

- Safe  
- Reliable  
- Easy to track  
- Fast for users  
- Ready for real-world usage  