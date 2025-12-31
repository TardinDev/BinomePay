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
          <View className="items-center mb-8">
            <Ionicons name="warning-outline" size={80} color="#EF4444" />
            <Text className="text-white text-2xl font-bold mt-4">Une erreur s'est produite</Text>
            <Text className="text-gray-400 text-center mt-2">
              L'application a rencontré un problème inattendu
            </Text>
          </View>

          {this.state.error && (
            <ScrollView className="bg-neutral-900 rounded-xl p-4 mb-6">
              <Text className="text-red-400 font-bold mb-2">Détails de l'erreur:</Text>
              <Text className="text-gray-300 text-sm">{this.state.error.toString()}</Text>
              {this.state.errorInfo && (
                <Text className="text-gray-500 text-xs mt-2">
                  {this.state.errorInfo.componentStack}
                </Text>
              )}
            </ScrollView>
          )}

          <Pressable
            onPress={this.handleReset}
            className="bg-yellow-400 rounded-xl py-4 items-center"
          >
            <Text className="text-black font-bold text-base">Réessayer</Text>
          </Pressable>
        </View>
      )
    }

    return this.props.children
  }
}
