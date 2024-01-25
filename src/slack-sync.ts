import { User } from "@slack/web-api/dist/response/UsersInfoResponse";
import ora from "ora";
import fs from "fs";
import path from "path";

import { getWaMembers } from "./wildapricot.js";
import { getSlackUsers } from "./slack.js";
import { VERBOSE } from "./config.js";
import { Member } from "./interfaces.js";

async function loadWaMembers() {
  const spinner = ora(`Getting members from Wild Apricot`).start();

  try {
    const members = await getWaMembers();

    spinner.succeed(`Got ${members.length} Wild Apricot members`);
    return members;
  } catch (error) {
    spinner.fail(`Could not get Wild Apricot members. The error was:`);
    console.log(error);
    process.exit();
  }
}

async function loadSlackUsers() {
  const spinner = ora(`Getting users from Slack`).start();

  try {
    const users = await getSlackUsers();
    spinner.succeed(`Got ${users.length} Slack users (excluding bots & apps)`);
    return users;
  } catch (error) {
    spinner.fail(`Could not get Slack users. The error was:`);
    console.log(error);
    process.exit();
  }
}

async function writeReport(
  toInviteToSlack: Array<Member>,
  toRemoveFromSlack: Array<User>,
) {
  const targetPath = path.join(
    process.cwd(),
    "wild-apricot-slack-sync-report.txt",
  );
  const spinner = ora(`Writing report to disk (${targetPath})`).start();

  let text = `# To invite to Slack:`;
  toInviteToSlack.forEach((v) => {
    text += `\n- ${v.firstName} ${v.lastName} <${v.email}>`;
  });

  text += `\n\n# Paste the following into the Slack invite dialog:\n`;

  let chunk = 0;
  for (let i = 0; i < toInviteToSlack.length; i++) {
    const v = toInviteToSlack[i];

    if (i % 100 === 0) {
      chunk++;
      text += `\n## Chunk ${chunk}\n`;
    }

    text += `${v.email}, `;
  }

  text += `\n\n# To remove from Slack:`;
  toRemoveFromSlack.forEach((v) => {
    text += `\n- ${v.name} <${v.profile?.email}>`;
  });

  try {
    fs.writeFileSync(targetPath, text);
    spinner.succeed(`Wrote report to disk (${targetPath})`);
  } catch (error) {
    spinner.fail(`Could not write report to disk. The error was:`);
    console.log(error);
    process.exit();
  }
}

export async function slackSync() {
  const waMembers = await loadWaMembers();

  // Slack: Get Members
  const slackUsers = await loadSlackUsers();

  // Compare!
  const toInviteToSlack: Array<Member> = [];
  const toRemoveFromSlack: Array<User> = [];

  for (const member of waMembers) {
    const inSlack = slackUsers.some(
      (v) => v.profile?.email?.toLowerCase() === member.email?.toLowerCase(),
    );

    if (VERBOSE) {
      console.log(
        `Wild Apricot Member ${member.firstName} ${member.lastName} <${member.email}> in Slack: ${inSlack}`,
      );
    }

    if (!inSlack) {
      toInviteToSlack.push(member);
    }
  }

  for (const user of slackUsers) {
    const inWaMembers = waMembers.some(
      (v) => v.email.toLowerCase() === user.profile?.email?.toLowerCase(),
    );

    if (VERBOSE) {
      console.log(
        `Slack user ${user.name} <${user.profile?.email}> is Wild Apricot member: ${inWaMembers}`,
      );
    }

    if (!inWaMembers) {
      toRemoveFromSlack.push(user);
    }
  }

  console.log(`To invite to Slack: ${toInviteToSlack.length} members`);
  console.log(`To remove from Slack: ${toRemoveFromSlack.length} users`);

  await writeReport(toInviteToSlack, toRemoveFromSlack);
}
