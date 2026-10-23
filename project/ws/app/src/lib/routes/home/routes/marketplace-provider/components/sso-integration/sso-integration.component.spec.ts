import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Component, EventEmitter, Input, NO_ERRORS_SCHEMA, Output } from '@angular/core'
import { FormControl, FormGroup } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { of } from 'rxjs'

import { SsoIntegrationComponent } from './sso-integration.component'
import { MarketplaceService } from '../../services/marketplace.service'

@Component({
  selector: 'ws-app-sso-configure-settings',
  template: '',
  standalone: false,
})
class MockSsoConfigureSettingsComponent {
  @Input() providerDetails: any
  @Output() loadSSODetails = new EventEmitter<any>()
  ssoSettingsForm = new FormGroup({})
  acsUrl = new FormControl('')
  ssoTestUrl = new FormControl('')
  status = new FormControl('')
  isSaveDisabled = false
  SSOConfigurationData: any = null
  updateSSOConfigurations = jest.fn()
  createSSOConfigurations = jest.fn()
}

describe('SsoIntegrationComponent', () => {
  let component: SsoIntegrationComponent
  let fixture: ComponentFixture<SsoIntegrationComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SsoIntegrationComponent, MockSsoConfigureSettingsComponent],
      providers: [
        { provide: MatDialog, useValue: { open: jest.fn().mockReturnValue({ afterClosed: () => of(false), close: jest.fn() }) } },
        {
          provide: MarketplaceService,
          useValue: {
            testSSOConfiguration: jest.fn().mockReturnValue(of({})),
            updateProvider: jest.fn().mockReturnValue(of({})),
            updateSSOConfiguration: jest.fn().mockReturnValue(of({})),
          },
        },
        { provide: MatSnackBar, useValue: { open: jest.fn(), openFromComponent: jest.fn() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    fixture = TestBed.createComponent(SsoIntegrationComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should not allow save when the settings form is untouched', () => {
    expect(component.canSave).toBe(false)
  })

  it('should call update on existing SSO configuration', () => {
    const settings: any = { SSOConfigurationData: {}, updateSSOConfigurations: jest.fn(), createSSOConfigurations: jest.fn() }
    component.ssoConfigurationSettings = settings
    component.updateCreateSSO()
    expect(settings.updateSSOConfigurations).toHaveBeenCalled()
  })

  it('should call create when no SSO configuration exists', () => {
    const settings: any = { SSOConfigurationData: null, updateSSOConfigurations: jest.fn(), createSSOConfigurations: jest.fn() }
    component.ssoConfigurationSettings = settings
    component.updateCreateSSO()
    expect(settings.createSSOConfigurations).toHaveBeenCalled()
  })
})
