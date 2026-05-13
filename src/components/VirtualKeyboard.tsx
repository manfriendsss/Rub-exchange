import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Delete, X, Space } from 'lucide-react';

interface VirtualKeyboardProps {
  isOpen: boolean;
  onClose: () => void;
  value: string;
  onChange: (value: string | ((prev: string) => string)) => void;
  theme: 'light' | 'dark';
}

export function VirtualKeyboard({ isOpen, onClose, value, onChange, theme }: VirtualKeyboardProps) {
  const rows = [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
  ];

  const handleKeyPress = (key: string) => {
    if ('vibrate' in navigator) navigator.vibrate(5);
    onChange(prev => prev + key);
  };

  const handleBackspace = () => {
    if ('vibrate' in navigator) navigator.vibrate(5);
    onChange(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    if ('vibrate' in navigator) navigator.vibrate(5);
    onChange('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 300 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 300 }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className={`fixed bottom-0 left-0 right-0 z-[150] w-full px-2 pb-6 pt-4 border-t rounded-t-[32px] shadow-2xl transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50 border-slate-200'}`}
        >
          <div className="max-w-md mx-auto flex flex-col gap-2">
            {rows.map((row, rIdx) => (
              <div key={rIdx} className="flex justify-center gap-1">
                {row.map(key => (
                  <motion.button
                    key={key}
                    whileTap={{ scale: 0.9, backgroundColor: 'rgba(16, 185, 129, 0.4)' }}
                    onClick={() => handleKeyPress(key)}
                    className={`flex-1 h-12 flex items-center justify-center text-sm font-bold rounded-xl border transition-all
                      ${theme === 'dark' ? 'bg-slate-800/50 text-white border-slate-800' : 'bg-white text-slate-900 border-slate-200 shadow-sm'}`}
                  >
                    {key}
                  </motion.button>
                ))}
              </div>
            ))}
            <div className="flex justify-center gap-1">
              <motion.button
                whileTap={{ scale: 0.9, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                onClick={handleClear}
                className={`w-14 h-12 flex items-center justify-center text-xs font-bold rounded-xl border transition-all
                  ${theme === 'dark' ? 'bg-red-500/5 text-red-400/80 border-red-500/10' : 'bg-red-50 text-red-500/80 border-red-100'}`}
              >
                C
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95, backgroundColor: 'rgba(16, 185, 129, 0.4)' }}
                onClick={() => handleKeyPress(' ')}
                className={`flex-1 h-12 flex items-center justify-center rounded-xl border transition-all
                  ${theme === 'dark' ? 'bg-slate-800/50 text-white border-slate-800' : 'bg-white text-slate-900 border-slate-200 shadow-sm'}`}
              >
                <Space className="w-5 h-5 opacity-40" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.9, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                onClick={handleBackspace}
                className={`w-14 h-12 flex items-center justify-center rounded-xl border transition-all
                  ${theme === 'dark' ? 'bg-slate-800/40 text-slate-500 border-slate-800' : 'bg-slate-100 text-slate-400 border-slate-200'}`}
              >
                <Delete className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95, backgroundColor: 'rgba(5, 150, 105, 1)' }}
                onClick={onClose}
                className="w-20 h-12 bg-emerald-600 text-white font-black rounded-xl border border-emerald-400/20 active:scale-95 transition-transform text-[10px] uppercase tracking-wider"
              >
                XONG
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
