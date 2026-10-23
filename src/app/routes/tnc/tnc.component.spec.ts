import { of, throwError } from 'rxjs'
import { TncComponent } from './tnc.component'

describe('TncComponent', () => {
  let component: TncComponent
  let activatedRoute: any
  let router: any
  let http: any
  let loggerSvc: any
  let configSvc: any
  let tncProtectedSvc: any
  let tncPublicSvc: any
  let matDialog: any

  const tncData: any = {
    isNewUser: false,
    termsAndConditions: [
      { name: 'Generic T&C', language: 'en', version: '1', content: 'tnc' },
      { name: 'Data Privacy', language: 'en', version: '2', content: 'dp' },
    ],
  }

  beforeEach(() => {
    activatedRoute = { data: of({ tnc: { data: tncData }, isPublic: false }) }
    router = { navigate: jest.fn(), navigateByUrl: jest.fn() }
    http = { post: jest.fn().mockReturnValue(of({})), patch: jest.fn().mockReturnValue(of({})) }
    loggerSvc = { error: jest.fn() }
    configSvc = { isNewUser: false, hasAcceptedTnc: false, appSetup: false, userUrl: '' }
    tncProtectedSvc = { getTnc: jest.fn() }
    tncPublicSvc = { getPublicTnc: jest.fn() }
    matDialog = { open: jest.fn() }
    component = new TncComponent(
      activatedRoute, router, http, loggerSvc, configSvc, tncProtectedSvc, tncPublicSvc, matDialog,
    )
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('ngOnInit should set tncData from route data', () => {
    component.ngOnInit()
    expect(component.tncData).toBe(tncData)
    expect(configSvc.isNewUser).toBe(false)
    expect(component.isPublic).toBe(false)
  })

  it('ngOnInit should navigate to error page when tnc data missing', () => {
    activatedRoute.data = of({ tnc: { data: null } })
    component.ngOnInit()
    expect(router.navigate).toHaveBeenCalledWith(['error-service-unavailable'])
  })

  it('ngOnDestroy should unsubscribe route subscription', () => {
    component.ngOnInit()
    const spy = jest.spyOn(component.routeSubscription as any, 'unsubscribe')
    component.ngOnDestroy()
    expect(spy).toHaveBeenCalled()
  })

  it('getTnc should not fetch when locale matches current language', () => {
    component.tncData = JSON.parse(JSON.stringify(tncData))
    component.getTnc('en')
    expect(tncProtectedSvc.getTnc).not.toHaveBeenCalled()
  })

  it('getTnc should fetch protected tnc and keep existing data privacy', () => {
    component.tncData = JSON.parse(JSON.stringify(tncData))
    const newData = {
      termsAndConditions: [
        { name: 'Generic T&C', language: 'hi', version: '1', content: 'hi-tnc' },
        { name: 'Data Privacy', language: 'hi', version: '2', content: 'hi-dp' },
      ],
    }
    tncProtectedSvc.getTnc.mockReturnValue(of(newData))
    component.getTnc('hi')
    expect(tncProtectedSvc.getTnc).toHaveBeenCalledWith('hi')
    expect(component.tncData!.termsAndConditions[0].content).toBe('hi-tnc')
    expect(component.tncData!.termsAndConditions[1].content).toBe('dp')
  })

  it('getDp should fetch public tnc when isPublic and keep existing generic tnc', () => {
    component.tncData = JSON.parse(JSON.stringify(tncData))
    component.isPublic = true
    const newData = {
      termsAndConditions: [
        { name: 'Generic T&C', language: 'hi', version: '1', content: 'hi-tnc' },
        { name: 'Data Privacy', language: 'hi', version: '2', content: 'hi-dp' },
      ],
    }
    tncPublicSvc.getPublicTnc.mockReturnValue(of(newData))
    component.getDp('hi')
    expect(tncPublicSvc.getPublicTnc).toHaveBeenCalledWith('hi')
    expect(component.tncData!.termsAndConditions[0].content).toBe('tnc')
    expect(component.tncData!.termsAndConditions[1].content).toBe('hi-dp')
  })

  it('acceptTnc should post accepted terms and navigate home', () => {
    component.tncData = JSON.parse(JSON.stringify(tncData))
    component.acceptTnc(null)
    expect(http.post).toHaveBeenCalledWith('/apis/protected/v8/user/tnc/accept', {
      termsAccepted: [
        { acceptedLanguage: 'en', docName: 'Generic T&C', version: '1' },
        { acceptedLanguage: 'en', docName: 'Data Privacy', version: '2' },
      ],
    })
    expect(configSvc.hasAcceptedTnc).toBe(true)
    expect(http.patch).toHaveBeenCalledWith('/apis/protected/v8/user/tnc/postprocessing', {})
    expect(router.navigate).toHaveBeenCalledWith(['page', 'home'])
  })

  it('acceptTnc should open dialog and navigate to userUrl when confirmed', () => {
    component.tncData = JSON.parse(JSON.stringify(tncData))
    configSvc.userUrl = '/app/some'
    matDialog.open.mockReturnValue({ afterClosed: () => of(true) })
    component.acceptTnc('tpl')
    expect(matDialog.open).toHaveBeenCalled()
    expect(router.navigateByUrl).toHaveBeenCalledWith('/app/some')
  })

  it('acceptTnc should set error flags on failure', () => {
    component.tncData = JSON.parse(JSON.stringify(tncData))
    http.post.mockReturnValue(throwError({ status: 500 }))
    component.acceptTnc(null)
    expect(loggerSvc.error).toHaveBeenCalled()
    expect(component.errorInAccepting).toBe(true)
    expect(component.isAcceptInProgress).toBe(false)
  })
})
