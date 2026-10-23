import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { FormBuilder, ReactiveFormsModule } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { of } from 'rxjs'

import { CertificateConfigurationComponent } from './certificate-configuration.component'
import { MarketplaceService } from '../../services/marketplace.service'

describe('CertificateConfigurationComponent', () => {
  let component: CertificateConfigurationComponent
  let fixture: ComponentFixture<CertificateConfigurationComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CertificateConfigurationComponent],
      imports: [ReactiveFormsModule],
      providers: [
        FormBuilder,
        {
          provide: MarketplaceService,
          useValue: {
            updateProvider: jest.fn().mockReturnValue(of({})),
            uploadThumbNail: jest.fn().mockReturnValue(of({})),
          },
        },
        { provide: MatSnackBar, useValue: { open: jest.fn(), openFromComponent: jest.fn() } },
        { provide: MatDialog, useValue: { open: jest.fn().mockReturnValue({ afterClosed: () => of(false), close: jest.fn() }) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    fixture = TestBed.createComponent(CertificateConfigurationComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })
})
