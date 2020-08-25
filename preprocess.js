function indentError (input, l, p) {
  throw input.error('Mixed tabs and spaces are not allowed', l, p + 1)
}

module.exports = function preprocess (input, lines) {
  let indentType
  let prevNumber = 0
  let parts = lines.map(line => {
    let lastComma = false
    let comment = false
    let number = prevNumber + 1
    let atrule = false
    let indent = ''
    let tokens = []
    let colon = false

    if (line.length > 0) {
      if (line[0][0] === 'space') {
        indent = line[0][1]
        tokens = line.slice(1)
      } else {
        indent = ''
        tokens = line
      }

      if (!indentType && indent.length) {
        indentType = indent[0] === ' ' ? 'space' : 'tab'
      }
      if (indentType === 'space') {
        if (indent.includes('\t')) {
          indentError(input, number, indent.indexOf('\t'))
        }
      } else if (indentType === 'tab') {
        if (indent.includes(' ')) {
          indentError(input, number, indent.indexOf(' '))
        }
      }

      if (tokens.length) {
        for (let i = tokens.length - 1; i >= 0; i--) {
          let type = tokens[i][0]
          if (type === ',') {
            lastComma = true
            break
          } else if (type === 'space') {
            continue
          } else if (type === 'comment') {
            continue
          } else if (type === 'newline') {
            continue
          } else {
            break
          }
        }
        comment = tokens[0][0] === 'comment'
        atrule = tokens[0][0] === 'at-word'

        let brackets = 0
        for (let i = 0; i < tokens.length - 1; i++) {
          let type = tokens[i][0]
          let next = tokens[i + 1][0]
          if (type === '(') {
            brackets += 1
          } else if (type === ')') {
            brackets -= 1
          } else if (
            type === ':' &&
            brackets === 0 &&
            (next === 'space' || next === 'newline')
          ) {
            colon = true
          }
        }
      }

      let last = tokens[tokens.length - 1]
      if (last && last[0] === 'newline') prevNumber = last[2]
    }

    return {
      number,
      indent,
      colon,
      tokens,
      atrule,
      comment,
      lastComma,
      before: ''
    }
  })

  parts = parts.reduceRight(
    (all, i) => {
      if (!i.tokens.length || i.tokens.every(j => j[0] === 'newline')) {
        let prev = all[0]
        let before = i.indent + i.tokens.map(j => j[1]).join('')
        prev.before = before + prev.before
      } else {
        all.unshift(i)
      }
      return all
    },
    [{ end: true, before: '' }]
  )

  parts.forEach((part, i) => {
    if (i === 0) return

    let prev = parts[i - 1]
    let last = prev.tokens[prev.tokens.length - 1]
    if (last && last[0] === 'newline') {
      part.before = last[1] + part.before
      prev.tokens.pop()
    }
  })

  return parts
}
