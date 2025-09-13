import { deleteDatasetTable, initDatasetTable, getPublicDatasets } from '../database/datasetTable.mjs';
import { addDemoDatasets } from '../dataset.mjs';

import logger from '../log.mjs';

await deleteDatasetTable('Physics');
await deleteDatasetTable('Biology');
await deleteDatasetTable('Medicine');
await deleteDatasetTable('ArtificialIntelligence');
await deleteDatasetTable('CyberSecurity');

await initDatasetTable('Physics');
await initDatasetTable('Biology');
await initDatasetTable('Medicine');
await initDatasetTable('ArtificialIntelligence');
await initDatasetTable('CyberSecurity');

await addDemoDatasets();

const PhysicsPublicDatasets = await getPublicDatasets('Physics');
logger.debug(`PhysicsPublicDatasets: ${JSON.stringify(PhysicsPublicDatasets, null, 2)}`);

const BiologyPublicDatasets = await getPublicDatasets('Biology');
logger.debug(`BiologyPublicDatasets: ${JSON.stringify(BiologyPublicDatasets, null, 2)}`);

const MedicinePublicDatasets = await getPublicDatasets('Medicine');
logger.debug(`MedicinePublicDatasets: ${JSON.stringify(MedicinePublicDatasets, null, 2)}`);

const AIPublicDatasets = await getPublicDatasets('ArtificialIntelligence');
logger.debug(`AIPublicDatasets: ${JSON.stringify(AIPublicDatasets, null, 2)}`);

const CyberSecurityPublicDatasets = await getPublicDatasets('CyberSecurity');
logger.debug(`CyberSecurityPublicDatasets: ${JSON.stringify(CyberSecurityPublicDatasets, null, 2)}`);


