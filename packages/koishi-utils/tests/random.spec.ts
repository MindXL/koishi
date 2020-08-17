import { Random, isInteger } from '../src'
import { expect } from 'chai'

describe('Random Manipulations', () => {
  it('Random.id', () => {
    expect(Random.id()).to.have.length(8)
    expect(Random.id(10)).to.have.length(10)
  })

  it('Random.bool', () => {
    for (let i = 0; i < 10; ++i) {
      expect(typeof Random.bool(0.5)).to.equal('boolean')
      expect(Random.bool(0)).to.equal(false)
      expect(Random.bool(1)).to.equal(true)
    }
  })

  it('Random.real', () => {
    let value: number
    for (let i = 0; i < 10; ++i) {
      value = Random.real(2, 5)
      expect(value < 5 && value >= 2).to.equal(true)
      value = Random.real(5)
      expect(value < 5 && value >= 0).to.equal(true)
    }
  })

  it('Random.int', () => {
    let value: number
    for (let i = 0; i < 10; ++i) {
      value = Random.int(2, 5.9)
      expect(value <= 5 && value >= 2 && isInteger(value)).to.equal(true)
      value = Random.int(5.9)
      expect(value <= 5 && value >= 0 && isInteger(value)).to.equal(true)
    }
  })

  it('Random.pick', () => {
    const source = new Array(10).fill(undefined).map((_, index) => index)
    const value = Random.pick(source)
    expect(value < 10 && value >= 0 && isInteger(value)).to.equal(true)
    expect(source).to.have.length(10)
  })

  it('Random.splice', () => {
    const source = new Array(10).fill(undefined).map((_, index) => index)
    const value = Random.splice(source)
    expect(value < 10 && value >= 0 && isInteger(value)).to.equal(true)
    expect(source).to.have.length(9)
    expect(source.indexOf(value)).to.equal(-1)
  })

  it('Random.multiPick', () => {
    const source = new Array(10).fill(undefined).map((_, index) => index)
    const values = Random.multiPick(source, 5)
    values.forEach(value => expect(value < 10 && value >= 0 && isInteger(value)).to.equal(true))
    expect(values).to.have.length(5)
    expect(source).to.have.length(10)
  })

  it('Random.weightedPick', () => {
    const source: Record<string, number> = {}
    for (let index = 0; index < 10; ++index) source[index] = index
    const value = +Random.weightedPick(source)
    expect(value < 10 && value >= 0 && isInteger(value)).to.equal(true)
    expect(Object.keys(source)).to.have.length(10)
  })
})
