export type Tier = {
  id:
    | "supporter"
    | "sprinter"
    | "relay-runner"
    | "marathoner"
    | "ultramarathoner";
  name: string;
  price: number;
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
    price: 10,
    highlighted: false,
  },
  {
    id: "sprinter",
    name: "Sprinter",
    price: 15,
    highlighted: false,
  },
  {
    id: "relay-runner",
    name: "Relay runner",
    price: 30,
    highlighted: true,
  },
  {
    id: "marathoner",
    name: "Marathoner",
    price: 60,
    highlighted: false,
  },
  {
    id: "ultramarathoner",
    name: "Ultramarathoner",
    price: 100,
    highlighted: false,
  },
] satisfies Tier[];

export const coOrganisers = [
  { abbreviation: "EUB", name: "Embassy of Ukraine in Belgium" },
  { abbreviation: "UV", name: "Ukrainian Voices" },
  { abbreviation: "ER", name: "European Resolve" },
] satisfies CoOrganiser[];

export const eventDetails = {
  title: "35 Years of Ukraine Independence: Charity and Run",
  date: "23 August 2026, 10:00",
  location: "Place du Luxembourg, Brussels, Belgium",
  seoDescription:
    "Join our charity run on 23 August. Celebrate 35 years of Ukrainian independence and help raise €3,000 to equip Ukraine's defenders with power in the field.",
  beneficiary: {
    name: "Hurkit",
    mission: "charging stations for defenders",
    url: "https://hurkit.org/",
  },
  goalEur: 3_000,
  whydonateShortcode: "KvhGb",
  postEvent: {
    thankYouMessage:
      "Thank you to every runner, supporter, and donor who made 35 Years of Ukraine Independence: Charity and Run possible. Together we powered hope on the front line.",
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
