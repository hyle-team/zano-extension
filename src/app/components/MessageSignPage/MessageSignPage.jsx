import { getCurrent, goBack } from "react-chrome-extension-router";
import Button, { ButtonThemes } from "../UI/Button/Button";
import styles from "./MessageSignPage.module.scss";
import { useEffect, useState } from "react";
import { fetchBackground } from "../../utils/utils";

export default function MessageSignPage() {

    const { props } = getCurrent();

    const signRequests = props.signRequests;

    const [reqIndex, setReqIndex] = useState(0);
    const [accepting, setAccepting] = useState(false);
    const [denying, setDenying] = useState(false);

    const signRequest = signRequests[reqIndex];

    useEffect(() => {
        setReqIndex(0);
    }, [signRequests]);

    function nextRequest() {
        if (reqIndex < signRequests.length - 1) {   
            setReqIndex(reqIndex + 1);
        } else {
            goBack();
        }
    }

    async function acceptClick() {
        setAccepting(true);
        await fetchBackground({ method: "FINALIZE_MESSAGE_SIGN", id: signRequest.id, success: true });
        setAccepting(false);
        nextRequest();
    }

    async function denyClick() {
        setDenying(true);
        await fetchBackground({ method: "FINALIZE_MESSAGE_SIGN", id: signRequest.id, success: false });
        setDenying(false);
        nextRequest();
    }
    
    return (
        <div className={styles.signContainer}>
            <h3 className={styles.title}>Sign Request</h3>
            <p className={styles.text}>Sign this message only if you fully understand its contents and trust the requesting site.</p>
            <p className={styles.subtext}>You sign:</p>
            <div className={styles.messageBlock}>
                <p className={styles.messageTitle}>Message:</p>
                <p>{signRequest.message}</p>
            </div>
            <div className={styles.buttonsContainer}>
                <Button disabled={denying} theme={ButtonThemes.Outline} onClick={denyClick}>Deny</Button>
                <Button disabled={accepting} onClick={acceptClick}>Accept</Button>
            </div>
        </div>
    )
}