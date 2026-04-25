import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Header from './components/Header';
import BalanceCards from './components/BalanceCards';
import PayoutForm from './components/PayoutForm';
import PayoutHistory from './components/PayoutHistory';
import TransactionList from './components/TransactionList';

const API_BASE = 'https://playto-assignment-ranjitkumar.onrender.com/api/v1';

const App = () => {
  const [merchantId, setMerchantId] = useState(1);
  const [balance, setBalance] = useState({ available_balance_paise: 0, held_balance_paise: 0 });
  const [payouts, setPayouts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetchData = useCallback(async () => {
    try {
      const [balanceRes, payoutsRes, txRes] = await Promise.all([
        axios.get(`${API_BASE}/merchants/${merchantId}/balance/`),
        axios.get(`${API_BASE}/merchants/${merchantId}/payouts/`),
        axios.get(`${API_BASE}/merchants/${merchantId}/transactions/`)
      ]);
      setBalance(balanceRes.data);
      setPayouts(payoutsRes.data);
      setTransactions(txRes.data);
    } catch (err) {
      console.error("Error fetching data", err);
    } finally {
      setLoading(false);
    }
  }, [merchantId]);

  const handleMerchantChange = (newId) => {
    setMerchantId(newId);
    setLoading(true);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handlePayoutSubmit = async (amount, bankAccount) => {
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    const amountPaise = Math.round(parseFloat(amount) * 100);
    const idempotencyKey = crypto.randomUUID ? crypto.randomUUID() :
      ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
      );

    try {
      await axios.post(
        `${API_BASE}/merchants/${merchantId}/payouts/`,
        { amount_paise: amountPaise, bank_account_id: bankAccount },
        { headers: { 'Idempotency-Key': idempotencyKey } }
      );
      setMessage({ type: 'success', text: `Payout request of ₹${amount} submitted!` });
      fetchData();
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to submit payout";
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 p-6 md:p-12 font-sans selection:bg-slate-100">
      <div className="max-w-6xl mx-auto">
        <Header 
          merchantId={merchantId} 
          onMerchantChange={handleMerchantChange} 
        />

        <BalanceCards 
          available={balance.available_balance_paise} 
          held={balance.held_balance_paise} 
          loading={loading} 
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <PayoutForm 
              onSubmit={handlePayoutSubmit} 
              submitting={submitting} 
              message={message} 
            />
          </div>

          <div className="lg:col-span-8 space-y-10">
            <TransactionList 
              transactions={transactions} 
            />
            <PayoutHistory 
              payouts={payouts} 
              onRefresh={fetchData} 
            />
          </div>
        </div>

        <footer className="mt-20 py-10 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[10px] font-medium text-slate-300 uppercase tracking-widest">
            © 2026 Playto Pay Infrastructure
          </p>
          <div className="flex gap-6 text-[10px] font-medium text-slate-300 uppercase tracking-widest">
            <span>Documentation</span>
            <span>Security</span>
            <span>Support</span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
