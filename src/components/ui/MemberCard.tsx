import Link from "next/link";
import type { Member } from "@/data/members";
import styles from "./MemberCard.module.css";

export function MemberCard({ member }: { member: Member }) {
  return (
    <Link href={`/team/${member.slug}`} className={styles.card}>
      <img
        src={member.photo}
        alt={member.name}
        width={96}
        height={96}
        className={styles.photo}
      />
      <h3 className={styles.name}>{member.name}</h3>
      <p className={styles.title}>{member.title}</p>
    </Link>
  );
}
