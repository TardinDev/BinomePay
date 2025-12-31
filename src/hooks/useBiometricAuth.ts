import { useState, useEffect, useCallback } from 'react'
import * as LocalAuthentication from 'expo-local-authentication'
import AsyncStorage from '@react-native-async-storage/async-storage'

const BIOMETRIC_ENABLED_KEY = '@binomepay_biometric_enabled'

type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none'

interface UseBiometricAuthResult {
  isAvailable: boolean
  isEnabled: boolean
  biometricType: BiometricType
  isAuthenticating: boolean
  authenticate: (reason?: string) => Promise<boolean>
  enableBiometric: () => Promise<boolean>
  disableBiometric: () => Promise<void>
  checkBiometricStatus: () => Promise<void>
}

export function useBiometricAuth(): UseBiometricAuthResult {
  const [isAvailable, setIsAvailable] = useState(false)
  const [isEnabled, setIsEnabled] = useState(false)
  const [biometricType, setBiometricType] = useState<BiometricType>('none')
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  const checkBiometricStatus = useCallback(async () => {
    try {
      // Check if hardware supports biometrics
      const compatible = await LocalAuthentication.hasHardwareAsync()
      if (!compatible) {
        setIsAvailable(false)
        setBiometricType('none')
        return
      }

      // Check if biometrics are enrolled
      const enrolled = await LocalAuthentication.isEnrolledAsync()
      setIsAvailable(enrolled)

      if (enrolled) {
        // Get supported authentication types
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync()

        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('facial')
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('fingerprint')
        } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
          setBiometricType('iris')
        } else {
          setBiometricType('none')
        }
      }

      // Check if user has enabled biometric auth
      const enabled = await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY)
      setIsEnabled(enabled === 'true')
    } catch (error) {
      if (__DEV__) console.error('Error checking biometric status:', error)
      setIsAvailable(false)
      setBiometricType('none')
    }
  }, [])

  const authenticate = useCallback(async (reason?: string): Promise<boolean> => {
    if (!isAvailable) {
      if (__DEV__) console.warn('Biometric authentication not available')
      return false
    }

    setIsAuthenticating(true)

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: reason || 'Authentifiez-vous pour continuer',
        cancelLabel: 'Annuler',
        disableDeviceFallback: false,
        fallbackLabel: 'Utiliser le code',
      })

      if (result.success) {
        if (__DEV__) console.log('Biometric authentication successful')
        return true
      } else {
        if (__DEV__) console.log('Biometric authentication failed:', result.error)
        return false
      }
    } catch (error) {
      if (__DEV__) console.error('Biometric authentication error:', error)
      return false
    } finally {
      setIsAuthenticating(false)
    }
  }, [isAvailable])

  const enableBiometric = useCallback(async (): Promise<boolean> => {
    if (!isAvailable) {
      if (__DEV__) console.warn('Cannot enable biometric - not available')
      return false
    }

    // Authenticate first to confirm identity
    const authenticated = await authenticate('Activez l\'authentification biometrique')

    if (authenticated) {
      try {
        await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true')
        setIsEnabled(true)
        return true
      } catch (error) {
        if (__DEV__) console.error('Error enabling biometric:', error)
        return false
      }
    }

    return false
  }, [isAvailable, authenticate])

  const disableBiometric = useCallback(async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(BIOMETRIC_ENABLED_KEY)
      setIsEnabled(false)
    } catch (error) {
      if (__DEV__) console.error('Error disabling biometric:', error)
    }
  }, [])

  useEffect(() => {
    checkBiometricStatus()
  }, [checkBiometricStatus])

  return {
    isAvailable,
    isEnabled,
    biometricType,
    isAuthenticating,
    authenticate,
    enableBiometric,
    disableBiometric,
    checkBiometricStatus,
  }
}

export function getBiometricLabel(type: BiometricType): string {
  switch (type) {
    case 'facial':
      return 'Face ID'
    case 'fingerprint':
      return 'Touch ID'
    case 'iris':
      return 'Iris'
    default:
      return 'Biometrique'
  }
}

export function getBiometricIcon(type: BiometricType): string {
  switch (type) {
    case 'facial':
      return 'scan-outline'
    case 'fingerprint':
      return 'finger-print-outline'
    case 'iris':
      return 'eye-outline'
    default:
      return 'lock-closed-outline'
  }
}

export default useBiometricAuth
