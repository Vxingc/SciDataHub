import { initializeContract } from '../../config/fabricConfig.mjs';
import logger from '../../config/logger.mjs';

const utf8Decoder = new TextDecoder();

// 获取数据集
export async function bcGetDataset(req, res) {
    try {
        const { hash } = req.params;
        const contract = await initializeContract();
        
        const resultBytes = await contract.evaluateTransaction('GetDataset', hash);
        const resultJson = utf8Decoder.decode(resultBytes);
        const result = JSON.parse(resultJson);
        
        logger.info('bcGetDataset result: ', result);
        res.json({ success: true, dataset: result });
    } catch (error) {
        logger.error('bcGetDataset fail', error);
        res.status(500).json({
            success: false,
            message: '获取数据集失败'
        });
    }
}

// 添加数据集
export async function bcAddDataset(req, res) {
    try {
        const { hash, owner } = req.body;
        const contract = await initializeContract();
        
        logger.info(`bcAddDataset, hash: ${hash}, owner: ${owner}`);
        await contract.submitTransaction('AddDataset', hash, owner);
        
        res.json({ success: true, message: '数据集添加成功' });
    } catch (error) {
        logger.error('bcAddDataset fail', error);
        res.status(500).json({
            success: false,
            message: '添加数据集失败'
        });
    }
}

// 获取所有数据集
export async function bcGetAllDatasets(req, res) {
    try {
        const contract = await initializeContract();
        
        const resultBytes = await contract.evaluateTransaction('GetAllDatasets');
        const resultJson = utf8Decoder.decode(resultBytes);
        const result = JSON.parse(resultJson);
        
        logger.info('bcGetAllDatasets result: ', result);
        res.json({ success: true, datasets: result });
    } catch (error) {
        logger.error('bcGetAllDatasets fail', error);
        res.status(500).json({
            success: false,
            message: '获取所有数据集失败'
        });
    }
}

// 获取数据集所有者
export async function bcGetDatasetOwner(req, res) {
    try {
        const { hash } = req.params;
        const contract = await initializeContract();
        
        const resultBytes = await contract.evaluateTransaction('GetDatasetOwner', hash);
        const resultJson = utf8Decoder.decode(resultBytes);
        
        logger.info('bcGetDatasetOwner result: ', resultJson);
        res.json({ success: true, owner: resultJson });
    } catch (error) {
        logger.error('bcGetDatasetOwner fail', error);
        res.status(500).json({
            success: false,
            message: '获取数据集所有者失败'
        });
    }
}
