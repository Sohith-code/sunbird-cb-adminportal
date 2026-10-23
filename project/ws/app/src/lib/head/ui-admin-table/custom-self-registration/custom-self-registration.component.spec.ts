import '@angular/localize/init'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { FormBuilder } from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatDialog } from '@angular/material/dialog'
import { Clipboard } from '@angular/cdk/clipboard'
import { EventService } from '@sunbird-cb/utils-v2'
import { of, throwError } from 'rxjs'

import { CustomSelfRegistrationComponent } from './custom-self-registration.component'
import { CreateMDOService } from '../create-mdo.services'

describe('CustomSelfRegistrationComponent', () => {
  let component: CustomSelfRegistrationComponent
  let fixture: ComponentFixture<CustomSelfRegistrationComponent>
  let createMdoService: any
  let snackbar: any
  let clipboard: any
  let dialog: any
  let eventsService: any
  const dialogRef = { close: jest.fn() }

  const registeredLink = {
    startDate: 1700000000000,
    endDate: 1800000000000,
    url: 'https://portal/link',
    qrCodeImagePath: 'https://portal/qr.png',
    qrLogoPath: 'https://portal/logo.png',
    numberOfUsersOnboarded: 5,
  }

  beforeEach(waitForAsync(() => {
    createMdoService = {
      getListOfRegisteedLinks: jest.fn().mockReturnValue(of({ result: { qrCodeDataForOrg: [registeredLink] } })),
      generateSelfRegistrationQRCode: jest.fn(),
    }
    snackbar = { open: jest.fn() }
    clipboard = { copy: jest.fn() }
    dialog = { open: jest.fn().mockReturnValue(dialogRef) }
    eventsService = { raiseInteractTelemetry: jest.fn() }
    dialogRef.close.mockClear()

    TestBed.configureTestingModule({
      declarations: [CustomSelfRegistrationComponent],
      providers: [
        FormBuilder,
        { provide: CreateMDOService, useValue: createMdoService },
        { provide: MatSnackBar, useValue: snackbar },
        { provide: Clipboard, useValue: clipboard },
        { provide: MatDialog, useValue: dialog },
        { provide: EventService, useValue: eventsService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomSelfRegistrationComponent)
    component = fixture.componentInstance
    component.initialData = { orgId: 'org-1', orgName: 'Org', openMode: 'edit' }
    fixture.detectChanges()
  })

  afterEach(() => {
    fixture.destroy()
  })

  it('should create and load registered links', () => {
    expect(component).toBeTruthy()
    expect(createMdoService.getListOfRegisteedLinks).toHaveBeenCalledWith({ orgId: 'org-1' })
    expect(component.numberOfUsersOnboarded).toBe(5)
    expect(component.initialData.QRGenerated).toBe(true)
    expect(component.customRegistrationLinks).toEqual({
      registrationLink: 'https://portal/link',
      qrRegistrationLink: 'https://spv/qr.png',
      qrRegistrationLogoPath: 'https://spv/logo.png',
    })
  })

  it('should mark QR not generated when no links exist', () => {
    createMdoService.getListOfRegisteedLinks.mockReturnValue(of({ result: {} }))
    component.getlistOfRegisterationLinks()
    expect(component.customRegistrationLinks).toBeUndefined()
    expect(component.initialData.QRGenerated).toBe(false)
  })

  it('should check registration status', () => {
    expect(component.checkRegistrationStatus(null)).toBe(true)
    expect(component.checkRegistrationStatus('2000-01-01')).toBe(false)
    expect(component.checkRegistrationStatus('2999-01-01')).toBe(true)
  })

  it('should emit close event', () => {
    const spy = jest.spyOn(component.buttonClick, 'emit')
    component.closeNaveBar()
    expect(spy).toHaveBeenCalledWith({ action: 'close' })
  })

  it('should generate QR code link successfully', () => {
    createMdoService.generateSelfRegistrationQRCode.mockReturnValue(of({
      responseCode: 'OK',
      result: {
        registrationLink: 'link',
        qrRegistrationLink: 'portal/qr',
        qrCodeLogoPath: 'portal/logo',
      },
    }))
    const emitSpy = jest.spyOn(component.linkGenerated, 'emit')
    component.generateQRCodeLink()
    expect(createMdoService.generateSelfRegistrationQRCode).toHaveBeenCalledWith(expect.objectContaining({ orgId: 'org-1' }))
    expect(component.customRegistrationLinks.qrRegistrationLink).toBe('spv/qr')
    expect(emitSpy).toHaveBeenCalledWith(true)
    expect(dialogRef.close).toHaveBeenCalled()
  })

  it('should show error when QR code generation returns an error message', () => {
    createMdoService.generateSelfRegistrationQRCode.mockReturnValue(of({ params: { errmsg: 'failed' } }))
    component.generateQRCodeLink()
    expect(snackbar.open).toHaveBeenCalledWith('failed', '', { duration: 3000 })
    expect(component.isLoading).toBe(false)
  })

  it('should handle QR code generation error', () => {
    createMdoService.generateSelfRegistrationQRCode.mockReturnValue(throwError(() => ({})))
    component.generateQRCodeLink()
    expect(component.isLoading).toBe(false)
    expect(dialogRef.close).toHaveBeenCalled()
  })

  it('should resolve QR code path from available fields', () => {
    expect(component.getQRCodePath({ qrCodeLogoPath: 'portal/a' })).toBe('spv/a')
    expect(component.getQRCodePath({ qrCodeImagePath: 'portal/b' })).toBe('spv/b')
    expect(component.getQRCodePath({ qrRegistrationLink: 'portal/c' })).toBe('spv/c')
    expect(component.getQRCodePath({})).toBeUndefined()
  })

  it('should copy link to clipboard', () => {
    component.copyLinkToClipboard('link')
    expect(clipboard.copy).toHaveBeenCalledWith('link')
    expect(snackbar.open).toHaveBeenCalledWith('Copied!')
  })

  it('should share via email and whatsapp', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
    component.sendViaEmail('link')
    expect(openSpy).toHaveBeenCalledWith(expect.stringContaining('mailto:'), '_self')
    component.sendViaWhatsApp('link')
    expect(openSpy).toHaveBeenCalledWith(expect.stringContaining('https://api.whatsapp.com/send'), '_blank')
    expect(eventsService.raiseInteractTelemetry).toHaveBeenCalledTimes(2)
    openSpy.mockRestore()
  })
})
