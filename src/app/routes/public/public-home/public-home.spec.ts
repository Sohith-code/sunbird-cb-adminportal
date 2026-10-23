import { Subject } from 'rxjs'
import { PublicHomeComponent } from './public-home.component'

describe('PublicHomeComponent', () => {
  let component: PublicHomeComponent
  let mockRouter: any

  beforeEach(() => {
    // Mock Router
    mockRouter = {
      events: {
        subscribe: jest.fn()
      }
    }

    // Create component instance
    component = new PublicHomeComponent(mockRouter)
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should subscribe to router events on ngOnInit', () => {
    // Mock the subscription callback function
    const subscribeCallback = jest.fn()
    mockRouter.events.subscribe.mockImplementation(subscribeCallback)

    // Call ngOnInit
    component.ngOnInit()

    // Verify that the subscription was made
    expect(mockRouter.events.subscribe).toHaveBeenCalledTimes(1)
  })

  it('should attempt to redirect to /public/logout if URL contains "public/home"', () => {
    // jsdom does not allow replacing window.location, so drive the real URL via history
    // and observe jsdom's "navigation not implemented" report when href is assigned.
    const events = new Subject<any>()
    component = new PublicHomeComponent({ events } as any)
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    window.history.pushState({}, '', '/public/home')

    component.ngOnInit()
    events.next({})

    const navigationAttempted = errorSpy.mock.calls.some(args =>
      args.some((a: any) => String((a && a.message) || a).includes('navigation')))
    expect(navigationAttempted).toBe(true)

    errorSpy.mockRestore()
    window.history.pushState({}, '', '/')
  })

  it('should not redirect if URL does not contain "public/home"', () => {
    const events = new Subject<any>()
    component = new PublicHomeComponent({ events } as any)
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    window.history.pushState({}, '', '/app/home')

    component.ngOnInit()
    events.next({})

    expect(errorSpy).not.toHaveBeenCalled()
    expect(window.location.pathname).toBe('/app/home')

    errorSpy.mockRestore()
    window.history.pushState({}, '', '/')
  })
})
