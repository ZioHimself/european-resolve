import type { Member } from "@/data/members";
import styles from "./BusinessCard.module.css";

type Props = {
  member: Member;
  qrSvg?: string;
};

export function BusinessCard({ member, qrSvg }: Props) {
  return (
    <article className={styles.card}>
      <img
        src={member.photo}
        alt={member.name}
        width={200}
        height={200}
        className={styles.photo}
      />

      <h1 className={styles.name}>{member.name}</h1>
      <p className={styles.title}>{member.title}</p>
      <p className={styles.city}>{member.city}</p>

      {member.email && (
        <a href={`mailto:${member.email}`} className={styles.contact}>
          {member.email}
        </a>
      )}

      {member.phone && (
        <a href={`tel:${member.phone}`} className={styles.contact}>
          {member.phone}
        </a>
      )}

      {qrSvg && (
        <div
          className={styles.qr}
          dangerouslySetInnerHTML={{ __html: qrSvg }}
        />
      )}
    </article>
  );
}
