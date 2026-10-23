import { CapitalizePipe } from './capitalize.pipe' // Adjust path as needed

describe('CapitalizePipe', () => {
  let pipe: CapitalizePipe

  beforeEach(() => {
    pipe = new CapitalizePipe()
  })

  it('should create an instance', () => {
    expect(pipe).toBeTruthy()
  })

  it('should return the same value if input is empty', () => {
    expect(pipe.transform('')).toBe('')
    expect(pipe.transform(null as any)).toBeNull()
    expect(pipe.transform(undefined as any)).toBeUndefined()
  })

  it('should capitalize the first letter of each word', () => {
    expect(pipe.transform('hello world')).toBe('Hello World')
    expect(pipe.transform('angular pipe testing')).toBe('Angular Pipe Testing')
  })

  it('should handle single-word input', () => {
    expect(pipe.transform('hello')).toBe('Hello')
  })

  it('should not modify already capitalized input', () => {
    expect(pipe.transform('Hello World')).toBe('Hello World')
  })

  it('should only uppercase the first letter of each word in mixed case input', () => {
    expect(pipe.transform('hElLo WoRlD')).toBe('HElLo WoRlD')
  })

  it('should return falsy non-string inputs unchanged', () => {
    expect(pipe.transform(0 as any)).toBe(0)
    expect(pipe.transform(false as any)).toBe(false)
  })
})
