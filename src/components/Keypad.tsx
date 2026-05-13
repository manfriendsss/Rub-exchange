import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Delete } from 'lucide-react';

interface KeypadProps {
  isOpen: boolean;
  onClose: () => void;
  setInputValue: React.Dispatch<React.SetStateAction<string>>;
  theme: 'light' | 'dark';
}

export function Keypad({ isOpen, onClose, setInputValue, theme }: KeypadProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[150]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            key="keypad-panel"
            initial={{ opacity: 0, y: 300 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            className={`w-full px-6 pb-8 pt-5 border-t rounded-t-[32px] shadow-xl transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50 border-slate-200'}`}
          >
            <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto overflow-hidden text-slate-800 dark:text-white">
              {[
                ['7', '8', '9', '/'],
                ['4', '5', '6', '*'],
                ['1', '2', '3', '-'],
                ['.', '0', '000', '+'],
              ].map((row, rIdx) => (
                <div key={rIdx} className="contents">
                  {row.map(key => (
                    <motion.button
                      key={key}
                      whileTap={{ 
                        backgroundColor: 'rgba(16, 185, 129, 0.4)',
                        borderColor: 'rgba(16, 185, 129, 0.5)',
                      }}
                      transition={{ 
                        duration: 0.6,
                        ease: "easeOut"
                      }}
                      onClick={() => {
                        if ('vibrate' in navigator) navigator.vibrate(5);
                        setInputValue(prev => {
                          if (prev === '0' && key === '000') return '0';
                          if (prev === '0' && !isNaN(Number(key))) return key;
                          if (prev.length > 22) return prev;
                          return prev + key;
                        });
                      }}
                      className={`h-11 sm:h-12 flex items-center justify-center text-xl font-bold rounded-2xl active:scale-95 border transition-colors
                        ${['/', '*', '-', '+'].includes(key) 
                          ? (theme === 'dark' ? 'bg-slate-800 text-emerald-400 border-emerald-500/10' : 'bg-emerald-50 text-emerald-600 border-emerald-200') 
                          : (theme === 'dark' ? 'bg-slate-800/50 text-white border-slate-800' : 'bg-slate-100 text-slate-900 border-slate-200')}`}
                    >
                      {key === '*' ? '×' : key === '/' ? '÷' : key}
                    </motion.button>
                  ))}
                </div>
              ))}
              <div className="grid grid-cols-4 gap-2 col-span-4">
                <motion.button
                  whileTap={{ backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  onClick={() => {
                    if ('vibrate' in navigator) navigator.vibrate(5);
                    setInputValue(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
                  }}
                  className={`h-11 sm:h-12 border rounded-2xl flex items-center justify-center font-bold active:scale-95 transition-all
                    ${theme === 'dark' ? 'bg-slate-800/40 text-slate-500 border-slate-800' : 'bg-slate-100 text-slate-400 border-slate-200'}`}
                >
                  <Delete className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileTap={{ backgroundColor: 'rgba(239, 68, 68, 0.4)' }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  onClick={() => {
                    if ('vibrate' in navigator) navigator.vibrate(5);
                    setInputValue('0');
                  }}
                  className={`h-11 sm:h-12 border rounded-2xl flex items-center justify-center font-bold active:scale-95 transition-all
                    ${theme === 'dark' ? 'bg-red-500/5 text-red-400/80 border-red-500/10' : 'bg-red-50 text-red-500/80 border-red-100'}`}
                >
                  C
                </motion.button>
                <motion.button
                  whileTap={{ backgroundColor: 'rgba(5, 150, 105, 1)', scale: 0.98 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  onClick={onClose}
                  className="col-span-2 h-11 sm:h-12 bg-emerald-600 text-white font-black rounded-2xl border border-emerald-400/20 active:scale-95 transition-transform text-sm uppercase tracking-[0.2em] flex items-center justify-center"
                >
                  XONG
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
