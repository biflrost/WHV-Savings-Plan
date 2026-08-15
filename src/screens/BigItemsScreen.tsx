import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, useWindowDimensions } from 'react-native';
import { Screen, Card, LabeledInput, AddButton, ListRow, ResultBox, Stat } from '../components/ui';
import { useStore, useComputed } from '../store';
import { colors, currency } from '../theme';

export default function BigItemsScreen() {
  const bigItems = useStore((s) => s.bigItems);
  const addBigItem = useStore((s) => s.addBigItem);
  const delBigItem = useStore((s) => s.delBigItem);
  const r = useComputed();

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [days, setDays] = useState('');
  const { width } = useWindowDimensions();
  const isSmall = width < 380;

  const onAdd = () => {
    const p = parseFloat(price);
    const d = parseInt(days, 10);
    if (isNaN(p) || p <= 0 || isNaN(d) || d <= 0) {
      Alert.alert('提示', '请完整填写价格和分摊天数！');
      return;
    }
    addBigItem({ name: name.trim() || '大件商品', price: p, days: d });
    setName(''); setPrice(''); setDays('');
  };

  return (
    <Screen>
      <Card title="一次性大额私人特定消费" accent="purple">
        <LabeledInput label="想买的大件物品名称" placeholder="例：买新手机 / 买大疆无人机" value={name} onChange={setName} flex={2} />
        <View style={[styles.row, isSmall && styles.rowCol]}>
          <LabeledInput label="物品总价 (AUD)" placeholder="价格" value={price} onChange={setPrice} keyboardType="numeric" />
          <LabeledInput label="分多少天摊完" placeholder="天数" value={days} onChange={setDays} keyboardType="numeric" />
        </View>
        <AddButton title="计入大额分期" onPress={onAdd} color={colors.purple} />
      </Card>

      <Card title="正在并行分摊的大额消费清单" accent="purple">
        {bigItems.length === 0 ? (
          <Text style={styles.empty}>未添加大额私人分期项目</Text>
        ) : (
          bigItems.map((b) => {
            const dayCost = b.price / (b.days > 0 ? b.days : 1);
            return (
              <ListRow
                key={b.id}
                left={<Text style={styles.bold}>{b.name}</Text>}
                right={`总价 $${b.price.toFixed(2)} / ${b.days}天 ➔ 日摊 ${currency(dayCost)}`}
                onDelete={() => delBigItem(b.id)}
              />
            );
          })
        )}
        <ResultBox accent="purple">
          <Stat label="所有大件叠加后，平均每天隐形分期账单:" value={currency(r.totalBigDayCost)} color={colors.red} bold />
        </ResultBox>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  rowCol: { flexDirection: 'column' },
  empty: { color: colors.sub, paddingVertical: 10 },
  bold: { fontWeight: '700' },
});
