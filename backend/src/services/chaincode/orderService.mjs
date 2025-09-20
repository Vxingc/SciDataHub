import { initializeContract } from './chaincode.mjs';
import logger from '../../utils/log.mjs';

const utf8Decoder = new TextDecoder();

// 创建订单
export async function bcCreateOrder(req, res) {
    try {
        const { datasetHash, hashChainEnd, tokenUnit, buyer, seller } = req.body;
        const contract = await initializeContract();
        
        logger.info(`bcCreateOrder, datasetHash: ${datasetHash}, hashChainEnd: ${hashChainEnd}, tokenUnit: ${tokenUnit}, buyer: ${buyer}, seller: ${seller}`);
        logger.info("before invoke chaincode");
        const resultBytes = await contract.submitTransaction('CreateOrder', datasetHash, hashChainEnd, tokenUnit, buyer, seller);
        logger.info("after invoke chaincode");
        
        
        logger.info('bcCreateOrder result: ', resultJson);
        res.json({ success: true, orderID: resultJson, message: '订单创建成功' });
    } catch (error) {
        logger.error('bcCreateOrder fail', error);
        res.status(500).json({
            success: false,
            message: '创建订单失败'
        });
    }
}

// 获取订单
export async function bcGetOrder(req, res) {
    try {
        const { orderID } = req.params;
        const contract = await initializeContract();
        
        const resultBytes = await contract.evaluateTransaction('GetOrder', orderID);
        const resultJson = utf8Decoder.decode(resultBytes);
        const result = JSON.parse(resultJson);
        
        logger.info('bcGetOrder result: ', result);
        res.json({ success: true, order: result });
    } catch (error) {
        logger.error('bcGetOrder fail', error);
        res.status(500).json({
            success: false,
            message: '获取订单失败'
        });
    }
}

// 更新订单状态
export async function bcUpdateOrderStatus(req, res) {
    try {
        const { orderID, status } = req.body;
        const contract = await initializeContract();
        
        logger.info(`bcUpdateOrderStatus, orderID: ${orderID}, status: ${status}`);
        const resultBytes = await contract.submitTransaction('UpdateOrderStatus', orderID, status);
        const resultJson = utf8Decoder.decode(resultBytes);
        
        logger.info('bcUpdateOrderStatus result: ', resultJson);
        res.json({ success: true, message: '订单状态更新成功' });
    } catch (error) {
        logger.error('bcUpdateOrderStatus fail', error);
        res.status(500).json({
            success: false,
            message: '更新订单状态失败'
        });
    }
}

// 完成订单
export async function bcCompleteOrder(req, res) {
    try {
        const { orderID } = req.params;
        const contract = await initializeContract();
        
        logger.info(`bcCompleteOrder, orderID: ${orderID}`);
        const resultBytes = await contract.submitTransaction('CompleteOrder', orderID);
        const resultJson = utf8Decoder.decode(resultBytes);
        const result = JSON.parse(resultJson);
        
        logger.info('bcCompleteOrder result: ', result);
        res.json({ success: true, result, message: '订单完成成功' });
    } catch (error) {
        logger.error('bcCompleteOrder fail', error);
        res.status(500).json({
            success: false,
            message: '完成订单失败'
        });
    }
}

// 获取所有订单
export async function bcGetAllOrders(req, res) {
    try {
        const contract = await initializeContract();
        
        const resultBytes = await contract.evaluateTransaction('GetAllOrders');
        const resultJson = utf8Decoder.decode(resultBytes);
        const result = JSON.parse(resultJson);
        
        logger.info('bcGetAllOrders result: ', result);
        res.json({ success: true, orders: result });
    } catch (error) {
        logger.error('bcGetAllOrders fail', error);
        res.status(500).json({
            success: false,
            message: '获取所有订单失败'
        });
    }
}