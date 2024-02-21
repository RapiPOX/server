// Types
import { getPublicKey, type NostrEvent } from 'nostr-tools';
import type { ActionResponse } from '../types/actions';
import { LNURLw } from '../types/lnurl';
import signer from '../services/signer';
import { generateInvoice } from '../lib/ln';
import { generateZapEvent } from '../lib/nostr';
import { NDKEvent } from '@nostr-dev-kit/ndk';

const publicKey = signer.getPublicKey();
const invoiceCallback = `https://api.lawallet.ar/lnurlp/${publicKey}/callback`;

export default async function (event: NDKEvent, res: ActionResponse) {
  console.info('Executed HTTP');
  console.dir(event);

  try {
    const args = JSON.parse(event.content);

    const { pubkeys, lnurlw, amount } = args;

    // Get the LNURLw callback response
    const lnurlwResponse = (await (await fetch(lnurlw)).json()) as LNURLw;
    const withdrawCallbackUrl = lnurlwResponse.callback;

    // Generate zapEvent
    const unsignedZapEvent = generateZapEvent(
      amount,
      [event.relay!.url],
      event.id,
    );
    const zapEvent = signer.signEvent(unsignedZapEvent);

    // Generate Invoice
    const invoice = await generateInvoice(
      withdrawCallbackUrl,
      amount,
      zapEvent,
    );

    // Claim Invoice to callbackurl

    // Wait for zapReceipt or timeout

    // Respond to res object with response

    // res({
    //   kind: 20001,
    //   content: JSON.stringify(jsonResponse),
    //   tags: [],
    //   created_at: Math.floor(Date.now() / 1000),
    // });

    // Create a transaction splited for the pubkeys

    const claimResponse = await (await fetch(lnurlw)).json();
  } catch (e: unknown) {
    console.info(e);
    res({
      kind: 20001,
      content: 'Error',
      tags: [['error', (e as Error).message]],
      created_at: Math.floor(Date.now() / 1000),
    });
  }
}
