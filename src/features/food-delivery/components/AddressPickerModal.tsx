import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View, Pressable, TextInput, ScrollView, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Haptics from 'expo-haptics';
import { SavedAddress } from '../types';

interface AddressPickerModalProps {
  visible: boolean;
  onSaveAddress: (newAddress: SavedAddress) => void;
  onClose: () => void;
}

const TUNIS_PRESETS = [
  { label: 'La Marsa', address: 'Avenue Habib Bourguiba, La Marsa, Tunis', lat: 36.8782, lng: 10.3247 },
  { label: 'Lac 2', address: 'Les Berges du Lac 2, Tunis', lat: 36.8392, lng: 10.2443 },
  { label: 'Centre Ville', address: 'Rue de Marseille, Tunis', lat: 36.8008, lng: 10.1800 },
  { label: 'Sidi Bou Saïd', address: 'Rue Hedi Zarrouk, Sidi Bou Saïd', lat: 36.8700, lng: 10.3470 },
];

export function AddressPickerModal({
  visible,
  onSaveAddress,
  onClose,
}: AddressPickerModalProps) {
  const [region, setRegion] = useState({
    latitude: 36.8782,
    longitude: 10.3247,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  });

  const [markerCoord, setMarkerCoord] = useState({
    latitude: 36.8782,
    longitude: 10.3247,
  });

  const [addressLabel, setAddressLabel] = useState<'Maison' | 'Travail' | 'Autre'>('Maison');
  const [streetAddress, setStreetAddress] = useState('Avenue Habib Bourguiba, La Marsa, Tunis');

  if (!visible) return null;

  const handleSelectPreset = async (preset: typeof TUNIS_PRESETS[0]) => {
    await Haptics.selectionAsync();
    setRegion({
      latitude: preset.lat,
      longitude: preset.lng,
      latitudeDelta: 0.012,
      longitudeDelta: 0.012,
    });
    setMarkerCoord({
      latitude: preset.lat,
      longitude: preset.lng,
    });
    setStreetAddress(preset.address);
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
      latitude: markerCoord.latitude,
      longitude: markerCoord.longitude,
      isDefault: true,
    };

    onSaveAddress(newAdd);
  };

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
                <Text style={styles.title}>Choisir sur la Carte</Text>
                <Text style={styles.subtitle}>Déplacez le repère pour définir votre adresse</Text>
              </View>
            </View>

            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color="#8E8E93" />
            </Pressable>
          </View>

          {/* Interactive Map View */}
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_DEFAULT}
              style={styles.map}
              region={region}
              onRegionChangeComplete={(r) => {
                setRegion(r);
                setMarkerCoord({ latitude: r.latitude, longitude: r.longitude });
              }}
            >
              <Marker
                coordinate={markerCoord}
                draggable
                onDragEnd={(e) => setMarkerCoord(e.nativeEvent.coordinate)}
                title="Adresse de livraison"
                description={streetAddress}
              >
                <View style={styles.customMarker}>
                  <Ionicons name="location" size={32} color="#FFC244" />
                </View>
              </Marker>
            </MapView>

            {/* Target Crosshair Badge */}
            <View style={styles.centerBadge}>
              <Text style={styles.centerBadgeText}>📍 Position de livraison</Text>
            </View>
          </View>

          {/* Quick Presets */}
          <View style={styles.presetsRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {TUNIS_PRESETS.map((p, idx) => (
                <Pressable
                  key={idx}
                  style={styles.presetPill}
                  onPress={() => handleSelectPreset(p)}
                >
                  <Ionicons name="compass-outline" size={14} color="#FFC244" />
                  <Text style={styles.presetText}>{p.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Address Details Inputs */}
          <View style={styles.formSection}>
            <Text style={styles.inputLabel}>ÉTIQUETTE D'ADRESSE</Text>
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

            <Text style={styles.inputLabel}>RUE & QUARTIER (TUNIS)</Text>
            <View style={styles.inputBox}>
              <Ionicons name="navigate-outline" size={20} color="#FFC244" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.textInput}
                value={streetAddress}
                onChangeText={setStreetAddress}
                placeholder="Ex: Rue de Marseille, La Marsa"
                placeholderTextColor="#8E8E93"
              />
            </View>
          </View>

          {/* Confirm Button */}
          <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
            <Ionicons name="checkmark-circle" size={22} color="#000000" />
            <Text style={styles.confirmText}>Valider cette Adresse</Text>
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
    height: 200,
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
  centerBadge: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  centerBadgeText: {
    color: '#FFC244',
    fontSize: 12,
    fontWeight: '700',
  },
  presetsRow: {
    marginBottom: 16,
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
  presetText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  formSection: {
    gap: 10,
    marginBottom: 20,
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
