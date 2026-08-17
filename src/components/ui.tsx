import React from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { colors, currency } from '../theme';

export const Screen: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
    {children}
  </ScrollView>
);

export const Card: React.FC<{
  title: string;
  accent?: keyof typeof colors;
  children: React.ReactNode;
}> = ({ title, accent = 'primary', children }) => (
  <View style={[styles.card, { borderLeftColor: colors[accent] }]}>
    <View style={[styles.cardTitleLine, { backgroundColor: colors[accent] }]} />
    <Text style={styles.cardTitle}>{title}</Text>
    {children}
  </View>
);

export const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Text style={styles.sectionTitle}>{children}</Text>
);

export const LabeledInput: React.FC<{
  label: string;
  placeholder?: string;
  value: string;
  onChange: (t: string) => void;
  flex?: number;
  keyboardType?: 'default' | 'numeric';
}> = ({ label, placeholder, value, onChange, flex = 1, keyboardType = 'default' }) => {
  const { width } = useWindowDimensions();
  const isSmall = width < 360;
  return (
    <View style={[styles.col, { flex }, isSmall && styles.colFull]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.sub}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
      />
    </View>
  );
};

export const AddButton: React.FC<{ title: string; onPress: () => void; color?: string }> = ({
  title,
  onPress,
  color = colors.primary,
}) => (
  <Pressable
    style={({ pressed }) => [styles.addBtn, { backgroundColor: color }, pressed && styles.btnPressed]}
    onPress={onPress}
    android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
  >
    <Text style={styles.addBtnText}>{title}</Text>
  </Pressable>
);

export const DangerButton: React.FC<{ title: string; onPress: () => void }> = ({
  title,
  onPress,
}) => (
  <Pressable
    style={({ pressed }) => [styles.delBtn, pressed && styles.btnPressed]}
    onPress={onPress}
    android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
  >
    <Text style={styles.delBtnText}>{title}</Text>
  </Pressable>
);

export const ListRow: React.FC<{
  left: React.ReactNode;
  right?: React.ReactNode;
  onDelete?: () => void;
}> = ({ left, right, onDelete }) => (
  <View style={styles.itemRow}>
    <View style={styles.itemLeft}>
      {left}
      {right ? <Text style={styles.itemRight}> {right}</Text> : null}
    </View>
    {onDelete ? (
      <Pressable
        style={({ pressed }) => [styles.delBtnSmall, pressed && styles.btnPressed]}
        onPress={onDelete}
        android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
      >
        <Text style={styles.delBtnSmallText}>删除</Text>
      </Pressable>
    ) : null}
  </View>
);

export const ResultBox: React.FC<{
  children: React.ReactNode;
  accent?: keyof typeof colors;
}> = ({ children, accent = 'primary' }) => (
  <View style={[styles.resultBox, { borderLeftColor: colors[accent] }]}>{children}</View>
);

export const Tile: React.FC<{
  label: string;
  value: string;
  color?: string;
  topColor?: string;
}> = ({ label, value, color = colors.primary, topColor = colors.primary }) => (
  <View style={[styles.tile, { borderTopColor: topColor }]}>
    <Text style={styles.tileLabel}>{label}</Text>
    <Text style={[styles.tileValue, { color }]}>{value}</Text>
  </View>
);

export const CardItem: React.FC<{
  title: string;
  subtitle?: string;
  lines?: string[];
  onDelete?: () => void;
}> = ({ title, subtitle, lines = [], onDelete }) => (
  <View style={styles.cardItem}>
    <View style={styles.cardItemHeader}>
      <View style={styles.cardItemTitleBox}>
        <Text style={styles.cardItemTitle} numberOfLines={1} ellipsizeMode="tail">
          {title}
        </Text>
        {subtitle ? <Text style={styles.cardItemSubtitle}>{subtitle}</Text> : null}
      </View>
      {onDelete ? (
        <Pressable
          style={({ pressed }) => [styles.cardItemDelBtn, pressed && styles.btnPressed]}
          onPress={onDelete}
          android_ripple={{ color: 'rgba(255,255,255,0.2)' }}
        >
          <Text style={styles.cardItemDelText}>删除</Text>
        </Pressable>
      ) : null}
    </View>
    {lines.map((line, idx) => (
      <Text key={idx} style={styles.cardItemLine}>{line}</Text>
    ))}
  </View>
);

// 兼容旧名：收入模块之前用的 JobItem
export const JobItem = CardItem;

export const Stat: React.FC<{
  label: string;
  value: string;
  color?: string;
  bold?: boolean;
}> = ({ label, value, color = colors.textStrong, bold }) => (
  <Text style={styles.statLine}>
    {label}{' '}
    <Text style={[styles.statValue, { color, fontWeight: bold ? '700' : '400' }]}>{value}</Text>
  </Text>
);

export const MainButton: React.FC<{
  title: string;
  onPress: () => void;
  color?: string;
  outline?: boolean;
}> = ({ title, onPress, color = colors.primary, outline = false }) => (
  <Pressable
    style={({ pressed }) => [
      styles.mainBtn,
      outline ? { borderWidth: 1.5, borderColor: color } : { backgroundColor: color },
      pressed && styles.btnPressed,
    ]}
    onPress={onPress}
    android_ripple={{ color: outline ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.2)' }}
  >
    <Text style={[styles.mainBtnText, { color: outline ? color : '#fff' }]}>{title}</Text>
  </Pressable>
);

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  screenContent: { padding: 14, paddingBottom: 50, gap: 14 },

  card: {
    backgroundColor: colors.card,
    borderRadius: 18,
    padding: 18,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    overflow: 'hidden',
  },
  cardTitleLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  cardTitle: { fontSize: 17, fontWeight: '800', color: colors.textStrong, marginBottom: 14 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.sub, marginTop: 8, marginBottom: 8 },

  col: { minWidth: 100, marginRight: 10, marginBottom: 10 },
  colFull: { minWidth: '100%', marginRight: 0 },
  label: { fontSize: 13, fontWeight: '700', color: colors.sub, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    backgroundColor: colors.white,
    color: colors.text,
  },

  addBtn: {
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 12,
    alignSelf: 'stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  delBtn: {
    backgroundColor: colors.red,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  delBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  mainBtn: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  mainBtnText: { fontWeight: '700', fontSize: 15 },

  btnPressed: { opacity: 0.85 },

  delBtnSmall: {
    backgroundColor: colors.red,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 8,
  },
  delBtnSmallText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  itemLeft: { flex: 1, flexWrap: 'wrap', paddingRight: 8 },
  itemRight: { fontSize: 14, color: colors.sub, marginTop: 2 },

  cardItem: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  cardItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardItemTitleBox: { flex: 1, marginRight: 10 },
  cardItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textStrong,
  },
  cardItemSubtitle: { fontSize: 13, color: colors.sub, marginTop: 2 },
  cardItemLine: { fontSize: 14, color: colors.sub, marginTop: 6 },
  cardItemDelBtn: {
    backgroundColor: colors.red,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 2,
  },
  cardItemDelText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  resultBox: {
    backgroundColor: colors.navyBg,
    padding: 14,
    borderRadius: 12,
    marginTop: 12,
    borderLeftWidth: 4,
  },

  tile: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: colors.border,
    borderTopWidth: 4,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: 90,
  },
  tileLabel: { fontSize: 12, color: colors.sub, marginBottom: 4, textAlign: 'center' },
  tileValue: { fontSize: 17, fontWeight: '800', textAlign: 'center' },

  statLine: { fontSize: 15, marginVertical: 5, color: colors.text, lineHeight: 22 },
  statValue: { fontSize: 15 },
});
