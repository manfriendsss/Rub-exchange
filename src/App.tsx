import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, animate } from 'motion/react';
import { History, X, ArrowDown, RefreshCw, Coins, TrendingUp, Check, Copy, Delete } from 'lucide-react';

const RATE = 348;

interface HistoryItem {
  id: string;
  rub: number;
  vnd: number;
  timestamp: number;
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 0.4,
      onUpdate: (latest) => setDisplayValue(Math.floor(latest)),
    });
    return () => controls.stop();
  }, [value]);

  return <span>{new Intl.NumberFormat('vi-VN').format(displayValue)}</span>;
}

export default function App() {
  const [rubInput, setRubInput] = useState<string>('0');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [copied, setCopied] = useState(false);

  const [isKeypadOpen, setIsKeypadOpen] = useState(false);

  // Parse calculation if any
  const rubValue = useMemo(() => {
    try {
      // Basic math evaluation (only + - * /)
      const cleanedInput = rubInput.replace(/[^0-9+\-*/.]/g, '');
      if (!cleanedInput) return 0;
      const result = Function(`"use strict"; return (${cleanedInput})`)();
      return typeof result === 'number' && !isNaN(result) ? result : 0;
    } catch {
      return parseFloat(rubInput) || 0;
    }
  }, [rubInput]);

  const vndAmount = useMemo(() => {
    return rubValue * RATE;
  }, [rubValue]);

  const addToHistory = () => {
    if (rubValue <= 0) return;

    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      rub: rubValue,
      vnd: rubValue * RATE,
      timestamp: Date.now(),
    };

    setHistory((prev) => [newItem, ...prev].slice(0, 20));
    setRubInput('0');
    if ('vibrate' in navigator) navigator.vibrate(10);
    setIsKeypadOpen(false); // Close keypad after saving
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(Math.round(vndAmount).toString());
      setCopied(true);
      if ('vibrate' in navigator) navigator.vibrate([10, 30, 10]);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('rub_vnd_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('rub_vnd_history', JSON.stringify(history));
  }, [history]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="flex flex-col h-svh w-full bg-[#1e293b] text-slate-200 font-sans overflow-hidden select-none fixed inset-0">
      {/* Header - Fixed height */}
      <header className="px-6 pt-10 pb-4 flex items-center justify-between shrink-0">
        <div className="flex flex-col">
          <h1 className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">QUY ĐỔI RUB SANG VNĐ</h1>
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-mono border border-emerald-500/20 w-fit">
            <TrendingUp className="w-3 h-3" />
            <span>Tỷ giá: 348</span>
          </div>
        </div>
        <button 
          onClick={() => setShowHistory(true)}
          className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-full transition-all active:scale-90 border border-slate-700/50"
          id="history-toggle"
        >
          <History className="w-6 h-6 text-slate-400" />
        </button>
      </header>

      {/* Main Content Area - Scrollable but visually contained */}
      <main className="flex-1 flex flex-col p-6 pt-2 overflow-hidden justify-between">
        <div className="space-y-4 shrink-0 px-1">
          {/* RUB Display Card (Trigger for Keypad) */}
          <div 
            onClick={() => setIsKeypadOpen(true)}
            className={`p-5 rounded-[24px] border transition-all duration-300 relative group active:scale-[0.98] cursor-pointer
              ${isKeypadOpen ? 'bg-slate-800 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-slate-800/50 border-slate-700/50 shadow-inner'}`}
          >
            <div className="flex items-center justify-between mb-2 text-slate-500">
              <label className="text-[9px] uppercase font-bold tracking-widest leading-none">
                {isKeypadOpen ? 'ĐANG NHẬP SỐ TIỀN (₽)' : 'CHẠM ĐỂ NHẬP TIỀN (₽)'}
              </label>
              <Coins className={`w-3.5 h-3.5 transition-colors ${isKeypadOpen ? 'text-emerald-500' : 'opacity-30'}`} />
            </div>
            <div className="flex items-center justify-between min-h-[50px]">
              <div className="text-4xl font-bold tracking-tighter text-white font-mono break-all line-clamp-2 leading-none">
                {rubInput === '0' ? '0' : rubInput.replace(/\*/g, '×').replace(/\//g, '÷')}
              </div>
              <span className="text-xl font-medium text-slate-600 ml-2 select-none shrink-0">₽</span>
            </div>
            
            <AnimatePresence>
              {rubInput.match(/[+\-*/]/) && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 pt-2 border-t border-slate-700/50 text-xs font-mono text-slate-500 overflow-hidden"
                >
                  = <span className="text-emerald-400 font-bold">{new Intl.NumberFormat('vi-VN').format(rubValue)}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex justify-center -my-3 relative z-10">
            <div className={`p-2 rounded-full border shadow-xl transition-colors duration-300 bg-slate-900 ${isKeypadOpen ? 'border-emerald-500' : 'border-slate-700'}`}>
              <ArrowDown className={`w-4 h-4 transition-colors ${isKeypadOpen ? 'text-emerald-500' : 'text-slate-600'}`} />
            </div>
          </div>

          {/* VND Result Card */}
          <div 
            onClick={copyToClipboard}
            className="bg-slate-800 p-5 rounded-[24px] border border-emerald-500/30 shadow-[0_15px_40px_-20px_rgba(16,185,129,0.3)] relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer group"
          >
            <div className="flex justify-between items-center mb-1">
              <label className="text-emerald-500 text-[9px] uppercase font-bold tracking-widest block leading-none">VNĐ (Chạm để sao chép)</label>
              <AnimatePresence mode="wait">
                {copied ? (
                  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-1 text-emerald-400 text-[9px] font-bold">
                    <Check className="w-2.5 h-2.5" /> ĐÃ SAO CHÉP
                  </motion.div>
                ) : (
                  <Copy className="w-3 h-3 text-emerald-500/30 group-hover:text-emerald-500 transition-colors" />
                )}
              </AnimatePresence>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-4xl font-bold tracking-tight text-emerald-400 font-mono break-all leading-tight">
                <AnimatedNumber value={vndAmount} />
              </div>
              <span className="text-xl font-bold text-emerald-600 ml-2 shrink-0">₫</span>
            </div>
          </div>
        </div>

        {/* Dynamic Content: History Preview OR Keypad */}
        <div className="flex-1 flex flex-col justify-end overflow-hidden">
          <AnimatePresence mode="wait">
            {!isKeypadOpen ? (
              <motion.div 
                key="history-mini"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="mt-6 flex-1 overflow-hidden flex flex-col"
              >
                {history.length > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-3 px-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-none">Gần đây</span>
                      <button onClick={() => setShowHistory(true)} className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest leading-none">Xem tất cả</button>
                    </div>
                    <div className="space-y-2 overflow-y-auto no-scrollbar pb-4 pr-1">
                      {history.slice(0, 5).map(item => (
                        <div key={item.id} className="p-3 bg-slate-800/30 rounded-xl border border-slate-800 flex justify-between items-center transition-all hover:bg-slate-800/50">
                          <span className="text-xs font-mono text-slate-400">{new Intl.NumberFormat('vi-VN').format(item.rub)} ₽</span>
                          <span className="text-xs font-bold text-emerald-400 font-mono">{new Intl.NumberFormat('vi-VN').format(item.vnd)} ₫</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="keypad-panel"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="mt-2 pt-4 border-t border-slate-800/50 w-full"
              >
                <div className="w-10 h-1 bg-slate-700/30 rounded-full mx-auto mb-4" onClick={() => setIsKeypadOpen(false)}></div>
                <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto">
                  {[
                    ['7', '8', '9', '/'],
                    ['4', '5', '6', '*'],
                    ['1', '2', '3', '-'],
                    ['0', '.', 'C', '+'],
                  ].map((row, rIdx) => (
                    <div key={rIdx} className="contents">
                      {row.map(key => (
                        <button
                          key={key}
                          onClick={() => {
                            if ('vibrate' in navigator) navigator.vibrate(5);
                            setRubInput(prev => {
                              if (key === 'C') return '0';
                              if (prev === '0' && !isNaN(Number(key))) return key;
                              if (prev.length > 22) return prev;
                              return prev + key;
                            });
                          }}
                          className={`h-11 sm:h-12 flex items-center justify-center text-lg font-bold rounded-xl transition-all active:scale-90 border 
                            ${['/', '*', '-', '+'].includes(key) 
                              ? 'bg-slate-700/20 text-emerald-400 border-emerald-500/10' 
                              : key === 'C' 
                                ? 'bg-red-500/10 text-red-500/60 border-red-500/10'
                                : 'bg-slate-800/80 text-white border-slate-700/30'}`}
                        >
                          {key === '*' ? '×' : key === '/' ? '÷' : key}
                        </button>
                      ))}
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      if ('vibrate' in navigator) navigator.vibrate(5);
                      setRubInput(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
                    }}
                    className="h-11 sm:h-12 bg-slate-700/40 text-slate-400 rounded-xl border border-slate-700/50 flex items-center justify-center active:scale-95"
                  >
                    <Delete className="w-5 h-5" />
                  </button>
                  <button
                    onClick={addToHistory}
                    disabled={rubValue <= 0}
                    className="col-span-3 h-11 sm:h-12 bg-emerald-600 disabled:opacity-20 text-white font-black rounded-xl shadow-lg border border-emerald-400/20 active:scale-95 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    TIẾP TỤC - LƯU & ĐÓNG
                  </button>
                </div>
                {/* Safe area spacer for mobile browsers */}
                <div className="h-[env(safe-area-inset-bottom,20px)] mt-2"></div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* History Panel Overlay */}
      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-50 bg-[#0f172a]/98 backdrop-blur-xl flex flex-col h-svh"
          >
            <div className="flex items-center justify-between px-6 pt-14 pb-6 border-b border-slate-800 shrink-0">
              <h2 className="text-xl font-bold flex items-center gap-2 text-white">
                <History className="w-5 h-5 text-emerald-500" />
                LỊCH SỬ ĐỔI TIỀN
              </h2>
              <button 
                onClick={() => setShowHistory(false)}
                className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors border border-slate-700"
                id="close-history"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3 no-scrollbar">
              {history.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-40">
                  <History className="w-16 h-16 mb-4 stroke-[1px]" />
                  <p className="text-sm font-bold uppercase tracking-widest">Chưa có dữ liệu</p>
                </div>
              ) : (
                history.map((item) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={item.id}
                    className="p-4 bg-slate-800/40 rounded-2xl border border-slate-800 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-center transition-all">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">RUB</span>
                        <span className="text-lg font-bold text-slate-200">{new Intl.NumberFormat('vi-VN').format(item.rub)} ₽</span>
                      </div>
                      <ArrowDown className="w-4 h-4 text-emerald-500/30" />
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-emerald-500/50 font-bold uppercase tracking-wider mb-0.5">VND</span>
                        <span className="text-lg font-bold text-emerald-400">{new Intl.NumberFormat('vi-VN').format(item.vnd)} ₫</span>
                      </div>
                    </div>
                    <div className="text-[9px] text-slate-600 font-mono text-right uppercase tracking-tighter">
                      {new Date(item.timestamp).toLocaleString('vi-VN')}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {history.length > 0 && (
              <div className="p-6 pb-12 border-t border-slate-800 shrink-0">
                <button 
                  onClick={clearHistory}
                  className="w-full py-4 bg-red-500/5 hover:bg-red-500/10 text-red-500/70 text-xs font-bold uppercase tracking-widest rounded-2xl transition-all border border-red-500/10 active:scale-95"
                  id="clear-history"
                >
                  Xóa tất cả lịch sử
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
