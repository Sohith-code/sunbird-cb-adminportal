import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'

import { UsersService } from './users.service'

describe('UsersService', () => {
  let service: UsersService
  let httpMock: HttpTestingController

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    })
    service = TestBed.inject(UsersService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('fetchIgotRoles returns deduped roles sorted alphabetically', done => {
    service.fetchIgotRoles().subscribe(roles => {
      expect(roles).toEqual(['Admin', 'editor', 'Viewer'])
      done()
    })

    const req = httpMock.expectOne(r => r.url.includes('/data/v1/system/settings/get/orgTypeList'))
    req.flush({
      result: {
        response: {
          value: JSON.stringify({
            orgTypeList: [
              { roles: ['Viewer', 'Admin'] },
              { roles: ['editor', 'Admin'] },
            ],
          }),
        },
      },
    })
  })
})
