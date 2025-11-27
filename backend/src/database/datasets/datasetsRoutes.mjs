import express from 'express';
import { 
    addDataset,
    deleteDataset,
    getAllDatasets,
    getPublicDatasets,
    getDatasetsByOwner,
    getAllDatasetsByOwner,
    getDatasetByName,
    updateDatasetInfo,
    updateDatasetPublicLevel,
    updateDatasetHash,
    updateMaskingDatasetIPFSAddress
} from './datasetsService.mjs';

const router = express.Router();

// 数据集相关路由
router.get('/getPublicDatasets', getPublicDatasets);

router.post('/:blockchainName/addDataset', addDataset);
router.delete('/:blockchainName/:name', deleteDataset);
router.get('/:blockchainName/datasets', getAllDatasets);
router.get('/:blockchainName/datasets/owner/:owner', getDatasetsByOwner);
router.get('/:blockchainName/getAlldatasetsByOwner/:name', getAllDatasetsByOwner);
router.get('/:blockchainName/getDatasetByDatasetName/:name', getDatasetByName);
router.post('/:blockchainName/updateDatasetInfo/:name', updateDatasetInfo);
router.post('/:blockchainName/updateDatasetPublicLevel/:name', updateDatasetPublicLevel);
router.post('/:blockchainName/updateDatasetHash/:name', updateDatasetHash);
router.post('/:blockchainName/updateMaskingDatasetIPFSAddress/:name', updateMaskingDatasetIPFSAddress);

export default router;
