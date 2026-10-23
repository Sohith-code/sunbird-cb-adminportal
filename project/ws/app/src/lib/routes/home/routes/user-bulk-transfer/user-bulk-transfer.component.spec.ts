import { EventEmitter } from '@angular/core'
import { of, throwError } from 'rxjs'

import { UserBulkTransferComponent } from './user-bulk-transfer.component'

describe('UserBulkTransferComponent', () => {
  let component: UserBulkTransferComponent
  let fileService: any
  let snackBar: any
  let route: any
  let dialog: any
  let usersService: any
  let orgHieService: any
  let otpInstance: any

  const personalDetails = { primaryEmail: 'admin@x.com', mobile: '9999999999' }

  beforeEach(() => {
    fileService = {
      statusOfBulkUserTransfer: jest.fn().mockReturnValue(of({
        result: {
          content: [
            { fileName: 'a.xlsx', dateCreatedOn: '2024-01-01' },
            { fileName: 'b.xlsx', dateCreatedOn: '2024-02-01' },
          ],
        },
      })),
      downloadSampleBulkUserTransferFile: jest.fn(),
      validateFile: jest.fn().mockReturnValue(true),
      uploadBulkUserTransfer: jest.fn().mockReturnValue(of({})),
    }
    snackBar = { open: jest.fn() }
    route = {
      snapshot: {
        data: { configService: { unMappedUser: { profileDetails: { personalDetails } } } },
        parent: {
          data: {
            configService: {
              unMappedUser: { rootOrg: { rootOrgId: 'root-1' }, profileDetails: { personalDetails } },
            },
          },
        },
      },
    }
    otpInstance = { resendOTP: new EventEmitter<any>(), otpVerified: new EventEmitter<boolean>() }
    dialog = {
      open: jest.fn().mockReturnValue({ componentInstance: otpInstance, close: jest.fn() }),
    }
    usersService = { sendOtp: jest.fn().mockReturnValue(of({})) }
    orgHieService = {
      getOrgData: jest.fn().mockReturnValue({ rootOrgId: 'child-org' }),
      getParentOrgData: jest.fn().mockReturnValue({ orgHierarchyFrameworkStatus: 'Completed', orgHierarchyFrameworkId: 'fw-1' }),
    }

    component = new UserBulkTransferComponent(fileService, snackBar, route, dialog, usersService, orgHieService)
  })

  afterEach(() => {
    component.ngOnDestroy()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should initialise from route when no org selected and load sorted status list', () => {
    component.ngOnInit()
    expect(component.rootOrgId).toBe('root-1')
    expect(component.userProfile).toEqual(personalDetails)
    expect(fileService.statusOfBulkUserTransfer).toHaveBeenCalledWith(undefined)
    expect(component.lastUploadList[0].fileName).toBe('b.xlsx')
  })

  it('should initialise org data when selectedOrgData is provided', () => {
    component.selectedOrgData = { roleId: 'role-org' }
    component.ngOnInit()
    expect(component.rootOrgId).toBe('role-org')
    expect(component.completeOrgData).toEqual({ rootOrgId: 'child-org' })
    expect(fileService.statusOfBulkUserTransfer).toHaveBeenCalledWith('child-org')
  })

  it('should show error when status list fails', () => {
    fileService.statusOfBulkUserTransfer.mockReturnValue(throwError({ ok: false }))
    component.ngOnInit()
    expect(snackBar.open).toHaveBeenCalledWith('Unable to get Bulk status list')
  })

  it('should set last index after view init and on page changes', () => {
    component.ngAfterViewInit()
    expect(component.lastIndex).toBe(10)
    component.onChangePage({ pageIndex: 1, pageSize: 10, length: 30 })
    expect(component.startIndex).toBe(10)
    expect(component.lastIndex).toBe(20)
    component.handleChangePage({ pageIndex: 2, pageSize: 20, length: 100 })
    expect(component.pageSize).toBe(20)
    expect(component.startIndex).toBe(40)
    expect(component.lastIndex).toBe(60)
  })

  it('should download sample file only when parent framework is completed', () => {
    component.selectedOrgData = { roleId: 'role-org' }
    component.ngOnInit()
    component.handleDownloadSampleFile()
    expect(fileService.downloadSampleBulkUserTransferFile).toHaveBeenCalledWith('orgUserBulkTransferSample.xlsx', 'fw-1')

    component.parentOrgData = { orgHierarchyFrameworkStatus: 'Draft' }
    component.handleDownloadSampleFile()
    expect(snackBar.open).toHaveBeenCalledWith('Please complete the framework setup of parent organisation to download the sample file')
  })

  it('should open result file in new window', () => {
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null)
    component.handleDownloadFile({ fileName: 'r.xlsx' })
    expect(openSpy).toHaveBeenCalledWith('/apis/proxies/v8/user/v1/org-migration/bulk-upload/result/r.xlsx', '_blank')
    openSpy.mockRestore()
  })

  it('should reset file input value on click', () => {
    const event = { target: { value: 'something' } }
    component.handleFileClick(event)
    expect(event.target.value).toBe('')
  })

  it('should send OTP and open verify dialog', () => {
    component.ngOnInit()
    component.sendOTP()
    expect(usersService.sendOtp).toHaveBeenCalledWith('admin@x.com', 'email')
    expect(snackBar.open).toHaveBeenCalledWith("An OTP has been sent to your Email address, (Valid for 15 min's)")
    expect(dialog.open).toHaveBeenCalled()
  })

  it('should show error when OTP sending fails', () => {
    component.ngOnInit()
    usersService.sendOtp.mockReturnValue(throwError({ ok: false, error: { params: { errmsg: 'OTP failed' } } }))
    component.generateAndVerifyOTP('phone')
    expect(snackBar.open).toHaveBeenCalledWith('OTP failed')
  })

  it('should validate selected file and upload after OTP verification', () => {
    component.ngOnInit()
    const file = new File(['x'], 'users.xlsx')
    component.handleOnFileChange({ target: { files: [file] } })
    expect(component.fileName).toBe('users.xlsx')
    expect(dialog.open).toHaveBeenCalled()

    otpInstance.otpVerified.emit(true)

    expect(fileService.uploadBulkUserTransfer).toHaveBeenCalled()
    expect(snackBar.open).toHaveBeenCalledWith('File uploaded successfully!')
    expect(component.fileName).toBe('')
  })

  it('should resend OTP when requested from dialog', () => {
    component.ngOnInit()
    component.verifyOTP('email')
    otpInstance.resendOTP.emit('phone')
    expect(usersService.sendOtp).toHaveBeenCalledWith('9999999999', 'phone')
  })

  it('should flag invalid file types', () => {
    component.ngOnInit()
    fileService.validateFile.mockReturnValue(false)
    component.handleOnFileChange({ target: { files: [new File(['x'], 'users.pdf')] } })
    expect(component.showFileError).toBe(true)
    expect(dialog.open).not.toHaveBeenCalled()
  })

  it('should show error when upload fails', () => {
    component.ngOnInit()
    fileService.uploadBulkUserTransfer.mockReturnValue(throwError({ ok: false }))
    component.fileName = 'users.xlsx'
    component.fileSelected = new File(['x'], 'users.xlsx')
    component.uploadWithOtp()
    expect(snackBar.open).toHaveBeenCalledWith('Uploading CSV file failed due to some error, please try again later!')
  })
})
