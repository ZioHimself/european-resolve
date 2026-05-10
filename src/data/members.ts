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
  { slug: "michael-desloover", name: "Michael Desloover", title: "Operations", city: "Antwerp", photo: "/team/michael-desloover.png" },
  { slug: "liza-bezvershenko", name: "Liza Bezvershenko", title: "Advocacy", city: "Brussels", photo: "/team/liza-bezvershenko.png" },
  { slug: "olena-kuzhym", name: "Olena Kuzhym", title: "Advocacy", city: "Wespelaar", photo: "/team/olena-kuzhym.png" },
  { slug: "benjamin-lemerle", name: "Benjamin Lemerle", title: "Partnerships", city: "Brussels", photo: "/team/benjamin-lemerle.png" },
  { slug: "ivan-zinchenko", name: "Ivan Zinchenko", title: "Projects", city: "Haacht", photo: "/team/ivan-zinchenko.png" },
  { slug: "serhiy-onyshchenko", name: "Serhiy Onyshchenko", title: "IT", city: "Antwerp", photo: "/team/serhiy-onyshchenko.png" },
  { slug: "marco-melega", name: "Marco Melega", title: "Research", city: "Brussels", photo: "/team/marco-melega.png" },
] satisfies Member[];
