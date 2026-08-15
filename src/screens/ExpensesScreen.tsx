import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, useWindowDimensions } from 'react-native';
import { Screen, Card, LabeledInput, AddButton, ListRow, ResultBox, Stat } from '../components/ui';
import { useStore, useComputed } from '../store';
import { colors, currency } from '../theme';

export default function ExpensesScreen() {
  const expenses = useStore((s) => s.expenses);
  const addExpense = useStore((s) => s.addExpense);
  const delExpense = useStore((s) => s.delExpense);
  const r = useComputed();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const { width } = useWindowDimensions();
  const isSmall = width < 380;

  const onAdd = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      Alert.alert('提示', '请填写正确的开销金额！');
      return;
    }
    addExpense({ name: name.trim() || '生活杂项', amount: amt });
    setName(''); setAmount('');
  };

  return (
    <Screen>
      <Card title="每周固定基本生活花销" accent="green">
        <LabeledInput label="消费类目名称" placeholder="例：每周房租 / 吃饭买菜 / 电话费" value={name} onChange={setName} flex={2} />
        <View style={[styles.row, isSmall && styles.rowCol]}>
          <LabeledInput label="每周开销金额 (AUD)" placeholder="金额" value={amount} onChange={setAmount} keyboardType="numeric" />
          <AddButton title="添加生活开销" onPress={onAdd} color={colors.green} />
        </View>
      </Card>

      <Card title="固定的日常开销细分列表" accent="green">
        {expenses.length === 0 ? (
          <Text style={styles.empty}>未添加生活开销</Text>
        ) : (
          expenses.map((e) => (
            <ListRow
              key={e.id}
              left={<Text style={styles.bold}>{e.name}</Text>}
              right={`每周 $${e.amount.toFixed(2)}`}
              onDelete={() => delExpense(e.id)}
            />
          ))
        )}
        <ResultBox accent="green">
          <Stat label="每周固定基础生活总流出:" value={currency(r.totalExpWeek)} bold />
          <Stat label="平摊每天基本生活成本:" value={currency(r.totalExpDay)} color={colors.red} bold />
        </ResultBox>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, flexWrap: 'wrap' },
  rowCol: { flexDirection: 'column', alignItems: 'stretch' },
  empty: { color: colors.sub, paddingVertical: 10 },
  bold: { fontWeight: '700' },
});
