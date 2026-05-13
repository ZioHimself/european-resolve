export type Member = {
  slug: string;
  name: string;
  title: string;
  city: string;
  photo: string;
  bio?: string;
  email?: string;
  phone?: string;
};

export const members = [
  { slug: "michael-desloover", name: "Michael Desloover", title: "Operations", city: "Antwerp", photo: "/team/michael-desloover.png" },
  { slug: "liza-bezvershenko", name: "Liza Bezvershenko", title: "Advocacy", city: "Brussels", photo: "/team/liza-bezvershenko.png", bio: "Ukrainian civil society and advocacy specialist based in Brussels, focusing on EU-Ukraine relations, European integration, and democracy promotion. Recipient of the 2024 Young Diplomat Award and a recognised voice for Ukraine in Brussels, featured in international media." },
  { slug: "olena-kuzhym", name: "Olena Kuzhym", title: "Advocacy", city: "Wespelaar", photo: "/team/olena-kuzhym.png" },
  { slug: "benjamin-lemerle", name: "Benjamin Lemerle", title: "Partnerships", city: "Brussels", photo: "/team/benjamin-lemerle.png" },
  { slug: "ivan-zinchenko", name: "Ivan Zinchenko", title: "Project Management", city: "Haacht", photo: "/team/ivan-zinchenko.png" },
  { slug: "serhiy-onyshchenko", name: "Serhiy Onyshchenko", title: "IT", city: "Antwerp", photo: "/team/serhiy-onyshchenko.png", bio: 'A Father. Ukrainian. Software Engineer. Focused on civil activism. Creator of <a href="https://frozen-assets.eu" target="_blank" rel="noopener noreferrer">frozen-assets.eu</a>, presented on <a href="https://youtube.com/clip/Ugkxd5oXTKK5cM-CRwYUgYqcsq78NlEitGhi?si=aqQmTBmgHKKlS4yx" target="_blank" rel="noopener noreferrer">Ukraine Matters</a> YouTube channel. Featured as a guest on the <a href="https://youtu.be/PvalinSwez0?si=HSMlxEWUsnDJdif-" target="_blank" rel="noopener noreferrer">Silicon Curtain</a> podcast.' },
  { slug: "marco-melega", name: "Marco Melega", title: "Research", city: "Brussels", photo: "/team/marco-melega.png", bio: 'An aerospace engineer living at Brussels and working in the UAS industry with interest in humanitarianism, geopolitics, research and data analytics.' },
] satisfies Member[];
