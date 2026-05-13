import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, animate } from 'motion/react';
import { X, ArrowDown, Coins, TrendingUp, Check, Copy, Settings2, ChevronRight, ChevronLeft, DollarSign, Calculator, Smartphone, RefreshCw, Sun, Moon } from 'lucide-react';

import { Currency } from './types';
import { CURRENCIES } from './constants';
import { AutoScaleText } from './components/AutoScaleText';
import { Keypad } from './components/Keypad';
import { CurrencyPicker } from './components/CurrencyPicker';

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

function AppLogo({ className = "w-12 h-12", iconSize = "w-full h-full" }: { className?: string, iconSize?: string }) {
  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-full aspect-square shrink-0 ${className}`}>
      <img 
        src="/app_icon.webp" 
        alt="App Logo" 
        className={`${iconSize} object-cover shadow-lg`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

export default function App() {
  const [inputValue, setInputValue] = useState<string>('0');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(CURRENCIES[1]);
  const [targetCurrency, setTargetCurrency] = useState<Currency>(CURRENCIES[0]);
  const [isReverse, setIsReverse] = useState(false);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [manualRates, setManualRates] = useState<Record<string, boolean>>({});
  const [isKeypadOpen, setIsKeypadOpen] = useState(false);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerType, setPickerType] = useState<'source' | 'target'>('source');
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);
  const [tempRate, setTempRate] = useState('');
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallPopup, setShowInstallPopup] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [pullY, setPullY] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const tutorialPages = [
    {
      title: "Chào mừng bạn!",
      desc: "Ứng dụng giúp bạn quy đổi tiền tệ nhanh chóng với tỷ giá cập nhật trực tuyến.",
      icon: <AppLogo className="w-16 h-16" iconSize="w-16 h-16" />,
    },
    {
      title: "Chọn loại tiền tệ",
      desc: "Vuốt ngang hoặc chạm vào giữa để chọn tiền tệ nguồn. Chạm vào nút góc phải trên để chọn tiền tệ đích.",
      icon: <DollarSign className="w-12 h-12 text-emerald-500" />,
    },
    {
      title: "Tỷ giá linh hoạt",
      desc: "Tỷ giá được cập nhật tự động. Bạn cũng có thể chạm vào ô tỷ giá để tự nhập theo ý muốn.",
      icon: <TrendingUp className="w-12 h-12 text-emerald-500" />,
    },
    {
      title: "Bàn phím tính toán",
      desc: "Chạm vào số tiền để mở bàn phím. Bạn có thể cộng, trừ, nhân, chia trực tiếp khi nhập.",
      icon: <Calculator className="w-12 h-12 text-emerald-500" />,
    },
    {
      title: "Đổi chiều quy đổi",
      desc: "Chạm vào nút mũi tên ở giữa để đổi ngược lại (ví dụ từ VNĐ sang USD).",
      icon: <ArrowDown className="w-12 h-12 text-emerald-500 rotate-180" />,
    },
    {
      title: "Cài đặt ứng dụng",
      desc: "Sử dụng nút cài đặt hoặc trình duyệt để thêm ứng dụng vào màn hình chính để dùng mượt mà nhất.",
      icon: <AppLogo className="w-20 h-20" iconSize="w-20 h-20" />,
    },
  ];

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme_preference') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }

    // Hide splash screen
    setTimeout(() => {
      document.body.classList.add('app-loaded');
    }, 500);

    const tutorialSeen = localStorage.getItem('tutorial_seen_v2');
    if (!tutorialSeen) {
      setShowTutorial(true);
    }

    const savedManualRates = localStorage.getItem('manual_rates_v1');
    if (savedManualRates) {
      setManualRates(JSON.parse(savedManualRates));
    }
    
    const savedRates = localStorage.getItem('currency_rates_v3');
    if (savedRates) {
      setRates(JSON.parse(savedRates));
    } else {
      const initialRates: Record<string, number> = {};
      CURRENCIES.forEach(c => initialRates[c.code] = c.defaultRate);
      setRates(initialRates);
    }

    const lastCurrency = localStorage.getItem('last_selected_currency');
    if (lastCurrency) {
      const found = CURRENCIES.find(c => c.code === lastCurrency);
      if (found) setSelectedCurrency(found);
    }
    
    const lastTargetCurrency = localStorage.getItem('last_target_currency');
    if (lastTargetCurrency) {
      const found = CURRENCIES.find(c => c.code === lastTargetCurrency);
      if (found) setTargetCurrency(found);
    }
    
    const updateRates = async () => {
      if (isRefreshing) setIsRefreshing(true);

      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        const usdToVnd = data.rates.VND;
        
        if (usdToVnd) {
          const newRates: Record<string, number> = {};
          const currentManualRates = JSON.parse(localStorage.getItem('manual_rates_v1') || '{}');
          
          CURRENCIES.forEach(c => {
            if (currentManualRates[c.code] && !isRefreshing) {
              newRates[c.code] = rates[c.code] || savedRates ? JSON.parse(savedRates!)[c.code] || c.defaultRate : c.defaultRate;
              return;
            }

            if (c.code === 'VND') {
              newRates[c.code] = 1;
            } else if (c.code === 'USD') {
              newRates[c.code] = Math.round(usdToVnd);
            } else {
              const usdToTarget = data.rates[c.code];
              if (usdToTarget) {
                newRates[c.code] = Math.round(usdToVnd / usdToTarget);
              } else {
                newRates[c.code] = savedRates ? JSON.parse(savedRates)[c.code] || c.defaultRate : c.defaultRate;
              }
            }
          });
          setRates(newRates);
          localStorage.setItem('currency_rates_v3', JSON.stringify(newRates));
        }
      } catch (error) {
        console.error('Failed to fetch online rates', error);
      } finally {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    };

    updateRates();
  }, [isRefreshing]);

  useEffect(() => {
    if (Object.keys(rates).length > 0) {
      localStorage.setItem('currency_rates_v3', JSON.stringify(rates));
    }
  }, [rates]);

  useEffect(() => {
    localStorage.setItem('last_selected_currency', selectedCurrency.code);
  }, [selectedCurrency]);

  useEffect(() => {
    localStorage.setItem('last_target_currency', targetCurrency.code);
  }, [targetCurrency]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  useEffect(() => {
    if (!showTutorial && deferredPrompt) {
      const dismissed = localStorage.getItem('pwa_install_dismissed');
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      if (!dismissed && !isStandalone) {
        const timer = setTimeout(() => setShowInstallPopup(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [showTutorial, deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallPopup(false);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme_preference', newTheme);
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  const currentRate = rates[selectedCurrency.code] || selectedCurrency.defaultRate;
  const targetRate = rates[targetCurrency.code] || targetCurrency.defaultRate;

  const parsedValue = useMemo(() => {
    try {
      const cleanedInput = inputValue.replace(/[^0-9+\-*/.]/g, '');
      if (!cleanedInput) return 0;
      const result = Function(`"use strict"; return (${cleanedInput})`)();
      return typeof result === 'number' && !isNaN(result) ? result : 0;
    } catch {
      return parseFloat(inputValue) || 0;
    }
  }, [inputValue]);

  const convertedAmount = useMemo(() => {
    if (isReverse) {
      return (parsedValue * targetRate) / currentRate;
    }
    return (parsedValue * currentRate) / targetRate;
  }, [parsedValue, currentRate, targetRate, isReverse]);

  const copyToClipboard = async () => {
    try {
      const isWhole = convertedAmount === Math.round(convertedAmount);
      const valueToCopy = isWhole ? convertedAmount.toString() : convertedAmount.toFixed(2);
      await navigator.clipboard.writeText(valueToCopy);
      setCopied(true);
      if ('vibrate' in navigator) navigator.vibrate([10, 30, 10]);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const isAutoRate = !manualRates[selectedCurrency.code];

  const handleRateUpdate = () => {
    const newRate = parseFloat(tempRate);
    if (!isNaN(newRate) && newRate > 0) {
      setRates(prev => ({ ...prev, [selectedCurrency.code]: newRate }));
      const newManualRates = { ...manualRates, [selectedCurrency.code]: true };
      setManualRates(newManualRates);
      localStorage.setItem('manual_rates_v1', JSON.stringify(newManualRates));
      setIsEditingRate(false);
    }
  };

  const setAutoMode = async () => {
    const newManualRates = { ...manualRates, [selectedCurrency.code]: false };
    setManualRates(newManualRates);
    localStorage.setItem('manual_rates_v1', JSON.stringify(newManualRates));
    
    try {
      const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      const data = await response.json();
      const usdToVnd = data.rates.VND;
      if (usdToVnd) {
        const newRates: Record<string, number> = { ...rates };
        const usdToTarget = data.rates[selectedCurrency.code];
        if (usdToTarget) {
          newRates[selectedCurrency.code] = Math.round(usdToVnd / usdToTarget);
          setRates(newRates);
        }
      }
      setIsEditingRate(false);
    } catch (error) {
      console.error('Failed to update rate automatically', error);
      setIsEditingRate(false);
    }
  };

  const toggleReverse = () => {
    setRotation(prev => prev + 360);
    setIsReverse(!isReverse);
    setInputValue('0');
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  const cycleCurrency = (direction: 'next' | 'prev') => {
    const currentIndex = CURRENCIES.findIndex(c => c.code === selectedCurrency.code);
    let nextIndex;
    if (direction === 'next') {
      nextIndex = (currentIndex + 1) % CURRENCIES.length;
    } else {
      nextIndex = (currentIndex - 1 + CURRENCIES.length) % CURRENCIES.length;
    }
    setSelectedCurrency(CURRENCIES[nextIndex]);
    if ('vibrate' in navigator) navigator.vibrate(5);
  };

  const formatResult = (val: number) => {
    const isTargetWhole = targetCurrency.code === 'VND';
    const isReverseAndSourceWhole = isReverse && selectedCurrency.code === 'VND';

    if (isTargetWhole || isReverseAndSourceWhole) {
       if (val > 100) return new Intl.NumberFormat('vi-VN').format(Math.round(val));
    }
    
    return new Intl.NumberFormat('vi-VN', { 
      style: 'decimal', 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 4 
    }).format(val);
  };

  const formatExpression = (val: string) => {
    if (!val) return '0';
    return val.replace(/(\d+)(\.\d+)?/g, (match, integerPart, decimalPart) => {
      const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      return decimalPart ? formattedInteger + decimalPart : formattedInteger;
    }).replace(/\*/g, '×').replace(/\//g, '÷');
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isKeypadOpen || isPickerOpen || isEditingRate || showTutorial) return;
    setStartY(e.touches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isKeypadOpen || isPickerOpen || isEditingRate || showTutorial) return;
    
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    
    if (diff > 0 && window.scrollY === 0) {
      const dampedDiff = Math.pow(diff, 0.8);
      setPullY(dampedDiff);
      
      if (diff > 10) {
        if (e.cancelable) e.preventDefault();
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullY > 60) {
      setIsRefreshing(true);
      if ('vibrate' in navigator) navigator.vibrate(20);
    }
    setPullY(0);
  };

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`flex flex-col h-svh w-full font-sans overflow-hidden select-none fixed inset-0 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0f172a] text-slate-200' : 'bg-slate-100 text-slate-800'}`}
    >
      {/* Pull to refresh indicator */}
      <motion.div 
        style={{ height: pullY, opacity: pullY / 60 }}
        className={`flex items-center justify-center overflow-hidden w-full ${theme === 'dark' ? 'bg-slate-900/50' : 'bg-slate-200/50'}`}
      >
        <div className={`transition-transform duration-200 ${pullY > 60 ? 'rotate-180 scale-110' : 'rotate-0 scale-100'}`}>
          <ArrowDown className={`w-6 h-6 ${pullY > 60 ? 'text-emerald-400' : 'text-slate-600'}`} />
        </div>
      </motion.div>

      {/* Refreshing Overlay */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[300] bg-emerald-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold"
          >
            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ĐANG CẬP NHẬT TỶ GIÁ...
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        animate={{ y: isKeypadOpen ? 0 : 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="flex flex-col flex-1 relative z-0"
      >
        {/* Header */}
        <header className={`px-6 shrink-0 transition-all duration-500 flex flex-col justify-end overflow-visible ${isKeypadOpen ? 'h-20 pb-4' : 'h-auto pt-10 pb-2'}`}>
          {isKeypadOpen ? (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between w-full"
            >
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border shadow-sm backdrop-blur-md ${theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50/80 border-slate-200 shadow-sm'}`}>
                <span className="text-sm leading-none">{isReverse ? targetCurrency.flag : selectedCurrency.flag}</span>
                <span className={`text-[10px] font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{isReverse ? targetCurrency.code : selectedCurrency.code}</span>
                <ChevronRight className="w-3 h-3 text-slate-400 mx-0.5" />
                <span className="text-sm leading-none">{isReverse ? selectedCurrency.flag : targetCurrency.flag}</span>
                <span className={`text-[10px] font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{isReverse ? selectedCurrency.code : targetCurrency.code}</span>
              </div>
              
                <div 
                  onClick={() => {
                    setTempRate(currentRate.toString());
                    setIsEditingRate(true);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full border backdrop-blur-md cursor-pointer active:scale-95 transition-all
                    ${isAutoRate 
                      ? 'bg-emerald-500/5 border-emerald-500/10' 
                      : (theme === 'dark' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-100 border-amber-500/40')
                    }`}
                >
                  <TrendingUp className={`w-3 h-3 ${isAutoRate ? 'text-emerald-500/50' : (theme === 'dark' ? 'text-amber-500/50' : 'text-amber-600')}`} />
                  <span className={`text-[10px] font-mono font-bold ${isAutoRate ? 'text-emerald-400' : (theme === 'dark' ? 'text-amber-400' : 'text-amber-700')}`}>
                    {new Intl.NumberFormat('vi-VN').format(currentRate)} đ
                  </span>
                </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <h1 className={`${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'} text-[10px] font-bold uppercase tracking-[0.2em] mb-1`}>ĐỔI TIỀN</h1>
                  <div 
                    onClick={() => {
                      setTempRate(currentRate.toString());
                      setIsEditingRate(true);
                    }}
                    className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg text-[10px] font-mono border w-fit active:scale-95 transition-all cursor-pointer 
                      ${isAutoRate 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : (theme === 'dark' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-amber-100 text-amber-700 border-amber-500/40')
                      }`}
                  >
                    <TrendingUp className="w-3 h-3" />
                    <span>Tỷ giá: {new Intl.NumberFormat('vi-VN').format(currentRate)} đ</span>
                    <Settings2 className="w-3 h-3 opacity-50 ml-1" />
                  </div>
              </div>
              <div className="flex gap-2 items-center">
                <button 
                  onClick={toggleTheme}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-lg active:scale-90 transition-all duration-300 ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-amber-400' : 'bg-slate-50 border-slate-200 text-indigo-600'}`}
                >
                    {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button 
                  onClick={() => {
                    setPickerType('target');
                    setIsPickerOpen(true);
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border shadow-lg active:scale-90 transition-transform overflow-hidden ${theme === 'dark' ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                >
                    <span className="text-xl">{targetCurrency.flag}</span>
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col px-6 transition-all duration-500 ${isKeypadOpen ? 'justify-center pt-2 pb-[310px]' : 'justify-start pt-4 pb-6 mx-auto w-full max-w-lg'}`}>
          <div className={`flex flex-col ${isKeypadOpen ? 'gap-3' : 'gap-6'} shrink-0 px-1 transition-all duration-500 relative`}>
            {/* Currency Selector Slider - Animated Dial */}
            <div className={`flex items-center justify-between gap-1 overflow-hidden relative transition-all duration-500 ${isKeypadOpen ? 'opacity-0 h-0 mb-0 pointer-events-none' : 'opacity-100 h-24 mt-4 py-4 mb-4'}`}>
              <button 
                onClick={() => cycleCurrency('prev')} 
                disabled={isKeypadOpen}
                className={`p-2 rounded-full active:scale-90 border z-10 ${theme === 'dark' ? 'bg-slate-800/30 border-slate-700/30 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div 
                onClick={() => {
                  if (isKeypadOpen) return;
                  setPickerType('source');
                  setIsPickerOpen(true);
                }}
                className="flex-1 relative h-16 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedCurrency.code}
                    initial={{ x: 20, opacity: 0, rotateY: 45 }}
                    animate={{ x: 0, opacity: 1, rotateY: 0 }}
                    exit={{ x: -20, opacity: 0, rotateY: -45 }}
                    transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                    className="flex flex-col items-center"
                  >
                    <div className="text-[28px] leading-none mb-1">{selectedCurrency.flag}</div>
                    <div className={`text-xs font-black uppercase tracking-widest ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{selectedCurrency.name}</div>
                    <div className="text-emerald-500 font-mono font-black text-xl leading-none">{selectedCurrency.code}</div>
                  </motion.div>
                </AnimatePresence>
              </div>

               <button 
                onClick={() => cycleCurrency('next')} 
                disabled={isKeypadOpen}
                className={`p-2 rounded-full active:scale-90 border z-10 ${theme === 'dark' ? 'bg-slate-800/30 border-slate-700/30 text-slate-500' : 'bg-slate-50 border-slate-200 text-slate-400'}`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Amount Display */}
            <div 
              onClick={() => setIsKeypadOpen(true)}
              className={`rounded-[24px] border transition-all duration-300 relative z-[5] group active:scale-[0.98] cursor-pointer
                ${isKeypadOpen 
                  ? (theme === 'dark' ? 'bg-slate-800 border-emerald-500/50 shadow-[0_0_40px_rgba(16,185,129,0.1)]' : 'bg-slate-50 border-emerald-500 shadow-md') 
                  : (theme === 'dark' ? 'bg-slate-800/40 border-slate-800 shadow-inner' : 'bg-slate-200/50 border-slate-300 shadow-inner')
                } p-4 px-5`}
            >
              <div className={`flex items-center justify-between mb-1 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                <label className="text-[10px] uppercase font-bold tracking-widest leading-none">
                  {isKeypadOpen ? 'ĐANG NHẬP SỐ TIỀN' : 'CHẠM ĐỂ NHẬP'} ({isReverse ? targetCurrency.code : selectedCurrency.code})
                </label>
                <Coins className={`w-4 h-4 transition-colors ${isKeypadOpen ? 'text-emerald-500' : 'opacity-20'}`} />
              </div>
              <div className="flex items-center justify-between min-h-[44px]">
                <AutoScaleText className={`text-3xl font-bold tracking-tighter font-mono leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {inputValue === '0' ? '0' : formatExpression(inputValue)}
                </AutoScaleText>
                <span className={`text-xl font-medium ml-2 select-none shrink-0 ${theme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>{isReverse ? targetCurrency.symbol : selectedCurrency.symbol}</span>
              </div>
              
              <AnimatePresence>
                {inputValue.match(/[+\-*/]/) && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 pt-3 border-t border-slate-800/50 text-sm font-mono text-slate-500 overflow-hidden"
                  >
                    = <span className="text-emerald-400 font-bold">{new Intl.NumberFormat('vi-VN').format(parsedValue)}</span> {isReverse ? targetCurrency.code : selectedCurrency.code}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-center h-0 relative z-20">
              <button 
                onClick={toggleReverse}
                className={`absolute -translate-y-1/2 p-2 rounded-full border shadow-2xl transition-all duration-300 active:scale-90 group ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-slate-200'} ${isReverse ? 'border-emerald-500' : ''}`}
              >
                <motion.div
                  animate={{ rotate: rotation }}
                  transition={{ 
                    duration: 0.6, 
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                  className={`flex items-center justify-center ${isReverse ? 'text-emerald-500' : (theme === 'dark' ? 'text-slate-400' : 'text-slate-500')}`}
                >
                  <RefreshCw className="w-4 h-4" />
                </motion.div>
              </button>
            </div>

            {/* Result Card */}
            <div 
              onClick={copyToClipboard}
              className={`rounded-[24px] border relative z-[5] active:scale-[0.98] transition-all cursor-pointer group
                ${theme === 'dark' 
                  ? 'bg-slate-900 border-emerald-500/30 shadow-[0_15px_40px_-15px_rgba(16,185,129,0.25)]' 
                  : 'bg-slate-50 border-emerald-500 shadow-lg'
                }
                ${isKeypadOpen ? 'p-3 px-5' : 'p-4 px-5'}`}
            >
              <div className="flex justify-between items-center mb-1">
                <label className="text-emerald-500 text-[10px] uppercase font-bold tracking-widest block leading-none">
                  {isReverse ? selectedCurrency.name : targetCurrency.name} (Chạm sao chép)
                </label>
                <AnimatePresence mode="wait">
                  {copied ? (
                    <motion.div 
                      key="checkmark"
                      initial={{ opacity: 0, scale: 0.5, rotate: -20 }} 
                      animate={{ opacity: 1, scale: 1, rotate: 0 }} 
                      exit={{ opacity: 0, scale: 0.5 }} 
                      className="text-emerald-500 flex items-center justify-center"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="copy"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <Copy className={`w-3.5 h-3.5 transition-colors ${theme === 'dark' ? 'text-emerald-500/20 group-hover:text-emerald-500' : 'text-emerald-500/40 group-hover:text-emerald-600'}`} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center justify-between min-h-[44px]">
                <AutoScaleText className={`text-3xl font-bold tracking-tight font-mono leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {isReverse ? formatResult(convertedAmount) : <AnimatedNumber value={convertedAmount} />}
                </AutoScaleText>
                <span className="text-xl font-bold text-emerald-500 ml-2 shrink-0">{isReverse ? selectedCurrency.symbol : targetCurrency.symbol}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Keypad Panel */}
      <Keypad 
        isOpen={isKeypadOpen || isEditingRate} 
        onClose={() => {
          if (isEditingRate) {
            handleRateUpdate();
          } else {
            setIsKeypadOpen(false);
          }
        }} 
        setInputValue={isEditingRate ? setTempRate : setInputValue} 
        theme={theme} 
      />

      {/* Currency Picker Modal */}
      <CurrencyPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        pickerType={pickerType}
        theme={theme}
        selectedCurrency={selectedCurrency}
        targetCurrency={targetCurrency}
        onSelectSource={setSelectedCurrency}
        onSelectTarget={setTargetCurrency}
      />

      {/* Rate Editing Popup */}
      <AnimatePresence>
        {isEditingRate && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-6 pb-[320px]">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsEditingRate(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-sm border p-5 rounded-[28px] shadow-2xl transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
            >
              <h3 className={`text-base font-bold mb-1 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Chỉnh sửa tỷ giá</h3>
              <p className="text-[10px] text-slate-500 mb-4 uppercase tracking-wider">Tỷ giá cho 1 {selectedCurrency.code} sang VNĐ</p>
              
              <div className={`p-3 rounded-xl border mb-4 ${theme === 'dark' ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className={`text-2xl font-mono font-bold truncate ${theme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  {tempRate || '0'}
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5 font-bold">VNĐ / {selectedCurrency.code}</div>
              </div>

              <div className="flex flex-col gap-2">
                {!isAutoRate && (
                  <button 
                    onClick={setAutoMode}
                    className={`w-full py-2 rounded-xl text-[9px] font-bold uppercase tracking-[0.1em] active:scale-95 transition-all border
                      ${theme === 'dark' 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                  >
                    DÙNG TỶ GIÁ TỰ ĐỘNG
                  </button>
                )}
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditingRate(false)}
                    className={`flex-1 py-3 font-bold rounded-xl text-[10px] uppercase tracking-widest active:scale-95 transition-all ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-600'}`}
                  >
                    HỦY
                  </button>
                  <button 
                    onClick={handleRateUpdate}
                    className="flex-1 py-3 bg-emerald-600 text-white font-bold rounded-xl text-[10px] uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-emerald-900/20"
                  >
                    LƯU
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* PWA Install Popup */}
      <AnimatePresence>
        {showInstallPopup && (
          <motion.div 
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className={`fixed bottom-6 left-6 right-6 z-[100] border p-5 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col gap-4 transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-900 border-emerald-500/10' : 'bg-slate-50 border-emerald-200'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <AppLogo className="w-12 h-12" iconSize="w-12 h-12" />
                <div>
                  <h3 className={`font-bold text-sm ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Cài đặt ứng dụng</h3>
                  <p className="text-[10px] text-slate-400">Giao diện mượt mà nhất khi cài đặt. Lưu ý: Hãy mở link ở trình duyệt chính (Chrome/Safari) để có thể cài đặt.</p>
                </div>
              </div>
              <button onClick={() => { setShowInstallPopup(false); localStorage.setItem('pwa_install_dismissed', 'true'); }} className="p-1 text-slate-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <button onClick={handleInstallClick} className="w-full py-3 bg-emerald-600 text-white font-black rounded-xl text-xs uppercase tracking-widest active:scale-95 transition-all">
              CÀI ĐẶT NGAY
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial Overlay */}
      <AnimatePresence>
        {showTutorial && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`relative w-full max-w-sm border p-8 rounded-[40px] shadow-2xl flex flex-col items-center text-center transition-colors duration-500 ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'}`}
            >
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 border shadow-[0_0_40px_rgba(16,185,129,0.1)] ${theme === 'dark' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                {tutorialPages[tutorialStep].icon}
              </div>
              
              <h3 className={`text-xl font-black mb-4 uppercase tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                {tutorialPages[tutorialStep].title}
              </h3>
              
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                {tutorialPages[tutorialStep].desc}
              </p>

              <div className="flex gap-2 mb-8">
                {tutorialPages.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1 rounded-full transition-all duration-300 ${idx === tutorialStep ? 'w-8 bg-emerald-500' : (theme === 'dark' ? 'w-2 bg-slate-800' : 'w-2 bg-slate-200')}`} 
                  />
                ))}
              </div>

              <div className="w-full flex gap-3">
                {tutorialStep > 0 && (
                  <button 
                    onClick={() => setTutorialStep(prev => prev - 1)}
                    className={`flex-1 py-4 font-bold rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all ${theme === 'dark' ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}
                  >
                    QUAY LẠI
                  </button>
                )}
                <button 
                  onClick={() => {
                    if (tutorialStep < tutorialPages.length - 1) {
                      setTutorialStep(prev => prev + 1);
                    } else {
                      setShowTutorial(false);
                      localStorage.setItem('tutorial_seen_v2', 'true');
                    }
                  }}
                  className="flex-1 py-4 bg-emerald-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-emerald-900/20"
                >
                  {tutorialStep < tutorialPages.length - 1 ? 'TIẾP TỤC' : 'BẮT ĐẦU NGAY'}
                </button>
              </div>

              <button 
                onClick={() => {
                  setShowTutorial(false);
                  localStorage.setItem('tutorial_seen_v2', 'true');
                }}
                className="mt-6 text-[10px] text-slate-600 font-bold uppercase tracking-widest hover:text-slate-400 transition-colors"
              >
                BỎ QUA HƯỚNG DẪN
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
