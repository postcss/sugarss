import sugarss from '../';

import test from 'ava';

test('has parse()', t => {
    t.deepEqual(typeof sugarss.parse, 'function');
});

test('has stringify()', t => {
    t.deepEqual(typeof sugarss.stringify, 'function');
});
