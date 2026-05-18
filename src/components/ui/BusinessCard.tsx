import type { Member, SocialLinks } from "@/data/members";
import { getSocialUrl, getSocialHandle } from "@/data/members";
import { ObfuscatedEmail } from "./ObfuscatedEmail";
import styles from "./BusinessCard.module.css";

type Props = {
  member: Member;
  qrSvg?: string;
};

const socialIcons: { key: keyof SocialLinks; icon: string; label: string }[] = [
  { key: "linkedin", icon: "/icons/linkedin.png", label: "LinkedIn" },
  { key: "github", icon: "/icons/github.png", label: "GitHub" },
  { key: "x", icon: "/icons/x.png", label: "X" },
  { key: "bluesky", icon: "/icons/bluesky.png", label: "Bluesky" },
  { key: "facebook", icon: "/icons/facebook.png", label: "Facebook" },
];

export function BusinessCard({ member, qrSvg }: Props) {
  const hasSocials = member.socials && Object.values(member.socials).some(Boolean);

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

      {member.bio && (
        <p
          className={styles.bio}
          dangerouslySetInnerHTML={{ __html: member.bio }}
        />
      )}

      {member.email && (
        <ObfuscatedEmail email={member.email} className={styles.contact} />
      )}

      {member.phone && (
        <a href={`tel:${member.phone}`} className={styles.contact}>
          {member.phone}
        </a>
      )}

      {hasSocials && (
        <div className={styles.socials}>
          {socialIcons.map(({ key, icon, label }) => {
            const url = getSocialUrl(member.socials?.[key]);
            const handle = getSocialHandle(member.socials?.[key]);
            if (!url) return null;
            return (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label={`${member.name} on ${label}`}
                title={handle || label}
              >
                <img src={icon} alt={label} width={24} height={24} />
                {handle && <span className={styles.socialHandle}>{handle}</span>}
              </a>
            );
          })}
        </div>
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
