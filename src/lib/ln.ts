import { NostrEvent } from '@nostr-dev-kit/ndk';
import { LNURLResponse } from '../types/lnurl';
import axios from 'axios';

/**
 *
 * @param amount
 * @returns invoice pay request
 */
export const generateInvoice = async (
  callbackUrl: string,
  amount: number,
  zapEvent?: NostrEvent,
): Promise<string> => {
  let url = `${callbackUrl}?amount=${amount}`;
  if (zapEvent) {
    const encodedZapEvent = encodeURI(JSON.stringify(zapEvent));
    url += `&nostr=${encodedZapEvent}&lnurl=1`;
  }
  return ((await fetch(url)).json() as any).pr as string;
};

export const claimInvoice = async (
  lnurlwResponse: LNURLResponse,
  invoice: string,
): Promise<any> => {
  const url = lnurlwResponse.callback;
  const _response = await axios.get(url, {
    params: { k1: lnurlwResponse.k1, pr: invoice },
  });

  if (_response.status < 200 || _response.status >= 300) {
    throw new Error(`Error al intentar cobrar ${_response.status}}`);
  }
  if (_response.data.status !== 'OK') {
    throw new Error(`Error al intentar cobrar ${_response.data.reason}}`);
  }
  return (await fetch(`${lnurlwResponse.callback}/pr=${invoice}`)).json();
};
