import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, TextInput, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import i18n from '../src/i18n';
import api from '../src/config/api';

export default function ProfilScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [role, setRole]         = useState('');
  const [communes, setCommunes] = useState<any[]>([]);
  const [arrondissements, setArrondissements] = useState<any[]>([]);
  const [ancienMdp, setAncienMdp]   = useState('');
  const [nouveauMdp, setNouveauMdp] = useState('');
  const [confirmMdp, setConfirmMdp] = useState('');
  const [form, setForm] = useState({ nom_user: '', prenom_user: '', id_commune: '', id_arondissement: '' });

  const toggleLang = () => i18n.changeLanguage(i18n.language === 'fr' ? 'mg' : 'fr');

  useEffect(() => {
    const charger = async () => {
      const r = await AsyncStorage.getItem('role') || '';
      setRole(r);
      const [resProfil, resCommunes] = await Promise.all([api.get('/accounts/profil/'), api.get('/accounts/communes/')]);
      const p = resProfil.data;
      setForm({ nom_user: p.nom_user || '', prenom_user: p.prenom_user || '', id_commune: String(p.id_commune?.id_commune || ''), id_arondissement: String(p.id_arondissement?.id_arondissement || '') });
      setCommunes(resCommunes.data);
      if (p.id_commune?.id_commune) {
        const c = resCommunes.data.find((c: any) => c.id_commune === p.id_commune.id_commune);
        setArrondissements(c?.arrondissements || []);
      }
      setLoading(false);
    };
    charger().catch(() => { Alert.alert(t('common.error'), t('profil.errorLoad')); setLoading(false); });
  }, []);

  const onCommuneChange = (id: string) => {
    setForm({ ...form, id_commune: id, id_arondissement: '' });
    const c = communes.find((c: any) => String(c.id_commune) === id);
    setArrondissements(c?.arrondissements || []);
  };

  const sauvegarder = async () => {
    if (nouveauMdp) {
      if (!ancienMdp) { Alert.alert(t('common.error'), t('profil.errOldPwd')); return; }
      if (nouveauMdp !== confirmMdp) { Alert.alert(t('common.error'), t('profil.errPwdMatch')); return; }
    }
    setSaving(true);
    try {
      const data: any = { nom_user: form.nom_user, prenom_user: form.prenom_user };
      if (nouveauMdp) { data.ancien_mdp = ancienMdp; data.mdp_user = nouveauMdp; }
      if (role.toLowerCase() === 'citoyen') {
        if (form.id_commune) data.id_commune = parseInt(form.id_commune);
        data.id_arondissement = form.id_arondissement ? parseInt(form.id_arondissement) : null;
      }
      const res = await api.patch('/accounts/profil/', data);
      if (res.data.token) await AsyncStorage.setItem('token', res.data.token);
      Alert.alert(t('common.success'), t('profil.successMsg'), [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) { Alert.alert(t('common.error'), JSON.stringify(err.response?.data || 'Erreur')); }
    finally { setSaving(false); }
  };

  const initiales = `${form.prenom_user?.[0] || ''}${form.nom_user?.[0] || ''}`.toUpperCase();
  const roleLabel = role === 'citoyen' ? t('profil.citizen') : role === 'agent' ? t('profil.agent') : t('profil.admin');

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F6F9' }}>
      <ActivityIndicator size="large" color="#0F2942" />
    </View>
  );

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" />
      <View style={S.header}>
        <View style={S.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
            <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleLang} style={S.langBtn}>
            <Ionicons name="language-outline" size={13} color="#D4AF37" />
            <Text style={S.langText}>{t('common.language')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={S.headerTitle}>{t('profil.title')}</Text>
        <Text style={S.headerSub}>{roleLabel}</Text>
      </View>
      <ScrollView style={S.scroll} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={S.avatarSection}>
          <View style={S.avatar}><Text style={S.avatarText}>{initiales || 'RJ'}</Text></View>
          <Text style={S.avatarName}>{form.prenom_user} {form.nom_user}</Text>
          <View style={S.roleChip}>
            <Ionicons name={role === 'admin' ? 'shield-checkmark-outline' : role === 'agent' ? 'people-outline' : 'person-outline'} size={12} color="#0F2942" />
            <Text style={S.roleText}> {roleLabel}</Text>
          </View>
        </View>

        <View style={S.card}>
          <Text style={S.sectionLabel}>{t('profil.personalInfo')}</Text>
          {[{ ph: t('register.firstName'), k: 'nom_user' }, { ph: t('register.lastName'), k: 'prenom_user' }].map(f => (
            <View key={f.k} style={S.inputRow}>
              <Ionicons name="person-outline" size={18} color="#6B7280" style={S.inputIcon} />
              <TextInput style={S.input} placeholder={f.ph} placeholderTextColor="#9CA3AF"
                value={(form as any)[f.k]} onChangeText={v => setForm({ ...form, [f.k]: v })} />
            </View>
          ))}
        </View>

        {role.toLowerCase() === 'citoyen' && (
          <View style={S.card}>
            <Text style={S.sectionLabel}>{t('profil.location')}</Text>
            <View style={S.pickerRow}>
              <Ionicons name="business-outline" size={18} color="#6B7280" style={S.inputIcon} />
              <Picker selectedValue={form.id_commune} onValueChange={onCommuneChange} style={S.picker}>
                <Picker.Item label={t('profil.chooseCommune')} value="" />
                {communes.map(c => <Picker.Item key={c.id_commune} label={c.nom_commune} value={String(c.id_commune)} />)}
              </Picker>
            </View>
            {arrondissements.length > 0 && (
              <View style={S.pickerRow}>
                <Ionicons name="location-outline" size={18} color="#6B7280" style={S.inputIcon} />
                <Picker selectedValue={form.id_arondissement} onValueChange={v => setForm({ ...form, id_arondissement: v })} style={S.picker}>
                  <Picker.Item label={t('profil.chooseArr')} value="" />
                  {arrondissements.map(a => <Picker.Item key={a.id_arondissement} label={a.nom_arondissement} value={String(a.id_arondissement)} />)}
                </Picker>
              </View>
            )}
          </View>
        )}

        <View style={S.card}>
          <Text style={S.sectionLabel}>{t('profil.changePassword')}</Text>
          {[
            { ph: t('profil.oldPassword'), val: ancienMdp, set: setAncienMdp },
            { ph: t('profil.newPassword'), val: nouveauMdp, set: setNouveauMdp },
            { ph: t('profil.confirm'),     val: confirmMdp, set: setConfirmMdp },
          ].map(f => (
            <View key={f.ph} style={S.inputRow}>
              <Ionicons name="lock-closed-outline" size={18} color="#6B7280" style={S.inputIcon} />
              <TextInput style={S.input} placeholder={f.ph} placeholderTextColor="#9CA3AF" secureTextEntry value={f.val} onChangeText={f.set} />
            </View>
          ))}
          <TouchableOpacity onPress={() => router.push('/mots_de_passe_oublier' as any)} style={S.forgotLink}>
            <Ionicons name="key-outline" size={12} color="#D4AF37" />
            <Text style={S.forgotText}> {t('profil.forgotLink')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={S.saveBtn} onPress={sauvegarder} disabled={saving}>
          {saving ? <ActivityIndicator color="#0F2942" /> : <>
            <Ionicons name="save-outline" size={18} color="#0F2942" />
            <Text style={S.saveBtnText}> {t('common.save')}</Text>
          </>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
const S = StyleSheet.create({
  root        : { flex: 1, backgroundColor: '#F4F6F9' },
  header      : { backgroundColor: '#0F2942', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerRow   : { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  backBtn     : { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  langBtn     : { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  langText    : { color: '#D4AF37', fontSize: 11, fontWeight: '700' },
  headerTitle : { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerSub   : { fontSize: 12, color: '#D4AF37', fontWeight: '600', marginTop: 2 },
  scroll      : { flex: 1 },
  avatarSection: { alignItems: 'center', paddingVertical: 24, gap: 6 },
  avatar      : { width: 80, height: 80, borderRadius: 28, backgroundColor: '#0F2942', justifyContent: 'center', alignItems: 'center', shadowColor: '#0F2942', shadowOpacity: 0.3, shadowRadius: 12, elevation: 6 },
  avatarText  : { color: '#D4AF37', fontWeight: '800', fontSize: 24 },
  avatarName  : { fontSize: 16, fontWeight: '800', color: '#0F2942' },
  roleChip    : { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(212,175,55,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  roleText    : { fontSize: 12, fontWeight: '600', color: '#0F2942' },
  card        : { backgroundColor: '#FFFFFF', marginHorizontal: 16, marginBottom: 12, borderRadius: 20, padding: 16, gap: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  sectionLabel: { fontSize: 10, fontWeight: '700', color: '#9CA3AF', letterSpacing: 1.5, marginBottom: 2 },
  inputRow    : { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F6F9', borderRadius: 14, paddingHorizontal: 14, height: 50, borderWidth: 1, borderColor: '#E5E7EB' },
  pickerRow   : { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F6F9', borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  inputIcon   : { marginRight: 10 },
  input       : { flex: 1, fontSize: 14, color: '#1F2937' },
  picker      : { flex: 1, color: '#1F2937' },
  forgotLink  : { flexDirection: 'row', alignItems: 'center' },
  forgotText  : { color: '#D4AF37', fontSize: 12, fontWeight: '600' },
  saveBtn     : { backgroundColor: '#D4AF37', marginHorizontal: 16, borderRadius: 16, height: 52, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', shadowColor: '#D4AF37', shadowOpacity: 0.4, shadowRadius: 10, elevation: 4 },
  saveBtnText : { color: '#0F2942', fontWeight: '800', fontSize: 15 },
});
