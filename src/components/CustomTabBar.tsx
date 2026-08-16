import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CommonActions } from '@react-navigation/native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors } from '../theme';

// 把 "📊 看板" 这种字符串拆成 [图标 emoji, 文字]，方便上下排布
function isEmoji(ch: string): boolean {
  const cp = ch.codePointAt(0) ?? 0;
  return (
    (cp >= 0x1f000 && cp <= 0x1ffff) || // 补充平面 emoji
    (cp >= 0x2600 && cp <= 0x27bf) || // 杂项符号与箭头
    (cp >= 0x2b00 && cp <= 0x2bff) || // 杂项符号和箭头
    (cp >= 0x1f1e6 && cp <= 0x1f1ff) || // 区域指示符（国旗）
    (cp >= 0x2190 && cp <= 0x21ff) // 箭头
  );
}

function splitEmojiLabel(s: string): { icon?: string; text: string } {
  const parts = Array.from(s);
  if (parts.length > 0 && isEmoji(parts[0])) {
    const icon = parts[0];
    const text = parts.slice(1).join('').replace(/^\s+/, '');
    return { icon, text: text || s };
  }
  return { text: s };
}

export default function CustomTabBar({ state, navigation, descriptors }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    // 整条栏不用库的自适应高度，固定由 item 撑开；底部安全区留白防贴手势条
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = index === state.index;

        const rawLabel =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : ((options.title as string) ?? route.name);
        const { icon, text } = splitEmojiLabel(rawLabel);

        const color = focused ? colors.primary : colors.sub;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.dispatch(
              CommonActions.navigate({ name: route.name, merge: true })
            );
          }
        };
        const onLongPress = () => {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: focused }}
            style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          >
            {icon ? <Text style={[styles.icon, { color }]}>{icon}</Text> : null}
            <Text style={[styles.label, { color }]} numberOfLines={1}>
              {text}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', // 关键：按钮在格子里垂直居中
    paddingVertical: 6,
  },
  itemPressed: {
    opacity: 0.55,
  },
  icon: {
    fontSize: 22,
    lineHeight: 24,
    marginBottom: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
  },
});
