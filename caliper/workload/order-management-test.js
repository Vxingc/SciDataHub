'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const crypto = require('crypto');

/**
 * 订单管理功能性能测试
 * 测试订单相关的关键函数性能
 */
class OrderManagementWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.orderCounter = 0;
        this.preCreatedOrders = [];
        this.preCreatedDatasets = [];
        this.testUsers = ['buyer1', 'buyer2', 'seller1', 'seller2'];
    }
    
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        
        console.log(`Worker ${this.workerIndex}: 初始化订单管理性能测试`);
        
        // 只有第一个worker负责初始化合约和创建基础数据
        if (this.workerIndex === 0) {
            console.log(`Worker ${this.workerIndex}: 作为主worker，开始初始化合约...`);
            await this.initializeContract();
        } else {
            // 其他worker等待主worker完成初始化
            console.log(`Worker ${this.workerIndex}: 等待主worker完成合约初始化...`);
            await this.waitForInitialization();
        }
        
        // 每个worker创建自己的测试数据（避免冲突）
        await this.createWorkerSpecificData();
        
        console.log(`Worker ${this.workerIndex}: 初始化完成`);
    }
    
    /**
     * 初始化合约（仅由worker 0执行）
     */
    async initializeContract() {
        // 初始化账本
        const initLedgerRequest = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'InitLedger',
            invokerIdentity: 'Admin@org1.example.com',
            contractArguments: [],
            readOnly: false
        };
        
        try {
            await this.sutAdapter.sendRequests(initLedgerRequest);
            console.log(`Worker ${this.workerIndex}: 账本初始化完成`);
        } catch (error) {
            console.error(`Worker ${this.workerIndex}: 账本初始化失败:`, error);
        }
        
        // 创建测试用户
        for (const username of this.testUsers) {
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'AddUser',
                invokerIdentity: 'Admin@org1.example.com',
                contractArguments: [username, '10000'],
                readOnly: false
            };
            
            try {
                await this.sutAdapter.sendRequests(request);
            } catch (error) {
                console.error(`Worker ${this.workerIndex}: 创建测试用户 ${username} 失败:`, error);
            }
        }
        
        // 为测试用户转移代币到锁定余额
        for (const username of this.testUsers) {
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'TransferLockedTokenBalance',
                invokerIdentity: 'Admin@org1.example.com',
                contractArguments: [username, '5000'],
                readOnly: false
            };
            
            try {
                await this.sutAdapter.sendRequests(request);
            } catch (error) {
                console.error(`Worker ${this.workerIndex}: 转移锁定代币给 ${username} 失败:`, error);
            }
        }
        
        console.log(`Worker ${this.workerIndex}: 合约初始化完成`);
    }
    
    /**
     * 等待合约初始化完成（worker 1-3执行）
     */
    async waitForInitialization() {
        // 简单的等待策略：等待5秒让主worker完成初始化
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log(`Worker ${this.workerIndex}: 等待完成，开始创建worker专用数据`);
    }
    
    /**
     * 创建worker专用的测试数据（每个worker执行）
     */
    async createWorkerSpecificData() {
        // 每个worker创建自己的数据集（避免冲突）
        const preCreateDatasets = Math.floor((this.roundArguments.preCreateDatasets || 10) / 4); // 平均分配
        const sellers = this.testUsers.filter(user => user.includes('seller'));
        
        for (let i = 0; i < preCreateDatasets; i++) {
            const hash = this.generateDatasetHash();
            const owner = sellers[i % sellers.length];
            
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'AddDataset',
                invokerIdentity: 'Admin@org1.example.com',
                contractArguments: [hash, owner],
                readOnly: false
            };
            
            try {
                await this.sutAdapter.sendRequests(request);
                this.preCreatedDatasets.push({ hash, owner });
            } catch (error) {
                console.error(`Worker ${this.workerIndex}: 预创建数据集 ${hash} 失败:`, error);
            }
        }
        
        // 每个worker创建自己的订单
        const preCreateOrders = Math.floor((this.roundArguments.preCreateOrders || 5) / 4);
        for (let i = 0; i < preCreateOrders; i++) {
            try {
                const orderID = await this.createTestOrder();
                if (orderID) {
                    this.preCreatedOrders.push(orderID);
                }
            } catch (error) {
                console.error(`Worker ${this.workerIndex}: 预创建订单失败:`, error);
            }
        }
        
        console.log(`Worker ${this.workerIndex}: 创建 ${this.preCreatedDatasets.length} 个数据集和 ${this.preCreatedOrders.length} 个订单`);
    }

    /**
     * 生成随机数据集哈希值
     */
    generateDatasetHash() {
        const randomData = `dataset_${this.workerIndex}_${this.orderCounter++}_${Date.now()}_${Math.random()}`;
        return crypto.createHash('sha256').update(randomData).digest('hex');
    }

    /**
     * 生成随机哈希链结束值
     */
    generateHashChainEnd() {
        const randomData = `hashchain_${Date.now()}_${Math.random()}`;
        return crypto.createHash('sha256').update(randomData).digest('hex');
    }

    /**
     * 创建测试订单
     */
    async createTestOrder() {
        if (this.preCreatedDatasets.length === 0) {
            return null;
        }
        
        const dataset = this.preCreatedDatasets[Math.floor(Math.random() * this.preCreatedDatasets.length)];
        const buyers = this.testUsers.filter(user => user.includes('buyer'));
        const buyer = buyers[Math.floor(Math.random() * buyers.length)];
        const hashChainEnd = this.generateHashChainEnd();
        const tokenUnit = Math.floor(Math.random() * 10) + 1;
        
        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'CreateOrder',
            invokerIdentity: 'Admin@org1.example.com',
            contractArguments: [dataset.hash, hashChainEnd, tokenUnit.toString(), buyer, dataset.owner],
            readOnly: false
        };
        
        try {
            const result = await this.sutAdapter.sendRequests(request);
            // 注意：实际的orderID需要从返回结果中提取，这里简化处理
            return `${dataset.hash}_${Date.now()}`;
        } catch (error) {
            console.error(`Worker ${this.workerIndex}: CreateOrder 失败:`, error);
            throw error;
        }
    }

    async submitTransaction() {
        const testType = this.roundArguments.testType || 'mixed';
        
        switch (testType) {
            case 'createOrder':
                return await this.testCreateOrder();
            case 'getOrder':
                return await this.testGetOrder();
            case 'updateOrderStatus':
                return await this.testUpdateOrderStatus();
            case 'completeOrder':
                return await this.testCompleteOrder();
            case 'getAllOrders':
                return await this.testGetAllOrders();
            case 'mixed':
            default:
                return await this.testMixedOrderOperations();
        }
    }

    /**
     * 测试创建订单功能
     */
    async testCreateOrder() {
        if (this.preCreatedDatasets.length === 0) {
            console.warn(`Worker ${this.workerIndex}: 没有预创建的数据集可供创建订单`);
            return;
        }
        
        const dataset = this.preCreatedDatasets[Math.floor(Math.random() * this.preCreatedDatasets.length)];
        const buyers = this.testUsers.filter(user => user.includes('buyer'));
        const buyer = buyers[Math.floor(Math.random() * buyers.length)];
        const hashChainEnd = this.generateHashChainEnd();
        const tokenUnit = Math.floor(Math.random() * 10) + 1;
        
        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'CreateOrder',
            invokerIdentity: 'Admin@org1.example.com',
            contractArguments: [dataset.hash, hashChainEnd, tokenUnit.toString(), buyer, dataset.owner],
            readOnly: false
        };
        
        try {
            await this.sutAdapter.sendRequests(request);
            // 将新创建的订单ID添加到列表中（简化处理）
            const orderID = `${dataset.hash}_${Date.now()}`;
            this.preCreatedOrders.push(orderID);
        } catch (error) {
            console.error(`Worker ${this.workerIndex}: CreateOrder 失败:`, error);
            throw error;
        }
    }

    /**
     * 测试获取订单信息功能
     */
    async testGetOrder() {
        if (this.preCreatedOrders.length === 0) {
            console.warn(`Worker ${this.workerIndex}: 没有预创建的订单可供查询`);
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * this.preCreatedOrders.length);
        const orderID = this.preCreatedOrders[randomIndex];
        
        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'GetOrder',
            invokerIdentity: 'Admin@org1.example.com',
            contractArguments: [orderID],
            readOnly: true
        };
        
        try {
            await this.sutAdapter.sendRequests(request);
        } catch (error) {
            console.error(`Worker ${this.workerIndex}: GetOrder 失败:`, error);
            throw error;
        }
    }

    /**
     * 测试更新订单状态功能
     */
    async testUpdateOrderStatus() {
        if (this.preCreatedOrders.length === 0) {
            console.warn(`Worker ${this.workerIndex}: 没有预创建的订单可供更新状态`);
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * this.preCreatedOrders.length);
        const orderID = this.preCreatedOrders[randomIndex];
        const statuses = ['pending', 'completed', 'cancelled'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'UpdateOrderStatus',
            invokerIdentity: 'Admin@org1.example.com',
            contractArguments: [orderID, status],
            readOnly: false
        };
        
        try {
            await this.sutAdapter.sendRequests(request);
        } catch (error) {
            console.error(`Worker ${this.workerIndex}: UpdateOrderStatus 失败:`, error);
            throw error;
        }
    }

    /**
     * 测试完成订单交易功能
     */
    async testCompleteOrder() {
        if (this.preCreatedOrders.length === 0) {
            console.warn(`Worker ${this.workerIndex}: 没有预创建的订单可供完成交易`);
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * this.preCreatedOrders.length);
        const orderID = this.preCreatedOrders[randomIndex];
        const preImage = `preimage_${Date.now()}_${Math.random()}`;
        
        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'CompleteOrder',
            invokerIdentity: 'Admin@org1.example.com',
            contractArguments: [orderID, preImage],
            readOnly: false
        };
        
        try {
            await this.sutAdapter.sendRequests(request);
        } catch (error) {
            console.error(`Worker ${this.workerIndex}: CompleteOrder 失败:`, error);
            throw error;
        }
    }

    /**
     * 测试获取所有订单功能
     */
    async testGetAllOrders() {
        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'GetAllOrders',
            invokerIdentity: 'Admin@org1.example.com',
            contractArguments: [],
            readOnly: true
        };
        
        try {
            await this.sutAdapter.sendRequests(request);
        } catch (error) {
            console.error(`Worker ${this.workerIndex}: GetAllOrders 失败:`, error);
            throw error;
        }
    }

    /**
     * 测试混合订单操作
     */
    async testMixedOrderOperations() {
        const operations = ['createOrder', 'getOrder', 'updateOrderStatus', 'getAllOrders'];
        const weights = [0.4, 0.3, 0.2, 0.1]; // 各操作的权重
        
        const random = Math.random();
        let cumulativeWeight = 0;
        
        for (let i = 0; i < operations.length; i++) {
            cumulativeWeight += weights[i];
            if (random <= cumulativeWeight) {
                switch (operations[i]) {
                    case 'createOrder':
                        return await this.testCreateOrder();
                    case 'getOrder':
                        return await this.testGetOrder();
                    case 'updateOrderStatus':
                        return await this.testUpdateOrderStatus();
                    case 'getAllOrders':
                        return await this.testGetAllOrders();
                }
                break;
            }
        }
        
        // 默认执行获取订单操作
        return await this.testGetOrder();
    }

    /**
     * 测试订单生命周期（创建->查询->更新状态->完成）
     */
    async testOrderLifecycle() {
        try {
            // 1. 创建订单
            await this.testCreateOrder();
            
            // 2. 查询订单
            if (this.preCreatedOrders.length > 0) {
                await this.testGetOrder();
            }
            
            // 3. 更新订单状态
            if (this.preCreatedOrders.length > 0) {
                await this.testUpdateOrderStatus();
            }
            
            // 4. 完成订单（有一定概率）
            if (this.preCreatedOrders.length > 0 && Math.random() < 0.3) {
                await this.testCompleteOrder();
            }
        } catch (error) {
            console.error(`Worker ${this.workerIndex}: OrderLifecycle 测试失败:`, error);
            throw error;
        }
    }
}

function createWorkloadModule() {
    return new OrderManagementWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
