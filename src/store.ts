import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Character, Expense, Income, ExpenseType, IncomeType, CharacterStats } from './types';

interface AppState {
  characters: Character[];
  expenses: Expense[];
  incomes: Income[];
  addCharacter: (name: string, server: string) => void;
  deleteCharacter: (id: string) => void;
  addExpense: (characterId: string, type: ExpenseType, amount: number, date: string, note: string) => void;
  deleteExpense: (id: string) => void;
  addIncome: (characterId: string, type: IncomeType, amount: number, date: string, note: string) => void;
  deleteIncome: (id: string) => void;
  getCharacterStats: (characterId: string) => CharacterStats;
  getExpensesByCharacterAndType: (characterId: string, type: ExpenseType) => Expense[];
  getIncomesByCharacterAndType: (characterId: string, type: IncomeType) => Income[];
  setCharacters: (characters: Character[]) => void;
  setExpenses: (expenses: Expense[]) => void;
  setIncomes: (incomes: Income[]) => void;
}

const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      characters: [],
      expenses: [],
      incomes: [],

      addCharacter: (name, server) => {
        const newCharacter: Character = {
          id: Date.now().toString(),
          name,
          server,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          characters: [...state.characters, newCharacter],
        }));
      },

      deleteCharacter: (id) => {
        set((state) => ({
          characters: state.characters.filter((c) => c.id !== id),
          expenses: state.expenses.filter((e) => e.characterId !== id),
          incomes: state.incomes.filter((i) => i.characterId !== id),
        }));
      },

      addExpense: (characterId, type, amount, date, note) => {
        const newExpense: Expense = {
          id: Date.now().toString(),
          characterId,
          type,
          amount,
          date,
          note,
        };
        set((state) => ({
          expenses: [...state.expenses, newExpense],
        }));
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        }));
      },

      addIncome: (characterId, type, amount, date, note) => {
        const newIncome: Income = {
          id: Date.now().toString(),
          characterId,
          type,
          amount,
          date,
          note,
        };
        set((state) => ({
          incomes: [...state.incomes, newIncome],
        }));
      },

      deleteIncome: (id) => {
        set((state) => ({
          incomes: state.incomes.filter((i) => i.id !== id),
        }));
      },

      getCharacterStats: (characterId) => {
        const state = get();
        const characterExpenses = state.expenses.filter((e) => e.characterId === characterId);
        const characterIncomes = state.incomes.filter((i) => i.characterId === characterId);

        const totalExpense = characterExpenses.reduce((sum, e) => sum + e.amount, 0);
        const totalIncome = characterIncomes.reduce((sum, i) => sum + i.amount, 0);

        const expenseByType: Record<ExpenseType, number> = {
          point: 0,
          month: 0,
          year: 0,
          equipment: 0,
          pet: 0,
        };
        characterExpenses.forEach((e) => {
          expenseByType[e.type] += e.amount;
        });

        const incomeByType: Record<IncomeType, number> = {
          money: 0,
          pet: 0,
          equipment: 0,
        };
        characterIncomes.forEach((i) => {
          incomeByType[i.type] += i.amount;
        });

        return { totalExpense, totalIncome, expenseByType, incomeByType };
      },

      getExpensesByCharacterAndType: (characterId, type) => {
        return get()
          .expenses.filter((e) => e.characterId === characterId && e.type === type)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getIncomesByCharacterAndType: (characterId, type) => {
        return get()
          .incomes.filter((i) => i.characterId === characterId && i.type === type)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      setCharacters: (characters) => set({ characters }),
      setExpenses: (expenses) => set({ expenses }),
      setIncomes: (incomes) => set({ incomes }),
    }),
    {
      name: 'mhxy-storage',
    }
  )
);

export default useAppStore;
