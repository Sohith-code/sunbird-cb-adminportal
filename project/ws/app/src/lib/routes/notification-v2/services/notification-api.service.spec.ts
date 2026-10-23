import { TestBed } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'

import { NotificationApiService } from './notification-api.service'

describe('NotificationApiService', () => {
  let service: NotificationApiService
  let httpMock: HttpTestingController
  const base = '/apis/protected/v8/user/notifications'

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [NotificationApiService, provideHttpClient(), provideHttpClientTesting()],
    })
    service = TestBed.inject(NotificationApiService)
    httpMock = TestBed.inject(HttpTestingController)
  })

  afterEach(() => httpMock.verify())

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should get notifications with query params', () => {
    service.getNotifications('Action', 10, 'p1').subscribe()
    const req = httpMock.expectOne(r => r.url === base)
    expect(req.request.params.get('classification')).toBe('Action')
    expect(req.request.params.get('size')).toBe('10')
    expect(req.request.params.get('page')).toBe('p1')
    req.flush({})
  })

  it('should patch a single notification seen status', () => {
    service.updateNotificationSeenStatus('n1', 'Action' as any).subscribe()
    const req = httpMock.expectOne(`${base}/n1/Action`)
    expect(req.request.method).toBe('PATCH')
    expect(req.request.body).toEqual({ seen: true })
    req.flush({})
  })

  it('should patch all notifications when no id given', () => {
    service.updateNotificationSeenStatus().subscribe()
    const req = httpMock.expectOne(base)
    expect(req.request.body).toEqual({})
    req.flush({})
  })
})
