import { CommsComponent } from './comms.component'
import { MatDialog } from '@angular/material/dialog'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { CommsService } from './comms.service'
import { MatSnackBar } from '@angular/material/snack-bar'
import { DatePipe } from '@angular/common'
import { of, throwError } from 'rxjs'

jest.mock('../../../../../../../../../src/environments/environment', () => ({
    environment: {
        spvPath: 'https://your-environment-url',
    },
}))

describe('CommsComponent', () => {
    let component: CommsComponent
    let mockDialog: MatDialog
    let mockConfigSvc: ConfigurationsService
    let mockCommsService: CommsService
    let mockSnackBar: MatSnackBar
    let mockDatePipe: DatePipe

    beforeEach(() => {
        mockDialog = { open: jest.fn() } as any
        mockConfigSvc = { userProfile: { userId: 'test-user' } } as any
        mockCommsService = { getCommsContent: jest.fn(), getCommsReportContnet: jest.fn() } as any
        mockSnackBar = { open: jest.fn() } as any
        mockDatePipe = { transform: jest.fn().mockReturnValue('02/24/2025') } as any

        component = new CommsComponent(
            mockDialog,
            mockConfigSvc,
            mockCommsService,
            mockDatePipe,
            mockSnackBar,
        )
    })

    it('should create the component', () => {
        expect(component).toBeTruthy()
    })

    it('should initialize component properties on ngOnInit', () => {
        jest.spyOn(mockCommsService, 'getCommsContent').mockReturnValue(of({ comms: { buckets: [] } }))
        component.ngOnInit()

        expect(component.currentUser).toBe('test-user')
        expect(component.todayDate).toBeInstanceOf(Date)
        expect(component.maxDate).toBeInstanceOf(Date)
        expect(component.tabledata).toEqual({
            columns: [
                { displayName: 'Criteria', key: 'criteria' },
                { displayName: 'Last updated on', key: 'lastUpdateOn' },
            ],
            needCheckBox: false,
            needHash: false,
            sortColumn: 'Criteria',
            sortState: 'asc',
            needUserMenus: false,
            actionColumnName: 'Action',
            actions: [{ icon: '', label: 'Download', name: 'DownloadFile', type: 'Standard', disabled: false }],
        })
    })

    it('should call getTableData when commsContent is fetched', () => {
        const mockBuckets = [{ enable: true, key: 'key1', name: 'Bucket 1' }]
        jest.spyOn(mockCommsService, 'getCommsContent').mockReturnValue(of({ comms: { buckets: mockBuckets } }))
        jest.spyOn(mockCommsService, 'getCommsReportContnet').mockReturnValue(of({}))
        const spyGetTableData = jest.spyOn(component, 'getTableData')

        component.ngOnInit()
        expect(mockDatePipe.transform).toHaveBeenCalledWith(expect.any(Date), 'yyyy-MM-dd')
        expect(spyGetTableData).toHaveBeenCalledWith('02/24/2025') // value returned by the mocked datePipe
    })

    it('should update table data when getTableData is called', () => {
        component.buckets = [{ enable: true, key: 'key1', name: 'Bucket 1' }]
        const mockResponse = { key1: { lastModified: '2025-02-24T10:00:00' } }
        jest.spyOn(mockCommsService, 'getCommsReportContnet').mockReturnValue(of(mockResponse))
        ;(mockDatePipe.transform as jest.Mock).mockImplementation((_v: any, format: string) =>
            format === 'yyyy-MM-dd' ? '2025-02-24' : '24/02/2025, 10:00 am')

        component.getTableData('2025-02-24')
        expect(component.reportSectionData).toEqual([
            { criteria: 'Bucket 1', lastUpdateOn: '24/02/2025, 10:00 am', downloadUrl: '2025-02-24', bucketKey: 'key1' },
        ])
    })

    it('should handle error gracefully in getTableData', () => {
        const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation()
        const error = new Error('Failed')
        jest.spyOn(mockCommsService, 'getCommsReportContnet').mockReturnValue(throwError(error))

        component.getTableData('2025-02-24')
        expect(consoleLogSpy).toHaveBeenCalledWith(error)
        expect(component.displayLoader).toBe(false)
    })

    it('should call snackBar when downloadFile is invoked without a downloadUrl', () => {
        const mockEvent = { row: { downloadUrl: '' } }
        component.downloadFile(mockEvent)
        expect(mockSnackBar.open).toHaveBeenCalledWith('Report is not available.', 'X', { duration: 2000 })
    })

    it('should invoke downloadReport when downloadFile is called with a valid downloadUrl', () => {
        const mockEvent = { row: { downloadUrl: '2025-02-24', bucketKey: 'key1.csv' } }
        const spyDownloadReport = jest.spyOn(component, 'downloadReport')
        component.downloadFile(mockEvent)
        expect(spyDownloadReport).toHaveBeenCalledWith(mockEvent.row)
    })

    it('should update table data when updateDate is called', () => {
        const spyGetTableData = jest.spyOn(component, 'getTableData').mockImplementation()
        component.updateDate({ value: '2025-02-24' })
        expect(spyGetTableData).toHaveBeenCalledWith('2025-02-24')
    })

    it('should download report', () => {
        const row = { bucketKey: 'key1.csv', downloadUrl: '2025-02-24' }
        const xhrMock: any = {
            open: jest.fn(),
            send: jest.fn(),
            readyState: 4,
            status: 200,
        }
        const originalXHR = global.XMLHttpRequest
        const originalLocation = window.location
        global.XMLHttpRequest = jest.fn().mockImplementation(() => xhrMock) as any
        Object.defineProperty(window, 'location', { value: { href: '' }, writable: true, configurable: true })

        try {
            component.downloadReport(row)

            const expectedUrl = 'https://your-environment-url/apis/proxies/v8/storage/v1/spvReport/key1/2025-02-24/key1.csv'
            expect(xhrMock.open).toHaveBeenCalledWith('GET', expectedUrl)
            expect(xhrMock.send).toHaveBeenCalled()
            xhrMock.onreadystatechange()
            expect(window.location.href).toBe(expectedUrl)
        } finally {
            global.XMLHttpRequest = originalXHR
            Object.defineProperty(window, 'location', { value: originalLocation, writable: true, configurable: true })
        }
    })
})
