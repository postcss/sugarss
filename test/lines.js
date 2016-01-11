import lines from '../lines';

import test from 'ava';

test('packs tokens by lines', t => {
    let tokens = [['word', 'a'], ['newline', '\n'], ['word', 'b']];
    t.same(lines(tokens), [
        [['word', 'a'], ['newline', '\n']],
        [['word', 'b']]
    ]);
});
