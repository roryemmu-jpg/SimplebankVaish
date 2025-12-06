import React from 'react';
import { Transaction } from '../types';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

export const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
        No transactions yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.slice().reverse().map((tx) => (
        <div 
          key={tx.id} 
          className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
            }`}>
              {tx.type === 'deposit' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14"/><path d="M19 12l-7 7-7-7"/></svg>
              )}
            </div>
            <div>
              <div className="text-sm font-medium text-white capitalize">{tx.type}</div>
              <div className="text-xs text-slate-500">{new Date(tx.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
          </div>
          <div className={`font-mono font-medium ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
};