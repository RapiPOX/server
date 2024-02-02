// Thirdparty
import {
  type EventTemplate,
  type NostrEvent,
  finalizeEvent,
  getPublicKey,
} from 'nostr-tools';

// Local
import { Signer } from '../types/signer';

// Gets private key from environment
const privateKey = Uint8Array.from(
  Buffer.from(process.env.PRIVATE_KEY!, 'hex'),
);
const publicKey = getPublicKey(privateKey);

// console.info(`publicKey: ${publicKey}`);
// console.info(`privateKey: ${Buffer.from(privateKey.buffer).toString('hex')}`);

const signer: Signer = {
  getPublicKey: () => {
    return publicKey;
  },
  signEvent: (event: EventTemplate): NostrEvent => {
    return finalizeEvent(event, privateKey);
  },
};

export default signer;
