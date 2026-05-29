import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Image, ActivityIndicator, ScrollView, Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

const API_URL = 'https://leafdoc-nepal.onrender.com/predict';

const LANG = {
  en: {
    subtitle: 'AI PLANT DISEASE DETECTION',
    tagline: 'Upload a leaf photo and get instant disease diagnosis',
    accuracy: 'Accuracy',
    diseases: 'Diseases',
    crops: 'Crops',
    takePhoto: 'Take Photo',
    upload: 'Upload from Gallery',
    analyzing: 'Analyzing leaf...',
    supported: 'Supported Crops',
    footer: 'Built by Dhan Basnet — LeafDoc Nepal 2026',
    error: 'Could not connect to server. Check your internet.',
    permission: 'Please allow camera access.',
  },
  ne: {
    subtitle: 'एआई बिरुवा रोग पहिचान',
    tagline: 'पातको फोटो अपलोड गर्नुहोस् र तुरुन्त रोग पहिचान पाउनुहोस्',
    accuracy: 'सटीकता',
    diseases: 'रोगहरू',
    crops: 'बालीहरू',
    takePhoto: 'फोटो खिच्नुहोस्',
    upload: 'ग्यालेरीबाट अपलोड',
    analyzing: 'पात विश्लेषण गर्दै...',
    supported: 'समर्थित बालीहरू',
    footer: 'दhan Basnet द्वारा निर्मित — LeafDoc Nepal 2026',
    error: 'सर्भरमा जडान गर्न सकिएन। इन्टरनेट जाँच गर्नुहोस्।',
    permission: 'कृपया क्यामेरा अनुमति दिनुहोस्।',
  }
};

const CROPS = {
  en: ['Apple', 'Banana', 'Corn', 'Potato', 'Rice'],
  ne: ['स्याउ', 'केरा', 'मकै', 'आलु', 'धान'],
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
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) await sendImage(result.assets[0]);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('', t.permission);
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) await sendImage(result.assets[0]);
  };

  const sendImage = async (asset: any) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: asset.uri,
        name: 'leaf.jpg',
        type: 'image/jpeg',
      } as any);
      formData.append('source', 'upload');

      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const html = await response.text();

      const plantMatch = html.match(/class="info-val">(.*?)<\/div>/);
      const diseaseMatch = html.match(/class="section-body">(.*?)<\/div>/);
      const treatmentMatch = html.match(/class="section-body red">(.*?)<\/div>/);
      const fertilizerMatch = html.match(/class="section-body blue">(.*?)<\/div>/);
      const confMatch = html.match(/class="conf-value">([\d.]+)%<\/span>/);
      const severityMatch = html.match(/class="severity-badge"[^>]*>(.*?)<\/span>/);

      router.push({
        pathname: '/result' as any,
        params: {
          plant: plantMatch?.[1] ?? 'Unknown',
          disease: diseaseMatch?.[1]?.trim() ?? 'Unknown',
          treatment: treatmentMatch?.[1]?.trim() ?? 'N/A',
          fertilizer: fertilizerMatch?.[1]?.trim() ?? 'N/A',
          confidence: confMatch?.[1] ?? '0',
          severity: severityMatch?.[1]?.trim() ?? 'Unknown',
          imageUri: asset.uri,
          lang: lang,
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

      {/* Header */}
      <View style={styles.header}>

        {/* Language toggle */}
        <View style={styles.langRow}>
          <TouchableOpacity style={styles.langToggle} onPress={toggleLang}>
            <Text style={[styles.langBtn, lang === 'en' && styles.langActive]}>EN</Text>
            <Text style={styles.langDivider}>|</Text>
            <Text style={[styles.langBtn, lang === 'ne' && styles.langActive]}>नेपाली</Text>
          </TouchableOpacity>
        </View>

        <Image source={require('../assets/images/leaficon.jpeg')} style={styles.logo} />
        <Text style={styles.title}>LeafDoc Nepal</Text>
        <Text style={styles.subtitle}>{t.subtitle}</Text>
        <Text style={styles.tagline}>{t.tagline}</Text>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>89.8%</Text>
          <Text style={styles.statLabel}>{t.accuracy}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>16</Text>
          <Text style={styles.statLabel}>{t.diseases}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>5</Text>
          <Text style={styles.statLabel}>{t.crops}</Text>
        </View>
      </View>

      {/* Buttons */}
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
              <Text style={styles.btnTextSecondary}>{t.upload}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Crops */}
      <View style={styles.cropsSection}>
        <Text style={styles.cropsTitle}>{t.supported}</Text>
        <View style={styles.cropsRow}>
          {CROPS[lang].map(crop => (
            <View key={crop} style={styles.cropTag}>
              <Text style={styles.cropText}>{crop}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.footer}>{t.footer}</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#fefae0', alignItems: 'center', paddingBottom: 40 },
  header: { width: '100%', backgroundColor: '#2d6a4f', alignItems: 'center', paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20 },
  langRow: { width: '100%', alignItems: 'flex-end', marginBottom: 16 },
  langToggle: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  langBtn: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '700' },
  langActive: { color: '#f4a261' },
  langDivider: { color: 'rgba(255,255,255,0.3)', marginHorizontal: 6 },
  logo: { width: 80, height: 80, borderRadius: 16, marginBottom: 12 },
  title: { fontSize: 28, fontWeight: '800', color: 'white', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#f4a261', fontWeight: '700', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1, textAlign: 'center' },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 22 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', backgroundColor: '#40916c', paddingVertical: 20 },
  stat: { alignItems: 'center' },
  statNum: { fontSize: 24, fontWeight: '800', color: '#f4a261' },
  statLabel: { fontSize: 12, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  btnGroup: { width: '100%', paddingHorizontal: 24, paddingTop: 32, gap: 14 },
  btnPrimary: { backgroundColor: '#2d6a4f', padding: 18, borderRadius: 14, alignItems: 'center' },
  btnSecondary: { backgroundColor: 'white', padding: 18, borderRadius: 14, alignItems: 'center', borderWidth: 2, borderColor: '#2d6a4f' },
  btnText: { color: 'white', fontSize: 16, fontWeight: '800' },
  btnTextSecondary: { color: '#2d6a4f', fontSize: 16, fontWeight: '800' },
  loadingBox: { alignItems: 'center', paddingVertical: 30 },
  loadingText: { marginTop: 12, color: '#2d6a4f', fontSize: 15, fontWeight: '600' },
  cropsSection: { width: '100%', paddingHorizontal: 24, paddingTop: 32 },
  cropsTitle: { fontSize: 16, fontWeight: '800', color: '#2d6a4f', marginBottom: 12 },
  cropsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cropTag: { backgroundColor: 'white', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#74c69d' },
  cropText: { color: '#2d6a4f', fontWeight: '700', fontSize: 13 },
  footer: { marginTop: 40, fontSize: 12, color: '#aaa', textAlign: 'center', paddingHorizontal: 20 },
});