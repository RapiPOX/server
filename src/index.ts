// Main depedencies
import 'dotenv/config';
import 'websocket-polyfill';

// Thirdpaty
import { Relay } from 'nostr-tools';

// Local
import signer from './services/signer';
import ActionManager from './services/actionManager';
import { getActions } from './lib/utils';
import path from 'path';

// start server
const start = async () => {
  const publicKey = signer.getPublicKey();
  const relayUrl = process.env.RELAY_URL!;

  console.info('Starting Server...');
  console.info('Subscribing events directed to this public key:', publicKey);

  const actions = await getActions(path.join(__dirname, 'actions'));

  const relay = await Relay.connect(relayUrl);
  const actionManager = new ActionManager(actions, relay);

  // Subscribe for events addresed to me
  relay.subscribe(
    [
      {
        kinds: [20001], // Ephemeral
        '#p': [publicKey],
        since: Math.floor(Date.now() / 1000),
      },
    ],
    {
      onevent(event) {
        actionManager.handleEvent(event);
      },
      onclose() {
        console.error('Connection closed!');
      },
    },
  );

  await relay.connect();
  console.info(`Connected to ${relayUrl}`);
};

start();
