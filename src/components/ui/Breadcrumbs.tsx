import styles from "./Breadcrumbs.module.css";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className={styles.nav}>
      <ol className={styles.list}>
        {items.map((item, i) => (
          <li key={item.label} className={styles.item}>
            {item.href ? (
              <a href={item.href} className={styles.link}>
                {item.label}
              </a>
            ) : (
              <span aria-current="page" className={styles.current}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
