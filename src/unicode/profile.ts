import {PrecisInvalidCharacterError} from '../common';

import {ensureFreeformClass, ensureIdenifierClass} from './baseclass';

import {getBidiClass, isFullHalf} from './prop';

export const prepareUsernameCaseMapped = (s: string): string => {
  s = [...s]
    .map(c => (isFullHalf(c.codePointAt(0)!) ? c.normalize('NFKC') : c))
    .join('');
  ensureIdenifierClass(s);
  return s;
};

export const enforceUsernameCaseMapped = (s: string): string => {
  s = prepareUsernameCaseMapped(s);
  s = s.toLowerCase();
  s = s.normalize('NFC');
  enforceBidiRule(s);
  if (s.length === 0) {
    throw new PrecisInvalidCharacterError(0);
  }
  return s;
};

export const prepareUsernameCasePreserved = (s: string): string => {
  s = [...s]
    .map(c => (isFullHalf(c.codePointAt(0)!) ? c.normalize('NFKC') : c))
    .join('');
  ensureIdenifierClass(s);
  return s;
};

export const enforceUsernameCasePreserved = (s: string): string => {
  s = prepareUsernameCaseMapped(s);
  s = s.normalize('NFC');
  enforceBidiRule(s);
  if (s.length === 0) {
    throw new PrecisInvalidCharacterError(0);
  }
  return s;
};

const enforceBidiRule = (s: string): void => {
  const cs = [...s];
  let rtl = false;
  switch (getBidiClass(cs[0].codePointAt(0)!)) {
    case 'R':
    case 'AL':
      rtl = true;
      break;
    case 'L':
      break;
    default:
      throw new PrecisInvalidCharacterError(0);
  }
  if (rtl) {
    let foundEN = false;
    let foundAN = false;
    cs.forEach((c, i) => {
      const bc = getBidiClass(c.codePointAt(0)!);
      switch (bc) {
        case 'EN':
          if (foundAN) {
            throw new PrecisInvalidCharacterError(i);
          }
          foundEN = true;
          break;
        case 'AN':
          if (foundEN) {
            throw new PrecisInvalidCharacterError(i);
          }
          foundAN = true;
          break;
        case 'R':
        case 'AL':
        case 'ES':
        case 'CS':
        case 'ET':
        case 'ON':
        case 'BN':
        case 'NSM':
          break;
        default:
          throw new PrecisInvalidCharacterError(i);
      }
    });
    for (let i = cs.length - 1; i >= 0; ++i) {
      const bc = getBidiClass(cs[i].codePointAt(0)!);
      if (bc === 'NSM') {
        continue;
      }
      if (bc === 'R' || bc === 'AL' || bc === 'EN' || bc === 'AN') {
        break;
      }
      throw new PrecisInvalidCharacterError(i);
    }
  } else {
    cs.forEach((c, i) => {
      const bc = getBidiClass(c.codePointAt(0)!);
      switch (bc) {
        case 'L':
        case 'EN':
        case 'ES':
        case 'CS':
        case 'ET':
        case 'ON':
        case 'BN':
        case 'NSM':
          break;
        default:
          throw new PrecisInvalidCharacterError(i);
      }
    });
    for (let i = cs.length - 1; i >= 0; ++i) {
      const bc = getBidiClass(cs[i].codePointAt(0)!);
      if (bc === 'NSM') {
        continue;
      }
      if (bc === 'L' || bc === 'EN') {
        break;
      }
      throw new PrecisInvalidCharacterError(i);
    }
  }
};
