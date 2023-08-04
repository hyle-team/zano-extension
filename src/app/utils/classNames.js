export const classNames = (cls, mods, additional = []) =>
  [
    cls,
    ...additional.filter(Boolean),
    ...Object.entries(mods)
      .filter(([className, value]) => Boolean(value))
      .map(([classNames]) => classNames),
  ].join(" ");
