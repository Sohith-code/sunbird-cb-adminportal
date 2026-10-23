import { AppRetryInterceptorService } from './app-retry-interceptor.service'
import { GlobalErrorHandlingService } from './global-error-handling.service'
import { HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http'
import { defer, Observable, of, throwError } from 'rxjs'

describe('GlobalErrorHandlingService', () => {
  let service: GlobalErrorHandlingService

  beforeEach(() => {
    service = new GlobalErrorHandlingService()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should rethrow errors that are not chunk load errors', () => {
    const error = new Error('Some other error')
    expect(() => service.handleError(error)).toThrow(error)
  })

  it('should not rethrow chunk load errors (page is reloaded instead)', () => {
    // jsdom does not implement reload; it only reports "not implemented"
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    expect(() => service.handleError({ message: 'ChunkLoadError: Loading chunk 5 failed' })).not.toThrow()
    errorSpy.mockRestore()
  })
})

describe('AppRetryInterceptorService', () => {
  let service: AppRetryInterceptorService
  let mockHttpHandler: HttpHandler

  /** Returns an observable that errors for the first `failures` subscriptions, then emits `value`. */
  const failingSource = (failures: number, error: any, value: any = {}): { source: Observable<any>, subscriptions: () => number } => {
    let count = 0
    const source = defer(() => {
      count += 1
      return count <= failures ? throwError(error) : of(value)
    })
    return { source, subscriptions: () => count }
  }

  beforeEach(() => {
    service = new AppRetryInterceptorService()
    mockHttpHandler = {
      handle: jest.fn(),
    } as any
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('intercept', () => {
    it('should not retry if body.excludeRetry is true', () => {
      const request = new HttpRequest('POST', '/test', { excludeRetry: true })
      const next = mockHttpHandler
      next.handle = jest.fn().mockReturnValue(of({}))

      let response: any
      service.intercept(request, next).subscribe(res => (response = res))
      expect(response).toEqual({})
      expect(next.handle).toHaveBeenCalledWith(request)
    })

    it('should retry on 5xx errors up to maxAttempts', () => {
      jest.useFakeTimers()
      const request = new HttpRequest('GET', '/test')
      const next = mockHttpHandler
      const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Server Error' })
      const { source, subscriptions } = failingSource(1, errorResponse)
      next.handle = jest.fn().mockReturnValue(source)

      let response: any
      service.intercept(request, next).subscribe(res => (response = res))
      expect(subscriptions()).toBe(1)
      expect(response).toBeUndefined()

      jest.advanceTimersByTime(5000)

      // One initial attempt + 1 retry (retryWhen resubscribes to the handled request)
      expect(subscriptions()).toBe(2)
      expect(response).toEqual({})
      expect(next.handle).toHaveBeenCalledTimes(1)
    })

    it('should not retry if error is not 5xx', () => {
      const request = new HttpRequest('GET', '/test')
      const next = mockHttpHandler
      const errorResponse = new HttpErrorResponse({ status: 400, statusText: 'Bad Request' })
      const { source, subscriptions } = failingSource(1, errorResponse)
      next.handle = jest.fn().mockReturnValue(source)

      let caught: any
      service.intercept(request, next).subscribe({ error: err => (caught = err) })

      expect(caught).toBe(errorResponse)
      expect(subscriptions()).toBe(1)
    })

    it('should retry with delay scaled by the retry attempt', () => {
      jest.useFakeTimers()
      const request = new HttpRequest('GET', '/test')
      const next = mockHttpHandler
      const errorResponse = new HttpErrorResponse({ status: 503, statusText: 'Unavailable' })
      const { source, subscriptions } = failingSource(1, errorResponse)
      next.handle = jest.fn().mockReturnValue(source)

      let response: any
      service.intercept(request, next).subscribe(res => (response = res))

      jest.advanceTimersByTime(4999)
      expect(subscriptions()).toBe(1)
      expect(response).toBeUndefined()

      jest.advanceTimersByTime(1)
      expect(subscriptions()).toBe(2)
      expect(response).toEqual({})
    })

    it('should stop retrying after max attempts are reached', () => {
      jest.useFakeTimers()
      const request = new HttpRequest('GET', '/test')
      const next = mockHttpHandler
      const errorResponse = new HttpErrorResponse({ status: 500, statusText: 'Server Error' })
      const { source, subscriptions } = failingSource(Infinity, errorResponse)
      next.handle = jest.fn().mockReturnValue(source)

      service['maxAttempts'] = 2

      let caught: any
      service.intercept(request, next).subscribe({ error: err => (caught = err) })
      jest.advanceTimersByTime(5000) // 1st retry
      jest.advanceTimersByTime(10000) // 2nd retry

      expect(caught).toEqual(errorResponse)
      expect(subscriptions()).toBe(3) // initial + 2 retries
    })
  })

  describe('shouldRetry', () => {
    it('should return true for 5xx errors', () => {
      const error = new HttpErrorResponse({ status: 500, statusText: 'Internal Server Error' })
      expect(service['shouldRetry'](error)).toBe(true)
    })

    it('should return false for 4xx errors', () => {
      const error = new HttpErrorResponse({ status: 400, statusText: 'Bad Request' })
      expect(service['shouldRetry'](error)).toBe(false)
    })

    it('should return false for non-5xx errors', () => {
      const error = new HttpErrorResponse({ status: 404, statusText: 'Not Found' })
      expect(service['shouldRetry'](error)).toBe(false)
    })
  })
})
