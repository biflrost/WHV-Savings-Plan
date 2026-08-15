import React, { useState } from 'react';
import { View, Text, Alert, StyleSheet, useWindowDimensions } from 'react-native';
import { Screen, Card, LabeledInput, AddButton, ListRow, ResultBox, Stat } from '../components/ui';
import { useStore, useComputed } from '../store';
import { colors, currency } from '../theme';

export default function AssetsScreen() {
  const assets = useStore((s) => s.assets);
  const addAsset = useStore((s) => s.addAsset);
  const delAsset = useStore((s) => s.delAsset);
  const r = useComputed();

  const [name, setName] = useState('');
  const [cost, setCost] = useState('');
  const [prop, setProp] = useState('70');
  const [days, setDays] = useState('90');
  const { width } = useWindowDimensions();
  const isSmall = width < 380;

  const onAdd = () => {
    const c = parseFloat(cost);
    const p = parseFloat(prop) || 0;
    const d = parseInt(days, 10);
    if (isNaN(c) || c <= 0 || isNaN(d) || d <= 0) {
      Alert.alert('提示', '请完整填写资产价格和分摊天数！');
      return;
    }
    addAsset({ name: name.trim() || '未命名资产', cost: c, prop: p, days: d });
    setName(''); setCost(''); setDays('90');
  };

  return (
    <Screen>
      <Card title="ABN 个体户多资产即时抵税工具" accent="amber">
        <LabeledInput label="购买工具/资产名称" placeholder="例：外卖电动车 / 备用工作机" value={name} onChange={setName} flex={2} />
        <View style={[styles.row, isSmall && styles.rowCol]}>
          <LabeledInput label="资产总价 (AUD)" placeholder="价格" value={cost} onChange={setCost} keyboardType="numeric" />
          <LabeledInput label="商用比例 (%)" placeholder="0-100" value={prop} onChange={setProp} keyboardType="numeric" />
          <LabeledInput label="分摊天数" placeholder="天数" value={days} onChange={setDays} keyboardType="numeric" />
        </View>
        <AddButton title="添加抵税资产" onPress={onAdd} color={colors.amber} />
      </Card>

      <Card title="已计入申报并分摊的抵税资产" accent="amber">
        {assets.length === 0 ? (
          <Text style={styles.empty}>未添加任何抵税资产</Text>
        ) : (
          assets.map((a) => {
            const dayCost = a.cost / (a.days > 0 ? a.days : 1);
            return (
              <ListRow
                key={a.id}
                left={<Text style={styles.bold}>{a.name} ({a.prop}%)</Text>}
                right={`总价 $${a.cost.toFixed(2)} | ${a.days}天 (日摊 ${currency(dayCost)})`}
                onDelete={() => delAsset(a.id)}
              />
            );
          })
        )}
        <ResultBox accent="amber">
          <Stat label="工具购买每日现金花销:" value={currency(r.totalAssetDayCost)} color={colors.red} bold />
          <Stat label="合并可申报总抵税额:" value={currency(r.totalDeductAmt)} bold />
          <Stat label="预计退税(不计入现金流):" value={currency(r.totalSavedTax)} color={colors.green} bold />
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
