import commandLineArgs from "command-line-args";

const optionDefinitions = [
  { name: "wild-apricot-api-key", alias: "w", type: String },
  { name: "slack-token", alias: "s", type: String },
  { name: "verbose", alias: "v", type: Boolean },
];
const options = commandLineArgs(optionDefinitions);

export const WILD_APRICOT_KEY = options["wild-apricot-api-key"];
export const SLACK_TOKEN = options["slack-token"];
export const VERBOSE = options["verbose"];
