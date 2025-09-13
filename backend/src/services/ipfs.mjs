import { create } from 'kubo-rpc-client';
import fs from 'node:fs';
import logger from './log.mjs';

// 连接ipfs默认接口 http://127.0.0.1:5001
const client = create();

async function addText(text = 'Hello world!') {
    const { cid } = await client.add(text);
    logger.info(cid);
}

async function addFile(path) {
    logger.info(`📤 Adding file ${path} on IPFS ...`);
    try {
        // 上传对应path的文件到IPFS
        const { cid } = await client.add({
            path,
            content: fs.createReadStream(path),
        });
        logger.info(`✅ File added with CID: ${cid}`);
        return cid.toString();
    } catch (error) {
        console.error('Failed to add file:', error);
        throw error;
    }
}

async function cpToMFS(ipfsCID, mfsFolder) {
    logger.info(`📁 Creating folder ${mfsFolder}...`);
    try {
        await client.files.mkdir(mfsFolder, { parents: true });
        logger.info(`✅ Folder created at ${mfsFolder}`)
    } catch (error) {
        console.error('Failed to create folder:', error);
        throw error;
    }

    logger.info(`📤 Copying file to MFS at ${mfsFolder}...`);
    try {
        const sourcePath = `/ipfs/${ipfsCID}`;
        await client.files.cp(sourcePath, mfsFolder);
        logger.info(`✅ File added to MFS at ${mfsFolder}`);
    } catch (error) {
        console.error('Failed to add file to MFS:', error);
        throw error;
    }
}

async function getTime() {
    const now = new Date();

    // 获取上海时区的时间
    const shanghaiTime = new Intl.DateTimeFormat('zh-CN', {
        timeZone: 'Asia/Shanghai',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).formatToParts(now);

    // 提取各个部分
    const year = shanghaiTime.find(part => part.type === 'year').value;
    const month = shanghaiTime.find(part => part.type === 'month').value;
    const day = shanghaiTime.find(part => part.type === 'day').value;
    const hour = shanghaiTime.find(part => part.type === 'hour').value;
    const minute = shanghaiTime.find(part => part.type === 'minute').value;
    const second = shanghaiTime.find(part => part.type === 'second').value;

    return `${year}/${month}/${day}/${hour}/${minute}/${second}`;
}

async function uploadToIPFS(path, mfsRoot = "/my-file") {
    const ipfsCID = await addFile(path);
    const dateStr = await getTime();
    const mpsFloder = mfsRoot + "/" + dateStr + "/";
    logger.debug(`mpsFolder ${mpsFloder}`);
    logger.debug(`ipfsCID ${ipfsCID}`);
    await cpToMFS(ipfsCID, mpsFloder);
    return ipfsCID;
}

async function downloadFromIPFS(cid) {
    try {
        const path = `/ipfs/${cid}`;
        logger.info(`Downloading file from IPFS: ${path}...`);

        client.get(path);
        logger.info("可以在IPFS中查询到文件，但是目前还不会如何下载这个文件，需要继续研究")
    } catch (error) {
        console.error('Failed to download file:', error);
        throw error;
    }
}
export { uploadToIPFS, downloadFromIPFS };