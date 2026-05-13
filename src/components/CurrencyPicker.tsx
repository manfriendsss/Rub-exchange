import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Keyboard } from 'lucide-react';
import { Currency } from '../types';
import { CURRENCIES } from '../constants';
import { VirtualKeyboard } from './VirtualKeyboard';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  const filteredCurrencies = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return CURRENCIES;
    return CURRENCIES.filter(curr => 
      curr.code.toLowerCase().includes(query) || 
      curr.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleClose = () => {
    setIsKeyboardOpen(false);
    onClose();
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[120] flex flex-col pt-12">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="absolute inset-0 bg-black/90 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`relative flex-1 rounded-t-[40px] border-t flex flex-col overflow-hidden max-h-[85vh] mt-auto transition-colors duration-500 ${theme === 'dark' ? 'bg-[#1e293b] border-slate-800' : 'bg-slate-50 border-slate-200'}`}
              style={{ paddingBottom: isKeyboardOpen ? '280px' : '0px' }}
            >
              <div className="px-8 pt-8 pb-4">
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    {pickerType === 'source' ? 'TIỀN TỆ NGUỒN' : 'TIỀN TỆ ĐÍCH'}
                  </h3>
                  <button onClick={handleClose} className={`p-2 rounded-full ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                    <X className={`w-5 h-5 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
                  </button>
                </div>

                {/* Search Bar */}
                <div 
                  onClick={() => setIsKeyboardOpen(true)}
                  className={`relative flex items-center px-4 py-3 rounded-2xl border transition-all cursor-pointer ${isKeyboardOpen ? 'border-emerald-500 ring-2 ring-emerald-500/20' : (theme === 'dark' ? 'bg-slate-900/50 border-slate-700' : 'bg-white border-slate-200 shadow-sm')}`}
                >
                  <Search className={`w-5 h-5 mr-3 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`} />
                  <div className={`flex-1 text-sm font-medium ${!searchQuery ? (theme === 'dark' ? 'text-slate-600' : 'text-slate-400') : (theme === 'dark' ? 'text-white' : 'text-slate-900')}`}>
                    {searchQuery || 'Tìm theo tên hoặc mã tiền...'}
                  </div>
                  {searchQuery && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery('');
                      }} 
                      className="p-1 mr-2"
                    >
                      <X className="w-4 h-4 text-slate-500" />
                    </button>
                  )}
                  <Keyboard className={`w-4 h-4 ${isKeyboardOpen ? 'text-emerald-500' : 'text-slate-500 opacity-30'}`} />
                </div>
              </div>

              <div className="px-6 pb-12 overflow-y-auto no-scrollbar grid grid-cols-2 gap-3">
                {filteredCurrencies.length > 0 ? (
                  filteredCurrencies.map(curr => {
                    const isSelected = pickerType === 'source' ? selectedCurrency.code === curr.code : targetCurrency.code === curr.code;
                    return (
                      <button
                        key={curr.code}
                        onClick={() => {
                          if (pickerType === 'source') onSelectSource(curr);
                          else onSelectTarget(curr);
                          handleClose();
                          setSearchQuery('');
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
                  })
                ) : (
                  <div className="col-span-2 py-10 text-center text-slate-500 text-sm font-medium">
                    Không tìm thấy loại tiền nào...
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <VirtualKeyboard
        isOpen={isOpen && isKeyboardOpen}
        onClose={() => setIsKeyboardOpen(false)}
        value={searchQuery}
        onChange={setSearchQuery}
        theme={theme}
      />
    </>
  );
}
