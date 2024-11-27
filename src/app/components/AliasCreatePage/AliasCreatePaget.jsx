import React from 'react';
import { getCurrent, goBack } from "react-chrome-extension-router";
import Button, { ButtonThemes } from "../UI/Button/Button";
import styles from "./AliasCreatePage.module.scss";
import { useEffect, useState } from "react";
import { fetchBackground } from "../../utils/utils";

export default function AliasCreatePage() {

    const { props } = getCurrent();

    const createRequests = props.createRequests;

    const [reqIndex, setReqIndex] = useState(0);
    const [accepting, setAccepting] = useState(false);
    const [denying, setDenying] = useState(false);

    const signRequest = createRequests[reqIndex];

    useEffect(() => {
        setReqIndex(0);
    }, [createRequests]);

    function nextRequest() {
        if (reqIndex < createRequests.length - 1) {   
            setReqIndex(reqIndex + 1);
        } else {
            goBack();
        }
    }

    async function acceptClick() {
        setAccepting(true);
        await fetchBackground({ method: "FINALIZE_ALIAS_CREATE", id: signRequest.id, success: true });
        setAccepting(false);
        nextRequest();
    }

    async function denyClick() {
        setDenying(true);
        await fetchBackground({ method: "FINALIZE_ALIAS_CREATE", id: signRequest.id, success: false });
        setDenying(false);
        nextRequest();
    }
    
    return (
        <div className={styles.signContainer}>
            <h3 className={styles.title}>Create alias request</h3>
            <p className={styles.text}>New alias will be created for your wallet</p>
            <div className={styles.messageBlock}>
                <p className={styles.messageTitle}>New alias:</p>
                <p>@{signRequest.alias}</p>
            </div>
            <br /><br /><br /><br />
            <div className={styles.buttonsContainer}>
                <Button disabled={denying} theme={ButtonThemes.Outline} onClick={denyClick}>Deny</Button>
                <Button disabled={accepting} onClick={acceptClick}>Accept</Button>
            </div>
        </div>
    )
}