import { handleGetAllBlockchains } from '../blockchainList.mjs';

// 模拟响应对象
const createMockResponse = () => {
    const res = {
        jsonData: null,
        statusCode: 200,
        json: function(data) {
            this.jsonData = data;
            return this;
        },
        status: function(code) {
            this.statusCode = code;
            return this;
        }
    };
    return res;
};

// 测试 handleGetAllBlockchains 函数
const testHandleGetAllBlockchains = async () => {
    console.log('开始测试 handleGetAllBlockchains...');
    
    try {
        // 创建模拟的响应对象
        const mockRes = createMockResponse();
        
        // 调用函数
        await handleGetAllBlockchains(mockRes);
        
        // 检查结果
        console.log('响应状态码:', mockRes.statusCode);
        console.log('响应数据:', JSON.stringify(mockRes.jsonData, null, 2));
        
        // 简单验证
        if (mockRes.jsonData && mockRes.jsonData.success !== undefined) {
            console.log('✅ 测试通过: 函数正常返回响应');
            if (mockRes.jsonData.success) {
                console.log('✅ 成功获取区块链列表');
                console.log('区块链数量:', mockRes.jsonData.blockchains ? mockRes.jsonData.blockchains.length : 0);
            } else {
                console.log('⚠️  函数返回失败状态:', mockRes.jsonData.message);
            }
        } else {
            console.log('❌ 测试失败: 响应格式不正确');
        }
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
    }
    
    console.log('测试完成\n');
};

// 运行测试
testHandleGetAllBlockchains();