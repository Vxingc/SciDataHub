import { dbDeleteDatasetTable, dbInitDatasetTable, dbGetPublicDatasets } from '../../../src/database/datasets/datasetsTable.mjs';
import { addDemoDatasets } from '../../../src/database/datasets/datasetsDemo.mjs';

import logger from '../src/utils/log.mjs';

await dbDeleteDatasetTable('Physics');
await dbDeleteDatasetTable('Biology');
await dbDeleteDatasetTable('Medicine');
await dbDeleteDatasetTable('ArtificialIntelligence');
await dbDeleteDatasetTable('CyberSecurity');

await dbInitDatasetTable('Physics');
await dbInitDatasetTable('Biology');
await dbInitDatasetTable('Medicine');
await dbInitDatasetTable('ArtificialIntelligence');
await dbInitDatasetTable('CyberSecurity');

await addDemoDatasets();

const PhysicsPublicDatasets = await dbGetPublicDatasets('Physics');
logger.debug(`PhysicsPublicDatasets: ${JSON.stringify(PhysicsPublicDatasets, null, 2)}`);

const BiologyPublicDatasets = await dbGetPublicDatasets('Biology');
logger.debug(`BiologyPublicDatasets: ${JSON.stringify(BiologyPublicDatasets, null, 2)}`);

const MedicinePublicDatasets = await dbGetPublicDatasets('Medicine');
logger.debug(`MedicinePublicDatasets: ${JSON.stringify(MedicinePublicDatasets, null, 2)}`);

const AIPublicDatasets = await dbGetPublicDatasets('ArtificialIntelligence');
logger.debug(`AIPublicDatasets: ${JSON.stringify(AIPublicDatasets, null, 2)}`);

const CyberSecurityPublicDatasets = await dbGetPublicDatasets('CyberSecurity');
logger.debug(`CyberSecurityPublicDatasets: ${JSON.stringify(CyberSecurityPublicDatasets, null, 2)}`);


