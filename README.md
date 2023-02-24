# wild-apricot-tools
A collection of scripts I use with Wild Apricot.

## Slack Sync
You have a Wild Apricot community with members. You want to sync the list of members with users in a Slack workspace.

This tool will download all members from a Wild Apricot community, compare the email addresses with the users in a Slack workspace, and spit out a report of which Wild Apricot members need to be invited to Slack. It will also download all users from that Slack workspace, see if all of them are paying members in your Wild Apricot community, and spit out a report of which Slack users need to be deactivated.

Because Slack limits fully automated invites to Enterprise plans only, this tool will not automatically invite members. Instead, it'll give you a list of email addresses you can paste into Slack's "Invite users" dialog.

### Usage

```
--wild-apricot-api-key="abc..."     Wild Apricot API Key
--slack-token="xo..."               Slack Bot Token
--start-date="2024-12-31"           Start Date (used with "greater or equal")
--verbose                           Enable verbose mode
```

```
npx wild-apricot-tools slack-sync --wild-apricot-api-key="etwl..." --slack-token="xoxb-..."
```

Then, find a file called `wild-apricot-slack-sync-report.txt` in your working directory. It'll contain a list of people to invite and to deactivate.

## Get Event
Gets the JSON representation of a given event id.

### Usage

```
--wild-apricot-api-key="abc..."     Wild Apricot API Key
--event-id="123456"                 Event Id
--out="out.json"                    (Optional) writes the data to a file
--verbose                           Enable verbose mode
```

```
npx wild-apricot-tools get-event --event-id="123456" --wild-apricot-api-key="..."
```

## Update Events
You have a bunch of events. You would like to update them all.

### Usage

```
--wild-apricot-api-key="abc..."     Wild Apricot API Key
--event-name="[Swim]..."            Event Name
--start-date="2024-12-25"           When do we start looking for events?
--data="data.json"                  Path to a JSON file containing updates - or raw JSON
--data="{ Name: \"New Name\"}"
--dry-run                           Dry run only, only print events to update
--verbose                           Enable verbose mode
```

```
npx wild-apricot-tools update-events --start-date="2023-01-01" --event-name="[Swim] Masters Swim" 
--wild-apricot-api-key="..." --data="data.json"
```

#### Update Data
The update data will be sent directly to Wild Apricot. For the data model, please see
[API docs](https://app.swaggerhub.com/apis-docs/WildApricot/wild-apricot_public_api/7.24.0) and look for the model "EventEditParams". 

Please note that the passed edit data will be deep-merged using Lodash's merge function. This is useful if you want to, for instance, just edit the event description:

```json
{
  "Details": {
    "DescriptionHtml": "My new description"
  }
}
```

## Clone Event
You have one event. You want it cloned, say, every week for the rest of the year. Uses the current system's time zone.

### Usage

```
--wild-apricot-api-key="abc..."     Wild Apricot API Key
--event-id="123456"                 Id of the event to clone
--schedule="weekly"                 Schedule to use. Only "weekly" is supported.
--end-date="2024-12-25"             End date.
--dry-run                           Dry run only, only print events to create.
--verbose                           Enable verbose mode
```

```
npx wild-apricot-tools clone-events --event-id="12345" --end-date="2023-12-01" --schedule="weekly" --wild-apricot-api-key="..."
```

## Getting a Wild Apricot API Key

Please see https://gethelp.wildapricot.com/en/articles/180-authorizing-external-applications

## Getting a Slack Token

1. Visit [https://api.slack.com/apps/](https://api.slack.com/apps/) and sign in to your workspace.
2. Click `Create New App`, enter a name (e.g., `wild-apricot-slack-sync`), and select your workspace.
3. When prompted for an App Manifest, just paste in the contents of the `slack-manifest.yaml` file in the root of this repo.
4. Select `Install to Workspace` at the top of that page (or `Reinstall to Workspace` if you have done this previously) and accept at the prompt.
5. Copy the `OAuth Access Token` (which will generally start with `xoxb`)

## License

MIT, please see License.md for details.
