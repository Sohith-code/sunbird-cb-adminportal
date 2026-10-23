import { TestBed } from '@angular/core/testing'
import { LOCALE_ID } from '@angular/core'
import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http'
import { MatSnackBar } from '@angular/material/snack-bar'
import { AuthKeycloakService, ConfigurationsService } from '@sunbird-cb/utils-v2'
import { of, throwError } from 'rxjs'

import { AppInterceptorService } from './app-interceptor.service'

describe('AppInterceptorService', () => {
  let service: AppInterceptorService
  let configSvc: any
  const authSvc = { force_logout: jest.fn() }
  const snackBar = { open: jest.fn() }

  beforeEach(() => {
    jest.clearAllMocks()
    configSvc = {
      userPreference: { selectedLangGroup: 'hi, ta' },
      activeOrg: 'org1',
      rootOrg: 'root1',
      userProfile: { userId: 'user1' },
      hostPath: 'host',
    }
    TestBed.configureTestingModule({
      providers: [
        { provide: ConfigurationsService, useValue: configSvc },
        { provide: AuthKeycloakService, useValue: authSvc },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: LOCALE_ID, useValue: 'en-US' },
      ],
    })
    service = TestBed.inject(AppInterceptorService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should add org headers when activeOrg and rootOrg are set', () => {
    const next = { handle: jest.fn().mockReturnValue(of(new HttpResponse())) }
    service.intercept(new HttpRequest('GET', '/test'), next as any).subscribe()
    const sentReq: HttpRequest<any> = next.handle.mock.calls[0][0]
    expect(sentReq.headers.get('org')).toBe('org1')
    expect(sentReq.headers.get('rootOrg')).toBe('root1')
    expect(sentReq.headers.get('locale')).toBe('en,hi,ta')
    expect(sentReq.headers.get('wid')).toBe('user1')
    expect(sentReq.headers.get('hostPath')).toBe('host')
  })

  it('should pass the request unchanged when org info is missing', () => {
    configSvc.activeOrg = null
    const req = new HttpRequest('GET', '/test')
    const next = { handle: jest.fn().mockReturnValue(of(new HttpResponse())) }
    service.intercept(req, next as any).subscribe()
    expect(next.handle).toHaveBeenCalledWith(req)
  })

  it('should force logout on 419 errors and rethrow', () => {
    const error = new HttpErrorResponse({ status: 419 })
    const next = { handle: jest.fn().mockReturnValue(throwError(error)) }
    let caught: any
    service.intercept(new HttpRequest('GET', '/test'), next as any).subscribe({ error: e => (caught = e) })
    expect(authSvc.force_logout).toHaveBeenCalled()
    expect(caught).toBe(error)
  })
})
