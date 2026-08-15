# 澳洲攒钱计划 App（安卓 + iOS）

把网页版「澳洲 WHV 真实收支与钱袋子无限年份动态投影系统」做成**真正的手机 App**：
一套 React Native (Expo) 代码，同时出安卓 APK 和苹果 IPA。
数据存在**手机本地数据库**（不再丢），并可选择性开启**云端同步**（安卓/iPhone 共享同一份数据）。

---

## 功能（与原网页一一对应）

| 模块 | 说明 |
|---|---|
| 📊 看板 | 今日任意支配额度（零花钱）= 每日实际盈余 − 每日死目标；含钱袋子短周期蓄水池、无限年份投影、达标/缺口报告、每日/每周收支核算 |
| 💰 收入 | 多份工作录入（周薪/日薪 + 时长），ATO 阶梯累进税(15%/30%/37%/45%)，算税后日净收入 |
| 🛵 抵税 | ABN 资产按商用比例+分摊天数，算每日现金流出与预计退税 |
| 🏠 生活 | 每周固定开销，平摊到每日 |
| 🛒 大件 | 一次性大额消费分期，算每日隐形账单 |
| ⚙️ 设置 | 长期攒钱总目标、年份管理、备份导出/导入、云同步配置 |

核心公式（与网页一致）：
> 今日零花钱 = (税后日净收入 − 每日总花销) − (总目标 ÷ 1095天)

---

## 本地运行（开发预览）

```bash
cd australia-savings-app
npm install
npx expo start
```
- 手机装 **Expo Go** App，扫终端里的二维码即可在真机预览。
- 或按 `a` 开安卓模拟器、`i` 开 iOS 模拟器（iOS 模拟器需 Mac）。

---

## 打包成可安装的 App

### 安卓 APK / AAB（无需 Mac）
```bash
# 首次使用先登录 EAS
npx eas login
npx eas build -p android --profile preview   # 出 APK，可直接装
# 或 production 出 AAB 上架 Google Play
```
（记得把 `app.json` 里的 `android.package` 改成你自己的，如 `com.yourname.australiasavings`）

### 苹果 IPA（无需 Mac，用 EAS 云构建）
```bash
npx eas build -p ios --profile production
```
- **必须**有 Apple 开发者账号（$99/年），在 EAS 后台关联证书。
- EAS 在云端完成编译，没有 Mac 也能出 IPA，再用 TestFlight / 直接分发安装。
- 记得改 `app.json` 里的 `ios.bundleIdentifier`（如 `com.yourname.australiasavings`）。

> 本地出包（Android Studio / Xcode）也支持，但 EAS 云构建对没 Mac 的用户最省事。

---

## 数据持久化（解决你最担心的“换了就没了”）

- 网页数据存在浏览器 `localStorage`，换浏览器/清缓存即丢。
- App 改用 **AsyncStorage（手机本地存储）**：关 App、重开、甚至重装（同一台设备）数据都还在，与浏览器完全隔离。

## 换手机迁移（本机方式）

设置页 → **导出备份**：把全部数据生成一份 JSON，通过系统分享存到备忘录/文件/微信。
新手机装好 App → 设置页粘贴 JSON → **导入备份** 即可恢复。

## 云同步（安卓 + iPhone 实时共享，可选）

1. 去 [supabase.com](https://supabase.com) 免费建项目。
2. 在 Supabase 控制台 **SQL Editor** 执行本项目 `src/sync/schema.sql`（建表 + 行级权限）。
3. 设置页「云同步」填入项目 URL 和 anon public key → 保存。
4. 注册/登录账号 → **推送本机到云端**；另一台手机登录同一账号 → **从云端拉取**。
5. 同步策略为 last-write-wins（谁后存谁覆盖），适合个人单用户使用。

---

## 目录结构

```
australia-savings-app/
├─ App.tsx                 # 底部 Tab 导航入口
├─ src/
│  ├─ types.ts             # 数据类型
│  ├─ engine/              # 纯计算引擎（与网页逻辑一致，可单测）
│  │  ├─ tax.ts            # ATO 阶梯税率
│  │  ├─ calculator.ts     # 核心计算
│  │  └─ calculator.test.ts# 引擎测试
│  ├─ store.ts             # zustand + AsyncStorage 持久化 & 派生计算
│  ├─ theme.ts             # 颜色/金额格式化
│  ├─ components/ui.tsx    # 复用 UI 组件
│  ├─ screens/             # 6 个页面
│  └─ sync/                # 可选 Supabase 云同步
│     ├─ supabaseSync.ts
│     └─ schema.sql
```

## 技术栈
React Native + Expo SDK 54 · React Navigation · zustand · @react-native-async-storage · @supabase/supabase-js · TypeScript

---

## 已发布 / 出包位置

- **本机项目目录（F 盘）**：`F:\澳洲攒钱计划`（已包含全部源码与配置，不含 `node_modules`，出包前需先 `npm install`）
- **GitHub 公开仓库**：https://github.com/biflrost/WHV-Savings-Plan
  ```bash
  git clone https://github.com/biflrost/WHV-Savings-Plan.git
  ```

### 一键出安卓 APK（在 F 盘目录或克隆目录里执行）

```bash
cd F:\澳洲攒钱计划        # 或 cd WHV-Savings-Plan（clone 下来的）
npm install              # F 盘副本不含依赖，需先安装
npx eas login            # 用你的 Expo 账号登录（没有就去 expo.dev 免费注册）
npm run build:android    # = npx eas build -p android --profile preview
```

- 构建在 **EAS 云端**完成（10~30 分钟），不需要 Mac。
- 构建结束后终端会给出一个 **APK 下载链接**，手机浏览器打开下载、直接安装即可。
- 出包前把 `app.json` 里的 `android.package` 改成你自己的（如 `com.yourname.australiasavings`），避免和他人冲突。
- 苹果 IPA：`npm run build:ios`（需 $99/年 Apple 开发者账号，在 EAS 后台关联证书）。

> 为什么我自己没法替你出 APK：EAS 云构建必须登录**你本人**的 Expo 账号并绑定付费/免费计划，涉及你的凭据，所以这一步只能由你在自己电脑上跑一条命令完成。代码、配置、仓库我都已备好。
