export type SocialLink = string | { url: string; handle?: string };

export type SocialLinks = {
  linkedin?: SocialLink;
  github?: SocialLink;
  x?: SocialLink;
  bluesky?: SocialLink;
  facebook?: SocialLink;
};

export function getSocialUrl(link: SocialLink | undefined): string | undefined {
  if (!link) return undefined;
  return typeof link === "string" ? link : link.url;
}

export function getSocialHandle(link: SocialLink | undefined): string | undefined {
  if (!link || typeof link === "string") return undefined;
  return link.handle;
}

export type Member = {
  slug: string;
  name: string;
  title: string;
  city: string;
  photo: string;
  bio?: string;
  email?: string;
  phone?: string;
  socials?: SocialLinks;
};

export const members = [
  {
    slug: "michael-desloover",
    name: "Michael Desloover",
    title: "Operations",
    city: "Antwerp",
    photo: "/team/michael-desloover.png"
  },
  {
    slug: "liza-bezvershenko",
    name: "Liza Bezvershenko",
    title: "Advocacy",
    city: "Brussels",
    photo: "/team/liza-bezvershenko.png",
    bio: "Ukrainian civil society and advocacy specialist based in Brussels, focusing on EU-Ukraine relations, European integration, and democracy promotion. Recipient of the 2024 Young Diplomat Award and a recognised voice for Ukraine in Brussels, featured in international media.",
    socials: {
      linkedin: { url: "https://www.linkedin.com/in/lizabezvershenko", handle: "/in/lizabezvershenko" }
    }
  },
  {
    slug: "olena-kuzhym",
    name: "Olena Kuzhym",
    title: "Advocacy",
    city: "Wespelaar",
    photo: "/team/olena-kuzhym.png"
  },
  {
    slug: "benjamin-lemerle",
    name: "Benjamin Lemerle",
    title: "Partnerships",
    city: "Brussels",
    photo: "/team/benjamin-lemerle.png",
    bio: "Strategic partnerships, policy and advocacy specialist focusing on EU external relations, humanitarian action and multilateral engagement, with a particular interest in Ukraine, European security and EU enlargement.",
    socials: {}
  },
  {
    slug: "ivan-zinchenko",
    name: "Ivan Zinchenko",
    title: "Project Management",
    city: "Haacht",
    photo: "/team/ivan-zinchenko.png",
    socials: {}
  },
  {
    slug: "serhiy-onyshchenko",
    name: "Serhiy Onyshchenko",
    title: "IT",
    city: "Antwerp",
    photo: "/team/serhiy-onyshchenko.png",
    bio: 'A Father. Ukrainian. Software Engineer. Focused on civil activism. Creator of <a href="https://frozen-assets.eu" target="_blank" rel="noopener noreferrer">frozen-assets.eu</a>, presented on <a href="https://youtube.com/clip/Ugkxd5oXTKK5cM-CRwYUgYqcsq78NlEitGhi?si=aqQmTBmgHKKlS4yx" target="_blank" rel="noopener noreferrer">Ukraine Matters</a> YouTube channel. Featured as a guest on the <a href="https://youtu.be/PvalinSwez0?si=HSMlxEWUsnDJdif-" target="_blank" rel="noopener noreferrer">Silicon Curtain</a> podcast.',
    socials: {
      github: "https://github.com/ziohimself",
      x: "https://x.com/ziohimself",
      bluesky: { url: "https://bsky.app/profile/ziohimself", handle: "ziohimself.bsky.social" },
      linkedin: { url: "https://www.linkedin.com/in/serhiy-onyshchenko-%F0%9F%87%BA%F0%9F%87%A6-90706170", handle: "/in/serhiy-onyshchenko-🇺🇦" }
    }
  },
  {
    slug: "marco-melega",
    name: "Marco Melega",
    title: "Research",
    city: "Brussels",
    photo: "/team/marco-melega.png",
    bio: 'An aerospace engineer living at Brussels and working in the UAS industry with interest in humanitarianism, geopolitics, research and data analytics.',
    socials: {
      linkedin: "https://www.linkedin.com/in/marco-melega-39ba0523",
      facebook: "https://www.facebook.com/share/1FugzdcKMf"
    }
  },
] satisfies Member[];
