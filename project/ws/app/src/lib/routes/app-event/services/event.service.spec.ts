import { TestBed } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'

import { EventService } from './event.service'

describe('EventService', () => {
  let service: EventService
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [EventService, provideHttpClient(), provideHttpClientTesting()],
    })
    service = TestBed.inject(EventService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => httpMock.verify())

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should fetch event data', () => {
    service.getEventData().subscribe(res => expect(res).toEqual({ Events: {} }))
    const req = httpMock.expectOne('/apis/protected/v8/event-external/')
    expect(req.request.method).toBe('GET')
    req.flush({ Events: {} })
  })
})
