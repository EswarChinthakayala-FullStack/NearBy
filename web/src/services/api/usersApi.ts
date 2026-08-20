import usersService from './users.service'

/**
 * Enterprise Users API Service
 * Thin Axios wrappers around FastAPI /users endpoints
 */
export const usersApi = {
  getMe: usersService.getMe,
  updateMe: usersService.updateMe,
  changePassword: usersService.changePassword,
}

export default usersApi
