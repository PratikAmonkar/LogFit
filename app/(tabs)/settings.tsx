import { useUserStore } from '@/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const profileSheetRef = useRef<BottomSheetModal>(null);
  const exportSheetRef = useRef<BottomSheetModal>(null);

  const { isLoading, data, updateProfile } = useUserStore()

  const updateUnit = async (type: 'weight' | 'height', unit: string) => {

    const currentVal = data?.[type] || 0;
    const currentUnit = data?.[`${type}_unit` as keyof typeof data];

    if (currentUnit == unit) return;

    let newValue = currentVal;
    if (type === 'weight') {
      newValue = unit === 'lb'
        ? Math.round(currentVal * 2.20462)
        : Math.round(currentVal / 2.20462);
    } else {
      newValue = unit === 'ft'
        ? parseFloat((currentVal * 0.0328084).toFixed(1))
        : Math.round(currentVal / 0.0328084);
    }

    await updateProfile({
      [`${type}_unit`]: unit,
      [type]: newValue
    })
  };

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  );

  if (isLoading && !data) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#0B63C6" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>Settings</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.responsiveWrapper}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PREFERENCES</Text>

            <View style={styles.row}>
              <View style={styles.iconBox}><Ionicons name="scale-outline" size={20} color="#333" /></View>
              <View style={styles.rowContent}>
                <Text style={styles.rowText}>Weight Unit</Text>
              </View>
              <View style={styles.toggleGroup}>
                <Pressable onPress={() => updateUnit('weight', 'kg')} style={[styles.toggleBtn, data?.weight_unit === 'kg' && styles.toggleActive]}>
                  <Text style={[styles.toggleText, data?.weight_unit === 'kg' && styles.toggleActiveText]}>kg</Text>
                </Pressable>
                <Pressable onPress={() => updateUnit('weight', 'lb')} style={[styles.toggleBtn, data?.weight_unit === 'lb' && styles.toggleActive]}>
                  <Text style={[styles.toggleText, data?.weight_unit === 'lb' && styles.toggleActiveText]}>lb</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <View style={styles.iconBox}><Ionicons name="body-outline" size={20} color="#333" /></View>
              <View style={styles.rowContent}>
                <Text style={styles.rowText}>Height Unit</Text>
              </View>
              <View style={styles.toggleGroup}>
                <Pressable onPress={() => updateUnit('height', 'cm')} style={[styles.toggleBtn, data?.height_unit === 'cm' && styles.toggleActive]}>
                  <Text style={[styles.toggleText, data?.height_unit === 'cm' && styles.toggleActiveText]}>cm</Text>
                </Pressable>
                <Pressable onPress={() => updateUnit('height', 'ft')} style={[styles.toggleBtn, data?.height_unit === 'ft' && styles.toggleActive]}>
                  <Text style={[styles.toggleText, data?.height_unit === 'ft' && styles.toggleActiveText]}>ft</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.divider} />
            <Pressable style={styles.row} onPress={() => router.push({ pathname: '/weight', params: { mode: 'edit', initialWeight: data?.weight?.toString(), initialUnit: data?.weight_unit } })}>
              <View style={styles.iconBox}><Ionicons name="scale-outline" size={20} color="#333" /></View>
              <View style={styles.rowContent}>
                <Text style={styles.rowText}>Weight</Text>
                <Text style={styles.rowSubtitle}>{data?.weight} {data?.weight_unit}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </Pressable>
            <View style={styles.divider} />
            <Pressable style={styles.row} onPress={() => router.push({ pathname: '/height', params: { mode: 'edit', initialHeight: data?.height?.toString(), initialUnit: data?.height_unit, gender: data?.gender } })}>
              <View style={styles.iconBox}><Ionicons name="body-outline" size={20} color="#333" /></View>
              <View style={styles.rowContent}>
                <Text style={styles.rowText}>Height</Text>
                <Text style={styles.rowSubtitle}>{data?.height} {data?.height_unit}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={styles.row} onPress={() => router.push({ pathname: '/schedule', params: { mode: 'edit', time: data?.gym_time, days: data?.gym_days } })}>
              <View style={styles.iconBox}><Ionicons name="calendar-outline" size={20} color="#333" /></View>
              <View style={styles.rowContent}>
                <Text style={styles.rowText}>Gym Schedule</Text>
                <Text style={styles.rowSubtitle}>{data?.gym_time} • {data?.gym_days}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </Pressable>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DATA MANAGEMENT</Text>
            <Pressable style={styles.row} onPress={() => exportSheetRef.current?.present()}>
              <View style={styles.iconBox}><Ionicons name="download-outline" size={20} color="#333" /></View>
              <View style={styles.rowContent}>
                <Text style={styles.rowText}>Export My Data</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      <BottomSheetModal
        ref={profileSheetRef}
        index={0}
        snapPoints={['75%']}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#fff', borderRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: '#ccc', width: 40 }}
      >
        <BottomSheetView style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <Text style={styles.modalTitle}>Fitness Data</Text>
          <Text style={styles.modalSubtitle}>Update your physical stats and schedule.</Text>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Height ({data?.height_unit})</Text>
              <TextInput
                style={styles.input}
                value={data?.height?.toString()}
                onChangeText={t => { }}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Weight ({data?.weight_unit})</Text>
              <TextInput
                style={styles.input}
                value={data?.weight?.toString()}
                onChangeText={t => { }}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.label}>Gym Time</Text>
          <TextInput
            style={styles.input}
            value={data?.gym_time}
            placeholder="e.g. 06:30 AM"
            onChangeText={t => { }}
          />

          <Text style={styles.label}>Gym Days</Text>
          <TextInput
            style={styles.input}
            value={data?.gym_days}
            placeholder="e.g. Mon, Wed, Fri"
            onChangeText={t => { }}
          />

          <View style={styles.modalActions}>
            <Pressable style={styles.cancelBtn} onPress={() => profileSheetRef.current?.dismiss()}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.saveBtn} onPress={() => { }}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </Pressable>
          </View>
        </BottomSheetView>
      </BottomSheetModal>

      {/* Bottom Sheet: Export */}
      <BottomSheetModal
        ref={exportSheetRef}
        index={0}
        snapPoints={['40%']}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: '#fff', borderRadius: 24 }}
        handleIndicatorStyle={{ backgroundColor: '#ccc', width: 40 }}
      >
        <BottomSheetView style={[styles.modalContent, { paddingBottom: Math.max(insets.bottom, 24) }]}>
          <Text style={styles.modalTitle}>Export Your Data</Text>
          <Text style={styles.modalSubtitle}>Download a copy of your logs to store locally.</Text>

          <Pressable style={styles.exportOptionBtn} onPress={() => { alert('Downloading CSV...'); exportSheetRef.current?.dismiss(); }}>
            <Ionicons name="document-text-outline" size={24} color="#0B63C6" />
            <Text style={styles.exportOptionText}>Export as CSV spreadsheet</Text>
          </Pressable>

          <Pressable style={styles.exportOptionBtn} onPress={() => { alert('Syncing to Health...'); exportSheetRef.current?.dismiss(); }}>
            <Ionicons name="fitness-outline" size={24} color="#0B63C6" />
            <Text style={styles.exportOptionText}>Sync to Apple Health & Fit</Text>
          </Pressable>

          <Pressable style={{ marginTop: 10, alignItems: 'center' }} onPress={() => exportSheetRef.current?.dismiss()}>
            <Text style={styles.cancelBtnText}>Close</Text>
          </Pressable>
        </BottomSheetView>
      </BottomSheetModal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fc' },
  title: { fontSize: 24, fontWeight: '800', color: '#111', marginHorizontal: 20, marginTop: 10, marginBottom: 20 },
  section: { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 20, marginBottom: 24, paddingVertical: 8, elevation: 1, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#8b92a5', letterSpacing: 1, marginHorizontal: 16, marginTop: 8, marginBottom: 4 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  iconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#f2f4f7', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rowContent: { flex: 1 },
  rowText: { fontSize: 16, fontWeight: '500', color: '#333' },
  rowSubtitle: { fontSize: 13, color: '#8b92a5', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f0f0f5', marginLeft: 64 },

  toggleGroup: { flexDirection: 'row', backgroundColor: '#f2f4f7', borderRadius: 8, padding: 4 },
  toggleBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 6 },
  toggleActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  toggleText: { fontSize: 13, fontWeight: '700', color: '#888' },
  toggleActiveText: { color: '#0B63C6' },

  modalContent: { flex: 1, paddingHorizontal: 24, paddingTop: 10 },
  modalTitle: { fontSize: 22, fontWeight: '800', marginBottom: 6 },
  modalSubtitle: { fontSize: 14, color: '#666', marginBottom: 24, fontWeight: '500' },
  label: { fontSize: 12, fontWeight: '700', color: '#555', marginBottom: 8, marginTop: 4 },
  input: { backgroundColor: '#f2f4f7', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: '#111', fontWeight: '600' },
  modalActions: { flexDirection: 'row', marginTop: 10, gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: '#f2f4f7', paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  cancelBtnText: { fontSize: 15, fontWeight: '700', color: '#555' },
  saveBtn: { flex: 1, backgroundColor: '#0B63C6', paddingVertical: 16, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  exportOptionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fc', padding: 18, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#e6f0fa' },
  exportOptionText: { fontSize: 15, fontWeight: '700', color: '#333', marginLeft: 12 },

  responsiveWrapper: { width: '100%', maxWidth: 768, alignSelf: 'center' }
});
