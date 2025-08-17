import React, { useEffect, useState } from 'react'
import { Stack, Redirect } from 'expo-router'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

export default function ProtectedLayout() {
  const [session, setSession] = useState<Session | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(data.session)
      setChecked(true)
    })()
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
    })
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  if (!checked) {
    // Laisser l'écran neutre pour éviter le clignotement
    return null
  }

  if (!session) {
    return <Redirect href='/(auth)/login' />
  }

  return <Stack screenOptions={{ headerShown: false }} />
}


