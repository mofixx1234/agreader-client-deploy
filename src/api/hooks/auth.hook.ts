import { useMutation } from '@tanstack/react-query'
import type {
  LoginDto,
  RegisterDto,
  AuthResponse,
} from '../services/auth.service'
import { authService } from '../services/auth.service'


export const useLogin = () => {
  return useMutation<AuthResponse, Error, LoginDto>({
    mutationFn: authService.login,

    onSuccess: (data) => {
      // save tokens
      localStorage.setItem(
        'access_token',
        data.accessToken,
      )

      localStorage.setItem(
        'refresh_token',
        data.refreshToken,
      )

      // optional
      console.log('Login success')
    },

    onError: (error) => {
      console.error('Login error', error)
    },
  })
}

// =============================================
// REGISTER HOOK
// =============================================

export const useRegister = () => {
  return useMutation<
    AuthResponse,
    Error,
    RegisterDto
  >({
    mutationFn: authService.register,

    onSuccess: (data) => {
      localStorage.setItem(
        'access_token',
        data.accessToken,
      )

      localStorage.setItem(
        'refresh_token',
        data.refreshToken,
      )

      console.log('Register success')
    },

    onError: (error) => {
      console.error('Register error', error)
    },
  })
}