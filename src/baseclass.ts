import {InvalidCodepointError} from './error';
import {getDerivedProperty, getJoiningType, isVirma} from './prop';
import {codepoint} from './util';

export const validateIdentifierClass = (text: string): void => {
  const cs = [...text];
  cs.forEach((c, i) => {
    const cp = codepoint(c);
    switch (getDerivedProperty(cp)) {
      case 'PVALID':
        return;
      case 'CONTEXTO':
      case 'CONTEXTJ':
        enforceContextRule(text, cs, i);
        break;
      default:
        throw new InvalidCodepointError(text, i);
    }
  });
};

export const validateFreeformClass = (text: string): void => {
  const cs = [...text];
  cs.forEach((c, i) => {
    const cp = codepoint(c);
    switch (getDerivedProperty(cp)) {
      case 'PVALID':
      case 'FREE_PVAL':
        return;
      case 'CONTEXTO':
      case 'CONTEXTJ':
        enforceContextRule(text, cs, i);
        break;
      default:
        throw new InvalidCodepointError(text, i);
    }
  });
};

type ContextFn = (
  cs: ReadonlyArray<string>,
  i: number,
  text: string,
) => boolean;

const enforceContextRule = (
  text: string,
  cs: ReadonlyArray<string>,
  i: number,
): void => {
  const cp = codepoint(cs[i]);
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
  if (fn === void 0 || !fn(cs, i, text)) {
    throw new InvalidCodepointError(text, i);
  }
};

const contextZeroWidthNonJoiner: ContextFn = (cs, i, text) =>
  isVirma(codepoint(before(text, cs, i))) ||
  (nonJoinerValidBefore(cs, i) && nonJoinerValidAfter(cs, i));

const contextZeroWidthJoiner: ContextFn = (cs, i, text) =>
  isVirma(codepoint(before(text, cs, i)));

const contextMiddleDot: ContextFn = (cs, i, text) =>
  before(text, cs, i) === '\u006c' && after(text, cs, i) === '\u006c';

const contextGreekKeraia: ContextFn = (cs, i, text) =>
  /^\p{Script=Hebrew}$/u.test(before(text, cs, i));

const contextHebrewPunctuation: ContextFn = (cs, i, text) =>
  /^\p{Script=Hebrew}$/u.test(before(text, cs, i));

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
    const t = getJoiningType(codepoint(cs[j]));
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
    const t = getJoiningType(codepoint(cs[j]));
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

const before = (text: string, cs: ReadonlyArray<string>, i: number): string => {
  if (i === 0) {
    throw new InvalidCodepointError(text, i);
  }
  return cs[i - 1];
};

const after = (text: string, cs: ReadonlyArray<string>, i: number): string => {
  if (i === cs.length - 1) {
    throw new InvalidCodepointError(text, i);
  }
  return cs[i + 1];
};
