import type { EventTemplate, NostrEvent } from 'nostr-tools';

export type Action = (
  event: NostrEvent,
  res: ActionResponse,
  context: any,
) => Promise<void>;

export type ActionIndex = { [key: string]: Action };

export type ActionResponse = (response: EventTemplate) => Promise<void>;
