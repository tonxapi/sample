## 使用方法

1. 安裝依賴：
```bash
npm install @tonx/core
```

2. 在 `App.tsx` 中設定您的 API 金鑰：
```typescript
const client = new TONXJsonRpcProvider({
  network: "mainnet",
  apiKey: "YOUR API KEY"  // 替換為您的 API 金鑰
});
```

3. 設定要查詢的 USDT 地址：
```typescript
const myUsdtAddress = "UQBm2-oK4u9CP56wS4LaPUWV-meDmNnSaD9Jlt-FyRHoBimJ";  // 替換為要查詢的地址
```