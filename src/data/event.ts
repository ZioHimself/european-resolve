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
    price: 35,
    causeFee: 22,
    logisticsFee: 13,
    rewards: ["Race bib", "Finisher medal", "Digital certificate"],
    highlighted: false,
  },
  {
    id: "champion",
    name: "Champion",
    price: 75,
    causeFee: 55,
    logisticsFee: 20,
    rewards: [
      "Race bib",
      "Finisher medal",
      "Digital certificate",
      "Technical race t-shirt",
      "Finisher pack",
      "Name on digital wall",
    ],
    highlighted: true,
  },
  {
    id: "patron",
    name: "Patron",
    price: 150,
    causeFee: 120,
    logisticsFee: 30,
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
    url: "https://hurkit.com.ua",
  },
  goalEur: 50_000,
} satisfies EventDetails;
