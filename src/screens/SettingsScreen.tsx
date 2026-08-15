import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Alert, Share, StyleSheet, useWindowDimensions } from 'react-native';
import { Screen, Card, LabeledInput, AddButton, DangerButton, ListRow, ResultBox } from '../components/ui';
import { useStore, useComputed } from '../store';
import { colors } from '../theme';
import type { AppData } from '../types';
import * as sync from '../sync/supabaseSync';

export default function SettingsScreen() {
  const r = useComputed();
  const totalGoal = useStore((s) => s.totalGoal);
  const setTotalGoal = useStore((s) => s.setTotalGoal);
  const years = useStore((s) => s.years);
  const addYear = useStore((s) => s.addYear);
  const delYear = useStore((s) => s.delYear);
  const replaceAll = useStore((s) => s.replaceAll);

  const [goalText, setGoalText] = useState(String(totalGoal));
  const [yearLabel, setYearLabel] = useState('');
  const [importText, setImportText] = useState('');
  const { width } = useWindowDimensions();
  const isSmall = width < 380;

  // 云同步相关
  const [cfgUrl, setCfgUrl] = useState('');
  const [cfgKey, setCfgKey] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [syncStatus, setSyncStatus] = useState('未配置');
  const [loggedEmail, setLoggedEmail] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const cfg = await sync.loadConfig();
      if (cfg) {
        setCfgUrl(cfg.url);
        setCfgKey(cfg.anonKey);
        setSyncStatus('已配置，未登录');
      }
      const e = await sync.getSessionEmail();
      if (e) {
        setLoggedEmail(e);
        setSyncStatus(`已登录：${e}`);
      }
    })();
  }, []);

  // 总目标输入实时保存
  const onGoalChange = (t: string) => {
    setGoalText(t);
    const v = parseFloat(t);
    if (!isNaN(v) && v >= 0) setTotalGoal(v);
  };

  const onAddYear = () => {
    const label = yearLabel.trim();
    if (!label) {
      Alert.alert('提示', '请输入年份标签');
      return;
    }
    addYear(label);
    setYearLabel('');
  };

  const onExport = async () => {
    const s = useStore.getState();
    const data: AppData = {
      totalGoal: s.totalGoal,
      jobs: s.jobs,
      assets: s.assets,
      expenses: s.expenses,
      bigItems: s.bigItems,
      years: s.years,
    };
    try {
      await Share.share({ message: JSON.stringify(data, null, 2), title: '澳洲攒钱计划备份' });
    } catch (e) {
      Alert.alert('导出失败', String(e));
    }
  };

  const onImport = () => {
    try {
      const parsed = JSON.parse(importText) as AppData;
      if (!Array.isArray(parsed.jobs) || !Array.isArray(parsed.expenses)) {
        throw new Error('格式不正确');
      }
      replaceAll({
        totalGoal: Number(parsed.totalGoal) || 0,
        jobs: parsed.jobs,
        assets: parsed.assets || [],
        expenses: parsed.expenses,
        bigItems: parsed.bigItems || [],
        years: parsed.years || [],
      });
      setImportText('');
      Alert.alert('导入成功', '已用备份覆盖当前数据');
    } catch (e) {
      Alert.alert('导入失败', '请检查 JSON 格式是否正确');
    }
  };

  const onSaveCfg = async () => {
    if (!cfgUrl || !cfgKey) {
      Alert.alert('提示', '请填写 Supabase 地址和 Key');
      return;
    }
    await sync.configure(cfgUrl.trim(), cfgKey.trim());
    setSyncStatus('已配置，未登录');
    Alert.alert('已保存', 'Supabase 配置已保存');
  };

  const onSignUp = async () => {
    const err = await sync.signUp(email.trim(), password);
    if (err) Alert.alert('注册失败', err);
    else {
      setLoggedEmail(email.trim());
      setSyncStatus(`已登录：${email}`);
      Alert.alert('注册成功', '请用同一账号在另一台手机登录以同步');
    }
  };

  const onSignIn = async () => {
    const err = await sync.signIn(email.trim(), password);
    if (err) Alert.alert('登录失败', err);
    else {
      setLoggedEmail(email.trim());
      setSyncStatus(`已登录：${email}`);
    }
  };

  const onPush = async () => {
    const s = useStore.getState();
    const data: AppData = {
      totalGoal: s.totalGoal, jobs: s.jobs, assets: s.assets,
      expenses: s.expenses, bigItems: s.bigItems, years: s.years,
    };
    const err = await sync.pushState(data);
    setSyncStatus(err ? `推送失败：${err}` : `已推送 ${new Date().toLocaleTimeString()}`);
    if (err) Alert.alert('同步失败', err);
  };

  const onPull = async () => {
    const res = await sync.pullState();
    if (res.error) {
      Alert.alert('拉取失败', res.error);
      return;
    }
    if (res.data) {
      replaceAll(res.data);
      Alert.alert('拉取成功', '已用云端数据覆盖本机');
    } else {
      Alert.alert('云端暂无数据', '请先在一台设备上推送');
    }
  };

  const onSignOut = async () => {
    await sync.signOut();
    setLoggedEmail(null);
    setSyncStatus('已配置，未登录');
  };

  return (
    <Screen>
      <Card title="长期攒钱总目标平摊" accent="primary">
        <LabeledInput label="自定义长期攒钱总目标 (AUD)" placeholder="例如 150000" value={goalText} onChange={onGoalChange} keyboardType="numeric" />
        <ResultBox accent="primary">
          <Text style={{ fontSize: 15, lineHeight: 22 }}>
            平摊基准 <Text style={{ fontWeight: '800' }}>1095 天</Text> (365×3){'\n'}
            每天雷打不动必须攒下：<Text style={{ fontWeight: '800', color: colors.redDark }}>${r.goalDay.toFixed(2)} AUD / 天</Text>
          </Text>
        </ResultBox>
      </Card>

      <Card title="自定义年份投影管理" accent="green">
        <View style={[styles.row, isSmall && styles.rowCol]}>
          <TextInput
            style={[styles.input, { flex: isSmall ? 1 : 2 }]}
            placeholder="输入年份，如 2029"
            placeholderTextColor={colors.sub}
            value={yearLabel}
            onChangeText={setYearLabel}
          />
          <AddButton title="添加年份" onPress={onAddYear} color={colors.green} />
        </View>
        {years.length === 0 ? (
          <Text style={styles.empty}>暂无任何年份</Text>
        ) : (
          years.map((y) => (
            <ListRow key={y.id} left={<Text style={{ fontWeight: '700' }}>{y.label}</Text>} onDelete={() => delYear(y.id)} />
          ))
        )}
      </Card>

      <Card title="备份 / 换手机迁移（本机导出导入）" accent="navy">
        <Text style={styles.note}>导出会把全部数据生成一份 JSON，通过系统分享保存到备忘录/文件；换手机后粘贴进来即可恢复。</Text>
        <View style={[styles.btnRow, isSmall && styles.btnRowCol]}>
          <DangerButton title="导出备份" onPress={onExport} />
          <AddButton title="导入备份" onPress={onImport} />
        </View>
        <TextInput
          style={[styles.input, { height: 100, marginTop: 12, textAlignVertical: 'top' }]}
          placeholder="在此粘贴备份 JSON 后点“导入备份”"
          placeholderTextColor={colors.sub}
          value={importText}
          onChangeText={setImportText}
          multiline
        />
      </Card>

      <Card title="云同步（Supabase，可选）" accent="primary">
        <Text style={styles.note}>在 Supabase 建项目并在 SQL Editor 执行 schema.sql 后，填入下方地址与 anon key。两台手机登录同一账号即可实时共享数据。</Text>
        <LabeledInput label="Supabase URL" placeholder="https://xxxx.supabase.co" value={cfgUrl} onChange={setCfgUrl} flex={2} />
        <LabeledInput label="anon public key" placeholder="eyJ..." value={cfgKey} onChange={setCfgKey} flex={2} />
        <AddButton title="保存 Supabase 配置" onPress={onSaveCfg} />

        <View style={styles.sep} />

        <LabeledInput label="邮箱" placeholder="you@example.com" value={email} onChange={setEmail} flex={2} />
        <LabeledInput label="密码 (≥6位)" placeholder="密码" value={password} onChange={setPassword} flex={1} />

        <View style={[styles.btnRow, isSmall && styles.btnRowCol]}>
          <AddButton title="注册" onPress={onSignUp} color={colors.green} />
          <AddButton title="登录" onPress={onSignIn} />
          <DangerButton title="登出" onPress={onSignOut} />
        </View>

        <View style={styles.sep} />
        <Text style={styles.status}>{syncStatus}</Text>
        <View style={[styles.btnRow, isSmall && styles.btnRowCol]}>
          <AddButton title="推送本机到云端" onPress={onPush} color={colors.green} />
          <AddButton title="从云端拉取" onPress={onPull} color={colors.amber} />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  rowCol: { flexDirection: 'column', alignItems: 'stretch' },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    backgroundColor: colors.white,
    color: colors.text,
  },
  empty: { color: colors.sub, paddingVertical: 10 },
  note: { fontSize: 13, color: colors.sub, marginBottom: 12, lineHeight: 20 },
  btnRow: { flexDirection: 'row', gap: 10, marginTop: 10, flexWrap: 'wrap' },
  btnRowCol: { flexDirection: 'column' },
  sep: { height: 1, backgroundColor: colors.divider, marginVertical: 16 },
  status: { fontSize: 14, fontWeight: '700', color: colors.primaryDark, marginBottom: 10 },
});
