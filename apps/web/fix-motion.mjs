import fs from "fs";
import { globSync } from "fs";
import path from "path";

const files = [
  "app/app/_components/orchestration-pulse-bar.tsx",
  "app/app/_components/live-operational-event-feed.tsx",
];

const badClose = "</" + "motion" + ">";
const goodClose = "</" + "motion" + ">".replace("motion", "motion"); // noop

for (const f of files) {
  if (!fs.existsSync(f)) continue;
  let s = fs.readFileSync(f, "utf8");
  const before = s;
  s = s.split(badClose).join("</motion>".replace("motion", "div"));
  const bo = "<" + "motion" + ">";
  if (s.includes(bo)) {
    console.log(f, "still has", bo);
  }
  if (s !== before) {
    fs.writeFileSync(f, s);
    console.log("fixed", f);
  }
}
