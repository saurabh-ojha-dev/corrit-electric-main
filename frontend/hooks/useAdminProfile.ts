'use client'

import { useState, useEffect } from 'react'
import { API_ENDPOINTS, apiClient } from '@/utils/api'

interface AdminProfile {
  _id: string
  username: string
  email: string
  phone: string
  role: string
  isActive: boolean
  lastLogin: string
  createdAt: string
  updatedAt: string
}

export function useAdminProfile() {
  const [profile, setProfile] = useState<AdminProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('adminToken')
      if (!token) {
        setError('No token found')
        setLoading(false)
        return
      }

      const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE)

      const adminData = response.data.admin
      setProfile(adminData)
      
      // Store in localStorage for persistence
      localStorage.setItem('adminProfile', JSON.stringify(adminData))
      
      setError(null)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch profile')
      // Try to get from localStorage as fallback
      const storedProfile = localStorage.getItem('adminProfile')
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile))
      }
    } finally {
      setLoading(false)
    }
  }

  const getFirstLetter = (): string => {
    if (!profile?.username) return 'A'
    return profile.username.charAt(0).toUpperCase()
  }

  useEffect(() => {
    // Try to get from localStorage first
    const storedProfile = localStorage.getItem('adminProfile')
    if (storedProfile) {
      setProfile(JSON.parse(storedProfile))
      setLoading(false)
    } else {
      fetchProfile()
    }
  }, [])

  return {
    profile,
    loading,
    error,
    getFirstLetter,
    refetch: fetchProfile
  }
}
