import express from 'express';

// 导入交易订单服务函数
import { 
    handleAddTradeOrder,
    handleGetTradeOrders,
    handleGetTradeOrdersByRequester,
    handleGetTradeOrdersByOwner,
    handleGetTradeOrdersByDatasetName,
    handleGetTradeOrderDetails,
    handleUpdateTradeOrderState,
    handleRemoveTradeOrder
} from './tradeOrdersService.mjs';

// 导入服务订单服务函数
import { 
    handleAddServiceOrder,
    handleGetServiceOrders,
    handleGetServiceOrdersByRequester,
    handleGetServiceOrdersByOwner,
    handleGetServiceOrdersByDatasetName,
    handleGetServiceOrderDetails,
    handleUpdateServiceOrderState,
    handleRemoveServiceOrder
} from './serviceOrdersService.mjs';

const router = express.Router();

// ==================== 交易订单路由 ====================

// 创建交易订单
router.post('/trade-orders', handleAddTradeOrder);

// 获取所有交易订单
router.get('/trade-orders/:blockchainName', handleGetTradeOrders);

// 根据请求者获取交易订单
router.get('/trade-orders/:blockchainName/requester', handleGetTradeOrdersByRequester);

// 根据数据拥有者获取交易订单
router.get('/trade-orders/:blockchainName/owner/:owner', handleGetTradeOrdersByOwner);

// 根据数据集获取交易订单
router.get('/trade-orders/:blockchainName/dataset/:datasetName', handleGetTradeOrdersByDatasetName);

// 根据ID获取交易订单详情
router.get('/trade-orders/:blockchainName/:orderId', handleGetTradeOrderDetails);

// 更新交易订单状态
router.put('/trade-orders/:blockchainName/:orderId/status', handleUpdateTradeOrderState);

// 删除交易订单
router.delete('/trade-orders/:blockchainName/:orderId', handleRemoveTradeOrder);

// ==================== 服务订单路由 ====================

// 创建服务订单
router.post('/service-orders', handleAddServiceOrder);

// 获取所有服务订单
router.get('/service-orders/:blockchainName', handleGetServiceOrders);

// 根据请求者获取服务订单
router.get('/service-orders/:blockchainName/requester', handleGetServiceOrdersByRequester);

// 根据数据拥有者获取服务订单
router.get('/service-orders/:blockchainName/owner/:owner', handleGetServiceOrdersByOwner);

// 根据数据集获取服务订单
router.get('/service-orders/:blockchainName/dataset/:datasetName', handleGetServiceOrdersByDatasetName);

// 根据ID获取服务订单详情
router.get('/service-orders/:blockchainName/:orderId', handleGetServiceOrderDetails);

// 更新服务订单状态
router.put('/service-orders/:blockchainName/:orderId/status', handleUpdateServiceOrderState);

// 删除服务订单
router.delete('/service-orders/:blockchainName/:orderId', handleRemoveServiceOrder);

export default router;
