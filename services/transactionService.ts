import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Transaction } from '../types/transaction';
import { UserStats } from '../types/userStats';

const transactionsRef = collection(db, 'transactions');
const userStatsRef = collection(db, 'userStats');

const getLevelFromXp = (xp: number) => {
  return Math.floor(xp / 100) + 1;
};

const getBadges = (totalTransactions: number) => {
  const badges: string[] = [];

  if (totalTransactions >= 1) badges.push('First Step');
  if (totalTransactions >= 10) badges.push('Money Tracker');
  if (totalTransactions >= 25) badges.push('Budget Explorer');
  if (totalTransactions >= 50) badges.push('PennyQuest Pro');

  return badges;
};

export const addTransaction = async (transaction: Transaction) => {
  const docRef = await addDoc(transactionsRef, {
    ...transaction,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await updateUserStatsAfterTransaction(transaction.userId);

  return docRef;
};

export const getUserTransactions = async (userId: string) => {
  const q = query(
    transactionsRef,
    where('userId', '==', userId),
    where('isArchived', '==', false),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  })) as Transaction[];
};

export const getTransactionById = async (id: string) => {
  const ref = doc(db, 'transactions', id);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    throw new Error('Transaction not found.');
  }

  return {
    id: snapshot.id,
    ...snapshot.data(),
  } as Transaction;
};

export const updateTransaction = async (
  id: string,
  updatedData: Partial<Transaction>
) => {
  const ref = doc(db, 'transactions', id);

  await updateDoc(ref, {
    ...updatedData,
    updatedAt: serverTimestamp(),
  });
};

export const deleteTransaction = async (id: string) => {
  const ref = doc(db, 'transactions', id);
  await deleteDoc(ref);
};

export const archiveTransaction = async (id: string) => {
  const ref = doc(db, 'transactions', id);

  await updateDoc(ref, {
    isArchived: true,
    updatedAt: serverTimestamp(),
  });
};

export const updateUserStatsAfterTransaction = async (userId: string) => {
  const q = query(
    transactionsRef,
    where('userId', '==', userId),
    where('isArchived', '==', false)
  );

  const snapshot = await getDocs(q);
  const totalTransactions = snapshot.size;

  const statsRef = doc(userStatsRef, userId);
  const statsSnap = await getDoc(statsRef);

  const baseXp = totalTransactions * 10;
  const baseCoins = totalTransactions * 5;

  let challengeCompleted = false;
  let bonusXp = 0;
  let bonusCoins = 0;

  if (statsSnap.exists()) {
    const oldStats = statsSnap.data() as UserStats;
    challengeCompleted = oldStats.challengeCompleted ?? false;
  }

  if (totalTransactions >= 5 && !challengeCompleted) {
    challengeCompleted = true;
    bonusXp = 50;
    bonusCoins = 25;
  }

  const xp = baseXp + bonusXp;
  const coins = baseCoins + bonusCoins;
  const level = getLevelFromXp(xp);
  const badges = getBadges(totalTransactions);

  const stats: UserStats = {
    userId,
    xp,
    coins,
    level,
    totalTransactions,
    badges,
    challengeCompleted,
    updatedAt: serverTimestamp(),
  };

  await setDoc(statsRef, stats);
};

export const getUserStats = async (userId: string) => {
  const ref = doc(db, 'userStats', userId);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return {
      userId,
      xp: 0,
      coins: 0,
      level: 1,
      totalTransactions: 0,
      badges: [],
      challengeCompleted: false,
    } as UserStats;
  }

  return snapshot.data() as UserStats;
};