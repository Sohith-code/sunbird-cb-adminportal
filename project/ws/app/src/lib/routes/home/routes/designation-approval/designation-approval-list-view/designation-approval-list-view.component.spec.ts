import { DesignationApprovalListViewComponent } from './designation-approval-list-view.component'
import { MatTableDataSource } from '@angular/material/table'
import { SimpleChange } from '@angular/core'
import { Subject } from 'rxjs'

describe('DesignationApprovalListViewComponent', () => {
  let component: DesignationApprovalListViewComponent
  let mockRouter: any
  let mockActivatedRoute: any
  let mockChangeDetectorRef: any

  beforeEach(() => {
    mockRouter = { navigate: jest.fn() }
    mockActivatedRoute = {
      parent: { snapshot: { data: { configService: { userProfile: { userId: 'u1' } } } } },
    }
    mockChangeDetectorRef = { detectChanges: jest.fn() }

    component = new DesignationApprovalListViewComponent(
      mockRouter,
      mockActivatedRoute,
      mockChangeDetectorRef,
      {} as any,
    )
    component.paginator = { page: new Subject<any>() } as any
  })

  it('should create and initialise defaults in constructor', () => {
    expect(component).toBeTruthy()
    expect(component.dataSource).toBeInstanceOf(MatTableDataSource)
    expect(component.actionsClick).toBeDefined()
    expect(component.clicked).toBeDefined()
    expect(component.configSvc).toEqual({ userProfile: { userId: 'u1' } })
  })

  it('should set displayedColumns and data in ngOnInit', () => {
    const cols = [{ displayName: 'Col 1', key: 'col1' }]
    component.tableData = { columns: cols } as any
    component.data = [{ id: 1 }] as any
    component.ngOnInit()
    expect(component.displayedColumns).toEqual(cols)
    expect(component.dataSource.data).toEqual([{ id: 1 }])
  })

  it('should update dataSource and length on data change', () => {
    const newData = [{ id: 2 }, { id: 3 }]
    component.ngOnChanges({ data: new SimpleChange(null, newData, true) })
    expect(component.dataSource.data).toEqual(newData)
    expect(component.length).toBe(2)
  })

  it('should use totalCount for length when provided', () => {
    component.ngOnChanges({
      data: new SimpleChange(null, [{ id: 1 }], true),
      totalCount: new SimpleChange(null, 50, true),
    })
    expect(component.length).toBe(50)
  })

  it('should emit page change from paginator after view init', () => {
    const spy = jest.spyOn(component.pageChanged, 'emit')
    component.ngAfterViewInit()
    ;(component.paginator.page as any).next({ pageIndex: 2, pageSize: 30 })
    expect(spy).toHaveBeenCalledWith({ pageIndex: 2, pageSize: 30 })
  })

  it('should filter using the custom filter predicate', () => {
    component.ngAfterViewInit()
    component.dataSource.data = [
      { designationName: 'Engineer', email: 'a@x.com' },
      { designationName: 'Manager', email: 'b@x.com' },
    ]
    component.applyFilter('Engineer')
    expect(component.dataSource.filter).toBe('engineer')
    expect(component.dataSource.filteredData.length).toBe(1)
    component.applyFilter('')
    expect(component.dataSource.filter).toBe('')
  })

  it('should provide sorting data accessor for known properties', () => {
    component.ngAfterViewInit()
    const accessor = component.dataSource.sortingDataAccessor
    expect(accessor({ designationName: 'ABC' }, 'designationName')).toBe('abc')
    expect(accessor({ organisation: 'Org' }, 'organisation')).toBe('org')
    expect(accessor({}, 'email')).toBe('')
    expect(accessor({ other: 5 }, 'other')).toBe(5)
    expect(accessor({ createdOn: '2023-01-01' }, 'createdOn')).toBeInstanceOf(Date)
  })

  it('should emit action click for enabled action only', () => {
    const spy = jest.spyOn(component.actionsClick as any, 'emit')
    component.tableData = {
      columns: [],
      actions: [{ name: 'edit', disabled: false }, { name: 'delete', disabled: true }],
    } as any
    component.buttonClick('edit', { id: 1 })
    expect(spy).toHaveBeenCalledWith({ action: 'edit', row: { id: 1 } })
    spy.mockClear()
    component.buttonClick('delete', { id: 1 })
    expect(spy).not.toHaveBeenCalled()
  })

  it('should emit approve and reject actions', () => {
    const spy = jest.spyOn(component.actionsClick as any, 'emit')
    component.approveRequest({ id: 1 })
    expect(spy).toHaveBeenCalledWith({ action: 'approve', row: { id: 1 } })
    component.rejectRequest({ id: 2 })
    expect(spy).toHaveBeenCalledWith({ action: 'reject', row: { id: 2 } })
  })

  it('should return date objects from date format helpers', () => {
    expect(component.customDateFormat('2023-01-10', '14:30:00+05:30')).toBeInstanceOf(Date)
    expect(component.allEventDateFormat('2023-01-15T10:30:00.000Z')).toBeInstanceOf(Date)
  })

  it('should navigate to create event page', () => {
    component.onCreateClick()
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/events/create-event'])
  })

  it('should emit row click event', () => {
    const spy = jest.spyOn(component.eOnRowClick, 'emit')
    component.onRowClick({ id: 1 })
    expect(spy).toHaveBeenCalledWith({ id: 1 })
  })

  it('should toggle selection correctly', () => {
    component.dataSource.data = [{ id: 1 }, { id: 2 }]
    expect(component.isAllSelected()).toBe(false)
    component.masterToggle()
    expect(component.selection.selected.length).toBe(2)
    component.masterToggle()
    expect(component.selection.selected.length).toBe(0)
  })

  it('should build image url for default and regular images', () => {
    component.showImageDialog('/content/Events_default/default.jpg')
    expect(component.finalImg).toContain('/Events_default/default.jpg')
    component.showImageDialog('/content/images/event.jpg')
    expect(component.finalImg).toContain('/content/images/event.jpg')
  })

  it('should return final column configuration', () => {
    component.tableData = {
      columns: [{ key: 'col1' }, { key: 'col2' }],
      needCheckBox: true,
      needHash: true,
      actions: [{ name: 'edit' }],
      needUserMenus: true,
    } as any
    expect(component.getFinalColumns()).toEqual(['SR', 'select', 'col1', 'col2', 'Actions', 'Menu'])
    component.tableData = undefined
    expect(component.getFinalColumns()).toBe('')
  })

  it('should return proper checkbox label', () => {
    component.dataSource.data = [{ position: 5 }]
    const row = { position: 5 }
    expect(component.checkboxLabel(row)).toBe('select row 6')
    component.selection.select(row)
    expect(component.checkboxLabel(row)).toBe('deselect row 6')
  })

  it('should allow update for non-upcoming filters and past upcoming events', () => {
    component.currentFilter = 'past'
    expect(component.allowUpdateEvent({})).toBe(true)
    component.currentFilter = 'upcoming'
    expect(component.allowUpdateEvent({ startDate: '2000-01-01', startTime: '10:00:00+05:30' })).toBe(false)
    expect(component.allowUpdateEvent({ startDate: '2999-01-01', startTime: '10:00:00+05:30' })).toBe(true)
  })

  it('should open and close rejection popup', () => {
    component.openRejecttionCommentPopup({ id: 1 })
    expect(component.showRejectPopupFlag).toBe(true)
    expect(component.rejectionDetail).toEqual({ id: 1 })
    component.closeRejectPopup()
    expect(component.showRejectPopupFlag).toBe(false)
  })

  it('should call detectChanges after view checked', () => {
    component.ngAfterViewChecked()
    expect(mockChangeDetectorRef.detectChanges).toHaveBeenCalled()
  })
})
