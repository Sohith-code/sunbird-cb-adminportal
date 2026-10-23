import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ActivatedRoute, Router } from '@angular/router'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { of, throwError } from 'rxjs'

import { RequestCopyDetailsV2Component } from './request-copy-details-v2.component'
import { RequestServiceService } from '../request-service.service'

describe('RequestCopyDetailsV2Component', () => {
  let component: RequestCopyDetailsV2Component
  let fixture: ComponentFixture<RequestCopyDetailsV2Component>
  let mockDialogRef: any
  let mockDialog: any
  let mockSnackBar: any
  let mockRouter: any
  let mockRequestService: any

  beforeEach(() => {
    mockDialogRef = { close: jest.fn(), afterClosed: jest.fn().mockReturnValue(of(undefined)) }
    mockDialog = { open: jest.fn().mockReturnValue(mockDialogRef) }
    mockSnackBar = { open: jest.fn() }
    mockRouter = { navigateByUrl: jest.fn() }
    mockRequestService = { createDemand: jest.fn() }

    TestBed.configureTestingModule({
      declarations: [RequestCopyDetailsV2Component],
      providers: [
        { provide: ActivatedRoute, useValue: { queryParams: of({ id: 'd1', name: 'copy' }) } },
        { provide: MatSnackBar, useValue: mockSnackBar },
        { provide: Router, useValue: mockRouter },
        { provide: MatDialog, useValue: mockDialog },
        { provide: RequestServiceService, useValue: mockRequestService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    fixture = TestBed.createComponent(RequestCopyDetailsV2Component)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should create and read query params', () => {
    expect(component).toBeTruthy()
    expect(component.demandId).toBe('d1')
    expect(component.actionBtnName).toBe('copy')
  })

  it('should submit request and navigate on success', () => {
    jest.useFakeTimers()
    mockRequestService.createDemand.mockReturnValue(of({ id: 'x' }))
    component.submit({ title: 'T' })
    expect(mockRequestService.createDemand).toHaveBeenCalledWith({ title: 'T' })
    expect(mockDialog.open).toHaveBeenCalledTimes(2)
    jest.advanceTimersByTime(1000)
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/home/all-request')
    expect(mockSnackBar.open).toHaveBeenCalledWith('Request submitted successfully ')
  })

  it('should show failure snackbar on error', () => {
    mockRequestService.createDemand.mockReturnValue(throwError({ status: 500 }))
    component.submit({})
    expect(mockDialogRef.close).toHaveBeenCalledWith({ error: { status: 500 } })
    expect(mockSnackBar.open).toHaveBeenCalledWith('Request Failed')
  })

  it('should open progress dialog with correct data', () => {
    component.showDialogBox('progress-completed')
    expect(mockDialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      data: expect.objectContaining({ type: 'progress-completed', primaryAction: 'Successfully created....' }),
    }))
  })

  it('should navigate back', () => {
    component.navigateBack()
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/home/all-request')
  })
})
