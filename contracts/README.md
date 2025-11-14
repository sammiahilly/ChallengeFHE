# ChallengeFHE Contracts

## 环境变量 (.env)

- PRIVATE_KEY=你的私钥（提供者已给）
- SEPOLIA_RPC=https://ethereum-sepolia-rpc.publicnode.com
- ETHERSCAN_API_KEY=你的 Etherscan KEY（提供者已给）

## 安装与编译

```
npm install
npm run build
```

## 部署到 Sepolia

```
npm run deploy:sepolia
```

部署成功后请记录合约地址，前端需要设置 `NEXT_PUBLIC_SEPOLIA_CHALLENGE_ADDRESS`。

## 验证合约（可选）

部署脚本会尝试在 5 个区块后自动验证；也可以手动：

```
npx hardhat verify --network sepolia <DEPLOYED_ADDRESS>
```


