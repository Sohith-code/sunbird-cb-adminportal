import { CreateUserV2Component } from './create-userV2.component'
import { of, throwError } from 'rxjs'
import { UntypedFormGroup } from '@angular/forms'

describe('CreateUserV2Component', () => {
    let component: CreateUserV2Component
    let snackBarMock: any
    let tenantAdminSvcMock: any

    const flushPromises = () => new Promise(resolve => setTimeout(resolve, 0))

    beforeEach(() => {
        snackBarMock = { open: jest.fn() }
        tenantAdminSvcMock = {
            createUser: jest.fn(),
            getUserDepartments: jest.fn().mockReturnValue(Promise.resolve([])),
        }

        component = new CreateUserV2Component(snackBarMock, tenantAdminSvcMock)
        component.toastSuccess = { nativeElement: { value: 'Success message' } } as any
        component.toastError = { nativeElement: { value: 'Error message' } } as any
    })

    it('should create the component', () => {
        expect(component).toBeTruthy()
    })

    it('should initialize form with controls', () => {
        expect(component.createUserForm).toBeInstanceOf(UntypedFormGroup)
        expect(component.createUserForm.controls['fname']).toBeDefined()
        expect(component.createUserForm.controls['lname']).toBeDefined()
        expect(component.createUserForm.controls['email']).toBeDefined()
        expect(component.createUserForm.controls['department']).toBeDefined()
        expect(component.createUserForm.valid).toBe(false)
    })

    it('should call getUserDepartments on ngOnInit', () => {
        const getUserDepartmentsSpy = jest.spyOn(component, 'getUserDepartments')
        component.ngOnInit()
        expect(getUserDepartmentsSpy).toHaveBeenCalled()
        expect(tenantAdminSvcMock.getUserDepartments).toHaveBeenCalled()
    })

    it('should unsubscribe on ngOnDestroy when subscription is open', () => {
        component.unseenCtrlSub = { unsubscribe: jest.fn(), closed: false } as any
        component.ngOnDestroy()
        expect(component.unseenCtrlSub.unsubscribe).toHaveBeenCalled()
    })

    it('should not unsubscribe on ngOnDestroy when subscription is closed', () => {
        component.unseenCtrlSub = { unsubscribe: jest.fn(), closed: true } as any
        component.ngOnDestroy()
        expect(component.unseenCtrlSub.unsubscribe).not.toHaveBeenCalled()
    })

    it('should submit form and handle success', () => {
        const formData = { fname: 'John', lname: 'Doe', email: 'john.doe@example.com', department: 'HR' }
        const form = { value: formData, reset: jest.fn() }

        tenantAdminSvcMock.createUser.mockReturnValue(of({}))

        component.onSubmit(form)

        expect(tenantAdminSvcMock.createUser).toHaveBeenCalledWith(formData)
        expect(form.reset).toHaveBeenCalled()
        expect(snackBarMock.open).toHaveBeenCalledWith('Success message', 'X', { duration: 5000 })
        expect(component.uploadSaveData).toBe(false)
    })

    it('should submit form and handle error', () => {
        const formData = { fname: 'John', lname: 'Doe', email: 'john.doe@example.com', department: 'HR' }
        const form = { value: formData, reset: jest.fn() }

        tenantAdminSvcMock.createUser.mockReturnValue(throwError({ error: 'Error: Something went wrong' }))

        component.onSubmit(form)

        expect(form.reset).not.toHaveBeenCalled()
        expect(snackBarMock.open).toHaveBeenCalledWith(' Something went wrong', 'X', { duration: 5000 })
        expect(component.uploadSaveData).toBe(false)
    })

    it('should fetch departments on getUserDepartments success', async () => {
        const departments = ['HR', 'Engineering', 'Marketing']
        tenantAdminSvcMock.getUserDepartments.mockReturnValue(Promise.resolve(departments))

        component.getUserDepartments()
        expect(component.fetching).toBe(true)
        await flushPromises()

        expect(component.fetching).toBe(false)
        expect(component.departments).toEqual(departments)
    })

    it('should handle error in getUserDepartments', async () => {
        tenantAdminSvcMock.getUserDepartments.mockReturnValue(Promise.reject('Error fetching departments'))

        component.getUserDepartments()
        await flushPromises()

        expect(component.fetching).toBe(false)
        expect(component.departments).toEqual([])
    })
})
