import { of, throwError } from 'rxjs'
import { CreateUserComponent } from './create-user.component'

describe('CreateUserComponent', () => {
    let component: CreateUserComponent
    let snackBar: any
    let configSvc: any
    let createUserSvc: any
    let roleManagementSvc: any
    let router: any
    let activatedRoute: any

    const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0))

    beforeEach(() => {
        snackBar = { open: jest.fn() }
        configSvc = { org: ['org1'] }
        createUserSvc = { createUser: jest.fn() }
        roleManagementSvc = { manageUser: jest.fn() }
        router = {}
        activatedRoute = {
            parent: {
                parent: {
                    data: of({ featureData: { data: { roleList: { admin: 'Admin role', user: 'User role' } } } }),
                },
            },
        }

        component = new CreateUserComponent(
            snackBar,
            configSvc,
            createUserSvc,
            roleManagementSvc,
            activatedRoute,
            router,
            activatedRoute,
        )

        component.ngOnInit()
    })

    it('should create the component and build roles from feature data', () => {
        expect(component).toBeTruthy()
        expect(component.rolesHash).toEqual([
            { role: 'admin', about: 'Admin role', selected: false },
            { role: 'user', about: 'User role', selected: false },
        ])
    })

    it('should initialize the form with required fields', () => {
        expect(component.registerUser).toBeDefined()
        expect(component.registerUser.controls.firstname).toBeDefined()
        expect(component.registerUser.controls.emailid).toBeDefined()
        expect(component.registerUser.controls.password).toBeDefined()
    })

    it('should validate password correctly', () => {
        component.registerUser.controls.password.setValue('password123')
        component.registerUser.controls.cpassword.setValue('password123')
        expect(component.registerUser.errors).toBeNull()

        component.registerUser.controls.cpassword.setValue('differentPassword')
        expect(component.registerUser.errors).toEqual({ mustMatch: true })

        component.passwordType = 'GeneratePassword'
        component.onRadioChange()
        expect(component.registerUser.errors).toBeNull()
    })

    it('should generate password when onGeneratePassword is called', () => {
        const mockEvent = { preventDefault: jest.fn() }
        const beforePassword = component.registerUser.controls.password.value
        component.onGeneratePassword(mockEvent)

        expect(mockEvent.preventDefault).toHaveBeenCalled()
        expect(component.registerUser.controls.password.value).not.toBe(beforePassword)
    })

    function fillForm() {
        component.registerUser.controls.firstname.setValue('John')
        component.registerUser.controls.emailid.setValue('john@x.com')
        component.registerUser.controls.password.setValue('secret1')
        component.registerUser.controls.cpassword.setValue('secret1')
    }

    it('should handle successful user creation without roles', () => {
        createUserSvc.createUser.mockReturnValue(of({ code: 200 }))
        fillForm()

        component.createUser()

        expect(createUserSvc.createUser).toHaveBeenCalledWith({
            org: 'org1',
            firstName: 'John',
            email: 'john@x.com',
            emailVerified: true,
            noPasswordChange: true,
            password: 'secret1',
        }, true)
        expect(snackBar.open).toHaveBeenCalledWith('User Created Successfully', 'X', { duration: 3000 })
        expect(component.isFetching).toBe(false)
    })

    it('should add roles after successful user creation', async () => {
        createUserSvc.createUser.mockReturnValue(of({ code: 200, wid: 'w1' }))
        roleManagementSvc.manageUser.mockReturnValue(Promise.resolve())
        fillForm()
        component.selectedSystemRoles = ['admin']

        component.createUser()
        await flushPromises()

        expect(roleManagementSvc.manageUser).toHaveBeenCalledWith({ users: ['w1'], operation: 'add', roles: ['admin'] })
        expect(snackBar.open).toHaveBeenCalledWith('User Created Successfully', 'X', { duration: 3000 })
        expect(component.selectedSystemRoles).toEqual([])
    })

    it('should report role assignment failure', async () => {
        createUserSvc.createUser.mockReturnValue(of({ code: 200, wid: 'w1' }))
        roleManagementSvc.manageUser.mockReturnValue(Promise.reject(new Error('fail')))
        fillForm()
        component.selectedSystemRoles = ['admin']

        component.createUser()
        await flushPromises()

        expect(snackBar.open).toHaveBeenCalledWith('User Created Error Occured While Adding Role', 'X', { duration: 3000 })
    })

    it('should show error for non-200 response', () => {
        createUserSvc.createUser.mockReturnValue(of({ code: 500 }))
        fillForm()
        component.createUser()
        expect(snackBar.open).toHaveBeenCalledWith('Some Error occured', 'X', { duration: 3000 })
    })

    it('should handle user creation error with conflicting email', () => {
        createUserSvc.createUser.mockReturnValue(throwError({ error: { message: '{"msg": "conflicting email found"}' } }))
        fillForm()
        component.createUser()
        expect(snackBar.open).toHaveBeenCalledWith('User Already Exists', 'X', { duration: 3000 })
    })

    it('should handle generic error when creating user', () => {
        createUserSvc.createUser.mockReturnValue(throwError({ error: { message: '{"msg": "Some error occurred"}' } }))
        fillForm()
        component.createUser()
        expect(snackBar.open).toHaveBeenCalledWith('Error Creating User', 'X', { duration: 3000 })
    })

    it('should select and deselect roles correctly', () => {
        const mockEvent = { checked: true, source: { value: 'admin' } }
        component.selectedUser(mockEvent)
        expect(component.selectedSystemRoles).toContain('admin')

        mockEvent.checked = false
        component.selectedUser(mockEvent)
        expect(component.selectedSystemRoles).not.toContain('admin')
    })

    it('should reset selected roles correctly', () => {
        component.rolesHash[0].selected = true
        component.selectedSystemRoles = ['admin', 'user']
        component.resetAllCheckedRole()
        expect(component.selectedSystemRoles).toEqual([])
        expect(component.rolesHash.every(r => !r.selected)).toBe(true)
    })

    it('should open the snack bar with the correct message', () => {
        component.isFetching = true
        ;(component as any).openSnackBar('Test Message')
        expect(snackBar.open).toHaveBeenCalledWith('Test Message', 'X', { duration: 3000 })
        expect(component.isFetching).toBe(false)
    })
})
