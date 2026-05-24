import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import '../src/i18n';
import i18n from '../src/i18n';
import api from '../src/config/api';

export default function LoginScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail]     = useState('');
  const [mdp, setMdp]         = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleLang = () => i18n.changeLanguage(i18n.language === 'fr' ? 'mg' : 'fr');

  const handleLogin = async () => {
    if (!email || !mdp) { Alert.alert(t('common.error'), t('login.errorFields')); return; }
    setLoading(true);
    try {
      const res = await api.post('/accounts/login/', { email, mdp_user: mdp });
      const { token, role } = res.data;
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('role', role);
      if (role.toLowerCase() === 'citoyen') router.replace('/citoyen/acceuil');
      else if (role.toLowerCase() === 'agent') router.replace('/agent/file_attente');
      else router.replace('/admin/dashboard');
    } catch {
      Alert.alert(t('common.error'), t('login.errorCreds'));
    } finally { setLoading(false); }
  };

  return (
    <KeyboardAvoidingView style={S.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" />
      <View style={[S.blob, { top: -80, left: -60 }]} />
      <View style={[S.blob, { bottom: -100, right: -60, backgroundColor: 'rgba(212,175,55,0.12)', width: 260, height: 260 }]} />

      {/* Lang switcher */}
      <TouchableOpacity style={S.langBtn} onPress={toggleLang}>
        <Ionicons name="language-outline" size={14} color="#D4AF37" />
        <Text style={S.langText}>{t('common.language')}</Text>
      </TouchableOpacity>

      <View style={S.inner}>
        <View style={S.logoWrap}>
          <View style={S.logoBox}>
            <Ionicons name="shield-checkmark" size={48} color="#D4AF37" />
          </View>
        </View>
        <Text style={S.appName}>{t('login.title')} <Text style={S.appYear}>{t('login.year')}</Text></Text>
        <View style={S.pill}>
          <View style={S.dot} />
          <Text style={S.pillText}>{t('login.republic')}</Text>
        </View>

        <View style={S.form}>
          <View style={S.inputRow}>
            <Ionicons name="mail-outline" size={18} color="#6B7280" style={S.inputIcon} />
            <TextInput style={S.input} placeholder={t('login.email')} placeholderTextColor="#9CA3AF"
              keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
          </View>
          <View style={S.inputRow}>
            <Ionicons name="lock-closed-outline" size={18} color="#6B7280" style={S.inputIcon} />
            <TextInput style={[S.input, { flex: 1 }]} placeholder={t('login.password')} placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPw} value={mdp} onChangeText={setMdp} />
            <TouchableOpacity onPress={() => setShowPw(!showPw)} style={S.eyeBtn}>
              <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={() => router.push('/mots_de_passe_oublier' as any)} style={S.forgotRow}>
            <Text style={S.forgotText}>{t('login.forgot')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={S.btn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#0F2942" /> : <>
              <Text style={S.btnText}>{t('login.submit')}</Text>
              <Ionicons name="chevron-forward" size={18} color="#0F2942" />
            </>}
          </TouchableOpacity>
        </View>

        <View style={S.registerRow}>
          <Text style={S.registerLabel}>{t('login.noAccount')}</Text>
          <TouchableOpacity onPress={() => router.push('/register' as any)}>
            <Text style={S.registerLink}>{t('login.register')}</Text>
          </TouchableOpacity>
        </View>
        <View style={S.secureRow}>
          <Ionicons name="lock-closed" size={10} color="#6B7280" />
          <Text style={S.secureText}> {t('login.encrypted')}</Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const S = StyleSheet.create({
  root        : { flex: 1, backgroundColor: '#0F2942' },
  blob        : { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.06)' },
  langBtn     : { position: 'absolute', top: 56, right: 20, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, zIndex: 10 },
  langText    : { color: '#D4AF37', fontSize: 12, fontWeight: '700' },
  inner       : { flex: 1, justifyContent: 'center', paddingHorizontal: 28, paddingBottom: 24 },
  logoWrap    : { alignItems: 'center', marginBottom: 20 },
  logoBox     : { width: 96, height: 96, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.08)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)' },
  appName     : { textAlign: 'center', fontSize: 30, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.5 },
  appYear     : { color: '#D4AF37' },
  pill        : { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 6, marginBottom: 28 },
  dot         : { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D4AF37', marginRight: 6 },
  pillText    : { color: 'rgba(255,255,255,0.65)', fontSize: 12 },
  form        : { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, gap: 12 },
  inputRow    : { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F6F9', borderRadius: 14, paddingHorizontal: 14, height: 50, borderWidth: 1, borderColor: '#E5E7EB' },
  inputIcon   : { marginRight: 10 },
  input       : { flex: 1, fontSize: 14, color: '#1F2937' },
  eyeBtn      : { padding: 4 },
  forgotRow   : { alignItems: 'flex-end', marginTop: -4 },
  forgotText  : { color: '#D4AF37', fontSize: 12, fontWeight: '700' },
  btn         : { backgroundColor: '#D4AF37', borderRadius: 14, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 },
  btnText     : { color: '#0F2942', fontWeight: '800', fontSize: 15 },
  registerRow : { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  registerLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 13 },
  registerLink: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  secureRow   : { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  secureText  : { color: 'rgba(255,255,255,0.35)', fontSize: 11 },
});
