import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Speech from 'expo-speech';
import { useState } from 'react';
import { Image, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SEVERITY_COLORS: Record<string, string> = {
  'None': '#22c55e', 'Low': '#84cc16', 'Medium': '#f59e0b',
  'High': '#ef4444', 'Very High': '#7f1d1d',
};

const LANG = {
  en: {
    confidence: 'Model Confidence',
    high: 'High confidence — result is reliable',
    mid: 'Moderate confidence — try a clearer image',
    low: 'Low confidence — result may not be accurate',
    plant: 'PLANT', severity: 'SEVERITY',
    healthy: 'This leaf appears healthy. No disease detected.',
    condition: 'DETECTED CONDITION',
    treatment: 'RECOMMENDED TREATMENT',
    listen: 'Listen',
    stop: 'Stop Audio',
    fertilizer: 'FERTILIZER ADVICE',
    buy: 'BUY PRODUCTS IN NEPAL',
    buyBtn: 'Shop on Kheti.farm Nepal',
    findStore: 'Find Nearby Agro Store',
    shareWhatsApp: 'Share via WhatsApp',
    again: 'Analyze Another Leaf',
    back: 'Back',
  },
  ne: {
    confidence: 'मोडेल आत्मविश्वास',
    high: 'उच्च आत्मविश्वास — परिणाम भरपर्दो छ',
    mid: 'मध्यम आत्मविश्वास — स्पष्ट छवि प्रयास गर्नुहोस्',
    low: 'कम आत्मविश्वास — परिणाम सही नहुन सक्छ',
    plant: 'बिरुवा', severity: 'गम्भीरता',
    healthy: 'यो पात स्वस्थ देखिन्छ। कुनै रोग पत्ता लागेन।',
    condition: 'पत्ता लागेको अवस्था',
    treatment: 'सिफारिस गरिएको उपचार',
    listen: 'सुन्नुहोस्',
    stop: 'अडियो रोक्नुहोस्',
    fertilizer: 'मल सल्लाह',
    buy: 'नेपालमा अनलाइन उत्पादन किन्नुहोस्',
    buyBtn: 'Kheti.farm Nepal मा किन्नुहोस्',
    findStore: 'नजिकको कृषि पसल खोज्नुहोस्',
    shareWhatsApp: 'WhatsApp मा साझा गर्नुहोस्',
    again: 'अर्को पात विश्लेषण गर्नुहोस्',
    back: 'अघिल्लो पृष्ठ',
  }
};

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const initialLang = (params.lang as 'en' | 'ne') || 'en';
  const [currentLang, setCurrentLang] = useState<'en' | 'ne'>(initialLang);
  const t = LANG[currentLang];

  const confidence = parseFloat(params.confidence as string);

  // Pick the right language version of each field
  const plant     = currentLang === 'en' ? (params.plant_en as string)     : (params.plant_ne as string);
  const disease   = currentLang === 'en' ? (params.disease_en as string)   : (params.disease_ne as string);
  const treatment = currentLang === 'en' ? (params.treatment_en as string) : (params.treatment_ne as string);
  const fertilizer= currentLang === 'en' ? (params.fertilizer_en as string): (params.fertilizer_ne as string);
  const severity  = currentLang === 'en' ? (params.severity_en as string)  : (params.severity_ne as string);

  // Severity color always uses English key
  const severityEn = params.severity_en as string;
  const severityColor = SEVERITY_COLORS[severityEn] || '#6b7280';

  const confNote = confidence >= 85 ? t.high : confidence >= 65 ? t.mid : t.low;

  const toggleLang = () => setCurrentLang(currentLang === 'en' ? 'ne' : 'en');

  const openNearbyStore = () => {
    Linking.openURL('https://www.google.com/maps/search/agro+store+near+me');
  };

  const shareWhatsApp = () => {
    // Always share in English for clarity
    const message =
      `${params.disease_en} detected on ${params.plant_en} leaf.\n\n` +
      `Recommended treatment: ${params.treatment_en}\n\n` +
      `Detected by LeafDoc Nepal`;
    Linking.openURL(`https://wa.me/?text=${encodeURIComponent(message)}`);
  };

  const speakTreatment = () => {
    Speech.stop();
    if (!treatment) return;
    Speech.speak(treatment, {
      language: currentLang === 'ne' ? 'ne-NP' : 'en-US',
      rate: 0.9,
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* NAVBAR */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>{t.back}</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>LeafDoc <Text style={styles.navAccent}>Nepal</Text></Text>
        <TouchableOpacity style={styles.langToggle} onPress={toggleLang}>
          <Text style={[styles.langBtn, currentLang === 'en' && styles.langActive]}>EN</Text>
          <Text style={styles.langDiv}>|</Text>
          <Text style={[styles.langBtn, currentLang === 'ne' && styles.langActive]}>न</Text>
        </TouchableOpacity>
      </View>

      {/* LEAF IMAGE */}
      {params.imageUri ? (
        <Image source={{ uri: params.imageUri as string }} style={styles.leafImg} />
      ) : null}

      <View style={styles.card}>

        {/* CONFIDENCE */}
        <View style={styles.confRow}>
          <Text style={styles.confLabel}>{t.confidence}</Text>
          <Text style={styles.confValue}>{confidence}%</Text>
        </View>
        <View style={styles.confBarBg}>
          <View style={[styles.confBar, { width: `${confidence}%` as any }]} />
        </View>
        <Text style={styles.confNote}>{confNote}</Text>

        {/* PLANT + SEVERITY */}
        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLbl}>{t.plant}</Text>
            <Text style={styles.infoVal}>{plant}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLbl}>{t.severity}</Text>
            <View style={[styles.severityBadge, { backgroundColor: severityColor }]}>
              <Text style={styles.severityText}>{severity}</Text>
            </View>
          </View>
        </View>

        {/* HEALTHY BANNER */}
        {severityEn === 'None' && (
          <View style={styles.healthyBanner}>
            <Text style={styles.healthyText}>{t.healthy}</Text>
          </View>
        )}

        {/* CONDITION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.condition}</Text>
          <View style={styles.sectionBody}>
            <Text style={styles.sectionText}>{disease}</Text>
          </View>
        </View>

        {/* TREATMENT */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t.treatment}</Text>
            <TouchableOpacity onPress={speakTreatment}>
              <Ionicons name="volume-high" size={22} color="#2d6a4f" />
            </TouchableOpacity>
          </View>
          <View style={[styles.sectionBody, styles.sectionRed]}>
            <Text style={styles.sectionText}>{treatment}</Text>
          </View>
        </View>

        {/* FERTILIZER */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.fertilizer}</Text>
          <View style={[styles.sectionBody, styles.sectionBlue]}>
            <Text style={styles.sectionText}>{fertilizer}</Text>
          </View>
        </View>

        {/* BUY */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.buy}</Text>
          <TouchableOpacity
            style={styles.buyBtn}
            onPress={() => Linking.openURL('https://store.kheti.farm')}
          >
            <Text style={styles.buyBtnText}>{t.buyBtn}</Text>
          </TouchableOpacity>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.actionBtns}>
          <TouchableOpacity style={[styles.actionBtn, styles.mapBtn]} onPress={openNearbyStore}>
            <Text style={styles.mapBtnText}>{t.findStore}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.whatsappBtn]} onPress={shareWhatsApp}>
            <Text style={styles.whatsappBtnText}>{t.shareWhatsApp}</Text>
          </TouchableOpacity>
        </View>

        {/* ANALYZE AGAIN */}
        <TouchableOpacity style={styles.againBtn} onPress={() => router.back()}>
          <Text style={styles.againText}>{t.again}</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fefae0' },
  content: { paddingBottom: 40 },

  navbar: {
    backgroundColor: '#2d6a4f', flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingTop: 50, paddingBottom: 14, paddingHorizontal: 20,
  },
  backBtn: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '700' },
  navTitle: { color: 'white', fontSize: 18, fontWeight: '800' },
  navAccent: { color: '#f4a261' },
  langToggle: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  langBtn: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '700' },
  langActive: { color: '#f4a261' },
  langDiv: { color: 'rgba(255,255,255,0.3)', marginHorizontal: 4 },

  leafImg: { width: '100%', height: 240 },
  card: { margin: 16, backgroundColor: 'white', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },

  confRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  confLabel: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
  confValue: { fontSize: 20, fontWeight: '800', color: '#2d6a4f' },
  confBarBg: { backgroundColor: '#e8f5e9', borderRadius: 6, height: 8, overflow: 'hidden', marginBottom: 6 },
  confBar: { height: '100%', backgroundColor: '#2d6a4f', borderRadius: 6 },
  confNote: { fontSize: 12, color: '#6b7280', fontWeight: '600', marginBottom: 20 },

  infoGrid: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  infoBox: { flex: 1, backgroundColor: '#f8fffe', borderWidth: 1.5, borderColor: '#e0f0e8', borderRadius: 12, padding: 14 },
  infoLbl: { fontSize: 10, color: '#6b7280', fontWeight: '700', letterSpacing: 0.8, marginBottom: 6 },
  infoVal: { fontSize: 16, fontWeight: '800', color: '#2d6a4f' },
  severityBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, alignSelf: 'flex-start' },
  severityText: { color: 'white', fontWeight: '800', fontSize: 13 },

  healthyBanner: { backgroundColor: '#22c55e', borderRadius: 12, padding: 14, marginBottom: 18 },
  healthyText: { color: 'white', fontWeight: '800', fontSize: 14, textAlign: 'center' },

  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 10, color: '#6b7280', fontWeight: '700', letterSpacing: 0.8, marginBottom: 8 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionBody: { backgroundColor: '#f8fffe', borderLeftWidth: 4, borderLeftColor: '#74c69d', borderRadius: 10, padding: 14 },
  sectionRed: { borderLeftColor: '#ef4444', backgroundColor: '#fff5f5' },
  sectionBlue: { borderLeftColor: '#3b82f6', backgroundColor: '#f5f8ff' },
  sectionText: { fontSize: 14, color: '#333', lineHeight: 22 },

  buyBtn: { backgroundColor: '#2d6a4f', padding: 14, borderRadius: 12, alignItems: 'center' },
  buyBtnText: { color: 'white', fontWeight: '800', fontSize: 15 },

  actionBtns: { gap: 10, marginBottom: 16 },
  actionBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  mapBtn: { backgroundColor: '#e8f5e9', borderWidth: 2, borderColor: '#74c69d' },
  mapBtnText: { color: '#2d6a4f', fontWeight: '800', fontSize: 14 },
  whatsappBtn: { backgroundColor: '#25D366' },
  whatsappBtnText: { color: 'white', fontWeight: '800', fontSize: 14 },

  againBtn: { backgroundColor: '#40916c', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  againText: { color: 'white', fontWeight: '800', fontSize: 15 },
});