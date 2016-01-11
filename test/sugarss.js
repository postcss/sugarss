import sugarss from '../';

import test from 'ava';

test('has parse', t => {
    t.same(typeof sugarss.parse, 'function');
});
