import { siteConfig } from "@/shared/config/site.config";
import { TataLogoIcon } from "@/shared/ui";
import styles from "@/widgets/Preloader/Preloader.module.scss";

export default function LoadingPage() {
    return (
        <div className={styles.overlay}>
            <div className={styles.center}>
                <div className={styles.mark}>
                    <svg className={styles.ring} viewBox="0 0 88 88" aria-hidden="true">
                        <circle className={styles.ringTrack} cx="44" cy="44" r="42" />
                        <circle
                            className={`${styles.ringProgress} ${styles.ringProgressLoop}`}
                            cx="44"
                            cy="44"
                            r="42"
                        />
                    </svg>

                    <div className={styles.logo} aria-hidden="true">
                        <TataLogoIcon className={styles.logoIcon} />
                    </div>
                </div>

                <p className={styles.name}>{siteConfig.name}</p>

                <div className={styles.barTrack}>
                    <div className={`${styles.barFill} ${styles.barFillLoop}`} />
                </div>
            </div>
        </div>
    );
}
