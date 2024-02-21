import { NDKEvent } from '@nostr-dev-kit/ndk';
import type { EventTemplate } from 'nostr-tools';

export type Action = (
  event: NDKEvent,
  res: ActionResponse,
  context: any,
) => Promise<void>;

export type ActionIndex = { [key: string]: Action };

export type ActionResponse = (response: EventTemplate) => Promise<void>;
