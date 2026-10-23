import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { TestBed } from '@angular/core/testing'

import { WidgetContentShareService } from './widget-content-share.service'

describe('WidgetContentShareService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: ConfigurationsService, useValue: { sitePath: '' } },
    ],
  }))

  it('should be created', () => {
    const service: WidgetContentShareService = TestBed.inject(WidgetContentShareService)
    expect(service).toBeTruthy()
  })
})
