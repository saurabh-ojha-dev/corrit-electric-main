'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Shield, User, Lock, Eye, EyeOff, Mail, ArrowRight, Phone } from 'lucide-react'
import toast from 'react-hot-toast'
import { API_ENDPOINTS, apiClient } from '@/utils/api'
import Image from 'next/image'
import Link from 'next/link'

interface RegisterForm {
  username: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export default function AdminRegister() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterForm>()
  const password = watch('password')

  const onSubmit = async (data: RegisterForm) => {
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setIsLoading(true)
    try {
      const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, {
        username: data.username,
        email: data.email,
        phone: data.phone,
        password: data.password
      })
      
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token)
        toast.success('Registration successful!')
        router.push('/admin/dashboard')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#212429' }}>
      {/* Top-left blurred gradient shape */}
      <div
        className="absolute top-0 left-0 w-[300px] h-[350px] sm:w-[400px] sm:h-[450px] lg:w-[449.63px] lg:h-[514.29px] -translate-x-[100px] -translate-y-[100px] sm:-translate-x-[150px] sm:-translate-y-[120px] lg:-translate-x-[168px] lg:-translate-y-[150px] rotate-[75.68deg] opacity-38"
        style={{
          background: 'linear-gradient(99.13deg, #E51E25 0%, #212429 100%)',
          filter: 'blur(100px) sm:blur(130px) lg:blur(154.2857208251953px)'
        }}
      ></div>

      {/* Bottom-right blurred gradient shape */}
      <div
        className="absolute bottom-0 right-0 w-[300px] h-[350px] sm:w-[400px] sm:h-[450px] lg:w-[449.63px] lg:h-[514.29px] translate-x-[100px] translate-y-[100px] sm:translate-x-[150px] sm:translate-y-[120px] lg:translate-x-[168px] lg:translate-y-[150px] -rotate-[75.68deg] opacity-38"
        style={{
          background: 'linear-gradient(99.13deg, #E51E25 0%, #212429 100%)',
          filter: 'blur(100px) sm:blur(130px) lg:blur(154.2857208251953px)'
        }}
      ></div>

      {/* Main content */}
      <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg relative z-10">
        <div className="relative bg-white rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-black rounded-xl mb-3 sm:mb-4">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-medium text-[#000000] mb-2">Admin Register</h1>
            <p className="text-[#00000099] font-normal text-sm sm:text-base">Create Admin Account</p>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm sm:text-base font-normal text-[#00000099] mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 text-[#191C1F]" />
                </div>
                <div className="absolute inset-y-0 left-10 sm:left-12 flex items-center pointer-events-none">
                  <div className="w-px h-5 sm:h-6 bg-gray-300"></div>
                </div>
                <input
                  {...register('username', { 
                    required: 'Username is required',
                    minLength: { value: 3, message: 'Username must be at least 3 characters' }
                  })}
                  type="text"
                  id="username"
                  placeholder="Enter username"
                  className="block placeholder:text-[#00000099] w-full pl-12 sm:pl-16 pr-3 py-2.5 sm:py-3 border border-[#0000001A] rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-sm sm:text-base"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm sm:text-base font-normal text-[#00000099] mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-[#191C1F]" />
                </div>
                <div className="absolute inset-y-0 left-10 sm:left-12 flex items-center pointer-events-none">
                  <div className="w-px h-5 sm:h-6 bg-gray-300"></div>
                </div>
                <input
                  {...register('email', { 
                    required: 'Email is required',
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' }
                  })}
                  type="email"
                  id="email"
                  placeholder="Enter email"
                  className="block placeholder:text-[#00000099] w-full pl-12 sm:pl-16 pr-3 py-2.5 sm:py-3 border border-[#0000001A] rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-sm sm:text-base"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Number Field */}
            <div>
              <label htmlFor="phone" className="block text-sm sm:text-base font-normal text-[#00000099] mb-2">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-[#191C1F]" />
                </div>
                <div className="absolute inset-y-0 left-10 sm:left-12 flex items-center pointer-events-none">
                  <div className="w-px h-5 sm:h-6 bg-gray-300"></div>
                </div>
                <input
                  {...register('phone', { 
                    required: 'Phone number is required',
                    pattern: { value: /^[0-9]{10,15}$/, message: 'Please enter a valid phone number' }
                  })}
                  type="tel"
                  id="phone"
                  placeholder="Enter phone number"
                  className="block placeholder:text-[#00000099] w-full pl-12 sm:pl-16 pr-3 py-2.5 sm:py-3 border border-[#0000001A] rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-sm sm:text-base"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm sm:text-base font-normal text-[#00000099] mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-[#191C1F]" />
                </div>
                <div className="absolute inset-y-0 left-10 sm:left-12 flex items-center pointer-events-none">
                  <div className="w-px h-5 sm:h-6 bg-gray-300"></div>
                </div>
                <input
                  {...register('password', { 
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Password"
                  className="block placeholder:text-[#00000099] w-full pl-12 sm:pl-16 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm sm:text-base font-normal text-[#00000099] mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 sm:h-5 sm:w-5 text-[#191C1F]" />
                </div>
                <div className="absolute inset-y-0 left-10 sm:left-12 flex items-center pointer-events-none">
                  <div className="w-px h-5 sm:h-6 bg-gray-300"></div>
                </div>
                <input
                  {...register('confirmPassword', { 
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  placeholder="Confirm password"
                  className="block placeholder:text-[#00000099] w-full pl-12 sm:pl-16 pr-10 sm:pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs sm:text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-2.5 sm:py-3 px-4 rounded-xl font-medium hover:bg-gray-800 focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              <Image src="/sign-in-logo.svg" alt="register" width={16} height={16} className="w-4 h-4 sm:w-5 sm:h-5" />
              {isLoading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-4 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-[#00000099] font-normal">
              Already have an account?{' '}
              <Link href="/admin/auth/login" className="text-black font-medium hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
