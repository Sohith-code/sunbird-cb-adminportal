import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { FormBuilder } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute } from '@angular/router'
import { of } from 'rxjs'

import { ProvidersApiIntegrationsComponent } from './providers-api-integrations.component'
import { MarketplaceService } from '../../services/marketplace.service'

describe('ProvidersApiIntegrationsComponent', () => {
  let component: ProvidersApiIntegrationsComponent
  let fixture: ComponentFixture<ProvidersApiIntegrationsComponent>
  const pageData = { data: { some: 'config' } }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProvidersApiIntegrationsComponent],
      providers: [
        FormBuilder,
        { provide: MatSnackBar, useValue: { open: jest.fn(), openFromComponent: jest.fn() } },
        { provide: ActivatedRoute, useValue: { data: of({ pageData }) } },
        {
          provide: MarketplaceService,
          useValue: {
            createConfiguration: jest.fn().mockReturnValue(of({})),
            getConfiguraionDetails: jest.fn().mockReturnValue(of({ result: {} })),
            updateConfiguration: jest.fn().mockReturnValue(of({})),
            updateProvider: jest.fn().mockReturnValue(of({})),
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    fixture = TestBed.createComponent(ProvidersApiIntegrationsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should read provider configuration from route data', () => {
    expect(component.providerConfiguration).toEqual(pageData.data)
  })
})
