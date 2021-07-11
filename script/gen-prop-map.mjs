// gen-prop-map.mjs generates the full Unicode 13.0 PRECIS derived property
// mapping arrays.

import {createWriteStream} from 'fs';
import {readFile} from 'fs/promises';
import {URL} from 'url';

const relativeFile = s =>
  new URL(s, import.meta.url).toString().replace(/^file:\/\//, '');

const derivedFile = relativeFile(
  '../data/draft-nemoto-precis-unicode13-00.txt',
);

const ucdFile = relativeFile('../data/UnicodeData-13-0-0.txt');

const bidiFile = relativeFile('../data/DerivedBidiClass-13-0-0.txt');

const joiningFile = relativeFile('../data/DerivedJoiningType-13-0-0.txt');

const eawFile = relativeFile('../data/EastAsianWidth-13.0.0.txt');

const outFile = relativeFile('../src/generated.ts');

const nchars = 0x10ffff;

const derivedPropertyNames = [
  'DISALLOWED',
  'PVALID',
  'FREE_PVAL',
  'CONTEXTO',
  'CONTEXTJ',
  'UNASSIGNED',
];

const joiningTypeValues = ['U', 'C', 'D', 'R', 'L', 'T'];

const bidiClassValues = [
  'L',
  'R',
  'AL',
  'EN',
  'ES',
  'ET',
  'AN',
  'CS',
  'NSM',
  'BN',
  'B',
  'S',
  'WS',
  'ON',
  'LRE',
  'LRO',
  'RLE',
  'RLO',
  'PDF',
  'LRI',
  'RLI',
  'FSI',
  'PDI',
];

const main = async () => {
  const [derivedMap, jtMap, eaw, isVirma, bidiMap] = await Promise.all([
    readDerivedProp(),
    readJoiningType(),
    readEastAsianWidth(),
    readIsVirma(),
    readBidiMap(),
  ]);
  const table = Array(nchars).fill(0);
  const defaultRecord = [0, 0, 0];
  const records = [defaultRecord];
  const cache = new Map([[cacheKey(defaultRecord), 0]]);
  for (let cp = 0; cp < nchars; ++cp) {
    const record = [derivedMap[cp], jtMap[cp], bidiMap[cp]];
    const key = cacheKey(record);
    let i = cache.get(key);
    if (i === void 0) {
      i = records.length;
      cache.set(key, i);
      records.push(record);
    }
    table[cp] = i;
  }
  console.log(`${records.length} unique records`);
  const [t1, t2, shift] = splitbins(table);
  const fp = createWriteStream(outFile);
  const p = (...ss) => {
    if (ss.length > 0) {
      fp.write(ss.join(''));
    }
    fp.write('\n');
  };
  p('// Generated by ./script/gen-prop-map.mjs - DO NOT EDIT.');
  p();
  p('export const IS_VIRMA: Set<number> = new Set([');
  for (const cp of isVirma) {
    p(`  ${cp},`);
  }
  p(']);');
  p();
  p('export const IS_FULL_HALF: Set<number> = new Set([');
  for (const cp of eaw) {
    p(`  ${cp},`);
  }
  p(']);');
  p();
  p('export type DerivedProperty =');
  for (const name of derivedPropertyNames) {
    p(`  | '${name}'`);
  }
  p(';');
  p();
  p('export const DERIVED_PROPERTY_NAMES = {');
  derivedPropertyNames.forEach((name, i) => {
    p(`  ${i}: '${name}',`);
  });
  p('} as const;');
  p();
  p('export type JoiningType =');
  for (const value of joiningTypeValues) {
    p(`  | '${value}'`);
  }
  p(';');
  p();
  p('export const JOINING_TYPE_VALUES = {');
  joiningTypeValues.forEach((value, i) => {
    p(`  ${i}: '${value}',`);
  });
  p('} as const;');
  p();
  p('export type BidiClass =');
  for (const value of bidiClassValues) {
    p(`  | '${value}'`);
  }
  p(';');
  p();
  p('export const BIDI_CLASS_VALUES = {');
  bidiClassValues.forEach((value, i) => {
    p(`  ${i}: '${value}',`);
  });
  p('} as const;');
  p();
  p(
    'export type Record = [',
    'keyof typeof DERIVED_PROPERTY_NAMES, ',
    'keyof typeof JOINING_TYPE_VALUES, ',
    'keyof typeof BIDI_CLASS_VALUES',
    '];',
  );
  p();
  p('export const RECORDS: ReadonlyArray<Record> = [');
  for (const [derived, jt, bidi] of records) {
    p(`  [${derived}, ${jt}, ${bidi}],`);
  }
  p('];');
  p();
  p(`export const SHIFT: number = ${shift};`);
  p();
  p(`export const INDEX1 = ${genArray(t1)};`);
  p(`export const INDEX2 = ${genArray(t2)};`);
  fp.end();
};

const genArray = t => {
  const size = getIntSize(t) * 8;
  let buf = `Uint${size}Array.of(` + '\n';
  let s = '  ';
  for (const x of t) {
    const i = x.toString() + ', ';
    if (s.length + i.length > 78) {
      buf += s.trimEnd() + '\n';
      s = '  ' + i;
    } else {
      s += i;
    }
  }
  if (s.trim().length > 0) {
    buf += s.trimEnd() + '\n';
  }
  buf += ')';
  return buf;
};

const derivedRe =
  /^(\p{ASCII_Hex_Digit}+(?:\.\.\p{ASCII_Hex_Digit}+)?)\s*;\s+([_A-Z]+)/u;

const readDerivedProp = async () => {
  const data = await readFile(derivedFile, {encoding: 'utf8'});
  const lines = data.split('\n');
  const hIdx = lines.findIndex(line => line.startsWith('Appendix H.'));
  const propMap = Array(nchars).fill(0);
  for (const line of lines.slice(hIdx)) {
    const m = derivedRe.exec(line);
    if (m === null) {
      continue;
    }
    const prop = derivedPropertyNames.indexOf(m[2]);
    if (prop === -1) {
      throw new Error(`no prop for ${m[2]}`);
    }
    const cps = expandChars(m[1]);
    for (const cp of cps) {
      propMap[cp] = prop;
    }
  }
  return propMap;
};

const readJoiningType = async () => {
  const data = await readFile(joiningFile, {encoding: 'utf8'});
  const jtMap = Array(nchars).fill(0);
  for (let line of data.split('\n')) {
    line = line.replace(/#.*/, '').trim();
    if (line.length === 0) {
      continue;
    }
    const [cr, jt] = line.split(';').map(c => c.trim());
    const cps = expandChars(cr);
    const i = joiningTypeValues.indexOf(jt);
    if (i === -1) {
      throw new Error(`Unexpected joining type for ${cr}: ${jt}`);
    }
    for (const cp of cps) {
      jtMap[cp] = i;
    }
  }
  return jtMap;
};

const readEastAsianWidth = async () => {
  const data = await readFile(eawFile, {encoding: 'utf8'});
  const mapped = new Set();
  for (let line of data.split('\n')) {
    line = line.replace(/#.*/, '').trim();
    if (line.length === 0) {
      continue;
    }
    const [cr, w] = line.split(';').map(c => c.trim());
    if (w !== 'F' && w !== 'H') {
      continue;
    }
    for (const cp of expandChars(cr)) {
      mapped.add(cp);
    }
  }
  return mapped;
};

const readIsVirma = async () => {
  const data = await readFile(ucdFile, {encoding: 'utf8'});
  const virmaSet = new Set();
  for (const line of data.split('\n')) {
    const [cp, , , ccc] = line.split(';');
    if (ccc === '9') {
      virmaSet.add(Number.parseInt(cp, 16));
    }
  }
  return virmaSet;
};

const readBidiMap = async () => {
  const data = await readFile(bidiFile, {encoding: 'utf8'});
  const bidiMap = Array(nchars).fill(0);
  for (let line of data.split('\n')) {
    line = line.replace(/#.*/, '').trim();
    if (line.length === 0) {
      continue;
    }
    const [cr, bc] = line.split(';').map(c => c.trim());
    const i = bidiClassValues.indexOf(bc);
    if (i === -1) {
      throw new Error(`Unexpected bidi class for ${cr}: ${bc}`);
    }
    for (const cp of expandChars(cr)) {
      bidiMap[cp] = i;
    }
  }
  return bidiMap;
};

const expandChars = range => {
  if (!range.includes('..')) {
    return [Number.parseInt(range, 16)];
  }
  const [start, end] = range.split('..').map(v => Number.parseInt(v, 16));
  const xs = [];
  for (let i = start; i <= end; ++i) {
    xs.push(i);
  }
  return xs;
};

const getIntSize = data => {
  const max = data.reduce((acc, cur) => (cur > acc ? cur : acc));
  if (max < 256) {
    return 1;
  } else if (max < 65536) {
    return 2;
  } else {
    return 4;
  }
};

const splitbins = t => {
  const dump = (t1, t2, shift, bytes) => {
    console.log(
      `${t1.length}+${t2.length} bins at shift ${shift}; ${bytes} bytes`,
    );
  };

  console.log(`Size of original table: ${t.length * getIntSize(t)} bytes`);

  let n = t.length - 1;
  let maxshift = 0;
  if (n > 0) {
    while (n >> 1) {
      n >>= 1;
      ++maxshift;
    }
  }
  let bytes = Infinity;
  let best;
  for (let shift = 0; shift <= maxshift; ++shift) {
    const t1 = [];
    const t2 = [];
    const size = Math.pow(2, shift);
    const bincache = new Map();
    for (let i = 0; i < t.length; i += size) {
      const bin = t.slice(i, i + size);
      const binkey = cacheKey(bin);
      let index = bincache.get(binkey);
      if (index === void 0) {
        index = t2.length;
        bincache.set(binkey, index);
        for (const x of bin) {
          t2.push(x);
        }
      }
      t1.push(index >> shift);
    }
    const b = t1.length * getIntSize(t1) + t2.length * getIntSize(t2);
    dump(t1, t2, shift, b);
    if (b < bytes) {
      best = [t1, t2, shift];
      bytes = b;
    }
  }
  console.log('Best:');
  dump(best[0], best[1], best[2], bytes);
  return best;
};

const cacheKey = t => t.map(n => n.toString()).join(':');

main();
