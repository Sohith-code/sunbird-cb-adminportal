import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { BehaviorSubject, of } from 'rxjs'

import { ConfigureProviderMenuComponent } from './configure-provider-menu.component'
import { MarketplaceService } from '../../services/marketplace.service'

describe('ConfigureProviderMenuComponent', () => {
  let component: ConfigureProviderMenuComponent
  let fixture: ComponentFixture<ConfigureProviderMenuComponent>
  let marketplaceService: any

  beforeEach(() => {
    marketplaceService = {
      currentMenuItem: new BehaviorSubject<any>(0),
      newProviderAdded: new BehaviorSubject<any>(null),
    }
    TestBed.configureTestingModule({
      declarations: [ConfigureProviderMenuComponent],
      providers: [
        { provide: MarketplaceService, useValue: marketplaceService },
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    fixture = TestBed.createComponent(ConfigureProviderMenuComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should track current menu item from service', () => {
    marketplaceService.currentMenuItem.next({ slug: 'x' })
    expect(component.activeItem).toEqual({ slug: 'x' })
  })

  it('should emit active menu on setActiveItem', () => {
    const spy = jest.spyOn(component.activeMenu, 'emit')
    component.setActiveItem({ slug: 'y' })
    expect(spy).toHaveBeenCalledWith({ activeMenuItem: { slug: 'y' } })
  })
})
