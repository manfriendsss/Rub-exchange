import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, animate } from 'motion/react';
import { X, ArrowDown, Coins, TrendingUp, Check, Copy, Delete, Settings2, ChevronRight, ChevronLeft, DollarSign, Calculator, Smartphone, RefreshCw } from 'lucide-react';

interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  defaultRate: number;
}

const CURRENCIES: Currency[] = [
  { code: 'VND', name: 'Việt Nam Đồng', symbol: '₫', flag: '🇻🇳', defaultRate: 1 },
  { code: 'CNY', name: 'Nhân dân tệ', symbol: '¥', flag: '🇨🇳', defaultRate: 3520 },
  { code: 'USD', name: 'Đô la Mỹ', symbol: '$', flag: '🇺🇸', defaultRate: 25450 },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', defaultRate: 27500 },
  { code: 'JPY', name: 'Yên Nhật', symbol: '¥', flag: '🇯🇵', defaultRate: 164 },
  { code: 'KRW', name: 'Won Hàn', symbol: '₩', flag: '🇰🇷', defaultRate: 18 },
  { code: 'RUB', name: 'Rúp Nga', symbol: '₽', flag: '🇷🇺', defaultRate: 275 },
  { code: 'THB', name: 'Bạt Thái', symbol: '฿', flag: '🇹🇭', defaultRate: 695 },
  { code: 'LAK', name: 'Kíp Lào', symbol: '₭', flag: '🇱🇦', defaultRate: 1.15 },
  { code: 'TWD', name: 'Đô Đài Loan', symbol: 'NT$', flag: '🇹🇼', defaultRate: 785 },
  { code: 'SGD', name: 'Đô Singapore', symbol: 'S$', flag: '🇸🇬', defaultRate: 18850 },
  { code: 'GBP', name: 'Bảng Anh', symbol: '£', flag: '🇬🇧', defaultRate: 32400 },
  { code: 'AUD', name: 'Đô Úc', symbol: 'A$', flag: '🇦🇺', defaultRate: 16750 },
  { code: 'CAD', name: 'Đô Canada', symbol: 'C$', flag: '🇨🇦', defaultRate: 18550 },
  { code: 'HKD', name: 'Đô Hồng Kông', symbol: 'HK$', flag: '🇭🇰', defaultRate: 3260 },
  { code: 'MYR', name: 'Ringgit Mã', symbol: 'RM', flag: '🇲🇾', defaultRate: 5380 },
];

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
  const [inputValue, setInputValue] = useState<string>('0');
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(CURRENCIES[1]); // Default to CNY
  const [targetCurrency, setTargetCurrency] = useState<Currency>(CURRENCIES[0]); // Default to VND
  const [isReverse, setIsReverse] = useState(false);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [isAutoRate, setIsAutoRate] = useState<boolean>(true);
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

  const tutorialPages = [
    {
      title: "Chào mừng bạn!",
      desc: "Ứng dụng giúp bạn quy đổi tiền tệ nhanh chóng với tỷ giá cập nhật trực tuyến.",
      icon: <Coins className="w-12 h-12 text-emerald-500" />,
    },
    {
      title: "Chọn loại tiền tệ",
      desc: "Vuốt ngang hoặc chạm vào giữa để chọn tiền gốc. Chạm vào nút góc phải trên để chọn tiền muốn đổi sang.",
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
      icon: <Smartphone className="w-12 h-12 text-emerald-500" />,
    },
  ];

  // Initialize and load rates + last currency
  useEffect(() => {
    const tutorialSeen = localStorage.getItem('tutorial_seen_v2');
    if (!tutorialSeen) {
      setShowTutorial(true);
    }

    const savedAutoPreference = localStorage.getItem('is_auto_rate');
    const autoMode = savedAutoPreference === null ? true : savedAutoPreference === 'true';
    setIsAutoRate(autoMode);
    
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
    
    // Auto update from online source if possible
    const updateRates = async () => {
      // If manual mode is on, don't auto-update from network (user wants to keep their saved manual rate)
      const savedAutoPreference = localStorage.getItem('is_auto_rate');
      if (savedAutoPreference === 'false' && !isRefreshing) return;

      if (isRefreshing) setIsRefreshing(true);

      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        const usdToVnd = data.rates.VND;
        
        if (usdToVnd) {
          const newRates: Record<string, number> = {};
          CURRENCIES.forEach(c => {
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
        // On error (offline), keep existing rates already loaded from localStorage
      } finally {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    };

    updateRates();
  }, [isRefreshing]);

  // Save rates whenever they change manually
  useEffect(() => {
    if (Object.keys(rates).length > 0) {
      localStorage.setItem('currency_rates_v3', JSON.stringify(rates));
    }
  }, [rates]);

  // Save currency selection
  useEffect(() => {
    localStorage.setItem('last_selected_currency', selectedCurrency.code);
  }, [selectedCurrency]);

  useEffect(() => {
    localStorage.setItem('last_target_currency', targetCurrency.code);
  }, [targetCurrency]);

  // PWA Install Logic
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Effect to trigger PWA popup after tutorial
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

  const handleRateUpdate = () => {
    const newRate = parseFloat(tempRate);
    if (!isNaN(newRate) && newRate > 0) {
      setRates(prev => ({ ...prev, [selectedCurrency.code]: newRate }));
      setIsAutoRate(false);
      localStorage.setItem('is_auto_rate', 'false');
      setIsEditingRate(false);
    }
  };

  const setAutoMode = async () => {
    setIsAutoRate(true);
    localStorage.setItem('is_auto_rate', 'true');
    
    // Trigger immediate update when switching back to auto
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
          localStorage.setItem('currency_rates_v3', JSON.stringify(newRates));
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
       // Typically VND or similar whole currencies
       if (val > 100) return new Intl.NumberFormat('vi-VN').format(Math.round(val));
    }
    
    return new Intl.NumberFormat('vi-VN', { 
      style: 'decimal', 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 4 
    }).format(val);
  };

  // Helper to format numbers inside an expression (with thousand separators)
  const formatExpression = (val: string) => {
    if (!val) return '0';
    // Format numeric parts with dots for thousands (Vietnamese convention)
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
    
    // Only pull if at the top and pulling down
    if (diff > 0 && window.scrollY === 0) {
      // Resistance effect
      const dampedDiff = Math.pow(diff, 0.8);
      setPullY(dampedDiff);
      
      // Prevent default to disable browser pull-to-refresh if we're handling it
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
      className="flex flex-col h-svh w-full bg-[#0f172a] text-slate-200 font-sans overflow-hidden select-none fixed inset-0"
    >
      {/* Pull to refresh indicator */}
      <motion.div 
        style={{ height: pullY, opacity: pullY / 60 }}
        className="flex items-center justify-center overflow-hidden w-full bg-slate-900/50"
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
        <header className={`px-6 shrink-0 transition-all duration-500 overflow-hidden flex flex-col justify-end ${isKeypadOpen ? 'h-24 pb-5' : 'h-auto pt-10 pb-2'}`}>
          {isKeypadOpen ? (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700 shadow-sm backdrop-blur-md">
                <span className="text-sm leading-none">{isReverse ? targetCurrency.flag : selectedCurrency.flag}</span>
                <span className="text-[10px] font-black text-white">{isReverse ? targetCurrency.code : selectedCurrency.code}</span>
                <ChevronRight className="w-3 h-3 text-slate-600 mx-0.5" />
                <span className="text-sm leading-none">{isReverse ? selectedCurrency.flag : targetCurrency.flag}</span>
                <span className="text-[10px] font-black text-white">{isReverse ? selectedCurrency.code : targetCurrency.code}</span>
              </div>
              
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/10 backdrop-blur-md">
                <TrendingUp className="w-3 h-3 text-emerald-500/50" />
                <span className="text-[10px] font-mono font-bold text-emerald-400">
                  {new Intl.NumberFormat('vi-VN').format(currentRate)} đ
                </span>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <h1 className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-1">ĐỔI TIỀN</h1>
                  <div 
                    onClick={() => {
                      setTempRate(currentRate.toString());
                      setIsEditingRate(true);
                    }}
                    className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg text-[10px] font-mono border w-fit active:scale-95 transition-all cursor-pointer ${isAutoRate ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}
                  >
                    <TrendingUp className="w-3 h-3" />
                    <span>Tỷ giá: {new Intl.NumberFormat('vi-VN').format(currentRate)} đ {!isAutoRate && '(Tùy chỉnh)'}</span>
                    <Settings2 className="w-3 h-3 opacity-50 ml-1" />
                  </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setPickerType('target');
                    setIsPickerOpen(true);
                  }}
                  className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700 shadow-lg active:scale-90 transition-transform overflow-hidden"
                >
                    <span className="text-xl">{targetCurrency.flag}</span>
                </button>
              </div>
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <div className={`flex-1 flex flex-col px-4 pt-1 overflow-hidden transition-all duration-500 ${isKeypadOpen ? 'justify-start pb-[327px]' : 'justify-start pb-6'}`}>
          <div className={`${isKeypadOpen ? 'space-y-0 translate-y-2' : 'space-y-6'} shrink-0 px-1 transition-all duration-500`}>
            {/* Currency Selector Slider - Animated Dial */}
            <div className={`flex items-center justify-between gap-1 overflow-hidden relative transition-all duration-500 ${isKeypadOpen ? 'opacity-0 h-0 mb-0 pointer-events-none' : 'opacity-100 h-24 mt-4 py-4 mb-4'}`}>
              <button 
                onClick={() => cycleCurrency('prev')} 
                disabled={isKeypadOpen}
                className="p-2 bg-slate-800/30 rounded-full active:scale-90 border border-slate-700/30 text-slate-500 z-10"
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
                    <div className="text-xs font-black text-slate-500 uppercase tracking-widest">{selectedCurrency.name}</div>
                    <div className="text-emerald-400 font-mono font-black text-xl leading-none">{selectedCurrency.code}</div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <button 
                onClick={() => cycleCurrency('next')} 
                disabled={isKeypadOpen}
                className="p-2 bg-slate-800/30 rounded-full active:scale-90 border border-slate-700/30 text-slate-500 z-10"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Amount Display */}
            <div 
              onClick={() => setIsKeypadOpen(true)}
              className={`rounded-[24px] border transition-all duration-300 relative z-[5] group active:scale-[0.98] cursor-pointer
                ${isKeypadOpen ? 'bg-slate-800 border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)] p-3 px-5' : 'bg-slate-800/40 border-slate-800 shadow-inner p-4 px-5'}`}
            >
              <div className="flex items-center justify-between mb-1 text-slate-500">
                <label className="text-[10px] uppercase font-bold tracking-widest leading-none">
                  {isKeypadOpen ? 'ĐANG NHẬP SỐ TIỀN' : 'CHẠM ĐỂ NHẬP'} ({isReverse ? targetCurrency.code : selectedCurrency.code})
                </label>
                <Coins className={`w-4 h-4 transition-colors ${isKeypadOpen ? 'text-emerald-500' : 'opacity-20'}`} />
              </div>
              <div className="flex items-center justify-between min-h-[44px]">
                <div className="text-3xl font-bold tracking-tighter text-white font-mono break-all line-clamp-1 leading-none">
                  {inputValue === '0' ? '0' : formatExpression(inputValue)}
                </div>
                <span className="text-xl font-medium text-slate-600 ml-2 select-none shrink-0">{isReverse ? targetCurrency.symbol : selectedCurrency.symbol}</span>
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

            <div className="flex justify-center -my-3.5 relative z-10 transition-all duration-500">
              <button 
                onClick={toggleReverse}
                className={`p-2 rounded-full border shadow-xl transition-all duration-300 active:scale-90 bg-slate-900 group ${isReverse ? 'border-emerald-500' : 'border-slate-800'}`}
              >
                <motion.div
                  animate={{ rotate: rotation }}
                  transition={{ 
                    duration: 0.6, 
                    ease: [0.16, 1, 0.3, 1] 
                  }}
                  className="flex items-center justify-center text-slate-400 group-hover:text-emerald-500"
                >
                  <RefreshCw className={`w-4 h-4 ${isReverse ? 'text-emerald-500' : ''}`} />
                </motion.div>
              </button>
            </div>

            {/* Result Card */}
            <div 
              onClick={copyToClipboard}
              className={`bg-slate-900 rounded-[24px] border border-emerald-500/30 shadow-[0_20px_50px_-20px_rgba(16,185,129,0.3)] relative z-[5] overflow-hidden active:scale-[0.98] transition-all cursor-pointer group
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
                      className="text-emerald-400 flex items-center justify-center"
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
                      <Copy className="w-3.5 h-3.5 text-emerald-500/20 group-hover:text-emerald-500 transition-colors" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="flex items-center justify-between min-h-[44px]">
                <div className="text-3xl font-bold tracking-tight text-white font-mono break-all leading-none truncate">
                  {isReverse ? formatResult(convertedAmount) : <AnimatedNumber value={convertedAmount} />}
                </div>
                <span className="text-xl font-bold text-emerald-500 ml-2 shrink-0">{isReverse ? selectedCurrency.symbol : targetCurrency.symbol}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Keypad Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-[50]">
        <AnimatePresence>
          {isKeypadOpen && (
            <motion.div 
              key="keypad-panel"
              initial={{ opacity: 0, y: 300 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="w-full bg-[#0f172a] px-4 pb-8 pt-2 border-t border-slate-800 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="w-12 h-1 bg-slate-800/50 rounded-full mx-auto mb-4" onClick={() => setIsKeypadOpen(false)}></div>
              <div className="grid grid-cols-4 gap-2 max-w-sm mx-auto overflow-hidden">
                {[
                  ['7', '8', '9', '/'],
                  ['4', '5', '6', '*'],
                  ['1', '2', '3', '-'],
                  ['.', '0', '000', '+'],
                ].map((row, rIdx) => (
                  <div key={rIdx} className="contents">
                    {row.map(key => (
                      <button
                        key={key}
                        onClick={() => {
                          if ('vibrate' in navigator) navigator.vibrate(5);
                          setInputValue(prev => {
                            if (prev === '0' && key === '000') return '0';
                            if (prev === '0' && !isNaN(Number(key))) return key;
                            if (prev.length > 22) return prev;
                            return prev + key;
                          });
                        }}
                        className={`h-11 sm:h-12 flex items-center justify-center text-xl font-bold rounded-2xl transition-all active:scale-95 border 
                          ${['/', '*', '-', '+'].includes(key) 
                            ? 'bg-slate-800 text-emerald-400 border-emerald-500/10' 
                            : 'bg-slate-800/50 text-white border-slate-800'}`}
                      >
                        {key === '*' ? '×' : key === '/' ? '÷' : key}
                      </button>
                    ))}
                  </div>
                ))}
                <div className="grid grid-cols-4 gap-2 col-span-4">
                  <button
                    onClick={() => {
                      if ('vibrate' in navigator) navigator.vibrate(5);
                      setInputValue(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
                    }}
                    className="h-11 sm:h-12 bg-slate-800/40 text-slate-500 border border-slate-800 rounded-2xl flex items-center justify-center font-bold active:scale-95 transition-all"
                  >
                    <Delete className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      if ('vibrate' in navigator) navigator.vibrate(5);
                      setInputValue('0');
                    }}
                    className="h-11 sm:h-12 bg-red-500/5 text-red-400/80 border border-red-500/10 rounded-2xl flex items-center justify-center font-bold active:scale-95 transition-all"
                  >
                    C
                  </button>
                  <button
                    onClick={() => setIsKeypadOpen(false)}
                    className="col-span-2 h-11 sm:h-12 bg-emerald-600 text-white font-black rounded-2xl border border-emerald-400/20 active:scale-95 transition-all text-sm uppercase tracking-[0.2em] flex items-center justify-center"
                  >
                    XONG
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Currency Picker Modal */}
      <AnimatePresence>
        {isPickerOpen && (
          <div className="fixed inset-0 z-[120] flex flex-col pt-12">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsPickerOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md" 
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative flex-1 bg-[#1e293b] rounded-t-[40px] border-t border-slate-800 flex flex-col overflow-hidden max-h-[85vh] mt-auto"
            >
              <div className="px-8 pt-8 pb-4 flex items-center justify-between">
                <h3 className="text-xl font-black text-white">{pickerType === 'source' ? 'CHỌN TIỀN GỐC' : 'CHỌN TIỀN ĐẾN'}</h3>
                <button onClick={() => setIsPickerOpen(false)} className="p-2 bg-slate-800 rounded-full">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="px-6 pb-12 overflow-y-auto no-scrollbar grid grid-cols-2 gap-3">
                {CURRENCIES.map(curr => {
                  const isSelected = pickerType === 'source' ? selectedCurrency.code === curr.code : targetCurrency.code === curr.code;
                  return (
                    <button
                      key={curr.code}
                      onClick={() => {
                        if (pickerType === 'source') setSelectedCurrency(curr);
                        else setTargetCurrency(curr);
                        setIsPickerOpen(false);
                        if ('vibrate' in navigator) navigator.vibrate(5);
                      }}
                      className={`p-4 rounded-3xl border flex flex-col items-center gap-2 transition-all active:scale-95
                        ${isSelected
                          ? 'bg-emerald-500/10 border-emerald-500' 
                          : 'bg-slate-800/50 border-slate-700/50'}`}
                    >
                      <span className="text-3xl">{curr.flag}</span>
                      <div className="text-center">
                        <div className="text-sm font-bold text-white leading-none mb-1">{curr.code}</div>
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

      {/* Rate Editing Popup */}
      <AnimatePresence>
        {isEditingRate && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-6">
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
              className="relative w-full max-w-sm bg-slate-900 border border-slate-800 p-6 rounded-[32px] shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-2">Chỉnh sửa tỷ giá</h3>
              <p className="text-xs text-slate-500 mb-6 uppercase tracking-wider">Tỷ giá cho 1 {selectedCurrency.code} sang VNĐ</p>
              
              <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 mb-6">
                <input 
                  type="number"
                  inputMode="decimal"
                  value={tempRate}
                  onChange={(e) => setTempRate(e.target.value)}
                  autoFocus
                  className="w-full bg-transparent text-3xl font-mono font-bold text-emerald-400 outline-none"
                  placeholder="0"
                />
                <div className="text-[10px] text-slate-500 mt-1 font-bold">VNĐ / {selectedCurrency.code}</div>
              </div>

              <div className="flex flex-col gap-3">
                {!isAutoRate && (
                  <button 
                    onClick={setAutoMode}
                    className="w-full py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-2xl text-[10px] font-bold uppercase tracking-[0.2em] mb-1 active:scale-95 transition-all"
                  >
                    DÙNG TỶ GIÁ TỰ ĐỘNG
                  </button>
                )}
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setIsEditingRate(false)}
                    className="flex-1 py-4 bg-slate-800 text-slate-400 font-bold rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all"
                  >
                    HỦY
                  </button>
                  <button 
                    onClick={handleRateUpdate}
                    className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all shadow-lg shadow-emerald-900/20"
                  >
                    LƯU THỦ CÔNG
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
            className="fixed bottom-6 left-6 right-6 z-[100] bg-slate-900 border border-emerald-500/10 p-5 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Coins className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Cài đặt ứng dụng</h3>
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
              className="relative w-full max-w-sm bg-slate-900 border border-slate-800 p-8 rounded-[40px] shadow-2xl flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                {tutorialPages[tutorialStep].icon}
              </div>
              
              <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight">
                {tutorialPages[tutorialStep].title}
              </h3>
              
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                {tutorialPages[tutorialStep].desc}
              </p>

              <div className="flex gap-2 mb-8">
                {tutorialPages.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-1 rounded-full transition-all duration-300 ${idx === tutorialStep ? 'w-8 bg-emerald-500' : 'w-2 bg-slate-800'}`} 
                  />
                ))}
              </div>

              <div className="w-full flex gap-3">
                {tutorialStep > 0 && (
                  <button 
                    onClick={() => setTutorialStep(prev => prev - 1)}
                    className="flex-1 py-4 bg-slate-800 text-slate-400 font-bold rounded-2xl text-xs uppercase tracking-widest active:scale-95 transition-all"
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
