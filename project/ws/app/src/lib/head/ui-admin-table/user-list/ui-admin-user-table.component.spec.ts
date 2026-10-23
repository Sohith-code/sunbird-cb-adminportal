import { UIAdminUserTableComponent } from './ui-admin-user-table.component'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { CreateMDOService as MDO2 } from '../../../routes/home/services/create-mdo.services'
import { EventService } from '@sunbird-cb/utils-v2'
import { of } from 'rxjs'

describe('UIAdminUserTableComponent', () => {
    let component: UIAdminUserTableComponent
    let mockDialog: jest.Mocked<MatDialog>
    let mockSnackBar: jest.Mocked<MatSnackBar>
    let mockRouter: jest.Mocked<Router>
    let mockActivatedRoute: ActivatedRoute
    let mockCreateMDOService2: any
    let mockEvents: jest.Mocked<EventService>

    beforeEach(() => {
        mockDialog = { open: jest.fn() } as any
        mockSnackBar = { open: jest.fn() } as any
        mockRouter = { navigate: jest.fn() } as any
        mockActivatedRoute = {
            snapshot: { parent: { data: { configService: { unMappedUser: { roles: ['MDO_ADMIN'] } } } } },
            queryParams: of({
                currentDept: 'state',
                depatName: 'Dept',
                orgName: 'Org',
                roleId: 'dept-1',
                path: 'users',
                subOrgType: 'state',
                organisationType: 1,
            }),
        } as any
        mockCreateMDOService2 = {
            searchedUserdata: of([{ userId: 'u1', organisations: [{ roles: ['PUBLIC'] }] }]),
            assignAdminToDepartment: jest.fn().mockReturnValue(of({ ok: true })),
        }
        mockEvents = { raiseInteractTelemetry: jest.fn() } as any

        component = new UIAdminUserTableComponent(
            mockRouter,
            mockDialog,
            mockActivatedRoute,
            mockCreateMDOService2 as MDO2,
            mockEvents,
            mockSnackBar
        )

        component.tableData = { columns: [], actions: [] } as any
        component.data = []
    })

    it('should create the component', () => {
        expect(component).toBeTruthy()
        expect(component.isStateAdmin).toBe(false)
    })

    it('should set isStateAdmin when user has STATE_ADMIN role', () => {
        (mockActivatedRoute as any).snapshot.parent.data.configService.unMappedUser.roles = ['STATE_ADMIN']
        const cmp = new UIAdminUserTableComponent(
            mockRouter, mockDialog, mockActivatedRoute, mockCreateMDOService2, mockEvents, mockSnackBar
        )
        expect(cmp.isStateAdmin).toBe(true)
    })

    it('should initialize with correct values on ngOnInit', () => {
        component.ngOnInit()
        expect(component.viewPaginator).toBe(true)
        expect(component.dataSource.data).toEqual([])
        expect(component.departmentId).toBe('dept-1')
        expect(component.needAddAdmin).toBe(true)
        expect(component.needCreateUser).toBe(true)
    })

    it('should correctly apply filter when filterValue is provided', () => {
        component.applyFilter('some value')
        expect(component.moreThanTwoChar).toBe(true)
        component.applyFilter('so')
        expect(component.moreThanTwoChar).toBe(false)
    })

    it('should emit empty search when filter is cleared', () => {
        const emitSpy = jest.spyOn(component.searchByEnterKey, 'emit')
        component.applyFilter('')
        expect(emitSpy).toHaveBeenCalledWith('')
    })

    it('should emit actionsClick event on buttonClick', () => {
        const emitSpy = jest.spyOn(component.actionsClick!, 'emit')
        const action = 'edit'
        const row = { id: 1 }
        component.buttonClick(action, row)
        expect(emitSpy).toHaveBeenCalledWith({ action, row })
    })

    it('should emit search params on onChangePage', () => {
        const emitSpy = jest.spyOn(component.searchByEnterKey, 'emit')
        component.onChangePage({ pageIndex: 1, pageSize: 10, length: 100 })
        expect(emitSpy).toHaveBeenCalledWith({
            query: '',
            limit: 10,
            offset: 10,
        })
    })

    it('should call downloadUsersReport and send request, showing snackbar on failure', () => {
        const xhrMock: any = {
            readyState: 4,
            status: 404,
            onreadystatechange: null,
            open: jest.fn(),
            send: jest.fn(),
        }
        const originalXhr = global.XMLHttpRequest
        global.XMLHttpRequest = jest.fn(() => xhrMock) as any

        component.departmentId = 'dept-1'
        component.downloadUsersReport('user report')

        expect(XMLHttpRequest).toHaveBeenCalled()
        expect(xhrMock.open).toHaveBeenCalledWith('GET', expect.stringContaining('dept-1/user-report-userReport.zip'))
        expect(xhrMock.send).toHaveBeenCalled()

        xhrMock.onreadystatechange()
        expect(mockSnackBar.open).toHaveBeenCalledWith('Report is not available')

        global.XMLHttpRequest = originalXhr
    })

    it('should open a dialog when openPopup is called and assign admin', () => {
        jest.useFakeTimers()
        const dialogRef = { afterClosed: jest.fn().mockReturnValue(of({ data: [{ userId: 'u1' }] })) }
        mockDialog.open.mockReturnValue(dialogRef as any)
        component.ngOnInit()

        component.openPopup()

        expect(mockDialog.open).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ width: '80%', height: '65%' })
        )
        expect(mockCreateMDOService2.assignAdminToDepartment).toHaveBeenCalledWith('u1', 'dept-1', ['PUBLIC', 'STATE_ADMIN'])
        expect(mockSnackBar.open).toHaveBeenCalledWith('Admin assigned Successfully')
        jest.useRealTimers()
    })

    it('should navigate to create-user on gotoCreateUser', () => {
        component.gotoCreateUser()
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/create-user'], expect.objectContaining({
            queryParams: expect.anything(),
        }))
    })

    it('should map subOrgType correctly', () => {
        component.subOrgType = 'Ministry'
        expect(component.getSubOrgType()).toBe('mdo')
        component.subOrgType = 'state'
        expect(component.getSubOrgType()).toBe('state')
        component.subOrgType = 'volunteer'
        expect(component.getSubOrgType()).toBe('volunteer')
        component.subOrgType = 'other'
        expect(component.getSubOrgType()).toBe('cbp-providers')
    })

    it('should raise telemetry when raiseTelemetry is called', () => {
        const sub = 'button'
        component.raiseTelemetry(sub)
        expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'click',
                subType: sub,
                id: `${sub}-click`,
            }),
            {}
        )
    })

    it('should toggle row selection with masterToggle', () => {
        const row = { id: 1 }
        component.dataSource.data = [row]
        component.masterToggle()
        expect(component.selection.isSelected(row)).toBe(true)

        component.masterToggle()
        expect(component.selection.isSelected(row)).toBe(false)
    })

    it('should return the correct label for checkbox with checkboxLabel', () => {
        const row = { id: 1, position: 0 }
        component.selection.select(row)
        expect(component.checkboxLabel(row)).toBe('deselect row 1')
    })
})
