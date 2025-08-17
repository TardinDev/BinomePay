import React, { useEffect, useState } from 'react'
import { Redirect } from 'expo-router'
import { supabase } from '@/lib/supabase'
import type { Session } from '@supabase/supabase-js'

export default function RootIndex() {
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
  }, [])

  if (!checked) return null

  if (session) {
    return <Redirect href='/(Protected)/(tabs)/index' />
  }
  return <Redirect href='/(auth)/login' />
}


