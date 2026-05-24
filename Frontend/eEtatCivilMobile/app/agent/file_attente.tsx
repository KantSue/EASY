import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, RefreshControl, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import api from '../../src/config/api';

const TYPE_ICON: Record<string, string> = { 'acte naissance': 'person-add-outline', 'acte décès': 'flower-outline', 'acte mariage': 'heart-outline' };

export default function FileAttenteScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [demandes, setDemandes]     = useState<any[]>([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [agentId, setAgentId]       = useState<number | null>(null);
  const [agentNom, setAgentNom]     = useState('');
  const [showLock, setShowLock]     = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('token').then(token => {
      if (!token) { router.replace('/login' as any); return; }
      api.get('/accounts/profil/').then(res => {
        setAgentId(res.data.id_user);
        setAgentNom(`${res.data.prenom_user || ''} ${res.data.nom_user || ''}`);
        chargerDemandes();
      });
    });
  }, []);

  const chargerDemandes = async () => {
    try { const res = await api.get('/dashboard/demandes/'); setDemandes(res.data); }
    catch { Alert.alert(t('common.error'), t('agent.errorQueue')); }
    finally { setLoading(false); setRefreshing(false); }
  };

  const deconnexion = async () => { await AsyncStorage.clear(); router.replace('/login' as any); };

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F6F9' }}>
      <ActivityIndicator size="large" color="#0F2942" />
    </View>
  );

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" />
      <View style={S.header}>
        <View style={S.headerTop}>
          <View>
            <Text style={S.headerSub}>{t('agent.queue')}</Text>
            <Text style={S.agentNom}>{t('profil.agent')} {agentNom}</Text>
            <Text style={S.arrText}><Ionicons name="location-outline" size={11} /> Andavamamba · Antananarivo</Text>
          </View>
          <TouchableOpacity style={S.logoutBtn} onPress={deconnexion}>
            <Ionicons name="log-out-outline" size={14} color="#FFFFFF" />
            <Text style={S.logoutText}> {t('common.logout')}</Text>
          </TouchableOpacity>
        </View>
        <View style={S.quickRow}>
          {[
            { icon: 'archive-outline' as const,  label: t('agent.archives'),  route: '/archives' as any },
            { icon: 'search-outline' as const,   label: t('agent.search'),    route: '/agent/recherche' as any },
            { icon: 'time-outline' as const,     label: t('agent.history'),   route: '/agent/historique' as any },
            { icon: 'person-outline' as const,   label: t('agent.myProfile'), route: '/profil' as any },
          ].map(btn => (
            <TouchableOpacity key={btn.label} style={S.quickBtn} onPress={() => router.push(btn.route)}>
              <Ionicons name={btn.icon} size={16} color="#FFFFFF" />
              <Text style={S.quickLabel}>{btn.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={S.counter}>
          <Ionicons name="hourglass-outline" size={14} color="#F59E0B" />
          <Text style={S.counterText}> {demandes.length} {demandes.length > 1 ? t('agent.pendingCountPlural') : t('agent.pendingCount')}</Text>
        </View>
      </View>

      <ScrollView style={S.scroll} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); chargerDemandes(); }} />}>
        {demandes.length === 0 ? (
          <View style={S.empty}>
            <Ionicons name="checkmark-done-circle-outline" size={56} color="#D1D5DB" />
            <Text style={S.emptyTitle}>{t('agent.allTreated')}</Text>
            <Text style={S.emptySub}>{t('agent.noPending')}</Text>
          </View>
        ) : (
          <>
            <Text style={S.sectionNote}>{t('agent.priority')}</Text>
            {demandes.map((d: any, index: number) => {
              const isFirst = index === 0;
              const typeIcon = TYPE_ICON[d.type_acte?.toLowerCase()] || 'document-outline';
              return (
                <TouchableOpacity key={d.id_demande} style={[S.card, isFirst && S.cardFirst, index > 0 && S.cardBlocked]}
                  activeOpacity={0.85}
                  onPress={() => {
                    const premierEnAttente = demandes[0]?.statut_demande === 'EN ATTENTE';
                    if (isFirst || !premierEnAttente) {
                      router.push({ pathname: '/agent/detail_demande' as any, params: { id_demande: d.id_demande, id_agent: agentId } });
                    } else { setShowLock(true); }
                  }}>
                  <View style={[S.priorityBadge, isFirst && S.priorityFirst]}>
                    {isFirst ? <Ionicons name="flame" size={16} color="#FFFFFF" /> : <Text style={S.priorityText}>#{index + 1}</Text>}
                  </View>
                  <View style={S.cardContent}>
                    <View style={S.cardTopRow}>
                      <Text style={S.numDemande}>{d.num_demande}</Text>
                      <View style={S.typeChip}>
                        <Ionicons name={typeIcon as any} size={11} color="#1D4ED8" />
                        <Text style={S.typeText}> {d.type_acte}</Text>
                      </View>
                    </View>
                    <View style={S.cardRow}><Ionicons name="person-outline" size={12} color="#6B7280" /><Text style={S.cardLabel}> {d.citoyen}</Text></View>
                    <View style={S.cardRow}><Ionicons name="location-outline" size={12} color="#6B7280" /><Text style={S.cardLabel}> {d.commune}{d.arrondissement ? ` — ${d.arrondissement}` : ''}</Text></View>
                    <View style={S.cardRow}><Ionicons name="calendar-outline" size={12} color="#6B7280" /><Text style={S.cardLabel}> {t('agent.depositedOn')} {d.date_depot?.split('T')[0]}</Text></View>
                  </View>
                  {index > 0 ? <Ionicons name="lock-closed-outline" size={18} color="#D1D5DB" /> : <Ionicons name="chevron-forward" size={20} color="#D4AF37" />}
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>

      {showLock && (
        <TouchableOpacity style={S.overlay} onPress={() => setShowLock(false)} activeOpacity={1}>
          <TouchableOpacity style={S.modal} activeOpacity={1} onPress={() => {}}>
            <View style={S.modalIcon}><Ionicons name="lock-closed" size={26} color="#EF4444" /></View>
            <Text style={S.modalTitle}>{t('agent.blocked')}</Text>
            <Text style={S.modalText}>{t('agent.blockedMsg')}</Text>
            <TouchableOpacity style={S.modalBtn} onPress={() => setShowLock(false)}>
              <Text style={S.modalBtnText}>{t('common.understood')}</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      )}
    </View>
  );
}
const S = StyleSheet.create({
  root         : { flex: 1, backgroundColor: '#F4F6F9' },
  header       : { backgroundColor: '#0F2942', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerTop    : { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerSub    : { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  agentNom     : { fontSize: 20, fontWeight: '800', color: '#FFFFFF', marginTop: 2 },
  arrText      : { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 },
  logoutBtn    : { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EF4444', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 },
  logoutText   : { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  quickRow     : { flexDirection: 'row', gap: 8, marginTop: 16 },
  quickBtn     : { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, paddingVertical: 10, alignItems: 'center', gap: 4 },
  quickLabel   : { color: '#FFFFFF', fontSize: 10, fontWeight: '600' },
  counter      : { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 10, marginTop: 12 },
  counterText  : { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  scroll       : { flex: 1 },
  sectionNote  : { fontSize: 11, color: '#9CA3AF', fontStyle: 'italic', marginBottom: 10 },
  empty        : { alignItems: 'center', marginTop: 80, gap: 8 },
  emptyTitle   : { fontSize: 18, fontWeight: '700', color: '#374151' },
  emptySub     : { fontSize: 13, color: '#9CA3AF' },
  card         : { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardFirst    : { borderLeftWidth: 4, borderLeftColor: '#EF4444', elevation: 4 },
  cardBlocked  : { opacity: 0.5 },
  priorityBadge: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0F2942', justifyContent: 'center', alignItems: 'center' },
  priorityFirst: { backgroundColor: '#EF4444' },
  priorityText : { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },
  cardContent  : { flex: 1, gap: 3 },
  cardTopRow   : { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  numDemande   : { fontSize: 13, fontWeight: '800', color: '#0F2942' },
  typeChip     : { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DBEAFE', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  typeText     : { fontSize: 10, fontWeight: '600', color: '#1D4ED8' },
  cardRow      : { flexDirection: 'row', alignItems: 'center' },
  cardLabel    : { fontSize: 12, color: '#4B5563' },
  overlay      : { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal        : { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, alignItems: 'center', gap: 10 },
  modalIcon    : { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' },
  modalTitle   : { fontSize: 18, fontWeight: '800', color: '#0F2942' },
  modalText    : { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  modalBtn     : { backgroundColor: '#0F2942', borderRadius: 14, paddingHorizontal: 32, paddingVertical: 12, marginTop: 8 },
  modalBtnText : { color: '#FFFFFF', fontWeight: '700', fontSize: 14 },
});
