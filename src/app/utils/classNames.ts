type Mods = Record<string, boolean | string | undefined>;

export const classNames = (
  cls: string,
  mods: Mods,
  additional: (string | undefined)[] = []
): string => {
  return [
    cls,
    ...additional.filter(Boolean),
    ...Object.entries(mods)
      .filter(([className, value]) => Boolean(value))
      .map(([classNames]) => classNames),
  ].join(" ");
};
