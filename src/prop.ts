import {
  BIDI_CLASS_INDEX,
  BIDI_CLASS_VALUES,
  DERIVED_PROPERTY_INDEX,
  DERIVED_PROPERTY_NAMES,
  INDEX1,
  INDEX2,
  IS_FULL_HALF,
  IS_VIRMA,
  JOINING_TYPE_INDEX,
  JOINING_TYPE_VALUES,
  RECORDS,
  SHIFT,
} from './generated';
import type {
  BidiClass,
  DerivedProperty,
  JoiningType,
  Record,
} from './generated';

export const isFullHalf = (cp: number): boolean => IS_FULL_HALF.has(cp);

export const isVirma = (cp: number): boolean => IS_VIRMA.has(cp);

export const getDerivedProperty = (cp: number): DerivedProperty =>
  DERIVED_PROPERTY_NAMES[getRecord(cp)[DERIVED_PROPERTY_INDEX]];

export const getJoiningType = (cp: number): JoiningType =>
  JOINING_TYPE_VALUES[getRecord(cp)[JOINING_TYPE_INDEX]];

export const getBidiClass = (cp: number): BidiClass =>
  BIDI_CLASS_VALUES[getRecord(cp)[BIDI_CLASS_INDEX]];

const getRecord = (cp: number): Record => {
  const i1 = INDEX1[cp >> SHIFT];
  const i2 = INDEX2[(i1 << SHIFT) + (cp & ((1 << SHIFT) - 1))];
  return RECORDS[i2];
};
