import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Delete, Space as SpaceIcon } from 'lucide-react';

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
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE']
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

  // Common button class to ensure "to đều nhau"
  const btnBaseClass = `h-11 sm:h-12 flex items-center justify-center text-sm font-black rounded-xl border transition-all active:scale-90`;
  const keyBtnClass = `${btnBaseClass} ${theme === 'dark' ? 'bg-slate-800/90 text-white border-slate-700 shadow-[0_2px_0_0_rgba(0,0,0,0.3)]' : 'bg-white text-slate-900 border-slate-200 shadow-[0_2px_0_0_rgba(0,0,0,0.05)]'}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 300 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 300 }}
          transition={{ type: 'spring', damping: 25, stiffness: 250 }}
          className={`fixed bottom-0 left-0 right-0 z-[150] w-full px-1 pb-8 pt-4 border-t rounded-t-[32px] shadow-[0_-10px_40px_rgba(0,0,0,0.2)] transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50 border-slate-200'}`}
        >
          <div className="max-w-md mx-auto flex flex-col gap-1.5">
            {rows.map((row, rIdx) => (
              <div key={rIdx} className={`flex justify-center gap-1 px-1 ${rIdx === 1 ? 'px-4' : ''}`}>
                {row.map(key => {
                  if (key === 'BACKSPACE') {
                    return (
                      <motion.button
                        key="backspace"
                        whileTap={{ scale: 0.9 }}
                        onClick={handleBackspace}
                        className={`${btnBaseClass} w-12 sm:w-14 ${theme === 'dark' ? 'bg-slate-700/50 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-400 border-slate-200 shadow-sm'}`}
                      >
                        <Delete className="w-5 h-5" />
                      </motion.button>
                    );
                  }
                  return (
                    <motion.button
                      key={key}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleKeyPress(key)}
                      className={`${keyBtnClass} flex-1`}
                    >
                      {key}
                    </motion.button>
                  );
                })}
              </div>
            ))}
            
            <div className="flex justify-center gap-1.5 px-1 mt-1">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleClear}
                className={`${btnBaseClass} w-12 sm:w-14 ${theme === 'dark' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-red-50 text-red-500 border-red-100 shadow-sm'}`}
              >
                C
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => handleKeyPress(' ')}
                className={`${keyBtnClass} flex-[4]`}
              >
                <SpaceIcon className="w-5 h-5 opacity-40" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="flex-[1.5] h-11 sm:h-12 bg-emerald-600 text-white font-black rounded-xl border border-emerald-400/20 shadow-[0_3px_0_0_rgba(5,150,105,0.4)] transition-transform text-[10px] uppercase tracking-widest flex items-center justify-center"
              >
                ĐÓNG
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
