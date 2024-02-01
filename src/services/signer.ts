import {
  EventTemplate,
  NostrEvent,
  finalizeEvent,
  getPublicKey,
} from 'nostr-tools';
import { Signer } from '../types/signer';

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
