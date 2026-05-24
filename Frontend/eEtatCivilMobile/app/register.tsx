import { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import api from '../src/config/api';

export default function RegisterScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [communes, setCommunes]               = useState<any[]>([]);
  const [arrondissements, setArrondissements] = useState<any[]>([]);
  const [form, setForm] = useState({ nom_user: '', prenom_user: '', email: '', mdp_user: '', id_commune: null as number | null, id_arondissement: null as number | null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/accounts/communes/').then(res => setCommunes(res.data))
      .catch(() => Alert.alert(t('common.error'), 'Impossible de charger les communes.'));
  }, []);

  const onCommuneChange = (id: number) => {
    if (id === 0) { setForm(p => ({ ...p, id_commune: null, id_arondissement: null })); setArrondissements([]); return; }
    const commune = communes.find(c => c.id_commune === id);
    setForm(p => ({ ...p, id_commune: id, id_arondissement: null }));
    setArrondissements(commune?.arrondissements || []);
  };

  const handleRegister = async () => {
    if (!form.nom_user || !form.prenom_user || !form.email || !form.mdp_user || !form.id_commune) {
      Alert.alert(t('common.error'), t('register.errorFields')); return;
    }
    const body: any = { nom_user: form.nom_user, prenom_user: form.prenom_user, email: form.email, mdp_user: form.mdp_user, id_commune: form.id_commune };
    if (form.id_arondissement) body.id_arondissement = form.id_arondissement;
    setLoading(true);
    try {
      const res = await api.post('/accounts/register/', body);
      await AsyncStorage.setItem('token', res.data.token);
      await AsyncStorage.setItem('role', res.data.role);
      router.replace('/citoyen/acceuil' as any);
    } catch (err: any) { Alert.alert(t('common.error'), JSON.stringify(err.response?.data || 'Erreur')); }
    finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" />
      <View style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
          <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={S.headerTitle}>{t('register.title')}</Text>
        <Text style={S.headerSub}>{t('register.subtitle')}</Text>
      </View>
      <ScrollView style={S.scroll} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={S.card}>
          <Text style={S.sectionLabel}>{t('register.identity')}</Text>
          <View style={S.inputRow}>
            <Ionicons name="person-outline" size={18} color="#6B7280" style={S.inputIcon} />
            <TextInput style={S.input} placeholder={t('register.firstName')} placeholderTextColor="#9CA3AF"
              value={form.nom_user} onChangeText={v => setForm(p => ({ ...p, nom_user: v }))} autoCapitalize="words" />
          </View>
          <View style={S.inputRow}>
            <Ionicons name="person-outline" size={18} color="#6B7280" style={S.inputIcon} />
            <TextInput style={S.input} placeholder={t('register.lastName')} placeholderTextColor="#9CA3AF"
              value={form.prenom_user} onChangeText={v => setForm(p => ({ ...p, prenom_user: v }))} autoCapitalize="words" />
          </View>
        </View>
        <View style={S.card}>
          <Text style={S.sectionLabel}>{t('register.account')}</Text>
          <View style={S.inputRow}>
            <Ionicons name="mail-outline" size={18} color="#6B7280" style={S.inputIcon} />
            <TextInput style={S.input} placeholder={t('register.email')} placeholderTextColor="#9CA3AF"
              value={form.email} onChangeText={v => setForm(p => ({ ...p, email: v }))} keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View style={S.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color="#6B7280" style={S.inputIcon} />
            <TextInput style={S.input} placeholder={t('register.password')} placeholderTextColor="#9CA3AF"
              value={form.mdp_user} onChangeText={v => setForm(p => ({ ...p, mdp_user: v }))} secureTextEntry />
          </View>
        </View>
        <View style={S.card}>
          <Text style={S.sectionLabel}>{t('register.location')}</Text>
          <View style={S.pickerRow}>
            <Ionicons name="business-outline" size={18} color="#6B7280" style={S.inputIcon} />
            <Picker selectedValue={form.id_commune ?? 0} onValueChange={(val: number) => onCommuneChange(val)} style={S.picker}>
              <Picker.Item label={t('register.chooseCommune')} value={0} />
              {communes.map(c => <Picker.Item key={c.id_commune} label={c.nom_commune} value={c.id_commune} />)}
            </Picker>
          </View>
          {arrondissements.length > 0 && (
            <View style={S.pickerRow}>
              <Ionicons name="location-outline" size={18} color="#6B7280" style={S.inputIcon} />
              <Picker selectedValue={form.id_arondissement} onValueChange={val => setForm(p => ({ ...p, id_arondissement: val }))} style={S.picker}>
                <Picker.Item label={t('register.chooseArr')} value={null} />
                {arrondissements.map(a => <Picker.Item key={a.id_arondissement} label={a.nom_arondissement || `Arrondissement ${a.num_arondissement}`} value={a.id_arondissement} />)}
              </Picker>
            </View>
          )}
        </View>
        <TouchableOpacity style={S.btn} onPress={handleRegister} disabled={loading}>
          {loading ? <ActivityIndicator color="#0F2942" /> : <Text style={S.btnText}>{t('register.submit')}</Text>}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={S.link}>{t('register.alreadyAccount')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const S = StyleSheet.create({
  header      : { backgroundColor: '#0F2942', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  backBtn     : { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  headerTitle : { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
  headerSub   : { fontSize: 12, color: '#D4AF37', fontWeight: '600', marginTop: 2 },
  scroll      : { flex: 1, backgroundColor: '#F4F6F9' },
  card        : { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginTop: 14, borderRadius: 20, padding: 16, gap: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1.5, marginBottom: 2 },
  inputRow    : { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F6F9', borderRadius: 14, paddingHorizontal: 14, height: 50, borderWidth: 1, borderColor: '#E5E7EB' },
  pickerRow   : { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F6F9', borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  inputIcon   : { marginRight: 10 },
  input       : { flex: 1, fontSize: 14, color: '#1F2937' },
  picker      : { flex: 1, color: '#1F2937' },
  btn         : { backgroundColor: '#D4AF37', marginHorizontal: 16, marginTop: 20, borderRadius: 16, height: 52, justifyContent: 'center', alignItems: 'center' },
  btnText     : { color: '#0F2942', fontWeight: '800', fontSize: 15 },
  link        : { textAlign: 'center', color: '#0F2942', fontWeight: '600', fontSize: 13 },
});
