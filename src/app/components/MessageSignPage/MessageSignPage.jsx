import Button, { ButtonThemes } from "../UI/Button/Button";
import styles from "./MessageSignPage.module.scss";

export default function MessageSignPage() {
    
    return (
        <div className={styles.signContainer}>
            <h3 className={styles.title}>Sign Request</h3>
            <p className={styles.text}>Sign this message only if you fully understand its contents and trust the requesting site.</p>
            <p className={styles.subtext}>You sign:</p>
            <div className={styles.messageBlock}>
                <p className={styles.messageTitle}>Message:</p>
                <p>TEST_MESSAGE</p>
            </div>
            <div className={styles.buttonsContainer}>
                <Button theme={ButtonThemes.Outline}>Deny</Button>
                <Button>Accept</Button>
            </div>
        </div>
    )
}