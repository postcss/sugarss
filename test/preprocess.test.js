let { deepStrictEqual, throws } = require('node:assert')
let { test } = require('node:test')
let { Input } = require('postcss')

let preprocess = require('../preprocess')

function run(lines, result) {
  deepStrictEqual(preprocess(new Input(''), lines), result)
}

let defaults = {
  atrule: false,
  before: '',
  colon: false,
  comment: false,
  indent: '',
  lastComma: false,
  number: 1
}

let end = { before: '', end: true }

test('cleans from lines', () => {
  run(
    [
      [['newline', '\n', 1]],
      [
        ['space', ' '],
        ['newline', '\n', 2]
      ],
      [
        ['word', 'a'],
        ['newline', '\n', 3]
      ],
      [
        ['space', '  '],
        ['newline', '\n', 4]
      ]
    ],
    [
      {
        ...defaults,
        before: '\n \n',
        number: 3,
        tokens: [['word', 'a']]
      },
      {
        ...end,
        before: '\n  \n'
      }
    ]
  )
})

test('separates indent = require(other tokens', () => {
  run(
    [
      [
        ['space', '  '],
        ['word', 'ab']
      ]
    ],
    [
      {
        ...defaults,
        indent: '  ',
        tokens: [['word', 'ab']]
      },
      end
    ]
  )
})

test('works with indentless strings', () => {
  run(
    [[['word', 'ab']]],
    [
      {
        ...defaults,
        indent: '',
        tokens: [['word', 'ab']]
      },
      end
    ]
  )
})

test('collects line number', () => {
  run(
    [
      [
        ['word', 'a'],
        ['newline', '\n', 1]
      ],
      [
        ['word', 'b'],
        ['newline', '\n', 2]
      ]
    ],
    [
      {
        ...defaults,
        number: 1,
        tokens: [['word', 'a']]
      },
      {
        ...defaults,
        before: '\n',
        number: 2,
        tokens: [['word', 'b']]
      },
      {
        ...end,
        before: '\n'
      }
    ]
  )
})

test('detects at-rules', () => {
  run(
    [
      [
        ['at-word', '@ab'],
        ['space', ' ']
      ]
    ],
    [
      {
        ...defaults,
        atrule: true,
        tokens: [
          ['at-word', '@ab'],
          ['space', ' ']
        ]
      },
      end
    ]
  )
})

test('detects last comma', () => {
  run(
    [
      [
        ['word', 'ab'],
        [',', ','],
        ['newline', '\n']
      ]
    ],
    [
      {
        ...defaults,
        lastComma: true,
        tokens: [
          ['word', 'ab'],
          [',', ',']
        ]
      },
      {
        ...end,
        before: '\n'
      }
    ]
  )
})

test('detects last comma with trailing spaces', () => {
  run(
    [
      [
        ['word', 'ab'],
        [',', ','],
        ['space', ' ']
      ]
    ],
    [
      {
        ...defaults,
        lastComma: true,
        tokens: [
          ['word', 'ab'],
          [',', ','],
          ['space', ' ']
        ]
      },
      end
    ]
  )
})

test('detects last comma with trailing comment', () => {
  run(
    [
      [
        ['word', 'ab'],
        [',', ','],
        ['comment', '// a']
      ]
    ],
    [
      {
        ...defaults,
        lastComma: true,
        tokens: [
          ['word', 'ab'],
          [',', ','],
          ['comment', '// a']
        ]
      },
      end
    ]
  )
})

test('ignore comma inside', () => {
  run(
    [
      [
        ['word', 'ab'],
        [',', ','],
        ['word', 'ba']
      ]
    ],
    [
      {
        ...defaults,
        lastComma: false,
        tokens: [
          ['word', 'ab'],
          [',', ','],
          ['word', 'ba']
        ]
      },
      end
    ]
  )
})

test('detects colon with space', () => {
  run(
    [
      [
        ['word', 'ab'],
        [':', ':'],
        ['space', ' ']
      ]
    ],
    [
      {
        ...defaults,
        colon: true,
        tokens: [
          ['word', 'ab'],
          [':', ':'],
          ['space', ' ']
        ]
      },
      end
    ]
  )
})

test('detects colon with newline', () => {
  run(
    [
      [
        ['word', 'ab'],
        [':', ':'],
        ['newline', '\n']
      ]
    ],
    [
      {
        ...defaults,
        colon: true,
        tokens: [
          ['word', 'ab'],
          [':', ':']
        ]
      },
      {
        ...end,
        before: '\n'
      }
    ]
  )
})

test('ignores colon without space', () => {
  run(
    [
      [
        ['word', 'ab'],
        [':', ':'],
        ['word', 'ba']
      ]
    ],
    [
      {
        ...defaults,
        colon: false,
        tokens: [
          ['word', 'ab'],
          [':', ':'],
          ['word', 'ba']
        ]
      },
      end
    ]
  )
})

test('ignores colon inside brackets', () => {
  run(
    [
      [
        ['(', '('],
        [':', ':'],
        ['space', ' '],
        [')', ')']
      ]
    ],
    [
      {
        ...defaults,
        colon: false,
        tokens: [
          ['(', '('],
          [':', ':'],
          ['space', ' '],
          [')', ')']
        ]
      },
      end
    ]
  )
})

test('closes brackets', () => {
  run(
    [
      [
        ['(', '('],
        [')', ')'],
        [':', ':'],
        ['space', ' ']
      ]
    ],
    [
      {
        ...defaults,
        colon: true,
        tokens: [
          ['(', '('],
          [')', ')'],
          [':', ':'],
          ['space', ' ']
        ]
      },
      end
    ]
  )
})

test('detects comments', () => {
  run(
    [[['comment', '// a']]],
    [
      {
        ...defaults,
        comment: true,
        tokens: [['comment', '// a']]
      },
      end
    ]
  )
})

test('detects mixed tabs and spaces in indent', () => {
  throws(() => {
    preprocess(new Input(''), [
      [
        ['space', '\t '],
        ['word', 'ab']
      ]
    ])
  }, /<css input>:1:2: Mixed tabs and spaces are not allowed/)
})

test('detects mixed tabs and spaces in indents', () => {
  throws(() => {
    preprocess(new Input(''), [
      [
        ['space', ' '],
        ['newline', '\n', 1]
      ],
      [
        ['space', '\t'],
        ['word', 'ab']
      ]
    ])
  }, /<css input>:2:1: Mixed tabs and spaces are not allowed/)
})

test('shows correct error position', () => {
  throws(() => {
    preprocess(new Input(''), [
      [
        ['comment', '/*\n*/'],
        ['newline', '\n', 2]
      ],
      [
        ['space', '\t'],
        ['word', 'ab'],
        ['newline', '\n', 3]
      ],
      [
        ['space', '\t '],
        ['word', 'ab'],
        ['newline', '\n', 4]
      ]
    ])
  }, /<css input>:4:2: Mixed tabs and spaces are not allowed/)
})
