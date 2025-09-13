import { randStr, hash } from '../utils.mjs';
import logger from '../log.mjs';


async function testRandStr(){
    // 生成10个长度为10 的随机字符串
    logger.info("generate 10 random strings:");
    for (let i = 0; i < 10; i++) {
        const str = await randStr(10);
        logger.debug(str);
    }
}

async function testHash(){
    // 为10个随机生成的字符串计算hash
    logger.info("generate 10 random strings and hash them:");
    for (let i = 0; i < 10; i++) {
        const str = await randStr(10);
        const hashResult = await hash(str);
        logger.debug(`preImage: ${str} \nhashResult: ${hashResult}`);
    }
}

async function main() {
    await testRandStr();
    await testHash();
}

main();