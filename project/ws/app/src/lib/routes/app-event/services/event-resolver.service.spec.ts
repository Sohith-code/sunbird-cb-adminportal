import { TestBed } from '@angular/core/testing'
import { of, throwError } from 'rxjs'

import { EventResolverService } from './event-resolver.service'
import { EventService } from './event.service'

describe('EventResolverService', () => {
  let service: EventResolverService
  const eventSvcMock = { getEventData: jest.fn() }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EventResolverService,
        { provide: EventService, useValue: eventSvcMock },
      ],
    })
    service = TestBed.inject(EventResolverService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should resolve event data by id', done => {
    eventSvcMock.getEventData.mockReturnValue(of({ Events: { a: { n: 1 }, b: { n: 2 } } }))
    service.resolve({ params: { id: '2' } } as any).subscribe(res => {
      expect(res).toEqual({ data: { n: 2 }, error: null })
      done()
    })
  })

  it('should return error on failure', done => {
    eventSvcMock.getEventData.mockReturnValue(throwError('err'))
    service.resolve({ params: {} } as any).subscribe(res => {
      expect(res).toEqual({ data: null, error: 'err' })
      done()
    })
  })
})
