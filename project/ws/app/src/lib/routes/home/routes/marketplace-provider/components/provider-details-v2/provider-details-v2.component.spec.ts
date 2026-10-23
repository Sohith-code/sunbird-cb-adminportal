import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { DatePipe } from '@angular/common'
import { FormBuilder } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { BehaviorSubject, of } from 'rxjs'

import { ProviderDetailsV2Component } from './provider-details-v2.component'
import { MarketplaceService } from '../../services/marketplace.service'
import { GlobalEventsService } from '../../../../../../../../../../../src/app/services/global-events.service'
import { NavigationExternalService } from '../../../../../../../../../../../src/app/services/navigation-external.service'

describe('ProviderDetailsV2Component', () => {
  let component: ProviderDetailsV2Component
  let fixture: ComponentFixture<ProviderDetailsV2Component>
  let status: string

  function setup() {
    TestBed.configureTestingModule({
      declarations: [ProviderDetailsV2Component],
      providers: [
        FormBuilder,
        DatePipe,
        { provide: MatSnackBar, useValue: { open: jest.fn(), openFromComponent: jest.fn() } },
        {
          provide: MarketplaceService,
          useValue: {
            changeStatusRegisterProvider: jest.fn().mockReturnValue(of({})),
            convertResourceUrl: jest.fn((url: string) => url),
            createProvider: jest.fn().mockReturnValue(of({})),
            newProviderAdded: new BehaviorSubject<any>(null),
            updateProvider: jest.fn().mockReturnValue(of({})),
            uploadCIOSContract: jest.fn().mockReturnValue(of({})),
            uploadThumbNail: jest.fn().mockReturnValue(of({})),
          },
        },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: GlobalEventsService, useValue: { setLoaderState: jest.fn() } },
        { provide: NavigationExternalService, useValue: { breadcrumnItems: new BehaviorSubject<any>([]) } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: { status } } } },
        { provide: MatDialog, useValue: { open: jest.fn().mockReturnValue({ afterClosed: () => of(false) }) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    fixture = TestBed.createComponent(ProviderDetailsV2Component)
    component = fixture.componentInstance
    fixture.detectChanges()
  }

  it('should create', () => {
    status = 'ACTIVE'
    setup()
    expect(component).toBeTruthy()
    expect(component.isPendingProvider).toBe(false)
    expect(component.providerDetailsForm).toBeTruthy()
  })

  it('should mark provider as pending when status query param is PENDING', () => {
    status = 'PENDING'
    setup()
    expect(component.isPendingProvider).toBe(true)
  })
})
