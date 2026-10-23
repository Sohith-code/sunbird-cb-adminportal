import { EventsListComponent } from './events-list.component'
import moment from 'moment'
import { of } from 'rxjs'

// Mock the dependencies
jest.mock('@angular/material/dialog')
jest.mock('@angular/material/snack-bar')
jest.mock('@angular/router')
jest.mock('@sunbird-cb/utils-v2')
jest.mock('../services/events.service')

describe('EventsListComponent', () => {
    let component: EventsListComponent
    let mockDialog: any
    let mockActivatedRoute: any
    let mockConfigService: any
    let mockRouter: any
    let mockEventService: any
    let mockEventsService: any
    let mockDialogue: any
    let mockSnackBar: any

    beforeEach(() => {
        // Setup mock dependencies
        mockDialog = {
            open: jest.fn()
        }

        mockActivatedRoute = {
            snapshot: {
                data: {
                    configService: {
                        userProfile: {
                            userId: 'test-user-id',
                            departmentName: 'test-department',
                            rootOrgId: 'test-org-id'
                        }
                    }
                }
            }
        }

        mockConfigService = {
            userProfile: {
                userId: 'test-user-id',
                departmentName: 'test-department',
                rootOrgId: 'test-org-id'
            }
        }

        mockRouter = {
            navigate: jest.fn()
        }

        mockEventService = {
            handleTabTelemetry: jest.fn()
        }

        mockEventsService = {
            getEventsList: jest.fn().mockReturnValue(of({
                result: {
                    Event: []
                }
            })),
            retireEvent: jest.fn().mockReturnValue(of({
                responseCode: 'OK'
            }))
        }

        mockDialogue = {
            open: jest.fn().mockReturnValue({
                afterClosed: jest.fn().mockReturnValue(of(true))
            })
        }

        mockSnackBar = {
            open: jest.fn()
        }

        // Create component instance
        component = new EventsListComponent(
            mockDialog,
            mockActivatedRoute,
            mockConfigService,
            mockRouter,
            mockEventService,
            mockEventsService,
            mockDialogue,
            mockSnackBar
        )
    })

    it('should create the component', () => {
        expect(component).toBeTruthy()
    })

    it('should initialize with correct default values', () => {
        expect(component.currentFilter).toBe('upcoming')
        expect(component.currentUser).toBe('test-user-id')
        expect(component.department).toBe('test-department')
        expect(component.departmentID).toBe('test-org-id')
    })

    it('should initialize table data in ngOnInit', () => {
        component.ngOnInit()
        expect(component.tabledata).toEqual({
            actions: [],
            columns: [
                { displayName: 'Event title', key: 'eventName' },
                { displayName: 'Date and time', key: 'eventStartDate' },
                { displayName: 'Created on', key: 'eventCreatedOn' },
                { displayName: 'Duration', key: 'eventDuration' },
                { displayName: 'Presenters', key: 'eventjoined' },
            ],
            needCheckBox: false,
            needHash: false,
            needUserMenus: true,
        })
    })

    it('should fetch upcoming events on init', () => {
        component.ngOnInit()
        expect(mockEventsService.getEventsList).toHaveBeenCalledWith({
            locale: ['en'],
            request: {
                query: '',
                limit: 20,
                offset: 0,
                filters: {
                    status: ['Live'],
                    contentType: 'Event',
                    createdFor: 'test-org-id',
                    endDateTime: { '>=': expect.any(String) },
                },
                sort_by: {
                    lastUpdatedOn: 'desc',
                },
            },
        })
    })

    it('should format date correctly', () => {
        const date = '2023-01-01'
        const time = '10:00:00+05:30'
        const formattedDate = component.customDateFormat(date, time)
        expect(formattedDate).toMatch(/\d{1,2}(st|nd|rd|th) \w{3} \d{4} \d{2}:\d{2}/)
    })

    it('should format time in am/pm correctly', () => {
        expect(component.formatTimeAmPm(new Date(2023, 0, 1, 0, 5))).toBe('12:05 am')
        expect(component.formatTimeAmPm(new Date(2023, 0, 1, 13, 30))).toBe('1:30 pm')
        expect(component.formatTimeAmPm(new Date(2023, 0, 1, 12, 0))).toBe('12:00 pm')
    })

    it('should format duration correctly', () => {
        const mockEvent = {
            identifier: 'test-id',
            name: 'Test Event',
            startDate: '2023-01-01',
            startTime: '10:00:00+05:30',
            endDate: '2023-01-01',
            endTime: '12:00:00+05:30',
            createdOn: '2023-01-01T10:00:00.000Z',
            duration: 120,
            status: 'Live',
            creatorDetails: '[]',
            appIcon: 'test-icon'
        }

        const events = {
            result: {
                Event: [mockEvent]
            }
        }

        component.setEventListData(events)
        expect(component.data.length).toBe(1)
        const processedEvent = component.data[0]
        expect(processedEvent.eventDuration).toBe('2 hours')
        expect(processedEvent.eventjoined).toBe(' --- ')
        expect(processedEvent.identifier).toBe('test-id')
    })

    it('should filter events correctly', () => {
        // Test past filter
        component.filter('past')
        expect(component.currentFilter).toBe('past')
        let request = mockEventsService.getEventsList.mock.calls.pop()[0].request
        expect(request.filters.status).toEqual(['Live'])
        expect(request.filters.endDateTime).toEqual({ '<': expect.any(String) })

        // Test archive filter
        component.filter('archive')
        expect(component.currentFilter).toBe('archive')
        request = mockEventsService.getEventsList.mock.calls.pop()[0].request
        expect(request.filters.status).toEqual(['Retired'])
        expect(request.filters.endDateTime).toBeUndefined()

        // Test upcoming filter
        component.filter('upcoming')
        expect(component.currentFilter).toBe('upcoming')
        request = mockEventsService.getEventsList.mock.calls.pop()[0].request
        expect(request.filters.endDateTime).toEqual({ '>=': expect.any(String) })
    })

    it('should handle menu actions correctly for archive', () => {
        const mockRow = { identifier: 'test-id' }
        component.menuActions({ action: 'archive', row: mockRow })

        expect(mockDialogue.open).toHaveBeenCalled()
        // Since we mocked the dialog to return true, it should call retireEvent
        expect(mockEventsService.retireEvent).toHaveBeenCalledWith('test-id')
    })

    it('should handle menu actions correctly for edit', () => {
        const mockRow = { identifier: 'test-id' }
        component.menuActions({ action: 'edit', row: mockRow })

        expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/home/events/test-id/edit'], { queryParams: { filter: 'upcoming' } })
    })

    it('should handle telemetry correctly', () => {
        component.tabTelemetry('test-label', 1)

        expect(mockEventService.handleTabTelemetry).toHaveBeenCalledWith(
            'approval-tab',
            { label: 'test-label', index: 1 }
        )
    })

    it('should correctly determine if an event can be archived', () => {
        const currentTime = new Date()
        const futureDate = moment(currentTime).add(1, 'day').format('YYYY-MM-DD')
        const pastDate = moment(currentTime).subtract(1, 'day').format('YYYY-MM-DD')

        // Event in progress (can't archive)
        const inProgressEvent = {
            startDate: pastDate,
            startTime: '00:00:00+05:30',
            endDate: futureDate,
            endTime: '23:59:00+05:30'
        }
        expect(component.canArchive(inProgressEvent)).toBe(false)

        // Past event (can archive)
        const pastEvent = {
            startDate: pastDate,
            startTime: '00:00:00+05:30',
            endDate: pastDate,
            endTime: '23:59:00+05:30'
        }
        expect(component.canArchive(pastEvent)).toBe(true)

        // Future event (can archive)
        const futureEvent = {
            startDate: futureDate,
            startTime: '00:00:00+05:30',
            endDate: futureDate,
            endTime: '23:59:00+05:30'
        }
        expect(component.canArchive(futureEvent)).toBe(true)
    })
})