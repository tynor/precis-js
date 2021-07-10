import {PrecisInvalidCharacterError} from '../common';

import {getDerivedProperty, getJoiningType, isVirma} from './prop';

export const ensureIdenifierClass = (s: string): void => {
  const cs = [...s];
  cs.forEach((c, i) => {
    const cp = c.codePointAt(0)!;
    switch (getDerivedProperty(cp)) {
      case 'PVALID':
        return;
      case 'CONTEXTO':
      case 'CONTEXTJ':
        enforceContextRule(cs, i);
        break;
      default:
        throw new PrecisInvalidCharacterError(i);
    }
  });
};

export const ensureFreeformClass = (s: string): void => {
  const cs = [...s];
  cs.forEach((c, i) => {
    const cp = c.codePointAt(0)!;
    switch (getDerivedProperty(cp)) {
      case 'PVALID':
      case 'FREE_PVAL':
        return;
      case 'CONTEXTO':
      case 'CONTEXTJ':
        enforceContextRule(cs, i);
      default:
        throw new PrecisInvalidCharacterError(i);
    }
  });
};

type ContextFn = (cs: ReadonlyArray<string>, i: number) => boolean;

const enforceContextRule = (cs: ReadonlyArray<string>, i: number): void => {
  const cp = cs[i].codePointAt(0)!;
  let fn;
  switch (cp) {
    case 0x200c:
      fn = contextZeroWidthNonJoiner;
      break;
    case 0x200d:
      fn = contextZeroWidthJoiner;
      break;
    case 0x00b7:
      fn = contextMiddleDot;
      break;
    case 0x0375:
      fn = contextGreekKeraia;
      break;
    case 0x05f3:
    case 0x05f4:
      fn = contextHebrewPunctuation;
      break;
    case 0x30fb:
      fn = contextKatakanaMiddleDot;
      break;
    case 0x0660:
    case 0x0661:
    case 0x0662:
    case 0x0663:
    case 0x0664:
    case 0x0665:
    case 0x0666:
    case 0x0667:
    case 0x0668:
    case 0x0669:
      fn = contextArabicIndicDigits;
      break;
    case 0x06f0:
    case 0x06f1:
    case 0x06f2:
    case 0x06f3:
    case 0x06f4:
    case 0x06f5:
    case 0x06f6:
    case 0x06f7:
    case 0x06f8:
    case 0x06f9:
      fn = contextExtendedArabicIndicDigits;
      break;
  }
  if (fn === void 0 || !fn(cs, i)) {
    throw new PrecisInvalidCharacterError(i);
  }
};

const contextZeroWidthNonJoiner: ContextFn = (cs, i) =>
  isVirma(before(cs, i).codePointAt(0)!) ||
  (nonJoinerValidBefore(cs, i) && nonJoinerValidAfter(cs, i));

const contextZeroWidthJoiner: ContextFn = (cs, i) =>
  isVirma(before(cs, i).codePointAt(0)!);

const contextMiddleDot: ContextFn = (cs, i) =>
  before(cs, i) === '\u006c' && after(cs, i) === '\u006c';

const contextGreekKeraia: ContextFn = (cs, i) =>
  /^\p{Script=Hebrew}$/u.test(before(cs, i));

const contextHebrewPunctuation: ContextFn = (cs, i) =>
  /^\p{Script=Hebrew}$/u.test(before(cs, i));

const contextKatakanaMiddleDot: ContextFn = cs =>
  cs.every(c =>
    /^\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Han}$/u.test(c),
  );

const contextArabicIndicDigits: ContextFn = cs =>
  cs.every(c => /^[^\u06f0-\u06f9]$/u.test(c));

const contextExtendedArabicIndicDigits: ContextFn = cs =>
  cs.every(c => /^[^\u0660-\u0669]$/u.test(c));

const nonJoinerValidBefore = (
  cs: ReadonlyArray<string>,
  i: number,
): boolean => {
  for (let j = i - 1; j >= 0; --j) {
    const t = getJoiningType(cs[j].codePointAt(0)!);
    switch (t) {
      case 'T':
        continue;
      case 'L':
      case 'D':
        return true;
      default:
        return false;
    }
  }
  return false;
};

const nonJoinerValidAfter = (cs: ReadonlyArray<string>, i: number): boolean => {
  for (let j = i + 1; j < cs.length; ++j) {
    const t = getJoiningType(cs[j].codePointAt(0)!);
    switch (t) {
      case 'T':
        continue;
      case 'R':
      case 'D':
        return true;
      default:
        return false;
    }
  }
  return false;
};

const before = (cs: ReadonlyArray<string>, i: number): string => {
  if (i === 0) {
    throw new PrecisInvalidCharacterError(i);
  }
  return cs[i - 1];
};

const after = (cs: ReadonlyArray<string>, i: number): string => {
  if (i === cs.length - 1) {
    throw new PrecisInvalidCharacterError(i);
  }
  return cs[i + 1];
};
