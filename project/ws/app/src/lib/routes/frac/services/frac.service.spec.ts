import { TestBed } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'

import { FracService } from './frac.service'

describe('FracService', () => {
  let service: FracService
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigurationsService, useValue: { baseUrl: 'assets' } },
      ],
    })
    service = TestBed.inject(FracService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should fetch frac json', async () => {
    const promise = service.fetchFrac()
    const req = httpMock.expectOne('assets/feature/frac.json')
    req.flush({ a: 1 })
    await expect(promise).resolves.toEqual({ a: 1 })
  })
})
