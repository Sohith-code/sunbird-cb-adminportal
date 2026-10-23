import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { of } from 'rxjs'

import { AddProviderCoursesComponent } from './add-provider-courses.component'

describe('AddProviderCoursesComponent', () => {
  let component: AddProviderCoursesComponent
  let fixture: ComponentFixture<AddProviderCoursesComponent>

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddProviderCoursesComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ providerDetails: { data: { result: { id: '1', name: 'provider' } } } }) },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    fixture = TestBed.createComponent(AddProviderCoursesComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set providerDetails from route data', () => {
    expect(component.providerDetails).toEqual({ id: '1', name: 'provider' })
  })
})
