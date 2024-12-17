## 使用方法

1. 安裝依賴：
```bash
pnpm install
```

2. 在 `.env` 中設定您的 API 金鑰：
```typescript
VITE_TONXAPI_KEY=YOUR_API_KEY
```
3. 在App.tsx中設定您的錢包私鑰：
```typescript
const MNEMONIC = ["your", "mnemonics"]
```typescript

４. Need to specify the version (v4) of the wallet used in the code：
```typescript
const myTonAddress = "EQDi1eWU3HWWst8owY8OMq2Dz9nJJEHUROza8R-_wEGb8yu6";  // 替換為要查詢的地址
```

4. 執行程式
```bash
pnpm dev
```