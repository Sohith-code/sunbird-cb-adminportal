import { TestBed } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'

import { TncPublicResolverService } from './tnc-public-resolver.service'

describe('TncPublicResolverService', () => {
  let service: TncPublicResolverService
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TncPublicResolverService, provideHttpClient(), provideHttpClientTesting()],
    })
    service = TestBed.inject(TncPublicResolverService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => httpMock.verify())

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('getPublicTnc should append locale when provided', () => {
    service.getPublicTnc('hi').subscribe()
    const req = httpMock.expectOne('/apis/public/v8/tnc?locale=hi')
    expect(req.request.method).toBe('GET')
    req.flush({})
  })

  it('resolve should wrap data on success', () => {
    const tnc: any = { termsAndConditions: [] }
    let result: any
    service.resolve().subscribe(r => (result = r))
    httpMock.expectOne('/apis/public/v8/tnc').flush(tnc)
    expect(result).toEqual({ data: tnc, error: null })
  })

  it('resolve should wrap error on failure', () => {
    let result: any
    service.resolve().subscribe(r => (result = r))
    httpMock.expectOne('/apis/public/v8/tnc').flush('err', { status: 500, statusText: 'Server Error' })
    expect(result.data).toBeNull()
    expect(result.error).toBeTruthy()
  })
})
