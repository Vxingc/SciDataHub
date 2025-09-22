#!/bin/bash

# SciDataHub Caliper 性能测试运行脚本

set -e

echo "🎯 SciDataHub 智能合约性能测试套件"
echo "=================================="

# 检查网络状态
echo "🔍 检查区块链网络状态..."
if ! docker ps | grep -q "peer0.org1.example.com"; then
    echo "❌ 区块链网络未运行！"
    echo "请先运行部署脚本："
    echo "  ./deploy-chaincode.sh"
    exit 1
fi

echo "✅ 区块链网络正在运行"

# 显示测试选项
echo ""
echo "请选择要运行的性能测试："
echo "1) 用户管理功能测试"
echo "2) 数据集管理功能测试" 
echo "3) 订单管理功能测试"
echo "4) 综合性能基准测试"
echo "5) 压力测试"
echo "6) 运行所有测试"

read -p "请输入选择 (1-6): " choice

case $choice in
    1)
        echo "🧪 运行用户管理功能测试..."
        npx caliper launch manager --caliper-workspace ./ --caliper-benchconfig benchmarks/user-management-benchmark.yaml --caliper-networkconfig networks/networkConfig.yaml
        ;;
    2)
        echo "🧪 运行数据集管理功能测试..."
        npx caliper launch manager --caliper-workspace ./ --caliper-benchconfig benchmarks/dataset-management-benchmark.yaml --caliper-networkconfig networks/networkConfig.yaml
        ;;
    3)
        echo "🧪 运行订单管理功能测试..."
        npx caliper launch manager --caliper-workspace ./ --caliper-benchconfig benchmarks/order-management-benchmark.yaml --caliper-networkconfig networks/networkConfig.yaml
        ;;
    4)
        echo "🧪 运行综合性能基准测试..."
        npx caliper launch manager --caliper-workspace ./ --caliper-benchconfig benchmarks/comprehensive-benchmark.yaml --caliper-networkconfig networks/networkConfig.yaml
        ;;
    5)
        echo "🧪 运行压力测试..."
        npx caliper launch manager --caliper-workspace ./ --caliper-benchconfig benchmarks/stress-test-benchmark.yaml --caliper-networkconfig networks/networkConfig.yaml
        ;;
    6)
        echo "🧪 运行所有测试..."
        echo "1/5 用户管理功能测试..."
        npx caliper launch manager --caliper-workspace ./ --caliper-benchconfig benchmarks/user-management-benchmark.yaml --caliper-networkconfig networks/networkConfig.yaml
        
        echo "2/5 数据集管理功能测试..."
        npx caliper launch manager --caliper-workspace ./ --caliper-benchconfig benchmarks/dataset-management-benchmark.yaml --caliper-networkconfig networks/networkConfig.yaml
        
        echo "3/5 订单管理功能测试..."
        npx caliper launch manager --caliper-workspace ./ --caliper-benchconfig benchmarks/order-management-benchmark.yaml --caliper-networkconfig networks/networkConfig.yaml
        
        echo "4/5 综合性能基准测试..."
        npx caliper launch manager --caliper-workspace ./ --caliper-benchconfig benchmarks/comprehensive-benchmark.yaml --caliper-networkconfig networks/networkConfig.yaml
        
        echo "5/5 压力测试..."
        npx caliper launch manager --caliper-workspace ./ --caliper-benchconfig benchmarks/stress-test-benchmark.yaml --caliper-networkconfig networks/networkConfig.yaml
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac

echo ""
echo "✅ 测试完成！"
echo "📊 测试报告已生成在 report.html"
