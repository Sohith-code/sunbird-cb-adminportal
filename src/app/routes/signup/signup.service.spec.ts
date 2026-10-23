import { TestBed } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'

import { SignupService } from './signup.service'

describe('SignupService', () => {
  let service: SignupService
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    })
    service = TestBed.inject(SignupService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => httpMock.verify())

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should POST signup data and map the response to result', () => {
    const payload = { firstName: 'a', email: 'a@b.com' }
    let result: any
    service.signup(payload).subscribe(res => (result = res))
    const req = httpMock.expectOne('/apis/public/v8/signup')
    expect(req.request.method).toBe('POST')
    expect(req.request.body).toEqual(payload)
    req.flush({ result: { status: 'OK' } })
    expect(result).toEqual({ status: 'OK' })
  })
})
