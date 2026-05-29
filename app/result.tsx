import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

const SEVERITY_COLORS: Record<string, string> = {
  'None': '#22c55e',
  'Low': '#84cc16',
  'Medium': '#f59e0b',
  'High': '#ef4444',
  'Very High': '#7f1d1d',
};

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const confidence = parseFloat(params.confidence as string);
  const severity = params.severity as string;
  const severityColor = SEVERITY_COLORS[severity] || '#6b7280';

  const confNote = confidence >= 85
    ? 'High confidence — result is reliable'
    : confidence >= 65
    ? 'Moderate confidence — try a clearer image'
    : 'Low confidence — result may not be accurate';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* Navbar */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>LeafDoc <Text style={styles.navTitleAccent}>Nepal</Text></Text>
        <View style={{ width: 50 }} />
      </View>

      {/* Image */}
      {params.imageUri ? (
        <Image source={{ uri: params.imageUri as string }} style={styles.leafImg} />
      ) : null}

      <View style={styles.card}>

        {/* Confidence */}
        <View style={styles.confRow}>
          <Text style={styles.confLabel}>Model Confidence</Text>
          <Text style={styles.confValue}>{confidence}%</Text>
        </View>
        <View style={styles.confBarBg}>
          <View style={[styles.confBar, { width: `${confidence}%` }]} />
        </View>
        <Text style={styles.confNote}>{confNote}</Text>

        {/* Plant + Severity */}
        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <Text style={styles.infoLbl}>PLANT</Text>
            <Text style={styles.infoVal}>{params.plant}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLbl}>SEVERITY</Text>
            <View style={[styles.severityBadge, { backgroundColor: severityColor }]}>
              <Text style={styles.severityText}>{severity}</Text>
            </View>
          </View>
        </View>

        {/* Healthy banner */}
        {severity === 'None' && (
          <View style={styles.healthyBanner}>
            <Text style={styles.healthyText}>This leaf appears healthy. No disease detected.</Text>
          </View>
        )}

        {/* Disease */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DETECTED CONDITION</Text>
          <View style={styles.sectionBody}>
            <Text style={styles.sectionText}>{params.disease}</Text>
          </View>
        </View>

        {/* Treatment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RECOMMENDED TREATMENT</Text>
          <View style={[styles.sectionBody, styles.sectionRed]}>
            <Text style={styles.sectionText}>{params.treatment}</Text>
          </View>
        </View>

        {/* Fertilizer */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FERTILIZER ADVICE</Text>
          <View style={[styles.sectionBody, styles.sectionBlue]}>
            <Text style={styles.sectionText}>{params.fertilizer}</Text>
          </View>
        </View>

        {/* Buy button */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>BUY PRODUCTS IN NEPAL</Text>
          <TouchableOpacity
            style={styles.buyBtn}
            onPress={() => Linking.openURL('https://store.kheti.farm')}
          >
            <Text style={styles.buyBtnText}>Shop on Kheti.farm Nepal</Text>
          </TouchableOpacity>
        </View>

        {/* Analyze again */}
        <TouchableOpacity style={styles.againBtn} onPress={() => router.back()}>
          <Text style={styles.againText}>Analyze Another Leaf</Text>
        </TouchableOpacity>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fefae0' },
  content: { paddingBottom: 40 },
  navbar: {
    backgroundColor: '#2d6a4f',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 14,
    paddingHorizontal: 20,
  },
  backBtn: { color: 'rgba(255,255,255,0.85)', fontSize: 14, fontWeight: '700' },
  navTitle: { color: 'white', fontSize: 18, fontWeight: '800' },
  navTitleAccent: { color: '#f4a261' },
  leafImg: { width: '100%', height: 240, objectFit: 'cover' },
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
  sectionBody: { backgroundColor: '#f8fffe', borderLeftWidth: 4, borderLeftColor: '#74c69d', borderRadius: 10, padding: 14 },
  sectionRed: { borderLeftColor: '#ef4444', backgroundColor: '#fff5f5' },
  sectionBlue: { borderLeftColor: '#3b82f6', backgroundColor: '#f5f8ff' },
  sectionText: { fontSize: 14, color: '#333', lineHeight: 22 },
  buyBtn: { backgroundColor: '#2d6a4f', padding: 14, borderRadius: 12, alignItems: 'center' },
  buyBtnText: { color: 'white', fontWeight: '800', fontSize: 15 },
  againBtn: { backgroundColor: '#40916c', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 8 },
  againText: { color: 'white', fontWeight: '800', fontSize: 15 },
});