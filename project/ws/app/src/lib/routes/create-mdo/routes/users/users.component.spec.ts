
import { Router, ActivatedRoute } from '@angular/router'
import { ProfileV2UtillService } from '../../../home/services/home-utill.service'
import { ProfileV2Service } from '../../../home/services/home.servive'
import { UsersService } from '../../../home/services/users.service'
import { LoaderService } from '../../../home/services/loader.service'
import { OrgHierarchyService } from '../../../../head/ui-admin-table/services/org-hierarchy.service'
import { UsersComponent } from './users.component'

describe('UsersComponent', () => {
    let component: UsersComponent

    const usersSvc: Partial<UsersService> = {}
    const router: Partial<Router> = {}
    const route: Partial<ActivatedRoute> = {}
    const profile: Partial<ProfileV2Service> = {}
    const profileUtilSvc: Partial<ProfileV2UtillService> = {}
    const usersService: Partial<UsersService> = {}
    const orgHieService: Partial<OrgHierarchyService> = {}
    const loaderService: Partial<LoaderService> = {}

    beforeAll(() => {
        component = new UsersComponent(
            usersSvc as UsersService,
            router as Router,
            route as ActivatedRoute,
            profile as ProfileV2Service,
            profileUtilSvc as ProfileV2UtillService,
            usersService as UsersService,
            orgHieService as OrgHierarchyService,
            loaderService as LoaderService
        )
    })

    beforeEach(() => {
        jest.clearAllMocks()
        jest.resetAllMocks()
    })

    it('should create a instance of component', () => {
        expect(component).toBeTruthy()
    })
})
