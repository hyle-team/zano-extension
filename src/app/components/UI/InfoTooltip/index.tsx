import React from 'react';
import infoIcon from "../../../assets/svg/info-blue.svg";
import styles from "./styles.module.scss";

const InfoTooltip = ({ title }: { title: string }) => {
    return (
        <button className={styles.tooltip}>
            <img src={infoIcon} width={16} alt="info" />

            <div className={styles.tooltip__content}>
                {title}
            </div>
        </button>
    )
}

export default InfoTooltip