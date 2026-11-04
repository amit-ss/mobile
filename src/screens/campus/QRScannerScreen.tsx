import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Modal, Linking
} from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../context/ThemeContext';
import { api } from '../../services/api';
import { Header } from '../../components/Header';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { Ionicons } from '@expo/vector-icons';
import { useLiveLocation } from '../../hooks/useLiveLocation';
import {
  distanceMeters, bearingDegrees, compassPoint, formatDistance, walkMinutes, directionsUrl
} from '../../utils/geo';

// Loaded lazily (same pattern as expo-speech elsewhere in the app) so the screen still
// opens, in manual mode, if the camera module has not been installed yet.
let CameraModule: any = null;
try {
  CameraModule = require('expo-camera');
} catch (e) {}
const CameraView: any = CameraModule?.CameraView;
const useCameraPermissions: () => [any, () => Promise<any>] =
  CameraModule?.useCameraPermissions ?? (() => [null, async () => null]);

/** Accepts a bare ID, a URL (?code=... or last path segment) or JSON ({"qr_code_id": "..."}). */
const parseQrPayload = (raw: string): string => {
  const text = (raw || '').trim();
  if (!text) return '';
  try {
    const obj = JSON.parse(text);
    if (obj && typeof obj === 'object') {
      return String(obj.qr_code_id || obj.code || obj.id || '').trim() || text;
    }
  } catch (e) {}
  if (/^https?:\/\//i.test(text)) {
    try {
      const url = new URL(text);
      const q = url.searchParams.get('code') || url.searchParams.get('qr') || url.searchParams.get('id');
      if (q) return q.trim();
      const segments = url.pathname.split('/').filter(Boolean);
      if (segments.length) return decodeURIComponent(segments[segments.length - 1]);
    } catch (e) {}
  }
  return text;
};

