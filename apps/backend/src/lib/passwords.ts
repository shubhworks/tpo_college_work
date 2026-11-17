import crypto from 'crypto';

const KEY_LEN = 64;

function scrypt(password: string, salt: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        crypto.scrypt(password, salt, KEY_LEN, (err, key) => (err ? reject(err) : resolve(key)));
    });
}

/** Returns `salt:hash` (both hex). */
export async function hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(16);
    const key = await scrypt(password, salt);
    return `${salt.toString('hex')}:${key.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
    const [saltHex, hashHex] = stored.split(':');
    if (!saltHex || !hashHex) return false;
    const expected = Buffer.from(hashHex, 'hex');
    const actual = await scrypt(password, Buffer.from(saltHex, 'hex'));
    return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}
