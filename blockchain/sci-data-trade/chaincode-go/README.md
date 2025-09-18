# SciDataHub 数据交易智能合约

## 项目概述

SciDataHub 数据交易智能合约是基于 Hyperledger Fabric 开发的区块链智能合约，专门用于科学数据的安全交易和管理。该合约实现了用户管理、数据集管理、订单管理等核心功能，支持基于代币的数据交易机制。

## 技术栈

- **区块链平台**: Hyperledger Fabric
- **开发语言**: Go 1.24.0
- **合约框架**: Hyperledger Fabric Contract API v2.2.0
- **测试框架**: Testify v1.11.1

## 项目结构

```
chaincode-go/
├── chaincode/              # 智能合约核心代码
│   ├── chaincode.go        # 主合约入口和初始化
│   ├── user.go            # 用户管理功能
│   ├── dataset.go         # 数据集管理功能
│   ├── order.go           # 订单管理功能
│   ├── utils.go           # 工具函数
│   ├── mocks/             # 测试模拟对象
│   └── *_test.go          # 单元测试文件
├── sciDataTrade.go        # 合约启动入口
├── go.mod                 # Go模块依赖
├── go.sum                 # 依赖校验文件
└── vendor/                # 第三方依赖
```

## 核心功能模块

### 1. 用户管理 (user.go)

#### 数据结构
```go
type User struct {
    Username           string `json:"username"`           // 用户名
    TokenBalance       int    `json:"tokenBalance"`       // 可用代币余额
    LockedTokenBalance int    `json:"lockedTokenBalance"` // 锁定代币余额
}
```

#### 主要接口
- `AddUser(username, tokenBalance)` - 添加新用户
- `GetUser(username)` - 获取用户信息
- `GetTokenBalance(username)` - 获取用户代币余额
- `GetLockedTokenBalance(username)` - 获取用户锁定代币余额
- `SetTokenBalance(username, balance)` - 设置用户代币余额
- `AddTokenBalance(username, balance)` - 增加用户代币余额
- `TransferLockedTokenBalance(username, balance)` - 将代币转移到锁定余额

### 2. 数据集管理 (dataset.go)

#### 数据结构
```go
type Dataset struct {
    Hash  string `json:"hash"`  // 数据集哈希值（唯一标识）
    Owner string `json:"owner"` // 数据集所有者
}
```

#### 主要接口
- `AddDataset(hash, owner)` - 添加新数据集
- `GetDataset(hash)` - 获取数据集信息
- `GetDatasetOwner(hash)` - 获取数据集所有者
- `GetAllDatasets()` - 获取所有数据集

### 3. 订单管理 (order.go)

#### 数据结构
```go
type Order struct {
    ID           string `json:"id"`           // 订单ID
    DatasetHash  string `json:"datasetHash"`  // 数据集哈希
    HashChainEnd string `json:"hashChainEnd"` // 哈希链终点
    TokenUnit    int    `json:"tokenUnit"`    // 代币单价
    Buyer        string `json:"buyer"`        // 买方用户名
    Seller       string `json:"seller"`       // 卖方用户名
    Status       string `json:"status"`       // 订单状态 (pending/completed/cancelled)
    Timestamp    int64  `json:"timestamp"`    // 创建时间戳
}
```

#### 主要接口
- `CreateOrder(datasetHash, hashChainEnd, tokenUnit, buyer, seller)` - 创建新订单
- `GetOrder(orderID)` - 获取订单信息
- `UpdateOrderStatus(orderID, status)` - 更新订单状态
- `CompleteOrder(orderID, preImage)` - 完成订单交易
- `GetAllOrders()` - 获取所有订单

### 4. 工具函数 (utils.go)

#### 主要功能
- `RandStr(length)` - 生成随机字符串
- `GenerateHashChain(length)` - 生成哈希链
- `ComputeSha256Times(preImage, hash)` - 计算SHA256哈希次数

## 合约初始化

合约在部署时会自动初始化以下数据：

### 演示用户
- `demoDataRequester` - 数据请求者（初始代币：100）
- `demoDataOwner` - 数据拥有者（初始代币：100）

### 演示数据集
- 预置25个数据集，所有者为 `demoDataOwner`
- 每个数据集都有唯一的SHA256哈希标识

