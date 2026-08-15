import type { AppData, CalcResult, Analysis, YearProjection } from '../types';
import { calculateWhvTax, getMarginalRate } from './tax';

export const DAYS_IN_3YEAR_CYCLE = 1095; // 365 × 3，长期目标平摊基准
export const DAYS_IN_MONTH = 30.4167;

/**
 * 核心计算引擎：把全部录入数据算成派生指标。
 * 逻辑与网页 renderAll() 一一对应，纯函数、可在 Node 下单测。
 */
export function compute(data: AppData): CalcResult {
  const { totalGoal, jobs, assets, expenses, bigItems, years } = data;

  // 1. 打工收入汇总（周薪/日薪均按 amount × duration 直接累加税前总额）
  let grossYear = 0;
  for (const job of jobs) {
    grossYear += job.amount * job.duration;
  }

  // 2. ATO 阶梯税
  const taxYear = calculateWhvTax(grossYear);
  const netYear = grossYear - taxYear;
  const netDay = netYear / 365;
  const marginalRate = getMarginalRate(grossYear);

  // 3. 抵税资产
  let totalDeductAmt = 0;
  let totalAssetDayCost = 0;
  for (const a of assets) {
    totalDeductAmt += a.cost * (a.prop / 100);
    const days = a.days > 0 ? a.days : 1;
    totalAssetDayCost += a.cost / days;
  }
  const totalSavedTax = totalDeductAmt * marginalRate; // 预计退税，不计入现金流

  // 4. 生活开销
  let totalExpWeek = 0;
  for (const e of expenses) totalExpWeek += e.amount;
  const totalExpDay = totalExpWeek / 7;

  // 5. 大额分期
  let totalBigDayCost = 0;
  for (const b of bigItems) {
    const days = b.days > 0 ? b.days : 1;
    totalBigDayCost += b.price / days;
  }

  // 6. 长期攒钱死目标
  const goalDay = totalGoal / DAYS_IN_3YEAR_CYCLE;

  // 7. 真实收支核算
  const auditNetDay = netDay;
  const auditNetWeek = netDay * 7;
  const auditExpDay = totalExpDay + totalBigDayCost + totalAssetDayCost;
  const auditExpWeek = auditExpDay * 7;

  const surplusDay = auditNetDay - auditExpDay;
  const surplusWeek = auditNetWeek - auditExpWeek;

  // 8. 钱袋子短周期蓄水池
  const tlDay = surplusDay;
  const tlWeek = surplusDay * 7;
  const tlMonth = surplusDay * DAYS_IN_MONTH;

  // 9. 顶部看板：今日任意支配额度
  const finalDailyDisposable = surplusDay - goalDay;

  // 10. 无限年份投影
  const yearProjections: YearProjection[] = years.map((yr, i) => {
    const sequentialMultiplier = i + 1;
    return {
      id: yr.id,
      label: yr.label,
      index: sequentialMultiplier,
      cumulative: surplusDay * 365 * sequentialMultiplier,
    };
  });

  let analysis: Analysis | null = null;
  if (years.length > 0) {
    const lastIndex = years.length;
    const lastLabel = years[years.length - 1].label;
    const finalAccumulation = surplusDay * 365 * lastIndex;
    const meetsGoal = finalAccumulation >= totalGoal;
    analysis = {
      lastLabel,
      lastIndex,
      finalAccumulation,
      meetsGoal,
      overflow: meetsGoal ? finalAccumulation - totalGoal : 0,
      gap: meetsGoal ? 0 : totalGoal - finalAccumulation,
    };
  }

  return {
    totalGoal,
    goalDay,
    grossYear,
    taxYear,
    netYear,
    netDay,
    marginalRate,
    totalDeductAmt,
    totalSavedTax,
    totalAssetDayCost,
    totalExpWeek,
    totalExpDay,
    totalBigDayCost,
    auditNetDay,
    auditNetWeek,
    auditExpDay,
    auditExpWeek,
    surplusDay,
    surplusWeek,
    tlDay,
    tlWeek,
    tlMonth,
    finalDailyDisposable,
    yearProjections,
    analysis,
  };
}
