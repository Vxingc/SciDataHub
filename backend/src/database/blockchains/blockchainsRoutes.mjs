import express from 'express';
import {
    addBlockchain,
    getAllBlockchains,
    getBlockchainByName,
    updateBlockchain,
    deleteBlockchain
} from './blockchainsService.mjs';

const router = express.Router();

// 区块链相关路由
router.get('/getblockchains', getAllBlockchains);
router.get('/blockchain/:name', getBlockchainByName);
router.post('/blockchain', addBlockchain);
router.put('/blockchain/:name', updateBlockchain);
router.delete('/blockchain/:name', deleteBlockchain);

export default router;