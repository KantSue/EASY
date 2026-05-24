import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert, ScrollView, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../src/config/api';

export default function ArchivesScreen() {
  const router = useRouter();
  const [query, setQuery]             = useState('');
  const [actes, setActes]             = useState<any[]>([]);
  const [types, setTypes]             = useState<any[]>([]);
  const [filtreType, setFiltreType]   = useState<string>('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => { chargerActes(); }, [filtreType]);

  const chargerActes = async () => {
    setLoading(true);
    try {
      const url = filtreType ? `/dashboard/actes/?type=${filtreType}` : '/dashboard/actes/';
      const res = await api.get(url);
      setActes(res.data.actes);
      setTypes(res.data.types);
    } catch { Alert.alert('Erreur', 'Impossible de charger les archives.'); }
    finally { setLoading(false); }
  };

  const chercherSuggestions = async (text: string) => {
    setQuery(text);
    if (text.length < 2) { setSuggestions([]); return; }
    try {
      const res = await api.get(`/dashboard/recherche/suggestions/?q=${text}`);
      setSuggestions(res.data);
    } catch {}
  };

  const chercher = async () => {
    if (!query.trim()) { chargerActes(); return; }
    setLoading(true); setSuggestions([]);
    try {
      const res = await api.get(`/dashboard/recherche/?q=${query}`);
      setActes(res.data.resultats || res.data);
    } catch { Alert.alert('Erreur', 'Recherche impossible.'); }
    finally { setLoading(false); }
  };

  const allerVersActe = (id_acte: number) => {
    setSuggestions([]);
    router.push({ pathname: '/agent/acte' as any, params: { id_acte } });
  };

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" />
      <View style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
          <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={S.headerTitle}>Archives</Text>
        <Text style={S.headerSub}>{actes.length} actes enregistrés</Text>
      </View>

      {/* Barre de recherche */}
      <View style={S.searchWrap}>
        <View style={S.searchRow}>
          <Ionicons name="search-outline" size={18} color="#9CA3AF" style={{ marginRight: 8 }} />
          <TextInput
            style={S.searchInput}
            value={query}
            onChangeText={chercherSuggestions}
            placeholder="Nom, prénom, numéro d'acte..."
            placeholderTextColor="#9CA3AF"
            autoCapitalize="none"
            returnKeyType="search"
            onSubmitEditing={chercher}
          />
          <TouchableOpacity onPress={chercher} style={S.searchBtn}>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        {suggestions.length > 0 && (
          <View style={S.suggestions}>
            {suggestions.map((s: any, i: number) => (
              <TouchableOpacity key={i} style={S.suggestion} onPress={() => allerVersActe(s.id_acte)}>
                <View style={S.suggRow}>
                  <Ionicons name="document-text-outline" size={14} color="#0F2942" />
                  <Text style={S.suggNum}> {s.num_acte}</Text>
                </View>
                <Text style={S.suggNoms}>{s.personnes?.join(' • ') || ''}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Filtres */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={S.filterScroll}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
        <TouchableOpacity style={[S.chip, filtreType === '' && S.chipActive]} onPress={() => { setFiltreType(''); setQuery(''); }}>
          <Text style={[S.chipText, filtreType === '' && S.chipTextActive]}>Tous</Text>
        </TouchableOpacity>
        {types.map((t: any) => (
          <TouchableOpacity key={t.id} style={[S.chip, filtreType === String(t.id) && S.chipActive]}
            onPress={() => { setFiltreType(String(t.id)); setQuery(''); }}>
            <Text style={[S.chipText, filtreType === String(t.id) && S.chipTextActive]}>{t.libelle}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator size="large" color="#0F2942" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={actes}
          keyExtractor={(item, i) => String(i)}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={S.empty}>
              <Ionicons name="archive-outline" size={48} color="#D1D5DB" />
              <Text style={S.emptyText}>Aucun acte trouvé.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity style={S.card} onPress={() => allerVersActe(item.id_acte)} activeOpacity={0.85}>
              <View style={S.cardTop}>
                <Text style={S.cardNum}>{item.num_acte}</Text>
                <View style={S.typeChip}>
                  <Text style={S.typeText}>{item.type_acte}</Text>
                </View>
              </View>
              {Array.isArray(item.personnes) && item.personnes.map((p: any, i: number) => (
                <Text key={i} style={S.cardNom}>{p.prenom_personne} {p.nom_personne}</Text>
              ))}
              <View style={S.dateRow}>
                <Ionicons name="calendar-outline" size={11} color="#9CA3AF" />
                <Text style={S.dateText}> {item.date_acte}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#D4AF37" style={{ position: 'absolute', right: 14, top: '50%' }} />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const NAV  = '#0F2942';
const GOLD = '#D4AF37';

const S = StyleSheet.create({
  root        : { flex: 1, backgroundColor: '#F4F6F9' },
  header      : { backgroundColor: NAV, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  backBtn     : { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  headerTitle : { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerSub   : { fontSize: 12, color: GOLD, fontWeight: '600', marginTop: 2 },
  searchWrap  : { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 },
  searchRow   : { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 14, paddingHorizontal: 14, height: 48, borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  searchInput : { flex: 1, fontSize: 14, color: '#1F2937' },
  searchBtn   : { backgroundColor: NAV, borderRadius: 10, width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  suggestions : { backgroundColor: '#FFFFFF', borderRadius: 12, marginTop: 4, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4 },
  suggestion  : { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  suggRow     : { flexDirection: 'row', alignItems: 'center' },
  suggNum     : { fontSize: 13, fontWeight: '700', color: NAV },
  suggNoms    : { fontSize: 11, color: '#9CA3AF', marginTop: 2 },
  filterScroll: { flexGrow: 0, paddingVertical: 10 },
  chip        : { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E5E7EB' },
  chipActive  : { backgroundColor: GOLD, borderColor: GOLD },
  chipText    : { fontSize: 12, fontWeight: '600', color: NAV },
  chipTextActive: { color: NAV },
  empty       : { alignItems: 'center', gap: 8, marginTop: 40 },
  emptyText   : { color: '#9CA3AF', fontSize: 15 },
  card        : { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, gap: 4 },
  cardTop     : { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardNum     : { fontSize: 13, fontWeight: '800', color: NAV },
  typeChip    : { backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  typeText    : { fontSize: 11, fontWeight: '600', color: '#1D4ED8' },
  cardNom     : { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  dateRow     : { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  dateText    : { fontSize: 11, color: '#9CA3AF' },
});
