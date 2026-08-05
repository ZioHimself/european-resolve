export type Tier = {
  id:
    | "supporter"
    | "sprinter"
    | "relay-runner"
    | "marathoner"
    | "ultramarathoner";
  name: string;
  tagline: string;
  price: number;
  causeFee: number;
  logisticsFee: number;
  rewards: string[];
  highlighted: boolean;
};

export type CoOrganiser = {
  abbreviation: string;
  name: string;
};

export type PostEventData = {
  thankYouMessage: string;
  impactStatement: string;
  galleryFolderId: string;
  finalStats: {
    raised: number;
    participants: number;
    donors: number;
    chargingStations: number;
  };
};

export type EventDetails = {
  title: string;
  date: string;
  location: string;
  seoDescription: string;
  beneficiary: {
    name: string;
    mission: string;
    url: string;
  };
  goalEur: number;
  whydonateShortcode: string;
  postEvent: PostEventData;
};

export const tiers = [
  {
    id: "supporter",
    name: "Supporter",
    tagline: "Support the mission without running 🪷",
    price: 10,
    causeFee: 10,
    logisticsFee: 0,
    rewards: ["Hear how your donation helped"],
    highlighted: false,
  },
  {
    id: "sprinter",
    name: "Sprinter",
    tagline: "You are always the first to participate! 🙋",
    price: 15,
    causeFee: 12,
    logisticsFee: 3,
    rewards: ["Running", "Sticker pack"],
    highlighted: false,
  },
  {
    id: "relay-runner",
    name: "Relay runner",
    tagline: "Get that baton and carry the mission forward 💪",
    price: 30,
    causeFee: 23,
    logisticsFee: 7,
    rewards: ["Running", "Sticker pack", "Running socks", "1 raffle ticket"],
    highlighted: true,
  },
  {
    id: "marathoner",
    name: "Marathoner",
    tagline: "Go the distance for Ukraine 🚀",
    price: 60,
    causeFee: 45,
    logisticsFee: 15,
    rewards: [
      "Running",
      "Sticker pack",
      "Running t-shirt",
      "Traditional Ukrainian meal",
      "3 raffle tickets",
    ],
    highlighted: false,
  },
  {
    id: "ultramarathoner",
    name: "Ultramarathoner",
    tagline: "Night or day, your commitment is endless 💫",
    price: 100,
    causeFee: 78,
    logisticsFee: 22,
    rewards: [
      "Running",
      "Sticker pack",
      "Silk scarf by a Ukrainian designer brand",
      "Traditional Ukrainian meal",
      "5 raffle tickets",
    ],
    highlighted: false,
  },
] satisfies Tier[];

export const coOrganisers = [
  { abbreviation: "EUB", name: "Embassy of Ukraine in Belgium" },
  { abbreviation: "UV", name: "Ukrainian Voices" },
  { abbreviation: "ER", name: "European Resolve" },
] satisfies CoOrganiser[];

export const eventDetails = {
  title: "35 Years of 🇺🇦 Independence: Charity and Run",
  date: "23 August 2026, 10:00",
  location: "Place du Luxembourg, Brussels, Belgium",
  seoDescription:
    "Join our charity run on 23 August — celebrate 35 years of Ukrainian independence and help raise €3,000 to equip Ukraine's defenders with power in the field.",
  beneficiary: {
    name: "Hurkit",
    mission: "charging stations for defenders",
    url: "https://hurkit.org/",
  },
  goalEur: 3_000,
  whydonateShortcode: "KvhGb",
  postEvent: {
    thankYouMessage:
      "Thank you to every runner, supporter, and donor who made 35 Years of 🇺🇦 Independence: Charity and Run possible. Together we powered hope on the front line.",
    impactStatement:
      "Every euro raised went directly to Hurkit, providing portable charging stations that keep defenders connected and operational in the field.",
    galleryFolderId: "",
    finalStats: {
      raised: 0,
      participants: 0,
      donors: 0,
      chargingStations: 0,
    },
  },
} satisfies EventDetails;
