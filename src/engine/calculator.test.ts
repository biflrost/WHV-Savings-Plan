import { compute, DAYS_IN_3YEAR_CYCLE } from './calculator';
import type { AppData } from '../types';

// 用网页里的默认数据做一遍，断言结果与手算一致
const defaultData: AppData = {
  totalGoal: 150000,
  jobs: [{ id: 'j1', name: 'Casino主要打工', type: 'week', amount: 1600, duration: 45 }],
  assets: [{ id: 'a1', name: 'ABN送外卖iPhone', cost: 1500, prop: 70, days: 90 }],
  expenses: [
    { id: 'e1', name: '每周房租', amount: 300 },
    { id: 'e2', name: '每周吃喝', amount: 150 },
  ],
  bigItems: [{ id: 'b1', name: '买新相机', price: 1800, days: 120 }],
  years: [{ id: 'y1', label: '2026' }, { id: 'y2', label: '2027' }, { id: 'y3', label: '2028' }],
};

let passed = 0;
let failed = 0;

function approx(name: string, actual: number, expected: number, tol = 0.01) {
  if (Math.abs(actual - expected) <= tol) {
    passed++;
    console.log(`  ✓ ${name}: ${actual.toFixed(2)}`);
  } else {
    failed++;
    console.error(`  ✗ ${name}: got ${actual.toFixed(2)}, expected ${expected.toFixed(2)}`);
  }
}

const r = compute(defaultData);

console.log('澳洲攒钱引擎测试（默认数据）');
approx('全年税前总收入 grossYear', r.grossYear, 72000);
approx('ATO 全年税收 taxYear', r.taxYear, 14850);          // 6750 + 27000*0.30
approx('全年税后净收入 netYear', r.netYear, 57150);
approx('税后日净收入 netDay', r.netDay, 57150 / 365);
approx('边际税率', r.marginalRate, 0.30);
approx('可抵税额 totalDeductAmt', r.totalDeductAmt, 1050);  // 1500*0.7
approx('预计退税 totalSavedTax', r.totalSavedTax, 315);     // 1050*0.30
approx('资产每日流出 totalAssetDayCost', r.totalAssetDayCost, 1500 / 90);
approx('每周生活总流出 totalExpWeek', r.totalExpWeek, 450);
approx('每日生活成本 totalExpDay', r.totalExpDay, 450 / 7);
approx('大件每日分期 totalBigDayCost', r.totalBigDayCost, 1800 / 120);
approx('每日死目标 goalDay', r.goalDay, 150000 / DAYS_IN_3YEAR_CYCLE);
approx('每日实际盈余 surplusDay', r.surplusDay, 57150 / 365 - (450 / 7 + 1800 / 120 + 1500 / 90));
approx('今日零花钱 finalDailyDisposable', r.finalDailyDisposable,
  (57150 / 365 - (450 / 7 + 1800 / 120 + 1500 / 90)) - 150000 / DAYS_IN_3YEAR_CYCLE);
approx('每月积攒 tlMonth', r.tlMonth, r.surplusDay * 30.4167);
approx('2026 年底累计', r.yearProjections[0].cumulative, r.surplusDay * 365 * 1);
approx('2028 年底累计', r.yearProjections[2].cumulative, r.surplusDay * 365 * 3);

if (r.analysis) {
  approx('长期投影达标判定(应未达标)', r.analysis.meetsGoal ? 1 : 0, 0);
  approx('距离目标缺口 gap', r.analysis.gap, 150000 - r.surplusDay * 365 * 3);
}

console.log(`\n结果：${passed} 通过, ${failed} 失败`);
if (failed > 0) process.exit(1);
