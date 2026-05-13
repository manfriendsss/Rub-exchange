import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Currency } from '../types';
import { CURRENCIES } from '../constants';

interface CurrencyPickerProps {
  isOpen: boolean;
  onClose: () => void;
  pickerType: 'source' | 'target';
  theme: 'light' | 'dark';
  selectedCurrency: Currency;
  targetCurrency: Currency;
  onSelectSource: (currency: Currency) => void;
  onSelectTarget: (currency: Currency) => void;
}

export function CurrencyPicker({
  isOpen,
  onClose,
  pickerType,
  theme,
  selectedCurrency,
  targetCurrency,
  onSelectSource,
  onSelectTarget
}: CurrencyPickerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex flex-col pt-12">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-md" 
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`relative flex-1 rounded-t-[40px] border-t flex flex-col overflow-hidden max-h-[85vh] mt-auto transition-colors duration-500 ${theme === 'dark' ? 'bg-[#1e293b] border-slate-800' : 'bg-slate-50 border-slate-200'}`}
          >
            <div className="px-8 pt-8 pb-4 flex items-center justify-between">
              <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{pickerType === 'source' ? 'CHỌN TIỀN GỐC' : 'CHỌN TIỀN ĐẾN'}</h3>
              <button onClick={onClose} className={`p-2 rounded-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <X className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
              </button>
            </div>
            <div className="px-6 pb-12 overflow-y-auto no-scrollbar grid grid-cols-2 gap-3">
              {CURRENCIES.map(curr => {
                const isSelected = pickerType === 'source' ? selectedCurrency.code === curr.code : targetCurrency.code === curr.code;
                return (
                  <button
                    key={curr.code}
                    onClick={() => {
                      if (pickerType === 'source') onSelectSource(curr);
                      else onSelectTarget(curr);
                      onClose();
                      if ('vibrate' in navigator) navigator.vibrate(5);
                    }}
                    className={`p-4 rounded-3xl border flex flex-col items-center gap-2 transition-all active:scale-95
                      ${isSelected
                        ? 'bg-emerald-500/10 border-emerald-500' 
                        : (theme === 'dark' ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-200 shadow-sm')}`}
                  >
                    <span className="text-3xl">{curr.flag}</span>
                    <div className="text-center">
                      <div className={`text-sm font-bold leading-none mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{curr.code}</div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase">{curr.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
