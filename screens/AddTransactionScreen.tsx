import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { addTransaction } from '../services/transactionService';

const expenseCategories = [
  'Food',
  'Transport',
  'School',
  'Bills',
  'Shopping',
  'Health',
  'Entertainment',
  'Others',
];

const incomeCategories = [
  'Allowance',
  'Salary',
  'Gift',
  'Scholarship',
  'Side Hustle',
  'Others',
];

export default function AddTransactionScreen() {
  const { user } = useAuth();

  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const categories = useMemo(() => {
    return type === 'expense' ? expenseCategories : incomeCategories;
  }, [type]);

  const handleSave = async () => {
    if (!user) {
      Alert.alert('Login Required', 'Please log in first.');
      return;
    }

    if (!category.trim() || !amount.trim() || !date.trim()) {
      Alert.alert('Validation Error', 'Category, amount, and date are required.');
      return;
    }

    const parsedAmount = Number(amount);

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Validation Error', 'Amount must be a valid number greater than 0.');
      return;
    }

    try {
      setLoading(true);

      await addTransaction({
        userId: user.uid,
        type,
        category: category.trim(),
        amount: parsedAmount,
        note: note.trim(),
        date: date.trim(),
        isArchived: false,
      });

      Alert.alert('Success', 'Transaction added successfully.');
      setType('expense');
      setCategory('');
      setAmount('');
      setNote('');
      setDate('');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save transaction.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCategory = (selectedCategory: string) => {
    setCategory(selectedCategory);
    setShowCategoryModal(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Transaction</Text>
      <Text style={styles.subtitle}>Record your income or expense here.</Text>

      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'expense' && styles.activeButton]}
          onPress={() => {
            setType('expense');
            setCategory('');
          }}
        >
          <Text style={[styles.typeText, type === 'expense' && styles.activeText]}>
            Expense
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, type === 'income' && styles.activeButton]}
          onPress={() => {
            setType('income');
            setCategory('');
          }}
        >
          <Text style={[styles.typeText, type === 'income' && styles.activeText]}>
            Income
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Category</Text>
      <TouchableOpacity
        style={styles.selector}
        onPress={() => setShowCategoryModal(true)}
      >
        <Text style={category ? styles.selectorText : styles.placeholderText}>
          {category || 'Select category'}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Amount</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />

      <Text style={styles.label}>Note</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter note"
        value={note}
        onChangeText={setNote}
      />

      <Text style={styles.label}>Date</Text>
      <TextInput
        style={styles.input}
        placeholder="YYYY-MM-DD"
        value={date}
        onChangeText={setDate}
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleSave}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Save Transaction</Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Select Category</Text>

            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.categoryItem}
                  onPress={() => handleSelectCategory(item)}
                >
                  <Text style={styles.categoryText}>{item}</Text>
                </TouchableOpacity>
              )}
            />

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCategoryModal(false)}
            >
              <Text style={styles.cancelText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
    marginTop: 4,
  },
  selector: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectorText: {
    color: '#0F172A',
    fontSize: 15,
  },
  placeholderText: {
    color: '#94A3B8',
    fontSize: 15,
  },
  arrow: {
    color: '#64748B',
    fontSize: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 12,
    color: '#0F172A',
  },
  button: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 14,
    textAlign: 'center',
  },
  categoryItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  categoryText: {
    fontSize: 15,
    color: '#0F172A',
  },
  cancelButton: {
    marginTop: 16,
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: '#334155',
    fontWeight: '600',
  },
});