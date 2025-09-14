import {bcAddUser, bcGetUser, bcGetTokenBalance, bcSetTokenBalance, bcAddTokenBalance, bcTransferLockedTokenBalance, bcTransferTokens} from './userService.mjs';
import {bcCreateOrder, bcGetOrder, bcUpdateOrderStatus, bcCompleteOrder, bcGetAllOrders} from './orderService.mjs';
import {bcGetDataset, bcAddDataset, bcGetAllDatasets, bcGetDatasetOwner} from './datasetService.mjs';

import express from 'express';

const router = express.Router();

// 用户相关路由
router.post('/bcAddUser', bcAddUser);
router.get('/bcGetUser', bcGetUser);
router.get('/bcGetTokenBalance', bcGetTokenBalance);
router.put('/bcSetTokenBalance', bcSetTokenBalance);
router.put('/bcAddTokenBalance', bcAddTokenBalance);
router.put('/bcTransferLockedTokenBalance', bcTransferLockedTokenBalance);
router.put('/bcTransferTokens', bcTransferTokens);

// 数据集相关路由
router.get('/bcGetDataset', bcGetDataset);
router.post('/bcAddDataset', bcAddDataset);
router.get('/bcGetAllDatasets', bcGetAllDatasets);
router.get('/bcGetDatasetOwner', bcGetDatasetOwner);

// 订单相关路由
router.post('/bcCreateOrder', bcCreateOrder);
router.get('/bcGetOrder', bcGetOrder);
router.put('/bcUpdateOrderStatus', bcUpdateOrderStatus);
router.put('/bcCompleteOrder', bcCompleteOrder);
router.get('/bcGetAllOrders', bcGetAllOrders);

export default router;
