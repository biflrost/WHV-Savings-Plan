// ATO 2025-2026 WHV 阶梯累进税率（与网页完全一致）

export function calculateWhvTax(income: number): number {
  if (income <= 0) return 0;
  if (income <= 45000) return income * 0.15;
  if (income <= 135000) return 6750 + (income - 45000) * 0.30;
  if (income <= 190000) return 6750 + 27000 + (income - 135000) * 0.37;
  return 6750 + 27000 + 20350 + (income - 190000) * 0.45;
}

export function getMarginalRate(income: number): number {
  if (income <= 45000) return 0.15;
  if (income <= 135000) return 0.30;
  if (income <= 190000) return 0.37;
  return 0.45;
}
