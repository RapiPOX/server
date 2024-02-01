import { NostrEvent } from 'nostr-tools';

export default function (event: NostrEvent) {
  console.info('Executed HTTP');
  console.dir(event);

  //   return fetch('https://api.nostr.com/events', {
  //     method: 'POST',
  //     body: JSON.stringify({ ...event }),
  //   });
}
