export type Tier = {
  id: "supporter" | "champion" | "patron";
  name: string;
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
  description: string;
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
    price: 10,
    causeFee: 6,
    logisticsFee: 4,
    rewards: ["Race bib", "Digital certificate", "Hurkit keychain"],
    highlighted: false,
  },
  {
    id: "champion",
    name: "Champion",
    price: 35,
    causeFee: 25,
    logisticsFee: 10,
    rewards: [
      "Race bib",
      "Digital certificate",
      "Technical race t-shirt",
      "Name on digital wall",
      "Hurkit military branch coin",
      "Hurkit branded sports socks",
    ],
    highlighted: true,
  },
  {
    id: "patron",
    name: "Patron",
    price: 95,
    causeFee: 80,
    logisticsFee: 15,
    rewards: [
      "Race bib",
      "Digital certificate",
      "Technical race t-shirt",
      "Name on digital wall",
      "Hurkit silk scarf",
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
  title: "Run for Ukraine 2026",
  date: "23 August 2026, 10:00",
  location: "Place du Luxembourg, Brussels, Belgium",
  description:
    "Support Ukraine's defenders with reliable power in the field — every kilometre you run funds another hour of critical equipment operation on the front line.",
  beneficiary: {
    name: "Hurkit",
    mission: "charging stations for defenders",
    url: "https://hurkit.org/",
  },
  goalEur: 3_000,
  whydonateShortcode: "nudW7",
  postEvent: {
    thankYouMessage:
      "Thank you to every runner, supporter, and donor who made Run for Ukraine 2026 possible. Together we powered hope on the front line.",
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
