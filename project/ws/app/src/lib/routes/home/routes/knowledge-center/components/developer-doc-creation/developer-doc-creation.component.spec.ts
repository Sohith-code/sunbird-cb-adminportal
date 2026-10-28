import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'
import { FormBuilder } from '@angular/forms'
import { ActivatedRoute, Router } from '@angular/router'
import { MatSnackBar } from '@angular/material/snack-bar'
import { of } from 'rxjs'

import { DeveloperDocCreationComponent } from './developer-doc-creation.component'
import { DeveloperDocService } from '../../services/developer-doc.service'
import { GlobalEventsService } from '../../../../../../../../../../../src/app/services/global-events.service'

describe('DeveloperDocCreationComponent', () => {
  let component: DeveloperDocCreationComponent
  let fixture: ComponentFixture<DeveloperDocCreationComponent>
  let developerDocService: any

  beforeEach(async () => {
    developerDocService = {
      getArticles: jest.fn().mockReturnValue(of({ result: { data: [] } })),
      createSubCategory: jest.fn().mockReturnValue(of({})),
      updateSubCategory: jest.fn().mockReturnValue(of({})),
      createArticle: jest.fn().mockReturnValue(of({})),
      updateArticle: jest.fn().mockReturnValue(of({})),
      deleteArticle: jest.fn().mockReturnValue(of({})),
      publishSubCategory: jest.fn().mockReturnValue(of({})),
      publishArticle: jest.fn().mockReturnValue(of({})),
    }

    await TestBed.configureTestingModule({
      declarations: [DeveloperDocCreationComponent],
      providers: [
        FormBuilder,
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: DeveloperDocService, useValue: developerDocService },
        { provide: MatSnackBar, useValue: { open: jest.fn(), openFromComponent: jest.fn() } },
        { provide: GlobalEventsService, useValue: { setLoaderState: jest.fn() } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents()

    fixture = TestBed.createComponent(DeveloperDocCreationComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should be in create mode when no id query param is present', () => {
    expect(component.mode).toBe('create')
    expect(component.articleId).toBeNull()
    expect(component.subCategoryForm).toBeTruthy()
  })

  describe('stripHtml', () => {
    it('should remove html tags and decode &nbsp;', () => {
      expect(component.stripHtml('<p>Hello&nbsp;<strong>World</strong></p>')).toBe('Hello World')
    })

    it('should collapse whitespace and trim', () => {
      expect(component.stripHtml('<p>  Hello   </p>\n<p> World </p>')).toBe('Hello World')
    })

    it('should return an empty string for empty input', () => {
      expect(component.stripHtml('')).toBe('')
      expect(component.stripHtml(null as any)).toBe('')
    })

    it('should handle a long string of unclosed tags quickly', () => {
      const start = Date.now()
      const input = '<'.repeat(50000)
      expect(component.stripHtml(input)).toBe(input)
      expect(Date.now() - start).toBeLessThan(1000)
    })
  })
})
