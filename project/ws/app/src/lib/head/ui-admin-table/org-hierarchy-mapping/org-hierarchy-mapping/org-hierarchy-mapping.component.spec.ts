import '@angular/localize/init'
import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core'
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatSelectModule } from '@angular/material/select'
import { ReactiveFormsModule } from '@angular/forms'
import { NoopAnimationsModule } from '@angular/platform-browser/animations'
import { MatDialog } from '@angular/material/dialog'
import { ActivatedRoute, Router } from '@angular/router'
import { of, throwError } from 'rxjs'

import { OrgHierarchyMappingComponent } from './org-hierarchy-mapping.component'
import { OrgHierarchyService } from '../../services/org-hierarchy.service'
import { GlobalEventsService } from '../../../../../../../../../src/app/services/global-events.service'

@Pipe({ name: 'orderBy', standalone: false })
class MockOrderByPipe implements PipeTransform {
  transform(value: any): any {
    return value
  }
}

describe('OrgHierarchyMappingComponent', () => {
  let component: OrgHierarchyMappingComponent
  let fixture: ComponentFixture<OrgHierarchyMappingComponent>
  let orgHieService: any
  let loaderService: any
  let snackbar: any
  let router: any
  let dialog: any
  let activatedRoute: any

  const orgs = [
    { identifier: 'o1', orgName: 'Alpha', orgHierarchyFrameworkId: 'fw1' },
    { identifier: 'o2', orgName: 'Beta' },
  ]

  function setup(userRoles: Set<string>) {
    orgHieService = {
      getCenterOrStateList: jest.fn().mockReturnValue(of({ result: { response: { content: orgs } } })),
      getOrgReadData: jest.fn().mockReturnValue(of({
        params: { status: 'SUCCESS' },
        result: { response: { id: 'state-1', sbOrgType: 'state', ministryOrStateId: 'ms-1', orgHierarchyFrameworkId: 'fw-s' } },
      })),
      getOrganizationDetails: jest.fn().mockReturnValue(of({ result: { content: [{ id: 'child' }] } })),
      createMasterFrameWork: jest.fn().mockReturnValue(of({ result: { framework: {} } })),
      downloadSampleTemplate: jest.fn().mockReturnValue(of({})),
      exportFramework: jest.fn().mockReturnValue(of({})),
      uploadFreameworkTemplate: jest.fn().mockReturnValue(of({ result: { fileName: 'f.xlsx' } })),
    }
    loaderService = { setLoaderState: jest.fn() }
    snackbar = { open: jest.fn() }
    router = { navigate: jest.fn() }
    dialog = { open: jest.fn().mockReturnValue({ afterClosed: () => of(true) }) }
    activatedRoute = {
      snapshot: { parent: { data: { configService: { userRoles, userProfile: { rootOrgId: 'root-1' } } } } },
    }

    TestBed.configureTestingModule({
      imports: [MatSelectModule, ReactiveFormsModule, NoopAnimationsModule],
      declarations: [OrgHierarchyMappingComponent, MockOrderByPipe],
      providers: [
        { provide: MatSnackBar, useValue: snackbar },
        { provide: OrgHierarchyService, useValue: orgHieService },
        { provide: GlobalEventsService, useValue: loaderService },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: MatDialog, useValue: dialog },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents()

    fixture = TestBed.createComponent(OrgHierarchyMappingComponent)
    component = fixture.componentInstance
  }

  describe('as SPV admin', () => {
    beforeEach(waitForAsync(() => {
      setup(new Set(['spv_admin']))
      fixture.detectChanges()
    }))

    it('should create and fetch organisations for default org type', async () => {
      expect(component).toBeTruthy()
      await fixture.whenStable()
      expect(orgHieService.getCenterOrStateList).toHaveBeenCalledWith(
        expect.objectContaining({ request: expect.objectContaining({ filters: { status: 1, sbOrgType: 'state' } }) })
      )
      expect(component.filteredOrganizations).toEqual(orgs)
      expect(component.checkIfStateAdmin()).toBe(false)
    })

    it('should filter organisations by name', async () => {
      await fixture.whenStable()
      component.filterOrganizations('alp')
      expect(component.filteredOrganizations).toEqual([orgs[0]])
      component.filterOrganizations('')
      expect(component.filteredOrganizations).toEqual(orgs)
    })

    it('should refetch when org type changes', () => {
      orgHieService.getCenterOrStateList.mockClear()
      component.orgSelected('ministry')
      expect(component.selectedOrgType).toBe('ministry')
      expect(orgHieService.getCenterOrStateList).toHaveBeenCalledWith(
        expect.objectContaining({ request: expect.objectContaining({ filters: { status: 1, sbOrgType: 'ministry' } }) })
      )
    })

    it('should clear lists when no organisations returned', async () => {
      orgHieService.getCenterOrStateList.mockReturnValue(of({ result: { response: { content: [] } } }))
      await component.getCentenrOrStateList('state')
      expect(component.allOrganizations).toEqual([])
      expect(component.filteredOrganizations).toEqual([])
    })

    it('should resolve selected org details and framework id', async () => {
      await fixture.whenStable()
      expect(component.getOrgDetails()).toBeNull()
      expect(component.hasOrgHierarchyFrameworkId()).toBe(false)
      component.organizationCtrl.setValue('o1')
      expect(component.getOrgDetails()).toEqual(orgs[0])
      expect(component.hasOrgHierarchyFrameworkId()).toBe(true)
      expect(component.getselectedOrgData()).toEqual(orgs[0])
      component.organizationCtrl.setValue('o2')
      expect(component.hasOrgHierarchyFrameworkId()).toBe(false)
    })

    it('should create new hierarchy', async () => {
      await fixture.whenStable()
      jest.useFakeTimers()
      try {
        component.organizationCtrl.setValue('o2')
        await component.createNewHierarchy()
        expect(orgHieService.createMasterFrameWork).toHaveBeenCalledWith({ frameworkName: 'org_hierarchy', identifier: 'o2' })
        jest.advanceTimersByTime(2000)
        expect(snackbar.open).toHaveBeenCalledWith('Framework created successfully for Beta')
      } finally {
        jest.useRealTimers()
      }
    })

    it('should show failure message when framework creation fails', async () => {
      await fixture.whenStable()
      orgHieService.createMasterFrameWork.mockReturnValue(throwError({ error: { params: { errMsg: 'boom' } } }))
      component.organizationCtrl.setValue('o2')
      await component.createNewHierarchy()
      expect(snackbar.open).toHaveBeenCalledWith('boom')
      expect(snackbar.open).toHaveBeenCalledTimes(2)
    })

    it('should navigate to users of an org on redirectOrg', async () => {
      orgHieService.getCenterOrStateList.mockReturnValue(of({ result: { response: { content: [{ organisationType: 2 }] } } }))
      await component.redirectOrg({ name: 'Alpha', additionalProperties: { orgId: 'o1' } })
      expect(router.navigate).toHaveBeenCalledWith(['/app/roles/o1/users'], {
        queryParams: expect.objectContaining({ roleId: 'o1', subOrgType: 'state', organisationType: 2 }),
      })
    })

    it('should download template and export data', async () => {
      await fixture.whenStable()
      component.organizationCtrl.setValue('o1')
      await component.downloadTemplate()
      expect(orgHieService.downloadSampleTemplate).toHaveBeenCalledWith('fw1')
      expect(snackbar.open).toHaveBeenCalledWith('Download successfully')
      await component.exportData()
      expect(orgHieService.exportFramework).toHaveBeenCalledWith('fw1')
      expect(snackbar.open).toHaveBeenCalledWith('Exported successfully for Alpha')
    })

    it('should validate and upload files', async () => {
      component.onFileSelected({ target: { files: [{ type: 'text/plain', size: 1 }] } })
      expect(snackbar.open).toHaveBeenCalledWith('Please select a valid Excel file (.xlsx)', 'Close', { duration: 5000 })

      const file = new File(['x'], 'f.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      await component.uploadExcelFile(file)
      expect(orgHieService.uploadFreameworkTemplate).toHaveBeenCalled()
      expect(snackbar.open).toHaveBeenCalledWith('File uploaded successfully. Please check after 5 minutes for the results.')
    })

    it('should open bulk upload dialog and refresh after close', async () => {
      component.openBulkUploadDialog()
      expect(dialog.open).toHaveBeenCalled()
      await new Promise(resolve => setTimeout(resolve, 0))
      expect(component.bulkUploadRefresh).toBe(false)
    })
  })

  describe('as state admin', () => {
    beforeEach(waitForAsync(() => {
      setup(new Set(['state_admin']))
      fixture.detectChanges()
    }))

    it('should read org and fetch org details', () => {
      expect(component.checkIfStateAdmin()).toBe(true)
      expect(orgHieService.getOrgReadData).toHaveBeenCalledWith({ request: { organisationId: 'root-1' } })
      expect(orgHieService.getOrganizationDetails).toHaveBeenCalledWith({
        request: { filters: { status: 1, ministryOrStateType: 'state', ministryOrStateId: 'ms-1' } },
      })
      expect(component.orgSearchData).toEqual([{ id: 'child' }])
      expect(component.organizationCtrl.value).toBe('ms-1')
      expect(component.getselectedOrgData()).toEqual(component.orgReadData)
    })
  })
})
