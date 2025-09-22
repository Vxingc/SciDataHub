'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const crypto = require('crypto');

/**
 * 综合性能测试工作负载
 * 模拟真实业务场景下的混合操作
 */
class ComprehensiveWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.userCounter = 0;
        this.datasetCounter = 0;
        this.orderCounter = 0;
        this.preCreatedUsers = [];
        this.preCreatedDatasets = [];
        this.preCreatedOrders = [];
    }
    
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        
        console.log(`Worker ${this.workerIndex}: 初始化综合性能测试 - 场景: ${this.roundArguments.testScenario}`);
        
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
        
        // 根据测试场景初始化不同数量的数据
        await this.initializeTestData();
    }

    async initializeTestData() {
        const userCount = this.roundArguments.userCount || 50;
        const datasetCount = this.roundArguments.datasetCount || 100;
        const orderCount = this.roundArguments.orderCount || 50;
        
        // 创建测试用户
        console.log(`Worker ${this.workerIndex}: 创建 ${userCount} 个测试用户`);
        for (let i = 0; i < userCount; i++) {
            const username = `testuser_${this.workerIndex}_${i}`;
            const initialBalance = Math.floor(Math.random() * 5000) + 1000;
            
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'AddUser',
                invokerIdentity: 'Admin@org1.example.com',
                contractArguments: [username, initialBalance.toString()],
                readOnly: false
            };
            
            try {
                await this.sutAdapter.sendRequests(request);
                this.preCreatedUsers.push(username);
                
                // 为用户转移一些代币到锁定余额
                const lockAmount = Math.floor(initialBalance * 0.3);
                const lockRequest = {
                    contractId: this.roundArguments.contractId,
                    contractFunction: 'TransferLockedTokenBalance',
                    invokerIdentity: 'Admin@org1.example.com',
                    contractArguments: [username, lockAmount.toString()],
                    readOnly: false
                };
                await this.sutAdapter.sendRequests(lockRequest);
            } catch (error) {
                console.error(`Worker ${this.workerIndex}: 创建用户 ${username} 失败:`, error);
            }
        }
        
        // 创建测试数据集
        console.log(`Worker ${this.workerIndex}: 创建 ${datasetCount} 个测试数据集`);
        for (let i = 0; i < datasetCount; i++) {
            const hash = this.generateDatasetHash();
            const owner = this.preCreatedUsers[Math.floor(Math.random() * this.preCreatedUsers.length)];
            
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
                console.error(`Worker ${this.workerIndex}: 创建数据集 ${hash} 失败:`, error);
            }
        }
        
        // 创建测试订单
        console.log(`Worker ${this.workerIndex}: 创建 ${orderCount} 个测试订单`);
        for (let i = 0; i < orderCount && this.preCreatedDatasets.length > 0; i++) {
            try {
                const orderID = await this.createTestOrder();
                if (orderID) {
                    this.preCreatedOrders.push(orderID);
                }
            } catch (error) {
                console.error(`Worker ${this.workerIndex}: 创建订单失败:`, error);
            }
        }
        
        console.log(`Worker ${this.workerIndex}: 初始化完成 - 用户: ${this.preCreatedUsers.length}, 数据集: ${this.preCreatedDatasets.length}, 订单: ${this.preCreatedOrders.length}`);
    }

    generateDatasetHash() {
        const randomData = `dataset_${this.workerIndex}_${this.datasetCounter++}_${Date.now()}_${Math.random()}`;
        return crypto.createHash('sha256').update(randomData).digest('hex');
    }

    generateHashChainEnd() {
        const randomData = `hashchain_${Date.now()}_${Math.random()}`;
        return crypto.createHash('sha256').update(randomData).digest('hex');
    }

    async createTestOrder() {
        if (this.preCreatedDatasets.length === 0 || this.preCreatedUsers.length === 0) {
            return null;
        }
        
        const dataset = this.preCreatedDatasets[Math.floor(Math.random() * this.preCreatedDatasets.length)];
        const availableBuyers = this.preCreatedUsers.filter(user => user !== dataset.owner);
        if (availableBuyers.length === 0) return null;
        
        const buyer = availableBuyers[Math.floor(Math.random() * availableBuyers.length)];
        const hashChainEnd = this.generateHashChainEnd();
        const tokenUnit = Math.floor(Math.random() * 20) + 1;
        
        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'CreateOrder',
            invokerIdentity: 'Admin@org1.example.com',
            contractArguments: [dataset.hash, hashChainEnd, tokenUnit.toString(), buyer, dataset.owner],
            readOnly: false
        };
        
        try {
            await this.sutAdapter.sendRequests(request);
            return `${dataset.hash}_${Date.now()}`;
        } catch (error) {
            console.error(`Worker ${this.workerIndex}: CreateOrder 失败:`, error);
            throw error;
        }
    }

    async submitTransaction() {
        const testScenario = this.roundArguments.testScenario || 'medium';
        
        switch (testScenario) {
            case 'light':
                return await this.lightLoadScenario();
            case 'medium':
                return await this.mediumLoadScenario();
            case 'heavy':
                return await this.heavyLoadScenario();
            case 'query_intensive':
                return await this.queryIntensiveScenario();
            case 'write_intensive':
                return await this.writeIntensiveScenario();
            case 'peak_load':
                return await this.peakLoadScenario();
            default:
                return await this.mediumLoadScenario();
        }
    }

    /**
     * 轻负载场景：主要是查询操作，少量写入
     */
    async lightLoadScenario() {
        const operations = ['getUser', 'getDataset', 'getOrder', 'addUser', 'addDataset'];
        const weights = [0.3, 0.3, 0.2, 0.1, 0.1];
        
        return await this.executeWeightedOperation(operations, weights);
    }

    /**
     * 中等负载场景：平衡的读写操作
     */
    async mediumLoadScenario() {
        const operations = ['getUser', 'getDataset', 'getOrder', 'addUser', 'addDataset', 'createOrder', 'updateOrderStatus'];
        const weights = [0.25, 0.25, 0.2, 0.1, 0.1, 0.05, 0.05];
        
        return await this.executeWeightedOperation(operations, weights);
    }

    /**
     * 重负载场景：大量写入操作和复杂事务
     */
    async heavyLoadScenario() {
        const operations = ['createOrder', 'completeOrder', 'addDataset', 'addUser', 'setTokenBalance', 'getUser', 'getDataset'];
        const weights = [0.3, 0.2, 0.2, 0.1, 0.1, 0.05, 0.05];
        
        return await this.executeWeightedOperation(operations, weights);
    }

    /**
     * 查询密集型场景：主要是各种查询操作
     */
    async queryIntensiveScenario() {
        const operations = ['getUser', 'getDataset', 'getOrder', 'getAllDatasets', 'getAllOrders', 'getTokenBalance'];
        const weights = [0.25, 0.25, 0.2, 0.1, 0.1, 0.1];
        
        return await this.executeWeightedOperation(operations, weights);
    }

    /**
     * 写入密集型场景：主要是写入和状态更新操作
     */
    async writeIntensiveScenario() {
        const operations = ['addUser', 'addDataset', 'createOrder', 'updateOrderStatus', 'setTokenBalance', 'transferLockedTokenBalance'];
        const weights = [0.2, 0.2, 0.2, 0.15, 0.15, 0.1];
        
        return await this.executeWeightedOperation(operations, weights);
    }

    /**
     * 峰值负载场景：模拟系统峰值时的混合操作
     */
    async peakLoadScenario() {
        const operations = ['getUser', 'getDataset', 'createOrder', 'completeOrder', 'addDataset', 'updateOrderStatus'];
        const weights = [0.2, 0.2, 0.2, 0.15, 0.15, 0.1];
        
        return await this.executeWeightedOperation(operations, weights);
    }

    async executeWeightedOperation(operations, weights) {
        const random = Math.random();
        let cumulativeWeight = 0;
        
        for (let i = 0; i < operations.length; i++) {
            cumulativeWeight += weights[i];
            if (random <= cumulativeWeight) {
                return await this.executeOperation(operations[i]);
            }
        }
        
        // 默认执行第一个操作
        return await this.executeOperation(operations[0]);
    }

    async executeOperation(operation) {
        switch (operation) {
            case 'addUser':
                return await this.testAddUser();
            case 'getUser':
                return await this.testGetUser();
            case 'getTokenBalance':
                return await this.testGetTokenBalance();
            case 'setTokenBalance':
                return await this.testSetTokenBalance();
            case 'transferLockedTokenBalance':
                return await this.testTransferLockedTokenBalance();
            case 'addDataset':
                return await this.testAddDataset();
            case 'getDataset':
                return await this.testGetDataset();
            case 'getAllDatasets':
                return await this.testGetAllDatasets();
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
            default:
                return await this.testGetUser();
        }
    }

    // 用户管理操作
    async testAddUser() {
        const username = `newuser_${this.workerIndex}_${this.userCounter++}_${Date.now()}`;
        const initialBalance = Math.floor(Math.random() * 2000) + 500;
        
        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'AddUser',
            invokerIdentity: 'Admin@org1.example.com',
            contractArguments: [username, initialBalance.toString()],
            readOnly: false
        };
        
        try {
            await this.sutAdapter.sendRequests(request);
            this.preCreatedUsers.push(username);
        } catch (error) {
            console.error(`Worker ${this.workerIndex}: AddUser 失败:`, error);
            throw error;
        }
    }

    async testGetUser() {
        if (this.preCreatedUsers.length === 0) return;
        
        const username = this.preCreatedUsers[Math.floor(Math.random() * this.preCreatedUsers.length)];
        
        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'GetUser',
            invokerIdentity: 'Admin@org1.example.com',
            contractArguments: [username],
            readOnly: true
        };
        
        try {
            await this.sutAdapter.sendRequests(request);
        } catch (error) {
            console.error(`Worker ${this.workerIndex}: GetUser 失败:`, error);
            throw error;
        }
    }

    async testGetTokenBalance() {
        if (this.preCreatedUsers.length === 0) return;
        
        const username = this.preCreatedUsers[Math.floor(Math.random() * this.preCreatedUsers.length)];
        
        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'GetTokenBalance',
            invokerIdentity: 'Admin@org1.example.com',
            contractArguments: [username],
            readOnly: true
        };
        
        try {
            await this.sutAdapter.sendRequests(request);
        } catch (error) {
            console.error(`Worker ${this.workerIndex}: GetTokenBalance 失败:`, error);
            throw error;
        }
    }

    async testSetTokenBalance() {
        if (this.preCreatedUsers.length === 0) return;
        
        const username = this.preCreatedUsers[Math.floor(Math.random() * this.preCreatedUsers.length)];
        const newBalance = Math.floor(Math.random() * 3000) + 1000;
        
        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'SetTokenBalance',
            invokerIdentity: 'Admin@org1.example.com',
            contractArguments: [username, newBalance.toString()],
            readOnly: false
        };
        
        try {
            await this.sutAdapter.sendRequests(request);
        } catch (error) {
            console.error(`Worker ${this.workerIndex}: SetTokenBalance 失败:`, error);
            throw error;
        }
    }

    async testTransferLockedTokenBalance() {
        if (this.preCreatedUsers.length === 0) return;
        
        const username = this.preCreatedUsers[Math.floor(Math.random() * this.preCreatedUsers.length)];
        const transferAmount = Math.floor(Math.random() * 200) + 50;
        
        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'TransferLockedTokenBalance',
            invokerIdentity: 'Admin@org1.example.com',
            contractArguments: [username, transferAmount.toString()],
            readOnly: false
        };
        
        try {
            await this.sutAdapter.sendRequests(request);
        } catch (error) {
            console.error(`Worker ${this.workerIndex}: TransferLockedTokenBalance 失败:`, error);
            throw error;
        }
    }

    // 数据集管理操作
    async testAddDataset() {
        if (this.preCreatedUsers.length === 0) return;
        
        const hash = this.generateDatasetHash();
        const owner = this.preCreatedUsers[Math.floor(Math.random() * this.preCreatedUsers.length)];
        
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
            console.error(`Worker ${this.workerIndex}: AddDataset 失败:`, error);
            throw error;
        }
    }

    async testGetDataset() {
        if (this.preCreatedDatasets.length === 0) return;
        
        const dataset = this.preCreatedDatasets[Math.floor(Math.random() * this.preCreatedDatasets.length)];
        
        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'GetDataset',
            invokerIdentity: 'Admin@org1.example.com',
            contractArguments: [dataset.hash],
            readOnly: true
        };
        
        try {
            await this.sutAdapter.sendRequests(request);
        } catch (error) {
            console.error(`Worker ${this.workerIndex}: GetDataset 失败:`, error);
            throw error;
        }
    }

    async testGetAllDatasets() {
        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'GetAllDatasets',
            invokerIdentity: 'Admin@org1.example.com',
            contractArguments: [],
            readOnly: true
        };
        
        try {
            await this.sutAdapter.sendRequests(request);
        } catch (error) {
            console.error(`Worker ${this.workerIndex}: GetAllDatasets 失败:`, error);
            throw error;
        }
    }

    // 订单管理操作
    async testCreateOrder() {
        const orderID = await this.createTestOrder();
        if (orderID) {
            this.preCreatedOrders.push(orderID);
        }
    }

    async testGetOrder() {
        if (this.preCreatedOrders.length === 0) return;
        
        const orderID = this.preCreatedOrders[Math.floor(Math.random() * this.preCreatedOrders.length)];
        
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

    async testUpdateOrderStatus() {
        if (this.preCreatedOrders.length === 0) return;
        
        const orderID = this.preCreatedOrders[Math.floor(Math.random() * this.preCreatedOrders.length)];
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

    async testCompleteOrder() {
        if (this.preCreatedOrders.length === 0) return;
        
        const orderID = this.preCreatedOrders[Math.floor(Math.random() * this.preCreatedOrders.length)];
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
}

function createWorkloadModule() {
    return new ComprehensiveWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
