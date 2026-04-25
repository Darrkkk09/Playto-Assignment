import React from 'react';
import { Clock, ShieldCheck } from 'lucide-react';

const formatPaise = (paise) => {
  return (paise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  });
};

const BalanceCards = ({ available, held, loading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
      <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">Available Balance</p>
        </div>
        <h2 className="text-4xl font-semibold text-slate-900 tracking-tight mb-4">
          {loading ? "••••••" : formatPaise(available)}
        </h2>
        <div className="text-[11px] text-slate-400 font-medium">Verified Assets</div>
      </div>

      <div className="p-8 rounded-2xl bg-white border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-slate-400" />
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-widest">Held Funds</p>
        </div>
        <h2 className="text-4xl font-semibold text-slate-900 tracking-tight mb-4">
          {loading ? "••••••" : formatPaise(held)}
        </h2>
        <div className="text-[11px] text-slate-400 font-medium">Standard 72h settlement</div>
      </div>
    </div>
  );
};

export default BalanceCards;