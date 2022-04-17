import Link from 'next/link';

import styles from './header.module.scss';

export default function Header(): React.ReactElement {
  return (
    <Link href="/">
      <a>
        <img src="/images/logo.svg" alt="logo" className={styles.logo} />
      </a>
    </Link>
  );
}
