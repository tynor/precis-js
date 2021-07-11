import * as ascii from './ascii';
import type {EnforceFn} from './common';
import type * as unicode from './unicode';

export type AsyncEnforce = (s: string) => Promise<string>;

export type EnforceProfiles = {
  UsernameCaseMapped: AsyncEnforce;
  UsernameCasePreserved: AsyncEnforce;
  OpaqueString: AsyncEnforce;
};

const getProfiles = (): EnforceProfiles => {
  let unicodep: Promise<typeof unicode> | undefined;
  const getUnicode = () => {
    if (unicodep === void 0) {
      unicodep = import('./unicode');
    }
    return unicodep;
  };
  const tryAscii =
    (a: EnforceFn, u: AsyncEnforce): AsyncEnforce =>
    s =>
      ascii.isAscii(s) ? Promise.resolve(a(s)) : u(s);
  return {
    UsernameCaseMapped: tryAscii(ascii.enforceUsernameCaseMapped, s =>
      getUnicode().then(unicode => unicode.enforceUsernameCaseMapped(s)),
    ),
    UsernameCasePreserved: tryAscii(ascii.enforceUsernameCasePreserved, s =>
      getUnicode().then(unicode => unicode.enforceUsernameCasePreserved(s)),
    ),
    OpaqueString: tryAscii(ascii.enforceOpaqueString, s =>
      getUnicode().then(unicode => unicode.enforceOpaqueString(s)),
    ),
  };
};

export const profiles = getProfiles();
