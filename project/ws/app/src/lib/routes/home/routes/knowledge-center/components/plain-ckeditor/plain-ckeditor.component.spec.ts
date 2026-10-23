jest.mock('ckeditor5', () => {
  class MockPlugin { }
  return {
    Alignment: MockPlugin,
    Bold: MockPlugin,
    ClassicEditor: class MockClassicEditor { },
    Essentials: MockPlugin,
    Indent: MockPlugin,
    IndentBlock: MockPlugin,
    Italic: MockPlugin,
    List: MockPlugin,
    Paragraph: MockPlugin,
    Strikethrough: MockPlugin,
    Subscript: MockPlugin,
    Superscript: MockPlugin,
    Underline: MockPlugin,
  }
}, { virtual: true })

import { ComponentFixture, TestBed } from '@angular/core/testing'
import { NO_ERRORS_SCHEMA } from '@angular/core'

import { PlainCkeditorComponent } from './plain-ckeditor.component'

describe('PlainCkeditorComponent', () => {
  let component: PlainCkeditorComponent
  let fixture: ComponentFixture<PlainCkeditorComponent>

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlainCkeditorComponent],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(PlainCkeditorComponent, '<div></div>')
      .compileComponents()

    fixture = TestBed.createComponent(PlainCkeditorComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should set html as-is when doRegex is false', () => {
    component.doRegex = false
    component.content = '<p>hello</p>'
    expect(component.html).toBe('<p>hello</p>')
  })

  it('should apply download regex when doRegex is true', () => {
    component.doRegex = true
    component.content = '<img src="https://host/content-store/a.png">'
    expect(component.html).toBe('<img src="https://host/content-store/a.png">')
  })

  it('should emit editor data on content change without regex', () => {
    const spy = jest.spyOn(component.value, 'emit')
    component.doRegex = false
    component.onContentChanged({ editor: { getData: () => '<p>data</p>' } })
    expect(component.html).toBe('<p>data</p>')
    expect(spy).toHaveBeenCalledWith('<p>data</p>')
  })

  it('should replace upload urls on content change with regex', () => {
    const spy = jest.spyOn(component.value, 'emit')
    component.doRegex = true
    component.onContentChanged({ editor: { getData: () => '<img src="/apis/authContent/a%20b.png">' } })
    expect(spy).toHaveBeenCalledWith('<img src="/a b.png">')
  })

  it('should emit onTouched on blur', () => {
    const spy = jest.spyOn(component.onTouched, 'emit')
    component.onBlur()
    expect(spy).toHaveBeenCalled()
  })
})
