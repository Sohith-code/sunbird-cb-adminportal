import { UsersComponent } from './users.component'
import { of, throwError } from 'rxjs'

describe('UsersComponent', () => {
    let component: UsersComponent
    let snackBar: any
    let dialog: any
    let activatedRoute: any
    let rolesSvc: any
    let tenantAdminSvc: any

    const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0))
    const user = { wid: '123', department_name: 'HR', email: '', first_name: '', last_name: '', root_org: '' } as any

    beforeEach(() => {
        snackBar = { open: jest.fn() }
        dialog = { open: jest.fn() }
        activatedRoute = {
            parent: {
                parent: {
                    data: of({
                        featureData: {
                            data: {
                                roleList: {
                                    admin: 'Admin role',
                                    user: 'User role',
                                },
                            },
                        },
                    }),
                },
            },
        }
        rolesSvc = { checkUser: jest.fn() }
        tenantAdminSvc = { getUserDepartments: jest.fn().mockReturnValue(Promise.resolve([])) }

        component = new UsersComponent(snackBar, dialog, activatedRoute, rolesSvc, tenantAdminSvc)
    })

    it('should create the component', () => {
        expect(component).toBeTruthy()
    })

    it('should initialize role list from route data', () => {
        expect(component.roleList).toEqual(['admin', 'user'])
        expect(component.rolesHash['admin']).toEqual({ about: 'Admin role', hasRole: false, isSelected: false })
    })

    it('should call getUserDepartments on ngOnInit and collect department names', async () => {
        tenantAdminSvc.getUserDepartments.mockResolvedValue([{ department_name: 'IT' }, { department_name: 'HR' }])
        const spy = jest.spyOn(component, 'getUserDepartments')
        component.ngOnInit()
        await flushPromises()
        expect(spy).toHaveBeenCalled()
        expect(component.departments).toEqual(['IT', 'HR'])
    })

    it('should swallow errors while fetching departments', async () => {
        tenantAdminSvc.getUserDepartments.mockReturnValue(Promise.reject('err'))
        component.getUserDepartments()
        await flushPromises()
        expect(component.departments).toEqual([])
    })

    it('should add a user and emit selectedUser event', () => {
        rolesSvc.checkUser.mockReturnValue(of({ user_roles: ['admin', 'unknown'], default_roles: [] }))
        const spyEmit = jest.spyOn(component.selectedUser, 'emit')

        component.addUser(user)

        expect(rolesSvc.checkUser).toHaveBeenCalledWith(user.wid)
        expect(component.userDetails[user.wid].roles).toEqual(['admin'])
        expect(component.userIds).toEqual(['123'])
        expect(component.isAdding).toBe(false)
        expect(spyEmit).toHaveBeenCalledWith(user)
    })

    it('should handle error when adding user', () => {
        rolesSvc.checkUser.mockReturnValue(throwError('Error'))

        component.addUser(user)

        expect(component.isAdding).toBe(false)
        expect(component.userDetails[user.wid]).toBeUndefined()
    })

    it('should remove a user from userDetails', () => {
        component.userDetails[user.wid] = { roles: ['admin'] }
        component.userIds = ['123']

        component.removeUser(user)

        expect(component.userDetails[user.wid]).toBeUndefined()
        expect(component.userIds).not.toContain(user.wid)
    })

    it('should open roles dialog and handle dialog close with new roles', () => {
        component.userDetails['123'] = { roles: ['admin'] }
        dialog.open.mockImplementation((_c: any, config: any) => {
            expect(config.data.rolesData.admin.isSelected).toBe(true)
            return { afterClosed: () => of({ wid: '123', newRoles: ['user'], addingError: false, removingError: false }) }
        })

        component.openDialog('123')

        expect(dialog.open).toHaveBeenCalled()
        expect(component.userDetails['123'].roles).toEqual(['user'])
        expect(snackBar.open).toHaveBeenCalledWith('Changes Saved', 'X', { duration: 2000 })
        expect(component.rolesHash.admin.isSelected).toBe(false)
    })

    it('should show error messages based on dialog result', () => {
        component.userDetails['123'] = { roles: [] }
        const results = [
            [{ addingError: true, removingError: true }, 'Error Occured'],
            [{ addingError: true, removingError: false }, 'Error Occured adding roles'],
            [{ addingError: false, removingError: true }, 'Error Occured removing roles'],
        ]
        results.forEach(([flags, msg]: any) => {
            dialog.open.mockReturnValue({ afterClosed: () => of({ wid: '123', newRoles: [], ...flags }) })
            component.openDialog('123')
            expect(snackBar.open).toHaveBeenLastCalledWith(msg, 'X', { duration: 2000 })
        })
    })

    it('should open department dialog and update user department', () => {
        component.userDetails['123'] = { ...user }
        dialog.open.mockReturnValue({ afterClosed: () => of({ userId: '123', department: 'Finance' }) })

        component.openDepartmentDialog('123', 'HR')

        expect(dialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
            data: { department: 'HR', userId: '123' },
        }))
        expect(component.userDetails['123'].department_name).toBe('Finance')
    })
})
