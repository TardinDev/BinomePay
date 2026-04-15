import React, { Component, ReactNode } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: React.ErrorInfo | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    if (__DEV__) console.error('ErrorBoundary caught error:', error)
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (__DEV__) {
      console.error('ErrorBoundary details:', {
        error: error.toString(),
        errorInfo: errorInfo.componentStack,
      })
    }
    this.setState({
      error,
      errorInfo,
    })
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-black px-6 pt-20">
          <View className="mb-8 items-center">
            <Ionicons name="warning-outline" size={80} color="#EF4444" />
            <Text className="mt-4 text-2xl font-bold text-white">Une erreur s'est produite</Text>
            <Text className="mt-2 text-center text-gray-400">
              L'application a rencontré un problème inattendu
            </Text>
          </View>

          {this.state.error && (
            <ScrollView className="mb-6 rounded-xl bg-neutral-900 p-4">
              <Text className="mb-2 font-bold text-red-400">Détails de l'erreur:</Text>
              <Text className="text-sm text-gray-300">{this.state.error.toString()}</Text>
              {this.state.errorInfo && (
                <Text className="mt-2 text-xs text-gray-500">
                  {this.state.errorInfo.componentStack}
                </Text>
              )}
            </ScrollView>
          )}

          <Pressable
            onPress={this.handleReset}
            className="items-center rounded-xl bg-yellow-400 py-4"
          >
            <Text className="text-base font-bold text-black">Réessayer</Text>
          </Pressable>
        </View>
      )
    }

    return this.props.children
  }
}
