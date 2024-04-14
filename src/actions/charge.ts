// Types
import { type NostrEvent } from 'nostr-tools';
import type { ActionResponse } from '../types/actions';
import { LNURLResponse } from '../types/lnurl';

// Libs
import { claimInvoice, generateInvoice } from '../lib/ln';
import signer from '../services/signer';
import { generateZapEvent } from '../lib/nostr';

// Thirdparty
import axios from 'axios';
import { NDKEvent } from '@nostr-dev-kit/ndk';

// Constants
import { modulePubkeys } from '../constants/federation.json';
const ledgerPublicKey = modulePubkeys.ledger;
const urlxPublicKey = modulePubkeys.urlx;
const TIMEOUT = 5000;

// Setup
const publicKey = signer.getPublicKey();
const invoiceCallback = `https://api.lawallet.ar/lnurlp/${publicKey}/callback`;

export default async function (event: NDKEvent, res: ActionResponse) {
  console.info('Executed HTTP');
  console.dir(event);

  try {
    const args = JSON.parse(event.content);
    const { pubkeys, lnurlw, amount } = args;

    // Get the LNURLw callback response
    const lnurlwResponse = (await (
      await fetch(lnurlw)
    ).json()) as LNURLResponse;

    // Generate zapEvent
    const unsignedZapEvent = generateZapEvent(
      publicKey,
      amount,
      [event.relay!.url],
      event.id,
    );
    const zapEvent = signer.signEvent(unsignedZapEvent);

    // Generate Invoice
    const invoice = await generateInvoice(invoiceCallback, amount, zapEvent);

    // Claim the invoice to LNURLw
    await claimInvoice(lnurlwResponse, invoice);

    // Subscribe to the zapReceipt
    const sub = event.ndk!.subscribe(
      { kinds: [9735], '#e': [zapEvent.id], authors: [urlxPublicKey] },
      {
        closeOnEose: false,
      },
    );

    // Wait for zapReceipt or timeout
    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        sub.removeAllListeners();
        sub.stop();
        reject(new Error('Timeout'));
      }, TIMEOUT);

      sub.on('event', (event: NDKEvent) => {
        clearTimeout(timer);
        sub.removeAllListeners();
        sub.stop();
        resolve(event);
      });
    });

    // Respond to res object with response
    res({
      kind: 20001,
      content: JSON.stringify({
        success: true,
      }),
      tags: [],
      created_at: Math.floor(Date.now() / 1000),
    });

    // Create a transaction splited for the pubkeys
    const transactions: NostrEvent[] = pubkeys.map((pubkey: string) => {
      return signer.signEvent({
        kind: 20002,
        content: JSON.stringify({
          tokens: {
            BTC: Math.floor(amount / pubkeys.length),
          },
        }),
        tags: [
          ['p', ledgerPublicKey],
          ['p', pubkey], // Send to the pubkey
          ['t', 'internal-transaction-start'],
        ],
        created_at: Math.floor(Date.now() / 1000),
      });
    });

    // Send every transactions to the API Gateway
    transactions.forEach((transaction) => {
      axios.post('https://api.lawallet.ar/publish', transaction);
    });
  } catch (e: unknown) {
    console.info(e);
    res({
      kind: 20001,
      content: JSON.stringify({
        success: true,
        error: (e as Error).message,
      }),
      tags: [['error', (e as Error).message]],
      created_at: Math.floor(Date.now() / 1000),
    });
  }
}
