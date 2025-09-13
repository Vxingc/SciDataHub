import express from 'express';
import { 
    handleAddBlockchain,
    handleGetAllBlockchains,
    handleGetBlockchainByName,
    handleUpdateBlockchain,
    handleDeleteBlockchain
} from './blockchainsService.mjs';

const router = express.Router();

// 区块链相关路由
router.get('/getblockchains', handleGetAllBlockchains);
router.get('/blockchain/:name', handleGetBlockchainByName);
router.post('/blockchain', handleAddBlockchain);
router.put('/blockchain/:name', handleUpdateBlockchain);
router.delete('/blockchain/:name', handleDeleteBlockchain);

export default router;