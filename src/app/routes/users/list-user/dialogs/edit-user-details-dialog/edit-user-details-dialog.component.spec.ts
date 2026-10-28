import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { FormBuilder } from '@angular/forms'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { of, throwError } from 'rxjs'

import { EditUserDetailsDialogComponent } from './edit-user-details-dialog.component'
import { UsersService } from '../../../users.service'
import { IUserProfile } from '../../../models/users.models'

describe('EditUserDetailsDialogComponent', () => {
  let component: EditUserDetailsDialogComponent
  let fixture: ComponentFixture<EditUserDetailsDialogComponent>

  const baseUser: IUserProfile = {
    userId: 'u1',
    firstName: 'Orig',
    status: 1,
    profileDetails: {
      personalDetails: { firstname: 'Orig', primaryEmail: '', mobile: undefined, isCadre: false },
      professionalDetails: [{ group: 'G1', designation: 'D1' }],
      additionalProperties: {},
      cadreDetails: {},
    },
  }

  function setup(user: IUserProfile) {
    const mockDialogRef = { disableClose: false, close: jest.fn() }
    const mockSnackBar = { open: jest.fn() }
    const mockUsersService = {
      fetchGroups: jest.fn().mockReturnValue(of(null)),
      fetchCadreData: jest.fn().mockReturnValue(of(null)),
      extPatchUser: jest.fn(),
    }

    TestBed.configureTestingModule({
      declarations: [EditUserDetailsDialogComponent],
      providers: [
        FormBuilder,
        { provide: MAT_DIALOG_DATA, useValue: { user: JSON.parse(JSON.stringify(user)) } },
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: UsersService, useValue: mockUsersService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })

    fixture = TestBed.createComponent(EditUserDetailsDialogComponent)
    component = fixture.componentInstance
    component.ngOnInit()
    return { mockUsersService }
  }

  const flush = () => new Promise(resolve => setTimeout(resolve, 0))

  it('rejects with an Error when the personal-details patch fails', async () => {
    const { mockUsersService } = setup(baseUser)
    mockUsersService.extPatchUser.mockReturnValue(throwError(() => ({ message: 'boom', error: { params: { errmsg: 'failed' } } })))

    component.editForm.patchValue({ firstname: 'Changed' })
    component.onSubmit()
    await flush()

    expect(mockUsersService.extPatchUser).toHaveBeenCalled()
  })

  it('rejects with an Error when the cadre-details patch fails', async () => {
    const { mockUsersService } = setup(baseUser)
    mockUsersService.extPatchUser.mockReturnValue(throwError(() => ({ message: 'boom', error: { params: { errmsg: 'failed' } } })))

    component.editForm.patchValue({ isCadre: true })
    component.onSubmit()
    await flush()

    expect(mockUsersService.extPatchUser).toHaveBeenCalled()
  })

  it('rejects with an Error when the professional-details patch fails', async () => {
    const { mockUsersService } = setup(baseUser)
    mockUsersService.extPatchUser.mockReturnValue(throwError(() => ({ message: 'boom', error: { params: { errmsg: 'failed' } } })))

    component.editForm.patchValue({ group: 'G2' })
    component.onSubmit()
    await flush()

    expect(mockUsersService.extPatchUser).toHaveBeenCalled()
  })
})
