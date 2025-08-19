'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { Shield, User, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'

interface LoginForm {
  username: string
  password: string
}

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors }, } = useForm<LoginForm>()

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const response = await axios.post('/api/auth/login', data)
      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token)
        toast.success('Login successful!')
        router.push('/admin/dashboard')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: '#212429' }}>
      {/* Top-left blurred gradient shape */}
      <div
        className="absolute top-0 left-0 w-[449.63px] h-[514.29px] -translate-x-[168px] -translate-y-[150px] rotate-[75.68deg] opacity-38"
        style={{
          background: 'linear-gradient(99.13deg, #E51E25 0%, #212429 100%)',
          filter: 'blur(154.2857208251953px)'
        }}
      ></div>

      {/* Bottom-right blurred gradient shape */}
      <div
        className="absolute bottom-0 right-0 w-[449.63px] h-[514.29px] translate-x-[168px] translate-y-[150px] -rotate-[75.68deg] opacity-38"
        style={{
          background: 'linear-gradient(99.13deg, #E51E25 0%, #212429 100%)',
          filter: 'blur(154.2857208251953px)'
        }}
      ></div>

      {/* Main content */}
      <div className="w-full max-w-md relative z-10">
        <div className="relative bg-white rounded-xl p-8 shadow-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-xl mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-medium text-[#000000] mb-2">Admin Login</h1>
            <p className="text-[#00000099] font-normal text-base">Bike Rental Management System</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-base font-normal text-[#00000099] mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-[#191C1F]" />
                </div>
                <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none">
                  <div className="w-px h-6 bg-gray-300"></div>
                </div>
                <input
                  {...register('username', { required: 'Username is required' })}
                  type="text"
                  id="username"
                  placeholder="Enter username"
                  className="block placeholder:text-[#00000099] w-full pl-16 pr-3 py-3 border border-[#0000001A] rounded-2xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-base font-normal text-[#00000099] mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-[#191C1F]" />
                </div>
                <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none">
                  <div className="w-px h-6 bg-gray-300"></div>
                </div>
                <input
                  {...register('password', { required: 'Password is required' })}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="Password"
                  className="block placeholder:text-[#00000099] w-full pl-16 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-black text-white py-3 px-4 rounded-xl font-medium hover:bg-gray-800 focus:ring-2 focus:ring-black focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {/* <ArrowRight className="w-5 h-5 mr-2" /> */}
              <Image src="/sign-in-logo.svg" alt="login" width={18} height={18} />
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#00000099] font-normal mb-2">Secure admin access to bike rental management</p>
            <p className="text-sm text-[#00000099] font-normal">
              Don't have an account?{' '}
              <Link href="/admin/auth/register" className="text-black font-medium hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
