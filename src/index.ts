import 'dotenv/config';
import 'websocket-polyfill';

import actions from './actions';
import { Event, NostrEvent, Relay, getPublicKey } from 'nostr-tools';
import signer from './services/signer';

const handleEvent = async (event: NostrEvent) => {
  console.info('Handling Event');
  const action = event.tags.find((tag) => tag[0] === 'action')![1];
  console.info('ACTION: ', action);

  if (!(action in actions)) {
    console.info('No action found for event:', event);
    return;
  }
  (actions as { [key: string]: (event: Event) => void })[action](event);
};

const start = async () => {
  const publicKey = signer.getPublicKey();
  const relayUrl = process.env.RELAY_URL!;

  console.info('Starting Server...');
  console.info('Subscribing events directed to this public key:', publicKey);

  const relay = await Relay.connect(relayUrl);

  relay.subscribe(
    [
      {
        kinds: [20001],
        '#p': [publicKey],
        since: Math.floor(Date.now() / 1000),
      },
    ],
    {
      onevent(event) {
        handleEvent(event);
      },
    },
  );

  await relay.connect();
  console.info(`Connected to ${relayUrl}`);
};

start();
