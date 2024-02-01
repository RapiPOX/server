import {generateSecretKey, getPublicKey} from 'nostr-tools';

const privateKey =
    Uint8Array.from(Buffer.from(process.env.PRIVATE_KEY!, 'hex'));
const publicKey = getPublicKey(privateKey);

console.info(`publicKey: ${publicKey}`);
console.info(`privateKey: ${Buffer.from(privateKey.buffer).toString('hex')}`);

export {
  getPublicKey:
      () => {
        return publicKey;
      }
};