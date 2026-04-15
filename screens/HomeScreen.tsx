import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import {
  getUserTransactions,
  getUserStats,
} from '../services/transactionService';
import { Transaction } from '../types/transaction';
import { UserStats } from '../types/userStats';

type FilterType = 'all' | 'income' | 'expense';
type SortType = 'latest' | 'oldest';

export default function HomeScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortType, setSortType] = useState<SortType>('latest');

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const loadHomeData = async () => {
    if (!user) {
      setTransactions([]);
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [transactionData, statsData] = await Promise.all([
        getUserTransactions(user.uid),
        getUserStats(user.uid),
      ]);

      setTransactions(transactionData);
      setStats(statsData);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadHomeData();
    }, [user])
  );

  const filteredTransactions = useMemo(() => {
    let data = [...transactions];

    if (filterType !== 'all') {
      data = data.filter((item) => item.type === filterType);
    }

    data.sort((a, b) => {
      const dateA = a.createdAt?.seconds != null ? a.createdAt.seconds : 0;
      const dateB = b.createdAt?.seconds != null ? b.createdAt.seconds : 0;

      return sortType === 'latest' ? dateB - dateA : dateA - dateB;
    });

    return data;
  }, [transactions, filterType, sortType]);

  const totalIncome = filteredTransactions
    .filter((item) => item.type === 'income')
    .reduce((sum, item) => sum + item.amount, 0);

  const totalExpense = filteredTransactions
    .filter((item) => item.type === 'expense')
    .reduce((sum, item) => sum + item.amount, 0);

  const balance = totalIncome - totalExpense;

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Welcome to PennyQuest</Text>
        <Text style={styles.subtitle}>
          Log in to view your transactions, rewards, and budgeting progress.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7C3AED" />
        <Text style={styles.subtitle}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.usernameText}>
            {user.email?.split('@')[0] ?? 'PennyQuest User'}
          </Text>
        </View>

        <View style={styles.levelBadge}>
          <Text style={styles.levelBadgeText}>Lv. {stats?.level ?? 1}</Text>
        </View>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>₱{balance.toFixed(2)}</Text>

        <View style={styles.balanceStatsRow}>
          <View>
            <Text style={styles.smallLabel}>Income</Text>
            <Text style={styles.whiteValue}>₱{totalIncome.toFixed(2)}</Text>
          </View>

          <View>
            <Text style={styles.smallLabel}>Expense</Text>
            <Text style={styles.whiteValue}>₱{totalExpense.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.quickStatsRow}>
        <View style={styles.quickCard}>
          <Text style={styles.quickLabel}>XP</Text>
          <Text style={styles.quickValue}>{stats?.xp ?? 0}</Text>
        </View>

        <View style={styles.quickCard}>
          <Text style={styles.quickLabel}>Coins</Text>
          <Text style={styles.quickValue}>{stats?.coins ?? 0}</Text>
        </View>

        <View style={styles.quickCard}>
          <Text style={styles.quickLabel}>Entries</Text>
          <Text style={styles.quickValue}>{stats?.totalTransactions ?? 0}</Text>
        </View>
      </View>

      <View style={styles.controlsWrapper}>
        <Text style={styles.sectionTitle}>Filter by Type</Text>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filterType === 'all' && styles.activeButton,
            ]}
            onPress={() => setFilterType('all')}
          >
            <Text
              style={[
                styles.filterText,
                filterType === 'all' && styles.activeButtonText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filterType === 'income' && styles.activeButton,
            ]}
            onPress={() => setFilterType('income')}
          >
            <Text
              style={[
                styles.filterText,
                filterType === 'income' && styles.activeButtonText,
              ]}
            >
              Income
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filterType === 'expense' && styles.activeButton,
            ]}
            onPress={() => setFilterType('expense')}
          >
            <Text
              style={[
                styles.filterText,
                filterType === 'expense' && styles.activeButtonText,
              ]}
            >
              Expense
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Sort</Text>
        <View style={styles.filterRow}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              sortType === 'latest' && styles.activeButton,
            ]}
            onPress={() => setSortType('latest')}
          >
            <Text
              style={[
                styles.filterText,
                sortType === 'latest' && styles.activeButtonText,
              ]}
            >
              Latest
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              sortType === 'oldest' && styles.activeButton,
            ]}
            onPress={() => setSortType('oldest')}
          >
            <Text
              style={[
                styles.filterText,
                sortType === 'oldest' && styles.activeButtonText,
              ]}
            >
              Oldest
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Recent Transactions</Text>

      {filteredTransactions.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No transactions found</Text>
          <Text style={styles.emptyText}>
            Try changing the filter or add a new transaction.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id!}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('Detail', { itemId: item.id })}
            >
              <View style={styles.leftContent}>
                <Text style={styles.cardTitle}>{item.category}</Text>
                <Text style={styles.cardSubtitle}>{item.note || 'No note'}</Text>
                <Text style={styles.cardDate}>{item.date}</Text>
              </View>

              <View style={styles.rightContent}>
                <Text
                  style={[
                    styles.amount,
                    item.type === 'income'
                      ? styles.amountIncome
                      : styles.amountExpense,
                  ]}
                >
                  {item.type === 'income' ? '+' : '-'}₱{item.amount.toFixed(2)}
                </Text>
                <Text style={styles.typeTag}>{item.type}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  center: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  greeting: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  usernameText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  levelBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
  },
  levelBadgeText: {
    color: '#5B21B6',
    fontWeight: '700',
    fontSize: 14,
  },
  balanceCard: {
    backgroundColor: '#7C3AED',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  balanceLabel: {
    color: '#E9D5FF',
    fontSize: 14,
    marginBottom: 6,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 16,
  },
  balanceStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  smallLabel: {
    color: '#E9D5FF',
    fontSize: 13,
    marginBottom: 4,
  },
  whiteValue: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  quickStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 18,
  },
  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  quickLabel: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 6,
  },
  quickValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  controlsWrapper: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  filterButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  activeButton: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  filterText: {
    color: '#334155',
    fontWeight: '600',
  },
  activeButtonText: {
    color: '#FFFFFF',
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  leftContent: {
    flex: 1,
    paddingRight: 10,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 6,
  },
  amount: {
    fontSize: 16,
    fontWeight: '700',
  },
  amountIncome: {
    color: '#16A34A',
  },
  amountExpense: {
    color: '#DC2626',
  },
  typeTag: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
    textTransform: 'capitalize',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    marginTop: 10,
  },
});