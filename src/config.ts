import commandLineArgs from "command-line-args";

const mainDefinitions = [{ name: "command", defaultOption: true }];

const mainOptions = commandLineArgs(mainDefinitions, {
  stopAtFirstUnknown: true,
});
const argv = mainOptions._unknown || [];
let optionDefinitions: Array<commandLineArgs.OptionDefinition> = [];

export const COMMAND_SLACK_SYNC = "slack-sync";
export const COMMAND_RENAME_EVENTS = "rename-events";
export const COMMAND = mainOptions.command;

const defaultOptions = [
  { name: "wild-apricot-api-key", alias: "w", type: String },
  { name: "verbose", alias: "v", type: Boolean },
  { name: "dry-run", type: Boolean },
];

if (COMMAND === COMMAND_SLACK_SYNC) {
  optionDefinitions = [
    ...defaultOptions,
    { name: "slack-token", alias: "s", type: String }
  ];
} else if (COMMAND === COMMAND_RENAME_EVENTS) {
  optionDefinitions = [
    ...defaultOptions,
    { name: "old-event-name", type: String },
    { name: "new-event-name", type: String },
    { name: "start-date", type: String },
  ];
}

const options = commandLineArgs(optionDefinitions, { argv });

export const WILD_APRICOT_KEY = options["wild-apricot-api-key"];
export const VERBOSE = options["verbose"];
export const DRY_RUN = options["dry-run"];

// Slack-Sync
export const SLACK_TOKEN = options["slack-token"];

// Rename
export const OLD_EVENT_NAME = options["old-event-name"];
export const NEW_EVENT_NAME = options["new-event-name"];
export const START_DATE = options["start-date"];
