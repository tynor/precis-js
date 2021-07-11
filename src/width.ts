import {isFullHalf} from './prop';
import {codepoint} from './util';

export const widthMappingRule = (text: string): string =>
  [...text]
    .map(c => (isFullHalf(codepoint(c)) ? c.normalize('NFKC') : c))
    .join('');
