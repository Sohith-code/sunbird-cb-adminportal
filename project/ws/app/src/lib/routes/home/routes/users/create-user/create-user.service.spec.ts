import { CreateUserService } from './create-user.service'
import { IUserForm } from '../users.model'
import { of, throwError } from 'rxjs'

describe('CreateUserService', () => {
  let service: CreateUserService
  let httpClientMock: any

  beforeEach(() => {
    httpClientMock = { post: jest.fn() }
    service = new CreateUserService(httpClientMock)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('createUser', () => {
    const mockUserData: IUserForm = {
      username: 'testuser',
      email: 'testuser@example.com',
      org: '',
      firstName: '',
    }

    const keycloak = true

    it('should call http.post with the correct URL and data', () => {
      const apiUrl = `/apis/protected/v8/user/users/createuser?keycloak=${keycloak}`
      const mockResponse = { success: true }
      httpClientMock.post.mockReturnValue(of(mockResponse))

      let response: any
      service.createUser(mockUserData, keycloak).subscribe(res => (response = res))

      expect(httpClientMock.post).toHaveBeenCalledWith(apiUrl, mockUserData)
      expect(response).toEqual(mockResponse)
    })

    it('should propagate error when http.post fails', () => {
      const errorResponse = new Error('Something went wrong')
      httpClientMock.post.mockReturnValue(throwError(errorResponse))

      let received: any
      service.createUser(mockUserData, false).subscribe({
        next: () => fail('should not emit'),
        error: error => (received = error),
      })

      expect(httpClientMock.post).toHaveBeenCalledWith('/apis/protected/v8/user/users/createuser?keycloak=false', mockUserData)
      expect(received).toEqual(errorResponse)
    })
  })
})
