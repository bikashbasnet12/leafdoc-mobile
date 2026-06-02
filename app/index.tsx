import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const API_URL = 'https://leafdoc-nepal.onrender.com/predict';

const LANG = {
  en: {
    subtitle: 'AI PLANT DISEASE DETECTION',
    tagline: 'Upload a leaf photo and get instant disease diagnosis',
    accuracy: 'Accuracy', diseases: 'Diseases', crops: 'Crops',
    takePhoto: 'Take Photo', upload: 'Upload from Gallery',
    analyzing: 'Analyzing leaf...', supported: 'Supported Crops',
    footer: 'Built by Dhan Basnet — LeafDoc Nepal 2026',
    error: 'Could not connect to server. Check your internet.',
    permission: 'Please allow camera access.',
    demoTitle: 'How to Take a Good Photo',
    demoSub: 'Tips for accurate detection',
    goodTitle: 'Good Photo', badTitle: 'Bad Photo',
    good1: 'Single leaf fills the frame', good2: 'Clear and sharp focus',
    good3: 'Good natural lighting', good4: 'Plain background',
    bad1: 'Multiple plants in frame', bad2: 'Blurry or out of focus',
    bad3: 'Poor lighting or shadows', bad4: 'Watermarked stock photo',
    cropGuide: 'Crop Photo Guide', healthy: 'Healthy',
    appleDesc: 'Close-up of one leaf showing spots',
    bananaDesc: 'Yellow/brown streaks on leaf',
    cornDesc: 'Leaf with lesions or discoloration',
    potatoDesc: 'Brown spots or dark patches',
    riceDesc: 'Diamond-shaped lesions or brown tips',
  },
  ne: {
    subtitle: 'एआई बिरुवा रोग पहिचान',
    tagline: 'पातको फोटो अपलोड गर्नुहोस् र तुरुन्त रोग पहिचान पाउनुहोस्',
    accuracy: 'सटीकता', diseases: 'रोगहरू', crops: 'बालीहरू',
    takePhoto: 'फोटो खिच्नुहोस्', upload: 'ग्यालेरीबाट अपलोड',
    analyzing: 'पात विश्लेषण गर्दै...', supported: 'समर्थित बालीहरू',
    footer: 'Dhan Basnet द्वारा — LeafDoc Nepal 2026',
    error: 'सर्भरमा जडान गर्न सकिएन। इन्टरनेट जाँच गर्नुहोस्।',
    permission: 'कृपया क्यामेरा अनुमति दिनुहोस्।',
    demoTitle: 'राम्रो फोटो कसरी लिने',
    demoSub: 'सटीक पहिचानको लागि सुझावहरू',
    goodTitle: 'राम्रो फोटो', badTitle: 'खराब फोटो',
    good1: 'एउटा पात फ्रेम भर्छ', good2: 'स्पष्ट र तीखो फोकस',
    good3: 'राम्रो प्राकृतिक प्रकाश', good4: 'सरल पृष्ठभूमि',
    bad1: 'फ्रेममा धेरै बिरुवा', bad2: 'धमिलो वा फोकस बाहिर',
    bad3: 'कमजोर प्रकाश वा छाया', bad4: 'वाटरमार्क भएको फोटो',
    cropGuide: 'बाली फोटो गाइड', healthy: 'स्वस्थ',
    appleDesc: 'दाग देखाउने एउटा पातको नजिकको फोटो',
    bananaDesc: 'पातमा पहेलो/खैरो धर्काहरू',
    cornDesc: 'घाउ वा रंग परिवर्तन भएको पात',
    potatoDesc: 'खैरो दाग वा कालो धब्बाहरू',
    riceDesc: 'हीरा आकारका घाउ वा खैरो टुप्पो',
  }
};

const CROPS = {
  en: [
    { emoji: '🍎', name: 'Apple',   diseases: ['Healthy', 'Rot'],                          desc: 'appleDesc' },
    { emoji: '🍌', name: 'Banana',  diseases: ['Healthy', 'Panama', 'Sigatoka'],            desc: 'bananaDesc' },
    { emoji: '🌽', name: 'Corn',    diseases: ['Healthy', 'Blight', 'Gray Spot', 'Rust'],   desc: 'cornDesc' },
    { emoji: '🥔', name: 'Potato',  diseases: ['Healthy', 'Early Blight', 'Late Blight'],   desc: 'potatoDesc' },
    { emoji: '🌾', name: 'Rice',    diseases: ['Healthy', 'Blast', 'Blight', 'Brown Spot'], desc: 'riceDesc' },
  ],
  ne: [
    { emoji: '🍎', name: 'स्याउ',   diseases: ['स्वस्थ', 'सडन'],                                    desc: 'appleDesc' },
    { emoji: '🍌', name: 'केरा',    diseases: ['स्वस्थ', 'पनामा', 'सिगाटोका'],                      desc: 'bananaDesc' },
    { emoji: '🌽', name: 'मकै',     diseases: ['स्वस्थ', 'ब्लाइट', 'खैरो दाग', 'रस्ट'],            desc: 'cornDesc' },
    { emoji: '🥔', name: 'आलु',    diseases: ['स्वस्थ', 'प्रारम्भिक ब्लाइट', 'ढिलो ब्लाइट'],       desc: 'potatoDesc' },
    { emoji: '🌾', name: 'धान',     diseases: ['स्वस्थ', 'ब्लास्ट', 'ब्लाइट', 'खैरो दाग'],         desc: 'riceDesc' },
  ]
};

