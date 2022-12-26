import ora from "ora";

import { getWaEvents, updateWaEvent } from "./wildapricot.js";
import {
  DRY_RUN,
  NEW_EVENT_NAME,
  OLD_EVENT_NAME,
  START_DATE,
} from "./config.js";
import { WildApricot } from "./interfaces.js";
import { getEventName } from "./helpers.js";

async function loadWaEvents() {
  const spinner = ora(`Getting events from Wild Apricot`).start();

  try {
    const events = await getWaEvents({
      startDate: START_DATE,
      eventName: OLD_EVENT_NAME,
    });

    spinner.succeed(`Got ${events.length} Wild Apricot events`);
    return events;
  } catch (error) {
    spinner.fail(`Could not get Wild Apricot events. The error was:`);
    console.log(error);
    process.exit();
  }
}

async function loadUpdateWaEvent(event: WildApricot.Event) {
  const name = getEventName(event);
  const spinner = ora(`Updating ${name}`).start();

  try {
    const updatedEvent = await updateWaEvent({
      Id: event.Id,
      Name: NEW_EVENT_NAME,
    });

    spinner.succeed(`Updated to ${getEventName(updatedEvent)}`);
  } catch (error) {
    spinner.fail(`Could not update Wild Apricot event ${name}. The error was:`);
    console.log(error);
  }
}

export async function renameEvents() {
  // Get matching events
  const events = await loadWaEvents();

  // Update the events
  for (const event of events) {
    console.log(`• ${getEventName(event)}`);

    if (!DRY_RUN && NEW_EVENT_NAME) {
      await loadUpdateWaEvent(event);
    }
  }
}
