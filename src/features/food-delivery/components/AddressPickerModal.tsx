import React, { useState, useRef } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  Image,
  Animated,
  Easing,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { SavedAddress } from '../types';

interface AddressPickerModalProps {
  visible: boolean;
  onSaveAddress: (newAddress: SavedAddress) => void;
  onClose: () => void;
}

const TUNIS_ZONES = [
  {
    label: 'La Marsa',
    icon: '🏖️',
    address: 'Avenue Habib Bourguiba, La Marsa, Tunis',
    lat: 36.8782,
    lng: 10.3247,
    zoom: 14,
  },
  {
    label: 'Lac 2',
    icon: '🏢',
    address: 'Les Berges du Lac 2, Tunis',
    lat: 36.8392,
    lng: 10.2443,
    zoom: 14,
  },
  {
    label: 'Centre Ville',
    icon: '🏛️',
    address: 'Rue de Marseille, Centre Ville, Tunis',
    lat: 36.8008,
    lng: 10.18,
    zoom: 14,
  },
  {
    label: 'Sidi Bou Saïd',
    icon: '🔵',
    address: 'Rue Hedi Zarrouk, Sidi Bou Saïd',
    lat: 36.87,
    lng: 10.347,
    zoom: 14,
  },
  {
    label: 'Ariana',
    icon: '🌿',
    address: 'Avenue de la République, Ariana',
    lat: 36.8625,
    lng: 10.1956,
    zoom: 14,
  },
  {
    label: 'Carthage',
    icon: '🏺',
    address: 'Avenue Habib Bourguiba, Carthage',
    lat: 36.8528,
    lng: 10.3247,
    zoom: 14,
  },
];

/** Build an OpenStreetMap static-tile snapshot URL (free, no API key). */
function getMapTileUrl(lat: number, lng: number, zoom = 14): string {
  // Uses openstreetmap.org tile format: /zoom/x/y.png
  // We compute tile x,y from lat/lng
  const n = Math.pow(2, zoom);
  const xTile = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const yTile = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);
  // Return a 3x3 composite by using a slightly adjacent tile to simulate a wider view
  return `https://tile.openstreetmap.org/${zoom}/${xTile}/${yTile}.png`;
}