export const QRScannerScreen: React.FC = () => {
  const { theme } = useAppTheme();
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const [permission, requestPermission] = useCameraPermissions();
  const { coords } = useLiveLocation(isFocused);

  const [manualCode, setManualCode] = useState('');
  const [looking, setLooking] = useState(false);
  const [torch, setTorch] = useState(false);
  const [scannedResult, setScannedResult] = useState<any>(null);
  const [lastScanned, setLastScanned] = useState('');
  const askedForCamera = useRef(false);
  const locked = useRef(false); // stops the camera firing the same code many times a second

  // Ask for camera access the first time the screen opens
  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain && !askedForCamera.current) {
      askedForCamera.current = true;
      requestPermission();
    }
  }, [permission]);

  const handleLookup = useCallback(async (codeToSearch?: string) => {
    const code = parseQrPayload(codeToSearch ?? manualCode);
    if (!code) {
      Alert.alert('Required', 'Please enter or scan a campus QR code ID.');
      return;
    }

    locked.current = true;
    setLastScanned(code);
    setLooking(true);
    try {
      const res = await api.lookupQRCode(code);
      if (res.found) {
        setScannedResult(res.location);
      } else {
        Alert.alert('Unknown Code', `No verified LPU location registered under ID "${code}".`, [
          { text: 'Scan again', onPress: () => { locked.current = false; } }
        ]);
      }
    } catch (e) {
      Alert.alert('Lookup failed', 'Could not reach the campus directory. Please try again.', [
        { text: 'OK', onPress: () => { locked.current = false; } }
      ]);
    } finally {
      setLooking(false);
    }
  }, [manualCode]);

  const closeResult = () => {
    setScannedResult(null);
    locked.current = false;
  };

  const distanceInfo = (() => {
    if (!coords || !scannedResult) return null;
    const me = { latitude: coords.latitude, longitude: coords.longitude };
    const dest = { latitude: scannedResult.latitude, longitude: scannedResult.longitude };
    const m = distanceMeters(me, dest);
    return { text: formatDistance(m), walk: walkMinutes(m), dir: compassPoint(bearingDegrees(me, dest)) };
  })();

  const cameraGranted = !!permission?.granted;
  const cameraReady = !!CameraView && cameraGranted && isFocused;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Header
        title="Campus QR Scanner"
        subtitle="Point camera at classroom or block QR code"
        showBack
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Live camera viewfinder */}
        <View style={[styles.viewfinderCard, { backgroundColor: '#000000', borderColor: theme.colors.primary }]}>
          {cameraReady && (
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              enableTorch={torch}
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={(e: { data: string }) => {
                if (locked.current) return;
                handleLookup(e.data);
              }}
            />
          )}

          <View style={styles.cornerTL} />
          <View style={styles.cornerTR} />
          <View style={styles.cornerBL} />
          <View style={styles.cornerBR} />

          {cameraReady ? (
            <>
              <Text style={styles.scannerHintBottom}>
                {looking ? `Looking up ${lastScanned}…` : 'Align LPU QR code inside frame'}
              </Text>
              <TouchableOpacity onPress={() => setTorch((t) => !t)} style={styles.torchBtn} activeOpacity={0.8}>
                <Ionicons name={torch ? 'flash' : 'flash-off'} size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.scannerCenter}>
              <Ionicons name="scan-outline" size={64} color="rgba(255,255,255,0.7)" />
              {!CameraView ? (
                <Text style={styles.scannerHint}>
                  Camera module not installed.{'\n'}Run: npx expo install expo-camera
                </Text>
              ) : permission && !permission.granted ? (
                <>
                  <Text style={styles.scannerHint}>Camera access is needed to scan QR codes</Text>
                  <Button
                    title={permission.canAskAgain === false ? 'Open Settings' : 'Allow Camera'}
                    onPress={() =>
                      permission.canAskAgain === false ? Linking.openSettings() : requestPermission()
                    }
                    variant="primary"
                    size="md"
                    style={{ marginTop: 12 }}
                  />
                </>
              ) : (
                <Text style={styles.scannerHint}>Starting camera…</Text>
              )}
            </View>
          )}
        </View>

        {/* Quick Demo QR Codes */}
        <Text style={[styles.quickText, { color: theme.colors.textSecondary }]}>
          No code handy? Tap a verified campus location:
        </Text>

        <View style={styles.quickButtons}>
          {[
            { label: 'Block 34 CSE Hub', code: 'LPU-BLK34-CSE' },
            { label: 'Central Library (37/38)', code: 'LPU-LIB-MAIN' },
            { label: 'Unipolis Amphitheater', code: 'LPU-UNIPOLIS-MAIN' },
            { label: 'UniMall Complex', code: 'LPU-UNIMALL' },
          ].map((item) => (
            <TouchableOpacity
              key={item.code}
              onPress={() => {
                setManualCode(item.code);
                handleLookup(item.code);
              }}
              style={[styles.quickPill, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}
            >
              <Ionicons name="qr-code-outline" size={14} color={theme.colors.primary} />
              <Text style={[styles.quickPillText, { color: theme.colors.text }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Manual Code Input */}
        <View style={[styles.manualBox, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <Text style={[styles.manualLabel, { color: theme.colors.textSecondary }]}>Manual QR ID Input</Text>
          <View style={styles.manualInputRow}>
            <TextInput
              value={manualCode}
              onChangeText={setManualCode}
              placeholder="e.g. LPU-BLK34-CSE"
              placeholderTextColor={theme.colors.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              onSubmitEditing={() => handleLookup()}
              style={[styles.manualInput, { backgroundColor: theme.colors.surfaceVariant, color: theme.colors.text, borderColor: theme.colors.border }]}
            />
            <Button
              title="Lookup"
              onPress={() => handleLookup()}
              loading={looking}
              variant="primary"
              size="md"
              style={{ marginLeft: 8 }}
            />
          </View>
        </View>
      </View>

      {/* Result Modal */}
      <Modal visible={!!scannedResult} transparent animationType="slide" onRequestClose={closeResult}>
        <View style={[styles.modalOverlay, { backgroundColor: theme.colors.overlay }]}>
          <View style={[styles.modalBox, { backgroundColor: theme.colors.surface }]}>
            {scannedResult && (
              <>
                <View style={styles.modalHeader}>
                  <Badge label="VERIFIED CAMPUS LOCATION" variant="success" size="md" />
                  <TouchableOpacity onPress={closeResult}>
                    <Ionicons name="close" size={24} color={theme.colors.text} />
                  </TouchableOpacity>
                </View>

                <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                  {scannedResult.name}
                </Text>

                <Text style={[styles.modalFloor, { color: theme.colors.primary }]}>
                  📍 {scannedResult.block_number} • {scannedResult.floor_or_room}
                </Text>

                <Text style={[styles.modalDesc, { color: theme.colors.textSecondary }]}>
                  {scannedResult.description}
                </Text>

                <View style={[styles.dirCard, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Ionicons name="navigate-outline" size={20} color={theme.colors.secondary} />
                  <Text style={[styles.dirText, { color: theme.colors.text }]}>
                    {distanceInfo
                      ? `You are ${distanceInfo.text} away (about ${distanceInfo.walk} min walk), ${distanceInfo.dir} of your position.`
                      : 'Waiting for your live location to calculate the walking distance…'}
                  </Text>
                </View>

                <Button
                  title="Walking Directions"
                  icon="navigate"
                  onPress={() =>
                    Linking.openURL(
                      directionsUrl({ latitude: scannedResult.latitude, longitude: scannedResult.longitude })
                    )
                  }
                  variant="primary"
                  size="lg"
                  style={{ marginTop: 18 }}
                />
                <Button
                  title="Done"
                  onPress={closeResult}
                  variant="outline"
                  size="lg"
                  style={{ marginTop: 10 }}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    justifyContent: 'space-between',
    paddingBottom: 30,
  },
  viewfinderCard: {
    height: 280,
    borderRadius: 24,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cornerTL: {
    position: 'absolute',
    top: 14,
    left: 14,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#3B82F6',
  },
  cornerTR: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 24,
    height: 24,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#3B82F6',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#3B82F6',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 24,
    height: 24,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#3B82F6',
  },
  scannerCenter: {
    alignItems: 'center',
  },
  scannerHintBottom: {
    position: 'absolute',
    bottom: 18,
    alignSelf: 'center',
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
  },
  torchBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerHint: {
    textAlign: 'center',
    paddingHorizontal: 24,
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    marginTop: 12,
  },
  quickText: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 14,
  },
  quickButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 8,
  },
  quickPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  quickPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  manualBox: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  manualLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  manualInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  manualInput: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBox: {
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  modalFloor: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  modalDesc: {
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },
  dirCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 14,
    marginTop: 16,
    gap: 10,
  },
  dirText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  }
});
