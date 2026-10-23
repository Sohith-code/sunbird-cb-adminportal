import { FilterDisplayComponent } from './filter-display.component'
import { SearchServService } from '../../services/search-serv.service'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { Router, ActivatedRoute } from '@angular/router'
import { of } from 'rxjs'

export interface IFilterUnitResponse {
    id: string
    type: string
    displayName: string
    content: string
}

describe('FilterDisplayComponent', () => {
    let component: FilterDisplayComponent
    let mockSearchServ: jest.Mocked<SearchServService>
    let mockConfigSvc: jest.Mocked<ConfigurationsService>
    let mockRouter: jest.Mocked<Router>
    let mockActivatedRoute: jest.Mocked<ActivatedRoute>


    beforeEach(() => {
        // Mock the services
        mockSearchServ = {
            translateSearchFilters: jest.fn().mockResolvedValue({}),
        } as any

        mockConfigSvc = {
            userPreference: { selectedLocale: 'en' },
        } as any

        mockRouter = {
            navigate: jest.fn(),
        } as any

        mockActivatedRoute = {
            queryParamMap: of({ has: jest.fn(() => false), get: jest.fn(() => null) }),
            parent: { snapshot: { data: { searchPageData: { data: { search: { tabs: [] } } } } } },
        } as any

        // Create the component instance
        component = new FilterDisplayComponent(
            mockActivatedRoute,
            mockRouter,
            mockSearchServ,
            mockConfigSvc
        )
    })

    it('should create the component', () => {
        expect(component).toBeTruthy()
    })

    it('should translate filters on init', async () => {
        const translatedFilters: any = { Test: { value: { Child: { value: '' } } } }
        mockSearchServ.translateSearchFilters.mockResolvedValue(translatedFilters)

        component.ngOnInit()
        await new Promise(resolve => setTimeout(resolve, 0))

        expect(mockSearchServ.translateSearchFilters).toHaveBeenCalledWith('en')
        expect(component.translatedFilters).toBe(translatedFilters)
        // keys are duplicated in lower case (recursively)
        expect(component.translatedFilters.test).toEqual(translatedFilters.Test)
        expect(component.translatedFilters.Test.value.child).toEqual({ value: '' })
    })

    it('should initialize advanced filters from route data', () => {
        component.routeComp = 'testRoute'
        ;(mockActivatedRoute.parent as any).snapshot.data.searchPageData.data.search.tabs = [
            {
                titleKey: 'testRoute',
                searchQuery: {
                    advancedFilters: [{ filterType: 'testFilter' }],
                },
            },
        ]

        component.ngOnInit()

        expect(component.advancedFilters).toEqual([{ filterType: 'testFilter' }])
    })

    it('should apply filter and update filters in the URL', () => {
        // Ensure the mock filter unit object matches IFilterUnitItem structure
        const filterUnitObject = {
            unitFilter: { type: 'test', displayName: 'Test Filter', count: 10 },  // Added missing properties
            filterType: 'type'
        }
        component.searchRequest.filters = { type: ['oldValue'] }

        component.applyFilters(filterUnitObject)

        expect(mockRouter.navigate).toHaveBeenCalledWith([], {
            queryParams: { f: '{"type":["oldValue","test"]}' },
            relativeTo: mockActivatedRoute.parent,
            queryParamsHandling: 'merge',
        })
    })

    it('should remove filter and update filters in the URL', () => {
        const filterUnitObject = {
            unitFilter: { type: 'test', displayName: 'Test Filter', count: 10 },  // Added missing properties
            filterType: 'type'
        }
        component.searchRequest.filters = { type: ['test'] }

        component.applyFilters(filterUnitObject)

        expect(mockRouter.navigate).toHaveBeenCalledWith([], {
            queryParams: { f: '{}' },
            relativeTo: mockActivatedRoute.parent,
            queryParamsHandling: 'merge',
        })
    })

    it('should handle advanced filter click and navigate to the correct URL', () => {
        // Updated the object to match the IWsSearchAdvancedFilter structure
        const filter: any = {
            title: 'Advanced Filter 1', // Adding the required 'title' property
            filters: { type: ['test'] } // Ensuring filters are structured correctly
        }

        component.advancedFilterClick(filter)

        // Assert that the navigate function is called with the correct URL
        expect(mockRouter.navigate).toHaveBeenCalledWith([], {
            queryParams: { f: '{"type":["test"]}' },
            relativeTo: mockActivatedRoute.parent,
            queryParamsHandling: 'merge',
        })
    })


    it('should remove all filters from the URL', () => {
        component.removeFilters()

        expect(mockRouter.navigate).toHaveBeenCalledWith([], {
            queryParams: { f: null },
            queryParamsHandling: 'merge',
            relativeTo: mockActivatedRoute.parent,
        })
    })

    it('should lowercase filter keys correctly', () => {
        const filterObj: any = { TEST: { value: { INNER: { value: '' } } } }
        const filterKeys = ['TEST']
        component.lowerCaseFilter(filterObj, filterKeys)

        expect(filterObj.TEST).toBeTruthy()
        expect(filterObj.test).toBe(filterObj.TEST)
        expect(filterObj.TEST.value.inner).toEqual({ value: '' })
    })
    it('should track filter unit by ID', () => {
        // Update the object to match the IFilterUnitResponse structure
        const filterResponse: any = {
            id: 'filter1',
            type: 'type1',
            displayName: 'Test Filter',
            content: 'Some content'
        }

        expect(component.filterUnitResponseTrackBy(filterResponse)).toBe('filter1')
    })
})