export function AddressPickerModal({
  visible,
  onSaveAddress,
  onClose,
}: AddressPickerModalProps) {
  const [selectedZoneIdx, setSelectedZoneIdx] = useState(0);
  const [addressLabel, setAddressLabel] = useState<'Maison' | 'Travail' | 'Autre'>('Maison');
  const [streetAddress, setStreetAddress] = useState(TUNIS_ZONES[0].address);
  const [latLng, setLatLng] = useState({ lat: TUNIS_ZONES[0].lat, lng: TUNIS_ZONES[0].lng });
  const [mapKey, setMapKey] = useState(0); // force image reload

  // Pin bounce animation
  const pinBounce = useRef(new Animated.Value(0)).current;

  const animatePin = () => {
    Animated.sequence([
      Animated.timing(pinBounce, { toValue: -18, duration: 200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      Animated.timing(pinBounce, { toValue: 0, duration: 300, easing: Easing.bounce, useNativeDriver: true }),
    ]).start();
  };

  const handleSelectZone = async (idx: number) => {
    await Haptics.selectionAsync();
    const z = TUNIS_ZONES[idx];
    setSelectedZoneIdx(idx);
    setStreetAddress(z.address);
    setLatLng({ lat: z.lat, lng: z.lng });
    setMapKey((k) => k + 1);
    animatePin();
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

  const selectedZone = TUNIS_ZONES[selectedZoneIdx];
  const mapUrl = getMapTileUrl(latLng.lat, latLng.lng, selectedZone.zoom);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Handle bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="map" size={20} color="#000" />
              </View>
              <View>
                <Text style={styles.title}>Adresse de livraison</Text>
                <Text style={styles.subtitle}>Choisissez votre quartier à Tunis</Text>
              </View>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color="#8E8E93" />
            </Pressable>
          </View>

          {/* Map Section — OpenStreetMap tile image, no API key required */}
          <View style={styles.mapContainer}>
            <Image
              key={mapKey}
              source={{ uri: mapUrl }}
              style={styles.mapImage}
              resizeMode="cover"
            />
            {/* Dark overlay for readability */}
            <View style={styles.mapOverlay} />

            {/* Animated Pin */}
            <View style={styles.pinWrapper} pointerEvents="none">
              <Animated.View style={{ transform: [{ translateY: pinBounce }] }}>
                <Ionicons name="location-sharp" size={46} color="#FFC244" />
              </Animated.View>
              {/* Pin shadow */}
              <View style={styles.pinShadow} />
            </View>

            {/* Zone label on map */}
            <View style={styles.zoneLabel}>
              <Text style={styles.zoneLabelText}>
                {selectedZone.icon} {selectedZone.label}
              </Text>
            </View>

            {/* Coordinates badge */}
            <View style={styles.coordsBadge}>
              <Ionicons name="navigate" size={11} color="#FFC244" />
              <Text style={styles.coordsText}>
                {latLng.lat.toFixed(4)}°N  {latLng.lng.toFixed(4)}°E
              </Text>
            </View>
          </View>

          {/* Zone Presets */}
          <Text style={styles.sectionLabel}>QUARTIER</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.zonesRow}
            style={{ marginBottom: 16 }}
          >
            {TUNIS_ZONES.map((z, idx) => {
              const active = selectedZoneIdx === idx;
              return (
                <Pressable
                  key={idx}
                  style={[styles.zonePill, active && styles.zonePillActive]}
                  onPress={() => handleSelectZone(idx)}
                >
                  <Text style={styles.zoneIcon}>{z.icon}</Text>
                  <Text style={[styles.zonePillText, active && styles.zonePillTextActive]}>
                    {z.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Address label picker */}
          <Text style={styles.sectionLabel}>TYPE D'ADRESSE</Text>
          <View style={styles.labelRow}>
            {(['Maison', 'Travail', 'Autre'] as const).map((lbl) => {
              const active = addressLabel === lbl;
              return (
                <Pressable
                  key={lbl}
                  style={[styles.labelBtn, active && styles.labelBtnActive]}
                  onPress={async () => {
                    await Haptics.selectionAsync();
                    setAddressLabel(lbl);
                  }}
                >
                  <Ionicons
                    name={lbl === 'Maison' ? 'home-outline' : lbl === 'Travail' ? 'briefcase-outline' : 'location-outline'}
                    size={16}
                    color={active ? '#000' : '#8E8E93'}
                  />
                  <Text style={[styles.labelText, active && styles.labelTextActive]}>{lbl}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* Street address input */}
          <Text style={[styles.sectionLabel, { marginTop: 14 }]}>RUE / DÉTAILS</Text>
          <View style={styles.inputBox}>
            <Ionicons name="navigate-circle-outline" size={22} color="#FFC244" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.textInput}
              value={streetAddress}
              onChangeText={setStreetAddress}
              placeholder="Ex: Apt 12, Rue Ibn Khaldoun..."
              placeholderTextColor="#555"
              returnKeyType="done"
            />
            {streetAddress.length > 0 && (
              <Pressable onPress={() => setStreetAddress('')}>
                <Ionicons name="close-circle" size={18} color="#555" />
              </Pressable>
            )}
          </View>

          {/* Confirm Button */}
          <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
            <Ionicons name="checkmark-circle" size={22} color="#000" />
            <Text style={styles.confirmText}>Confirmer cette adresse</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#141414',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
  },
  handleBar: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#3A3A3C',
    alignSelf: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFC244',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Map
  mapContainer: {
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 14,
    backgroundColor: '#1C1C1E',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  pinWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinShadow: {
    width: 14,
    height: 6,
    borderRadius: 7,
    backgroundColor: 'rgba(0,0,0,0.35)',
    marginTop: -4,
  },
  zoneLabel: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFC24440',
  },
  zoneLabelText: {
    color: '#FFF',
    fontWeight: '700',
    fontSize: 13,
  },
  coordsBadge: {
    position: 'absolute',
    top: 10,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFC24440',
  },
  coordsText: {
    color: '#FFC244',
    fontSize: 11,
    fontWeight: '700',
  },

  // Zones
  sectionLabel: {
    color: '#555',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  zonesRow: {
    gap: 8,
    paddingVertical: 2,
  },
  zonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#2C2C2E',
  },
  zonePillActive: {
    backgroundColor: '#FFC244',
    borderColor: '#FFC244',
  },
  zoneIcon: {
    fontSize: 14,
  },
  zonePillText: {
    color: '#CCC',
    fontSize: 13,
    fontWeight: '600',
  },
  zonePillTextActive: {
    color: '#000',
    fontWeight: '800',
  },

  // Label picker
  labelRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  labelBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#1C1C1E',
    borderWidth: 1.5,
    borderColor: '#2C2C2E',
  },
  labelBtnActive: {
    backgroundColor: '#FFC244',
    borderColor: '#FFC244',
  },
  labelText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '600',
  },
  labelTextActive: {
    color: '#000',
    fontWeight: '800',
  },

  // Input
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginBottom: 20,
  },
  textInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
  },

  // Confirm
  confirmBtn: {
    backgroundColor: '#FFC244',
    paddingVertical: 17,
    borderRadius: 22,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  confirmText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