## 交易流程

### 1. 数据交易流程
1. **数据集注册**: 数据拥有者调用 `AddDataset` 注册数据集
2. **订单创建**: 数据请求者调用 `CreateOrder` 创建购买订单
3. **代币锁定**: 买方调用 `TransferLockedTokenBalance` 锁定足够的代币
4. **订单完成**: 卖方提供预映像，调用 `CompleteOrder` 完成交易
5. **代币转移**: 系统自动将锁定的代币转移给卖方

### 2. 哈希链验证机制
- 使用哈希链技术确保数据交付的完整性
- 买方提供预映像，系统验证哈希链的正确性
- 根据哈希链长度计算实际交易金额

## API 接口详细说明

### 用户管理接口

#### AddUser
```
功能: 添加新用户
参数: 
  - username (string): 用户名
  - tokenBalance (int): 初始代币余额
返回: error
```

#### GetUser
```
功能: 获取用户信息
参数: 
  - username (string): 用户名
返回: (*User, error)
```

#### GetTokenBalance
```
功能: 获取用户可用代币余额
参数: 
  - username (string): 用户名
返回: (int, error)
```

#### TransferLockedTokenBalance
```
功能: 将代币转移到锁定余额（用于订单担保）
参数: 
  - username (string): 用户名
  - balance (int): 锁定金额
返回: error
```

### 数据集管理接口

#### AddDataset
```
功能: 添加新数据集
参数: 
  - hash (string): 数据集哈希值
  - owner (string): 数据集所有者
返回: error
```

#### GetDataset
```
功能: 获取数据集信息
参数: 
  - hash (string): 数据集哈希值
返回: (*Dataset, error)
```

#### GetAllDatasets
```
功能: 获取所有数据集
参数: 无
返回: ([]*Dataset, error)
```

### 订单管理接口

#### CreateOrder
```
功能: 创建数据交易订单
参数: 
  - datasetHash (string): 数据集哈希
  - hashChainEnd (string): 哈希链终点
  - tokenUnit (int): 代币单价
  - buyer (string): 买方用户名
  - seller (string): 卖方用户名
返回: (string, error) - 返回订单ID
```

#### CompleteOrder
```
功能: 完成订单交易
参数: 
  - orderID (string): 订单ID
  - preImage (string): 哈希链预映像
返回: error
```

#### GetOrder
```
功能: 获取订单详情
参数: 
  - orderID (string): 订单ID
返回: (*Order, error)
```

## 安全特性

### 1. 权限控制
- 只有数据集所有者才能作为卖方创建订单
- 用户只能操作自己的代币余额
- 订单状态变更有严格的状态机控制

### 2. 资金安全
- 代币锁定机制防止双重支付
- 交易完成前买方资金被锁定
- 哈希链验证确保数据完整性后才释放资金

### 3. 数据完整性
- 使用SHA256哈希链验证数据完整性
- 防止数据篡改和不完整交付
- 订单状态不可逆转（已完成的订单无法取消）

## 部署和使用

### 1. 环境要求
- Go 1.24.0+
- Hyperledger Fabric 网络
- 支持 Contract API v2.2.0

### 2. 编译部署
```bash
# 安装依赖
go mod tidy

# 运行测试
go test ./chaincode/...

# 编译合约
go build -o sciDataTrade sciDataTrade.go
```

### 3. 合约部署
```bash
# 打包合约
peer lifecycle chaincode package sciDataTrade.tar.gz --path . --lang golang --label sciDataTrade_1.0

# 安装合约
peer lifecycle chaincode install sciDataTrade.tar.gz

# 批准合约定义
peer lifecycle chaincode approveformyorg --channelID mychannel --name sciDataTrade --version 1.0 --package-id <PACKAGE_ID> --sequence 1

# 提交合约定义
peer lifecycle chaincode commit --channelID mychannel --name sciDataTrade --version 1.0 --sequence 1
```

## 测试

项目包含完整的单元测试，覆盖所有核心功能：

```bash
# 运行所有测试
go test ./chaincode/... -v

# 运行特定测试
go test ./chaincode/ -run TestAddUser -v

# 查看测试覆盖率
go test ./chaincode/... -cover
```