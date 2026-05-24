import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import api from '../../src/config/api';

export default function ArrondissementsScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [arrondissements, setArr] = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [query, setQuery]         = useState('');

  useEffect(() => {
    api.get('/dashboard/arrondissements/public/').then(res => setArr(res.data))
      .catch(() => Alert.alert(t('common.error'), t('arrondissements.errorLoad')))
      .finally(() => setLoading(false));
  }, []);

  const filtres       = arrondissements.filter(a => a.nom_arondissement?.toLowerCase().includes(query.toLowerCase()) || a.commune?.toLowerCase().includes(query.toLowerCase()));
  const disponibles   = filtres.filter(a => a.statut === 'disponible');
  const indisponibles = filtres.filter(a => a.statut !== 'disponible');

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F6F9' }}>
      <ActivityIndicator size="large" color="#0F2942" />
    </View>
  );

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" />
      <View style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
          <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={S.headerTitle}>{t('arrondissements.title')}</Text>
        <Text style={S.headerSub}>{t('arrondissements.subtitle')}</Text>
      </View>
      <View style={S.searchWrap}>
        <View style={S.searchRow}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput style={S.searchInput} value={query} onChangeText={setQuery}
            placeholder={t('arrondissements.search')} placeholderTextColor="#9CA3AF" />
        </View>
      </View>
      <ScrollView style={S.scroll} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
        <View style={S.sectionHeader}>
          <Ionicons name="checkmark-circle" size={15} color="#22C55E" />
          <Text style={[S.sectionTitle, { color: '#22C55E' }]}> {t('arrondissements.available')} ({disponibles.length})</Text>
        </View>
        {disponibles.map((a: any) => (
          <View key={a.id_arondissement} style={[S.card, S.cardDispo]}>
            <View style={S.cardLeft}>
              <Text style={S.cardNom}>{a.nom_arondissement}</Text>
              <View style={S.cardComRow}>
                <Ionicons name="business-outline" size={11} color="#9CA3AF" />
                <Text style={S.cardCommune}> {a.commune}</Text>
              </View>
            </View>
            <View style={S.badgeDispo}>
              <Ionicons name="checkmark-outline" size={11} color="#FFFFFF" />
              <Text style={S.badgeText}> {t('common.open')}</Text>
            </View>
          </View>
        ))}
        {indisponibles.length > 0 && (
          <>
            <View style={[S.sectionHeader, { marginTop: 20 }]}>
              <Ionicons name="close-circle" size={15} color="#EF4444" />
              <Text style={[S.sectionTitle, { color: '#EF4444' }]}> {t('arrondissements.unavailable')} ({indisponibles.length})</Text>
            </View>
            {indisponibles.map((a: any) => (
              <View key={a.id_arondissement} style={[S.card, S.cardIndispo]}>
                <View style={S.cardLeft}>
                  <Text style={[S.cardNom, { color: '#9CA3AF' }]}>{a.nom_arondissement}</Text>
                  <View style={S.cardComRow}>
                    <Ionicons name="business-outline" size={11} color="#D1D5DB" />
                    <Text style={[S.cardCommune, { color: '#D1D5DB' }]}> {a.commune}</Text>
                  </View>
                </View>
                <View style={S.badgeIndispo}>
                  <Ionicons name="close-outline" size={11} color="#FFFFFF" />
                  <Text style={S.badgeText}> {t('common.closed')}</Text>
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}
const S = StyleSheet.create({
  root        : { flex: 1, backgroundColor: '#F4F6F9' },
  header      : { backgroundColor: '#0F2942', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  backBtn     : { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  headerTitle : { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerSub   : { fontSize: 12, color: '#D4AF37', fontWeight: '600', marginTop: 2 },
  searchWrap  : { paddingHorizontal: 16, paddingVertical: 12 },
  searchRow   : { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  searchInput : { flex: 1, fontSize: 14, color: '#1F2937' },
  scroll      : { flex: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, marginTop: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '700' },
  card        : { borderRadius: 14, padding: 14, marginBottom: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderLeftWidth: 3 },
  cardDispo   : { backgroundColor: '#FFFFFF', borderLeftColor: '#22C55E', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  cardIndispo : { backgroundColor: '#FFFFFF', borderLeftColor: '#EF4444', opacity: 0.65 },
  cardLeft    : { flex: 1 },
  cardNom     : { fontSize: 14, fontWeight: '700', color: '#0F2942' },
  cardComRow  : { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  cardCommune : { fontSize: 11, color: '#9CA3AF' },
  badgeDispo  : { flexDirection: 'row', alignItems: 'center', backgroundColor: '#22C55E', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  badgeIndispo: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EF4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  badgeText   : { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
});
