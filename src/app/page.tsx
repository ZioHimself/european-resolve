import type { Metadata } from "next";
import { members } from "@/data/members";
import { MemberCard } from "@/components/ui/MemberCard";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "European Resolve",
  description:
    "Research, dialogue, and civic action to reinforce European security and democracy.",
};

export default function Home() {
  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.statement}>
            European Resolve is being built.
          </h1>
          <p className={styles.because}>
            Because Europe&apos;s security needs more than concern — it needs
            action.
          </p>
          <p className={styles.subtitle}>
            Research, dialogue, and civic action to reinforce European security
            and democracy.
          </p>
          <div className={styles.divider} />
        </div>
      </section>

      <section id="about" className={styles.about}>
        <div className={styles.aboutInner}>
          <h2 className={styles.aboutHeading}>About</h2>
          <div className={styles.aboutText}>
            <p>
              European Resolve is a Brussels-based civil society organisation
              operating at the intersection of European security, democracy, and
              civic mobilisation.
            </p>
            <p>
              We bridge expertise, public interest, and decision-making to drive
              credible, actionable change — boldly, independently, and without
              alarmism. Our work spans research, public advocacy, and
              high-visibility civic actions.
            </p>
            <p className={styles.emphasis}>
              We are non-partisan but unapologetically vocal. Europe&apos;s
              security is not a spectator sport.
            </p>
          </div>
        </div>
      </section>

      <section id="team" className={styles.team}>
        <div className={styles.teamInner}>
          <h2 className={styles.teamHeading}>Team</h2>
          <div className={styles.grid}>
            {members.map((member) => (
              <MemberCard key={member.slug} member={member} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
