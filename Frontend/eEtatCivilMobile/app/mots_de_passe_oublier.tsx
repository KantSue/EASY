import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import api from '../src/config/api';

export default function MotDePasseOublieScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);

  const envoyer = async () => {
    if (!email.trim()) { Alert.alert(t('common.error'), t('forgot.errorEmpty')); return; }
    setLoading(true);
    try {
      await api.post('/accounts/mot-de-passe-oublie/', { email });
      Alert.alert(t('common.success'), t('forgot.successMsg'), [{ text: 'OK', onPress: () => router.replace('/login' as any) }]);
    } catch (err: any) { Alert.alert(t('common.error'), err.response?.data?.error || t('forgot.errorNotFound')); }
    finally { setLoading(false); }
  };

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" />
      <View style={S.header}>
        <TouchableOpacity onPress={() => router.back()} style={S.backBtn}>
          <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={S.headerTitle}>{t('forgot.title')}</Text>
      </View>
      <View style={S.iconWrap}>
        <View style={S.iconBox}><Ionicons name="mail" size={44} color="#0F2942" /></View>
      </View>
      <View style={S.card}>
        <Text style={S.info}>{t('forgot.info')}</Text>
        <View style={S.inputRow}>
          <Ionicons name="mail-outline" size={18} color="#6B7280" style={{ marginRight: 10 }} />
          <TextInput style={S.input} value={email} onChangeText={setEmail}
            placeholder={t('forgot.email')} placeholderTextColor="#9CA3AF"
            keyboardType="email-address" autoCapitalize="none" />
        </View>
        <TouchableOpacity style={S.btn} onPress={envoyer} disabled={loading}>
          {loading ? <ActivityIndicator color="#0F2942" /> : <>
            <Ionicons name="send" size={16} color="#0F2942" />
            <Text style={S.btnText}> {t('forgot.submit')}</Text>
          </>}
        </TouchableOpacity>
      </View>
    </View>
  );
}
const S = StyleSheet.create({
  root     : { flex: 1, backgroundColor: '#F4F6F9' },
  header   : { backgroundColor: '#0F2942', paddingHorizontal: 20, paddingTop: 56, paddingBottom: 24, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  backBtn  : { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  iconWrap : { alignItems: 'center', marginTop: 32, marginBottom: 8 },
  iconBox  : { width: 96, height: 96, borderRadius: 28, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center', shadowColor: '#D4AF37', shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  card     : { backgroundColor: '#FFFFFF', marginHorizontal: 20, borderRadius: 20, padding: 20, gap: 14, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  info     : { fontSize: 13, color: '#6B7280', lineHeight: 20, textAlign: 'center' },
  inputRow : { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F4F6F9', borderRadius: 14, paddingHorizontal: 14, height: 50, borderWidth: 1, borderColor: '#E5E7EB' },
  input    : { flex: 1, fontSize: 14, color: '#1F2937' },
  btn      : { backgroundColor: '#D4AF37', borderRadius: 14, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btnText  : { color: '#0F2942', fontWeight: '800', fontSize: 15 },
});
