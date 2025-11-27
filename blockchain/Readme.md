# Hyperledger Fabric 区块链部分

## 准备

完成所有[准备工作](prepare.md)

```bash
cp -r fabric-samples/bin .
cp -r fabric-samples/builders .
cp -r fabric-samples/config .
```

## 启动fabric

```bash
cd test-network
```

```bash
./network.sh up CreateChannel -ca
```

```bash
./network.sh deployCC -ccn scidatahub -ccp ../sci-data-trade/chaincode-go/ -ccl go
```