export interface Character {
  id: string;
  name: string;
  server: string;
  createdAt: string;
}

export type ExpenseType = 'point' | 'month' | 'year' | 'equipment' | 'pet';

export interface Expense {
  id: string;
  characterId: string;
  type: ExpenseType;
  amount: number;
  date: string;
  note: string;
}

export type IncomeType = 'money' | 'pet' | 'equipment';

export interface Income {
  id: string;
  characterId: string;
  type: IncomeType;
  amount: number;
  date: string;
  note: string;
}

export interface CharacterStats {
  totalExpense: number;
  totalIncome: number;
  expenseByType: Record<ExpenseType, number>;
  incomeByType: Record<IncomeType, number>;
}

export const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  point: '通用点卡',
  month: '月卡',
  year: '年卡',
  equipment: '装备',
  pet: '宝宝'
};

export const INCOME_TYPE_LABELS: Record<IncomeType, string> = {
  money: '出菜',
  pet: '宝宝',
  equipment: '装备'
};
