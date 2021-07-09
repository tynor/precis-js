// gen-prop-map.mjs generates the full Unicode 13.0 PRECIS derived property
// mapping arrays.

import {readFile, writeFile} from 'fs/promises';
import {URL} from 'url';

const filename = new URL(
  '../data/draft-nemoto-precis-unicode13-00.txt',
  import.meta.url,
)
  .toString()
  .replace(/^file:\/\//, '');

const outfile = new URL('../src/generated.ts', import.meta.url)
  .toString()
  .replace(/^file:\/\//, '');

const nchars = 0x10ffff;

const derivedPropertyNames = [
  'PVALID',
  'FREE_PVAL',
  'CONTEXTO',
  'CONTEXTJ',
  'DISALLOWED',
  'UNASSIGNED',
];

const main = async () => {
  const data = await readFile(filename, {
    encoding: 'utf8',
  });
  const lines = data.split('\n');
  const hIdx = lines.findIndex(line => line.startsWith('Appendix H.'));
  const propMap = Array(nchars).fill(-1);
  for (const line of lines.slice(hIdx)) {
    const m = /^([0-9A-F]+(?:\.\.[0-9A-F]+)?)\s*;\s+([_A-Z]+)/.exec(line);
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
  const [t1, t2, shift] = splitbins(propMap);
  let buf = '';
  buf += `export const PROP_SHIFT = ${shift};` + '\n';
  buf += `export const PROP_TABLE1 = ${genArray(t1)};` + '\n';
  buf += `export const PROP_TABLE2 = ${genArray(t2)};` + '\n';
  await writeFile(outfile, buf, {encoding: 'utf8', mode: 0o644});
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
