export class PrecisInvalidCharacterError extends Error {
  public readonly index: number;

  public constructor(index: number) {
    super(`Invalid character at index ${index}`);
    this.index = index;
  }
}

export const ensureIdenifierClass = (s: string): void => {
  const m = /[^\x21-\x7e]/.exec(s);
  if (m !== null) {
    throw new PrecisInvalidCharacterError(m.index);
  }
};

export const ensureFreeformClass = (s: string): void => {
  const m = /[^\x20-\x7e]/.exec(s);
  if (m !== null) {
    throw new PrecisInvalidCharacterError(m.index);
  }
};
