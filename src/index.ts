// Main depedencies
import 'dotenv/config';
import 'websocket-polyfill';

// Thirdparty
import NDK, { NDKKind, NDKRelay } from '@nostr-dev-kit/ndk';

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

  const ndk = new NDK({
    explicitRelayUrls: [relayUrl],
  });

  // const relay = await Relay.connect(relayUrl);
  const actionManager = new ActionManager(actions, ndk);

  // Subscribe for events addressed to me
  ndk.pool.on('relay:connect', (relay: NDKRelay) => {
    console.info(`Connected to ${relayUrl}`);
    const sub = ndk.subscribe(
      [
        {
          kinds: [20001 as NDKKind], // Ephemeral
          '#p': [publicKey],
          since: Math.floor(Date.now() / 1000) - 10000,
        },
      ],
      {
        closeOnEose: false,
      },
    );

    sub.on('event', (event) => {
      console.info('Handling Event...');
      actionManager.handleEvent(event);
    });
  });

  console.info(`Connecting to ${relayUrl}...`);
  await ndk.connect();
};

start();
