import preprocess from '../preprocess';

import Input from 'postcss/lib/input';
import test  from 'ava';

function run(t, lines, result) {
    t.same(preprocess(new Input(''), lines), result);
}

test('separates indent from other tokens', t => {
    run(t, [[['space', '  '], ['word', 'ab']]], [
        {
            number:    1,
            indent:    '  ',
            tokens:    [['word', 'ab']],
            colon:     false,
            atrule:    false,
            comment:   false,
            lastComma: false
        }
    ]);
});

test('works with indentless strings', t => {
    run(t, [[['word', 'ab']]], [
        {
            number:    1,
            indent:    '',
            tokens:    [['word', 'ab']],
            colon:     false,
            atrule:    false,
            comment:   false,
            lastComma: false
        }
    ]);
});

test('collects line number', t => {
    run(t, [
        [['newline', '\n', 1]],
        [['newline', '\n', 2]]
    ], [
        {
            number:    1,
            indent:    '',
            tokens:    [['newline', '\n', 1]],
            colon:     false,
            atrule:    false,
            comment:   false,
            lastComma: false
        }, {
            number:    2,
            indent:    '',
            tokens:    [['newline', '\n', 2]],
            colon:     false,
            atrule:    false,
            comment:   false,
            lastComma: false
        }
    ]);
});

test('detects at-rules', t => {
    run(t, [[['at-word', '@ab'], ['space', ' ']]], [
        {
            number:    1,
            indent:    '',
            tokens:    [['at-word', '@ab'], ['space', ' ']],
            colon:     false,
            atrule:    true,
            comment:   false,
            lastComma: false
        }
    ]);
});

test('detects last comma', t => {
    run(t, [[['word', 'ab'], [',', ',']]], [
        {
            number:    1,
            indent:    '',
            tokens:    [['word', 'ab'], [',', ',']],
            colon:     false,
            atrule:    false,
            comment:   false,
            lastComma: true
        }
    ]);
});

test('detects last comma with trailing spaces', t => {
    run(t, [[['word', 'ab'], [',', ','], ['space', ' ']]], [
        {
            number:    1,
            indent:    '',
            tokens:    [['word', 'ab'], [',', ','], ['space', ' ']],
            colon:     false,
            atrule:    false,
            comment:   false,
            lastComma: true
        }
    ]);
});

test('ignore comma inside', t => {
    run(t, [[['word', 'ab'], [',', ','], ['word', 'ba']]], [
        {
            number:    1,
            indent:    '',
            tokens:    [['word', 'ab'], [',', ','], ['word', 'ba']],
            colon:     false,
            atrule:    false,
            comment:   false,
            lastComma: false
        }
    ]);
});

test('detects colon', t => {
    run(t, [[['word', 'ab'], [':', ':'], ['word', 'ba']]], [
        {
            number:    1,
            indent:    '',
            tokens:    [['word', 'ab'], [':', ':'], ['word', 'ba']],
            colon:     true,
            atrule:    false,
            comment:   false,
            lastComma: false
        }
    ]);
});

test('detects comments', t => {
    run(t, [[['comment', '// a']]], [
        {
            number:    1,
            indent:    '',
            tokens:    [['comment', '// a']],
            colon:     false,
            atrule:    false,
            comment:   true,
            lastComma: false
        }
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
