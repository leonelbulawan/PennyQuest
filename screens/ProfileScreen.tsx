import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../hooks/useAuth';
import { logoutUser } from '../services/authService';
import { getUserStats } from '../services/transactionService';
import { UserStats } from '../types/userStats';

export default function ProfileScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await getUserStats(user.uid);
      setStats(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load user stats.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      Alert.alert('Success', 'Logged out successfully.');
    } catch (error: any) {
      Alert.alert('Logout Failed', error.message || 'Something went wrong.');
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [user])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  const totalTransactions = stats?.totalTransactions ?? 0;
  const challengeTarget = 5;
  const currentProgress =
    totalTransactions >= challengeTarget ? challengeTarget : totalTransactions;
  const challengeCompleted = stats?.challengeCompleted ?? false;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Welcome, {user?.email ?? 'User'}</Text>

      <View style={styles.statsCard}>
        <Text style={styles.cardTitleWhite}>Your Progress</Text>
        <Text style={styles.statText}>Level: {stats?.level ?? 1}</Text>
        <Text style={styles.statText}>XP: {stats?.xp ?? 0}</Text>
        <Text style={styles.statText}>Coins: {stats?.coins ?? 0}</Text>
        <Text style={styles.statText}>
          Total Transactions: {stats?.totalTransactions ?? 0}
        </Text>
      </View>

      <View style={styles.challengeCard}>
        <Text style={styles.cardTitleDark}>Weekly Challenge</Text>
        <Text style={styles.challengeTitle}>Log 5 transactions</Text>
        <Text style={styles.challengeDesc}>
          Reward: +50 XP and +25 Coins
        </Text>
        <Text style={styles.challengeProgress}>
          Progress: {currentProgress}/{challengeTarget}
        </Text>
        <Text
          style={[
            styles.challengeStatus,
            challengeCompleted ? styles.completed : styles.inProgress,
          ]}
        >
          {challengeCompleted ? 'Completed' : 'In Progress'}
        </Text>
      </View>

      <View style={styles.badgesCard}>
        <Text style={styles.cardTitleDark}>Badges</Text>
        {stats?.badges && stats.badges.length > 0 ? (
          stats.badges.map((badge) => (
            <View key={badge} style={styles.badge}>
              <Text style={styles.badgeText}>{badge}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No badges yet</Text>
        )}
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F8FAFC',
    flexGrow: 1,
  },
  center: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 24,
  },
  statsCard: {
    backgroundColor: '#7C3AED',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  challengeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  badgesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  cardTitleWhite: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#FFFFFF',
  },
  cardTitleDark: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#0F172A',
  },
  statText: {
    fontSize: 15,
    color: '#FFFFFF',
    marginBottom: 8,
    fontWeight: '600',
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  challengeDesc: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
  },
  challengeProgress: {
    fontSize: 14,
    color: '#334155',
    marginBottom: 8,
    fontWeight: '600',
  },
  challengeStatus: {
    fontSize: 14,
    fontWeight: '700',
  },
  completed: {
    color: '#16A34A',
  },
  inProgress: {
    color: '#D97706',
  },
  badge: {
    backgroundColor: '#EDE9FE',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  badgeText: {
    color: '#5B21B6',
    fontWeight: '600',
  },
  emptyText: {
    color: '#64748B',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#DC2626',
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});