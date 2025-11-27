import express from 'express';

// 导入交易订单服务函数
import { 
    addTradeOrder,
    getTradeOrders,
    getTradeOrdersByRequester,
    getTradeOrdersByOwner,
    getTradeOrdersByDatasetName,
    getTradeOrderDetails,
    updateTradeOrderState,
    removeTradeOrder
} from './tradeOrdersService.mjs';

// 导入服务订单服务函数
import { 
    addServiceOrder,
    getServiceOrders,
    getServiceOrdersByRequester,
    getServiceOrdersByOwner,
    getServiceOrdersByDatasetName,
    getServiceOrderDetails,
    updateServiceOrderState,
    removeServiceOrder
} from './serviceOrdersService.mjs';

const router = express.Router();

// ==================== 交易订单路由 ====================

// 创建交易订单
router.post('/:blockchainName/trade-orders', addTradeOrder);

// 获取所有交易订单
router.get('/:blockchainName/trade-orders', getTradeOrders);

// 根据请求者获取交易订单
router.get('/:blockchainName/trade-orders/requester', getTradeOrdersByRequester);

// 根据数据拥有者获取交易订单
router.get('/:blockchainName/trade-orders/owner/:owner', getTradeOrdersByOwner);

// 根据数据集获取交易订单
router.get('/:blockchainName/trade-orders/dataset/:datasetName', getTradeOrdersByDatasetName);

// 根据ID获取交易订单详情
router.get('/:blockchainName/trade-orders/:orderId', getTradeOrderDetails);

// 更新交易订单状态
router.put('/:blockchainName/trade-orders/:orderId/status', updateTradeOrderState);

// 删除交易订单
router.delete('/:blockchainName/trade-orders/:orderId', removeTradeOrder);

// ==================== 服务订单路由 ====================

// 创建服务订单
router.post('/:blockchainName/service-orders', addServiceOrder);

// 获取所有服务订单
router.get('/:blockchainName/service-orders', getServiceOrders);

// 根据请求者获取服务订单
router.get('/:blockchainName/service-orders/requester', getServiceOrdersByRequester);

// 根据数据拥有者获取服务订单
router.get('/:blockchainName/service-orders/owner/:owner', getServiceOrdersByOwner);

// 根据数据集获取服务订单
router.get('/:blockchainName/service-orders/dataset/:datasetName', getServiceOrdersByDatasetName);

// 根据ID获取服务订单详情
router.get('/:blockchainName/service-orders/:orderId', getServiceOrderDetails);

// 更新服务订单状态
router.put('/:blockchainName/service-orders/:orderId/status', updateServiceOrderState);

// 删除服务订单
router.delete('/:blockchainName/service-orders/:orderId', removeServiceOrder);

export default router;
