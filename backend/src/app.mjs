import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import serverConfig from './config/server_config.mjs';

import userRoutes from './database/users/userRoutes.mjs';
import blockchainRoutes from './database/blockchains/blockchainsRoutes.mjs';
import datasetsRoutes from './database/datasets/datasetsRoutes.mjs';

const app = express();
app.use(cors(serverConfig.corsOptions));
app.use(bodyParser.json());

// 使用路由模块
app.use('/', userRoutes);
app.use('/', blockchainRoutes);
app.use('/', datasetsRoutes);

app.listen(serverConfig.port, () => {
    console.log(`Server is running on port ${serverConfig.port}`);
    console.log('用户认证系统已启动');
});

// 开发环境每次启动后端时，都重新初始化数据库，正式版删除后续代码
import { initBlockchainTable, deleteBlockchainTable } from './database/blockchains/blockchainsTable.mjs';
import { addDemoBlockchains } from './database/blockchains/blockchainsDemo.mjs';

import { initUserTable, deleteUserTable } from './database/users/userTable.mjs';
import { addDemoUser } from './database/users/userDemo.mjs';
import { initDatasetTable, deleteDatasetTable } from './database/datasets/datasetsTable.mjs';
import { addDemoDatasets } from './database/datasets/datasetsDemo.mjs';

// 初始化用户表
await deleteUserTable();
await initUserTable();
await addDemoUser();

// 初始化区块链表
await deleteBlockchainTable();
await initBlockchainTable();
await addDemoBlockchains();

// 初始化数据集表
await initDatasetTable();
await addDemoDatasets();



