export type Member = {
  slug: string;
  name: string;
  title: string;
  city: string;
  photo: string;
  email?: string;
  phone?: string;
};

export const members = [
  { slug: "michael-desloover", name: "Michael Desloover", title: "Head of Administration", city: "Antwerp", photo: "/team/michael-desloover.png" },
  { slug: "liza-bezvershenko", name: "Liza Bezvershenko", title: "Head of Partnerships", city: "Brussels", photo: "/team/liza-bezvershenko.png" },
  { slug: "olena-kuzhym", name: "Olena Kuzhym", title: "Head of Advocacy", city: "Wespelaar", photo: "/team/olena-kuzhym.png" },
  { slug: "ivan-zinchenko", name: "Ivan Zinchenko", title: "Head of Events", city: "Haacht", photo: "/team/ivan-zinchenko.png" },
  { slug: "serhiy-onyshchenko", name: "Serhiy Onyshchenko", title: "Head of IT", city: "Antwerp", photo: "/team/serhiy-onyshchenko.png" },
  { slug: "marco-melega", name: "Marco Melega", title: "Head of Research", city: "Brussels", photo: "/team/marco-melega.png" },
] satisfies Member[];
