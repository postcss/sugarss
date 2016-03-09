import preprocess from '../preprocess';

import Input from 'postcss/lib/input';
import test  from 'ava';

function run(t, lines, result) {
    t.same(preprocess(new Input(''), lines), result);
}

let defaults = {
    number:    1,
    before:    '',
    indent:    '',
    colon:     false,
    atrule:    false,
    comment:   false,
    lastComma: false
};

let end = { before: '', end: true };

test('cleans from empty lines', t => {
    run(t, [
        [['newline', '\n', 1]],
        [['space', ' '], ['newline', '\n', 2]],
        [['word', 'a'], ['newline', '\n', 3]],
        [['space', '  '], ['newline', '\n', 4]]
    ], [
        {
            ...defaults,
            number: 3,
            before: '\n \n',
            tokens: [['word', 'a']]
        },
        {
            ...end,
            before: '\n  \n'
        }
    ]);
});

test('separates indent from other tokens', t => {
    run(t, [[['space', '  '], ['word', 'ab']]], [
        {
            ...defaults,
            indent: '  ',
            tokens: [['word', 'ab']]
        },
        end
    ]);
});

test('works with indentless strings', t => {
    run(t, [[['word', 'ab']]], [
        {
            ...defaults,
            indent: '',
            tokens: [['word', 'ab']]
        },
        end
    ]);
});

test('collects line number', t => {
    run(t, [
        [['word', 'a'], ['newline', '\n', 1]],
        [['word', 'b'], ['newline', '\n', 2]]
    ], [
        {
            ...defaults,
            number: 1,
            tokens: [['word', 'a']]
        }, {
            ...defaults,
            number: 2,
            tokens: [['word', 'b']],
            before: '\n'
        }, {
            ...end,
            before: '\n'
        }
    ]);
});

test('detects at-rules', t => {
    run(t, [[['at-word', '@ab'], ['space', ' ']]], [
        {
            ...defaults,
            tokens: [['at-word', '@ab'], ['space', ' ']],
            atrule: true
        },
        end
    ]);
});

test('detects last comma', t => {
    run(t, [[['word', 'ab'], [',', ','], ['newline', '\n']]], [
        {
            ...defaults,
            tokens:    [['word', 'ab'], [',', ',']],
            lastComma: true
        }, {
            ...end,
            before: '\n'
        }
    ]);
});

test('detects last comma with trailing spaces', t => {
    run(t, [[['word', 'ab'], [',', ','], ['space', ' ']]], [
        {
            ...defaults,
            tokens:    [['word', 'ab'], [',', ','], ['space', ' ']],
            lastComma: true
        },
        end
    ]);
});

test('detects last comma with trailing comment', t => {
    run(t, [[['word', 'ab'], [',', ','], ['comment', '// a']]], [
        {
            ...defaults,
            tokens:    [['word', 'ab'], [',', ','], ['comment', '// a']],
            lastComma: true
        },
        end
    ]);
});

test('ignore comma inside', t => {
    run(t, [[['word', 'ab'], [',', ','], ['word', 'ba']]], [
        {
            ...defaults,
            tokens:    [['word', 'ab'], [',', ','], ['word', 'ba']],
            lastComma: false
        },
        end
    ]);
});

test('detects colon with space', t => {
    run(t, [[['word', 'ab'], [':', ':'], ['space', ' ']]], [
        {
            ...defaults,
            tokens: [['word', 'ab'], [':', ':'], ['space', ' ']],
            colon:  true
        },
        end
    ]);
});

test('detects colon with newline', t => {
    run(t, [[['word', 'ab'], [':', ':'], ['newline', '\n']]], [
        {
            ...defaults,
            tokens: [['word', 'ab'], [':', ':']],
            colon:  true
        },
        {
            ...end,
            before: '\n'
        }
    ]);
});

test('ignores colon without space', t => {
    run(t, [[['word', 'ab'], [':', ':'], ['word', 'ba']]], [
        {
            ...defaults,
            tokens: [['word', 'ab'], [':', ':'], ['word', 'ba']],
            colon:  false
        },
        end
    ]);
});

test('ignores colon inside brackets', t => {
    run(t, [[['(', '('], [':', ':'], ['space', ' '], [')', ')']]], [
        {
            ...defaults,
            tokens: [['(', '('], [':', ':'], ['space', ' '], [')', ')']],
            colon:  false
        },
        end
    ]);
});

test('closes brackets', t => {
    run(t, [[['(', '('], [')', ')'], [':', ':'], ['space', ' ']]], [
        {
            ...defaults,
            tokens: [['(', '('], [')', ')'], [':', ':'], ['space', ' ']],
            colon:  true
        },
        end
    ]);
});

test('detects comments', t => {
    run(t, [[['comment', '// a']]], [
        {
            ...defaults,
            tokens:  [['comment', '// a']],
            comment: true
        },
        end
    ]);
});

test('detects mixed tabs and spaces in indent', t => {
    t.throws( () => {
        preprocess(new Input(''), [[['space', '\t '], ['word', 'ab']]]);
    }, '<css input>:1:2: Mixed tabs and spaces are not allowed');
});

test('detects mixed tabs and spaces in indents', t => {
    t.throws( () => {
        preprocess(new Input(''), [
            [['space', ' '],  ['newline', '\n', 1]],
            [['space', '\t'], ['word', 'ab']]
        ]);
    }, '<css input>:2:1: Mixed tabs and spaces are not allowed');
});

test('shows correct error position', t => {
    t.throws( () => {
        preprocess(new Input(''), [
            [['comment', '/*\n*/'],            ['newline', '\n', 2]],
            [['space', '\t'],  ['word', 'ab'], ['newline', '\n', 3]],
            [['space', '\t '], ['word', 'ab'], ['newline', '\n', 4]]
        ]);
    }, '<css input>:4:2: Mixed tabs and spaces are not allowed');
});
