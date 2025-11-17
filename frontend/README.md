# ChallengeFHE Frontend

基于 Next.js + Tailwind，前端自动在本地链 (31337) 使用 FHEVM Mock，与 Sepolia (11155111) 使用 Relayer SDK。

## 环境变量 (.env.local)

- NEXT_PUBLIC_SEPOLIA_CHALLENGE_ADDRESS=在合约部署后填入地址
- NEXT_PUBLIC_LOCAL_CHALLENGE_ADDRESS=本地部署地址（可选）
- PINATA_API_KEY=可选，Pinata API Key（仅服务端使用）
- PINATA_SECRET_KEY=可选，Pinata Secret Key（仅服务端使用）
- PINATA_JWT=可选，Pinata JWT（仅服务端使用，API Key 未配置时使用）

## 本地开发

```
npm install
npm run dev
```

打开 http://localhost:3100

## 使用说明

1. 连接 MetaMask，选择 Hardhat (31337) 或 Sepolia。
2. 点击 Create Sample / Join / Refresh Handle / Decrypt / Check-in 体验闭环。
3. 上传文件到 IPFS 通过服务端 API 转发完成，前端不再读取任何密钥。


