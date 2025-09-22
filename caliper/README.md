# SciDataHub Caliper 性能测试套件

本目录包含了为SciDataHub智能合约设计的完整性能测试套件，基于Hyperledger Caliper框架构建。

## 📁 目录结构

```
caliper/
├── benchmarks/           # 基准测试配置文件
├── workload/            # 工作负载模块
├── networks/            # 网络配置
├── package.json         # 依赖配置
└── README.md           # 本文档
```

## 🧪 测试套件概览

### 1. 专项功能测试

#### 用户管理测试 (`user-management-benchmark.yaml`)
- **测试范围**: AddUser, GetUser, GetTokenBalance, SetTokenBalance, TransferLockedTokenBalance
- **测试场景**: 
  - 用户创建性能测试 (20 TPS)
  - 用户查询性能测试 (50 TPS)
  - 代币余额操作测试 (15-60 TPS)
  - 混合用户操作测试 (30 TPS)
- **工作负载**: `workload/user-management-test.js`

#### 数据集管理测试 (`dataset-management-benchmark.yaml`)
- **测试范围**: AddDataset, GetDataset, GetDatasetOwner, GetAllDatasets
- **测试场景**:
  - 数据集创建性能测试 (25 TPS)
  - 数据集查询性能测试 (60 TPS)
  - 批量创建压力测试 (10-50 TPS 线性增长)
- **工作负载**: `workload/dataset-management-test.js`

#### 订单管理测试 (`order-management-benchmark.yaml`)
- **测试范围**: CreateOrder, GetOrder, UpdateOrderStatus, CompleteOrder, GetAllOrders
- **测试场景**:
  - 订单创建性能测试 (20 TPS)
  - 订单查询性能测试 (50 TPS)
  - 订单状态更新测试 (30 TPS)
  - 订单完成交易测试 (15 TPS)
  - 订单生命周期测试 (5-20 TPS 线性增长)
- **工作负载**: `workload/order-management-test.js`

### 2. 综合性能测试

#### 综合基准测试 (`comprehensive-benchmark.yaml`)
- **测试场景**:
  - 轻负载综合测试 (20 TPS, 120s)
  - 中等负载综合测试 (40 TPS, 120s)
  - 高负载综合测试 (30-80 TPS 线性增长, 120s)
  - 查询密集型测试 (100 TPS, 90s)
  - 写入密集型测试 (25 TPS, 90s)
  - 峰值负载测试 (50-120 TPS 复合增长, 180s)
- **工作负载**: `workload/comprehensive-test.js`

### 3. 压力测试

#### 压力测试基准 (`stress-test-benchmark.yaml`)
- **测试场景**:
  - 并发用户创建压力测试 (20-100 TPS)
  - 数据集批量创建压力测试 (30-80 TPS)
  - 订单处理压力测试 (15-60 TPS)
  - 查询性能极限测试 (200 TPS)
  - 混合操作极限测试 (30-120 TPS)
  - 系统恢复能力测试
- **工作负载**: 多个工作负载模块组合

## 🚀 快速开始

### 1. 环境准备

确保已安装以下依赖：
```bash
npm install
```

### 2. 运行单项测试

```bash
# 用户管理功能测试
npx caliper launch manager --caliper-workspace ./ --caliper-benchconfig benchmarks/user-management-benchmark.yaml --caliper-networkconfig networks/networkConfig.yaml

# 数据集管理功能测试
npx caliper launch manager --caliper-workspace ./ --caliper-benchconfig benchmarks/dataset-management-benchmark.yaml --caliper-networkconfig networks/networkConfig.yaml

# 订单管理功能测试
npx caliper launch manager --caliper-workspace ./ --caliper-benchconfig benchmarks/order-management-benchmark.yaml --caliper-networkconfig networks/networkConfig.yaml
```

### 3. 运行综合测试

```bash
# 综合性能基准测试
npx caliper launch manager --caliper-workspace ./ --caliper-benchconfig benchmarks/comprehensive-benchmark.yaml --caliper-networkconfig networks/networkConfig.yaml

# 压力测试
npx caliper launch manager --caliper-workspace ./ --caliper-benchconfig benchmarks/stress-test-benchmark.yaml --caliper-networkconfig networks/networkConfig.yaml
```

## 📊 工作负载模块详解

### 1. `user-management-test.js`
- **功能**: 专门测试用户管理相关函数
- **特性**: 
  - 支持多种测试类型 (addUser, getUser, getTokenBalance, setTokenBalance, transferLockedTokenBalance, mixed)
  - 预创建测试用户数据
  - 智能错误处理和重试机制

### 2. `dataset-management-test.js`
- **功能**: 专门测试数据集管理相关函数
- **特性**:
  - 动态生成数据集哈希值
  - 支持批量创建测试
  - 预创建测试数据集和用户

### 3. `order-management-test.js`
- **功能**: 专门测试订单管理相关函数
- **特性**:
  - 完整的订单生命周期测试
  - 自动生成哈希链和预映像
  - 智能用户和数据集关联

### 4. `comprehensive-test.js`
- **功能**: 综合测试所有智能合约功能
- **特性**:
  - 多种测试场景 (light, medium, heavy, query_intensive, write_intensive, peak_load)
  - 权重化操作选择
  - 大规模数据初始化
  - 真实业务场景模拟

## 📈 性能指标说明

### 关键指标
- **TPS (Transactions Per Second)**: 每秒事务处理数
- **延迟 (Latency)**: 事务处理延迟
- **成功率 (Success Rate)**: 事务成功执行比率
- **吞吐量 (Throughput)**: 系统整体处理能力

### 测试负载级别
- **轻负载**: 10-30 TPS，模拟日常使用
- **中等负载**: 30-60 TPS，模拟业务高峰
- **重负载**: 60-100 TPS，模拟系统压力
- **极限负载**: 100+ TPS，测试系统极限

## 🔧 自定义测试

### 1. 修改测试参数

在基准配置文件中调整以下参数：
- `txDuration`: 测试持续时间
- `tps`: 目标每秒事务数
- `preCreateUsers/Datasets/Orders`: 预创建数据数量

### 2. 创建自定义工作负载

参考现有工作负载模块，创建新的测试场景：
```javascript
class CustomWorkload extends WorkloadModuleBase {
    // 实现自定义测试逻辑
}
```

### 3. 添加新的基准配置

创建新的YAML配置文件，定义测试轮次和参数。

## 📋 最佳实践

### 1. 测试前准备
- 确保区块链网络稳定运行
- 清理之前的测试数据
- 检查系统资源充足

### 2. 测试执行
- 从轻负载开始逐步增加
- 监控系统资源使用情况
- 记录关键性能指标

### 3. 结果分析
- 关注TPS和延迟趋势
- 分析错误率和失败原因
- 对比不同测试场景的表现

## 🚨 注意事项

1. **资源要求**: 压力测试需要充足的系统资源
2. **网络稳定性**: 确保区块链网络在测试期间稳定
3. **数据清理**: 大量测试数据可能影响后续测试
4. **监控告警**: 设置适当的监控和告警机制

## 📞 支持与反馈

如有问题或建议，请联系开发团队或提交Issue。

---

**版本**: 1.0  
**更新日期**: 2025-09-20  
**维护者**: SciDataHub开发团队
