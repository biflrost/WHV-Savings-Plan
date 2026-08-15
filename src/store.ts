import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useMemo } from 'react';
import type { AppData, Job, Asset, Expense, BigItem, YearItem } from './types';
import { genId } from './utils/id';
import { compute } from './engine/calculator';

const defaultData: AppData = {
  totalGoal: 150000,
  jobs: [{ id: genId(), name: 'Casino主要打工', type: 'week', amount: 1600, duration: 45 }],
  assets: [{ id: genId(), name: 'ABN送外卖iPhone', cost: 1500, prop: 70, days: 90 }],
  expenses: [
    { id: genId(), name: '每周房租', amount: 300 },
    { id: genId(), name: '每周吃喝', amount: 150 },
  ],
  bigItems: [{ id: genId(), name: '买新相机', price: 1800, days: 120 }],
  years: [
    { id: genId(), label: '2026' },
    { id: genId(), label: '2027' },
    { id: genId(), label: '2028' },
  ],
};

function freshDefaults(): AppData {
  // 重置时生成全新 id，避免与持久化对象冲突
  return JSON.parse(JSON.stringify(defaultData)) as AppData;
}

interface StoreState extends AppData {
  setTotalGoal: (v: number) => void;
  addJob: (j: Omit<Job, 'id'>) => void;
  delJob: (id: string) => void;
  addAsset: (a: Omit<Asset, 'id'>) => void;
  delAsset: (id: string) => void;
  addExpense: (e: Omit<Expense, 'id'>) => void;
  delExpense: (id: string) => void;
  addBigItem: (b: Omit<BigItem, 'id'>) => void;
  delBigItem: (id: string) => void;
  addYear: (label: string) => void;
  delYear: (id: string) => void;
  replaceAll: (data: AppData) => void; // 导入备份
  resetAll: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      ...defaultData,

      setTotalGoal: (v) => set({ totalGoal: v }),

      addJob: (j) => set((s) => ({ jobs: [...s.jobs, { ...j, id: genId() }] })),
      delJob: (id) => set((s) => ({ jobs: s.jobs.filter((x) => x.id !== id) })),

      addAsset: (a) => set((s) => ({ assets: [...s.assets, { ...a, id: genId() }] })),
      delAsset: (id) => set((s) => ({ assets: s.assets.filter((x) => x.id !== id) })),

      addExpense: (e) => set((s) => ({ expenses: [...s.expenses, { ...e, id: genId() }] })),
      delExpense: (id) => set((s) => ({ expenses: s.expenses.filter((x) => x.id !== id) })),

      addBigItem: (b) => set((s) => ({ bigItems: [...s.bigItems, { ...b, id: genId() }] })),
      delBigItem: (id) => set((s) => ({ bigItems: s.bigItems.filter((x) => x.id !== id) })),

      addYear: (label) => set((s) => ({ years: [...s.years, { id: genId(), label }] })),
      delYear: (id) => set((s) => ({ years: s.years.filter((x) => x.id !== id) })),

      replaceAll: (data) => set({ ...data }),
      resetAll: () => set(freshDefaults()),
    }),
    {
      name: 'whv_calculator_data_v1',
      storage: createJSONStorage(() => AsyncStorage),
      // 只持久化业务数据，不持久化 action 函数
      partialize: (s) => ({
        totalGoal: s.totalGoal,
        jobs: s.jobs,
        assets: s.assets,
        expenses: s.expenses,
        bigItems: s.bigItems,
        years: s.years,
      }),
    }
  )
);

// 派生计算：任何录入变化都会触发重算并刷新界面（替代网页的 renderAll）
export function useComputed() {
  const totalGoal = useStore((s) => s.totalGoal);
  const jobs = useStore((s) => s.jobs);
  const assets = useStore((s) => s.assets);
  const expenses = useStore((s) => s.expenses);
  const bigItems = useStore((s) => s.bigItems);
  const years = useStore((s) => s.years);
  return useMemo(
    () => compute({ totalGoal, jobs, assets, expenses, bigItems, years }),
    [totalGoal, jobs, assets, expenses, bigItems, years]
  );
}
