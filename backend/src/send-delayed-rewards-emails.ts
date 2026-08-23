/**
 * One-off send: delayed rewards apology emails to participants identified
 * when physical stock ran out before their payment was confirmed.
 *
 * Usage:
 *   node --env-file=.env --import tsx src/send-delayed-rewards-emails.ts
 *   node --env-file=.env --import tsx src/send-delayed-rewards-emails.ts --dry-run
 */

import type { Language } from "./types.js";
import type { DelayedRewardKey } from "./email/locales/types.js";
import { sendDelayedRewardsEmail } from "./services/email.js";

interface Recipient {
  name: string;
  email: string;
  participantId: string;
  language: Language;
  delayedRewardKeys: DelayedRewardKey[];
  hasEventDayRewards: boolean;
}

const RECIPIENTS: Recipient[] = [
  {
    name: "Jacob",
    email: "jacobcrane6@gmail.com",
    participantId: "R4U-2TFPZB",
    language: "English",
    delayedRewardKeys: ["running_socks"],
    hasEventDayRewards: true,
  },
  {
    name: "TETIANA",
    email: "sunta810@gmail.com",
    participantId: "R4U-2THVT4",
    language: "English",
    delayedRewardKeys: ["running_socks"],
    hasEventDayRewards: true,
  },
  {
    name: "Michaël",
    email: "michaeldesloover@hotmail.com",
    participantId: "R4U-2TSQ5M",
    language: "English",
    delayedRewardKeys: ["running_socks"],
    hasEventDayRewards: true,
  },
  {
    name: "Katerina",
    email: "katerina.sustrova@gmail.com",
    participantId: "R4U-2UH5ZT",
    language: "English",
    delayedRewardKeys: ["running_socks"],
    hasEventDayRewards: true,
  },
  {
    name: "Anastasiia",
    email: "anastasiiababych.555@gmail.com",
    participantId: "R4U-329NUV",
    language: "English",
    delayedRewardKeys: ["running_socks"],
    hasEventDayRewards: true,
  },
  {
    name: "Ash",
    email: "ash.siuzdak@gmail.com",
    participantId: "R4U-32FNK4",
    language: "Dutch",
    delayedRewardKeys: ["running_socks"],
    hasEventDayRewards: true,
  },
  {
    name: "Sarah",
    email: "sarah_barasa@gmx.de",
    participantId: "R4U-32GJBN",
    language: "English",
    delayedRewardKeys: ["running_socks"],
    hasEventDayRewards: true,
  },
  {
    name: "Zoriana",
    email: "zoriavyc@gmail.com",
    participantId: "R4U-32M40V",
    language: "English",
    delayedRewardKeys: ["running_socks"],
    hasEventDayRewards: true,
  },
  {
    name: "Jozef",
    email: "yuliya.matsyk@gmail.com",
    participantId: "R4U-32MAQO",
    language: "Ukrainian",
    delayedRewardKeys: ["running_socks"],
    hasEventDayRewards: true,
  },
  {
    name: "Mariia",
    email: "mariaosadchuk@gmail.com",
    participantId: "R4U-32OPMW",
    language: "English",
    delayedRewardKeys: ["running_socks"],
    hasEventDayRewards: true,
  },
  {
    name: "Olesia",
    email: "ole.sergiyko@gmail.com",
    participantId: "R4U-32T5FD",
    language: "Ukrainian",
    delayedRewardKeys: ["running_socks"],
    hasEventDayRewards: true,
  },
  {
    name: "Hedvig",
    email: "riiarosin@gmail.com",
    participantId: "R4U-338YOF",
    language: "English",
    delayedRewardKeys: ["running_socks", "t_shirt"],
    hasEventDayRewards: true,
  },
  {
    name: "Nadiya",
    email: "nadeshda-1974@hotmail.com",
    participantId: "R4U-33BIBV",
    language: "Dutch",
    delayedRewardKeys: ["running_socks"],
    hasEventDayRewards: true,
  },
];

const dryRun = process.argv.includes("--dry-run");

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

console.log(
  dryRun
    ? `Dry run: would send ${RECIPIENTS.length} delayed rewards emails`
    : `Sending ${RECIPIENTS.length} delayed rewards emails…`,
);
console.log();

let sent = 0;
let failed = 0;

for (const recipient of RECIPIENTS) {
  const label = `${recipient.email} (${recipient.participantId})`;
  if (dryRun) {
    console.log(`  [dry-run] ${label} — ${recipient.delayedRewardKeys.join(", ")}`);
    sent++;
    continue;
  }

  try {
    await sendDelayedRewardsEmail(
      {
        name: recipient.name,
        email: recipient.email,
        participantId: recipient.participantId,
        delayedRewardKeys: recipient.delayedRewardKeys,
        hasEventDayRewards: recipient.hasEventDayRewards,
      },
      recipient.language,
    );
    console.log(`  ✓ ${label}`);
    sent++;
    await sleep(500);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`  ✗ ${label}: ${message}`);
    failed++;
  }
}

console.log();
console.log(`Done. Sent: ${sent}, failed: ${failed}`);
if (failed > 0) process.exit(1);
