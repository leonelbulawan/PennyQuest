import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ExploreScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Explore</Text>
      <Text style={styles.subtitle}>
        Discover budgeting tips, saving ideas, and future PennyQuest challenges.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Smart Tip</Text>
        <Text style={styles.cardText}>
          Track your expenses daily so your budget stays accurate and easier to manage.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Saving Reminder</Text>
        <Text style={styles.cardText}>
          Small savings done regularly can grow into a big financial habit over time.
        </Text>
      </View>
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
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 18,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  cardText: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
});