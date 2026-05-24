import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  ScrollView, KeyboardAvoidingView, Platform, Image, StatusBar
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import api from '../../src/config/api';

// ─── Types d'actes ────────────────────────────────────────────────────────────
const TYPES_ACTES = [
  {
    id: 1, label: 'Acte de naissance', sous: 'Certificat de naissance officiel',
    icon: 'person-add-outline' as const, color: '#0891b2', bg: 'rgba(8,145,178,0.10)',
  },
  {
    id: 2, label: 'Acte de décès', sous: 'Certificat de décès officiel',
    icon: 'flower-outline' as const, color: '#7c3aed', bg: 'rgba(124,58,237,0.10)',
  },
  {
    id: 3, label: 'Acte de mariage', sous: 'Certificat de mariage officiel',
    icon: 'heart-outline' as const, color: '#e11d48', bg: 'rgba(225,29,72,0.10)',
  },
];

const STEPS = ["Type d'acte", 'Informations', 'Paiement'];

// ─── Composant principal ──────────────────────────────────────────────────────
export default function DemandeScreen() {
  const router = useRouter();

  const [step, setStep]       = useState(1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Étape 1
  const [typeActe, setTypeActe] = useState(1);

  // Étape 2
  const [numActe, setNumActe] = useState('');
  const [photo, setPhoto]     = useState<any>(null);

  // Communes / Arrondissements
  const [communes, setCommunes]           = useState<any[]>([]);
  const [arrondissements, setArrondissements] = useState<any[]>([]);
  const [communeSelectionnee, setCommuneSelectionnee]           = useState<number>(0);
  const [arrondissementSelectionne, setArrondissementSelectionne] = useState<number>(0);
  const [dijkstraResult, setDijkstraResult] = useState<any>(null);
  const [checkingDispo, setCheckingDispo]   = useState(false);

  // Personnes
  const vide = (sexe = 'M') => ({ nom: '', prenom: '', date_naissance: '', lieu_naiss: '', sexe, profession: '' });
  const [enfant, setEnfant] = useState(vide('F'));
  const [pere,   setPere]   = useState(vide('M'));
  const [mere,   setMere]   = useState(vide('F'));
  const [defunt, setDefunt] = useState(vide('M'));
  const [epoux1, setEpoux1] = useState(vide('M'));
  const [epoux2, setEpoux2] = useState(vide('F'));

  // Étape 3
  const [tel, setTel]               = useState('');
  const [nbExemplaires, setNbEx]    = useState(1);
  const montant = nbExemplaires * 1000;

  useEffect(() => {
    api.get('/accounts/communes/').then(res => setCommunes(res.data))
      .catch(() => Alert.alert('Erreur', 'Impossible de charger les communes.'));
  }, []);

  const onCommuneChange = (id: number) => {
    setCommuneSelectionnee(id);
    setArrondissementSelectionne(0);
    setDijkstraResult(null);
    const c = communes.find(c => c.id_commune === id);
    setArrondissements(c?.arrondissements || []);
  };

  const onArrondissementChange = async (id: number) => {
    setArrondissementSelectionne(id);
    setDijkstraResult(null);
    if (!id) return;
    setCheckingDispo(true);
    try {
      const res = await api.get(`/dashboard/arrondissements/${id}/verifier/`);
      setDijkstraResult(res.data);
    } catch {} finally { setCheckingDispo(false); }
  };

  const choisirPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert('Permission refusée', "Autorisez l'accès à la galerie."); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, quality: 0.7 });
    if (!result.canceled) setPhoto(result.assets[0]);
  };

  const validerEtape2 = () => {
    if (!numActe)            { setMsg({ type: 'err', text: "Le numéro d'acte est obligatoire." }); return; }
    if (!photo)              { setMsg({ type: 'err', text: "La photo CIN est obligatoire." }); return; }
    if (!communeSelectionnee){ setMsg({ type: 'err', text: 'Sélectionnez une commune.' }); return; }
    if (typeActe === 1 && (!enfant.nom || !enfant.prenom || !enfant.date_naissance || !pere.nom || !mere.nom)) {
      setMsg({ type: 'err', text: "Remplissez les informations de l'enfant, père et mère." }); return;
    }
    if (typeActe === 2 && (!defunt.nom || !defunt.prenom || !defunt.date_naissance)) {
      setMsg({ type: 'err', text: 'Remplissez les informations du défunt.' }); return;
    }
    if (typeActe === 3 && (!epoux1.nom || !epoux2.nom)) {
      setMsg({ type: 'err', text: 'Remplissez les informations des deux époux.' }); return;
    }
    setMsg(null);
    setStep(3);
  };

  const buildPersonne = (p: any) => ({
    nom_personne: p.nom, prenom_personne: p.prenom,
    date_naissance: p.date_naissance + ' 00:00:00',
    lieu_naiss: p.lieu_naiss, sexe: p.sexe || 'M', profession: p.profession || 'N/A',
  });

  const handleSoumettre = async () => {
    if (!tel) { setMsg({ type: 'err', text: 'Entrez votre numéro MVola.' }); return; }
    setLoading(true); setMsg(null);
    try {
      const formData = new FormData();
      formData.append('numero_tel', tel);
      formData.append('id_type_acte', String(typeActe));
      formData.append('num_acte', numActe);
      formData.append('id_commune', String(communeSelectionnee));
      formData.append('nb_exemplaires', String(nbExemplaires));
      if (arrondissementSelectionne) formData.append('id_arrondissement', String(arrondissementSelectionne));
      formData.append('photo_ci', { uri: photo.uri, name: `cin_${Date.now()}.jpg`, type: 'image/jpeg' } as any);
      if (typeActe === 1) {
        formData.append('enfant', JSON.stringify(buildPersonne(enfant)));
        formData.append('pere',   JSON.stringify(buildPersonne({ ...pere, sexe: 'M' })));
        formData.append('mere',   JSON.stringify(buildPersonne({ ...mere, sexe: 'F' })));
      } else if (typeActe === 2) {
        formData.append('defunt', JSON.stringify(buildPersonne(defunt)));
      } else {
        formData.append('epoux1', JSON.stringify(buildPersonne(epoux1)));
        formData.append('epoux2', JSON.stringify(buildPersonne(epoux2)));
      }
      await api.post('/dashboard/paiements/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      Alert.alert('Succès', 'Votre demande a été soumise avec succès !', [
        { text: 'OK', onPress: () => router.replace('/citoyen/acceuil' as any) }
      ]);
    } catch (err: any) {
      setMsg({ type: 'err', text: JSON.stringify(err.response?.data || 'Erreur inconnue') });
    } finally { setLoading(false); }
  };

  const acteActif = TYPES_ACTES.find(t => t.id === typeActe)!;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" />

      {/* ── Header + Stepper ── */}
      <View style={S.header}>
        <TouchableOpacity onPress={() => step > 1 ? setStep(step - 1) : router.back()} style={S.backBtn}>
          <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={S.headerTitle}>Nouvelle demande</Text>
        <Text style={S.headerSub}>Étape {step} sur 3</Text>

        {/* Stepper */}
        <View style={S.stepper}>
          {STEPS.map((s, i) => (
            <View key={i} style={S.stepItem}>
              <View style={[S.stepCircle, step > i + 1 && S.stepDone, step === i + 1 && S.stepActive]}>
                {step > i + 1
                  ? <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                  : <Text style={[S.stepNum, step >= i + 1 && S.stepNumActive]}>{i + 1}</Text>
                }
              </View>
              <Text style={[S.stepLabel, step === i + 1 && S.stepLabelActive]}>{s}</Text>
              {i < STEPS.length - 1 && (
                <View style={[S.stepLine, step > i + 1 && S.stepLineDone]} />
              )}
            </View>
          ))}
        </View>
      </View>

      <ScrollView style={S.scroll} contentContainerStyle={{ paddingBottom: 48 }} showsVerticalScrollIndicator={false}>

        {/* ── Message flash ── */}
        {msg && (
          <View style={[S.flash, { borderColor: msg.type === 'ok' ? '#22C55E' : '#EF4444', backgroundColor: msg.type === 'ok' ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)' }]}>
            <Ionicons name={msg.type === 'ok' ? 'checkmark-circle' : 'alert-circle'} size={16} color={msg.type === 'ok' ? '#22C55E' : '#EF4444'} />
            <Text style={[S.flashText, { color: msg.type === 'ok' ? '#15803D' : '#B91C1C' }]}>{msg.text}</Text>
          </View>
        )}

        {/* ══════════ ÉTAPE 1 ══════════ */}
        {step === 1 && (
          <View style={S.step1Wrap}>
            <Text style={S.step1Title}>Choisissez votre acte</Text>
            <Text style={S.step1Sub}>Sélectionnez le type d'acte à demander</Text>

            {TYPES_ACTES.map(t => {
              const active = typeActe === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[S.typeCard, active && { borderColor: t.color, backgroundColor: t.bg, shadowColor: t.color, shadowOpacity: 0.2, shadowRadius: 16, elevation: 6 }]}
                  onPress={() => setTypeActe(t.id)}
                  activeOpacity={0.85}
                >
                  <View style={[S.typeIconBox, { backgroundColor: active ? t.color : t.bg }]}>
                    <Ionicons name={t.icon} size={28} color={active ? '#FFFFFF' : t.color} />
                  </View>
                  <View style={S.typeInfo}>
                    <Text style={[S.typeLabel, active && { color: t.color }]}>{t.label}</Text>
                    <Text style={S.typeSous}>{t.sous}</Text>
                  </View>
                  <View style={[S.typeCheck, active && { backgroundColor: t.color, borderColor: t.color }]}>
                    {active && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Preview */}
            <View style={[S.previewCard, { backgroundColor: acteActif.color }]}>
              <View style={S.previewLeft}>
                <Text style={S.previewBadge}>SÉLECTION</Text>
                <Text style={S.previewTitle}>{acteActif.label}</Text>
                <Text style={S.previewSub}>Frais : 1 000 Ar · Délai estimé : 24 h</Text>
              </View>
              <Ionicons name={acteActif.icon} size={36} color="rgba(255,255,255,0.3)" />
            </View>

            <TouchableOpacity style={S.btnNavy} onPress={() => setStep(2)}>
              <Text style={S.btnNavyText}>Continuer</Text>
              <Ionicons name="chevron-forward" size={18} color="#0F2942" />
            </TouchableOpacity>
          </View>
        )}

        {/* ══════════ ÉTAPE 2 ══════════ */}
        {step === 2 && (
          <View style={S.stepWrap}>

            {/* N° acte + Photo */}
            <View style={S.card}>
              <Text style={S.cardTitle}>
                <Ionicons name="document-text-outline" size={14} color="#0F2942" /> Numéro d'acte
              </Text>
              <View style={S.inputRow}>
                <Ionicons name="document-outline" size={16} color="#9CA3AF" style={S.inputIcon} />
                <TextInput style={S.input} value={numActe} onChangeText={setNumActe}
                  placeholder="Ex: NAISS-2024-001" placeholderTextColor="#9CA3AF" autoCapitalize="characters" />
              </View>
              <Text style={S.hint}>Inscrit sur votre livret de famille</Text>

              <Text style={S.cardTitle}>
                <Ionicons name="camera-outline" size={14} color="#0F2942" /> Photo CIN *
              </Text>
              <TouchableOpacity style={[S.photoBtn, photo && S.photoBtnFilled]} onPress={choisirPhoto}>
                {photo ? (
                  <Image source={{ uri: photo.uri }} style={S.photoPreview} />
                ) : (
                  <View style={S.photoPlaceholder}>
                    <Ionicons name="camera-outline" size={28} color="#0F2942" />
                    <Text style={S.photoBtnText}>Choisir depuis la galerie</Text>
                    <Text style={S.photoBtnSub}>JPG · PNG · max 5 Mo</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Localisation */}
            <View style={S.card}>
              <Text style={S.cardTitle}>
                <Ionicons name="location-outline" size={14} color="#0F2942" /> Localisation
              </Text>
              <Text style={S.fieldLabel}>Commune *</Text>
              <View style={S.pickerRow}>
                <Ionicons name="business-outline" size={16} color="#9CA3AF" style={S.inputIcon} />
                <Picker selectedValue={communeSelectionnee} onValueChange={(v: number) => onCommuneChange(v)} style={S.picker}>
                  <Picker.Item label="-- Choisir une commune --" value={0} />
                  {communes.map(c => <Picker.Item key={c.id_commune} label={c.nom_commune} value={c.id_commune} />)}
                </Picker>
              </View>

              {arrondissements.length > 0 && (
                <>
                  <Text style={S.fieldLabel}>Arrondissement *</Text>
                  <View style={S.pickerRow}>
                    <Ionicons name="location-outline" size={16} color="#9CA3AF" style={S.inputIcon} />
                    <Picker selectedValue={arrondissementSelectionne} onValueChange={(v: number) => onArrondissementChange(v)} style={S.picker}>
                      <Picker.Item label="-- Choisir un arrondissement --" value={0} />
                      {arrondissements.map(a => (
                        <Picker.Item key={a.id_arondissement} label={a.nom_arondissement || `Arrondissement ${a.num_arondissement}`} value={a.id_arondissement} />
                      ))}
                    </Picker>
                  </View>

                  {checkingDispo && (
                    <View style={S.checkRow}>
                      <ActivityIndicator size="small" color="#0F2942" />
                      <Text style={S.checkText}> Vérification disponibilité…</Text>
                    </View>
                  )}

                  {dijkstraResult && arrondissementSelectionne > 0 && !checkingDispo && (
                    <View style={[S.dijkBox, { borderColor: dijkstraResult.disponible ? '#22C55E' : '#F59E0B', backgroundColor: dijkstraResult.disponible ? 'rgba(34,197,94,0.06)' : 'rgba(245,158,11,0.06)' }]}>
                      {dijkstraResult.disponible ? (
                        <View style={S.dijkRow}>
                          <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
                          <Text style={[S.dijkMsg, { color: '#15803D' }]}> {dijkstraResult.message}</Text>
                        </View>
                      ) : (
                        <>
                          <View style={S.dijkRow}>
                            <Ionicons name="alert-circle" size={16} color="#F59E0B" />
                            <Text style={[S.dijkMsg, { color: '#92400E' }]}> {dijkstraResult.message}</Text>
                          </View>
                          {dijkstraResult.redirection && (
                            <View style={S.altBox}>
                              <View style={S.altIconBox}>
                                <Ionicons name="location" size={16} color="#0F2942" />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={S.altNom}>{dijkstraResult.redirection.arrondissement}</Text>
                                <Text style={S.altSub}>{dijkstraResult.redirection.commune} · {dijkstraResult.redirection.distance_km} km</Text>
                              </View>
                              <TouchableOpacity style={S.altBtn} onPress={() => {
                                const alt = arrondissements.find((a: any) => a.nom_arondissement === dijkstraResult.redirection.arrondissement);
                                if (alt) { setArrondissementSelectionne(alt.id_arondissement); setDijkstraResult(null); }
                                else Alert.alert('Info', `Sélectionnez manuellement : ${dijkstraResult.redirection.arrondissement}`);
                              }}>
                                <Text style={S.altBtnText}>Utiliser</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </>
                      )}
                    </View>
                  )}
                </>
              )}
            </View>

            {/* Personnes */}
            <View style={S.card}>
              <Text style={S.cardTitle}>
                <Ionicons name="people-outline" size={14} color="#0F2942" /> Personnes concernées
              </Text>
              {typeActe === 1 && (<>
                <SectionPersonne titre="Enfant" data={enfant} onChange={setEnfant} showSexe color="#0891b2" />
                <SectionPersonne titre="Père"   data={pere}   onChange={setPere}            color="#0F2942" />
                <SectionPersonne titre="Mère"   data={mere}   onChange={setMere}            color="#0F2942" />
              </>)}
              {typeActe === 2 && <SectionPersonne titre="Défunt(e)" data={defunt} onChange={setDefunt} showSexe color="#7c3aed" />}
              {typeActe === 3 && (<>
                <SectionPersonne titre="Époux"  data={epoux1} onChange={setEpoux1} color="#e11d48" />
                <SectionPersonne titre="Épouse" data={epoux2} onChange={setEpoux2} color="#e11d48" />
              </>)}
            </View>

            <View style={S.navRow}>
              <TouchableOpacity style={S.btnGhost} onPress={() => { setStep(1); setMsg(null); }}>
                <Ionicons name="chevron-back" size={16} color="#6B7280" />
                <Text style={S.btnGhostText}>Retour</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[S.btnNavy, { flex: 1 }]} onPress={validerEtape2}>
                <Text style={S.btnNavyText}>Continuer</Text>
                <Ionicons name="chevron-forward" size={18} color="#0F2942" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ══════════ ÉTAPE 3 ══════════ */}
        {step === 3 && (
          <View style={S.stepWrap}>

            {/* Montant */}
            <View style={S.montantCard}>
              <Text style={S.montantSub}>{nbExemplaires} exemplaire{nbExemplaires > 1 ? 's' : ''} × 1 000 Ar</Text>
              <Text style={S.montantVal}>{montant.toLocaleString()} Ar</Text>
            </View>

            {/* Résumé */}
            <View style={S.card}>
              <Text style={S.cardTitle}>RÉSUMÉ</Text>
              {[
                { label: 'Type',     val: TYPES_ACTES.find(t => t.id === typeActe)?.label },
                { label: "N° acte", val: numActe },
                { label: 'Commune', val: communes.find(c => c.id_commune === communeSelectionnee)?.nom_commune },
                { label: 'Photo CIN', val: photo ? '✓ Jointe' : '—' },
              ].map((r, i) => (
                <View key={i} style={S.resumeRow}>
                  <Text style={S.resumeLabel}>{r.label}</Text>
                  <Text style={S.resumeVal}>{r.val}</Text>
                </View>
              ))}
            </View>

            {/* Exemplaires */}
            <View style={S.card}>
              <Text style={S.cardTitle}>EXEMPLAIRES</Text>
              <View style={S.exRow}>
                <TouchableOpacity style={S.exBtnMinus} onPress={() => setNbEx(Math.max(1, nbExemplaires - 1))}>
                  <Ionicons name="remove" size={22} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={S.exVal}>{nbExemplaires}</Text>
                <TouchableOpacity style={S.exBtnPlus} onPress={() => setNbEx(Math.min(10, nbExemplaires + 1))}>
                  <Ionicons name="add" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* MVola */}
            <View style={S.card}>
              <Text style={S.cardTitle}>PAIEMENT MVOLA</Text>
              <View style={S.inputRow}>
                <View style={S.mvolaTag}><Text style={S.mvolaTagText}>MVola</Text></View>
                <TextInput style={S.input} value={tel} onChangeText={setTel}
                  keyboardType="phone-pad" placeholder="034XXXXXXX" placeholderTextColor="#9CA3AF" />
              </View>
            </View>

            <View style={S.navRow}>
              <TouchableOpacity style={S.btnGhost} onPress={() => { setStep(2); setMsg(null); }}>
                <Ionicons name="chevron-back" size={16} color="#6B7280" />
                <Text style={S.btnGhostText}>Retour</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[S.btnGreen, { flex: 1 }]} onPress={handleSoumettre} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <>
                      <Text style={S.btnGreenText}>Payer et soumettre</Text>
                      <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                    </>
                }
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ─── SectionPersonne ──────────────────────────────────────────────────────────
function SectionPersonne({ titre, data, onChange, showSexe, color }: any) {
  const set = (k: string, v: string) => onChange((p: any) => ({ ...p, [k]: v }));
  return (
    <View style={[SP.wrap, { borderLeftColor: color }]}>
      <Text style={[SP.titre, { color }]}>{titre}</Text>
      <View style={SP.grid}>
        {[
          { k: 'prenom', ph: 'Prénom' },
          { k: 'nom',    ph: 'Nom' },
          { k: 'date_naissance', ph: 'Date naiss. (AAAA-MM-JJ)' },
          { k: 'lieu_naiss',     ph: 'Lieu de naissance' },
          { k: 'profession',     ph: 'Profession' },
        ].map(f => (
          <View key={f.k} style={SP.field}>
            <TextInput
              style={SP.input}
              placeholder={f.ph}
              placeholderTextColor="#9CA3AF"
              value={data[f.k]}
              onChangeText={(v: string) => set(f.k, v)}
            />
          </View>
        ))}
      </View>
      {showSexe && (
        <View style={SP.pickerRow}>
          <Ionicons name="male-female-outline" size={14} color="#9CA3AF" style={{ marginRight: 6 }} />
          <Picker selectedValue={data.sexe} onValueChange={(v: string) => set('sexe', v)} style={SP.picker}>
            <Picker.Item label="Masculin" value="M" />
            <Picker.Item label="Féminin"  value="F" />
          </Picker>
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const NAV  = '#0F2942';
const GOLD = '#D4AF37';
const BG   = '#F4F6F9';

const S = StyleSheet.create({
  // Header
  header      : { backgroundColor: NAV, paddingHorizontal: 20, paddingTop: 56, paddingBottom: 20, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  backBtn     : { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  headerTitle : { fontSize: 22, fontWeight: '800', color: '#FFFFFF' },
  headerSub   : { fontSize: 12, color: GOLD, fontWeight: '600', marginTop: 2, marginBottom: 16 },
  // Stepper
  stepper     : { flexDirection: 'row', alignItems: 'center' },
  stepItem    : { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepCircle  : { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  stepActive  : { backgroundColor: '#FFFFFF' },
  stepDone    : { backgroundColor: '#22C55E' },
  stepNum     : { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
  stepNumActive: { color: NAV },
  stepLabel   : { fontSize: 10, fontWeight: '600', color: 'rgba(255,255,255,0.5)', marginLeft: 6 },
  stepLabelActive: { color: '#FFFFFF' },
  stepLine    : { flex: 1, height: 2, backgroundColor: 'rgba(255,255,255,0.2)', marginHorizontal: 6 },
  stepLineDone: { backgroundColor: '#22C55E' },
  // Layout
  scroll      : { flex: 1, backgroundColor: BG },
  step1Wrap   : { padding: 16, gap: 12 },
  stepWrap    : { padding: 16, gap: 12 },
  // Flash message
  flash       : { margin: 16, marginBottom: 0, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 14, borderWidth: 1 },
  flashText   : { fontSize: 13, fontWeight: '600', flex: 1 },
  // Étape 1
  step1Title  : { fontSize: 20, fontWeight: '800', color: NAV, marginTop: 4 },
  step1Sub    : { fontSize: 13, color: '#9CA3AF', marginBottom: 4 },
  typeCard    : { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, borderWidth: 2, borderColor: '#E5E7EB', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  typeIconBox : { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  typeInfo    : { flex: 1 },
  typeLabel   : { fontSize: 15, fontWeight: '800', color: NAV },
  typeSous    : { fontSize: 11, color: '#9CA3AF', marginTop: 3 },
  typeCheck   : { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  previewCard : { borderRadius: 18, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  previewLeft : { flex: 1 },
  previewBadge: { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5 },
  previewTitle: { fontSize: 16, fontWeight: '800', color: '#FFFFFF', marginTop: 4 },
  previewSub  : { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 4 },
  // Cartes
  card        : { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 16, gap: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardTitle   : { fontSize: 11, fontWeight: '700', color: '#6B7280', letterSpacing: 1, marginBottom: 2 },
  // Inputs
  inputRow    : { flexDirection: 'row', alignItems: 'center', backgroundColor: BG, borderRadius: 14, paddingHorizontal: 14, height: 50, borderWidth: 1, borderColor: '#E5E7EB' },
  inputIcon   : { marginRight: 8 },
  input       : { flex: 1, fontSize: 14, color: '#1F2937' },
  hint        : { fontSize: 11, color: '#9CA3AF', marginTop: -6 },
  fieldLabel  : { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  pickerRow   : { flexDirection: 'row', alignItems: 'center', backgroundColor: BG, borderRadius: 14, paddingHorizontal: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  picker      : { flex: 1, color: '#1F2937' },
  // Photo
  photoBtn    : { borderWidth: 2, borderColor: NAV, borderStyle: 'dashed', borderRadius: 16, backgroundColor: 'rgba(15,41,66,0.04)' },
  photoBtnFilled: { borderStyle: 'solid', borderColor: '#E5E7EB' },
  photoPlaceholder: { padding: 28, alignItems: 'center', gap: 8 },
  photoBtnText: { fontSize: 14, fontWeight: '700', color: NAV },
  photoBtnSub : { fontSize: 11, color: '#9CA3AF' },
  photoPreview: { width: '100%', height: 160, borderRadius: 14 },
  // Dijkstra
  checkRow    : { flexDirection: 'row', alignItems: 'center', backgroundColor: BG, padding: 10, borderRadius: 12 },
  checkText   : { fontSize: 13, color: '#6B7280' },
  dijkBox     : { borderRadius: 14, padding: 12, borderWidth: 1, gap: 8 },
  dijkRow     : { flexDirection: 'row', alignItems: 'center' },
  dijkMsg     : { fontSize: 13, fontWeight: '600', flex: 1 },
  altBox      : { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: 'rgba(15,41,66,0.06)', borderRadius: 12, padding: 10 },
  altIconBox  : { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(15,41,66,0.1)', justifyContent: 'center', alignItems: 'center' },
  altNom      : { fontSize: 13, fontWeight: '700', color: NAV },
  altSub      : { fontSize: 11, color: '#9CA3AF' },
  altBtn      : { backgroundColor: NAV, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  altBtnText  : { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },
  // Étape 3
  montantCard : { backgroundColor: NAV, borderRadius: 20, padding: 24, alignItems: 'center' },
  montantSub  : { fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 6 },
  montantVal  : { fontSize: 40, fontWeight: '800', color: GOLD },
  resumeRow   : { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  resumeLabel : { fontSize: 12, color: '#9CA3AF' },
  resumeVal   : { fontSize: 13, fontWeight: '700', color: NAV },
  exRow       : { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28 },
  exBtnMinus  : { width: 48, height: 48, borderRadius: 24, backgroundColor: '#EF4444', justifyContent: 'center', alignItems: 'center' },
  exBtnPlus   : { width: 48, height: 48, borderRadius: 24, backgroundColor: '#22C55E', justifyContent: 'center', alignItems: 'center' },
  exVal       : { fontSize: 32, fontWeight: '800', color: NAV, minWidth: 48, textAlign: 'center' },
  mvolaTag    : { backgroundColor: GOLD, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginRight: 10 },
  mvolaTagText: { fontSize: 10, fontWeight: '800', color: NAV },
  // Navigation
  navRow      : { flexDirection: 'row', gap: 10 },
  btnNavy     : { backgroundColor: GOLD, borderRadius: 16, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, flex: 1 },
  btnNavyText : { color: NAV, fontWeight: '800', fontSize: 15 },
  btnGhost    : { backgroundColor: '#FFFFFF', borderRadius: 16, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  btnGhostText: { color: '#6B7280', fontWeight: '600', fontSize: 14 },
  btnGreen    : { backgroundColor: '#22C55E', borderRadius: 16, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  btnGreenText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});

const SP = StyleSheet.create({
  wrap    : { borderLeftWidth: 3, paddingLeft: 12, marginTop: 8, gap: 6 },
  titre   : { fontSize: 13, fontWeight: '800', marginBottom: 4 },
  grid    : { gap: 6 },
  field   : {},
  input   : { backgroundColor: BG, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#1F2937', borderWidth: 1, borderColor: '#E5E7EB' },
  pickerRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: BG, borderRadius: 12, paddingHorizontal: 8, borderWidth: 1, borderColor: '#E5E7EB', marginTop: 4 },
  picker  : { flex: 1, color: '#1F2937' },
});
