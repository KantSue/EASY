import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import api from '../../src/config/api';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SuiviScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [demandes, setDemandes]       = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);
  const [downloading, setDownloading] = useState<number | null>(null);
  const [filter, setFilter]           = useState('all');

  const STATUT_META: Record<string, { labelKey: string; bg: string; icon: string }> = {
    'EN ATTENTE': { labelKey: 'status.pending',   bg: '#F59E0B', icon: 'time-outline' },
    'VALIDER'   : { labelKey: 'status.validated', bg: '#22C55E', icon: 'checkmark-circle-outline' },
    'REFUSER'   : { labelKey: 'status.refused',   bg: '#EF4444', icon: 'close-circle-outline' },
    'TERMINER'  : { labelKey: 'status.done',      bg: '#8B5CF6', icon: 'document-text-outline' },
  };

  const FILTERS = [
    { key: 'all',       label: t('suivi.all') },
    { key: 'EN ATTENTE',label: t('suivi.pending') },
    { key: 'VALIDER',   label: t('suivi.validated') },
    { key: 'TERMINER',  label: t('suivi.done') },
    { key: 'REFUSER',   label: t('suivi.refused') },
  ];

  useEffect(() => {
    api.get('/dashboard/demandes/citoyen/').then(res => setDemandes(res.data))
      .catch(() => Alert.alert(t('common.error'), t('suivi.errorLoad')))
      .finally(() => setLoading(false));
  }, []);

  const telechargerPDF = async (id_demande: number, num_demande: string) => {
    setDownloading(id_demande);
    try {
      const res = await api.get(`/dashboard/demandes/${id_demande}/pdf/`);
      const url_pdf = res.data.url_pdf;
      if (!url_pdf) { Alert.alert(t('common.error'), t('suivi.pdfUnavailable')); return; }
      const token = await AsyncStorage.getItem('token');
      const dest = ((FileSystem as any).documentDirectory ?? '') + `acte_${num_demande}.pdf`;
      const download = await FileSystem.downloadAsync(url_pdf, dest, { headers: { Authorization: `Bearer ${token}` } });
      if (download.status === 200) await Sharing.shareAsync(download.uri, { mimeType: 'application/pdf' });
      else Alert.alert(t('common.error'), t('suivi.downloadFailed'));
    } catch { Alert.alert(t('common.error'), t('suivi.errorDownload')); }
    finally { setDownloading(null); }
  };

  const filtered = demandes.filter(d => filter === 'all' || d.statut_demande === filter);

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
        <Text style={S.headerTitle}>{t('suivi.title')}</Text>
        <Text style={S.headerSub}>{demandes.length} {demandes.length > 1 ? t('agent.pendingCountPlural') : t('agent.pendingCount')}</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.filterScroll} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        {FILTERS.map(f => (
          <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)} style={[S.chip, filter === f.key && S.chipActive]}>
            <Text style={[S.chipText, filter === f.key && S.chipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <ScrollView style={S.scroll} contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40, gap: 12 }}>
        {filtered.length === 0 ? (
          <View style={S.empty}>
            <Ionicons name="documents-outline" size={48} color="#D1D5DB" />
            <Text style={S.emptyText}>{t('suivi.noRequest')}</Text>
          </View>
        ) : filtered.map((d: any) => {
          const meta = STATUT_META[d.statut_demande] || { labelKey: 'status.pending', bg: '#9CA3AF', icon: 'help-outline' };
          return (
            <View key={d.id_demande} style={[S.card, { borderLeftColor: meta.bg }]}>
              <View style={S.cardTop}>
                <Text style={S.numDemande}>{d.num_demande}</Text>
                <View style={[S.badge, { backgroundColor: meta.bg }]}>
                  <Ionicons name={meta.icon as any} size={11} color="#FFFFFF" />
                  <Text style={S.badgeText}> {t(meta.labelKey)}</Text>
                </View>
              </View>
              <View style={S.cardRow}>
                <View style={S.typeChip}><Text style={S.typeText}>{d.type_acte || 'N/A'}</Text></View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="calendar-outline" size={11} color="#9CA3AF" />
                  <Text style={S.dateText}> {d.date_depot}</Text>
                </View>
              </View>
              {d.motif_refus && <Text style={S.motif}>{t('suivi.refusedReason')} : {d.motif_refus}</Text>}
              {d.statut_demande === 'TERMINER' && (
                <TouchableOpacity style={S.dlBtn} onPress={() => telechargerPDF(d.id_demande, d.num_demande)} disabled={downloading === d.id_demande}>
                  {downloading === d.id_demande ? <ActivityIndicator color="#FFFFFF" size="small" /> : <>
                    <Ionicons name="download-outline" size={14} color="#FFFFFF" />
                    <Text style={S.dlText}> {t('suivi.download')}</Text>
                  </>}
                </TouchableOpacity>
              )}
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
  filterScroll: { flexGrow: 0, paddingVertical: 12 },
  chip       : { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  chipActive : { backgroundColor: '#0F2942', borderColor: '#0F2942' },
  chipText   : { fontSize: 12, fontWeight: '600', color: '#0F2942' },
  chipTextActive: { color: '#FFFFFF' },
  scroll     : { flex: 1 },
  empty      : { alignItems: 'center', marginTop: 60, gap: 8 },
  emptyText  : { color: '#9CA3AF', fontSize: 15 },
  card       : { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardTop    : { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  numDemande : { fontSize: 14, fontWeight: '800', color: '#0F2942' },
  badge      : { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  badgeText  : { color: '#FFFFFF', fontSize: 10, fontWeight: '700' },
  cardRow    : { flexDirection: 'row', alignItems: 'center', gap: 10 },
  typeChip   : { backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  typeText   : { fontSize: 11, fontWeight: '600', color: '#1D4ED8' },
  dateText   : { fontSize: 11, color: '#9CA3AF' },
  motif      : { fontSize: 11, color: '#EF4444', marginTop: 6, fontStyle: 'italic' },
  dlBtn      : { backgroundColor: '#8B5CF6', borderRadius: 10, padding: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  dlText     : { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
});
