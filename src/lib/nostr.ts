import { EventTemplate } from 'nostr-tools';

export const generateZapEvent = (
  amountMillisats: number,
  relays: string[],
  postEventId?: string,
): EventTemplate => {
  const unsignedEvent: EventTemplate = {
    kind: 9734,
    content: '',
    created_at: Math.round(Date.now() / 1000),
    tags: [
      ['relays', ...relays],
      ['amount', amountMillisats.toString()],
      ['lnurl', 'lnurl'],
    ] as string[][],
  };

  postEventId && unsignedEvent.tags.push(['e', postEventId]);
  return unsignedEvent;
};
