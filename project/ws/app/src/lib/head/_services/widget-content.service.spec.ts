import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { TestBed } from '@angular/core/testing'

import { WidgetContentService } from './widget-content.service'

describe('WidgetContentService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: ConfigurationsService, useValue: { sitePath: '' } },
    ],
  }))

  it('should be created', () => {
    const service: WidgetContentService = TestBed.inject(WidgetContentService)
    expect(service).toBeTruthy()
  })
})
