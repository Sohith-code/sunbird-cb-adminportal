import { ViewContainerRef } from '@angular/core'
import { LoginRootDirective } from './login-root.directive'

describe('LoginRootDirective', () => {
  it('should create an instance and expose the viewContainerRef', () => {
    const viewContainerRef = {} as ViewContainerRef
    const directive = new LoginRootDirective(viewContainerRef)
    expect(directive).toBeTruthy()
    expect(directive.viewContainerRef).toBe(viewContainerRef)
  })
})
