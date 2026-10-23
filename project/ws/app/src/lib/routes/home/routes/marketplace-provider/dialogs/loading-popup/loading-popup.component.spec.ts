import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

import { LoadingPopupComponent } from './loading-popup.component'

describe('LoadingPopupComponent', () => {
  let component: LoadingPopupComponent
  let fixture: ComponentFixture<LoadingPopupComponent>
  let dialogRef: { close: jest.Mock }

  beforeEach(() => {
    dialogRef = { close: jest.fn() }
    TestBed.configureTestingModule({
      declarations: [LoadingPopupComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { message: 'Loading' } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    fixture = TestBed.createComponent(LoadingPopupComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should close the dialog with the event', () => {
    component.closePopup(true)
    expect(dialogRef.close).toHaveBeenCalledWith(true)
  })
})
