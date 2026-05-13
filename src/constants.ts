import { Currency } from './types';

export const CURRENCIES: Currency[] = [
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
