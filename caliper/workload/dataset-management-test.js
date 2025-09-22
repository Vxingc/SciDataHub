'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');
const crypto = require('crypto');

/**
 * 数据集管理功能性能测试
 * 测试数据集相关的关键函数性能
 */
class DatasetManagementWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.datasetCounter = 0;
        this.preCreatedHashes = [];
    }
    
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        
        console.log(`Worker ${this.workerIndex}: 初始化数据集管理性能测试`);
        
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
        const testUsers = ['dataOwner1', 'dataOwner2', 'dataOwner3'];
        for (const username of testUsers) {
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'AddUser',
                invokerIdentity: 'Admin@org1.example.com',
                contractArguments: [username, '1000'],
                readOnly: false
            };
            
            try {
                await this.sutAdapter.sendRequests(request);
            } catch (error) {
                console.error(`Worker ${this.workerIndex}: 创建测试用户 ${username} 失败:`, error);
            }
        }
        
        // 预创建一些测试数据集用于查询测试
        const preCreateDatasets = this.roundArguments.preCreateDatasets || 20;
        for (let i = 0; i < preCreateDatasets; i++) {
            const hash = this.generateDatasetHash();
            const owner = testUsers[i % testUsers.length];
            
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'AddDataset',
                invokerIdentity: 'Admin@org1.example.com',
                contractArguments: [hash, owner],
                readOnly: false
            };
            
            try {
                await this.sutAdapter.sendRequests(request);
                this.preCreatedHashes.push(hash);
            } catch (error) {
                console.error(`Worker ${this.workerIndex}: 预创建数据集 ${hash} 失败:`, error);
            }
        }
        
        console.log(`Worker ${this.workerIndex}: 预创建 ${this.preCreatedHashes.length} 个测试数据集完成`);
    }

    /**
     * 生成随机数据集哈希值
     */
    generateDatasetHash() {
        const randomData = `dataset_${this.workerIndex}_${this.datasetCounter++}_${Date.now()}_${Math.random()}`;
        return crypto.createHash('sha256').update(randomData).digest('hex');
    }

    async submitTransaction() {
        const testType = this.roundArguments.testType || 'mixed';
        
        switch (testType) {
            case 'addDataset':
                return await this.testAddDataset();
            case 'getDataset':
                return await this.testGetDataset();
            case 'getDatasetOwner':
                return await this.testGetDatasetOwner();
            case 'getAllDatasets':
                return await this.testGetAllDatasets();
            case 'mixed':
            default:
                return await this.testMixedDatasetOperations();
        }
    }

    /**
     * 测试添加数据集功能
     */
    async testAddDataset() {
        const hash = this.generateDatasetHash();
        const owners = ['dataOwner1', 'dataOwner2', 'dataOwner3'];
        const owner = owners[Math.floor(Math.random() * owners.length)];
        
        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'AddDataset',
            invokerIdentity: 'Admin@org1.example.com',
            contractArguments: [hash, owner],
            readOnly: false
        };
        
        try {
            await this.sutAdapter.sendRequests(request);
            // 添加到预创建列表中，供后续查询使用
            this.preCreatedHashes.push(hash);
        } catch (error) {
            console.error(`Worker ${this.workerIndex}: AddDataset 失败:`, error);
            throw error;
        }
    }

    /**
     * 测试获取数据集信息功能
     */
    async testGetDataset() {
        if (this.preCreatedHashes.length === 0) {
            console.warn(`Worker ${this.workerIndex}: 没有预创建的数据集可供查询`);
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * this.preCreatedHashes.length);
        const hash = this.preCreatedHashes[randomIndex];
        
        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'GetDataset',
            invokerIdentity: 'Admin@org1.example.com',
            contractArguments: [hash],
            readOnly: true
        };
        
        try {
            await this.sutAdapter.sendRequests(request);
        } catch (error) {
            console.error(`Worker ${this.workerIndex}: GetDataset 失败:`, error);
            throw error;
        }
    }

    /**
     * 测试获取数据集所有者功能
     */
    async testGetDatasetOwner() {
        if (this.preCreatedHashes.length === 0) {
            console.warn(`Worker ${this.workerIndex}: 没有预创建的数据集可供查询`);
            return;
        }
        
        const randomIndex = Math.floor(Math.random() * this.preCreatedHashes.length);
        const hash = this.preCreatedHashes[randomIndex];
        
        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'GetDatasetOwner',
            invokerIdentity: 'Admin@org1.example.com',
            contractArguments: [hash],
            readOnly: true
        };
        
        try {
            await this.sutAdapter.sendRequests(request);
        } catch (error) {
            console.error(`Worker ${this.workerIndex}: GetDatasetOwner 失败:`, error);
            throw error;
        }
    }

    /**
     * 测试获取所有数据集功能
     */
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

    /**
     * 测试混合数据集操作
     */
    async testMixedDatasetOperations() {
        const operations = ['addDataset', 'getDataset', 'getDatasetOwner', 'getAllDatasets'];
        const weights = [0.3, 0.4, 0.2, 0.1]; // 各操作的权重
        
        const random = Math.random();
        let cumulativeWeight = 0;
        
        for (let i = 0; i < operations.length; i++) {
            cumulativeWeight += weights[i];
            if (random <= cumulativeWeight) {
                switch (operations[i]) {
                    case 'addDataset':
                        return await this.testAddDataset();
                    case 'getDataset':
                        return await this.testGetDataset();
                    case 'getDatasetOwner':
                        return await this.testGetDatasetOwner();
                    case 'getAllDatasets':
                        return await this.testGetAllDatasets();
                }
                break;
            }
        }
        
        // 默认执行获取数据集操作
        return await this.testGetDataset();
    }

    /**
     * 批量创建数据集测试（用于压力测试）
     */
    async testBatchAddDatasets() {
        const batchSize = this.roundArguments.batchSize || 5;
        const owners = ['dataOwner1', 'dataOwner2', 'dataOwner3'];
        
        const requests = [];
        for (let i = 0; i < batchSize; i++) {
            const hash = this.generateDatasetHash();
            const owner = owners[Math.floor(Math.random() * owners.length)];
            
            requests.push({
                contractId: this.roundArguments.contractId,
                contractFunction: 'AddDataset',
                invokerIdentity: 'Admin@org1.example.com',
                contractArguments: [hash, owner],
                readOnly: false
            });
            
            this.preCreatedHashes.push(hash);
        }
        
        try {
            await this.sutAdapter.sendRequests(requests);
        } catch (error) {
            console.error(`Worker ${this.workerIndex}: BatchAddDatasets 失败:`, error);
            throw error;
        }
    }
}

function createWorkloadModule() {
    return new DatasetManagementWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
