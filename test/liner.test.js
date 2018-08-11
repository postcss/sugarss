const liner = require('../liner')

it('packs tokens by lines', () => {
  let tokens = [['word', 'a'], ['newline', '\n'], ['word', 'b']]
  expect(liner(tokens)).toEqual([
    [['word', 'a'], ['newline', '\n']],
    [['word', 'b']]
  ])
})

it('ignores newline inside brackets', () => {
  let tokens = [['(', '('], ['newline', '\n'], [')', ')']]
  expect(liner(tokens)).toEqual([
    [['(', '('], ['newline', '\n'], [')', ')']]
  ])
})
