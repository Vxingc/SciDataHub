import { uploadToIPFS, downloadFromIPFS } from '../ipfs.mjs';
// 在backend文件夹下运行 "npm run ipfs"
async function main() {
    const cid = await uploadToIPFS("./package.json");
    await downloadFromIPFS(cid);

}

main().catch(console.error);