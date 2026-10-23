import { UIDirectoryTableComponent } from './directory-table.component'
import { Router } from '@angular/router'
import { EventService } from '@sunbird-cb/utils-v2'
import { MatDialog } from '@angular/material/dialog'
import { CreateMDOService } from '../../../routes/home/services/create-mdo.services'
import { DesignationsService } from '../../../routes/create-mdo/routes/designation/services/designations.service'

import { of } from 'rxjs'
import { OrgHierarchyService } from '../services/org-hierarchy.service'
import { MatSnackBar } from '@angular/material/snack-bar'

describe('UIDirectoryTableComponent', () => {
    let component: UIDirectoryTableComponent
    let router: Router
    let events: EventService
    let dialog: MatDialog
    let createMdoService: CreateMDOService
    let designationsService: DesignationsService
    let orgHierarchyService: OrgHierarchyService
    let snackBar: MatSnackBar

    beforeEach(() => {
        router = { navigate: jest.fn() } as unknown as Router
        events = { raiseInteractTelemetry: jest.fn() } as unknown as EventService
        dialog = { open: jest.fn().mockReturnValue({ afterClosed: jest.fn().mockReturnValue(of({})) }) } as unknown as MatDialog
        createMdoService = {
            getStatesOrMinisteries: jest.fn().mockReturnValue(
                of({ result: { response: { content: [{ orgName: 'State2' }, { orgName: 'State1' }] } } })
            ),
        } as unknown as CreateMDOService
        designationsService = {
            getOrgReadData: jest.fn().mockReturnValue(of({ frameworkid: '123' })),
            getFrameworkInfo: jest.fn().mockReturnValue(
                of({ result: { framework: { categories: [{ terms: [{ associations: ['assoc1'] }] }] } } })
            ),
        } as unknown as DesignationsService
        orgHierarchyService = {} as unknown as OrgHierarchyService
        snackBar = { open: jest.fn() } as unknown as MatSnackBar

        component = new UIDirectoryTableComponent(
            router, events, dialog, designationsService, createMdoService, orgHierarchyService, snackBar
        )
    })

    it('should be created', () => {
        expect(component).toBeTruthy()
    })

    it('should emit pageChangeEvent on page change', () => {
        const pageChangeEventSpy = jest.spyOn(component.pageChangeEvent, 'emit')
        const event = { pageIndex: 1, pageSize: 20 }

        component.onOrgPageChange(event)

        expect(pageChangeEventSpy).toHaveBeenCalledWith(event)
    })

    it('should initialize dropdownList on ngOnInit', () => {
        component.ngOnInit()

        expect(createMdoService.getStatesOrMinisteries).toHaveBeenCalledWith('state')
        expect(createMdoService.getStatesOrMinisteries).toHaveBeenCalledWith('ministry')
        expect(component.dropdownList.statesList).toEqual([{ orgName: 'State1' }, { orgName: 'State2' }])
    })

    it('should reset filter and emit empty search when filter is cleared', () => {
        const filterSubjectSpy = jest.spyOn(component['filterSubject'], 'next')
        const searchSpy = jest.spyOn(component.searchByEnterKey, 'emit')

        component.applyFilter('')

        expect(filterSubjectSpy).toHaveBeenCalledWith('')
        expect(searchSpy).toHaveBeenCalledWith('')
    })

    it('should set moreThanTwoChar to true if filter value length > 2', () => {
        component.applyFilter('Test')
        expect(component.moreThanTwoChar).toBe(true)
    })

    it('should set moreThanTwoChar to false if filter value length <= 2', () => {
        component.applyFilter('T')
        expect(component.moreThanTwoChar).toBe(false)
    })

    it('should open dialog on generateCustRegistrationLink when frameworkId exists', () => {
        const row = { id: 1, qrRegistrationLink: '', registrationLink: '' }
        component.generateCustRegistrationLink(row)

        expect(designationsService.getOrgReadData).toHaveBeenCalledWith(row.id)
        expect(designationsService.getFrameworkInfo).toHaveBeenCalledWith('123')
        expect(dialog.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
            data: { type: 'import-igot-master-review' },
        }))
    })

    it('should emit buttonClickAction event when button is clicked', () => {
        const event = { action: 'create', row: {} }
        const buttonClickActionSpy = jest.spyOn(component, 'buttonClickAction')

        component.buttonClickAction(event)

        expect(buttonClickActionSpy).toHaveBeenCalledWith(event)
    })

    it('should toggle overlay visibility', () => {
        document.body.innerHTML = `<ws-app-home><mat-sidenav></mat-sidenav></ws-app-home>`
        const sidenav = document.querySelector('ws-app-home mat-sidenav') as HTMLElement

        component.toggleOverlay(true)
        expect(sidenav.style.zIndex).toBe('0')

        component.toggleOverlay(false)
        expect(sidenav.style.zIndex).toBe('2')
    })
})
