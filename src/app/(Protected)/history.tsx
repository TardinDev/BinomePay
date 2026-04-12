import React, { useState, useEffect } from 'react'
import { View, Text, FlatList, Pressable, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import historyService, { TransactionHistory, TransactionSummary } from '@/services/historyService'
import { formatTimestamp } from '@/utils/dateUtils'

const getTypeIcon = (type: TransactionHistory['type']): string => {
  switch (type) {
    case 'match_created':
      return '🤝'
    case 'match_accepted':
      return '✅'
    case 'match_completed':
      return '🎉'
    case 'match_cancelled':
      return '❌'
    case 'message_sent':
      return '💬'
    case 'intention_created':
      return '📝'
    case 'rating_given':
      return '⭐'
    default:
      return '📄'
  }
}

const getStatusColor = (status: TransactionHistory['status']): string => {
  switch (status) {
    case 'success':
      return '#2ECC71'
    case 'pending':
      return '#F39C12'
    case 'failed':
      return '#E74C3C'
    case 'cancelled':
      return '#95A5A6'
    default:
      return '#BDC3C7'
  }
}

const HistoryItem = ({ item }: { item: TransactionHistory }) => (
  <View className="mb-3 rounded-xl border border-gray-800 bg-neutral-900 p-4">
    <View className="mb-2 flex-row items-center justify-between">
      <View className="flex-row items-center">
        <Text className="mr-3 text-2xl">{getTypeIcon(item.type)}</Text>
        <View>
          <Text className="font-semibold text-white">{item.description}</Text>
          {item.counterpartName && (
            <Text className="text-sm text-gray-400">avec {item.counterpartName}</Text>
          )}
        </View>
      </View>
      <View className="items-end">
        <View
          className="rounded-full px-2 py-1"
          style={{ backgroundColor: getStatusColor(item.status) + '20' }}
        >
          <Text className="text-xs font-bold" style={{ color: getStatusColor(item.status) }}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>

    {item.amount && item.currency && (
      <View className="mb-2 flex-row items-center">
        <Ionicons name="cash-outline" color="#F39C12" size={16} />
        <Text className="ml-2 font-bold text-yellow-400">
          {item.amount} {item.currency}
        </Text>
        {item.corridor && <Text className="ml-2 text-gray-400">• {item.corridor}</Text>}
      </View>
    )}

    <Text className="text-xs text-gray-500">{formatTimestamp(item.timestamp)}</Text>
  </View>
)

const SummaryCard = ({ summary }: { summary: TransactionSummary }) => (
  <View className="mb-4 rounded-xl border border-gray-800 bg-neutral-900 p-4">
    <Text className="mb-3 text-lg font-bold text-white">📊 Résumé</Text>

    <View className="mb-3 flex-row justify-between">
      <View className="items-center">
        <Text className="text-xl font-bold text-yellow-400">{summary.totalTransactions}</Text>
        <Text className="text-xs text-gray-400">Transactions</Text>
      </View>
      <View className="items-center">
        <Text className="text-xl font-bold text-green-400">{summary.completedTransactions}</Text>
        <Text className="text-xs text-gray-400">Complétées</Text>
      </View>
      <View className="items-center">
        <Text className="text-xl font-bold text-blue-400">{summary.successRate}%</Text>
        <Text className="text-xs text-gray-400">Succès</Text>
      </View>
      <View className="items-center">
        <Text className="text-xl font-bold text-orange-400">
          {summary.averageRating.toFixed(1)}
        </Text>
        <Text className="text-xs text-gray-400">Note moy.</Text>
      </View>
    </View>

    <View className="border-t border-gray-700 pt-3">
      <Text className="mb-2 text-sm font-semibold text-gray-300">Volume total</Text>
      {Object.entries(summary.totalVolume).map(([currency, amount]) => (
        <Text key={currency} className="text-sm text-gray-400">
          {amount.toLocaleString('fr-FR')} {currency}
        </Text>
      ))}
    </View>
  </View>
)

export default function HistoryPage() {
  const [history, setHistory] = useState<TransactionHistory[]>([])
  const [summary, setSummary] = useState<TransactionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'recent' | 'summary'>('recent')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [historyData, summaryData] = await Promise.all([
        historyService.getHistory(50),
        historyService.getTransactionSummary('current_user'),
      ])

      setHistory(historyData)
      setSummary(summaryData)
    } catch (error) {
      if (__DEV__) console.error("Erreur lors du chargement de l'historique:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-white">Chargement de l'historique...</Text>
      </View>
    )
  }

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="border-b border-gray-800 px-5 pb-4 pt-12">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Pressable
              onPress={() => router.back()}
              className="mr-4 rounded-full p-3"
              style={{ backgroundColor: '#1F2937', borderWidth: 1, borderColor: '#374151' }}
            >
              <Ionicons name="arrow-back" color="#FFFFFF" size={24} />
            </Pressable>
            <Text className="text-xl font-bold text-white">Historique</Text>
          </View>

          <Pressable
            onPress={() => {
              // TODO: Implémenter l'export
            }}
            className="p-2"
          >
            <Ionicons name="download-outline" color="#6B7280" size={24} />
          </Pressable>
        </View>

        {/* Tabs */}
        <View className="mt-4 flex-row">
          <Pressable
            onPress={() => setActiveTab('recent')}
            className={`flex-1 rounded-l-lg px-4 py-2 ${
              activeTab === 'recent' ? 'bg-yellow-400' : 'bg-gray-800'
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === 'recent' ? 'text-black' : 'text-gray-400'
              }`}
            >
              Récent
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('summary')}
            className={`flex-1 rounded-r-lg px-4 py-2 ${
              activeTab === 'summary' ? 'bg-yellow-400' : 'bg-gray-800'
            }`}
          >
            <Text
              className={`text-center font-semibold ${
                activeTab === 'summary' ? 'text-black' : 'text-gray-400'
              }`}
            >
              Résumé
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <View className="flex-1 px-5">
        {activeTab === 'recent' ? (
          <FlatList
            data={history}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <HistoryItem item={item} />}
            contentContainerStyle={{ paddingVertical: 20 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={() => (
              <View className="items-center py-10">
                <Text className="text-lg text-gray-400">Aucun historique</Text>
                <Text className="mt-2 text-sm text-gray-500">
                  Vos transactions apparaîtront ici
                </Text>
              </View>
            )}
          />
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingVertical: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {summary && <SummaryCard summary={summary} />}

            {summary?.mostActiveCorridors && summary.mostActiveCorridors.length > 0 && (
              <View className="mb-4 rounded-xl border border-gray-800 bg-neutral-900 p-4">
                <Text className="mb-3 text-lg font-bold text-white">
                  🌍 Corridors les plus actifs
                </Text>
                {summary.mostActiveCorridors.map((corridor) => (
                  <View
                    key={corridor.corridor}
                    className="mb-2 flex-row items-center justify-between"
                  >
                    <Text className="text-gray-300">{corridor.corridor}</Text>
                    <View className="items-end">
                      <Text className="font-semibold text-white">
                        {corridor.volume.toLocaleString('fr-FR')} {corridor.currency}
                      </Text>
                      <Text className="text-xs text-gray-400">{corridor.count} transactions</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {summary?.monthlyStats && summary.monthlyStats.length > 0 && (
              <View className="rounded-xl border border-gray-800 bg-neutral-900 p-4">
                <Text className="mb-3 text-lg font-bold text-white">
                  📈 Statistiques mensuelles
                </Text>
                {summary.monthlyStats.slice(0, 6).map((stat) => (
                  <View
                    key={`${stat.year}-${stat.month}`}
                    className="mb-2 flex-row items-center justify-between"
                  >
                    <Text className="text-gray-300">
                      {stat.month} {stat.year}
                    </Text>
                    <View className="items-end">
                      <Text className="font-semibold text-white">
                        {stat.transactions} transactions
                      </Text>
                      {Object.entries(stat.volume).map(([currency, amount]) => (
                        <Text key={currency} className="text-xs text-gray-400">
                          {amount.toLocaleString('fr-FR')} {currency}
                        </Text>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  )
}
