import fs from "fs";

import { getWaEvent } from "./wildapricot.js";
import { EVENT_ID, OUT } from "./config.js";

export async function getEvent() {
  const sourceEvent = await getWaEvent(EVENT_ID);

  console.log(JSON.stringify(sourceEvent, null, 2));

  if (OUT) {
    fs.writeFileSync(OUT, JSON.stringify(sourceEvent, null, 2));
  }
}
