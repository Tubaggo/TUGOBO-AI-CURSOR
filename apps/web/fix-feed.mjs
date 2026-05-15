import fs from "fs";
const p = "app/app/_components/live-operational-event-feed.tsx";
let s = fs.readFileSync(p, "utf8");
const bo = "<" + "motion" + ">";
const rep =
  '                <div className="flex min-w-0 flex-1 items-start gap-2">';
s = s.replace("                " + bo, rep);
fs.writeFileSync(p, s);
console.log(s.includes(bo) ? "still bad" : "ok");
