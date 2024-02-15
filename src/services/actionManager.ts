// Thirdparty
import { EventTemplate, NostrEvent, Relay, finalizeEvent } from 'nostr-tools';

// Types
import type { ActionIndex } from '../types/actions';

// Local
import signer from './signer';
import NDK, { NDKEvent } from '@nostr-dev-kit/ndk';

class ActionManager {
  public actions: ActionIndex;
  public relay: NDK;

  constructor(actions: ActionIndex, relay: NDK) {
    console.info(
      `Action Manager Initialized with ${Object.keys(actions).length} actions`,
    );
    this.actions = actions;
    this.relay = relay;
  }

  async handleEvent(event: NostrEvent): Promise<void> {
    const actionTag = event.tags.find((tag: string[]) => tag[0] === 'action');

    if (!actionTag) {
      console.info('Action tag missing for the event:', event);
      return;
    }

    const action = actionTag[1];

    if (!(action in this.actions)) {
      console.info(`Action (${action}) not found on ActionManger:`);
      return;
    }

    console.info('Handling Event...');
    this.actions[action](event, this.respondEvent.bind(this, event), {});
  }

  async respondEvent(
    prevEvent: NostrEvent,
    responseEvent: EventTemplate,
  ): Promise<void> {
    console.info(`Responding to Event: ${prevEvent.id}`);

    responseEvent.tags.push(['p', prevEvent.pubkey]);
    responseEvent.tags.push(['e', prevEvent.id]);
    const event = signer.signEvent(responseEvent);
    await new NDKEvent(this.relay, event).publish();
  }
}

export default ActionManager;
