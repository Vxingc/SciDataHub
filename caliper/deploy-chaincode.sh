#!/bin/bash

# SciDataHub 链码部署脚本
# 用于部署 datatrading 智能合约到 test-network

set -e

echo "🚀 开始部署 SciDataHub 智能合约..."

# 切换到 test-network 目录
cd ../blockchain/test-network

echo "📋 检查网络状态..."
if ! docker ps | grep -q "peer0.org1.example.com"; then
    echo "❌ 区块链网络未运行，正在启动..."
    ./network.sh down
    ./network.sh up createChannel -c mychannel
else
    echo "✅ 区块链网络正在运行"
fi

echo "📦 部署 datatrading 智能合约..."
./network.sh deployCC -ccn datatrading -ccp ../sci-data-trade/chaincode-go -ccl go

echo "🧪 测试智能合约初始化..."
# 设置环境变量
export CORE_PEER_TLS_ENABLED=true
export CORE_PEER_LOCALMSPID="Org1MSP"
export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export CORE_PEER_MSPCONFIGPATH=${PWD}/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
export CORE_PEER_ADDRESS=localhost:7051

# 初始化账本
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile "${PWD}/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem" -C mychannel -n datatrading --peerAddresses localhost:7051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt" --peerAddresses localhost:9051 --tlsRootCertFiles "${PWD}/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt" -c '{"function":"InitLedger","Args":[]}'

echo "✅ 智能合约部署完成！"
echo ""
echo "📊 现在可以运行 Caliper 性能测试："
echo "cd /root/SciDataHub/caliper"
echo "npx caliper launch manager --caliper-workspace ./ --caliper-benchconfig benchmarks/user-management-benchmark.yaml --caliper-networkconfig networks/networkConfig.yaml"
echo ""
echo "🔍 检查网络状态："
echo "docker ps"
