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
  facebookEventUrl: string;
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
  title: "Run for Ukraine: Charity Run for 35 Years of Independence",
  date: "23 August 2026, 10:00",
  location: "Place du Luxembourg, Brussels, Belgium",
  seoDescription:
    "Join us in Brussels on 23 August for the Run for Ukraine, a charity run open to everyone. Raise funds with Hurkit for portable power stations that keep Ukraine's air defence units operational.",
  beneficiary: {
    name: "Hurkit Foundation",
    mission: "portable power stations for air defence units",
    url: "https://hurkit.org/",
  },
  goalEur: 3_000,
  whydonateShortcode: "KvhGb",
  facebookEventUrl: "https://www.facebook.com/events/1826555465375638",
  postEvent: {
    thankYouMessage:
      "Thank you to every runner, supporter, and donor who made Run for Ukraine possible. Together we powered hope on the front line.",
    impactStatement:
      "Every euro raised went directly to Hurkit, providing portable charging stations that keep defenders connected and operational in the field.",
    galleryFolderId: "",
    finalStats: {
      raised: 6473,
      participants: 248,
      donors: 9,
      chargingStations: 0,
    },
  },
} satisfies EventDetails;
