import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import api from '../../src/config/api';

export default function HistoriqueScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [historique, setHistorique] = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    api.get('/dashboard/demandes/historique/').then(res => setHistorique(res.data.historique))
      .catch(() => Alert.alert(t('common.error'), t('agent.errorHistory')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F6F9' }}><ActivityIndicator size="large" color="#0F2942" /></View>;

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" />
      <View style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={S.backBtn}><Ionicons name="arrow-back" size={18} color="#FFFFFF" /></TouchableOpacity>
        <Text style={S.headerTitle}>{t('agent.myActions')}</Text>
        <Text style={S.headerSub}>{historique.length} {historique.length > 1 ? t('agent.actionPlural') : t('agent.action')}</Text>
      </View>
      <ScrollView style={S.scroll} contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 40 }}>
        {historique.length === 0 ? (
          <View style={S.empty}><Ionicons name="clipboard-outline" size={48} color="#D1D5DB" /><Text style={S.emptyText}>{t('agent.noAction')}</Text></View>
        ) : historique.map((h: any, i: number) => {
          const isValid = h.action === 'VALIDER';
          return (
            <View key={i} style={S.card}>
              <View style={S.cardTop}>
                <View style={[S.actionBadge, { backgroundColor: isValid ? '#22C55E' : '#EF4444' }]}>
                  <Ionicons name={isValid ? 'checkmark-circle' : 'close-circle'} size={13} color="#FFFFFF" />
                  <Text style={S.actionText}> {isValid ? t('agent.validated') : t('agent.refused')}</Text>
                </View>
                <Text style={S.dateText}>{h.horodatage?.split('T')[0]}</Text>
              </View>
              <Text style={S.numDemande}>{h.num_demande}</Text>
              <Text style={S.typeActe}>{h.type_acte}</Text>
              <View style={S.citoyenRow}><Ionicons name="person-outline" size={12} color="#6B7280" /><Text style={S.citoyenText}> {h.citoyen}</Text></View>
              {h.motif && <View style={S.motifBox}><Text style={S.motifLabel}>{t('agent.reason')} :</Text><Text style={S.motif}>{h.motif}</Text></View>}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
const S = StyleSheet.create({
  root       : { flex: 1, backgroundColor: '#F4F6F9' },
  header     : { backgroundColor: '#0F2942', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  backBtn    : { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerSub  : { fontSize: 12, color: '#D4AF37', fontWeight: '600', marginTop: 2 },
  scroll     : { flex: 1 },
  empty      : { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyText  : { color: '#9CA3AF', fontSize: 15 },
  card       : { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, gap: 6 },
  cardTop    : { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  actionText : { color: '#FFFFFF', fontWeight: '800', fontSize: 11 },
  dateText   : { fontSize: 11, color: '#9CA3AF' },
  numDemande : { fontSize: 14, fontWeight: '800', color: '#0F2942' },
  typeActe   : { fontSize: 12, color: '#6B7280' },
  citoyenRow : { flexDirection: 'row', alignItems: 'center' },
  citoyenText: { fontSize: 12, color: '#4B5563' },
  motifBox   : { backgroundColor: '#FFFBEB', borderRadius: 10, padding: 10 },
  motifLabel : { fontSize: 10, fontWeight: '700', color: '#F59E0B' },
  motif      : { fontSize: 12, color: '#374151', marginTop: 2 },
});
