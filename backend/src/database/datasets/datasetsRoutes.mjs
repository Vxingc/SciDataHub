import express from 'express';
import { 
    handleAddDataset,
    handleDeleteDataset,
    handleGetAllDatasets,
    handleGetPublicDatasets,
    handleGetDatasetsByOwner,
    handleGetDatasetsByUsername,
    handleGetDatasetByDatasetName,
    handleUpdateDatasetInfo,
    handleUpdateDatasetPublicLevel,
    handleUpdateDatasetHash,
    handleUpdateMaskingDatasetIPFSAddress
} from './datasetsService.mjs';

const router = express.Router();

// 数据集相关路由
router.post('/addDataset/:blockchainName', handleAddDataset);
router.delete('/dataset/:blockchainName/:name', handleDeleteDataset);
router.get('/datasets/:blockchainName', handleGetAllDatasets);
router.get('/getPublicDatasets/:blockchainName', handleGetPublicDatasets);
router.get('/datasets/:blockchainName/owner/:owner', handleGetDatasetsByOwner);
router.get('/getDatasetsByName/:name', handleGetDatasetsByUsername);
router.get('/getDatasetByDatasetName/:blockchainName/:name', handleGetDatasetByDatasetName);
router.post('/updateDatasetInfo/:blockchainName/:name', handleUpdateDatasetInfo);
router.post('/updateDatasetPublicLevel/:blockchainName/:name', handleUpdateDatasetPublicLevel);
router.post('/updateDatasetHash/:blockchainName/:name', handleUpdateDatasetHash);
router.post('/updateMaskingDatasetIPFSAddress/:blockchainName/:name', handleUpdateMaskingDatasetIPFSAddress);

export default router;
