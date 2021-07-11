import {validateFreeformClass, validateIdentifierClass} from './baseclass';
import {validateBidiRule} from './bidi';
import {EmptyStringError} from './error';
import {widthMappingRule} from './width';

export type Profile = Readonly<{
  prepare: (text: string) => string;
  enforce: (text: string) => string;
}>;

const prepareUsernameCaseMapped = (text: string): string => {
  text = widthMappingRule(text);
  validateIdentifierClass(text);
  return text;
};

const enforceUsernameCaseMapped = (text: string): string => {
  text = prepareUsernameCaseMapped(text);
  text = text.toLowerCase();
  text = text.normalize('NFC');
  validateBidiRule(text);
  if (text.length === 0) {
    throw new EmptyStringError(text);
  }
  return text;
};

export const UsernameCaseMapped: Profile = {
  prepare: prepareUsernameCaseMapped,
  enforce: enforceUsernameCaseMapped,
};

const prepareUsernameCasePreserved = (text: string): string => {
  text = widthMappingRule(text);
  validateIdentifierClass(text);
  return text;
};

const enforceUsernameCasePreserved = (text: string): string => {
  text = prepareUsernameCasePreserved(text);
  text = text.normalize('NFC');
  validateBidiRule(text);
  if (text.length === 0) {
    throw new EmptyStringError(text);
  }
  return text;
};

export const UsernameCasePreserved: Profile = {
  prepare: prepareUsernameCasePreserved,
  enforce: enforceUsernameCasePreserved,
};

const prepareOpaqueString = (text: string): string => {
  validateFreeformClass(text);
  return text;
};

const enforceOpaqueString = (text: string): string => {
  text = prepareOpaqueString(text);
  text = text.replace(/\p{Zs}/gu, ' ');
  text = text.normalize('NFC');
  return text;
};

export const OpaqueString: Profile = {
  prepare: prepareOpaqueString,
  enforce: enforceOpaqueString,
};
