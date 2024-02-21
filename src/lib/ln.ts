import { NostrEvent } from '@nostr-dev-kit/ndk';

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
    url = `${callbackUrl}&nostr=${encodedZapEvent}&lnurl=1`;
  }
  return ((await fetch(url)).json() as any).pr as string;
};

export const claimInvoice = async (
  callbackUrl: string,
  pr: string,
): Promise<any> => {
  return (await fetch(`${callbackUrl}/pr=${pr}`)).json();
};
