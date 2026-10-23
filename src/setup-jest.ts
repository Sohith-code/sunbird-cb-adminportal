import 'jest-preset-angular/setup-jest'
import '@angular/localize/init'
// Mock environment if needed
jest.mock('src/environments/environment', () => ({
  environment: {
    production: false,
    sitePath: ''
  }
}))