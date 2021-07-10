export const isAscii = (s: string): boolean => /^\p{ASCII}*$/u.test(s);
