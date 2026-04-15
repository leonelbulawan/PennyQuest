import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import {
  archiveTransaction,
  getTransactionById,
} from '../services/transactionService';
import { Transaction } from '../types/transaction';

type Props = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export default function DetailScreen({ route, navigation }: Props) {
  const { itemId } = route.params || {};

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);

  const loadTransaction = async () => {
    if (!itemId) {
      Alert.alert('Error', 'Transaction ID is missing.');
      navigation.goBack();
      return;
    }

    try {
      setLoading(true);
      const data = await getTransactionById(itemId);
      setTransaction(data);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load transaction.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!itemId) {
      Alert.alert('Error', 'Transaction ID is missing.');
      return;
    }

    try {
      await archiveTransaction(itemId);
      Alert.alert('Success', 'Transaction archived successfully.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to archive transaction.');
    }
  };

  const handleEdit = () => {
    if (!itemId) {
      Alert.alert('Error', 'Transaction ID is missing.');
      return;
    }

    navigation.navigate('Edit', { itemId });
  };

  useEffect(() => {
    loadTransaction();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#7C3AED" />
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.center}>
        <Text style={styles.subtitle}>Transaction not found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{transaction.category}</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Type</Text>
        <Text style={styles.value}>{transaction.type}</Text>

        <Text style={styles.label}>Amount</Text>
        <Text style={styles.value}>₱{transaction.amount}</Text>

        <Text style={styles.label}>Date</Text>
        <Text style={styles.value}>{transaction.date}</Text>

        <Text style={styles.label}>Note</Text>
        <Text style={styles.value}>{transaction.note || 'No note'}</Text>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
        <Text style={styles.buttonText}>Edit Transaction</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.archiveButton} onPress={handleArchive}>
        <Text style={styles.buttonText}>Archive Transaction</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  center: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 15,
    color: '#475569',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 10,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#0F172A',
    fontWeight: '600',
  },
  editButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  archiveButton: {
    backgroundColor: '#DC2626',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});