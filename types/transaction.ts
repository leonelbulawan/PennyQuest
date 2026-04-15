export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id?: string;
  userId: string;
  type: TransactionType;
  category: string;
  amount: number;
  note: string;
  date: string;
  createdAt?: any;
  updatedAt?: any;
  isArchived: boolean;
}