export default function HomeScreen() {
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState<'en' | 'ne'>('en');
  const router = useRouter();
  const t = LANG[lang];
  const toggleLang = () => setLang(lang === 'en' ? 'ne' : 'en');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, quality: 0.8,
    });
    if (!result.canceled) await sendImage(result.assets[0]);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) { Alert.alert('', t.permission); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
    if (!result.canceled) await sendImage(result.assets[0]);
  };

  const sendImage = async (asset: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', { uri: asset.uri, name: 'leaf.jpg', type: 'image/jpeg' } as any);
      formData.append('source', 'upload');

      const response = await fetch(API_URL, {
        method: 'POST', body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const html = await response.text();
      const plantMatch     = html.match(/class="info-val">(.*?)<\/div>/);
      const diseaseMatch   = html.match(/class="section-body">(.*?)<\/div>/);
      const treatmentMatch = html.match(/class="section-body red">(.*?)<\/div>/);
      const fertMatch      = html.match(/class="section-body blue">(.*?)<\/div>/);
      const confMatch      = html.match(/class="conf-value">([\d.]+)%<\/span>/);
      const sevMatch       = html.match(/class="severity-badge"[^>]*>(.*?)<\/span>/);

      router.push({
        pathname: '/result' as any,
        params: {
          plant:      plantMatch?.[1] ?? 'Unknown',
          disease:    diseaseMatch?.[1]?.trim() ?? 'Unknown',
          treatment:  treatmentMatch?.[1]?.trim() ?? 'N/A',
          fertilizer: fertMatch?.[1]?.trim() ?? 'N/A',
          confidence: confMatch?.[1] ?? '0',
          severity:   sevMatch?.[1]?.trim() ?? 'Unknown',
          imageUri:   asset.uri,
          lang:       lang,
        },
      });
    } catch (err) {
      Alert.alert('', t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.langRow}>
          <TouchableOpacity style={styles.langToggle} onPress={toggleLang}>
            <Text style={[styles.langBtn, lang === 'en' && styles.langActive]}>EN</Text>
            <Text style={styles.langDiv}>|</Text>
            <Text style={[styles.langBtn, lang === 'ne' && styles.langActive]}>नेपाली</Text>
          </TouchableOpacity>
        </View>
        <Image source={require('../assets/images/leaficon.jpeg')} style={styles.logo} />
        <Text style={styles.title}>LeafDoc Nepal</Text>
        <Text style={styles.subtitle}>{t.subtitle}</Text>
        <Text style={styles.tagline}>{t.tagline}</Text>
      </View>

      {/* STATS */}
      <View style={styles.statsRow}>
        <View style={styles.stat}><Text style={styles.statNum}>89.8%</Text><Text style={styles.statLabel}>{t.accuracy}</Text></View>
        <View style={styles.stat}><Text style={styles.statNum}>16</Text><Text style={styles.statLabel}>{t.diseases}</Text></View>
        <View style={styles.stat}><Text style={styles.statNum}>5</Text><Text style={styles.statLabel}>{t.crops}</Text></View>
      </View>

      {/* BUTTONS */}
      <View style={styles.btnGroup}>
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#2d6a4f" />
            <Text style={styles.loadingText}>{t.analyzing}</Text>
          </View>
        ) : (
          <>
            <TouchableOpacity style={styles.btnPrimary} onPress={takePhoto}>
              <Text style={styles.btnText}>{t.takePhoto}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.btnSecondary} onPress={pickImage}>
              <Text style={styles.btnTextSec}>{t.upload}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* DEMO SECTION */}
      <View style={styles.demoSection}>
        <Text style={styles.demoTitle}>{t.demoTitle}</Text>
        <Text style={styles.demoSub}>{t.demoSub}</Text>

        {/* Good vs Bad */}
        <View style={styles.compareRow}>
          <View style={[styles.compareBox, styles.goodBox]}>
            <View style={[styles.compareIcon, styles.goodIcon]}>
              <Text style={styles.compareIconText}>✓</Text>
            </View>
            <Text style={styles.compareTitle}>{t.goodTitle}</Text>
            {[t.good1, t.good2, t.good3, t.good4].map((item, i) => (
              <Text key={i} style={styles.compareItem}>• {item}</Text>
            ))}
          </View>
          <View style={[styles.compareBox, styles.badBox]}>
            <View style={[styles.compareIcon, styles.badIcon]}>
              <Text style={styles.compareIconText}>✕</Text>
            </View>
            <Text style={styles.compareTitle}>{t.badTitle}</Text>
            {[t.bad1, t.bad2, t.bad3, t.bad4].map((item, i) => (
              <Text key={i} style={styles.compareItem}>• {item}</Text>
            ))}
          </View>
        </View>

        {/* Crop guide */}
        <Text style={styles.cropGuideTitle}>{t.cropGuide}</Text>
        {CROPS[lang].map((crop, i) => (
          <View key={i} style={styles.cropGuideCard}>
            <Text style={styles.cropEmoji}>{crop.emoji}</Text>
            <View style={styles.cropGuideInfo}>
              <Text style={styles.cropGuideName}>{crop.name}</Text>
              <View style={styles.diseaseTags}>
                {crop.diseases.map((d, j) => (
                  <View key={j} style={[styles.diseaseTag, j === 0 ? styles.healthyTag : styles.sickTag]}>
                    <Text style={[styles.diseaseTagText, j === 0 ? styles.healthyText : styles.sickText]}>{d}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.cropGuideDesc}>{(t as any)[crop.desc]}</Text>
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.footer}>{t.footer}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fefae0', alignItems: 'center', paddingBottom: 40 },

  header: { width: '100%', backgroundColor: '#2d6a4f', alignItems: 'center', paddingTop: 56, paddingBottom: 36, paddingHorizontal: 20 },
  langRow: { width: '100%', alignItems: 'flex-end', marginBottom: 14 },
  langToggle: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  langBtn: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '700' },
  langActive: { color: '#f4a261' },
  langDiv: { color: 'rgba(255,255,255,0.3)', marginHorizontal: 6 },
  logo: { width: 80, height: 80, borderRadius: 16, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: 'white', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#f4a261', fontWeight: '700', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 22 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', backgroundColor: '#40916c', paddingVertical: 18 },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '800', color: '#f4a261' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },

  btnGroup: { width: '100%', paddingHorizontal: 24, paddingTop: 28, gap: 12 },
  btnPrimary: { backgroundColor: '#2d6a4f', padding: 18, borderRadius: 14, alignItems: 'center' },
  btnSecondary: { backgroundColor: 'white', padding: 18, borderRadius: 14, alignItems: 'center', borderWidth: 2, borderColor: '#2d6a4f' },
  btnText: { color: 'white', fontSize: 16, fontWeight: '800' },
  btnTextSec: { color: '#2d6a4f', fontSize: 16, fontWeight: '800' },
  loadingBox: { alignItems: 'center', paddingVertical: 28 },
  loadingText: { marginTop: 12, color: '#2d6a4f', fontSize: 15, fontWeight: '600' },

  // DEMO SECTION
  demoSection: { width: '100%', paddingHorizontal: 20, paddingTop: 36 },
  demoTitle: { fontSize: 20, fontWeight: '800', color: '#2d6a4f', textAlign: 'center', marginBottom: 4 },
  demoSub: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginBottom: 20 },

  compareRow: { flexDirection: 'row', gap: 12, marginBottom: 28 },
  compareBox: { flex: 1, borderRadius: 14, padding: 14, borderWidth: 2 },
  goodBox: { backgroundColor: '#f0faf4', borderColor: '#74c69d' },
  badBox: { backgroundColor: '#fff5f5', borderColor: '#fca5a5' },
  compareIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  goodIcon: { backgroundColor: '#22c55e' },
  badIcon: { backgroundColor: '#ef4444' },
  compareIconText: { color: 'white', fontWeight: '800', fontSize: 16 },
  compareTitle: { fontSize: 14, fontWeight: '800', color: '#1a1a2e', marginBottom: 8 },
  compareItem: { fontSize: 12, color: '#6b7280', paddingVertical: 3, lineHeight: 18 },

  cropGuideTitle: { fontSize: 17, fontWeight: '800', color: '#2d6a4f', marginBottom: 14 },
  cropGuideCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'white', borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1.5, borderColor: '#e0f0e8' },
  cropEmoji: { fontSize: 32, marginRight: 12, marginTop: 2 },
  cropGuideInfo: { flex: 1 },
  cropGuideName: { fontSize: 15, fontWeight: '800', color: '#2d6a4f', marginBottom: 6 },
  diseaseTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: 6 },
  diseaseTag: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  healthyTag: { backgroundColor: '#d1fae5' },
  sickTag: { backgroundColor: '#fee2e2' },
  diseaseTagText: { fontSize: 11, fontWeight: '700' },
  healthyText: { color: '#065f46' },
  sickText: { color: '#991b1b' },
  cropGuideDesc: { fontSize: 12, color: '#6b7280', lineHeight: 18 },

  footer: { marginTop: 36, fontSize: 12, color: '#aaa', textAlign: 'center', paddingHorizontal: 20 },
});