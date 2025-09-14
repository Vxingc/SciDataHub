
import crypto from 'crypto';
export async function randStr(len) {
    let str = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < len; i++) {
        str += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return str;
}

export async function hash(str) {
    const hashfunc = crypto.createHash('sha256');
    hashfunc.update(str);
    const hash = hashfunc.digest('hex');
    return hash;
}

export async function generateIPFSCID() {
    return "Qm" + await randStr(44);
}

export async function generateHashChain(len) {
    const secret = await randStr(64);
    const hashChain = [];
    let tempPreImage = secret;
    for (let i = 0; i < len; i++) {
        const temphash = await hash(tempPreImage);
        hashChain.push(temphash);
        tempPreImage = temphash;
    }
    return hashChain;
}