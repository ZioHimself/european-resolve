import styles from "./layout.module.css";

export default function EventLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={styles.eventRoot}>{children}</div>;
}
