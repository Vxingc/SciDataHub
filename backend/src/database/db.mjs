import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { promisify } from 'util';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 创建数据库连接
const db = new sqlite3.Database(join(__dirname, 'database.db'));

// 自定义 dbRun 函数，确保返回正确的结果对象
export const dbRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                reject(err);
            } else {
                // this 上下文包含 lastID 和 changes 属性
                resolve({
                    lastID: this.lastID,
                    changes: this.changes
                });
            }
        });
    });
};

export const dbGet = promisify(db.get.bind(db));
export const dbAll = promisify(db.all.bind(db));