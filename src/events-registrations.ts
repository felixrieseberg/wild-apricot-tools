import fs from "fs";

import { EVENT_NAME, START_DATE } from "./config.js";
import { getEventName } from "./helpers.js";
import { loadWaEventRegistrations, loadWaEvents } from "./events.js";
import { WildApricot } from "./interfaces.js";

interface EventWithRegistrations extends WildApricot.Event {
  registrations?: Array<WildApricot.EventRegistration>;
}

// This is currently a bit of a stub because we cannot get cancelled
// registrations from the API. We can only get them from the UI.
export async function loadEventRegistrations() {
  // Get matching events
  const events = await loadWaEvents({
    startDate: START_DATE,
    eventName: EVENT_NAME,
  });

  const result: EventWithRegistrations[] = [...events];

  // Load registrations
  for (const event of result) {
    console.log(
      `• ${getEventName(event)} (${event.Id}) has ${
        event.ConfirmedRegistrationsCount
      } registrations}`,
    );

    event.registrations = await loadWaEventRegistrations(event.Id);

    for (const registration of event.registrations) {
      console.log(
        `• ${registration.DisplayName}: ${registration.Status} (${registration.Id}))`,
      );
    }
  }

  fs.writeFileSync("registrations.json", JSON.stringify(result, null, 2));
  analysis(result);
}

interface AnalysisResult {
  byName: {
    [name: string]: {
      waitlistedCount: number;
      confirmedCount: number;
      waitlisted: string[];
      confirmed: string[];
    };
  };
  byDate: {
    [date: string]: {
      confirmedRegistrations: number;
      onWaitlist: number;
    };
  };
}

async function analysis(events: EventWithRegistrations[]) {
  const result: AnalysisResult = {
    byName: {},
    byDate: {},
  };

  for (const event of events) {
    result.byDate[event.StartDate] = {
      confirmedRegistrations: event.ConfirmedRegistrationsCount,
      onWaitlist: (event.registrations || []).filter((reg) => reg.OnWaitlist)
        .length,
    };

    for (const registration of event.registrations || []) {
      const name = registration.Contact.Name;

      result.byName[name] = result.byName[name] || {
        waitlistedCount: 0,
        confirmedCount: 0,
        waitlisted: [],
        confirmed: [],
      };

      if (registration.OnWaitlist) {
        result.byName[name].waitlisted.push(event.StartDate);
        result.byName[name].waitlistedCount++;
      } else {
        result.byName[name].confirmed.push(event.StartDate);
        result.byName[name].confirmedCount++;
      }
    }
  }

  const sortedForConfirmed = Object.entries(result.byName).sort(
    (a, b) => b[1].confirmedCount - a[1].confirmedCount,
  );
  const sortedForWaitlisted = Object.entries(result.byName).sort(
    (a, b) => b[1].waitlistedCount - a[1].waitlistedCount,
  );

  const arrConfirmed = Object.values(result.byName).map(
    (v) => v.confirmedCount,
  );
  const arrWaitlisted = Object.values(result.byName).map(
    (v) => v.waitlistedCount,
  );

  console.log(`Waitlisted`);
  console.log(
    `  People: ${Object.values(result.byName).filter((v) => v.waitlistedCount > 0).length}`,
  );
  console.log(`  Min: ${getMin(arrWaitlisted)}`);
  console.log(`  Max: ${getMax(arrWaitlisted)}`);
  console.log(`  Avg: ${getAverage(arrWaitlisted)}`);
  console.log(`  Median: ${getMedian(arrWaitlisted)}`);

  console.log(`Confirmed`);
  console.log(
    `  People: ${Object.values(result.byName).filter((v) => v.confirmedCount > 0).length}`,
  );
  console.log(`  Min: ${getMin(arrConfirmed)}`);
  console.log(`  Max: ${getMax(arrConfirmed)}`);
  console.log(`  Avg: ${getAverage(arrConfirmed)}`);
  console.log(`  Median: ${getMedian(arrConfirmed)}`);

  console.log(`Top Winners`);
  sortedForConfirmed.slice(0, 50).forEach((v) => {
    console.log(`  ${v[0]}: ${v[1].confirmedCount}`);
  });

  console.log(`Top Losers`);
  sortedForWaitlisted.slice(0, 50).forEach((v) => {
    console.log(`  ${v[0]}: ${v[1].waitlistedCount}`);
  });

  function getMin(arr: number[] = []) {
    return Math.min(...arr);
  }

  function getMax(arr: number[] = []) {
    return Math.max(...arr);
  }

  function getAverage(arr: number[] = []) {
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  }

  function getMedian(arr: number[] = []) {
    const sorted = Array.from(arr).sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }

    return sorted[middle];
  }

  fs.writeFileSync("analysis.json", JSON.stringify(result, null, 2));
}
