import { DesignationsComponent } from './designations.component'
import { of, throwError } from 'rxjs'
import { ActivatedRoute } from '@angular/router'
import * as _ from 'lodash'

describe('DesignationsComponent', () => {
  let component: DesignationsComponent
  let designationsService: any
  let dialog: any
  let snackBar: any
  let activateRoute: any

  const designationConfig = {
    internalErrorMsg: 'Internal Error',
    termRemoveMsg: 'Term remove message',
    frameworkCreationMSg: 'Creating framework',
  }

  beforeEach(() => {
    jest.useFakeTimers()
    designationsService = {
      setUserProfile: jest.fn(),
      getOrgReadData: jest.fn().mockReturnValue(of({})),
      getFrameworkInfo: jest.fn().mockReturnValue(of({ result: { framework: {} } })),
      setFrameWorkInfo: jest.fn(),
      setCurrentOrgDesignationsList: jest.fn(),
      createFrameWork: jest.fn().mockReturnValue(of({})),
      deleteDesignation: jest.fn().mockReturnValue(of({})),
      publishFramework: jest.fn().mockReturnValue(of({})),
    }
    dialog = {
      open: jest.fn().mockReturnValue({ afterClosed: () => of(true) }),
    }
    snackBar = { open: jest.fn() }
    activateRoute = {
      snapshot: {
        data: {
          configService: { userProfileV2: { departmentName: 'DepartmentName' } },
          pageData: { data: designationConfig },
        },
        params: { department: '1' },
        queryParams: { orgName: 'OrganizationName' },
      },
    }

    component = new DesignationsComponent(
      designationsService,
      dialog,
      activateRoute as ActivatedRoute,
      snackBar
    )
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('should initialize the component correctly', () => {
    jest.spyOn(component, 'initialization')
    component.ngOnInit()
    expect(component.initialization).toHaveBeenCalled()
  })

  it('should call initializeDefaultValues, valueChangeSubscribers and getRoutesData on initialization', () => {
    const defaultsSpy = jest.spyOn(component, 'initializeDefaultValues')
    const valueSpy = jest.spyOn(component, 'valueChangeSubscribers')
    const routesSpy = jest.spyOn(component, 'getRoutesData')
    component.initialization()
    expect(defaultsSpy).toHaveBeenCalled()
    expect(valueSpy).toHaveBeenCalled()
    expect(routesSpy).toHaveBeenCalled()
  })

  it('should initialize default values', () => {
    component.initializeDefaultValues()
    expect(designationsService.setUserProfile).toHaveBeenCalledWith(_.get(activateRoute.snapshot.data, 'configService.userProfileV2'))
    expect(component.orgId).toBe('1')
    expect(component.orgName).toBe('OrganizationName')
    expect(component.actionMenuItem.length).toBeGreaterThan(0)
    expect(component.isStateAdmin).toBe(false)
  })

  it('should call getRoutesData and handle success', () => {
    component.initializeDefaultValues()
    designationsService.getOrgReadData.mockReturnValue(of({ frameworkid: 'framework-id' }))
    jest.spyOn(component, 'getFrameworkInfo')

    component.getRoutesData()
    expect(designationsService.getOrgReadData).toHaveBeenCalledWith('1')
    expect(component.getFrameworkInfo).toHaveBeenCalledWith('framework-id')
  })

  it('should create a framework in getRoutesData when org has none', () => {
    component.initializeDefaultValues()
    designationsService.getOrgReadData.mockReturnValue(of({}))
    const createSpy = jest.spyOn(component, 'createFreamwork')

    component.getRoutesData()
    expect(createSpy).toHaveBeenCalled()
    expect(component.showCreateLoader).toBe(true)
    expect(component.loaderMsg).toBe('Creating framework')
  })

  it('should call getFrameworkInfo and handle success', () => {
    component.initializeDefaultValues()
    component.environment = {}
    const mockFrameworkResponse = { result: { framework: { code: 'mock-framework', categories: [] } } }
    designationsService.getFrameworkInfo.mockReturnValue(of(mockFrameworkResponse))

    component.getFrameworkInfo('framework-id')
    expect(designationsService.getFrameworkInfo).toHaveBeenCalledWith('framework-id')
    expect(component.frameworkDetails).toEqual(mockFrameworkResponse.result.framework)
    expect(component.showLoader).toBe(false)
  })

  it('should handle error in getFrameworkInfo', () => {
    component.initializeDefaultValues()
    component.environment = {}
    designationsService.getFrameworkInfo.mockReturnValue(throwError(new Error('Error')))

    component.getFrameworkInfo('framework-id')
    expect(component.showLoader).toBe(false)
    expect(snackBar.open).toHaveBeenCalledWith('Internal Error', 'X', { duration: 5000, panelClass: ['error'] })
  })

  it('should filter designations by key', () => {
    component.designationsList = [{ name: 'Manager' }, { name: 'Engineer' }]
    component.filterDesignations('man')
    expect(component.filteredDesignationsList).toEqual([{ name: 'Manager' }])
  })

  it('should handle removeDesignation method correctly', () => {
    component.initializeDefaultValues()
    component.frameworkDetails = { code: 'mock-framework' }
    jest.spyOn(component, 'publishFrameWork').mockImplementation(() => undefined)

    component.removeDesignation({ code: 'designation-code' })

    expect(designationsService.deleteDesignation).toHaveBeenCalledWith('mock-framework', 'designation', { request: { contentIds: ['designation-code'] } })
    expect(component.publishFrameWork).toHaveBeenCalledWith('delete')
  })

  it('should handle publishFramework method correctly', () => {
    component.initializeDefaultValues()
    component.environment = {}
    component.frameworkDetails = { code: 'mock-framework' }
    jest.spyOn(component, 'getFrameworkInfo').mockImplementation(() => undefined)

    component.publishFrameWork('delete')
    expect(designationsService.publishFramework).toHaveBeenCalledWith('mock-framework')
    jest.advanceTimersByTime(10000)
    expect(component.getFrameworkInfo).toHaveBeenCalledWith('mock-framework')
    expect(snackBar.open).toHaveBeenCalledWith('Term remove message', 'X', { duration: 5000, panelClass: [''] })
  })

  it('should handle openConformationPopup', () => {
    const event = { action: 'remove', row: { code: 'mock-code' } }
    const removeSpy = jest.spyOn(component, 'removeDesignation').mockImplementation(() => undefined)

    component.menuSelected(event)

    expect(dialog.open).toHaveBeenCalled()
    expect(removeSpy).toHaveBeenCalledWith({ code: 'mock-code' })
  })
})
