import React, { useState } from 'react';
import { View, Text, Pressable, Alert, StyleSheet } from 'react-native';
import { Screen, Card, LabeledInput, AddButton, CardItem, ResultBox, Stat } from '../components/ui';
import { useStore, useComputed } from '../store';
import { colors, currency, currencyAUD } from '../theme';
import type { SalaryType } from '../types';

export default function JobsScreen() {
  const jobs = useStore((s) => s.jobs);
  const addJob = useStore((s) => s.addJob);
  const delJob = useStore((s) => s.delJob);
  const r = useComputed();

  const [name, setName] = useState('');
  const [type, setType] = useState<SalaryType>('week');
  const [amount, setAmount] = useState('');
  const [duration, setDuration] = useState('');

  const onAdd = () => {
    const amt = parseFloat(amount);
    const dur = parseInt(duration, 10);
    if (isNaN(amt) || amt <= 0 || isNaN(dur) || dur <= 0) {
      Alert.alert('提示', '请完整填写薪资数额和工作时长！');
      return;
    }
    addJob({ name: name.trim() || '未命名工作', type, amount: amt, duration: dur });
    setName(''); setAmount(''); setDuration('');
  };

  return (
    <Screen>
      <Card title="💰 薪资收入叠加录入 (支持多份工作)">
        <LabeledInput label="工作岗位/来源名称" placeholder="例：主要工作 / 兼职外卖" value={name} onChange={setName} flex={2} />
        <View style={styles.seg}>
          <SegBtn label="按周赚(周薪)" active={type === 'week'} onPress={() => setType('week')} />
          <SegBtn label="按天赚(日薪)" active={type === 'day'} onPress={() => setType('day')} />
        </View>
        <View style={styles.row}>
          <LabeledInput label="税前薪资数额 (AUD)" placeholder="输入金额" value={amount} onChange={setAmount} keyboardType="numeric" />
          <LabeledInput label={type === 'week' ? '工作多少周' : '工作多少天'} placeholder="周数/天数" value={duration} onChange={setDuration} keyboardType="numeric" />
        </View>
        <AddButton title="➕ 添加这份工作" onPress={onAdd} />
      </Card>

      <Card title="📋 当前已合并计算的工作列表" accent="green">
        {jobs.length === 0 ? (
          <Text style={styles.empty}>未添加任何工作数据</Text>
        ) : (
          jobs.map((j) => {
            const unit = j.type === 'week' ? '周' : '天';
            const gross = j.amount * j.duration;
            return (
              <CardItem
                key={j.id}
                title={j.name}
                lines={[`${currency(j.amount)}/${unit} × ${j.duration}${unit}`, `税前 ${currency(gross)}`]}
                onDelete={() => delJob(j.id)}
              />
            );
          })
        )}
        <ResultBox accent="green">
          <Stat label="💼 全年税前总收入:" value={currency(r.grossYear)} bold />
          <Stat label="🛡️ ATO 合并总税收:" value={currency(r.taxYear)} color={colors.red} bold />
          <Stat label="➔ 全年净到手:" value={currency(r.netYear)} color={colors.green} bold />
          <Stat label="🔹 摊平到每天到手:" value={currencyAUD(r.netDay)} color={colors.green} bold />
        </ResultBox>
      </Card>
    </Screen>
  );
}

const SegBtn: React.FC<{ label: string; active: boolean; onPress: () => void }> = ({ label, active, onPress }) => (
  <Pressable
    style={({ pressed }) => [
      styles.segBtn,
      { backgroundColor: active ? colors.primary : colors.divider },
      pressed && { opacity: 0.85 },
    ]}
    onPress={onPress}
    android_ripple={{ color: 'rgba(0,0,0,0.06)' }}
  >
    <Text style={{ color: active ? '#fff' : colors.text, fontWeight: '700', fontSize: 14 }}>{label}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  seg: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  segBtn: { flex: 1, paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  empty: { color: colors.sub, paddingVertical: 10 },
});
