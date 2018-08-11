const sugarss = require('../')

it('has parse()', () => {
  expect(typeof sugarss.parse).toEqual('function')
})

it('has stringify()', () => {
  expect(typeof sugarss.stringify).toEqual('function')
})
