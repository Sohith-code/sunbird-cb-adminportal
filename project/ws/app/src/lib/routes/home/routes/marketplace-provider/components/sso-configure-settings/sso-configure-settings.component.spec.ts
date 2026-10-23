import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { Clipboard } from '@angular/cdk/clipboard'
import { FormBuilder } from '@angular/forms'
import { MatAutocompleteModule } from '@angular/material/autocomplete'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { of } from 'rxjs'

import { SsoConfigureSettingsComponent } from './sso-configure-settings.component'
import { MarketplaceService } from '../../services/marketplace.service'
import { GlobalEventsService } from '../../../../../../../../../../../src/app/services/global-events.service'

describe('SsoConfigureSettingsComponent', () => {
  let component: SsoConfigureSettingsComponent
  let fixture: ComponentFixture<SsoConfigureSettingsComponent>
  const attributes = ['email', 'name']

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SsoConfigureSettingsComponent],
      imports: [MatAutocompleteModule, NoopAnimationsModule],
      providers: [
        FormBuilder,
        { provide: Clipboard, useValue: { copy: jest.fn() } },
        {
          provide: MarketplaceService,
          useValue: {
            createSSOConfiguration: jest.fn().mockReturnValue(of({})),
            getSSOConfiguration: jest.fn().mockReturnValue(of({ result: {} })),
            updateSSOConfiguration: jest.fn().mockReturnValue(of({})),
          },
        },
        { provide: MatSnackBar, useValue: { open: jest.fn(), openFromComponent: jest.fn() } },
        { provide: GlobalEventsService, useValue: { setLoaderState: jest.fn() } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: ActivatedRoute, useValue: { data: of({ pageData: { data: { SSO_attributs: attributes } } }) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    fixture = TestBed.createComponent(SsoConfigureSettingsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize the form and attribute options', () => {
    expect(component.attributesOptionsList).toEqual(attributes)
    expect(component.ssoSettingsForm.get('ssoProtocol')?.value).toBe('saml')
  })
})
