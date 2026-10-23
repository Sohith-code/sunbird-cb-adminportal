import { TestBed } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'

import { TncAppResolverService } from './tnc-app-resolver.service'

describe('TncAppResolverService', () => {
  let service: TncAppResolverService
  let httpMock: HttpTestingController
  const configSvc: any = { userPreference: null }

  beforeEach(() => {
    configSvc.userPreference = null
    TestBed.configureTestingModule({
      providers: [
        TncAppResolverService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigurationsService, useValue: configSvc },
      ],
    })
    service = TestBed.inject(TncAppResolverService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => httpMock.verify())

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('resolve should use the selected locale from user preference', () => {
    configSvc.userPreference = { selectedLocale: 'ta' }
    const tnc: any = { termsAndConditions: [] }
    let result: any
    service.resolve().subscribe(r => (result = r))
    httpMock.expectOne('/apis/protected/v8/user/tnc?locale=ta').flush(tnc)
    expect(result).toEqual({ data: tnc, error: null })
  })

  it('resolve should wrap error on failure', () => {
    let result: any
    service.resolve().subscribe(r => (result = r))
    httpMock.expectOne('/apis/protected/v8/user/tnc').flush('err', { status: 500, statusText: 'Server Error' })
    expect(result.data).toBeNull()
    expect(result.error).toBeTruthy()
  })
})
