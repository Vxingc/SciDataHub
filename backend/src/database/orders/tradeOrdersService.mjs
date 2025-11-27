
import {
    dbAddTradeOrder,
    dbGetAllTradeOrders,
    dbGetTradeOrdersByRequester,
    dbGetTradeOrdersByDatasetOwner,
    dbGetTradeOrdersByDataset,
    dbGetTradeOrderById,
    dbUpdateTradeOrderStatus,
    dbDeleteTradeOrder
} from './tradeOrdersTable.mjs';
import logger from '../../utils/log.mjs';

// 创建交易订单
export async function addTradeOrder(req, res) {
    try {
        const { title, description, blockchainName, datasetName, datasetOwner, requester, maskingRules } = req.body;
        logger.debug(`Add trade order: ${JSON.stringify(req.body)}`);

        // 参数验证
        if (!title || !blockchainName || !datasetName || !datasetOwner || !maskingRules || !requester) {
            logger.debug(`add trade order failed, missing parameters: title, blockchainName, datasetName, datasetOwner, maskingRules, requester: ${JSON.stringify(req.body)}`);
            return res.status(400).json({
                success: false,
                message: '缺少必要参数：title, blockchainName, datasetName, datasetOwner, maskingRules'
            });
        }

        const orderId = await dbAddTradeOrder(
            blockchainName,
            title,
            description,
            datasetName,
            datasetOwner,
            requester,
            maskingRules
        );

        logger.info(`Trade order created successfully: ${orderId}`);
        res.status(201).json({
            success: true,
            message: '交易订单创建成功',
            data: { orderId }
        });
    } catch (error) {
        logger.error(`Create trade order failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: '创建交易订单失败',
            error: error.message
        });
    }
}

// 获取所有交易订单
export async function getTradeOrders(req, res) {
    try {
        const { blockchainName } = req.params;

        if (!blockchainName) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数：blockchainName'
            });
        }

        const orders = await dbGetAllTradeOrders(blockchainName);

        res.status(200).json({
            success: true,
            message: '获取交易订单列表成功',
            data: orders
        });
    } catch (error) {
        logger.error(`Get trade orders failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: '获取交易订单列表失败',
            error: error.message
        });
    }
}

// 根据请求者获取交易订单
export async function getTradeOrdersByRequester(req, res) {
    try {
        const { blockchainName } = req.params;
        const requester = req.user?.username;

        if (!blockchainName) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数：blockchainName'
            });
        }

        if (!requester) {
            return res.status(401).json({
                success: false,
                message: '用户未认证'
            });
        }

        const orders = await dbGetTradeOrdersByRequester(blockchainName, requester);

        res.status(200).json({
            success: true,
            message: '获取用户交易订单成功',
            data: orders
        });
    } catch (error) {
        logger.error(`Get trade orders by requester failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: '获取用户交易订单失败',
            error: error.message
        });
    }
}

// 根据数据拥有者获取交易订单
export async function getTradeOrdersByOwner(req, res) {
    try {
        const { blockchainName, owner } = req.params;

        if (!blockchainName || !owner) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数：blockchainName, owner'
            });
        }

        const orders = await dbGetTradeOrdersByDatasetOwner(blockchainName, owner);

        res.status(200).json({
            success: true,
            message: '获取数据拥有者交易订单成功',
            data: orders
        });
    } catch (error) {
        logger.error(`Get trade orders by owner failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: '获取数据拥有者交易订单失败',
            error: error.message
        });
    }
}

// 根据数据集获取交易订单
export async function getTradeOrdersByDatasetName(req, res) {
    try {
        const { blockchainName, datasetName } = req.params;

        if (!blockchainName || !datasetName) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数：blockchainName, datasetName'
            });
        }

        const orders = await dbGetTradeOrdersByDataset(blockchainName, datasetName);

        res.status(200).json({
            success: true,
            message: '获取数据集交易订单成功',
            data: orders
        });
    } catch (error) {
        logger.error(`Get trade orders by dataset failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: '获取数据集交易订单失败',
            error: error.message
        });
    }
}

// 根据ID获取单个交易订单
export async function getTradeOrderDetails(req, res) {
    try {
        const { blockchainName, orderId } = req.params;

        if (!blockchainName || !orderId) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数：blockchainName, orderId'
            });
        }

        const order = await dbGetTradeOrderById(blockchainName, parseInt(orderId));

        if (!order) {
            return res.status(404).json({
                success: false,
                message: '交易订单不存在'
            });
        }

        res.status(200).json({
            success: true,
            message: '获取交易订单详情成功',
            data: order
        });
    } catch (error) {
        logger.error(`Get trade order details failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: '获取交易订单详情失败',
            error: error.message
        });
    }
}

// 更新交易订单状态
export async function updateTradeOrderState(req, res) {
    try {
        const { blockchainName, orderId } = req.params;
        const { status } = req.body;

        if (!blockchainName || !orderId || !status) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数：blockchainName, orderId, status'
            });
        }

        // 验证状态值
        const validStatuses = ['pending', 'processing', 'completed', 'cancelled', 'failed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `无效的状态值，允许的状态：${validStatuses.join(', ')}`
            });
        }

        const updatedOrder = await dbUpdateTradeOrderStatus(blockchainName, parseInt(orderId), status);

        if (!updatedOrder) {
            return res.status(404).json({
                success: false,
                message: '交易订单不存在'
            });
        }

        logger.info(`Trade order status updated: ${orderId} -> ${status}`);
        res.status(200).json({
            success: true,
            message: '交易订单状态更新成功',
            data: updatedOrder
        });
    } catch (error) {
        logger.error(`Update trade order status failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: '更新交易订单状态失败',
            error: error.message
        });
    }
}

// 删除交易订单
export async function removeTradeOrder(req, res) {
    try {
        const { blockchainName, orderId } = req.params;
        const currentUser = req.user?.username;

        if (!blockchainName || !orderId) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数：blockchainName, orderId'
            });
        }

        if (!currentUser) {
            return res.status(401).json({
                success: false,
                message: '用户未认证'
            });
        }

        // 先获取订单信息，验证权限
        const order = await dbGetTradeOrderById(blockchainName, parseInt(orderId));
        if (!order) {
            return res.status(404).json({
                success: false,
                message: '交易订单不存在'
            });
        }

        // 只有订单创建者或数据拥有者可以删除订单
        if (order.requester !== currentUser && order.datasetOwner !== currentUser) {
            return res.status(403).json({
                success: false,
                message: '没有权限删除此交易订单'
            });
        }

        await dbDeleteTradeOrder(blockchainName, parseInt(orderId));

        logger.info(`Trade order deleted: ${orderId} by ${currentUser}`);
        res.status(200).json({
            success: true,
            message: '交易订单删除成功'
        });
    } catch (error) {
        logger.error(`Delete trade order failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: '删除交易订单失败',
            error: error.message
        });
    }
}