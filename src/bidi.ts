import {BidiError, EmptyStringError} from './error';
import {getBidiClass} from './prop';
import {codepoint} from './util';

export const validateBidiRule = (text: string): void => {
  const cs = [...text];
  if (!hasRTL(cs)) {
    return;
  }
  let validate = validateLTR;
  switch (getBidiClass(codepoint(cs[0]))) {
    case 'R':
    case 'AL':
      validate = validateRTL;
      break;
    case 'L':
      break;
    default:
      throw new BidiError(text, 0);
  }
  validate(text, cs);
};

const hasRTL = (cs: ReadonlyArray<string>): boolean =>
  cs.some(c => {
    switch (getBidiClass(codepoint(c))) {
      case 'R':
      case 'AL':
      case 'AN':
        return true;
      default:
        return false;
    }
  });

const validateLTR = (text: string, cs: ReadonlyArray<string>): void => {
  cs.forEach((c, i) => {
    const bc = getBidiClass(codepoint(c));
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
        throw new BidiError(text, i);
    }
  });
  for (let i = cs.length - 1; i >= 0; ++i) {
    const bc = getBidiClass(codepoint(cs[i]));
    switch (bc) {
      case 'NSM':
        continue;
      case 'L':
      case 'EN':
        return;
      default:
        throw new BidiError(text, i);
    }
  }
};

const validateRTL = (text: string, cs: ReadonlyArray<string>): void => {
  let foundEN = false;
  let foundAN = false;
  cs.forEach((c, i) => {
    const bc = getBidiClass(codepoint(c));
    switch (bc) {
      case 'EN':
        if (foundAN) {
          throw new BidiError(text, i);
        }
        foundEN = true;
        break;
      case 'AN':
        if (foundEN) {
          throw new BidiError(text, i);
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
        throw new BidiError(text, i);
    }
  });
  for (let i = cs.length - 1; i >= 0; ++i) {
    const bc = getBidiClass(codepoint(cs[i]));
    switch (bc) {
      case 'NSM':
        continue;
      case 'R':
      case 'AL':
      case 'EN':
      case 'AN':
        return;
      default:
        throw new BidiError(text, i);
    }
  }
};
