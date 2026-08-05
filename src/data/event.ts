export type TierId = "supporter" | "champion" | "patron" | "hero";

export type Tier = {
  id: TierId;
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
    price: 15,
    causeFee: 10,
    logisticsFee: 5,
    rewards: ["Running", "Sticker pack"],
    highlighted: false,
  },
  {
    id: "champion",
    name: "Champion",
    price: 30,
    causeFee: 22,
    logisticsFee: 8,
    rewards: [
      "Running",
      "Sticker pack",
      "Running socks",
      "1 raffle ticket",
    ],
    highlighted: true,
  },
  {
    id: "patron",
    name: "Patron",
    price: 60,
    causeFee: 48,
    logisticsFee: 12,
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
    id: "hero",
    name: "Hero",
    price: 100,
    causeFee: 82,
    logisticsFee: 18,
    rewards: [
      "Running",
      "Sticker pack",
      "Silk scarf from a Ukrainian designer brand",
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
  whydonateShortcode: "KvhGb",
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
