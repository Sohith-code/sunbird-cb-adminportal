import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute } from '@angular/router'
import { BehaviorSubject, of } from 'rxjs'

import { ConfigureProviderComponent } from './configure-provider.component'
import { MarketplaceService } from '../../services/marketplace.service'
import { NavigationExternalService } from '../../../../../../../../../../../src/app/services/navigation-external.service'
import { MARKETPLACE_CONFIGURE_PROVIDERS_MENU } from '../../models/menu.model'

describe('ConfigureProviderComponent', () => {
  let component: ConfigureProviderComponent
  let fixture: ComponentFixture<ConfigureProviderComponent>
  let marketPlaceSvc: any

  beforeEach(() => {
    marketPlaceSvc = {
      currentMenuItem: new BehaviorSubject<any>(0),
      getProviderDetails: jest.fn().mockReturnValue(of({ result: { id: '1' } })),
    }
    TestBed.configureTestingModule({
      declarations: [ConfigureProviderComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { data: of({ providerDetails: { data: { result: { id: '1' } } } }), queryParams: of({}) } },
        { provide: MatSnackBar, useValue: { open: jest.fn(), openFromComponent: jest.fn() } },
        { provide: MarketplaceService, useValue: marketPlaceSvc },
        { provide: NavigationExternalService, useValue: { breadcrumnItems: new BehaviorSubject<any>([]) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    fixture = TestBed.createComponent(ConfigureProviderComponent)
    component = fixture.componentInstance
    // ngAfterViewInit updates activeMenuItem, so skip the dev-mode checkNoChanges pass
    fixture.detectChanges(false)
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set the first menu item as active after view init', () => {
    expect(component.activeMenuItem).toBe(MARKETPLACE_CONFIGURE_PROVIDERS_MENU[0].slug)
  })

  it('should update active menu on activeMenuItemEvent', () => {
    component.activeMenuItemEvent({ activeMenuItem: { slug: 'abc' } })
    expect(component.activeMenuItem).toBe('abc')
    expect(component.currentMenuDetails).toEqual({ slug: 'abc' })
  })
})
