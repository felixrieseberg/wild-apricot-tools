import ora from "ora";

import {
  cloneWaEvent,
  getWaEvent,
  getWaEvents,
  updateWaEvent,
} from "./wildapricot.js";
import {
  DRY_RUN,
  END_DATE,
  EVENT_ID,
  NEW_EVENT_NAME,
  OLD_EVENT_NAME,
  SCHEDULE,
  START_DATE,
  VERBOSE,
} from "./config.js";
import { WildApricot } from "./interfaces.js";
import { getEventName } from "./helpers.js";
import {
  addWeeks,
  differenceInWeeks,
  format,
  formatISO,
  parseISO,
} from "date-fns";

const SCHEDULES = {
  WEEKLY: "weekly",
};

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
      ...event,
      Name: NEW_EVENT_NAME,
    });

    spinner.succeed(`Updated to ${getEventName(updatedEvent)}`);
  } catch (error) {
    spinner.fail(`Could not update Wild Apricot event ${name}. The error was:`);
    console.log(error);
  }
}

interface DatePair {
  startDate: Date;
  endDate: Date;
}

function getDatesFromSchedule(sourceEvent: WildApricot.Event): Array<DatePair> {
  const result: Array<DatePair> = [];
  const startDate = parseISO(sourceEvent.StartDate);
  const endDate = parseISO(sourceEvent.EndDate);
  const scheduleEndDate = new Date(END_DATE);

  if (SCHEDULE === SCHEDULES.WEEKLY) {
    const weeks = differenceInWeeks(scheduleEndDate, startDate);
    for (let index = 1; index <= weeks; index++) {
      result.push({
        startDate: addWeeks(startDate, index),
        endDate: addWeeks(endDate, index),
      });
    }
  }
  return result;
}

export async function cloneEvent() {
  // Understand the schedule
  const sourceEvent = await getWaEvent(EVENT_ID);
  const datesToCreate = getDatesFromSchedule(sourceEvent);

  console.log(`Determined that we need to add ${datesToCreate.length} events:`);
  for (const { startDate, endDate } of datesToCreate) {
    console.log(
      ` • ${format(startDate, "PPPPpppp")} to ${format(endDate, "PPPPpppp")}`
    );
  }

  if (DRY_RUN) {
    console.log(`DRY RUN: Exiting here.`);
    return;
  }

  // Then, clone the event as often as we have new dates.
  // Then, update the event with the new date.
  for (const { startDate, endDate } of datesToCreate) {
    const spinner = ora(`Adding event from ${startDate} to ${endDate}`).start();

    const clonedEventId = await cloneWaEvent(EVENT_ID);
    const newStartDate = formatISO(startDate);
    const newEndDate = formatISO(endDate);

    const editOptions: WildApricot.EventEdit = {
      Id: clonedEventId,
      Name: sourceEvent.Name,
      StartDate: newStartDate,
      EndDate: newEndDate,
      Details: {
        AccessControl: sourceEvent.Details.AccessControl,
      },
    };

    if (VERBOSE) {
      console.log(`Updating event ${EVENT_ID} with:`);
      console.log(editOptions);
    }

    await updateWaEvent(editOptions);

    spinner.stopAndPersist({ text: `Added event with id ${clonedEventId}` });
  }
}
