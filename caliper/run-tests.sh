#!/bin/bash

# SciDataHub Caliper 性能测试运行脚本
# 使用方法: ./run-tests.sh [test-type]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 显示帮助信息
show_help() {
    echo "SciDataHub Caliper 性能测试工具"
    echo ""
    echo "使用方法:"
    echo "  ./run-tests.sh [选项]"
    echo ""
    echo "选项:"
    echo "  init                初始化合约（必须先运行）"
    echo "  user               用户管理功能测试"
    echo "  dataset            数据集管理功能测试"
    echo "  order              订单管理功能测试"
    echo "  comprehensive      综合性能测试"
    echo "  stress             压力测试"
    echo "  all                运行所有测试（不包括初始化）"
    echo "  help               显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  ./run-tests.sh init              # 初始化合约"
    echo "  ./run-tests.sh order             # 运行订单管理测试"
    echo "  ./run-tests.sh all               # 运行所有功能测试"
}

# 运行Caliper测试
run_caliper_test() {
    local benchmark_file=$1
    local test_name=$2
    
    print_info "开始运行 ${test_name} 测试..."
    print_info "基准配置: ${benchmark_file}"
    
    if [ ! -f "benchmarks/${benchmark_file}" ]; then
        print_error "基准配置文件不存在: benchmarks/${benchmark_file}"
        exit 1
    fi
    
    if [ ! -f "networks/networkConfig.yaml" ]; then
        print_error "网络配置文件不存在: networks/networkConfig.yaml"
        exit 1
    fi
    
    npx caliper launch manager \
        --caliper-workspace ./ \
        --caliper-benchconfig "benchmarks/${benchmark_file}" \
        --caliper-networkconfig networks/networkConfig.yaml
    
    if [ $? -eq 0 ]; then
        print_success "${test_name} 测试完成！"
    else
        print_error "${test_name} 测试失败！"
        exit 1
    fi
}

# 检查依赖
check_dependencies() {
    print_info "检查依赖..."
    
    if ! command -v npx &> /dev/null; then
        print_error "npx 未安装，请先安装 Node.js"
        exit 1
    fi
    
    if [ ! -d "node_modules" ]; then
        print_warning "node_modules 不存在，正在安装依赖..."
        npm install
    fi
    
    print_success "依赖检查完成"
}

# 主函数
main() {
    local test_type=${1:-help}
    
    # 检查是否在正确的目录
    if [ ! -f "package.json" ] || [ ! -d "benchmarks" ]; then
        print_error "请在 caliper 目录下运行此脚本"
        exit 1
    fi
    
    case $test_type in
        "help"|"-h"|"--help")
            show_help
            ;;
        "init")
            check_dependencies
            print_warning "⚠️  合约初始化只需要运行一次！"
            print_info "这将创建测试用户和基础数据，大约需要2-3分钟"
            run_caliper_test "init-contract-benchmark.yaml" "合约初始化"
            print_success "✅ 合约初始化完成！现在可以运行其他测试了"
            ;;
        "user")
            check_dependencies
            run_caliper_test "user-management-benchmark.yaml" "用户管理功能"
            ;;
        "dataset")
            check_dependencies
            run_caliper_test "dataset-management-benchmark.yaml" "数据集管理功能"
            ;;
        "order")
            check_dependencies
            run_caliper_test "order-management-benchmark.yaml" "订单管理功能"
            ;;
        "comprehensive")
            check_dependencies
            run_caliper_test "comprehensive-benchmark.yaml" "综合性能"
            ;;
        "stress")
            check_dependencies
            print_warning "⚠️  压力测试将使用大量系统资源，请确保系统性能充足"
            run_caliper_test "stress-test-benchmark.yaml" "压力测试"
            ;;
        "all")
            check_dependencies
            print_info "运行所有功能测试..."
            
            run_caliper_test "user-management-benchmark.yaml" "用户管理功能"
            run_caliper_test "dataset-management-benchmark.yaml" "数据集管理功能"
            run_caliper_test "order-management-benchmark.yaml" "订单管理功能"
            run_caliper_test "comprehensive-benchmark.yaml" "综合性能"
            
            print_success "🎉 所有测试完成！"
            ;;
        *)
            print_error "未知的测试类型: $test_type"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# 运行主函数
main "$@"
