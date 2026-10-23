import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'

import { NotificationService } from './notification.service'
import { ENotificationEvent } from '../models/notifications.model'

describe('NotificationService', () => {
  let service: NotificationService
  const routerMock = { navigate: jest.fn() }

  beforeEach(() => {
    routerMock.navigate.mockReset()
    TestBed.configureTestingModule({
      providers: [NotificationService, { provide: Router, useValue: routerMock }],
    })
    service = TestBed.inject(NotificationService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should navigate for share goal', () => {
    service.mapRoute({ eventId: ENotificationEvent.ShareGoal, targetData: {} } as any)
    expect(routerMock.navigate).toHaveBeenCalledWith(['/app/goals/me/pending-actions'])
  })

  it('should navigate to toc for share content', () => {
    service.mapRoute({ eventId: ENotificationEvent.ShareContent, targetData: { identifier: 'x' } } as any)
    expect(routerMock.navigate).toHaveBeenCalledWith(['/app/toc/x/overview'])
  })

  it('should not navigate when identifier missing', () => {
    service.mapRoute({ eventId: ENotificationEvent.ApproveContent, targetData: {} } as any)
    expect(routerMock.navigate).not.toHaveBeenCalled()
  })
})
