type Mods = Record<string, boolean | string | undefined>;

export const classNames = (
	cls: string,
	mods: Mods,
	additional: (string | undefined)[] = [],
): string =>
	[
		cls,
		...additional.filter(Boolean),
		...Object.entries(mods)
			.filter(([_className, value]) => Boolean(value))
			.map(([classNames]) => classNames),
	].join(' ');
