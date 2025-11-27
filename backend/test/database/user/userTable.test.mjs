import { dbDeleteUserTable, dbInitUserTable, dbAddUser, dbGetUserByUsername, dbDeleteUser } from '../database/userTable.mjs';

await dbDeleteUserTable();
await dbInitUserTable();
await dbAddUser('test', 'test');
const user = await dbGetUserByUsername('test');
console.log(user);
await dbDeleteUser(user.username);
