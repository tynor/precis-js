import {PrecisInvalidCharacterError} from '../common';

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
