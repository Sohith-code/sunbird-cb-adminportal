import { TestBed } from '@angular/core/testing'
import { APP_BASE_HREF } from '@angular/common'
import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'

import { DeveloperDocService } from './developer-doc.service'

describe('DeveloperDocService', () => {
  let service: DeveloperDocService

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: APP_BASE_HREF, useValue: '/' },
      ],
    })
    service = TestBed.inject(DeveloperDocService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
