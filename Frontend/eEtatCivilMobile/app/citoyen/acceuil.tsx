import { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import i18n from '../../src/i18n';
import api from '../../src/config/api';

const FAQS_KEYS = ['q1','q2','q3','q4','q5'] as const;

export default function AccueilScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [nom, setNom]         = useState('');
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleLang = () => i18n.changeLanguage(i18n.language === 'fr' ? 'mg' : 'fr');

  useEffect(() => {
    AsyncStorage.getItem('token').then(token => {
      if (!token) { router.replace('/login' as any); return; }
      api.get('/accounts/profil/').then(res => {
        setNom(`${res.data.prenom_user} ${res.data.nom_user}`);
      }).finally(() => setLoading(false));
    });
  }, []);

  const deconnexion = async () => { await AsyncStorage.clear(); router.replace('/login' as any); };
  const initiales = nom ? nom.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'RJ';

  if (loading) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F6F9' }}>
      <ActivityIndicator size="large" color="#0F2942" />
    </View>
  );

  const services = [
    { icon: 'search-outline' as const,   label: t('home.tracking'), sub: t('home.trackingSub'), color: '#22C55E', route: '/citoyen/suivi' as any },
    { icon: 'business-outline' as const, label: t('home.offices'),  sub: t('home.officesSub'), color: '#3B82F6', route: '/citoyen/arrondissements' as any },
    { icon: 'person-outline' as const,   label: t('home.profile'),  sub: t('home.profileSub'), color: '#8B5CF6', route: '/profil' as any },
  ];

  return (
    <View style={S.root}>
      <StatusBar barStyle="light-content" />
      <View style={S.header}>
        <View style={S.headerTop}>
          <View style={S.avatarRow}>
            <View style={S.avatar}><Text style={S.avatarText}>{initiales}</Text></View>
            <View>
              <Text style={S.helloText}>{t('home.hello')}</Text>
              <Text style={S.nomText}>{nom || '...'}</Text>
            </View>
          </View>
          <View style={S.headerRight}>
            <TouchableOpacity onPress={toggleLang} style={S.langBtn}>
              <Ionicons name="language-outline" size={13} color="#D4AF37" />
              <Text style={S.langText}>{t('common.language')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={deconnexion} style={S.logoutBtn}>
              <Ionicons name="log-out-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={S.locationRow}>
          <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.65)" />
          <Text style={S.locationText}> {t('home.location')}</Text>
        </View>
      </View>

      <ScrollView style={S.scroll} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Featured card */}
        <View style={S.featuredWrap}>
          <TouchableOpacity style={S.featured} onPress={() => router.push('/citoyen/demande' as any)} activeOpacity={0.9}>
            <View style={S.featuredIcon}>
              <Ionicons name="document-text-outline" size={30} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={S.featuredBadge}>{t('home.quickAction')}</Text>
              <Text style={S.featuredTitle}>{t('home.newRequest')}</Text>
              <Text style={S.featuredSub}>{t('home.newRequestSub')}</Text>
            </View>
            <View style={S.featuredArrow}>
              <Ionicons name="chevron-forward" size={18} color="#0F2942" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Services */}
        <View style={S.section}>
          <View style={S.sectionHeader}>
            <Text style={S.sectionTitle}>{t('home.services')}</Text>
            <Text style={S.sectionSub}>{t('common.seeAll')}</Text>
          </View>
          <View style={S.tilesRow}>
            {services.map(s => (
              <TouchableOpacity key={s.label} style={S.tile} onPress={() => router.push(s.route)} activeOpacity={0.85}>
                <View style={[S.tileIcon, { backgroundColor: s.color + '22' }]}>
                  <Ionicons name={s.icon} size={22} color={s.color} />
                </View>
                <Text style={S.tileLabel}>{s.label}</Text>
                <Text style={S.tileSub}>{s.sub}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ */}
        <View style={S.section}>
          <View style={S.sectionHeader}>
            <Text style={S.sectionTitle}>{t('home.faqTitle')}</Text>
          </View>
          <View style={S.faqWrap}>
            {FAQS_KEYS.map((key, i) => {
              const open = openFaq === i;
              return (
                <TouchableOpacity key={i} style={[S.faqItem, open && S.faqItemOpen]}
                  onPress={() => setOpenFaq(open ? null : i)} activeOpacity={0.85}>
                  <View style={S.faqTop}>
                    <View style={[S.faqIconBox, open && S.faqIconBoxOpen]}>
                      <Ionicons name={['document-text-outline','time-outline','cash-outline','download-outline','location-outline'][i] as any}
                        size={16} color={open ? '#FFFFFF' : '#0F2942'} />
                    </View>
                    <Text style={[S.faqQ, open && S.faqQOpen]} numberOfLines={open ? undefined : 1}>
                      {t(`faq.q${i + 1}`)}
                    </Text>
                    <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={open ? '#0F2942' : '#9CA3AF'} />
                  </View>
                  {open && <Text style={S.faqA}>{t(`faq.a${i + 1}`)}</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={S.bottomNav}>
        {[
          { icon: 'home' as const,              label: t('home.newRequest').split(' ')[0], active: true },
          { icon: 'document-text-outline' as const, label: t('home.tracking'), route: '/citoyen/suivi' as any },
          { icon: 'business-outline' as const,  label: t('home.offices'),  route: '/citoyen/arrondissements' as any },
          { icon: 'person-outline' as const,    label: t('home.profile'),  route: '/profil' as any },
        ].map(t2 => (
          <TouchableOpacity key={t2.label} style={[S.navTab, t2.active && S.navTabActive]}
            onPress={() => (t2 as any).route && router.push((t2 as any).route)}>
            <Ionicons name={t2.icon} size={20} color={t2.active ? '#0F2942' : 'rgba(255,255,255,0.6)'} />
            <Text style={[S.navLabel, t2.active && S.navLabelActive]}>{t2.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const S = StyleSheet.create({
  root         : { flex: 1, backgroundColor: '#F4F6F9' },
  header       : { backgroundColor: '#0F2942', paddingHorizontal: 20, paddingTop: 46, paddingBottom: 36, borderBottomLeftRadius: 32, borderBottomRightRadius: 32 },
  headerTop    : { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  avatarRow    : { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar       : { width: 48, height: 48, borderRadius: 16, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center' },
  avatarText   : { color: '#0F2942', fontWeight: '800', fontSize: 16 },
  helloText    : { color: 'rgba(255,255,255,0.65)', fontSize: 12 },
  nomText      : { color: '#FFFFFF', fontWeight: '800', fontSize: 18, marginTop: 2 },
  headerRight  : { flexDirection: 'row', alignItems: 'center', gap: 8 },
  langBtn      : { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.08)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16 },
  langText     : { color: '#D4AF37', fontSize: 11, fontWeight: '700' },
  logoutBtn    : { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  locationRow  : { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  locationText : { color: 'rgba(255,255,255,0.55)', fontSize: 11 },
  scroll       : { flex: 1 },
  featuredWrap : { paddingHorizontal: 16, marginTop: 18 },
  featured     : { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 16, elevation: 6 },
  featuredIcon : { width: 56, height: 56, borderRadius: 18, backgroundColor: '#0F2942', justifyContent: 'center', alignItems: 'center' },
  featuredBadge: { fontSize: 9, fontWeight: '800', color: '#D4AF37', letterSpacing: 1.2 },
  featuredTitle: { fontSize: 16, fontWeight: '800', color: '#0F2942', marginTop: 2 },
  featuredSub  : { fontSize: 11, color: '#9CA3AF', marginTop: 1 },
  featuredArrow: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#D4AF37', justifyContent: 'center', alignItems: 'center' },
  section      : { paddingHorizontal: 16, marginTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle : { fontSize: 13, fontWeight: '800', color: '#0F2942' },
  sectionSub   : { fontSize: 11, color: '#9CA3AF' },
  tilesRow     : { flexDirection: 'row', gap: 10 },
  tile         : { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  tileIcon     : { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  tileLabel    : { fontSize: 12, fontWeight: '800', color: '#0F2942' },
  tileSub      : { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  faqWrap      : { gap: 8 },
  faqItem      : { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, borderWidth: 1, borderColor: '#F3F4F6' },
  faqItemOpen  : { borderColor: '#D4AF37', backgroundColor: '#FFFBEB' },
  faqTop       : { flexDirection: 'row', alignItems: 'center', gap: 10 },
  faqIconBox   : { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(15,41,66,0.08)', justifyContent: 'center', alignItems: 'center' },
  faqIconBoxOpen: { backgroundColor: '#0F2942' },
  faqQ         : { flex: 1, fontSize: 13, fontWeight: '700', color: '#1F2937' },
  faqQOpen     : { color: '#0F2942' },
  faqA         : { fontSize: 13, color: '#6B7280', marginTop: 10, lineHeight: 20, paddingLeft: 42 },
  bottomNav    : { position: 'absolute', bottom: 12, left: 12, right: 12, backgroundColor: '#1A3552', borderRadius: 20, flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, elevation: 8 },
  navTab       : { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: 14, gap: 3 },
  navTabActive : { backgroundColor: '#D4AF37' },
  navLabel     : { fontSize: 9, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
  navLabelActive: { color: '#0F2942' },
});
