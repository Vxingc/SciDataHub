import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import serverConfig from './config/server_config.mjs';

import userRoutes from './database/users/userRoutes.mjs';
import blockchainRoutes from './database/blockchains/blockchainsRoutes.mjs';
import datasetsRoutes from './database/datasets/datasetsRoutes.mjs';
import chaincodeRoutes from './services/chaincode/chaincodeRoutes.mjs';
import { initLedger } from './services/chaincode/chaincode.mjs';
import logger from './utils/log.mjs';

const app = express();
app.use(cors(serverConfig.corsOptions));
app.use(bodyParser.json());

// 使用路由模块
app.use('/', userRoutes);
app.use('/', blockchainRoutes);
app.use('/', datasetsRoutes);
app.use('/', chaincodeRoutes);

await initLedger();

app.listen(serverConfig.port, () => {
    logger.info(`Server is running on port ${serverConfig.port}`);
    logger.info('用户认证系统已启动');
});

// 开发环境每次启动后端时，都重新初始化数据库，正式版删除后续代码
import { initBlockchainTable, deleteBlockchainTable } from './database/blockchains/blockchainsTable.mjs';
import { addDemoBlockchains } from './database/blockchains/blockchainsDemo.mjs';

import { initUserTable, deleteUserTable } from './database/users/userTable.mjs';
import { addDemoUser } from './database/users/userDemo.mjs';
import { addDemoDatasets } from './database/datasets/datasetsDemo.mjs';

logger.info("初始化后端数据库")

// 初始化用户表
await deleteUserTable();
await initUserTable();
await addDemoUser();

// 初始化区块链表
await deleteBlockchainTable();
await initBlockchainTable();
await addDemoBlockchains();

// 初始化数据集表
await addDemoDatasets();
logger.info("后端数据库初始化完成")