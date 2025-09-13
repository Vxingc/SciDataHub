import { deleteUserTable, initUserTable, addUser, getUserByUsername, deleteUser } from '../database/userTable.mjs';

await deleteUserTable();
await initUserTable();
await addUser('test', 'test');
const user = await getUserByUsername('test');
console.log(user);
await deleteUser(user.username);
