// 全局数据类型定义（与网页 localStorage 数据结构保持一致）

export type SalaryType = 'week' | 'day';

export interface Job {
  id: string;
  name: string;
  type: SalaryType;
  amount: number;   // 周薪 或 日薪（税前 AUD）
  duration: number; // 周数 或 天数
}

export interface Asset {
  id: string;
  name: string;
  cost: number;     // 资产总价 AUD
  prop: number;     // 商用比例 %
  days: number;     // 分摊天数
}

export interface Expense {
  id: string;
  name: string;
  amount: number;   // 每周开销 AUD
}

export interface BigItem {
  id: string;
  name: string;
  price: number;    // 物品总价 AUD
  days: number;     // 分摊天数
}

export interface YearItem {
  id: string;
  label: string;    // 年份标签，如 2026
}

// 持久化到本机的全部业务数据
export interface AppData {
  totalGoal: number;
  jobs: Job[];
  assets: Asset[];
  expenses: Expense[];
  bigItems: BigItem[];
  years: YearItem[];
}

// 计算引擎输出的全部派生指标
export interface YearProjection {
  id: string;
  label: string;
  index: number;        // 第几年（从 1 开始）
  cumulative: number;   // 年底累计积攒
}

export interface Analysis {
  lastLabel: string;
  lastIndex: number;
  finalAccumulation: number;
  meetsGoal: boolean;
  overflow: number;     // 达标时溢出的资金
  gap: number;          // 未达标时的缺口
}

export interface CalcResult {
  totalGoal: number;
  goalDay: number;          // 每日必须攒下的死目标

  grossYear: number;        // 全年税前总收入
  taxYear: number;          // ATO 全年总税收
  netYear: number;          // 全年税后净收入
  netDay: number;           // 税后日净收入
  marginalRate: number;     // 边际税率

  totalDeductAmt: number;   // 可纳入申报的总抵税额
  totalSavedTax: number;    // 预计退税（不计入现金流）

  totalAssetDayCost: number;// 抵税资产每日现金流出
  totalExpWeek: number;     // 每周固定生活总流出
  totalExpDay: number;      // 每日生活成本
  totalBigDayCost: number;  // 大件每日分期

  auditNetDay: number;
  auditNetWeek: number;
  auditExpDay: number;
  auditExpWeek: number;

  surplusDay: number;       // 每日实际盈余
  surplusWeek: number;

  tlDay: number;            // 每天实际进包
  tlWeek: number;           // 每周存下
  tlMonth: number;          // 每月积攒

  finalDailyDisposable: number; // 今日任意支配额度（零花钱）

  yearProjections: YearProjection[];
  analysis: Analysis | null;
}
