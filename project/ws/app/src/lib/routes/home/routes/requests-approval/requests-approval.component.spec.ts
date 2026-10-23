import { RequestsApprovalComponent } from './requests-approval.component'
import { Router, ActivatedRoute } from '@angular/router'
import { RequestsService } from '../../services/onboarding-requests.service'
import { of } from 'rxjs'
import { RejectReasonDialogComponent } from '../reject-reason-dialog/reject-reason-dialog.component'
import { DialogConfirmComponent } from '../../../../../../../../../src/app/component/dialog-confirm/dialog-confirm.component'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'

describe('RequestsApprovalComponent', () => {
    let component: RequestsApprovalComponent
    let snackBar: jest.Mocked<MatSnackBar>
    let router: jest.Mocked<Router>
    let activatedRoute: jest.Mocked<ActivatedRoute>
    let requestService: jest.Mocked<RequestsService>
    let dialogue: jest.Mocked<MatDialog>

    beforeEach(() => {
        snackBar = {
            open: jest.fn(),
        } as any
        router = {
            navigate: jest.fn(),
            url: '/app/home/requests/position',
            getCurrentNavigation: jest.fn(() => ({
                extras: {
                    state: {
                        row: {
                            serviceName: 'position',
                            firstName: 'John',
                            email: 'john.doe@example.com',
                            mobile: '1234567890',
                            position: 'Manager',
                            description: 'Description',
                            wfId: '1',
                        },
                    },
                },
            })),
        } as any
        activatedRoute = {
            snapshot: {
                parent: {
                    data: {
                        configService: {
                            unMappedUser: {
                                firstName: 'John',
                                email: 'john.doe@example.com',
                                phone: '1234567890',
                            },
                        },
                    },
                },
            },
        } as any
        requestService = {
            approveNewPosition: jest.fn(() => of({})),
            approveNewOrg: jest.fn(() => of({})),
            approveNewDomain: jest.fn(() => of({})),
            addNewPosition: jest.fn(() => of({})),
        } as any
        dialogue = {
            open: jest.fn(() => ({
                afterClosed: jest.fn(() => of(true)),
            })),
        } as any

        component = new RequestsApprovalComponent(
            snackBar,
            router,
            activatedRoute,
            requestService,
            dialogue
        )
    })

    it('should create the component', () => {
        expect(component).toBeTruthy()
        expect(component.requestType).toBe('position')
        expect(component.positionForm.getRawValue().fullname).toBe('John')
        expect(component.positionForm.value.position).toBe('Manager')
    })

    it('should prefill user details from config for new position route', () => {
        (router as any).url = '/app/home/requests/new'
        const comp = new RequestsApprovalComponent(snackBar, router, activatedRoute, requestService, dialogue)
        expect(comp.newPosition).toBe(true)
        expect(comp.requestType).toBe('position')
        expect(comp.posData.mobile).toBe('1234567890')
    })

    it('should navigate back when approval dialog is cancelled', () => {
        dialogue.open.mockReturnValueOnce({ afterClosed: jest.fn(() => of(false)) } as any)
        component.onSubmit()
        expect(requestService.approveNewPosition).not.toHaveBeenCalled()
        expect(router.navigate).toHaveBeenCalledWith(['/app/home/requests/designation'])
    })

    it('should approve organisation requests', () => {
        component.requestType = 'organisation'
        component.onSubmit()
        expect(requestService.approveNewOrg).toHaveBeenCalled()
        expect(router.navigate).toHaveBeenCalledWith(['/app/home/requests/organisation'])
    })

    it('should call openSnackbar when onSubmit is successful', () => {
        component.posData = {
            firstName: 'John',
            email: 'john.doe@example.com',
            mobile: '1234567890',
            wfId: '1',
            applicationId: 'app123',
            userId: 'user123',
            actorUUID: 'actor123',
            deptName: 'HR',
        }
        component.requestType = 'position'
        component.positionForm.setValue({
            fullname: 'John Doe',
            email: 'john.doe@example.com',
            mobile: '1234567890',
            position: 'Manager',
            organisation: 'ABC Corp',
            domain: 'abc.com',
            description: 'Description',
            wfId: '1',
        })

        component.onSubmit()
        expect(dialogue.open).toHaveBeenCalledWith(DialogConfirmComponent, expect.any(Object))
        expect(requestService.approveNewPosition).toHaveBeenCalledWith(expect.objectContaining({
            state: 'IN_PROGRESS',
            action: 'APPROVE',
            serviceName: 'position',
        }))
        expect(snackBar.open).toHaveBeenCalledWith('Success!', 'X', { duration: 5000 })
        expect(router.navigate).toHaveBeenCalledWith(['/app/home/requests/designation'])
    })

    it('should navigate when rejectRequest is called', () => {
        component.rejectRequest()
        expect(dialogue.open).toHaveBeenCalledWith(RejectReasonDialogComponent, expect.any(Object))
        expect(requestService.approveNewPosition).toHaveBeenCalled()
        expect(router.navigate).toHaveBeenCalledWith(['/app/home/requests/designation'])
    })

    it('should call openSnackbar when addNewPosistion is successful', () => {
        component.posData = {
            firstName: 'John',
            email: 'john.doe@example.com',
            mobile: '1234567890',
            wfId: '1',
            applicationId: 'app123',
            userId: 'user123',
            actorUUID: 'actor123',
            deptName: 'HR',
        }
        component.positionForm.setValue({
            fullname: 'John Doe',
            email: 'john.doe@example.com',
            mobile: '1234567890',
            position: 'Manager',
            organisation: 'ABC Corp',
            domain: 'abc.com',
            description: 'Description',
            wfId: '1',
        })

        component.addNewPosistion()
        expect(dialogue.open).toHaveBeenCalledWith(DialogConfirmComponent, expect.any(Object))
        expect(requestService.addNewPosition).toHaveBeenCalledWith(expect.objectContaining({
            request: {
                contextType: 'position',
                contextName: 'Manager',
                contextData: 'Description',
            },
        }))
        expect(snackBar.open).toHaveBeenCalledWith('Success!', 'X', { duration: 5000 })
        expect(router.navigate).toHaveBeenCalledWith(['/app/home/requests/designation'])
    })
})
