import 'reflect-metadata';
import bcrypt from 'bcrypt';
import {User} from "../src/entities";
import {DB} from "../src/db";


export async function CreateUser(username: string, email: string, rawPassword: string) {

    if (!username || !email || !rawPassword) {
        console.error('Usage: ts-node scripts/register-user.ts <username> <email> <password>');
        process.exit(1);
    }

    await DB.initialize();

    const existing = await DB.getRepository(User).findOneBy({email});
    if (existing) {
        console.error('❌ Email already registered');
        process.exit(1);
    }

    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const user = DB.getRepository(User).create({
        username,
        email,
        password: hashedPassword,
    });

    await DB.getRepository(User).save(user);

    console.log('✅ User registered');
    process.exit(0);
}

const username = 'admin';
const email = 'yaarafoodstore@gmail.com';
const rawPassword = 'yaara';
CreateUser(username, email, rawPassword,).catch((err) => {
    console.error(err);
    process.exit(1);
});