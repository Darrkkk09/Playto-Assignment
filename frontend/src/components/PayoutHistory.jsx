import React from 'react';
import { History, RefreshCw } from 'lucide-react';

const formatPaise = (paise) => {
  return (paise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  });
};

const getStatusBadge = (status) => {
  const styles = {
    PENDING: "bg-slate-50 text-slate-500 border-slate-100",
    PROCESSING: "bg-blue-50 text-blue-500 border-blue-100",
    COMPLETED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    FAILED: "bg-rose-50 text-rose-500 border-rose-100",
  };

  return (
    <div className={`px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider ${styles[status]}`}>
      {status}
    </div>
  );
};

const PayoutHistory = ({ payouts, onRefresh }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-900 tracking-tight">Payout History</h3>
        </div>
        <button onClick={onRefresh} className="p-2 hover:bg-slate-50 rounded-lg transition-colors group">
          <RefreshCw className="w-4 h-4 text-slate-400 group-active:rotate-180 transition-transform" />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-50 text-[11px] font-medium text-slate-400 uppercase tracking-widest">
              <th className="pb-4">Date & ID</th>
              <th className="pb-4">Amount</th>
              <th className="pb-4">Account</th>
              <th className="pb-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {payouts.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-20 text-center text-slate-300 text-xs italic">No payout records found</td>
              </tr>
            ) : (
              payouts.map((payout) => (
                <tr key={payout.id} className="group hover:bg-slate-50 transition-colors">
                  <td className="py-4 text-xs font-medium text-slate-900">
                    <div>{new Date(payout.created_at).toLocaleDateString()}</div>
                    <div className="text-[10px] text-slate-300 uppercase tracking-tight">#{payout.id}</div>
                  </td>
                  <td className="py-4 text-sm font-medium text-slate-900 tabular-nums">
                    {formatPaise(payout.amount_paise)}
                  </td>
                  <td className="py-4">
                    <span className="text-[10px] font-mono text-slate-400">{payout.bank_account_id}</span>
                  </td>
                  <td className="py-4 text-right">
                    <div className="flex justify-end">
                      {getStatusBadge(payout.status)}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PayoutHistory;