import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { AuthKeycloakService, ConfigurationsService } from '@sunbird-cb/utils-v2'

import { GeneralGuard } from './general.guard'

describe('GeneralGuard', () => {
  let guard: GeneralGuard
  let configSvc: any
  const router = {
    parseUrl: jest.fn((url: string) => ({ url })),
    navigateByUrl: jest.fn(),
  }
  const authSvc = { force_logout: jest.fn() }
  const state: any = { url: '/app/home' }

  beforeEach(() => {
    jest.clearAllMocks()
    configSvc = {
      userProfile: { userId: 'u1' },
      instanceConfig: { disablePidCheck: false },
      hasAcceptedTnc: true,
      profileDetailsStatus: true,
      userRoles: new Set(['admin']),
      restrictedFeatures: new Set(['restricted']),
    }
    TestBed.configureTestingModule({
      providers: [
        GeneralGuard,
        { provide: Router, useValue: router },
        { provide: ConfigurationsService, useValue: configSvc },
        { provide: AuthKeycloakService, useValue: authSvc },
      ],
    })
    guard = TestBed.inject(GeneralGuard)
  })

  it('should be created', () => {
    expect(guard).toBeTruthy()
  })

  it('should allow when user has required role and feature is not restricted', async () => {
    const result = await guard.canActivate({ data: { requiredRoles: ['admin'], requiredFeatures: ['x'] } } as any, state)
    expect(result).toBe(true)
  })

  it('should redirect to invalid-user when user profile is null', async () => {
    configSvc.userProfile = null
    const result = await guard.canActivate({ data: {} } as any, state)
    expect(router.parseUrl).toHaveBeenCalledWith('/app/invalid-user')
    expect(result).toEqual({ url: '/app/invalid-user' })
  })

  it('should redirect to /page/home when required role is missing', async () => {
    const result = await guard.canActivate({ data: { requiredRoles: ['super'] } } as any, state)
    expect(result).toEqual({ url: '/page/home' })
  })

  it('should redirect to /app/home when a required feature is restricted', async () => {
    const result = await guard.canActivate({ data: { requiredFeatures: ['restricted'] } } as any, state)
    expect(result).toEqual({ url: '/app/home' })
  })

  it('should logout and deny when unmapped user is deleted', async () => {
    configSvc.unMappedUser = { isDeleted: true }
    const result = await guard.canActivate({ data: {} } as any, state)
    expect(router.navigateByUrl).toHaveBeenCalledWith('/error-access-forbidden')
    expect(authSvc.force_logout).toHaveBeenCalled()
    expect(result).toBe(false)
  })

  it('hasRole should match roles case-insensitively', () => {
    expect(guard.hasRole(['ADMIN'])).toBe(true)
    expect(guard.hasRole(['other'])).toBe(false)
  })
})
