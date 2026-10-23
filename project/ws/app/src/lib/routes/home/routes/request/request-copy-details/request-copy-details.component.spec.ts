import { RequestCopyDetailsComponent } from './request-copy-details.component'
import { UntypedFormBuilder } from '@angular/forms'
import { of, throwError } from 'rxjs'
import { environment } from '../../../../../../../../../../src/environments/environment'

describe('RequestCopyDetailsComponent', () => {
  let component: RequestCopyDetailsComponent
  let mockRequestService: any
  let mockActivatedRoute: any
  let mockSnackBar: any
  let mockRouter: any
  let mockDialog: any
  let mockDialogRef: any
  let mockInitService: any

  const providers = [
    { id: 'p1', orgName: 'Provider One' },
    { id: 'p2', orgName: 'Another Org' },
  ]

  beforeEach(() => {
    (environment as any).compentencyVersionKey = 'competencyKey'

    mockRequestService = {
      getFilterEntity: jest.fn().mockReturnValue(of([{ name: 'Area1', themes: [] }])),
      getFilterEntityV2: jest.fn().mockReturnValue(of(null)),
      getRequestTypeList: jest.fn().mockReturnValue(of(providers)),
      getRequestDataById: jest.fn(),
      createDemand: jest.fn(),
    }
    mockActivatedRoute = { queryParams: of({}), snapshot: { data: {} } }
    mockSnackBar = { open: jest.fn() }
    mockRouter = { navigateByUrl: jest.fn() }
    mockDialogRef = { afterClosed: jest.fn().mockReturnValue(of({})), close: jest.fn() }
    mockDialog = { open: jest.fn().mockReturnValue(mockDialogRef) }
    mockInitService = {
      configSvc: { competency: { competencyKey: { vKey: 'competencies_v5' } } },
    }

    sessionStorage.setItem('idDetails', 'mockUserId')

    component = new RequestCopyDetailsComponent(
      new UntypedFormBuilder(),
      mockRequestService,
      mockActivatedRoute,
      mockSnackBar,
      mockRouter,
      mockDialog,
      mockInitService,
    )
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
    sessionStorage.removeItem('idDetails')
  })

  describe('Initialization', () => {
    it('should create the component and read current user', () => {
      expect(component).toBeTruthy()
      expect(component.currentUser).toBe('mockUserId')
    })

    it('should initialize with correct competency key and load data', () => {
      component.ngOnInit()
      expect(component.compentencyKey.vKey).toBe('competencies_v5')
      expect(mockRequestService.getFilterEntity).toHaveBeenCalled()
      expect(component.allCompetencies).toEqual([{ name: 'Area1', themes: [] }])
      expect(component.requestTypeData).toEqual(providers)
    })

    it('should use v2 filter entity when competency key is not v5', () => {
      mockInitService.configSvc.competency.competencyKey = { vKey: 'competencies_v6' }
      component.ngOnInit()
      expect(mockRequestService.getFilterEntityV2).toHaveBeenCalled()
      expect(mockRequestService.getFilterEntity).not.toHaveBeenCalled()
    })

    it('should read demand id and action from query params', () => {
      mockActivatedRoute.queryParams = of({ id: 'd1', name: 'view' })
      component.ngOnInit()
      expect(component.demandId).toBe('d1')
      expect(component.actionBtnName).toBe('view')
    })
  })

  describe('Form Initialization', () => {
    it('should initialize form group with correct controls', () => {
      component.compentencyKey = { vKey: 'competencies_v5' } as any
      component.initFormFroup()
      const keys = Object.keys(component.requestForm.controls)
      expect(keys).toEqual(expect.arrayContaining([
        'titleName', 'Objective', 'userType', 'learningMode', 'compArea', 'referenceLink',
        'requestType', 'assignee', 'providers', 'providerText', 'queryThemeControl',
        'querySubThemeControl', 'competencies_v5', 'assigneeText',
      ]))
    })
  })

  describe('Request Type Selection', () => {
    beforeEach(() => {
      component.ngOnInit()
    })

    it('should handle Single request type correctly', () => {
      component.selectRequestType('Single')
      expect(component.isAssignee).toBe(true)
      expect(component.isBroadCast).toBe(false)
      expect(component.statusValue).toBe('Assigned')
      expect(component.requestForm.controls['assignee'].valid).toBe(false)
    })

    it('should handle Broadcast request type correctly', () => {
      component.selectRequestType('Broadcast')
      expect(component.isAssignee).toBe(false)
      expect(component.isBroadCast).toBe(true)
      expect(component.statusValue).toBe('Unassigned')
      expect(component.requestForm.controls['assignee'].value).toBe('')
    })
  })

  describe('Search helpers', () => {
    it('should filter org values and mark hidden options', () => {
      expect(component.filterOrgValues('another', providers)).toEqual([providers[1]])
      const hidden = component.getHiddenOptions('provider', providers.map(p => ({ ...p })))
      expect(hidden[0].hideOption).toBe('show')
      expect(hidden[1].hideOption).toBe('hide')
      expect(component.filterValues('th', [{ name: 'Theme' }, { name: 'Area' }])).toEqual([{ name: 'Theme' }])
    })
  })

  describe('Competency Management', () => {
    beforeEach(() => {
      component.ngOnInit()
      component.allCompetencies = [
        {
          name: 'Area1',
          id: 1,
          themes: [
            {
              name: 'Theme1',
              id: 2,
              additionalProperties: { themeType: 'Behavioural' },
              associations: [{ name: 'SubTheme1', id: 3 }],
            },
          ],
        },
      ]
    })

    it('should select area, theme and sub-theme', () => {
      component.compAreaSelected({ name: 'Area1' })
      expect(component.seletedCompetencyArea.name).toBe('Area1')
      component.compThemeSelected({ name: 'Theme1' })
      expect(component.seletedCompetencyTheme.name).toBe('Theme1')
      component.compSubThemeSelected({ name: 'SubTheme1' })
      expect(component.seletedCompetencySubTheme.name).toBe('SubTheme1')
      expect(component.enableCompetencyAdd).toBe(true)
    })

    it('should add competency when not already present and reject duplicates', () => {
      component.compAreaSelected({ name: 'Area1' })
      component.compThemeSelected({ name: 'Theme1' })
      component.compSubThemeSelected({ name: 'SubTheme1' })

      component.addCompetency()

      const value = component.requestForm.controls['competencies_v5'].value
      expect(value.length).toBe(1)
      expect(value[0].competencyArea).toBe('Area1')
      expect(value[0].competencyThemeType).toBe('Behavioural')

      component.addCompetency()
      expect(mockSnackBar.open).toHaveBeenCalledWith('This competency is already added')
      expect(component.requestForm.controls['competencies_v5'].value.length).toBe(1)
    })

    it('should remove competency correctly', () => {
      const comp = { competencyArea: 'Area1', competencyAreaId: 1, competencyThemeId: 2, competencySubThemeId: 3 }
      component.requestForm.controls['competencies_v5'].setValue([comp])

      component.removeCompetency(comp)

      expect(component.requestForm.controls['competencies_v5'].value.length).toBe(0)
      expect(mockRequestService.getFilterEntityV2).toHaveBeenCalled()
    })
  })

  describe('Submission Process', () => {
    beforeEach(() => {
      component.ngOnInit()
      component.requestForm.patchValue({
        titleName: 'Test Title',
        Objective: 'Test Objective',
        userType: 'Test User',
        competencies_v5: [
          { competencyArea: 'Area1', competencyTheme: 'Theme1', competencySubTheme: 'SubTheme1' },
        ],
        requestType: 'Single',
        assignee: { orgName: 'Provider', id: 1 },
        learningMode: 'Self-paced',
      })
      component.selectRequestType('Single')
      component.requestForm.patchValue({ assignee: { orgName: 'Provider', id: 1 } })
    })

    it('should submit demand successfully', () => {
      jest.useFakeTimers()
      mockRequestService.createDemand.mockReturnValue(of({ id: 'demand' }))

      component.submit()

      expect(mockRequestService.createDemand).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Test Title',
        objective: 'Test Objective',
        competencies: [{ area: 'Area1', theme: 'Theme1', sub_theme: 'SubTheme1' }],
        requestType: 'Single',
        assignedProvider: { providerName: 'Provider', providerId: 1 },
        learningMode: 'self-paced',
      }))
      jest.advanceTimersByTime(1000)
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/home/all-request')
      expect(mockSnackBar.open).toHaveBeenCalledWith('Request submitted successfully ')
    })

    it('should handle demand creation error', () => {
      mockRequestService.createDemand.mockReturnValue(throwError(new Error('Submission failed')))

      component.submit()

      expect(mockDialogRef.close).toHaveBeenCalled()
      expect(mockSnackBar.open).toHaveBeenCalledWith('Request Failed')
    })

    it('should submit after confirmation popup is confirmed', () => {
      mockDialogRef.afterClosed.mockReturnValue(of('confirmed'))
      mockRequestService.createDemand.mockReturnValue(of(null))
      const spy = jest.spyOn(component, 'submit')
      component.showConformationPopUp()
      expect(spy).toHaveBeenCalled()
    })
  })

  it('should navigate back to all requests', () => {
    component.navigateBack()
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/home/all-request')
  })
})
