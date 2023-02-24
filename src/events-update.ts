import ora from "ora";
import path from "path";
import fs from "fs";
import lodash from "lodash";

import { DATA, DRY_RUN, EVENT_NAME, START_DATE } from "./config.js";
import { getEventName } from "./helpers.js";
import { loadUpdateWaEvent, loadWaEvents } from "./events.js";
import { WildApricot } from "./interfaces.js";

function getData(): Partial<WildApricot.EventEdit> {
  // Get all the paths to check
  const filePaths = [
    DATA, // Absolute
    path.resolve(process.cwd(), `./${DATA}`), // Relative
  ];

  // Check the paths
  for (const filePath of filePaths) {
    if (fs.existsSync(filePath)) {
      try {
        return JSON.parse(fs.readFileSync(filePath, "utf8"));
      } catch (error) {
        console.log(`Failed to parse ${filePath}. The error was:`);
        console.log(error);
        console.log(`Please check the file and try again.`);
        process.exit(-1);
      }
    }
  }

  // Is the data parameter maybe just JSON?
  try {
    const data = JSON.parse(DATA);

    if (data && Object.keys(data).length > 0) {
      return data;
    }
  } catch (error) {
    // Do nothing.
  }

  // If we get here, we didn't find the file
  console.log(
    `We tried to look for a file at ${DATA} and to load data as JSON, but neither worked.`
  );
  console.log(`Please check the --data input and try again.`);
  process.exit(-1);
}

export async function updateEvents() {
  // Check the data file
  const edit = getData();

  // Get matching events
  const events = await loadWaEvents({
    startDate: START_DATE,
    eventName: EVENT_NAME,
  });

  // Update the events
  for (const event of events) {
    console.log(`• ${getEventName(event)}`);

    // Deep merge the received object and the update
    const finalUpdate = lodash.merge({}, event, edit);

    if (!DRY_RUN) {
      await loadUpdateWaEvent(event, { ...finalUpdate, Id: event.Id });
    } else {
      console.log(`DRY RUN: Would update event with ID ${event.Id} with data:`);
      console.log(JSON.stringify(finalUpdate, null, 2));
    }
  }
}
