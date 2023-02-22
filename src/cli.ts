import ora from "ora";

import { getWaAccount, getWaAuth } from "./wildapricot.js";
import {
  COMMAND,
  COMMAND_CLONE_EVENT,
  COMMAND_EVENT_REGISTRATIONS,
  COMMAND_RENAME_EVENTS,
  COMMAND_SLACK_SYNC,
  WILD_APRICOT_KEY,
} from "./config.js";
import { slackSync } from "./slack-sync.js";
import { renameEvents } from "./events-rename.js";
import { cloneEvent } from "./events-clone.js";
import { loadEventRegistrations } from "./events-registrations.js";

async function loadWaAuth() {
  let spinner = ora(
    `Authenticating with Wild Apricot (using API KEY ${WILD_APRICOT_KEY})`
  ).start();

  try {
    const auth = await getWaAuth({ apiKey: WILD_APRICOT_KEY });
    spinner.succeed(
      `Authenticated with Wild Apricot (Token: ${auth.access_token})`
    );
  } catch (error) {
    spinner.fail(`Could not get Wild Apricot authentication. The error was:`);
    console.log(error);
    process.exit();
  }
}

async function loadWaAccounts() {
  const spinner = ora(`Getting accounts from Wild Apricot`).start();

  try {
    const account = await getWaAccount();

    spinner.succeed(`Got Wild Apricot Account (Id: ${account.Id})`);
  } catch (error) {
    spinner.fail(`Could not get Wild Apricot account. The error was:`);
    console.log(error);
    process.exit();
  }
}

export async function main() {
  if (!COMMAND) {
    console.log(
      `No command specified. Please see the wild-apricot-tools README!`
    );
    process.exit();
  }

  // Wild Apricot: Get an auth token, get the accounts.
  await loadWaAuth();
  await loadWaAccounts();

  // Figure out what we want to do
  if (COMMAND === COMMAND_SLACK_SYNC) {
    await slackSync();
  } else if (COMMAND === COMMAND_RENAME_EVENTS) {
    await renameEvents();
  } else if (COMMAND === COMMAND_CLONE_EVENT) {
    await cloneEvent();
  } else if (COMMAND === COMMAND_EVENT_REGISTRATIONS) {
    await loadEventRegistrations();
  }
}

main();
