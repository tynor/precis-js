import {readFileSync} from 'fs';
import * as path from 'path';

import test from 'ava';
import type {Macro} from 'ava';

import {PrecisInvalidCharacterError} from '../../common';

import {enforceUsernameCaseMapped} from '../profile';

type EnforceVector = {
  Input: string;
} & ({Output: string} | {Err: string});

const enforceUsernameCaseMappedMacro: Macro<[EnforceVector]> = (t, r) => {
  const input = fromUTF8(r.Input);
  if ('Err' in r) {
    t.throws(() => enforceUsernameCaseMapped(input), {
      instanceOf: PrecisInvalidCharacterError,
    });
  } else {
    t.is(enforceUsernameCaseMapped(input), fromUTF8(r.Output));
  }
};

const vecdir = path.resolve(__dirname, 'vectors');

JSON.parse(
  readFileSync(path.join(vecdir, 'username-case-mapped.json'), {
    encoding: 'utf8',
  }),
).forEach((v: EnforceVector) => {
  test(
    `enforceUsernameCaseMapped ${v.Input}`,
    enforceUsernameCaseMappedMacro,
    v,
  );
});

const fromUTF8 = (s: string): string => {
  const n = [];
  for (let i = 0; i < s.length; i += 2) {
    n.push(Number.parseInt(s.slice(i, i + 2), 16));
  }
  const a = new Uint8Array(n);
  const dec = new TextDecoder();
  return dec.decode(a);
};
