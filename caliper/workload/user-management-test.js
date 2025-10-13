'use strict';

const { WorkloadModuleBase } = require('@hyperledger/caliper-core');

/**
 * 用户管理功能性能测试
 * 测试用户相关的关键函数性能
 */
class UserManagementWorkload extends WorkloadModuleBase {
    constructor() {
        super();
        this.userCounter = 0;
    }
    
    async initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext) {
        await super.initializeWorkloadModule(workerIndex, totalWorkers, roundIndex, roundArguments, sutAdapter, sutContext);
        
        console.log(`Worker ${this.workerIndex}: 初始化用户管理性能测试`);
        
        // 初始化账本
        // const initLedgerRequest = {
        //     contractId: this.roundArguments.contractId,
        //     contractFunction: 'InitLedger',
        //     invokerIdentity: 'Admin@org1.example.com',
        //     contractArguments: [],
        //     readOnly: false
        // };
        
        // try {
        //     await this.sutAdapter.sendRequests(initLedgerRequest);
        //     console.log(`Worker ${this.workerIndex}: 账本初始化完成`);
        // } catch (error) {
        //     console.error(`Worker ${this.workerIndex}: 账本初始化失败:`, error);
        // }
        
        // 预创建一些测试用户用于查询测试
        const preCreateUsers = this.roundArguments.preCreateUsers || 10;
        for (let i = 0; i < preCreateUsers; i++) {
            const username = `testuser_${this.workerIndex}_${i}`;
            const initialBalance = Math.floor(Math.random() * 1000) + 100;
            
            const request = {
                contractId: this.roundArguments.contractId,
                contractFunction: 'AddUser',
                invokerIdentity: 'Admin@org1.example.com',
                contractArguments: [username, initialBalance],
                readOnly: false
            };
            
            try {
                await this.sutAdapter.sendRequests(request);
            } catch (error) {
                console.error(`Worker ${this.workerIndex}: 预创建用户 ${username} 失败:`, error);
            }
        }
        
        console.log(`Worker ${this.workerIndex}: 预创建 ${preCreateUsers} 个测试用户完成`);
    }

    async submitTransaction() {
        const testType = this.roundArguments.testType || 'mixed';
        
        switch (testType) {
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
            case 'mixed':
            default:
                return await this.testMixedUserOperations();
        }
    }

    /**
     * 测试添加用户功能
     */
    async testAddUser() {
        const username = `newuser_${this.workerIndex}_${this.userCounter++}_${Date.now()}`;
        const initialBalance = Math.floor(Math.random() * 1000) + 100;
        
        const request = {
            contractId: this.roundArguments.contractId,
            contractFunction: 'AddUser',
            invokerIdentity: 'Admin@org1.example.com',
            contractArguments: [username, initialBalance.toString()],
            readOnly: false
        };
        
        try {
            await this.sutAdapter.sendRequests(request);
        } catch (error) {
            console.error(`Worker ${this.workerIndex}: AddUser 失败:`, error);
            throw error;
        }
    }

    /**
     * 测试获取用户信息功能
     */
    async testGetUser() {
        const preCreateUsers = this.roundArguments.preCreateUsers || 10;
        const userIndex = Math.floor(Math.random() * preCreateUsers);
        const username = `testuser_${this.workerIndex}_${userIndex}`;
        
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

    /**
     * 测试获取代币余额功能
     */
    async testGetTokenBalance() {
        const preCreateUsers = this.roundArguments.preCreateUsers || 10;
        const userIndex = Math.floor(Math.random() * preCreateUsers);
        const username = `testuser_${this.workerIndex}_${userIndex}`;
        
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

    /**
     * 测试设置代币余额功能
     */
    async testSetTokenBalance() {
        const preCreateUsers = this.roundArguments.preCreateUsers || 10;
        const userIndex = Math.floor(Math.random() * preCreateUsers);
        const username = `testuser_${this.workerIndex}_${userIndex}`;
        const newBalance = Math.floor(Math.random() * 2000) + 500;
        
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

    /**
     * 测试转移锁定代币余额功能
     */
    async testTransferLockedTokenBalance() {
        const preCreateUsers = this.roundArguments.preCreateUsers || 10;
        const userIndex = Math.floor(Math.random() * preCreateUsers);
        const username = `testuser_${this.workerIndex}_${userIndex}`;
        const transferAmount = Math.floor(Math.random() * 100) + 10;
        
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

    /**
     * 测试混合用户操作
     */
    async testMixedUserOperations() {
        const operations = ['addUser', 'getUser', 'getTokenBalance', 'setTokenBalance', 'transferLockedTokenBalance'];
        const weights = [0.2, 0.3, 0.2, 0.2, 0.1]; // 各操作的权重
        
        const random = Math.random();
        let cumulativeWeight = 0;
        
        for (let i = 0; i < operations.length; i++) {
            cumulativeWeight += weights[i];
            if (random <= cumulativeWeight) {
                switch (operations[i]) {
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
                }
                break;
            }
        }
        
        // 默认执行获取用户操作
        return await this.testGetUser();
    }
}

function createWorkloadModule() {
    return new UserManagementWorkload();
}

module.exports.createWorkloadModule = createWorkloadModule;
