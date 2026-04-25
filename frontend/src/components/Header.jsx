import React from 'react';
import { Wallet, ChevronDown } from 'lucide-react';

const Header = ({ merchantId, onMerchantChange }) => {
  const merchants = [
    { id: 1, name: "Ranjit Kumar", initial: "R" },
    { id: 2, name: "Playto Agency", initial: "P" },
    { id: 3, name: "John Doe", initial: "J" }
  ];

  const currentMerchant = merchants.find(m => m.id === merchantId);

  return (
    <header className="flex items-center justify-between py-8 border-b border-slate-100 mb-10">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Playto Pay</h1>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Payments Console</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="flex items-center gap-3 bg-white border border-slate-200 p-2 pl-3 rounded-xl hover:border-slate-300 transition-all cursor-pointer">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-medium text-xs">
              {currentMerchant?.initial}
            </div>
            <p className="text-xs font-medium text-slate-900 hidden sm:block">{currentMerchant?.name}</p>
            <select 
              value={merchantId} 
              onChange={(e) => onMerchantChange(parseInt(e.target.value))}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            >
              {merchants.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;