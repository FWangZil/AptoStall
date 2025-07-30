# 🚀 Testnet 部署总结

## 📋 部署信息

### 合约地址
- **新合约地址**: `0xb15f83bd5438cfee66d84f1d25c3c3778a6c6fcd242601b18740b2f3656a4345`
- **网络**: Aptos Testnet
- **部署交易**: [查看交易](https://explorer.aptoslabs.com/txn/0x2b629f4f44d35d734e85c6a0e19d93a6e01160db1e28a79ad6dbd5e14c34c87f?network=testnet)

### 合约模块
1. **marketplace**: 主要的市场合约
   - `create_stall`: 创建摊位
   - `list_item`: 列出物品
   - `buy`: 购买物品
   - 视图函数: `is_listed`, `get_price`, `get_stall_owner`, `is_object_transferable`

2. **test_nft**: 测试 NFT 合约
   - `create_test_nft`: 创建测试 NFT

## 🔧 前端配置更新

### 环境变量
```env
VITE_APTOS_NODE_URL=https://api.testnet.aptoslabs.com/v1
VITE_APTOS_NETWORK=testnet
VITE_MODULE_ADDRESS=0xb15f83bd5438cfee66d84f1d25c3c3778a6c6fcd242601b18740b2f3656a4345
```

### 更新的文件
- `app/.env`
- `app/.env.example`
- `Move.toml`

## ✨ 新功能特性

### 1. 改进的错误处理
- ✅ 更友好的错误消息
- ✅ 特定错误类型检测（E_KIOSK_NOT_FOUND, ungated transfers）
- ✅ 用户指导和解决建议

### 2. 对象转移能力检查
- ✅ 合约级别的转移能力验证
- ✅ 前端显示"Transferable"标签
- ✅ 列出物品前的警告提示

### 3. 调试工具
- ✅ StallDebugCard 组件
- ✅ 显示当前摊位状态
- ✅ 清理数据功能

### 4. 资源账户地址计算
- ✅ 正确的 SHA3-256 哈希计算
- ✅ 从交易事件获取地址
- ✅ 备用地址计算方法

## 🎯 使用指南

### 1. 连接钱包
- 使用 Petra 钱包或其他支持的钱包
- 确保钱包连接到 Testnet 网络

### 2. 创建摊位
- 点击"Create Stall"按钮
- 输入唯一的种子值
- 等待交易确认

### 3. 创建测试 NFT
- 使用"Create Test NFT"功能
- 创建支持转移的测试资产

### 4. 列出物品
- 选择标有"Transferable"的资产
- 设置价格（以 APT 为单位）
- 确认交易

### 5. 购买物品
- 浏览可用的列表
- 点击"Buy"按钮
- 确认支付交易

## 🔍 故障排除

### E_KIOSK_NOT_FOUND 错误
1. 使用调试卡片检查摊位状态
2. 点击"Clear Stall Data & Start Fresh"
3. 重新创建摊位

### ungated transfers 错误
1. 确保选择标有"Transferable"的资产
2. 使用"Create Test NFT"创建可转移的测试资产
3. 检查资产的转移权限

## 📱 访问应用

- **本地开发**: http://localhost:3000
- **合约浏览器**: [Aptos Explorer](https://explorer.aptoslabs.com/account/0xb15f83bd5438cfee66d84f1d25c3c3778a6c6fcd242601b18740b2f3656a4345?network=testnet)

## 🎉 部署成功！

合约已成功部署到 Aptos Testnet，前端配置已更新。现在可以开始测试完整的市场功能了！
