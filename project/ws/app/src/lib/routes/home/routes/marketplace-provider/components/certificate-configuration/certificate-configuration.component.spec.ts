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

  describe('onDropCertificate', () => {
    const originalCreateObjectURL = URL.createObjectURL

    beforeEach(() => {
      URL.createObjectURL = jest.fn().mockReturnValue('blob:http://localhost/certificate-id')
    })

    afterEach(() => {
      URL.createObjectURL = originalCreateObjectURL
    })

    it('should use the plain blob url for the preview of an svg file', () => {
      const file = new File(['<svg></svg>'], 'certificate.svg', { type: 'image/svg+xml' })
      component.onDropCertificate(file)
      expect(component.certificateUploaded).toBe(true)
      expect(component.certificateUrl).toBe('blob:http://localhost/certificate-id')
      expect(component.safeCertificateUrl).toBe('blob:http://localhost/certificate-id')
    })

    it('should reject a non-svg file without setting a preview', () => {
      const file = new File(['data'], 'certificate.png', { type: 'image/png' })
      component.onDropCertificate(file)
      expect(component.safeCertificateUrl).toBeNull()
      expect(URL.createObjectURL).not.toHaveBeenCalled()
    })
  })
})
