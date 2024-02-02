import commandLineArgs from "command-line-args";

const mainDefinitions = [{ name: "command", defaultOption: true }];

const mainOptions = commandLineArgs(mainDefinitions, {
  stopAtFirstUnknown: true,
});
const argv = mainOptions._unknown || [];
let optionDefinitions: Array<commandLineArgs.OptionDefinition> = [];

export const COMMAND_SLACK_SYNC = "slack-sync";
export const COMMAND_UPDATE_EVENTS = "update-events";
export const COMMAND_CLONE_EVENT = "clone-event";
export const COMMAND_GET_EVENT = "get-event";
export const COMMAND_EVENT_REGISTRATIONS = "event-registrations";
export const COMMAND_EVENT_REGISTRATION = "event-registration";
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
} else if (COMMAND === COMMAND_UPDATE_EVENTS) {
  optionDefinitions = [
    ...defaultOptions,
    { name: "event-name", type: String },
    { name: "start-date", type: String },
    { name: "data", type: String },
  ];
} else if (COMMAND === COMMAND_CLONE_EVENT) {
  optionDefinitions = [
    ...defaultOptions,
    { name: "event-id", type: String },
    { name: "schedule", type: String },
    { name: "end-date", type: String },
  ];
} else if (COMMAND === COMMAND_EVENT_REGISTRATIONS) {
  optionDefinitions = [
    ...defaultOptions,
    { name: "event-name", type: String },
    { name: "start-date", type: String },
  ];
} else if (COMMAND === COMMAND_GET_EVENT) {
  optionDefinitions = [
    ...defaultOptions,
    { name: "event-id", type: String },
    { name: "out", type: String },
  ];
} else if (COMMAND === COMMAND_EVENT_REGISTRATION) {
  optionDefinitions = [
    ...defaultOptions,
    { name: "event-name", type: String },
    { name: "start-date", type: String },
    { name: "when", type: String },
    { name: "users", type: String, multiple: true },
    { name: "registration-type", type: String },
  ];
}

const options = commandLineArgs(optionDefinitions, { argv });

export const WILD_APRICOT_KEY = options["wild-apricot-api-key"];
export const VERBOSE = options["verbose"];
export const DRY_RUN = options["dry-run"];
export const EVENT_NAME = options["event-name"];

// Slack-Sync
export const SLACK_TOKEN = options["slack-token"];
checkParameters(COMMAND_SLACK_SYNC, ["wild-apricot-api-key", "slack-token"]);

// Rename events
export const DATA = options["data"];
export const START_DATE = options["start-date"];
checkParameters(COMMAND_UPDATE_EVENTS, [
  "wild-apricot-api-key",
  "event-name",
  "start-date",
  "data",
]);

// Get event
export const OUT = options["out"];
checkParameters(COMMAND_GET_EVENT, ["wild-apricot-api-key", "event-id"]);

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
checkParameters(COMMAND_EVENT_REGISTRATIONS, [
  "wild-apricot-api-key",
  "event-name",
  "start-date",
]);

// Get event registration
export const WHEN: string = options["when"];
export const USERS: string[] = options["users"];
export const REGISTRATION_TYPE: string = options["registration-type"];

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
