// Types
import type { NostrEvent } from 'nostr-tools';
import type { ActionResponse } from '../types/actions';

export default async function (event: NostrEvent, res: ActionResponse) {
  console.info('Executed HTTP');
  // console.dir(event);

  try {
    const args = JSON.parse(event.content);

    const { url, ...rest } = args;
    const httpResponse = await fetch(url, rest);

    try {
      const jsonResponse = await httpResponse.json();
      res({
        kind: 20001,
        content: JSON.stringify(jsonResponse),
        tags: [],
        created_at: Math.floor(Date.now() / 1000),
      });
    } catch (e) {
      console.info(`Status code: ${httpResponse.status}`);
      res({
        kind: 20001,
        content: 'invalid json',
        tags: [['error', 'Invalid JSON response from server.']],
        created_at: Math.floor(Date.now() / 1000),
      });
    }
  } catch (e) {
    console.error(e);
  }
}
