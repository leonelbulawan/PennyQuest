export interface UserStats {
  userId: string;
  xp: number;
  coins: number;
  level: number;
  totalTransactions: number;
  badges: string[];
  challengeCompleted: boolean;
  updatedAt?: any;
}