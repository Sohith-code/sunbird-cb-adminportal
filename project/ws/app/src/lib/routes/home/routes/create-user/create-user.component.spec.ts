import { TestBed } from '@angular/core/testing'
import { of, throwError } from 'rxjs'
import { CreateUserComponent } from './create-user.component'

describe('CreateUserComponent', () => {
    let component: CreateUserComponent
    let mockUsersService: any
    let mockMatSnackBar: any
    let mockRouter: any
    let mockDirectoryService: any
    let mockCreateMDOService: any
    let mockProfileUtilSvc: any
    let mockEvents: any
    let mockActivatedRoute: any

    beforeEach(() => {
        mockUsersService = {
            createUser: jest.fn(),
            searchMDOLeaders: jest.fn().mockReturnValue(of({ result: { response: { count: 2 } } })),
        }
        mockMatSnackBar = { open: jest.fn() }
        mockRouter = {
            navigate: jest.fn(),
            getCurrentNavigation: jest.fn().mockReturnValue(null),
        }
        mockDirectoryService = {
            getOrgTypeList$: jest.fn().mockReturnValue(of({
                orgTypeList: [
                    { name: 'SPV', roles: ['PUBLIC', 'MDO_ADMIN'] },
                    { name: 'CBP', roles: ['CBP_ADMIN'] },
                ],
            })),
            getOrgTypeConfig$: jest.fn().mockReturnValue(of({ fields: [] })),
        }
        mockCreateMDOService = { assignAdminToDepartment: jest.fn() }
        mockProfileUtilSvc = { transformToEmail: jest.fn((e: string) => e) }
        mockEvents = { raiseInteractTelemetry: jest.fn() }
        mockActivatedRoute = {
            queryParams: of({
                id: '1',
                orgName: 'OrgName',
                subOrgType: 'SPV',
                redirectionPath: '/app/home/',
            }),
            snapshot: {
                queryParams: {
                    createDept: JSON.stringify({ depName: 'DeptName', depType: 'SPV' }),
                },
                data: {
                    configService: { unMappedUser: { rootOrg: { orgName: 'TestOrg' } } },
                },
            },
        }

        component = TestBed.runInInjectionContext(() => new CreateUserComponent(
            mockActivatedRoute,
            mockRouter,
            mockMatSnackBar,
            mockDirectoryService,
            mockCreateMDOService,
            mockProfileUtilSvc,
            mockUsersService,
            mockEvents,
        ))
    })

    it('should create the component and initialize values', () => {
        expect(component).toBeDefined()
        expect(component.createUserForm).toBeDefined()
        expect(component.createUserForm.controls['fname']).toBeDefined()
        expect(component.deptId).toBe('1')
        expect(component.currentDept).toBe('SPV')
    })

    it('should call getMdoLeader from query params subscription in constructor', () => {
        expect(mockUsersService.searchMDOLeaders).toHaveBeenCalledWith('1')
        expect(component.mdoLeadersCount).toBe(2)
    })

    it('should load roles for the current department on init', () => {
        component.ngOnInit()
        expect(mockDirectoryService.getOrgTypeList$).toHaveBeenCalled()
        expect(mockDirectoryService.getOrgTypeConfig$).toHaveBeenCalled()
        expect(component.roles).toEqual(['PUBLIC', 'MDO_ADMIN'])
        expect((component.dropdownSettings as any).idField).toBe('id')
    })

    it('should validate email and set emailLengthVal', () => {
        component.emailVerification('test@domain.com')
        expect(component.emailLengthVal).toBe(false)

        const invalidEmail = `${'a'.repeat(65)}@domain.com`
        component.emailVerification(invalidEmail)
        expect(component.emailLengthVal).toBe(true)
    })

    const form = {
        value: {
            email: 'test@domain.com',
            fname: 'John',
            mobileNumber: '1234567890',
            role: ['PUBLIC'],
            dept: 'DeptName',
            deptId: 'DeptID',
        },
    }

    it('should call onSubmit and handle success', () => {
        mockUsersService.createUser.mockReturnValue(of({ userId: '12345' }))
        component.createUserForm.patchValue({ role: ['PUBLIC'] })

        component.onSubmit(form)

        expect(mockEvents.raiseInteractTelemetry).toHaveBeenCalled()
        expect(component.displayLoader).toBe(false)
        expect(component.disableCreateButton).toBe(false)
        expect(mockMatSnackBar.open).toHaveBeenCalledWith('User created successfully!', 'X', { duration: 5000 })
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/users'])
    })

    it('should call onSubmit and handle error', () => {
        mockUsersService.createUser.mockReturnValue(
            throwError(({
                error: { params: { errmsg: 'This phone is already registered with an existing user' } },
            }))
        )
        component.createUserForm.patchValue({ role: ['PUBLIC'] })

        component.onSubmit(form)

        expect(component.displayLoader).toBe(false)
        expect(component.disableCreateButton).toBe(false)
        expect(mockMatSnackBar.open).toHaveBeenCalledWith('This Phone is already registered with an existing User', 'X', {
            duration: 5000,
        })
    })

    it('should block onSubmit when MDO_LEADER already allocated', () => {
        component.createUserForm.patchValue({ role: ['MDO_LEADER'] })
        component.onSubmit(form)
        expect(mockUsersService.createUser).not.toHaveBeenCalled()
        expect(component.displayLoader).toBe(false)
        expect(mockMatSnackBar.open).toHaveBeenCalled()
    })

    it('should handle item select', () => {
        component.onItemSelect([{ id: 1, deptName: 'Dept1' }])
        expect(component.selectedDept).toEqual([{ id: 1, deptName: 'Dept1' }])
    })

    it('should toggle user roles', () => {
        component.modifyUserRoles('MDO_LEADER')
        expect(component.userRoles.has('MDO_LEADER')).toBe(true)

        component.modifyUserRoles('MDO_LEADER')
        expect(component.userRoles.has('MDO_LEADER')).toBe(false)
    })
})
