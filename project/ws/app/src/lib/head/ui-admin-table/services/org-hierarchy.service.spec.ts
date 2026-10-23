import { provideHttpClient } from '@angular/common/http'
import { provideHttpClientTesting } from '@angular/common/http/testing'
import { TestBed } from '@angular/core/testing';

import { OrgHierarchyService } from './org-hierarchy.service';

describe('OrgHierarchyService', () => {
  let service: OrgHierarchyService;

  beforeEach(() => {
    TestBed.configureTestingModule({
    providers: [provideHttpClient(), provideHttpClientTesting()],
  });
    service = TestBed.inject(OrgHierarchyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
