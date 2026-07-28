import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View, Pressable, TextInput, ScrollView, Alert, Platform, Image } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { SavedAddress } from '../types';

let MapView: any = null;
let Marker: any = null;
try {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
} catch (e) {
  console.log('react-native-maps native module fallback');
}

interface AddressPickerModalProps {
  visible: boolean;
  onSaveAddress: (newAddress: SavedAddress) => void;
  onClose: () => void;
}

const TUNIS_PRESETS = [
  { label: 'La Marsa 🏖️', address: 'Avenue Habib Bourguiba, La Marsa, Tunis', lat: 36.8782, lng: 10.3247 },
  { label: 'Lac 2 🏢', address: 'Les Berges du Lac 2, Tunis', lat: 36.8392, lng: 10.2443 },
  { label: 'Centre Ville 🏛️', address: 'Rue de Marseille, Tunis', lat: 36.8008, lng: 10.1800 },
  { label: 'Sidi Bou Saïd 🔵', address: 'Rue Hedi Zarrouk, Sidi Bou Saïd', lat: 36.8700, lng: 10.3470 },
];

export function AddressPickerModal({
  visible,
  onSaveAddress,
  onClose,
}: AddressPickerModalProps) {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(0);
  const [addressLabel, setAddressLabel] = useState<'Maison' | 'Travail' | 'Autre'>('Maison');
  const [streetAddress, setStreetAddress] = useState(TUNIS_PRESETS[0].address);
  const [latLng, setLatLng] = useState({ lat: TUNIS_PRESETS[0].lat, lng: TUNIS_PRESETS[0].lng });

  if (!visible) return null;

  const handleSelectPreset = async (index: number) => {
    await Haptics.selectionAsync();
    const p = TUNIS_PRESETS[index];
    setSelectedPresetIndex(index);
    setStreetAddress(p.address);
    setLatLng({ lat: p.lat, lng: p.lng });
  };

  const handleConfirm = async () => {
    if (!streetAddress.trim()) {
      Alert.alert('Adresse requise', 'Veuillez saisir le nom de votre rue ou quartier.');
      return;
    }

    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const newAdd: SavedAddress = {
      id: Date.now().toString(),
      label: addressLabel,
      address: streetAddress.trim(),
      latitude: latLng.lat,
      longitude: latLng.lng,
      isDefault: true,
    };

    onSaveAddress(newAdd);
  };

  const isNativeMapSupported = Platform.OS !== 'web' && MapView;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="map" size={22} color="#000000" />
              </View>
              <View>
                <Text style={styles.title}>Sélectionner votre Adresse</Text>
                <Text style={styles.subtitle}>Choisissez sur la carte interactive de Tunis</Text>
              </View>
            </View>

            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color="#8E8E93" />
            </Pressable>
          </View>

          {/* Map Section */}
          <View style={styles.mapContainer}>
            {isNativeMapSupported ? (
              <MapView
                style={styles.map}
                initialRegion={{
                  latitude: latLng.lat,
                  longitude: latLng.lng,
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.015,
                }}
                onRegionChangeComplete={(r: any) => setLatLng({ lat: r.latitude, lng: r.longitude })}
              >
                <Marker
                  coordinate={{ latitude: latLng.lat, longitude: latLng.lng }}
                  draggable
                  onDragEnd={(e: any) => setLatLng({ lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude })}
                  title="Adresse de livraison"
                >
                  <View style={styles.customMarker}>
                    <Ionicons name="location" size={36} color="#FFC244" />
                  </View>
                </Marker>
              </MapView>
            ) : (
              // Rich Visual Fallback Map
              <View style={styles.visualMapFallback}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=800&q=80' }}
                  style={styles.fallbackMapImg}
                />
                <View style={styles.overlayGrid} />
                
                {/* Central Pin */}
                <View style={styles.pinCenter}>
                  <View style={styles.pulseDot} />
                  <Ionicons name="location-sharp" size={44} color="#FFC244" />
                </View>

                {/* Coords Tag */}
                <View style={styles.coordsBadge}>
                  <Text style={styles.coordsText}>
                    📍 {latLng.lat.toFixed(4)}° N, {latLng.lng.toFixed(4)}° E
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Presets Bar */}
          <Text style={styles.inputLabel}>QUARTIERS POPULAIRES (TUNIS)</Text>
          <View style={styles.presetsRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {TUNIS_PRESETS.map((p, idx) => {
                const isSelected = selectedPresetIndex === idx;
                return (
                  <Pressable
                    key={idx}
                    style={[styles.presetPill, isSelected && styles.presetPillActive]}
                    onPress={() => handleSelectPreset(idx)}
                  >
                    <Ionicons
                      name="compass-outline"
                      size={14}
                      color={isSelected ? '#000000' : '#FFC244'}
                    />
                    <Text style={[styles.presetText, isSelected && styles.presetTextActive]}>
                      {p.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Form Controls */}
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>TYPE D'EMPLACEMENT</Text>
            <View style={styles.labelPickerRow}>
              {(['Maison', 'Travail', 'Autre'] as const).map((lbl) => {
                const isSelected = addressLabel === lbl;
                return (
                  <Pressable
                    key={lbl}
                    style={[styles.labelBtn, isSelected && styles.labelBtnActive]}
                    onPress={async () => {
                      await Haptics.selectionAsync();
                      setAddressLabel(lbl);
                    }}
                  >
                    <Ionicons
                      name={lbl === 'Maison' ? 'home' : lbl === 'Travail' ? 'briefcase' : 'location'}
                      size={16}
                      color={isSelected ? '#000000' : '#8E8E93'}
                    />
                    <Text style={[styles.labelText, isSelected && styles.labelTextActive]}>{lbl}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>ADRESSE ET RUE</Text>
            <View style={styles.inputBox}>
              <Ionicons name="navigate-outline" size={20} color="#FFC244" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.textInput}
                value={streetAddress}
                onChangeText={setStreetAddress}
                placeholder="Saisissez votre adresse à Tunis..."
                placeholderTextColor="#8E8E93"
              />
            </View>
          </View>

          {/* Submit Action */}
          <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
            <Ionicons name="checkmark-circle" size={22} color="#000000" />
            <Text style={styles.confirmText}>Confirmer cette Adresse</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.80)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFC244',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    color: '#8E8E93',
    fontSize: 12,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapContainer: {
    height: 190,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualMapFallback: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackMapImg: {
    width: '100%',
    height: '100%',
    opacity: 0.6,
  },
  overlayGrid: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(28, 28, 30, 0.4)',
  },
  pinCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseDot: {
    position: 'absolute',
    bottom: 4,
    width: 20,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  coordsBadge: {
    position: 'absolute',
    top: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFC244',
  },
  coordsText: {
    color: '#FFC244',
    fontSize: 12,
    fontWeight: '800',
  },
  presetsRow: {
    marginBottom: 16,
    marginTop: 6,
  },
  presetPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  presetPillActive: {
    backgroundColor: '#FFC244',
    borderColor: '#FFC244',
  },
  presetText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  presetTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  formSection: {
    gap: 10,
    marginBottom: 18,
  },
  inputLabel: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  labelPickerRow: {
    flexDirection: 'row',
    gap: 10,
  },
  labelBtn: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  labelBtnActive: {
    backgroundColor: '#FFC244',
    borderColor: '#FFC244',
  },
  labelText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '700',
  },
  labelTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
  },
  confirmBtn: {
    backgroundColor: '#FFC244',
    paddingVertical: 18,
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  confirmText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
  },
});
