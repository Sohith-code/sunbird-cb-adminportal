import '@angular/localize/init'
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { of, throwError } from 'rxjs'

import { BulkUploadOrgComponent } from './bulk-upload-org.component'
import { OrgHierarchyService } from '../services/org-hierarchy.service'
import { GlobalEventsService } from '../../../../../../../../src/app/services/global-events.service'

@Pipe({ name: 'orderBy', standalone: false })
class MockOrderByPipe implements PipeTransform {
  transform(value: any): any {
    return value
  }
}

describe('BulkUploadOrgComponent', () => {
  let component: BulkUploadOrgComponent
  let fixture: ComponentFixture<BulkUploadOrgComponent>
  let orgHieService: any
  let loaderService: any
  let snackbar: any

  const dialogData = {
    bulkUploadConfig: {
      mainHeading: 'Upload',
      sampleFileDownloadInstructuons: { title: 'Steps', instructions: ['one'] },
      frameworkData: { orgHierarchyFrameworkId: 'org1_fw' },
    },
  }

  beforeEach(waitForAsync(() => {
    orgHieService = {
      getBulkuploadProgress: jest.fn().mockReturnValue(
        of({ params: { status: 'SUCCESSFUL' }, result: { content: [{ fileName: 'a.xlsx' }] } })
      ),
      downloadSampleTemplate: jest.fn().mockReturnValue(of({ data: 'file' })),
      uploadFreameworkTemplate: jest.fn().mockReturnValue(of({ result: { fileName: 'a.xlsx' } })),
      downloadFileLog: jest.fn().mockReturnValue(of('blob-data')),
    }
    loaderService = { setLoaderState: jest.fn() }
    snackbar = { open: jest.fn() }

    TestBed.configureTestingModule({
      declarations: [BulkUploadOrgComponent, MockOrderByPipe],
      providers: [
        { provide: MatDialogRef, useValue: { close: jest.fn() } },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: OrgHierarchyService, useValue: orgHieService },
        { provide: GlobalEventsService, useValue: loaderService },
        { provide: MatSnackBar, useValue: snackbar },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents()
  }))

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkUploadOrgComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create and load progress data on init', () => {
    expect(component).toBeTruthy()
    expect(orgHieService.getBulkuploadProgress).toHaveBeenCalledWith('org1')
    expect(component.lastUploadList).toEqual([{ fileName: 'a.xlsx' }])
  })

  it('should handle unsuccessful and error progress responses', () => {
    orgHieService.getBulkuploadProgress.mockReturnValue(of({ params: { status: 'failed' } }))
    component.getBulkuploadPrgressData()
    expect(component.lastUploadList).toEqual([])
    expect(snackbar.open).toHaveBeenCalledWith('No progress data found')

    orgHieService.getBulkuploadProgress.mockReturnValue(throwError(() => ({})))
    component.getBulkuploadPrgressData()
    expect(snackbar.open).toHaveBeenCalledWith('Error fetching progress data')
  })

  it('should download sample file', async () => {
    await component.handleDownloadSampleFile()
    expect(orgHieService.downloadSampleTemplate).toHaveBeenCalledWith('org1_fw')
    expect(snackbar.open).toHaveBeenCalledWith('Download successfully')
  })

  it('should reject invalid file types', () => {
    const spy = jest.spyOn(component, 'uploadExcelFile')
    component.onFileSelected({ target: { files: [{ type: 'text/plain', size: 10 }] } })
    expect(spy).not.toHaveBeenCalled()
    expect(snackbar.open).toHaveBeenCalledWith('Please select a valid Excel file (.xlsx)', 'Close', { duration: 5000 })
  })

  it('should upload valid excel file', async () => {
    const file = new File(['x'], 'a.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    await component.uploadExcelFile(file)
    expect(orgHieService.uploadFreameworkTemplate).toHaveBeenCalled()
    expect(snackbar.open).toHaveBeenCalledWith('File uploaded successfully. Please check after 5 minutes for the results.')
  })

  it('should download file log', () => {
    const createObjectURL = jest.fn().mockReturnValue('blob:url')
    const revokeObjectURL = jest.fn()
    ;(window.URL as any).createObjectURL = createObjectURL
    ;(window.URL as any).revokeObjectURL = revokeObjectURL
    const clickSpy = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => { })

    component.handleDownloadFile({ fileName: 'a.xlsx' })

    expect(orgHieService.downloadFileLog).toHaveBeenCalledWith('a.xlsx')
    expect(createObjectURL).toHaveBeenCalled()
    expect(clickSpy).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:url')
    clickSpy.mockRestore()
  })

  it('should show message when no file name provided', () => {
    component.handleDownloadFile({})
    expect(snackbar.open).toHaveBeenCalledWith('No file name provided for download')
  })
})
