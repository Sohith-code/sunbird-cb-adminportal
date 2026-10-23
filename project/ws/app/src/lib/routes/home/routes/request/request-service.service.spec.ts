import { TestBed } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'

import { RequestServiceService } from './request-service.service'

describe('RequestServiceService', () => {
  let service: RequestServiceService
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    })
    service = TestBed.inject(RequestServiceService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => httpMock.verify())

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should map competency from getFilterEntity', () => {
    let result: any
    service.getFilterEntity({ a: 1 }).subscribe(r => (result = r))
    const req = httpMock.expectOne('apis/proxies/v8/competency/v4/search')
    expect(req.request.method).toBe('POST')
    req.flush({ result: { competency: [{ id: 1 }] } })
    expect(result).toEqual([{ id: 1 }])
  })

  it('should map categories from getFilterEntityV2', () => {
    let result: any
    service.getFilterEntityV2().subscribe(r => (result = r))
    httpMock.expectOne('apis/proxies/v8/framework/v1/read/kcmfinal_fw').flush({ result: { framework: { categories: ['c'] } } })
    expect(result).toEqual(['c'])
  })

  it('should map content from getRequestTypeList', () => {
    let result: any
    service.getRequestTypeList({}).subscribe(r => (result = r))
    httpMock.expectOne('/apis/proxies/v8/org/v1/search').flush({ result: { response: { content: [1, 2] } } })
    expect(result).toEqual([1, 2])
  })

  it('should post createDemand and markAsInvalid', () => {
    service.createDemand({ t: 1 }).subscribe()
    const create = httpMock.expectOne('/apis/proxies/v8/demand/content/create')
    expect(create.request.body).toEqual({ t: 1 })
    create.flush({})
    service.markAsInvalid({ demand_id: 1 }).subscribe()
    httpMock.expectOne('/apis/proxies/v8/demand/content/v1/update/status').flush({})
  })

  it('should map result from getRequestList, getRequestDataById and getOrgInterestList', () => {
    const results: any[] = []
    service.getRequestList({}).subscribe(r => results.push(r))
    httpMock.expectOne('/apis/proxies/v8/demand/content/search').flush({ result: { result: 'list' } })
    service.getRequestDataById('d1').subscribe(r => results.push(r))
    const byId = httpMock.expectOne('apis/proxies/v8/demand/content/read/d1')
    expect(byId.request.method).toBe('GET')
    byId.flush({ result: { result: 'one' } })
    service.getOrgInterestList({}).subscribe(r => results.push(r))
    httpMock.expectOne('/apis/proxies/v8/interest/v1/search').flush({ result: { result: 'orgs' } })
    expect(results).toEqual(['list', 'one', 'orgs'])
  })

  it('should PUT assignToOrg', () => {
    service.assignToOrg({ id: 1 }).subscribe()
    const req = httpMock.expectOne('/apis/proxies/v8/interest/v1/assign')
    expect(req.request.method).toBe('PUT')
    req.flush({})
  })
})
