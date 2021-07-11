import test from 'ava';

import {UsernameCaseMapped} from '../profile';

test('username allows email addresses', t => {
  const s = 'juliet@example.com';
  const got = UsernameCaseMapped.enforce(s);
  t.is(got, s);
});

test('username allows small letter sharp s', t => {
  const s = 'fu\u00dfball';
  const got = UsernameCaseMapped.enforce(s);
  t.is(got, s);
});

test('username allows greek pi', t => {
  const s = '\u03c0';
  const got = UsernameCaseMapped.enforce(s);
  t.is(got, s);
});

test('username allows greek sigma', t => {
  const s = '\u03a3';
  const got = UsernameCaseMapped.enforce(s);
  t.is(got, s.toLowerCase());
});

test('username allows small greek sigma', t => {
  const s = '\u03c3';
  const got = UsernameCaseMapped.enforce(s);
  t.is(got, s);
});

test('username disallows spaces', t => {
  const s = 'foo bar';
  t.throws(() => UsernameCaseMapped.enforce(s));
});

test('username disallows empty', t => {
  const s = '';
  t.throws(() => UsernameCaseMapped.enforce(s));
});

test('username disallows roman numeral', t => {
  const s = 'henry\u2163';
  t.throws(() => UsernameCaseMapped.enforce(s));
});

test('username disallows infinity', t => {
  const s = '\u221e';
  t.throws(() => UsernameCaseMapped.enforce(s));
});
