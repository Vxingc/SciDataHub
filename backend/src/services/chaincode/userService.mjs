import { initializeContract } from '../../config/fabricConfig.mjs';
import logger from '../../config/logger.mjs';

const utf8Decoder = new TextDecoder();

// 添加用户
export async function bcAddUser(req, res) {
    try {
        const { username, tokenBalance } = req.body;
        const contract = await initializeContract();
        
        logger.info(`bcAddUser, username: ${username}, tokenBalance: ${tokenBalance}`);
        await contract.submitTransaction('AddUser', username, tokenBalance);
        
        res.json({ success: true, message: '用户添加成功' });
    } catch (error) {
        logger.error('bcAddUser fail', error);
        res.status(500).json({
            success: false,
            message: '添加用户失败'
        });
    }
}

// 获取用户信息
export async function bcGetUser(req, res) {
    try {
        const { username } = req.params;
        const contract = await initializeContract();
        
        const resultBytes = await contract.evaluateTransaction('GetUser', username);
        const resultJson = utf8Decoder.decode(resultBytes);
        const result = JSON.parse(resultJson);
        
        logger.info('bcGetUser result: ', result);
        res.json({ success: true, user: result });
    } catch (error) {
        logger.error('bcGetUser fail', error);
        res.status(500).json({
            success: false,
            message: '获取用户信息失败'
        });
    }
}

// 获取用户代币余额
export async function bcGetTokenBalance(req, res) {
    try {
        const { username } = req.params;
        const contract = await initializeContract();
        
        const resultBytes = await contract.evaluateTransaction('GetTokenBalance', username);
        const resultJson = utf8Decoder.decode(resultBytes);
        const result = JSON.parse(resultJson);
        
        logger.info('bcGetTokenBalance result: ', result);
        res.json({ success: true, tokenBalance: result });
    } catch (error) {
        logger.error('bcGetTokenBalance fail', error);
        res.status(500).json({
            success: false,
            message: '获取用户代币余额失败'
        });
    }
}

// 设置用户代币余额
export async function bcSetTokenBalance(req, res) {
    try {
        const { username, balance } = req.body;
        const contract = await initializeContract();
        
        logger.info(`bcSetTokenBalance, username: ${username}, balance: ${balance}`);
        await contract.submitTransaction('SetTokenBalance', username, balance);
        
        res.json({ success: true, message: '代币余额设置成功' });
    } catch (error) {
        logger.error('bcSetTokenBalance fail', error);
        res.status(500).json({
            success: false,
            message: '设置用户代币余额失败'
        });
    }
}

// 增加用户代币余额
export async function bcAddTokenBalance(req, res) {
    try {
        const { username, balance } = req.body;
        const contract = await initializeContract();
        
        logger.info(`bcAddTokenBalance, username: ${username}, balance: ${balance}`);
        await contract.submitTransaction('AddTokenBalance', username, balance);
        
        res.json({ success: true, message: '代币余额增加成功' });
    } catch (error) {
        logger.error('bcAddTokenBalance fail', error);
        res.status(500).json({
            success: false,
            message: '增加用户代币余额失败'
        });
    }
}

// 转移锁定的代币余额
export async function bcTransferLockedTokenBalance(req, res) {
    try {
        const { username, balance } = req.body;
        const contract = await initializeContract();
        
        logger.info(`bcTransferLockedTokenBalance, username: ${username}, balance: ${balance}`);
        await contract.submitTransaction('TransferLockedTokenBalance', username, balance);
        
        res.json({ success: true, message: '锁定代币余额转移成功' });
    } catch (error) {
        logger.error('bcTransferLockedTokenBalance fail', error);
        res.status(500).json({
            success: false,
            message: '转移锁定代币余额失败'
        });
    }
}

// 转移代币
export async function bcTransferTokens(req, res) {
    try {
        const { from, to, amount } = req.body;
        const contract = await initializeContract();
        
        logger.info(`bcTransferTokens, from: ${from}, to: ${to}, amount: ${amount}`);
        await contract.submitTransaction('transferTokens', from, to, amount);
        
        res.json({ success: true, message: '代币转移成功' });
    } catch (error) {
        logger.error('bcTransferTokens fail', error);
        res.status(500).json({
            success: false,
            message: '代币转移失败'
        });
    }
}
