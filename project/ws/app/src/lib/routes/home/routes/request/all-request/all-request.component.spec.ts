import { AllRequestComponent } from './all-request.component'
import { of } from 'rxjs'

describe('AllRequestComponent', () => {
    let component: AllRequestComponent
    let mockDialog: any
    let mockSnackBar: any
    let mockRouter: any
    let mockRequestService: any
    let mockSanitizer: any

    beforeEach(() => {
        mockDialog = { open: jest.fn().mockReturnValue({ afterClosed: () => of(undefined) }) }
        mockSnackBar = { open: jest.fn() }
        mockRouter = { navigate: jest.fn() }
        mockSanitizer = { bypassSecurityTrustHtml: jest.fn((html: string) => ({ safe: html })) }
        mockRequestService = {
            getRequestList: jest.fn().mockReturnValue(of({})),
            markAsInvalid: jest.fn(),
        }

        component = new AllRequestComponent(
            mockSanitizer,
            mockRouter,
            mockRequestService,
            mockSnackBar,
            mockDialog,
        )
    })

    afterEach(() => {
        jest.useRealTimers()
    })

    it('should create the component', () => {
        expect(component).toBeTruthy()
    })

    it('should call getRequestList and getStatusCount on ngOnInit', () => {
        const spy = jest.spyOn(component, 'getRequestList')
        const spyCount = jest.spyOn(component, 'getStatusCount')
        component.ngOnInit()
        expect(spy).toHaveBeenCalled()
        expect(spyCount).toHaveBeenCalled()
    })

    it('should populate request list data', () => {
        mockRequestService.getRequestList.mockReturnValue(of({
            data: [
                { status: 'Unassigned', assignedProvider: { providerName: 'Prov' } },
                { status: 'Assigned' },
            ],
            totalCount: 2,
        }))
        component.getRequestList()
        expect(component.requestCount).toBe(2)
        expect(component.requestListData[0].assignedProvider).toBe('Prov')
        expect(component.isUnassigned).toBe(true)
        expect(component.isAssigned).toBe(true)
        expect(component.dataSource.data.length).toBe(2)
    })

    it('should set statusCards correctly in getStatusCount', () => {
        mockRequestService.getRequestList.mockReturnValue(of({
            facets: {
                status: [
                    { value: 'Assigned', count: 5 },
                    { value: 'Invalid', count: 3 },
                ],
            },
        }))

        component.getStatusCount()

        expect(component.statusCards.length).toBe(5)
        expect(component.statusCards).toEqual(expect.arrayContaining([
            expect.objectContaining({ value: 'Assigned', count: 5, message: 'Total number of requests assigned' }),
            expect.objectContaining({ value: 'Invalid', count: 3 }),
            expect.objectContaining({ value: 'Fulfill', count: 0 }),
        ]))
    })

    it('should call handleClick and open assign popup when status is not InProgress', () => {
        const mockItem = { status: 'Assigned' }
        const spy = jest.spyOn(component, 'openAssignlistPopup')

        component.handleClick(mockItem)

        expect(spy).toHaveBeenCalledWith(mockItem)
    })

    it('should not call openAssignlistPopup if status is InProgress', () => {
        const mockItem = { status: 'InProgress' }
        const spy = jest.spyOn(component, 'openAssignlistPopup')

        component.handleClick(mockItem)

        expect(spy).not.toHaveBeenCalled()
    })

    it('should refresh list and notify on openAssignlistPopup after dialog is confirmed', () => {
        jest.useFakeTimers()
        mockDialog.open.mockReturnValue({ afterClosed: () => of({ data: 'confirmed' }) })
        const spyGetRequestList = jest.spyOn(component, 'getRequestList')

        component.openAssignlistPopup({ demand_id: 123 })

        expect(mockDialog.open).toHaveBeenCalled()
        expect(mockSnackBar.open).toHaveBeenCalledWith('Assigned submitted Successfully')
        jest.advanceTimersByTime(1000)
        expect(spyGetRequestList).toHaveBeenCalled()
    })

    it('should call invalidContent when confirmation popup returns "confirmed"', () => {
        mockDialog.open.mockReturnValue({ afterClosed: () => of('confirmed') })
        mockRequestService.markAsInvalid.mockReturnValue(of({ ok: true }))
        const spyInvalidContent = jest.spyOn(component, 'invalidContent')

        component.showConformationPopUp({ demand_id: 123 }, 'invalidContent')

        expect(mockDialog.open).toHaveBeenCalled()
        expect(spyInvalidContent).toHaveBeenCalledWith({ demand_id: 123 })
        expect(mockRequestService.markAsInvalid).toHaveBeenCalledWith({ demand_id: 123, newStatus: 'Invalid' })
        expect(mockSnackBar.open).toHaveBeenCalledWith('Marked as Invalid')
    })

    it('should navigate for view and copy menu actions', () => {
        component.onClickMenu({ demand_id: 1 }, 'viewContent')
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/request-details'], { queryParams: { id: 1, name: 'view' } })
        component.onClickMenu({ demand_id: 2 }, 'copyContent')
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/request-details'], { queryParams: { id: 2, name: 'copy' } })
    })

    it('should open single reassign popup for non-broadcast requests', () => {
        mockDialog.open.mockReturnValue({ afterClosed: () => of({ data: 'confirmed' }) })
        const spy = jest.spyOn(component, 'openSingleReassignPopup')
        component.onClickMenu({ requestType: 'Single' }, 'reAssignContent')
        expect(spy).toHaveBeenCalled()
        expect(mockSnackBar.open).toHaveBeenCalledWith('Re-assign submitted Successfully')
    })

    it('should update paging on page change', () => {
        const spy = jest.spyOn(component, 'getRequestList')
        component.onChangePage({ pageIndex: 2, pageSize: 20 })
        expect(component.pageNo).toBe(2)
        expect(component.pageSize).toBe(20)
        expect(spy).toHaveBeenCalled()
    })

    it('should sanitize html via DomSanitizer', () => {
        const dirtyHtml = '<div>hi</div>'
        const sanitizedHtml = component.sanitizeHtml(dirtyHtml)
        expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(dirtyHtml)
        expect(sanitizedHtml).toBeTruthy()
    })

    it('should return pointer events style based on status', () => {
        expect(component.getPointerEventsStyle({ status: 'Assigned' })).toEqual({ 'pointer-events': 'auto' })
        expect(component.getPointerEventsStyle({ status: 'Invalid' })).toEqual({ 'pointer-events': 'none' })
    })

    it('should return correct CSS class for status', () => {
        expect(component.getStatusClass('Assigned')).toBe('status-assigned')
        expect(component.getStatusClass('Invalid')).toBe('status-invalid')
        expect(component.getStatusClass('Unassigned')).toBe('status-unassigned')
        expect(component.getStatusClass('Fulfill')).toBe('status-fullfill')
        expect(component.getStatusClass('InProgress')).toBe('status-inprogress')
        expect(component.getStatusClass('Unknown')).toBe('')
    })
})
