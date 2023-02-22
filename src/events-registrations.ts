import { EVENT_NAME, START_DATE } from "./config.js";
import { getEventName } from "./helpers.js";
import { loadWaEventRegistrations, loadWaEvents } from "./events.js";

// This is currently a bit of a stub because we cannot get cancelled
// registrations from the API. We can only get them from the UI.
export async function loadEventRegistrations() {
  // Get matching events
  const events = await loadWaEvents({
    startDate: START_DATE,
    eventName: EVENT_NAME,
  });

  // Load registrations
  for (const event of events) {
    console.log(
      `• ${getEventName(event)} (${event.Id}) has ${
        event.ConfirmedRegistrationsCount
      } registrations}`
    );

    const registrations = await loadWaEventRegistrations(event.Id);

    for (const registration of registrations) {
      console.log(
        `• ${registration.DisplayName}: ${registration.Status} (${registration.Id}))`
      );
    }
  }
}
