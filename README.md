# SciDataHub 基于区块链的科学数据管理和流通平台


## 项目结构

```
SciDataHub
├── blockchain      # 区块链
├── caliper         # 区块链性能测试
├── frontend        # 前端
├── backend         # 后端
├── docs            # 文档
├── ipfs            # ipfs
```

## 运行环境

- Node.js
- IPFS
- Hyperledger Fabric
- Hyperledger Caliper

### 启动区块链

#### 准备环境
需安装curl，jq，git，go，docker，docker-compose

#### 安装fabric

```shell
curl -sSLO https://raw.githubusercontent.com/hyperledger/fabric/main/scripts/install-fabric.sh && chmod +x install-fabric.sh
```

如果下载失败，可能是代理问题，设置终端代理即可。

下载docker镜像，clone fabric-samples仓库，下载二进制文件，官方脚本一键搞定

```shell
./install-fabric.sh docker samples binary
```

#### 启动fabric

```shell
cd blockchain/test-network
./network.sh up createChannel -ca
./network.sh deployCC -ccn scidatahub -ccp ../sci-data-trade/chaincode-go -ccl go
```

### 启动后端

```shell
cd backend
npm install
npm run dev
```

### 启动前端
```shell
cd frontend
npm install
npm run dev
```

### 启动IPFS

详情见[ipfs/Readme.md](./ipfs/Readme.md)