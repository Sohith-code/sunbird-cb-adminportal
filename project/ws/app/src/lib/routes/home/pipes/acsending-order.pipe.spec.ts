import { AcsendingOrderPipe } from './acsending-order.pipe'

describe('AcsendingOrderPipe', () => {
  let pipe: AcsendingOrderPipe

  beforeEach(() => {
    pipe = new AcsendingOrderPipe()
  })

  it('create an instance', () => {
    expect(pipe).toBeTruthy()
  })

  it('should return the value unchanged when no order is given', () => {
    const value = ['b', 'a']
    expect(pipe.transform(value)).toBe(value)
    expect(pipe.transform(null as any, 'asc')).toBeNull()
  })

  it('should sort a 1d array in ascending order', () => {
    expect(pipe.transform(['hindi', 'english', 'tamil'], 'asc')).toEqual(['english', 'hindi', 'tamil'])
  })

  it('should sort a 1d array in descending order', () => {
    expect(pipe.transform(['hindi', 'english', 'tamil'], 'desc')).toEqual(['tamil', 'hindi', 'english'])
  })

  it('should sort numbers in a 1d array as strings', () => {
    expect(pipe.transform([10, 9, 1], 'asc')).toEqual([1, 10, 9])
  })

  it('should sort objects by the given column', () => {
    const value = [{ orgName: 'Beta' }, { orgName: 'Alpha' }, { orgName: 'Gamma' }]
    expect(pipe.transform(value, 'asc', 'orgName').map(v => v.orgName)).toEqual(['Alpha', 'Beta', 'Gamma'])
    expect(pipe.transform(value, 'desc', 'orgName').map(v => v.orgName)).toEqual(['Gamma', 'Beta', 'Alpha'])
  })
})
