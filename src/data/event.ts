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
};

export const tiers = [
  {
    id: "supporter",
    name: "Supporter",
    price: 10,
    causeFee: 6,
    logisticsFee: 4,
    rewards: ["Race bib", "Finisher medal", "Digital certificate", "Hurkit keychain"],
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
      "Finisher medal",
      "Digital certificate",
      "Technical race t-shirt",
      "Finisher pack",
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
      "Finisher medal",
      "Digital certificate",
      "Technical race t-shirt",
      "Finisher pack",
      "Name on digital wall",
      "Embroidered finisher hoodie",
      "Reserved starting corral",
      "Post-race reception invite",
      "Hurkit silk scarf",
    ],
    highlighted: false,
  },
] satisfies Tier[];

export const coOrganisers = [
  { abbreviation: "EUB", name: "Embassy of Ukraine in Belgium" },
  { abbreviation: "UV", name: "Ukrainian Voices" },
  { abbreviation: "ER", name: "European Resolve" },
  { abbreviation: "PL", name: "Plast" },
] satisfies CoOrganiser[];

export const eventDetails = {
  title: "Run for Ukraine 2026",
  date: "23 August 2026",
  location: "Brussels",
  description:
    "Support Ukraine's defenders with reliable power in the field — every kilometre you run funds another hour of critical equipment operation on the front line.",
  beneficiary: {
    name: "Hurkit",
    mission: "charging stations for defenders",
    url: "https://hurkit.org/",
  },
  goalEur: 3_000,
} satisfies EventDetails;
