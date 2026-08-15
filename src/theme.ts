export const colors = {
  // 背景与卡片
  bg: '#f8fafc',
  card: '#ffffff',

  // 文字
  text: '#1f2937',
  textStrong: '#111827',
  sub: '#6b7280',

  // 边框与分隔
  border: '#e5e7eb',
  divider: '#f3f4f6',

  // 主色调：靛蓝
  primary: '#4f46e5',
  primaryDark: '#4338ca',
  primaryLight: '#eef2ff',

  // 成功/正向：翠绿
  green: '#10b981',
  greenDark: '#059669',
  greenBg: '#ecfdf5',

  // 危险/负向：玫瑰红
  red: '#f43f5e',
  redDark: '#e11d48',
  redBg: '#fff1f2',

  // 警告/提醒：琥珀
  amber: '#f59e0b',
  amberDark: '#d97706',
  amberBg: '#fffbeb',

  // 紫色
  purple: '#8b5cf6',
  purpleDark: '#7c3aed',
  purpleBg: '#f5f3ff',

  // 深蓝（旧 navy 替换）
  navy: '#1e3a8a',
  navyBg: '#eff6ff',

  // 青绿
  cyan: '#06b6d4',
  cyanBg: '#ecfeff',

  // 通用
  danger: '#ef4444',
  gray: '#9ca3af',
  white: '#ffffff',
  black: '#000000',
};

export const currency = (n: number): string => {
  const sign = n < 0 ? '-' : '';
  return `${sign}$${Math.abs(n).toFixed(2)}`;
};

export const currencyAUD = (n: number): string => `${currency(n)} AUD`;
