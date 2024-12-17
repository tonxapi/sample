## 使用方法

1. 安裝依賴：
```bash
pnpm install
```

2. 在 `App.tsx` 中設定您的 API 金鑰：
```typescript
const client = new TONXJsonRpcProvider({
  network: "testnet ", // testnet or mainnet
  apiKey: "YOUR API KEY"  // 替換為您的 API 金鑰
});
```

3. 設定要查詢的 NFT 地址：
```typescript
const nftAddress = "EQAc4jcphnAeLQ_wmS7e4leWghFysRI_VKUCR0jhiVDX9hXn";  // 替換為要查詢的地址
```

4. 執行程式
```bash
pnpm dev
```