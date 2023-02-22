import ora from "ora";

import {
  DRY_RUN,
  NEW_EVENT_NAME,
  OLD_EVENT_NAME,
  START_DATE,
} from "./config.js";
import { getEventName } from "./helpers.js";
import { loadUpdateWaEvent, loadWaEvents } from "./events.js";

export async function renameEvents() {
  // Get matching events
  const events = await loadWaEvents({
    startDate: START_DATE,
    eventName: OLD_EVENT_NAME,
  });

  // Update the events
  for (const event of events) {
    console.log(`• ${getEventName(event)}`);

    if (!DRY_RUN && NEW_EVENT_NAME) {
      await loadUpdateWaEvent(event, { Id: event.Id, Name: NEW_EVENT_NAME });
    }
  }
}
