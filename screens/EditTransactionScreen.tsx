import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';
import {
  getTransactionById,
  updateTransaction,
} from '../services/transactionService';

type Props = NativeStackScreenProps<RootStackParamList, 'Edit'>;

export default function EditTransactionScreen({ route, navigation }: Props) {
  const { itemId } = route.params;

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadTransaction = async () => {
    try {
      setLoading(true);
      const data = await getTransactionById(itemId);

      setType(data.type);
      setCategory(data.category);
      setAmount(String(data.amount));
      setNote(data.note || '');
      setDate(data.date);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load transaction.');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!category.trim() || !amount.trim() || !date.trim()) {
      Alert.alert('Validation Error', 'Category, amount, and date are required.');
      return;
    }

    const parsedAmount = Number(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Validation Error', 'Amount must be greater than 0.');
      return;
    }

    try {
      setSaving(true);

      await updateTransaction(itemId, {
        type,
        category: category.trim(),
        amount: parsedAmount,
        note: note.trim(),
        date: date.trim(),
      });

      Alert.alert('Success', 'Transaction updated successfully.');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update transaction.');
    } finally {
      setSaving(false);
    }
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Transaction</Text>

      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'expense' && styles.activeButton]}
          onPress={() => setType('expense')}
        >
          <Text style={[styles.typeText, type === 'expense' && styles.activeText]}>
            Expense
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, type === 'income' && styles.activeButton]}
          onPress={() => setType('income')}
        >
          <Text style={[styles.typeText, type === 'income' && styles.activeText]}>
            Income
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
      />

      <TextInput
        style={styles.input}
        placeholder="Amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <TextInput
        style={styles.input}
        placeholder="Note"
        value={note}
        onChangeText={setNote}
      />

      <TextInput
        style={styles.input}
        placeholder="Date (YYYY-MM-DD)"
        value={date}
        onChangeText={setDate}
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleUpdate}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Update Transaction</Text>
        )}
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
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  typeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  activeButton: {
    backgroundColor: '#7C3AED',
    borderColor: '#7C3AED',
  },
  typeText: {
    color: '#334155',
    fontWeight: '600',
  },
  activeText: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});