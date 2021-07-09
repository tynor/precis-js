import {ensureFreeformClass, ensureIdenifierClass} from './baseclass';

export const enforceUsernameCaseMapped = (s: string): string => {
  ensureIdenifierClass(s);
  return s.toLowerCase();
};

export const prepareUsernameCaseMapped = (s: string): string => {
  ensureIdenifierClass(s);
  return s;
};

export const enforceUsernameCasePreserved = (s: string): string => {
  ensureIdenifierClass(s);
  return s;
};

export const prepareUsernameCasePreserved = (s: string): string => {
  ensureIdenifierClass(s);
  return s;
};

export const enforceOpaqueString = (s: string): string => {
  ensureFreeformClass(s);
  return s;
};

export const prepareOpaqueString = (s: string): string => {
  ensureFreeformClass(s);
  return s;
};
