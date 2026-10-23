import '@angular/localize/init'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'

import { InfoModalComponent } from './info-modal.component'

describe('InfoModalComponent', () => {
  let component: InfoModalComponent
  let fixture: ComponentFixture<InfoModalComponent>
  const dialogRef = { close: jest.fn() }

  beforeEach(() => {
    dialogRef.close.mockClear()
    TestBed.configureTestingModule({
      declarations: [InfoModalComponent],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { type: 'delete' } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    fixture = TestBed.createComponent(InfoModalComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('confirmed should close with isDelete true for delete type', () => {
    component.confirmed()
    expect(dialogRef.close).toHaveBeenCalledWith({ isDelete: true })
  })

  it('rejected should close with isDelete false for delete type', () => {
    component.rejected()
    expect(dialogRef.close).toHaveBeenCalledWith({ isDelete: false })
  })

  it('confirmed/rejected should handle other types', () => {
    component.data.type = 'import-igot-master-create'
    component.confirmed()
    expect(dialogRef.close).toHaveBeenLastCalledWith({ startImporting: true })
    component.rejected()
    expect(dialogRef.close).toHaveBeenLastCalledWith({ close: true })
    component.data.type = 'import-igot-master-review'
    component.confirmed()
    expect(dialogRef.close).toHaveBeenLastCalledWith({ reviewImporting: false })
    component.rejected()
    expect(dialogRef.close).toHaveBeenLastCalledWith({ reviewImporting: true })
    component.data.type = 'confirm'
    component.confirmed()
    expect(dialogRef.close).toHaveBeenLastCalledWith({ confirmed: true })
    component.rejected()
    expect(dialogRef.close).toHaveBeenLastCalledWith({ confirmed: false })
  })
})
