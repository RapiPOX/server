import type { EventTemplate, NostrEvent } from 'nostr-tools';

export interface Signer {
  getPublicKey: () => string;
  signEvent: (event: EventTemplate) => NostrEvent;
}
