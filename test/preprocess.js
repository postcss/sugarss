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
            tokens: [['word', 'a'], ['newline', '\n', 3]]
        },
        {
            ...end,
            before: '  \n'
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
            tokens: [['word', 'a'], ['newline', '\n', 1]]
        }, {
            ...defaults,
            number: 2,
            tokens: [['word', 'b'], ['newline', '\n', 2]]
        },
        end
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
            tokens:    [['word', 'ab'], [',', ','], ['newline', '\n']],
            lastComma: true
        },
        end
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

test('detects colon', t => {
    run(t, [[['word', 'ab'], [':', ':'], ['word', 'ba']]], [
        {
            ...defaults,
            tokens: [['word', 'ab'], [':', ':'], ['word', 'ba']],
            colon:  true
        },
        end
    ]);
});

test('ignores colon inside brackets', t => {
    run(t, [[['(', '('], [':', ':'], [')', ')']]], [
        {
            ...defaults,
            tokens: [['(', '('], [':', ':'], [')', ')']],
            colon:  false
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
