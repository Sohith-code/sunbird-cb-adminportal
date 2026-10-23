import { ChangeDetectorRef } from '@angular/core'
import { NavigationEnd, NavigationStart, Router } from '@angular/router'
import { BtnPageBackService } from '@sunbird-cb/collection'
import { ConfigurationsService, ValueService } from '@sunbird-cb/utils-v2'
import { of, Subject } from 'rxjs'
import { MobileAppsService } from '../../services/mobile-apps.service'
import { GlobalEventsService } from '../../services/global-events.service'
import { RootService } from './root.service'
import { RootComponent } from './root.component'

describe('RootComponent', () => {
  let component: RootComponent
  let routerEvents: Subject<any>
  let loaderState: Subject<boolean>
  let router: any
  let mobileAppsSvc: any
  let btnBackSvc: any
  let changeDetector: any
  let rootSvc: any

  beforeEach(() => {
    routerEvents = new Subject<any>()
    loaderState = new Subject<boolean>()
    router = { events: routerEvents }
    mobileAppsSvc = { init: jest.fn() }
    btnBackSvc = { initialize: jest.fn() }
    changeDetector = { detectChanges: jest.fn(), detach: jest.fn() }
    rootSvc = { showNavbarDisplay$: of(true) }
    const valueSvc = { isXSmall$: of(false) }
    const loader = { loaderState$: loaderState }

    component = new RootComponent(
      router as Router,
      {} as ConfigurationsService,
      valueSvc as unknown as ValueService,
      mobileAppsSvc as MobileAppsService,
      rootSvc as RootService,
      btnBackSvc as BtnPageBackService,
      changeDetector as ChangeDetectorRef,
      loader as unknown as GlobalEventsService,
    )
  })

  it('should create a instance of component and init mobile apps service', () => {
    expect(component).toBeTruthy()
    expect(mobileAppsSvc.init).toHaveBeenCalled()
  })

  it('ngOnInit should initialize back service and react to router events', () => {
    component.ngOnInit()
    expect(btnBackSvc.initialize).toHaveBeenCalled()

    routerEvents.next(new NavigationStart(1, '/app/home'))
    expect(component.isNavBarRequired).toBe(true)
    expect(component.routeChangeInProgress).toBe(true)

    routerEvents.next(new NavigationStart(2, '/preview/x'))
    expect(component.isNavBarRequired).toBe(false)

    routerEvents.next(new NavigationEnd(3, '/app/setup/step', '/app/setup/step'))
    expect(component.routeChangeInProgress).toBe(false)
    expect(component.currentUrl).toBe('/app/setup/step')
    expect(component.isSetupPage).toBe(true)
    expect(component.appStartRaised).toBe(false)
  })

  it('should update isLoading on loader state changes', () => {
    component.ngOnInit()
    loaderState.next(true)
    expect(component.isLoading).toBe(true)
    expect(changeDetector.detectChanges).toHaveBeenCalled()
  })

  it('ngOnDestroy should unsubscribe loader and detach change detector', () => {
    component.ngOnInit()
    const spy = jest.spyOn(component.loaderSubscription, 'unsubscribe')
    component.ngOnDestroy()
    expect(spy).toHaveBeenCalled()
    expect(changeDetector.detach).toHaveBeenCalled()
  })
})
