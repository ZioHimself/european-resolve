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
              We are a Brussels-based civil society organisation operating at the intersection of European security, democracy, and civic mobilisation.
            </p>
            <p>
              Our mission is to advance research and knowledge,
              foster dialogue between civil society, decision-makers, and research institutions, 
              and inform public discourse through awareness-raising campaigns and civic engagement.
            </p>
            <p>
              Our purpose is to reinforce the success of the European project and safeguard a rules-based order in the face of external geopolitical challenges.
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
