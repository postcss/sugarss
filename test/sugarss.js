import sugarss from '../';

import test from 'ava';

test('exists', t => {
    t.same(typeof sugarss, 'object');
});
