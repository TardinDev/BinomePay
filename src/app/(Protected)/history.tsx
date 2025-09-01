import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import historyService, { TransactionHistory, TransactionSummary } from '@/services/historyService';
import { formatTimestamp } from '@/utils/dateUtils';
import { LinearGradient } from 'expo-linear-gradient';

const getTypeIcon = (type: TransactionHistory['type']): string => {
  switch (type) {
    case 'match_created': return '🤝';
    case 'match_accepted': return '✅';
    case 'match_completed': return '🎉';
    case 'match_cancelled': return '❌';
    case 'message_sent': return '💬';
    case 'intention_created': return '📝';
    case 'rating_given': return '⭐';
    default: return '📄';
  }
};

const getStatusColor = (status: TransactionHistory['status']): string => {
  switch (status) {
    case 'success': return '#2ECC71';
    case 'pending': return '#F39C12';
    case 'failed': return '#E74C3C';
    case 'cancelled': return '#95A5A6';
    default: return '#BDC3C7';
  }
};

const HistoryItem = ({ item }: { item: TransactionHistory }) => (
  <View className="border border-gray-800 rounded-xl p-4 mb-3 bg-neutral-900">
    <View className="flex-row items-center justify-between mb-2">
      <View className="flex-row items-center">
        <Text className="text-2xl mr-3">{getTypeIcon(item.type)}</Text>
        <View>
          <Text className="text-white font-semibold">{item.description}</Text>
          {item.counterpartName && (
            <Text className="text-gray-400 text-sm">avec {item.counterpartName}</Text>
          )}
        </View>
      </View>
      <View className="items-end">
        <View 
          className="px-2 py-1 rounded-full"
          style={{ backgroundColor: getStatusColor(item.status) + '20' }}
        >
          <Text 
            className="text-xs font-bold"
            style={{ color: getStatusColor(item.status) }}
          >
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>
    </View>
    
    {item.amount && item.currency && (
      <View className="flex-row items-center mb-2">
        <Ionicons name="cash-outline" color="#F39C12" size={16} />
        <Text className="text-yellow-400 font-bold ml-2">
          {item.amount} {item.currency}
        </Text>
        {item.corridor && (
          <Text className="text-gray-400 ml-2">• {item.corridor}</Text>
        )}
      </View>
    )}
    
    <Text className="text-gray-500 text-xs">
      {formatTimestamp(item.timestamp)}
    </Text>
  </View>
);

const SummaryCard = ({ summary }: { summary: TransactionSummary }) => (
  <View className="border border-gray-800 rounded-xl p-4 mb-4 bg-neutral-900">
    <Text className="text-white text-lg font-bold mb-3">📊 Résumé</Text>
    
    <View className="flex-row justify-between mb-3">
      <View className="items-center">
        <Text className="text-yellow-400 font-bold text-xl">{summary.totalTransactions}</Text>
        <Text className="text-gray-400 text-xs">Transactions</Text>
      </View>
      <View className="items-center">
        <Text className="text-green-400 font-bold text-xl">{summary.completedTransactions}</Text>
        <Text className="text-gray-400 text-xs">Complétées</Text>
      </View>
      <View className="items-center">
        <Text className="text-blue-400 font-bold text-xl">{summary.successRate}%</Text>
        <Text className="text-gray-400 text-xs">Succès</Text>
      </View>
      <View className="items-center">
        <Text className="text-orange-400 font-bold text-xl">{summary.averageRating.toFixed(1)}</Text>
        <Text className="text-gray-400 text-xs">Note moy.</Text>
      </View>
    </View>
    
    <View className="border-t border-gray-700 pt-3">
      <Text className="text-gray-300 text-sm font-semibold mb-2">Volume total</Text>
      {Object.entries(summary.totalVolume).map(([currency, amount]) => (
        <Text key={currency} className="text-gray-400 text-sm">
          {amount.toLocaleString('fr-FR')} {currency}
        </Text>
      ))}
    </View>
  </View>
);

export default function HistoryPage() {
  const [history, setHistory] = useState<TransactionHistory[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'recent' | 'summary'>('recent');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [historyData, summaryData] = await Promise.all([
        historyService.getHistory(50),
        historyService.getTransactionSummary('current_user'),
      ]);
      
      setHistory(historyData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Text className="text-white">Chargement de l'historique...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="px-5 pt-12 pb-4 border-b border-gray-800">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Pressable 
              onPress={() => router.back()}
              className="mr-4 p-3 rounded-full"
              style={{ backgroundColor: '#1F2937', borderWidth: 1, borderColor: '#374151' }}
            >
              <Ionicons name="arrow-back" color="#FFFFFF" size={24} />
            </Pressable>
            <Text className="text-white text-xl font-bold">Historique</Text>
          </View>
          
          <Pressable
            onPress={() => {
              // Implémenter l'export
              console.log('Export historique');
            }}
            className="p-2"
          >
            <Ionicons name="download-outline" color="#6B7280" size={24} />
          </Pressable>
        </View>
        
        {/* Tabs */}
        <View className="flex-row mt-4">
          <Pressable
            onPress={() => setActiveTab('recent')}
            className={`flex-1 py-2 px-4 rounded-l-lg ${
              activeTab === 'recent' ? 'bg-yellow-400' : 'bg-gray-800'
            }`}
          >
            <Text className={`text-center font-semibold ${
              activeTab === 'recent' ? 'text-black' : 'text-gray-400'
            }`}>
              Récent
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setActiveTab('summary')}
            className={`flex-1 py-2 px-4 rounded-r-lg ${
              activeTab === 'summary' ? 'bg-yellow-400' : 'bg-gray-800'
            }`}
          >
            <Text className={`text-center font-semibold ${
              activeTab === 'summary' ? 'text-black' : 'text-gray-400'
            }`}>
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
                <Text className="text-gray-400 text-lg">Aucun historique</Text>
                <Text className="text-gray-500 text-sm mt-2">
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
              <View className="border border-gray-800 rounded-xl p-4 mb-4 bg-neutral-900">
                <Text className="text-white text-lg font-bold mb-3">🌍 Corridors les plus actifs</Text>
                {summary.mostActiveCorridors.map((corridor, index) => (
                  <View key={corridor.corridor} className="flex-row justify-between items-center mb-2">
                    <Text className="text-gray-300">{corridor.corridor}</Text>
                    <View className="items-end">
                      <Text className="text-white font-semibold">
                        {corridor.volume.toLocaleString('fr-FR')} {corridor.currency}
                      </Text>
                      <Text className="text-gray-400 text-xs">{corridor.count} transactions</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
            
            {summary?.monthlyStats && summary.monthlyStats.length > 0 && (
              <View className="border border-gray-800 rounded-xl p-4 bg-neutral-900">
                <Text className="text-white text-lg font-bold mb-3">📈 Statistiques mensuelles</Text>
                {summary.monthlyStats.slice(0, 6).map((stat, index) => (
                  <View key={`${stat.year}-${stat.month}`} className="flex-row justify-between items-center mb-2">
                    <Text className="text-gray-300">{stat.month} {stat.year}</Text>
                    <View className="items-end">
                      <Text className="text-white font-semibold">{stat.transactions} transactions</Text>
                      {Object.entries(stat.volume).map(([currency, amount]) => (
                        <Text key={currency} className="text-gray-400 text-xs">
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
  );
}