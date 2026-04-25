import React, { useState } from 'react';
import { Send, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';

const PayoutForm = ({ onSubmit, submitting, message }) => {
  const [amount, setAmount] = useState('');
  const [bankAccount, setBankAccount] = useState('BANK-123-456');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount) return;
    onSubmit(amount, bankAccount);
    setAmount('');
  };

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <Send className="w-5 h-5 text-slate-400" />
        <h3 className="text-lg font-semibold text-slate-900">Request Payout</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-widest mb-2 ml-1">Transfer Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 font-medium text-lg">₹</span>
            <input 
              type="number" 
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              placeholder="0.00"
              className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 pl-9 pr-4 text-slate-900 font-medium text-lg focus:bg-white focus:border-slate-200 outline-none transition-all placeholder:text-slate-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-medium text-slate-400 uppercase tracking-widest mb-2 ml-1">Destination Account</label>
          <input 
            type="text" 
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            required
            className="w-full bg-slate-50 border border-slate-100 rounded-xl py-4 px-4 text-slate-900 font-medium focus:bg-white focus:border-slate-200 outline-none transition-all"
          />
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
            message.type === 'success' 
              ? "bg-emerald-50 text-emerald-600 border-emerald-50" 
              : "bg-rose-50 text-rose-600 border-rose-50"
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span className="font-medium">{message.text}</span>
          </div>
        )}

        <button 
          type="submit" 
          disabled={submitting || !amount}
          className="w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-50 disabled:text-slate-300 text-white font-medium py-4 rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Initiate Transfer"}
        </button>
      </form>
    </div>
  );
};

export default PayoutForm;