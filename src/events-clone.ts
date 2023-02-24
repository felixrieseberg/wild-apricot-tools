import ora from "ora";

import { cloneWaEvent, getWaEvent, updateWaEvent } from "./wildapricot.js";
import { DRY_RUN, EVENT_ID, EVENT_NAME, VERBOSE } from "./config.js";
import { WildApricot } from "./interfaces.js";
import { format, formatISO } from "date-fns";
import { getDatesFromSchedule } from "./events.js";

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
      Name: EVENT_NAME,
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

    spinner.stopAndPersist({
      text: `Added event from ${startDate} to ${endDate} with id ${clonedEventId}`,
    });
  }
}
