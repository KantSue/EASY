import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Switch, TextInput, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import api from '../../src/config/api';

type Onglet = 'stats' | 'citoyens' | 'agents' | 'communes' | 'archives';

const TABS: { id: Onglet; icon: string; label: string }[] = [
  { id: 'stats',    icon: 'bar-chart-outline',   label: 'Stats' },
  { id: 'citoyens', icon: 'people-outline',       label: 'Citoyens' },
  { id: 'agents',   icon: 'person-outline',       label: 'Agents' },
  { id: 'communes', icon: 'business-outline',     label: 'Communes' },
  { id: 'archives', icon: 'archive-outline',      label: 'Archives' },
];

export default function DashboardScreen() {
  const router = useRouter();
  const [onglet, setOnglet]               = useState<Onglet>('stats');
  const [stats, setStats]                 = useState<any>(null);
  const [citoyens, setCitoyens]           = useState<any[]>([]);
  const [agents, setAgents]               = useState<any[]>([]);
  const [arrondissements, setArr]         = useState<any[]>([]);
  const [communes, setCommunes]           = useState<any[]>([]);
  const [loading, setLoading]             = useState(true);
  const [loadingSwitch, setLoadingSwitch] = useState<number | null>(null);
  const [showForm, setShowForm]           = useState(false);
  const [creatingAgent, setCreatingAgent] = useState(false);
  const [form, setForm] = useState({ nom_user: '', prenom_user: '', email: '', matricule: '', id_arondissement: '', id_commune: '' });

  useEffect(() => { chargerTout(); }, []);

  const chargerTout = async () => {
    setLoading(true);
    try {
      const [resStats, resCitoyens, resAgents, resArr, resCommunes] = await Promise.all([
        api.get('/dashboard/stats/'), api.get('/dashboard/citoyens/'), api.get('/dashboard/agents/'),
        api.get('/dashboard/arrondissements/'), api.get('/accounts/communes/'),
      ]);
      setStats(resStats.data);
      setCitoyens(resCitoyens.data.results || resCitoyens.data);
      setAgents(resAgents.data.results || resAgents.data);
      setArr(resArr.data);
      setCommunes(resCommunes.data);
    } catch { Alert.alert('Erreur', 'Impossible de charger les données.'); }
    finally { setLoading(false); }
  };

  const changerStatut = async (id: number, statutActuel: string) => {
    const nouveau = statutActuel === 'disponible' ? 'indisponible' : 'disponible';
    setLoadingSwitch(id);
    try {
      await api.patch(`/dashboard/arrondissements/${id}/`, { statut: nouveau });
      setArr(prev => prev.map(a => a.id_arondissement === id ? { ...a, statut: nouveau } : a));
    } catch { Alert.alert('Erreur', 'Impossible de modifier le statut.'); }
    finally { setLoadingSwitch(null); }
  };

  const creerAgent = async () => {
    if (!form.nom_user || !form.prenom_user || !form.email || !form.matricule || !form.id_commune) {
      Alert.alert('Erreur', 'Tous les champs sont obligatoires.'); return;
    }
    setCreatingAgent(true);
    try {
      await api.post('/accounts/agents/', { nom_user: form.nom_user, prenom_user: form.prenom_user, email: form.email, matricule: parseInt(form.matricule), id_commune: parseInt(form.id_commune), id_arondissement: form.id_arondissement ? parseInt(form.id_arondissement) : null });
      Alert.alert('Succès', 'Agent créé.');
      setShowForm(false);
      setForm({ nom_user: '', prenom_user: '', email: '', matricule: '', id_arondissement: '', id_commune: '' });
      chargerTout();
    } catch (err: any) { Alert.alert('Erreur', JSON.stringify(err.response?.data || 'Erreur')); }
    finally { setCreatingAgent(false); }
  };

  const supprimerAgent = (id_agent: number) => {
    Alert.alert('Confirmer', 'Supprimer cet agent ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: async () => {
        try { await api.delete(`/dashboard/agents/${id_agent}/`); Alert.alert('Succès', 'Agent supprimé.'); chargerTout(); }
        catch { Alert.alert('Erreur', 'Impossible de supprimer.'); }
      }}
    ]);
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

      {/* Header */}
      <View style={S.header}>
        <View style={S.headerTop}>
          <View>
            <Text style={S.headerTitle}>Tableau de bord</Text>
            <Text style={S.headerSub}>Administrateur</Text>
          </View>
          <TouchableOpacity style={S.logoutBtn} onPress={deconnexion}>
            <Ionicons name="log-out-outline" size={14} color="#FFFFFF" />
            <Text style={S.logoutText}> Sortir</Text>
          </TouchableOpacity>
        </View>

        {/* Onglets */}
        <View style={S.tabs}>
          {TABS.map(t => (
            <TouchableOpacity key={t.id} style={[S.tab, onglet === t.id && S.tabActive]}
              onPress={() => { if (t.id === 'archives') { router.push('/archives' as any); return; } setOnglet(t.id); }}>
              <Ionicons name={t.icon as any} size={18} color={onglet === t.id ? '#D4AF37' : 'rgba(255,255,255,0.5)'} />
              <Text style={[S.tabLabel, onglet === t.id && S.tabLabelActive]}>{t.label}</Text>
              {onglet === t.id && <View style={S.tabUnderline} />}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView style={S.scroll} contentContainerStyle={{ paddingBottom: 40 }}>

        {/* ── STATS ── */}
        {onglet === 'stats' && stats && (<>
          <Text style={S.sectionTitle}>Demandes</Text>
          <View style={S.grid2}>
            {[
              { label: 'Total',      val: stats.demandes.total,      color: '#0F2942' },
              { label: 'En attente', val: stats.demandes.en_attente, color: '#F59E0B' },
              { label: 'Validées',   val: stats.demandes.valider,    color: '#22C55E' },
              { label: 'Refusées',   val: stats.demandes.refuser,    color: '#EF4444' },
              { label: 'Terminées',  val: stats.demandes.terminer,   color: '#8B5CF6' },
              { label: 'Délai moy.', val: `${stats.delai_moyen_jours}j`, color: '#3B82F6' },
            ].map(s => (
              <View key={s.label} style={[S.kpiCard, { borderLeftColor: s.color }]}>
                <Text style={[S.kpiVal, { color: s.color }]}>{s.val}</Text>
                <Text style={S.kpiLabel}>{s.label}</Text>
              </View>
            ))}
          </View>

          <Text style={S.sectionTitle}>Paiements</Text>
          <View style={S.grid2}>
            <View style={[S.kpiCard, { borderLeftColor: '#22C55E' }]}>
              <Text style={[S.kpiVal, { color: '#22C55E' }]}>{stats.paiements.total_confirme}</Text>
              <Text style={S.kpiLabel}>Confirmés</Text>
            </View>
            <View style={[S.kpiCard, { borderLeftColor: '#0F2942' }]}>
              <Text style={[S.kpiVal, { color: '#0F2942', fontSize: 18 }]}>{stats.paiements.montant_total} Ar</Text>
              <Text style={S.kpiLabel}>Montant total</Text>
            </View>
          </View>

          <Text style={S.sectionTitle}>Par type d'acte</Text>
          {stats.par_type.map((t: any, i: number) => (
            <View key={i} style={S.row}>
              <Text style={S.rowLabel}>{t.libelle}</Text>
              <Text style={S.rowVal}>{t.total}</Text>
            </View>
          ))}

          <Text style={S.sectionTitle}>Actions récentes</Text>
          {stats.journal_recent.map((j: any, i: number) => (
            <View key={i} style={S.card}>
              <View style={S.cardRow}>
                <Text style={S.cardName}>{j.agent}</Text>
                <View style={[S.actionBadge, { backgroundColor: j.action === 'VALIDER' ? '#22C55E' : j.action === 'REFUSER' ? '#EF4444' : '#3B82F6' }]}>
                  <Ionicons name={j.action === 'VALIDER' ? 'checkmark-circle' : 'close-circle'} size={11} color="#FFFFFF" />
                  <Text style={S.actionText}> {j.action}</Text>
                </View>
              </View>
              <Text style={S.cardDate}>{j.date}</Text>
            </View>
          ))}
        </>)}

        {/* ── CITOYENS ── */}
        {onglet === 'citoyens' && (<>
          <Text style={S.sectionTitle}>Citoyens ({citoyens.length})</Text>
          {citoyens.map((c: any, i: number) => (
            <View key={i} style={S.card}>
              <Text style={S.memberName}>{c.id_user.prenom_user} {c.id_user.nom_user}</Text>
              <Text style={S.memberEmail}>{c.id_user.email}</Text>
              <Text style={S.memberInfo}>{c.id_user.commune}{c.id_user.arrondissement ? ` — ${c.id_user.arrondissement}` : ''}</Text>
              <Text style={S.memberInfo}>Inscrit le : {c.id_user.date_inscription}</Text>
              <View style={S.statRow}>
                {[
                  { label: 'Total',     val: c.demandes.total,      color: '#0F2942' },
                  { label: 'Attente',   val: c.demandes.en_attente, color: '#F59E0B' },
                  { label: 'Validées',  val: c.demandes.valider,    color: '#22C55E' },
                  { label: 'Terminées', val: c.demandes.terminer,   color: '#8B5CF6' },
                ].map(s => (
                  <View key={s.label} style={[S.statBadge, { backgroundColor: s.color }]}>
                    <Text style={S.statBadgeVal}>{s.val}</Text>
                    <Text style={S.statBadgeLabel}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </>)}

        {/* ── AGENTS ── */}
        {onglet === 'agents' && (<>
          <View style={S.agentHeader}>
            <Text style={S.sectionTitle}>Agents ({agents.length})</Text>
            <TouchableOpacity style={S.newAgentBtn} onPress={() => setShowForm(!showForm)}>
              <Ionicons name={showForm ? 'close' : 'add'} size={16} color="#0F2942" />
              <Text style={S.newAgentText}>{showForm ? 'Annuler' : 'Nouvel agent'}</Text>
            </TouchableOpacity>
          </View>

          {showForm && (
            <View style={[S.card, { borderWidth: 2, borderColor: '#D4AF37' }]}>
              <Text style={S.formTitle}>Créer un agent</Text>
              {[
                { ph: 'Nom', key: 'nom_user' }, { ph: 'Prénom', key: 'prenom_user' },
                { ph: 'Email', key: 'email' }, { ph: 'Matricule', key: 'matricule', numeric: true },
              ].map(f => (
                <View key={f.key} style={S.inputRow}>
                  <TextInput style={S.input} placeholder={f.ph} placeholderTextColor="#9CA3AF"
                    value={(form as any)[f.key]} onChangeText={v => setForm({ ...form, [f.key]: v })}
                    keyboardType={f.numeric ? 'numeric' : 'default'} />
                </View>
              ))}
              <View style={S.pickerRow}>
                <Picker selectedValue={form.id_commune} onValueChange={v => setForm({ ...form, id_commune: v, id_arondissement: '' })} style={S.picker}>
                  <Picker.Item label="-- Commune --" value="" />
                  {communes.map((c: any) => <Picker.Item key={c.id_commune} label={c.nom_commune} value={String(c.id_commune)} />)}
                </Picker>
              </View>
              {form.id_commune && communes.find((c: any) => String(c.id_commune) === form.id_commune)?.arrondissements?.length > 0 && (
                <View style={S.pickerRow}>
                  <Picker selectedValue={form.id_arondissement} onValueChange={v => setForm({ ...form, id_arondissement: v })} style={S.picker}>
                    <Picker.Item label="-- Arrondissement --" value="" />
                    {communes.find((c: any) => String(c.id_commune) === form.id_commune)?.arrondissements?.map((a: any) => (
                      <Picker.Item key={a.id_arondissement} label={a.nom_arondissement} value={String(a.id_arondissement)} />
                    ))}
                  </Picker>
                </View>
              )}
              <TouchableOpacity style={S.createBtn} onPress={creerAgent} disabled={creatingAgent}>
                {creatingAgent ? <ActivityIndicator color="#0F2942" /> : <Text style={S.createBtnText}>Créer l'agent</Text>}
              </TouchableOpacity>
            </View>
          )}

          {agents.map((a: any, i: number) => (
            <View key={i} style={S.card}>
              <View style={S.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={S.memberName}>{a.prenom_user} {a.nom_user}</Text>
                  <Text style={S.memberEmail}>{a.email}</Text>
                  <Text style={S.memberInfo}>{a.arrondissement} — {a.commune}</Text>
                </View>
                <TouchableOpacity onPress={() => supprimerAgent(a.id_agent)} style={S.deleteBtn}>
                  <Ionicons name="trash-outline" size={18} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </>)}

        {/* ── COMMUNES ── */}
        {onglet === 'communes' && (<>
          <Text style={S.sectionTitle}>Arrondissements</Text>
          <Text style={S.infoText}>Activez ou désactivez un arrondissement. Les citoyens seront redirigés vers le plus proche disponible.</Text>
          {arrondissements.map((a: any) => (
            <View key={a.id_arondissement} style={S.card}>
              <View style={S.cardRow}>
                <View style={{ flex: 1 }}>
                  <Text style={S.memberName}>{a.nom_arondissement}</Text>
                  <Text style={S.memberInfo}>{a.commune}</Text>
                  <View style={[S.statusChip, { backgroundColor: a.statut === 'disponible' ? '#DCFCE7' : '#FEE2E2' }]}>
                    <Ionicons name={a.statut === 'disponible' ? 'checkmark-circle-outline' : 'close-circle-outline'} size={11} color={a.statut === 'disponible' ? '#22C55E' : '#EF4444'} />
                    <Text style={[S.statusText, { color: a.statut === 'disponible' ? '#22C55E' : '#EF4444' }]}> {a.statut === 'disponible' ? 'Disponible' : 'Indisponible'}</Text>
                  </View>
                </View>
                {loadingSwitch === a.id_arondissement
                  ? <ActivityIndicator color="#0F2942" />
                  : <Switch value={a.statut === 'disponible'} onValueChange={() => changerStatut(a.id_arondissement, a.statut)}
                      trackColor={{ false: '#EF4444', true: '#22C55E' }} thumbColor="#fff" />
                }
              </View>
            </View>
          ))}
        </>)}

      </ScrollView>
    </View>
  );
}

const NAV  = '#0F2942';
const GOLD = '#D4AF37';

const S = StyleSheet.create({
  root        : { flex: 1, backgroundColor: '#F4F6F9' },
  header      : { backgroundColor: NAV, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 0, borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  headerTop   : { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 16 },
  headerTitle : { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  headerSub   : { fontSize: 12, color: GOLD, fontWeight: '600', marginTop: 2 },
  logoutBtn   : { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EF4444', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 12 },
  logoutText  : { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  tabs        : { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16, padding: 2 },
  tab         : { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 3, position: 'relative', borderRadius: 14 },
  tabActive   : {},
  tabLabel    : { fontSize: 9, fontWeight: '600', color: 'rgba(255,255,255,0.5)' },
  tabLabelActive: { color: GOLD },
  tabUnderline: { position: 'absolute', bottom: 2, left: '25%', right: '25%', height: 2, backgroundColor: GOLD, borderRadius: 2 },
  scroll      : { flex: 1, paddingTop: 8 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: NAV, marginHorizontal: 16, marginTop: 16, marginBottom: 8 },
  grid2       : { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 8, marginBottom: 4 },
  kpiCard     : { flex: 1, minWidth: '45%', backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, borderLeftWidth: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  kpiVal      : { fontSize: 22, fontWeight: '800' },
  kpiLabel    : { fontSize: 11, color: '#6B7280', marginTop: 4 },
  row         : { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 6, padding: 14, borderRadius: 12 },
  rowLabel    : { fontSize: 14, color: '#374151' },
  rowVal      : { fontSize: 14, fontWeight: '800', color: NAV },
  card        : { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 10, borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, gap: 4 },
  cardRow     : { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardName    : { fontSize: 13, fontWeight: '700', color: NAV },
  cardDate    : { fontSize: 11, color: '#9CA3AF' },
  actionBadge : { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  actionText  : { color: '#FFFFFF', fontWeight: '700', fontSize: 10 },
  memberName  : { fontSize: 14, fontWeight: '700', color: NAV },
  memberEmail : { fontSize: 12, color: '#6B7280', marginTop: 2 },
  memberInfo  : { fontSize: 12, color: '#9CA3AF', marginTop: 2 },
  statRow     : { flexDirection: 'row', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  statBadge   : { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 5, alignItems: 'center', minWidth: 60 },
  statBadgeVal: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  statBadgeLabel: { color: '#FFFFFF', fontSize: 9, marginTop: 1 },
  agentHeader : { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginRight: 16 },
  newAgentBtn : { flexDirection: 'row', alignItems: 'center', backgroundColor: GOLD, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, gap: 4 },
  newAgentText: { color: NAV, fontSize: 12, fontWeight: '700' },
  formTitle   : { fontSize: 14, fontWeight: '800', color: NAV, marginBottom: 8 },
  inputRow    : { backgroundColor: '#F4F6F9', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 4 },
  input       : { paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: '#1F2937' },
  pickerRow   : { backgroundColor: '#F4F6F9', borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 4 },
  picker      : { color: '#1F2937' },
  createBtn   : { backgroundColor: '#22C55E', borderRadius: 12, padding: 12, alignItems: 'center', marginTop: 6 },
  createBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  deleteBtn   : { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center' },
  infoText    : { fontSize: 12, color: '#6B7280', marginHorizontal: 16, marginBottom: 12, lineHeight: 18 },
  statusChip  : { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start', marginTop: 4 },
  statusText  : { fontSize: 11, fontWeight: '600' },
});
