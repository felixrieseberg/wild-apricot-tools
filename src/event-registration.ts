import { parseISO } from "date-fns";
import {
  EVENT_NAME,
  REGISTRATION_TYPE,
  START_DATE,
  USERS,
  WHEN,
} from "./config";
import { loadWaEvents } from "./events";
import { countdownUntil, extendDateStringWithTimezoneOffset } from "./helpers";
import {
  createWaEventRegistration,
  getWaEvent,
  getWaMembers,
} from "./wildapricot";

export async function registerEvent() {
  // Get the matching users
  const users = await Promise.all(
    USERS.map(async (user) => (await getWaMembers({ simpleQuery: user }))[0]),
  );

  console.log(`\nFound ${users.length} users`);
  console.log(
    users
      .map(
        (user) =>
          `${user.firstName} ${user.lastName} (${user.email}) [${user.id}]`,
      )
      .join("\n"),
  );
  console.log();

  // Get matching events
  const events = await loadWaEvents({
    startDate: START_DATE,
    eventName: EVENT_NAME,
  });

  // Sort the events by date and grab the first one
  const eventCandidate = events.sort((a, b) => {
    const aStartDate = new Date(a.StartDate);
    const bStartDate = new Date(b.StartDate);
    return aStartDate.getTime() - bStartDate.getTime();
  })[0];

  const event = await getWaEvent(eventCandidate.Id);
  const eventStartDate = new Date(event.StartDate);
  console.log(
    `\nRegistering for event: "${event.Name}" (${event.Id}) on ${eventStartDate.toLocaleDateString()}`,
  );

  // Get the registration types
  const registrationType = event.Details.RegistrationTypes.find((type) => {
    return type.Name.toLowerCase() === REGISTRATION_TYPE.toLowerCase();
  });

  if (!registrationType) {
    console.log(
      `Could not find a registration type matching "${REGISTRATION_TYPE}"`,
    );
    console.log(`Available registration types:`);
    console.log(
      event.Details.RegistrationTypes.map(
        (type) => `${type.Name} (${type.Id})`,
      ).join("\n"),
    );
    process.exit();
  }

  // Display when the registration is available from, which is a little akward because incorrect
  console.log(`\nIdentifying when registration is available...`);
  console.log(
    `Registration available from:     ${registrationType.AvailableFrom}`,
  );
  console.log(`Event start date:                ${event.StartDate}`);
  const correctedRegistrationAvailableFrom = extendDateStringWithTimezoneOffset(
    event.StartDate,
    registrationType.AvailableFrom,
  );
  console.log(
    `Corrected:                       ${correctedRegistrationAvailableFrom}`,
  );
  const registrationAvailableFrom = parseISO(
    correctedRegistrationAvailableFrom,
  );
  console.log(
    `Corrected for local time:        ${registrationAvailableFrom.toLocaleString()}`,
  );

  // Wait
  await countdownUntil(registrationAvailableFrom);

  // Let's create a registration
  for (const user of users) {
    console.log(
      `\nRegistering user: ${user.firstName} ${user.lastName} (${user.email}) [${user.id}]`,
    );

    const result = await createWaEventRegistration({
      eventId: event.Id,
      registrationTypeId: registrationType.Id,
      contactId: user.id,
    });

    console.log(result);
  }
}
