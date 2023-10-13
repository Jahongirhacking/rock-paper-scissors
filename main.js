// Everything about Key Generator
class KeyGenerator {
  static generateKey() {
    const crypto = require('crypto')
    return crypto.randomBytes(32).toString('hex')
  }
}

// Everything about Rules
class Rules {
  static determineWinner(playerMove, computerMove, moves) {
    const half = Math.floor(moves.length / 2)
    const movesBefore = moves.slice(0, half)
    const movesAfter = moves.slice(half + 1)

    if (movesBefore.includes(playerMove) && movesAfter.includes(computerMove)) {
      return 'Player Wins'
    } else if (movesAfter.includes(playerMove) && movesBefore.includes(computerMove)) {
      return 'Computer Wins'
    } else {
      return 'Draw'
    }
  }
}

// Everything about Table Generator
class TableGenerator {
  static generateTable(moves) {
    const table = [['Moves', ...moves]]

    for (let i = 0; i < moves.length; i++) {
      const row = [moves[i]]
      for (let j = 0; j < moves.length; j++) {
        if (i === j) {
          row.push('Draw')
        } else {
          row.push(Rules.determineWinner(moves[i], moves[j], moves))
        }
      }
      table.push(row)
    }

    return table
  }
}

// Everything about Game Processes
class Game {
  constructor(moves) {
    this.moves = moves
    this.key = KeyGenerator.generateKey()
    this.computerMove = this.generateRandomMove()
  }

  generateRandomMove() {
    const randomIndex = Math.floor(Math.random() * this.moves.length)
    return this.moves[randomIndex]
  }

  calculateHMAC(move) {
    const crypto = require('crypto')
    const hmac = crypto.createHmac('sha256', this.key)
    hmac.update(move)
    return hmac.digest('hex')
  }

  play(playerMove) {
    const hmac = this.calculateHMAC(this.computerMove)
    const result = Rules.determineWinner(playerMove, this.computerMove, this.moves)

    return {
      hmac,
      result,
      computerMove: this.computerMove,
      key: this.key,
    }
  }
}

// Command Line Argument Handling
const args = process.argv.slice(2)
if (args.length < 3 || args.length % 2 !== 1 || new Set(args).size !== args.length) {
  console.error('Incorrect arguments. Please provide an odd number >= 3 of non-repeating strings.')
  console.error('Example: node rockPaperScissors.js rock paper scissors')
  process.exit(1)
}

const moves = args
const game = new Game(moves)

// Display Help Table
const helpTable = TableGenerator.generateTable(moves)
console.table(helpTable)

// Game Menu
console.log('Available moves:')
moves.forEach((move, index) => console.log(`${index + 1} - ${move}`))
console.log('0 - exit')
console.log('? - help')

// User Input
const readline = require('readline')
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

rl.question('Enter your move: ', (selectedMove) => {
  if (selectedMove === '?') {
    console.table(helpTable)
    rl.close()
  } else if (isNaN(selectedMove) || selectedMove < 0 || selectedMove > moves.length) {
    console.error('Invalid input. Please enter a valid move or ? for help.')
    rl.close()
  } else if (selectedMove === '0') {
    rl.close()
  } else {
    const playerMove = moves[selectedMove - 1]
    const result = game.play(playerMove)

    console.log(`Your move: ${playerMove}`)
    console.log(`Computer move: ${result.computerMove}`)
    console.log(`Result: ${result.result}`)
    console.log(`HMAC key: ${result.key}`)

    rl.close()
  }
})
