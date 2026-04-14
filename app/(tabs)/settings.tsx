import { DataPortabilityService } from '@/services/dataPortabilityService';
import { useUserStore } from '@/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const profileSheetRef = useRef<BottomSheetModal>(null);

  const { isLoading, data, updateProfile } = useUserStore();

  const [isExportingFull, setIsExportingFull] = useState(false);
  const [isImportingFull, setIsImportingFull] = useState(false);
  const [isExportingWorkouts, setIsExportingWorkouts] = useState(false);
  const [isImportingWorkouts, setIsImportingWorkouts] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmConfig, setConfirmConfig] = useState<{ title: string; desc: string; onConfirm: () => void }>({
    title: '',
    desc: '',
    onConfirm: () => { }
  });

  const triggerExportFull = () => {
    setConfirmConfig({
      title: 'Generate Full Backup?',
      desc: 'This will create a secure vault file containing all your routines, history, and profile settings ready for sharing.',
      onConfirm: async () => {
        setIsExportingFull(true);
        try {
          await DataPortabilityService.exportFullVault();
          setShowSuccess(true);
        } catch (err: any) {
          setErrorMessage(err?.message || 'Export failed. Please try again.');
          setShowError(true);
        } finally {
          setIsExportingFull(false);
        }
      }
    });
    setShowConfirm(true);
  };

  const triggerExportWorkouts = () => {
    setConfirmConfig({
      title: 'Export Workouts?',
      desc: 'This will extract only your workout logs and routines into a portable file.',
      onConfirm: async () => {
        setIsExportingWorkouts(true);
        try {
          await DataPortabilityService.exportWorkoutsOnly();
          setShowSuccess(true);
        } catch (err: any) {
          setErrorMessage(err?.message || 'Export failed. Please try again.');
          setShowError(true);
        } finally {
          setIsExportingWorkouts(false);
        }
      }
    });
    setShowConfirm(true);
  };

  const triggerImportFull = () => {
    setConfirmConfig({
      title: 'Restore Everything?',
      desc: 'This will overwrite ALL your current profiles, history, and routines. This action is permanent.',
      onConfirm: async () => {
        setIsImportingFull(true);
        try {
          const result = await DataPortabilityService.importFullVault();
          if (result === true) setShowSuccess(true);
          // result === false means user cancelled picker — do nothing
        } catch (err: any) {
          setErrorMessage(err?.message || 'Import failed. Please check the file and try again.');
          setShowError(true);
        } finally {
          setIsImportingFull(false);
        }
      }
    });
    setShowConfirm(true);
  };

  const triggerImportWorkouts = () => {
    setConfirmConfig({
      title: 'Import Workouts?',
      desc: 'This will add workout logs and routines from your backup file to your current history.',
      onConfirm: async () => {
        setIsImportingWorkouts(true);
        try {
          const result = await DataPortabilityService.importWorkoutsOnly();
          if (result === true) setShowSuccess(true);
          // result === false means user cancelled picker — do nothing
        } catch (err: any) {
          setErrorMessage(err?.message || 'Import failed. Please check the file and try again.');
          setShowError(true);
        } finally {
          setIsImportingWorkouts(false);
        }
      }
    });
    setShowConfirm(true);
  };

  const updateUnit = async (type: 'weight' | 'height', unit: string) => {
    const currentVal = data?.[type] || 0;
    const currentUnit = data?.[`${type}_unit` as keyof typeof data];
    if (currentUnit == unit) return;

    let newValue = currentVal;
    if (type === 'weight') {
      newValue = unit === 'lb' ? Math.round(currentVal * 2.20462) : Math.round(currentVal / 2.20462);
    } else {
      newValue = unit === 'ft' ? parseFloat((currentVal * 0.0328084).toFixed(1)) : Math.round(currentVal / 0.0328084);
    }

    await updateProfile({ [`${type}_unit`]: unit, [type]: newValue });
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PREFERENCES</Text>
          </View>

          <View style={styles.section}>
            <View style={styles.row}>
              <View style={[styles.iconBox, { backgroundColor: '#EEF4FF' }]}><Ionicons name="scale-outline" size={20} color="#5C4AE4" /></View>
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
              <View style={[styles.iconBox, { backgroundColor: '#EEF4FF' }]}><Ionicons name="body-outline" size={20} color="#5C4AE4" /></View>
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
              <View style={[styles.iconBox, { backgroundColor: '#EEF4FF' }]}><Ionicons name="scale-outline" size={20} color="#5C4AE4" /></View>
              <View style={styles.rowContent}>
                <Text style={styles.rowText}>Weight</Text>
                <Text style={styles.rowSubtitle}>{data?.weight} {data?.weight_unit}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#5C4AE4" />
            </Pressable>
            <View style={styles.divider} />
            <Pressable style={styles.row} onPress={() => router.push({ pathname: '/height', params: { mode: 'edit', initialHeight: data?.height?.toString(), initialUnit: data?.height_unit, gender: data?.gender } })}>
              <View style={[styles.iconBox, { backgroundColor: '#EEF4FF' }]}><Ionicons name="body-outline" size={20} color="#5C4AE4" /></View>
              <View style={styles.rowContent}>
                <Text style={styles.rowText}>Height</Text>
                <Text style={styles.rowSubtitle}>{data?.height} {data?.height_unit}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#5C4AE4" />
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={styles.row} onPress={() => router.push({ pathname: '/schedule', params: { mode: 'edit', time: data?.gym_time, days: data?.gym_days } })}>
              <View style={[styles.iconBox, { backgroundColor: '#EEF4FF' }]}><Ionicons name="calendar-outline" size={20} color="#5C4AE4" /></View>
              <View style={styles.rowContent}>
                <Text style={styles.rowText}>Gym Schedule</Text>
                <Text style={styles.rowSubtitle}>{data?.gym_time} • {data?.gym_days}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#5C4AE4" />
            </Pressable>
          </View>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>DATA MANAGEMENT</Text>
          </View>

          <View style={styles.backupCard}>
            <View style={styles.backupHeader}>
              <View style={[styles.backupIcon, { backgroundColor: '#EEF4FF' }]}>
                <Ionicons name="shield-checkmark" size={24} color="#5C4AE4" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.backupTitle}>Full Application Vault</Text>
                <Text style={styles.backupDesc}>Backup everything: profiles, history, routines, and app preferences.</Text>
              </View>
            </View>
            <View style={styles.backupActions}>
              <Pressable
                style={styles.actionBtn}
                onPress={triggerExportFull}
                disabled={isExportingFull}
              >
                {isExportingFull ? <ActivityIndicator size="small" color="#5C4AE4" /> : (
                  <>
                    <Ionicons name="share-outline" size={18} color="#5C4AE4" />
                    <Text style={styles.actionBtnText}>Export All</Text>
                  </>
                )}
              </Pressable>
              <View style={styles.vDivider} />
              <Pressable
                style={styles.actionBtn}
                onPress={triggerImportFull}
                disabled={isImportingFull}
              >
                {isImportingFull ? <ActivityIndicator size="small" color="#5C4AE4" /> : (
                  <>
                    <Ionicons name="download-outline" size={18} color="#5C4AE4" />
                    <Text style={styles.actionBtnText}>Import All</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>

          <View style={styles.backupCard}>
            <View style={styles.backupHeader}>
              <View style={[styles.backupIcon, { backgroundColor: '#EEF4FF' }]}>
                <Ionicons name="barbell" size={24} color="#5C4AE4" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.backupTitle}>Workout Portability</Text>
                <Text style={styles.backupDesc}>Export only your routines and workout history for easy migration.</Text>
              </View>
            </View>
            <View style={styles.backupActions}>
              <Pressable
                style={styles.actionBtn}
                onPress={triggerExportWorkouts}
                disabled={isExportingWorkouts}
              >
                {isExportingWorkouts ? <ActivityIndicator size="small" color="#5C4AE4" /> : (
                  <>
                    <Ionicons name="share-outline" size={18} color="#5C4AE4" />
                    <Text style={[styles.actionBtnText, { color: '#5C4AE4' }]}>Export</Text>
                  </>
                )}
              </Pressable>
              <View style={styles.vDivider} />
              <Pressable
                style={styles.actionBtn}
                onPress={triggerImportWorkouts}
                disabled={isImportingWorkouts}
              >
                {isImportingWorkouts ? <ActivityIndicator size="small" color="#5C4AE4" /> : (
                  <>
                    <Ionicons name="download-outline" size={18} color="#5C4AE4" />
                    <Text style={[styles.actionBtnText, { color: '#5C4AE4' }]}>Import</Text>
                  </>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BlurView intensity={20} style={StyleSheet.absoluteFill} />
          <View style={styles.confirmBox}>
            <View style={styles.statusCircle}>
              <Ionicons name="shield-checkmark-outline" size={32} color="#5C4AE4" />
            </View>
            <Text style={styles.confirmTitle}>{confirmConfig.title}</Text>
            <Text style={styles.confirmDesc}>{confirmConfig.desc}</Text>
            <View style={styles.confirmActions}>
              <Pressable style={styles.cancelLink} onPress={() => setShowConfirm(false)}>
                <Text style={styles.cancelLinkText}>Cancel</Text>
              </Pressable>
              <Pressable style={styles.primaryConfirmBtn} onPress={() => { setShowConfirm(false); confirmConfig.onConfirm(); }}>
                <Text style={styles.primaryConfirmBtnText}>Yes, Proceed</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BlurView intensity={20} style={StyleSheet.absoluteFill} />
          <View style={styles.successCard}>
            <View style={[styles.statusCircle, { backgroundColor: '#EEF4FF' }]}>
              <Ionicons name="checkmark-circle" size={36} color="#5C4AE4" />
            </View>
            <Text style={styles.confirmTitle}>Process Complete!</Text>
            <Text style={styles.confirmDesc}>Your data has been successfully processed and secured.</Text>
            <View style={styles.confirmActions}>
              <Pressable style={styles.primaryConfirmBtn} onPress={() => { setShowSuccess(false) }}>
                <Text style={styles.primaryConfirmBtnText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showError} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <BlurView intensity={20} style={StyleSheet.absoluteFill} />
          <View style={styles.errorCard}>
            <View style={[styles.statusCircle, { backgroundColor: '#FEE2E2' }]}>
              <Ionicons name="close-circle" size={36} color="#DC2626" />
            </View>
            <Text style={[styles.confirmTitle, { color: '#DC2626' }]}>Something Went Wrong</Text>
            <Text style={styles.confirmDesc}>{errorMessage}</Text>
            <View style={styles.confirmActions}>
              <Pressable style={[styles.primaryConfirmBtn, { backgroundColor: '#DC2626' }]} onPress={() => { setShowError(false) }}>
                <Text style={styles.primaryConfirmBtnText}>Dismiss</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fc' },
  title: { fontSize: 24, fontWeight: '800', color: '#111', marginHorizontal: 20, marginTop: 10, marginBottom: 20 },
  section: { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 20, marginBottom: 24, paddingVertical: 8, elevation: 1, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5 },
  sectionHeader: { marginHorizontal: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontWeight: '700', color: '#8b92a5', letterSpacing: 1, marginTop: 10 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
  iconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#f2f4f7', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  rowContent: { flex: 1 },
  rowText: { fontSize: 16, fontWeight: '500', color: '#333' },
  rowSubtitle: { fontSize: 13, color: '#8b92a5', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#f0f0f5', marginLeft: 64 },

  // Data Management Cards
  backupCard: { backgroundColor: '#fff', borderRadius: 16, marginHorizontal: 20, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#f0f0f5' },
  backupHeader: { flexDirection: 'row', padding: 16, gap: 12, alignItems: 'center' },
  backupIcon: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  backupTitle: { fontSize: 16, fontWeight: '700', color: '#111', marginBottom: 2 },
  backupDesc: { fontSize: 12, color: '#666', lineHeight: 18 },
  backupActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f1f5f9', backgroundColor: '#fdfdfe' },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
  actionBtnText: { fontSize: 13, fontWeight: '800', color: '#5C4AE4' },
  vDivider: { width: 1, backgroundColor: '#f1f5f9' },

  toggleGroup: { flexDirection: 'row', backgroundColor: '#f2f4f7', borderRadius: 8, padding: 4 },
  toggleBtn: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 6 },
  toggleActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  toggleText: { fontSize: 13, fontWeight: '700', color: '#888' },
  toggleActiveText: { color: '#5C4AE4' },

  // Confirmation Modal Styles
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
  confirmBox: { width: '85%', backgroundColor: '#fff', borderRadius: 28, paddingVertical: 24, paddingHorizontal: 16, alignItems: 'center' },
  statusCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#EEF4FF', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  confirmTitle: { fontSize: 20, fontWeight: '900', color: '#111', marginBottom: 8 },
  confirmDesc: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  confirmActions: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  cancelLink: { paddingVertical: 12, paddingHorizontal: 20 },
  cancelLinkText: { fontSize: 15, fontWeight: '700', color: '#666' },
  primaryConfirmBtn: { backgroundColor: '#5C4AE4', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  primaryConfirmBtnText: { fontSize: 15, fontWeight: '800', color: '#fff' },

  // Success Dialog Styles (Gray/Black Theme)
  successCard: { width: '85%', backgroundColor: '#fff', borderRadius: 28, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#f0f0f5', elevation: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20 },

  // Error Dialog Styles
  errorCard: { width: '85%', backgroundColor: '#fff', borderRadius: 28, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: '#FEE2E2', elevation: 12, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20 },

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

  responsiveWrapper: { width: '100%', maxWidth: 768, alignSelf: 'center' }
});
