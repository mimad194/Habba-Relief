import { useState, useEffect } from 'react'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { auth, googleProvider } from './config'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return { user, loading, loginWithGoogle, logout }
}
