import { TestBed } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'

import { SignupAutoService } from './signup-auto.service'

describe('SignupAutoService', () => {
  let service: SignupAutoService
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SignupAutoService, provideHttpClient(), provideHttpClientTesting()],
    })
    service = TestBed.inject(SignupAutoService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => httpMock.verify())

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should POST to the signup endpoint with the id and return the response', () => {
    const mockResponse = { code: 'SUCCESS' }
    let result: any
    service.signup('abc').subscribe(res => (result = res))
    const req = httpMock.expectOne('/apis/public/v8/signup/create/abc')
    expect(req.request.method).toBe('POST')
    expect(req.request.body).toEqual({})
    req.flush(mockResponse)
    expect(result).toEqual(mockResponse)
  })
})
