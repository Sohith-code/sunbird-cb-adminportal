import { ReverseDateFormatPipe } from './reverse-date-format.pipe'

describe('ReverseDateFormatPipe', () => {
  let pipe: ReverseDateFormatPipe

  beforeEach(() => {
    pipe = new ReverseDateFormatPipe() // Create a new instance of the pipe
  })

  it('should transform a date string "YYYY-MM-DD" to "DD-MM-YYYY"', () => {
    const result = pipe.transform('2025-02-25')
    expect(result).toBe('25-02-2025') // The expected output after transformation
  })

  it('should return undefined for an invalid date input', () => {
    const result = pipe.transform('25/02/2025')
    expect(result).toBeUndefined() // In case the input doesn't match the expected format
  })

  it('should throw for a null input (pipe does not guard against non-string values)', () => {
    expect(() => pipe.transform(null)).toThrow()
  })

  it('should handle empty string input gracefully', () => {
    const result = pipe.transform('')
    expect(result).toBeUndefined() // Expected behavior if an empty string is passed
  })
})
