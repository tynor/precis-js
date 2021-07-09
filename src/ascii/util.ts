export const isAscii = (s: string): boolean => !/[^\x00-\x7f]/.test(s);
