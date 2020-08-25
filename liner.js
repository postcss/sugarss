module.exports = function liner (tokens) {
  let line = []
  let result = [line]
  let brackets = 0
  for (let token of tokens) {
    line.push(token)
    if (token[0] === '(') {
      brackets += 1
    } else if (token[0] === ')') {
      brackets -= 1
    } else if (token[0] === 'newline' && brackets === 0) {
      line = []
      result.push(line)
    }
  }
  return result
}
