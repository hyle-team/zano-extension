/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Link } from 'react-chrome-extension-router';
import { classNames } from '../../../utils/classNames';

interface NavLinkProps {
	component: React.ComponentType<any>;
	children: React.ReactNode;
	className?: string;
	props?: any;
}

const NavLink = ({ component, children, className, ...props }: NavLinkProps) => {
	const scrollHandler = () => {
		document.body.scrollTop = 0;
	};

	return (
		<Link
			onClick={scrollHandler}
			component={component}
			className={classNames('', {}, [className])}
			{...props}
		>
			{children}
		</Link>
	);
};

export default NavLink;
