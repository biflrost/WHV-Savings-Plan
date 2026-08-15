// 简单的本地唯一 ID 生成器（不依赖 crypto，Hermes 兼容）
export function genId(): string {
  return (
    Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  );
}
