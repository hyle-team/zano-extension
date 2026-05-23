import React, { memo, ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';
import cls from './Button.module.scss';
import { classNames } from '../../../utils/classNames';

interface ThemeProps {
    Primary: 'primary';
    Outline: 'outline';
    Clear: 'clear';
    Danger: 'danger';
    Red: 'red';
}

interface ButtonBaseProps {
    className?: string;
    children: React.ReactNode;
    theme?: keyof ThemeProps | string;
    fullWidth?: boolean;
}

export const ButtonThemes: ThemeProps = {
    Primary: 'primary',
    Outline: 'outline',
    Clear: 'clear',
    Danger: 'danger',
    Red: 'red',
};

type ButtonProps = ButtonBaseProps &
    (
        | (ButtonHTMLAttributes<HTMLButtonElement> & { href?: never })
        | (AnchorHTMLAttributes<HTMLAnchorElement> & { href: string })
    );

const Button = memo((props: ButtonProps) => {
    const { className, children, theme = ButtonThemes.Primary, href, ...otherProps } = props;

    if (href) {
        return (
            <a
                href={href}
                className={classNames(cls.Button, {}, [className, cls[theme]])}
                {...(otherProps as AnchorHTMLAttributes<HTMLAnchorElement>)}
            >
                {children}
            </a>
        );
    }

    return (
        <button
            className={classNames(cls.Button, {}, [className, cls[theme]])}
            type="button"
            {...(otherProps as ButtonHTMLAttributes<HTMLButtonElement>)}
        >
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export default Button;
