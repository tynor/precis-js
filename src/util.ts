export const codepoint = (c: string): number => {
  if (c.length === 0) {
    throw new Error(`Zero length string '${c}' passed to codepoint`);
  }
  return c.codePointAt(0)!;
};
