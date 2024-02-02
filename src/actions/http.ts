// Types
import type { NostrEvent } from 'nostr-tools';
import type { ActionResponse } from '../types/actions';

export default async function (event: NostrEvent, res: ActionResponse) {
  console.info('Executed HTTP');
  console.dir(event);

  try {
    const args = JSON.parse(event.content);

    const { url, ...rest } = args;
    const httpResponse = await fetch(url, rest);

    res({
      kind: 20001,
      content: JSON.stringify(await httpResponse.json()),
      tags: [],
      created_at: Math.floor(Date.now() / 1000),
    });
  } catch (e) {
    console.error(e);
  }
}
