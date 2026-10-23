import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { Router } from '@angular/router'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatDialog } from '@angular/material/dialog'
import { MatMenuModule } from '@angular/material/menu'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { of } from 'rxjs'

import { KnowledgeCenterListComponent } from './knowledge-center-list.component'
import { DeveloperDocService } from '../../services/developer-doc.service'

describe('KnowledgeCenterListComponent', () => {
  let component: KnowledgeCenterListComponent
  let fixture: ComponentFixture<KnowledgeCenterListComponent>
  let developerDocService: any

  beforeEach(async () => {
    developerDocService = {
      getArticles: jest.fn().mockReturnValue(of({ result: { data: [], totalCount: 0 } })),
      deleteArticle: jest.fn().mockReturnValue(of({})),
      deleteSubCategory: jest.fn().mockReturnValue(of({})),
    }

    await TestBed.configureTestingModule({
      declarations: [KnowledgeCenterListComponent],
      imports: [MatMenuModule, NoopAnimationsModule],
      providers: [
        { provide: DeveloperDocService, useValue: developerDocService },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: MatSnackBar, useValue: { open: jest.fn(), openFromComponent: jest.fn() } },
        { provide: MatDialog, useValue: { open: jest.fn().mockReturnValue({ afterClosed: () => of(false) }) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents()

    fixture = TestBed.createComponent(KnowledgeCenterListComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should load articles on init', () => {
    expect(developerDocService.getArticles).toHaveBeenCalled()
  })
})
