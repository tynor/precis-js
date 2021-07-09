import test from 'ava';

import {
  enforceOpaqueString,
  enforceUsernameCaseMapped,
  enforceUsernameCasePreserved,
} from '../profile';

test('case mapped changes case', t => {
  t.is(enforceUsernameCaseMapped('aaa'), enforceUsernameCaseMapped('aAa'));
});

test('case preserved does not change case', t => {
  t.not(
    enforceUsernameCasePreserved('aaa'),
    enforceUsernameCasePreserved('aAa'),
  );
});

test('opaque allows spaces', t => {
  t.is(enforceOpaqueString(' '), enforceOpaqueString(' '));
});
