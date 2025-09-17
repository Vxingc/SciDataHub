import {
    addServiceOrder,
    getAllServiceOrders,
    getServiceOrdersByRequester,
    getServiceOrdersByDatasetOwner,
    getServiceOrdersByDataset,
    getServiceOrderById,
    updateServiceOrderStatus,
    deleteServiceOrder
} from './serviceOrdersTable.mjs';
import logger from '../../utils/log.mjs';

// 创建服务订单
export async function handleAddServiceOrder(req, res) {
    try {
        const { title, description, blockchainName, datasetName, datasetOwner, serviceType, serviceConfig } = req.body;
        const requester = req.user?.username;

        // 参数验证
        if (!title || !blockchainName || !datasetName || !datasetOwner || !serviceType) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数：title, blockchainName, datasetName, datasetOwner, serviceType'
            });
        }

        if (!requester) {
            return res.status(401).json({
                success: false,
                message: '用户未认证'
            });
        }

        const orderId = await addServiceOrder(
            blockchainName,
            title,
            description,
            datasetName,
            datasetOwner,
            requester,
            serviceType,
            serviceConfig
        );

        logger.info(`Service order created successfully: ${orderId}`);
        res.status(201).json({
            success: true,
            message: '服务订单创建成功',
            data: { orderId }
        });
    } catch (error) {
        logger.error(`Create service order failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: '创建服务订单失败',
            error: error.message
        });
    }
}

// 获取所有服务订单
export async function handleGetServiceOrders(req, res) {
    try {
        const { blockchainName } = req.params;

        if (!blockchainName) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数：blockchainName'
            });
        }

        const orders = await getAllServiceOrders(blockchainName);

        res.status(200).json({
            success: true,
            message: '获取服务订单列表成功',
            data: orders
        });
    } catch (error) {
        logger.error(`Get service orders failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: '获取服务订单列表失败',
            error: error.message
        });
    }
}

// 根据请求者获取服务订单
export async function handleGetServiceOrdersByRequester(req, res) {
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

        const orders = await getServiceOrdersByRequester(blockchainName, requester);

        res.status(200).json({
            success: true,
            message: '获取用户服务订单成功',
            data: orders
        });
    } catch (error) {
        logger.error(`Get service orders by user failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: '获取用户服务订单失败',
            error: error.message
        });
    }
}

// 根据数据拥有者获取服务订单
export async function handleGetServiceOrdersByOwner(req, res) {
    try {
        const { blockchainName, owner } = req.params;

        if (!blockchainName || !owner) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数：blockchainName, owner'
            });
        }

        const orders = await getServiceOrdersByDatasetOwner(blockchainName, owner);

        res.status(200).json({
            success: true,
            message: '获取数据拥有者服务订单成功',
            data: orders
        });
    } catch (error) {
        logger.error(`Get service orders by owner failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: '获取数据拥有者服务订单失败',
            error: error.message
        });
    }
}

// 根据数据集获取服务订单
export async function handleGetServiceOrdersByDatasetName(req, res) {
    try {
        const { blockchainName, datasetName } = req.params;

        if (!blockchainName || !datasetName) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数：blockchainName, datasetName'
            });
        }

        const orders = await getServiceOrdersByDataset(blockchainName, datasetName);

        res.status(200).json({
            success: true,
            message: '获取数据集服务订单成功',
            data: orders
        });
    } catch (error) {
        logger.error(`Get service orders by dataset failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: '获取数据集服务订单失败',
            error: error.message
        });
    }
}

// 根据ID获取单个服务订单
export async function handleGetServiceOrderDetails(req, res) {
    try {
        const { blockchainName, orderId } = req.params;

        if (!blockchainName || !orderId) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数：blockchainName, orderId'
            });
        }

        const order = await getServiceOrderById(blockchainName, parseInt(orderId));

        if (!order) {
            return res.status(404).json({
                success: false,
                message: '服务订单不存在'
            });
        }

        res.status(200).json({
            success: true,
            message: '获取服务订单详情成功',
            data: order
        });
    } catch (error) {
        logger.error(`Get service order details failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: '获取服务订单详情失败',
            error: error.message
        });
    }
}

// 更新服务订单状态
export async function handleUpdateServiceOrderState(req, res) {
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

        const updatedOrder = await updateServiceOrderStatus(blockchainName, parseInt(orderId), status);

        if (!updatedOrder) {
            return res.status(404).json({
                success: false,
                message: '服务订单不存在'
            });
        }

        logger.info(`Service order status updated: ${orderId} -> ${status}`);
        res.status(200).json({
            success: true,
            message: '服务订单状态更新成功',
            data: updatedOrder
        });
    } catch (error) {
        logger.error(`Update service order status failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: '更新服务订单状态失败',
            error: error.message
        });
    }
}

// 删除服务订单
export async function handleRemoveServiceOrder(req, res) {
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
        const order = await getServiceOrderById(blockchainName, parseInt(orderId));
        if (!order) {
            return res.status(404).json({
                success: false,
                message: '服务订单不存在'
            });
        }

        // 只有订单创建者或数据拥有者可以删除订单
        if (order.requester !== currentUser && order.datasetOwner !== currentUser) {
            return res.status(403).json({
                success: false,
                message: '没有权限删除此服务订单'
            });
        }

        await deleteServiceOrder(blockchainName, parseInt(orderId));

        logger.info(`Service order deleted: ${orderId} by ${currentUser}`);
        res.status(200).json({
            success: true,
            message: '服务订单删除成功'
        });
    } catch (error) {
        logger.error(`Delete service order failed: ${error.message}`);
        res.status(500).json({
            success: false,
            message: '删除服务订单失败',
            error: error.message
        });
    }
}