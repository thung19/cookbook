"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Nav.module.css";

type LinkItem = { href: string; label: string };

const Nav = ({ links }: { links: LinkItem[] }) => {
    const pathname = usePathname();
    
    return (
        <nav className={styles.nav}>
            <ul className={styles.navList}>
                {links.map((link) => {
                    // More robust active check
                    const isActive = 
                        link.href === "/" 
                            ? pathname === "/" 
                            : pathname === link.href || pathname.startsWith(link.href + "/");
                    
                    return (
                        <li key={link.href}>
                            <Link 
                                href={link.href}
                                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                            >     
                                {link.label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
};

export default Nav;