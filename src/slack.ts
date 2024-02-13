import { UsersListResponse, WebClient } from "@slack/web-api";
import { Member } from "@slack/web-api/dist/response/UsersListResponse.js";
import { SLACK_TOKEN } from "./config.js";

let _webClient: WebClient;
function getWebClient() {
  if (_webClient) return _webClient;
  return (_webClient = new WebClient(SLACK_TOKEN));
}

export async function getSlackUsers() {
  const members: Member[] = [];

  for await (const page of getWebClient().paginate("users.list", {
    limit: 200,
  })) {
    const response = page as UsersListResponse;

    if (!response || !response.members) {
      console.warn(
        `Slack users.list response page contained no members`,
        response,
      );
      continue;
    }

    for (const member of response.members) {
      if (
        member.is_app_user ||
        member.is_bot ||
        member.is_workflow_bot ||
        member.deleted ||
        member.name === "slackbot"
      ) {
        continue;
      }

      members.push(member);
    }
  }

  return members;
}
