import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Database } from 'lucide-react';

const formatPaise = (paise) => {
  const absPaise = Math.abs(paise);
  const formatted = (absPaise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  });
  return paise < 0 ? `- ${formatted}` : `+ ${formatted}`;
};

const TransactionList = ({ transactions }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-8">
        <Database className="w-5 h-5 text-slate-400" />
        <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Ledger Stream</h3>
      </div>

      <div className="space-y-2">
        {transactions.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-xs font-medium italic border-2 border-dashed border-slate-50 rounded-xl">
            No transaction activity
          </div>
        ) : (
          transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-transparent hover:border-slate-100 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  tx.amount_paise > 0 ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                }`}>
                  {tx.amount_paise > 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-900">{tx.description || (tx.amount_paise > 0 ? "Credit" : "Debit")}</div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{new Date(tx.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div className={`text-base font-medium tabular-nums ${tx.amount_paise > 0 ? "text-emerald-600" : "text-slate-900"}`}>
                {formatPaise(tx.amount_paise)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionList;