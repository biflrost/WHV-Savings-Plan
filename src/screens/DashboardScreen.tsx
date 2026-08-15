import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet, useWindowDimensions } from 'react-native';
import { Screen, Card, ResultBox, Tile, Stat } from '../components/ui';
import { useStore, useComputed } from '../store';
import { colors, currency, currencyAUD } from '../theme';

export default function DashboardScreen() {
  const r = useComputed();
  const resetAll = useStore((s) => s.resetAll);
  const addYear = useStore((s) => s.addYear);
  const delYear = useStore((s) => s.delYear);

  const [yearLabel, setYearLabel] = useState('');
  const { width } = useWindowDimensions();
  const isSmall = width < 380;

  const onReset = () => {
    Alert.alert('清空并重置', '确定要清空所有自定义数据并恢复默认状态吗？', [
      { text: '取消', style: 'cancel' },
      { text: '确定重置', style: 'destructive', onPress: resetAll },
    ]);
  };

  const onAddYear = () => {
    const label = yearLabel.trim();
    if (!label) {
      Alert.alert('提示', '请输入年份标签，如 2026 或 2027');
      return;
    }
    addYear(label);
    setYearLabel('');
  };

  const disposable = r.finalDailyDisposable;
  const safe = disposable >= 0;

  return (
    <Screen>
      {/* 顶部核心看板 */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>今日任意支配额度</Text>
        <Text style={[styles.heroNum, { color: safe ? colors.green : colors.red }]}>
          {currencyAUD(disposable)}
        </Text>
        <Text style={styles.heroFormula}>实际日盈余 − 每日必须存下的死目标</Text>
        <Text style={[styles.status, { color: safe ? colors.greenDark : colors.redDark }]}>
          {safe
            ? `财务安全！保障每日目标 ${currency(r.goalDay)} 后，今天还能自由支配 ${currency(disposable)}`
            : `攒钱赤字：每天实际只能攒 ${currency(r.surplusDay)}，距目标还差 ${currency(Math.abs(disposable))}/天`}
        </Text>
        <Pressable
          style={({ pressed }) => [styles.resetBtn, pressed && styles.btnPressed]}
          onPress={onReset}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
        >
          <Text style={styles.resetBtnText}>清空并重置所有数据</Text>
        </Pressable>
      </View>

      {/* 钱袋子全周期储备投影 */}
      <Card title="钱袋子全周期储备投影" accent="green">
        <Text style={styles.hint}>短周期固定算账</Text>
        <View style={[styles.tileRow, isSmall && styles.tileRowCol]}>
          <Tile label="每天进包" value={currency(r.tlDay)} color={colors.primary} topColor={colors.primary} />
          <Tile label="每周存下" value={currency(r.tlWeek)} color={colors.green} topColor={colors.green} />
          <Tile label="每月积攒" value={currency(r.tlMonth)} color={colors.amber} topColor={colors.amber} />
        </View>

        <View style={[styles.yearInputRow, isSmall && styles.yearInputRowCol]}>
          <TextInput
            style={[styles.input, { flex: isSmall ? 1 : 2 }]}
            placeholder="想看哪一年？如 2026 / 2027"
            placeholderTextColor={colors.sub}
            value={yearLabel}
            onChangeText={setYearLabel}
          />
          <Pressable
            style={({ pressed }) => [styles.addBtn, { backgroundColor: colors.green }, pressed && styles.btnPressed]}
            onPress={onAddYear}
            android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
          >
            <Text style={styles.addBtnText}>添加年份</Text>
          </Pressable>
        </View>

        <View style={styles.yearGrid}>
          {r.yearProjections.length === 0 ? (
            <Text style={styles.empty}>暂无任何自定义年份，请在上方添加</Text>
          ) : (
            r.yearProjections.map((y) => (
              <View key={y.id} style={[styles.yearBlock, isSmall && styles.yearBlockFull]}>
                <Pressable
                  style={({ pressed }) => [styles.yearDel, pressed && styles.btnPressed]}
                  onPress={() => delYear(y.id)}
                  android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
                >
                  <Text style={styles.yearDelText}>✕</Text>
                </Pressable>
                <Text style={styles.yearLabel}>{y.label} 年底累计</Text>
                <Text style={[styles.yearValue, { color: colors.green }]}>{currency(y.cumulative)}</Text>
                <Text style={styles.yearSub}>持续积攒第 {y.index} 年</Text>
              </View>
            ))
          )}
        </View>

        {r.analysis ? (
          <ResultBox accent="green">
            {r.analysis.meetsGoal ? (
              <Text style={{ color: colors.greenDark, fontSize: 15, lineHeight: 22 }}>
                盘算到 <Text style={{ fontWeight: '800' }}>{r.analysis.lastLabel}年</Text> 底（积攒 {r.analysis.lastIndex} 年），
                包里预计积累 <Text style={{ fontWeight: '800' }}>{currency(r.analysis.finalAccumulation)}</Text>！
                已战胜 ${r.totalGoal.toFixed(0)} 目标，溢出闲置资金 {currency(r.analysis.overflow)}。
              </Text>
            ) : (
              <Text style={{ color: colors.redDark, fontSize: 15, lineHeight: 22 }}>
                盘算到 <Text style={{ fontWeight: '800' }}>{r.analysis.lastLabel}年</Text> 底（积攒 {r.analysis.lastIndex} 年），
                累计约 <Text style={{ fontWeight: '800' }}>{currency(r.analysis.finalAccumulation)}</Text>。
                距目标仍差 <Text style={{ fontWeight: '800' }}>{currency(r.analysis.gap)}</Text>。建议添加更远年份或加薪！
              </Text>
            )}
          </ResultBox>
        ) : null}
      </Card>

      {/* 真实收支与攒钱盈余核算台 */}
      <Card title="真实收支与攒钱盈余核算" accent="primary">
        <View style={[styles.auditRow, isSmall && styles.auditRowCol]}>
          <ResultBox accent="primary">
            <Text style={styles.auditH}>每日真实收支</Text>
            <Stat label="每日到手(税后):" value={currencyAUD(r.auditNetDay)} color={colors.green} bold />
            <Stat label="每日花销(总计):" value={currencyAUD(r.auditExpDay)} color={colors.red} bold />
            <Text style={styles.subNote}>
              生活费 {currency(r.totalExpDay)} + 大件分期 {currency(r.totalBigDayCost)} + 抵税工具 {currency(r.totalAssetDayCost)}
            </Text>
            <Stat label="每日实际攒下:" value={currencyAUD(r.surplusDay)} color={r.surplusDay >= r.goalDay ? colors.green : colors.red} bold />
            <Stat label="每日存钱死目标:" value={currencyAUD(r.goalDay)} color={colors.sub} />
          </ResultBox>

          <ResultBox accent="green">
            <Text style={styles.auditH}>每周真实收支</Text>
            <Stat label="每周到手(税后):" value={currencyAUD(r.auditNetWeek)} color={colors.green} bold />
            <Stat label="每周花销(总计):" value={currencyAUD(r.auditExpWeek)} color={colors.red} bold />
            <Text style={styles.subNote}>
              生活费 {currency(r.totalExpDay * 7)} + 大件分期 {currency(r.totalBigDayCost * 7)} + 抵税工具 {currency(r.totalAssetDayCost * 7)}
            </Text>
            <Stat label="每周实际攒下:" value={currencyAUD(r.surplusWeek)} color={r.surplusWeek >= r.goalDay * 7 ? colors.green : colors.red} bold />
            <Stat label="每周存钱死目标:" value={currencyAUD(r.goalDay * 7)} color={colors.sub} />
          </ResultBox>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    marginBottom: 6,
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  heroTitle: { color: 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: '600' },
  heroNum: { fontSize: 40, fontWeight: '900', marginVertical: 10 },
  heroFormula: { color: 'rgba(255,255,255,0.75)', fontSize: 13 },
  status: { fontSize: 15, fontWeight: '700', marginTop: 12, textAlign: 'center', lineHeight: 22 },
  resetBtn: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 14,
  },
  resetBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  btnPressed: { opacity: 0.85 },

  hint: { fontSize: 13, color: colors.sub, marginBottom: 10 },
  tileRow: { flexDirection: 'row', gap: 10 },
  tileRowCol: { flexDirection: 'column' },

  yearInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  yearInputRowCol: { flexDirection: 'column', alignItems: 'stretch' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: colors.white,
    color: colors.text,
  },
  addBtn: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  yearGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  yearBlock: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.greenBg,
    borderRadius: 12,
    padding: 14,
    paddingTop: 28,
    alignItems: 'center',
    position: 'relative',
  },
  yearBlockFull: { minWidth: '100%', flex: 0 },
  yearDel: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.red,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  yearDelText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  yearLabel: { fontSize: 14, fontWeight: '700', color: colors.textStrong, marginBottom: 4 },
  yearValue: { fontSize: 20, fontWeight: '800' },
  yearSub: { fontSize: 12, color: colors.sub, marginTop: 2 },
  empty: { color: colors.sub, padding: 16, textAlign: 'center', width: '100%' },

  auditRow: { gap: 12 },
  auditRowCol: { flexDirection: 'column' },
  auditH: { fontSize: 15, fontWeight: '800', color: colors.primaryDark, marginBottom: 8 },
  subNote: { fontSize: 12, color: colors.sub, marginVertical: 4, lineHeight: 18 },
});
