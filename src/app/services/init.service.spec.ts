import { TestBed } from '@angular/core/testing'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { APP_BASE_HREF } from '@angular/common'
import { MatIconRegistry } from '@angular/material/icon'
import { DomSanitizer } from '@angular/platform-browser'

import { InitService } from './init.service'
import { ConfigurationsService, LoggerService, UserPreferenceService } from '@sunbird-cb/utils-v2'
import { BtnSettingsService } from '@sunbird-cb/collection'
import { SbUiResolverService } from '@sunbird-cb/resolver-v2'
import { environment } from '../../environments/environment'
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'
import { TranslateService } from '@ngx-translate/core'

describe('InitService', () => {
  let service: InitService
  let httpMock: HttpTestingController
  let configServiceMock: jest.Mocked<ConfigurationsService>
  // let loggerServiceMock: jest.Mocked<LoggerService>
  // let SbUiResolverServiceMock: jest.Mocked<SbUiResolverService>
  // let btnSettingsServiceMock: jest.Mocked<BtnSettingsService>
  // let userPreferenceServiceMock: jest.Mocked<UserPreferenceService>
  // let domSanitizerMock: jest.Mocked<DomSanitizer>
  let matIconRegistryMock: jest.Mocked<MatIconRegistry>

  beforeEach(() => {
    const configServiceMockImpl = {
      baseUrl: 'http://test.com',
      instanceConfig: null,
      isProduction: false,
      sitePath: 'http://test.com/site',
      setUserProfile: jest.fn(),
      userGroups: new Set(),
      userRoles: new Set(),
      restrictedFeatures: new Set(),
      rootOrg: '',
      org: [],
      activeOrg: '',
      unMappedUser: null,
      userProfile: null,
      userProfileV2: null,
      hasAcceptedTnc: false,
      profileDetailsStatus: false,
    }

    const domSanitizerMockImpl = {
      bypassSecurityTrustResourceUrl: jest.fn((url: string) => url)
    }

    const matIconRegistryMockImpl = {
      addSvgIcon: jest.fn()
    }

    TestBed.configureTestingModule({
    imports: [],
    providers: [
        InitService,
        {
            provide: ConfigurationsService,
            useValue: configServiceMockImpl
        },
        {
            provide: LoggerService,
            useValue: {
                info: jest.fn(),
                warn: jest.fn(),
                error: jest.fn()
            }
        },
        {
            provide: SbUiResolverService,
            useValue: {
                initialize: jest.fn(),
                getWidgetKey: jest.fn()
            }
        },
        {
            provide: BtnSettingsService,
            useValue: {
                initializePrefChanges: jest.fn()
            }
        },
        {
            provide: UserPreferenceService,
            useValue: {
                initialize: jest.fn()
            }
        },
        {
            provide: DomSanitizer,
            useValue: domSanitizerMockImpl
        },
        {
            provide: MatIconRegistry,
            useValue: matIconRegistryMockImpl
        },
        {
            provide: TranslateService,
            useValue: {
                setDefaultLang: jest.fn(),
                use: jest.fn(),
            }
        },
        {
            provide: APP_BASE_HREF,
            useValue: '/test'
        },
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting()
    ]
})

    service = TestBed.inject(InitService)
    httpMock = TestBed.inject(HttpTestingController)
    configServiceMock = TestBed.inject(ConfigurationsService) as jest.Mocked<ConfigurationsService>
    // loggerServiceMock = TestBed.inject(LoggerService) as jest.Mocked<LoggerService>
    // SbUiResolverServiceMock = TestBed.inject(SbUiResolverService) as jest.Mocked<SbUiResolverService>
    // btnSettingsServiceMock = TestBed.inject(BtnSettingsService) as jest.Mocked<BtnSettingsService>
    // userPreferenceServiceMock = TestBed.inject(UserPreferenceService) as jest.Mocked<UserPreferenceService>
    // domSanitizerMock = TestBed.inject(DomSanitizer) as jest.Mocked<DomSanitizer>
    matIconRegistryMock = TestBed.inject(MatIconRegistry) as jest.Mocked<MatIconRegistry>
  })

  afterEach(() => {
    httpMock.verify()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should initialize translations using the locale from baseHref', () => {
    const translate = TestBed.inject(TranslateService) as any
    expect(translate.setDefaultLang).toHaveBeenCalledWith('en')
    expect(translate.use).toHaveBeenCalledWith('test')
  })

  describe('fetchDefaultConfig', () => {
    it('should fetch and set default configuration', async () => {
      const mockConfig = {
        rootOrg: 'TestRootOrg',
        org: ['TestOrg'],
        appSetup: {},
        competency: {},
        details: { appName: 'TestApp' },
        backgrounds: {}
      }

      const fetchDefaultConfigPromise = service['fetchDefaultConfig']()

      const req = httpMock.expectOne('http://test.com/host.config.json')
      req.flush(mockConfig)

      const result = await fetchDefaultConfigPromise

      expect(result).toEqual(mockConfig)
      expect(configServiceMock.instanceConfig).toEqual(mockConfig)
      expect(configServiceMock.rootOrg).toBe('TestRootOrg')
      expect(configServiceMock.org).toEqual(['TestOrg'])
      expect(configServiceMock.activeOrg).toBe('TestOrg')
    })
  })

  describe('locale getter', () => {
    it('should return baseHref without slashes or default to "en"', () => {
      expect(service.locale).toBe('test')
    })
  })

  describe('hasRole', () => {
    it('should return true if any role matches environment portalRoles', () => {
      environment.portalRoles = ['ADMIN', 'USER']

      expect(service.hasRole(['ADMIN'])).toBeTruthy()
      expect(service.hasRole(['GUEST'])).toBeFalsy()
    })
  })

  describe('Icon Registration', () => {
    it('should register SVG icons during construction', () => {
      const expectedIcons = [
        'pin', 'facebook', 'linked-in',
        'twitter', 'goi', 'hubs'
      ]

      expectedIcons.forEach(icon => {
        expect(matIconRegistryMock.addSvgIcon).toHaveBeenCalledWith(
          icon,
          expect.any(String)
        )
      })
    })
  })

  // More complex method tests would require more setup and mocking
  describe('init method', () => {
    afterEach(() => {
      window.history.pushState({}, '', '/')
    })

    it('should handle initialization for public paths', async () => {
      // Simulate public path (jsdom does not allow redefining window.location)
      window.history.pushState({}, '', '/public/home')
      const defaultConfig: any = { rootOrg: 'root', org: ['org'], backgrounds: {} }
      const instanceConfig: any = { rootOrg: 'root', org: ['org'], featuredApps: ['f1', 'f2'], backgrounds: {} }
      const appsConfig: any = { features: { f1: { id: 'f1' } }, groups: [], tourGuide: {} }
      const startUpSpy = jest.spyOn(service as any, 'fetchStartUpDetails')
      jest.spyOn(service as any, 'fetchDefaultConfig').mockImplementation(async () => {
        configServiceMock.instanceConfig = defaultConfig
        return defaultConfig
      })
      jest.spyOn(service as any, 'fetchAppsConfig').mockResolvedValue(appsConfig)
      jest.spyOn(service as any, 'fetchInstanceConfig').mockImplementation(async () => {
        configServiceMock.instanceConfig = instanceConfig
        return instanceConfig
      })
      jest.spyOn(service as any, 'fetchWidgetStatus').mockResolvedValue([])
      jest.spyOn(service as any, 'fetchFeaturesStatus').mockResolvedValue(new Set())
      jest.spyOn(service as any, 'processWidgetStatus').mockReturnValue(new Set())
      jest.spyOn(service as any, 'processAppsConfig').mockReturnValue(appsConfig)

      const result = await service.init()

      expect(result).toBe(true)
      expect(startUpSpy).not.toHaveBeenCalled()
      expect(configServiceMock.appsConfig).toBe(appsConfig)
      expect(configServiceMock.instanceConfig!.featuredApps).toEqual(['f1'])
      expect(TestBed.inject(SbUiResolverService).initialize).toHaveBeenCalled()
      expect(TestBed.inject(BtnSettingsService).initializePrefChanges).toHaveBeenCalledWith(environment.production)
      expect(TestBed.inject(UserPreferenceService).initialize).toHaveBeenCalled()
    })

    it('should return false when fetching start up details fails on protected paths', async () => {
      window.history.pushState({}, '', '/app/home')
      jest.spyOn(service as any, 'fetchDefaultConfig').mockResolvedValue({})
      jest.spyOn(service as any, 'fetchStartUpDetails').mockRejectedValue(new Error('Invalid user'))

      const result = await service.init()

      expect(result).toBe(false)
      expect(TestBed.inject(LoggerService).info).toHaveBeenCalledWith('Not Authenticated')
      expect(TestBed.inject(BtnSettingsService).initializePrefChanges).toHaveBeenCalled()
    })
  })
})
