import commandLineArgs from "command-line-args";

const mainDefinitions = [{ name: "command", defaultOption: true }];

const mainOptions = commandLineArgs(mainDefinitions, {
  stopAtFirstUnknown: true,
});
const argv = mainOptions._unknown || [];
let optionDefinitions: Array<commandLineArgs.OptionDefinition> = [];

export const COMMAND_SLACK_SYNC = "slack-sync";
export const COMMAND_RENAME_EVENTS = "rename-events";
export const COMMAND_CLONE_EVENT = "clone-event";
export const COMMAND_EVENT_REGISTRATIONS = "event-registrations";
export const COMMAND = mainOptions.command;

const defaultOptions = [
  { name: "wild-apricot-api-key", alias: "w", type: String },
  { name: "verbose", alias: "v", type: Boolean },
  { name: "dry-run", type: Boolean },
];

if (COMMAND === COMMAND_SLACK_SYNC) {
  optionDefinitions = [
    ...defaultOptions,
    { name: "slack-token", alias: "s", type: String },
  ];
} else if (COMMAND === COMMAND_RENAME_EVENTS) {
  optionDefinitions = [
    ...defaultOptions,
    { name: "old-event-name", type: String },
    { name: "new-event-name", type: String },
    { name: "start-date", type: String },
  ];
} else if (COMMAND === COMMAND_CLONE_EVENT) {
  optionDefinitions = [
    ...defaultOptions,
    { name: "event-id", type: String },
    { name: "schedule", type: String },
    { name: "end-date", type: String },
  ];
} else if (COMMAND_EVENT_REGISTRATIONS) {
  optionDefinitions = [
    ...defaultOptions,
    { name: "event-name", type: String },
    { name: "start-date", type: String },
    { name: "out-file", type: String },
  ];
}

const options = commandLineArgs(optionDefinitions, { argv });

export const WILD_APRICOT_KEY = options["wild-apricot-api-key"];
export const VERBOSE = options["verbose"];
export const DRY_RUN = options["dry-run"];

// Slack-Sync
export const SLACK_TOKEN = options["slack-token"];
checkParameters(COMMAND_RENAME_EVENTS, ["wild-apricot-api-key", "slack-token"]);

// Rename events
export const OLD_EVENT_NAME = options["old-event-name"];
export const NEW_EVENT_NAME = options["new-event-name"];
export const START_DATE = options["start-date"];
checkParameters(COMMAND_RENAME_EVENTS, [
  "wild-apricot-api-key",
  "old-event-name",
  "new-event-name",
  "start-date",
]);

// Clone events
export const EVENT_ID = parseInt(options["event-id"], 10);
export const SCHEDULE = options["schedule"];
export const END_DATE = options["end-date"];
checkParameters(COMMAND_CLONE_EVENT, [
  "wild-apricot-api-key",
  "event-id",
  "schedule",
  "end-date",
]);

// Cancellations
export const EVENT_NAME = options["event-name"];
checkParameters(COMMAND_EVENT_REGISTRATIONS, [
  "wild-apricot-api-key",
  "event-name",
  "start-date",
]);

// Check parameters
function checkParameters(command: string, params: Array<string>) {
  if (COMMAND !== command) return;

  params.forEach((param) => {
    if (options[param] === undefined) {
      console.log(`Missing parameter ${param}. Please consult the readme.`);
      console.log(`This tool will now exit.`);
      process.exit(-1);
    }
  });
}
