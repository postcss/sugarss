import preprocess from '../preprocess';

import test from 'ava';

test('separates indent from other tokens', t => {
    t.same(preprocess([[['space', '  '], ['word', 'ab']]]), [
        {
            indent:    '  ',
            tokens:    [['word', 'ab']],
            colon:     false,
            atrule:    false,
            lastComma: false
        }
    ]);
});

test('works with indentless strings', t => {
    t.same(preprocess([[['word', 'ab']]]), [
        {
            indent:    '',
            tokens:    [['word', 'ab']],
            colon:     false,
            atrule:    false,
            lastComma: false
        }
    ]);
});

test('detects at-rules', t => {
    t.same(preprocess([[['at-word', '@ab'], ['space', ' ']]]), [
        {
            indent:    '',
            tokens:    [['at-word', '@ab'], ['space', ' ']],
            colon:     false,
            atrule:    true,
            lastComma: false
        }
    ]);
});

test('detects last comma', t => {
    t.same(preprocess([[['word', 'ab'], [',', ',']]]), [
        {
            indent:    '',
            tokens:    [['word', 'ab'], [',', ',']],
            colon:     false,
            atrule:    false,
            lastComma: true
        }
    ]);
});

test('ignore comma inside', t => {
    t.same(preprocess([[['word', 'ab'], [',', ','], ['word', 'ba']]]), [
        {
            indent:    '',
            tokens:    [['word', 'ab'], [',', ','], ['word', 'ba']],
            colon:     false,
            atrule:    false,
            lastComma: false
        }
    ]);
});

test('detects colon', t => {
    t.same(preprocess([[['word', 'ab'], [':', ':'], ['word', 'ba']]]), [
        {
            indent:    '',
            tokens:    [['word', 'ab'], [':', ':'], ['word', 'ba']],
            colon:     true,
            atrule:    false,
            lastComma: false
        }
    ]);
});
