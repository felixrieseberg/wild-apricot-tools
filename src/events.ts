import ora from "ora";

import {
  getWaEventRegistrations,
  getWaEvents,
  updateWaEvent,
} from "./wildapricot.js";
import { END_DATE, SCHEDULE } from "./config.js";
import { WildApricot } from "./interfaces.js";
import { getEventName } from "./helpers.js";
import { addWeeks, differenceInWeeks, parseISO } from "date-fns";

const SCHEDULES = {
  WEEKLY: "weekly",
};

interface LoadWaEventsOptions {
  startDate: string;
  eventName: string;
}

export async function loadWaEvents(options: LoadWaEventsOptions) {
  const spinner = ora(`Getting events from Wild Apricot`).start();

  try {
    const events = await getWaEvents({
      startDate: options.startDate,
      eventName: options.eventName,
    });

    spinner.succeed(`Got ${events.length} Wild Apricot events`);
    return events;
  } catch (error) {
    spinner.fail(`Could not get Wild Apricot events. The error was:`);
    console.log(error);
    process.exit();
  }
}

export async function loadUpdateWaEvent(
  event: WildApricot.Event,
  edit?: WildApricot.EventEdit
) {
  const name = getEventName(event);
  const spinner = ora(`Updating ${name}`).start();

  try {
    const updatedEvent = await updateWaEvent(edit ? { ...edit } : { ...event });

    spinner.succeed(`Updated to ${getEventName(updatedEvent)}`);
  } catch (error) {
    spinner.fail(`Could not update Wild Apricot event ${name}. The error was:`);
    console.log(error);
  }
}

export async function loadWaEventRegistrations(id: string | number) {
  const spinner = ora(`Getting registrations for event ${id}`).start();
  const registrations = [];

  try {
    registrations.push(...(await getWaEventRegistrations(id)));

    spinner.succeed(
      `Got ${registrations.length} registrations for event ${id}`
    );
  } catch (error) {
    spinner.fail(
      `Could not get registrations for Wild Apricot event ${id}. The error was:`
    );
    console.log(error);
  }

  return registrations;
}

interface DatePair {
  startDate: Date;
  endDate: Date;
}

export function getDatesFromSchedule(
  sourceEvent: WildApricot.Event
): Array<DatePair> {
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
