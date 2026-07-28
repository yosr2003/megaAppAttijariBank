import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Alert,
  Animated,
  PanResponder,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { SavedAddress } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Mercator / OSM Tile Math
// ─────────────────────────────────────────────────────────────────────────────

const ZOOM = 15;
const MAP_HEIGHT = 230;

function toFracTile(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const xFrac = ((lng + 180) / 360) * n;
  const latRad = (lat * Math.PI) / 180;
  const yFrac =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n;
  return { xFrac, yFrac };
}

function fromFracTile(xFrac: number, yFrac: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const lng = (xFrac / n) * 360 - 180;
  const latRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * yFrac) / n)));
  return { lat: (latRad * 180) / Math.PI, lng };
}

function osmUrl(x: number, y: number, z: number) {
  const s = ['a', 'b', 'c'][Math.abs(Math.floor(x) + Math.floor(y)) % 3];
  return `https://${s}.tile.openstreetmap.org/${z}/${Math.floor(x)}/${Math.floor(y)}.png`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Nominatim Geocoding (free, no API key)
// ─────────────────────────────────────────────────────────────────────────────

const HEADERS = { 'User-Agent': 'SuperTounsii/1.0 (contact@supertounsii.tn)' };

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fr&zoom=18`,
      { headers: HEADERS }
    );
    const d = await res.json();
    const a = d.address || {};
    const road = a.house_number && a.road
      ? `${a.house_number} ${a.road}`
      : (a.road || a.pedestrian || a.footway || '');
    const area = a.suburb || a.neighbourhood || a.quarter || '';
    const city = a.city || a.town || a.village || 'Tunis';
    const parts = [road, area, city].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : d.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

interface GeoResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

async function forwardGeocode(q: string): Promise<GeoResult[]> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&accept-language=fr&countrycodes=tn`,
      { headers: HEADERS }
    );
    return await res.json();
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_LAT = 36.8008;
const DEFAULT_LNG = 10.18;

interface Props {
  visible: boolean;
  onSaveAddress: (a: SavedAddress) => void;
  onClose: () => void;
}

export function AddressPickerModal({ visible, onSaveAddress, onClose }: Props) {
  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lng, setLng] = useState(DEFAULT_LNG);
  const [address, setAddress] = useState('');
  const [addressLabel, setAddressLabel] = useState<'Maison' | 'Travail' | 'Autre'>('Maison');
  const [suggestions, setSuggestions] = useState<GeoResult[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [containerWidth, setContainerWidth] = useState(350);
  const [tileKey, setTileKey] = useState(0);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panX = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;
  const pinScale = useRef(new Animated.Value(1)).current;
  const shadowScale = useRef(new Animated.Value(1)).current;

  // Mutable ref to avoid stale closures in PanResponder
  const mapRef = useRef({ lat: DEFAULT_LAT, lng: DEFAULT_LNG, containerWidth: 350 });
  useEffect(() => {
    mapRef.current = { lat, lng, containerWidth };
  }, [lat, lng, containerWidth]);

  const tileSize = containerWidth / 3;

  // Fractional tile coords for current center
  const { xFrac, yFrac } = toFracTile(lat, lng, ZOOM);
  const cxTile = Math.floor(xFrac);
  const cyTile = Math.floor(yFrac);

  // Position the 3x3 grid so that (lat, lng) lands exactly at map center
  const gridLeft = containerWidth / 2 - (xFrac - cxTile + 1) * tileSize;
  const gridTop  = MAP_HEIGHT  / 2 - (yFrac - cyTile + 1) * tileSize;

  // 9 tiles: row-major order, top-left = (cxTile-1, cyTile-1)
  const tiles = [];
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      tiles.push({
        key: `${tileKey}|${cxTile + dx}|${cyTile + dy}`,
        url: osmUrl(cxTile + dx, cyTile + dy, ZOOM),
      });
    }
  }

  // Reverse geocode helper
  const doReverse = async (newLat: number, newLng: number) => {
    setIsGeocoding(true);
    const addr = await reverseGeocode(newLat, newLng);
    setAddress(addr);
    setIsGeocoding(false);
  };

  // PanResponder — pin dragging
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        Animated.parallel([
          Animated.spring(pinScale,    { toValue: 1.35, useNativeDriver: true }),
          Animated.spring(shadowScale, { toValue: 1.6,  useNativeDriver: true }),
        ]).start();
      },
      onPanResponderMove: Animated.event(
        [null, { dx: panX, dy: panY }],
        { useNativeDriver: false }
      ),
      onPanResponderRelease: (_, gs) => {
        Animated.parallel([
          Animated.spring(pinScale,    { toValue: 1, useNativeDriver: true }),
          Animated.spring(shadowScale, { toValue: 1, useNativeDriver: true }),
        ]).start();

        const { lat: cLat, lng: cLng, containerWidth: cw } = mapRef.current;
        const ts = cw / 3;
        const { xFrac: cx, yFrac: cy } = toFracTile(cLat, cLng, ZOOM);
        const newXFrac = cx + gs.dx / ts;
        const newYFrac = cy + gs.dy / ts;
        const { lat: newLat, lng: newLng } = fromFracTile(newXFrac, newYFrac, ZOOM);

        // Snap pin back to center with a spring
        Animated.parallel([
          Animated.spring(panX, { toValue: 0, useNativeDriver: false, tension: 100, friction: 8 }),
          Animated.spring(panY, { toValue: 0, useNativeDriver: false, tension: 100, friction: 8 }),
        ]).start();

        setIsDragging(false);
        setLat(newLat);
        setLng(newLng);
        setTileKey(k => k + 1);
        setSuggestions([]);
        doReverse(newLat, newLng);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      },
      onPanResponderTerminate: () => {
        setIsDragging(false);
        Animated.parallel([
          Animated.spring(pinScale,    { toValue: 1, useNativeDriver: true }),
          Animated.spring(shadowScale, { toValue: 1, useNativeDriver: true }),
          Animated.spring(panX, { toValue: 0, useNativeDriver: false }),
          Animated.spring(panY, { toValue: 0, useNativeDriver: false }),
        ]).start();
      },
    })
  ).current;

  // Forward geocode on typing (debounced 1 s to respect Nominatim ToS)
  const handleAddressChange = useCallback((text: string) => {
    setAddress(text);
    setSuggestions([]);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    if (text.trim().length < 3) return;
    searchTimer.current = setTimeout(async () => {
      setIsGeocoding(true);
      const results = await forwardGeocode(text);
      setSuggestions(results);
      setIsGeocoding(false);
    }, 1000);
  }, []);

  // Select from suggestions → update map
  const handlePickSuggestion = async (r: GeoResult) => {
    await Haptics.selectionAsync();
    const newLat = parseFloat(r.lat);
    const newLng = parseFloat(r.lon);
    setLat(newLat);
    setLng(newLng);
    setAddress(r.display_name);
    setSuggestions([]);
    setTileKey(k => k + 1);
  };

  const handleConfirm = async () => {
    if (!address.trim()) {
      Alert.alert('Adresse requise', 'Veuillez saisir votre adresse.');
      return;
    }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSaveAddress({
      id: Date.now().toString(),
      label: addressLabel,
      address: address.trim(),
      latitude: lat,
      longitude: lng,
      isDefault: true,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.handle} />

          {/* ── Header ───────────────────────────────────────────────── */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Ionicons name="map" size={20} color="#000" />
              </View>
              <View>
                <Text style={styles.title}>Adresse de livraison</Text>
                <Text style={styles.subtitle}>Glissez le pin ou tapez votre adresse</Text>
              </View>
            </View>
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={20} color="#8E8E93" />
            </Pressable>
          </View>

          {/* ── Search Input ─────────────────────────────────────────── */}
          <View style={styles.inputRow}>
            <Ionicons name="search-outline" size={18} color="#FFC244" style={styles.searchIcon} />
            <TextInput
              style={styles.input}
              value={address}
              onChangeText={handleAddressChange}
              placeholder="Rechercher une adresse à Tunis..."
              placeholderTextColor="#555"
              returnKeyType="search"
              onSubmitEditing={() => {
                if (searchTimer.current) clearTimeout(searchTimer.current);
                if (address.trim().length >= 3) {
                  setIsGeocoding(true);
                  forwardGeocode(address).then(r => { setSuggestions(r); setIsGeocoding(false); });
                }
              }}
            />
            {isGeocoding
              ? <ActivityIndicator size="small" color="#FFC244" />
              : address.length > 0 && (
                  <Pressable onPress={() => { setAddress(''); setSuggestions([]); }}>
                    <Ionicons name="close-circle" size={18} color="#555" />
                  </Pressable>
                )
            }
          </View>

          {/* ── Suggestions Dropdown ─────────────────────────────────── */}
          {suggestions.length > 0 && (
            <View style={styles.suggestions}>
              {suggestions.map((s, i) => (
                <Pressable
                  key={s.place_id}
                  style={[styles.suggestionRow, i < suggestions.length - 1 && styles.suggestionDivider]}
                  onPress={() => handlePickSuggestion(s)}
                >
                  <Ionicons name="location-outline" size={15} color="#FFC244" style={{ marginRight: 8, flexShrink: 0 }} />
                  <Text style={styles.suggestionText} numberOfLines={2}>{s.display_name}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* ── Map: 3×3 OSM Tile Grid + Draggable Pin ───────────────── */}
          <View
            style={styles.mapContainer}
            onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}
          >
            {/* Tile grid, positioned so center (lat,lng) = map center */}
            <View
              style={[
                styles.tileGrid,
                {
                  left: gridLeft,
                  top: gridTop,
                  width:  tileSize * 3,
                  height: tileSize * 3,
                },
              ]}
            >
              {tiles.map(t => (
                <Image
                  key={t.key}
                  source={{ uri: t.url }}
                  style={{ width: tileSize, height: tileSize }}
                  fadeDuration={200}
                />
              ))}
            </View>

            {/* Subtle dark vignette */}
            <View style={styles.vignette} pointerEvents="none" />

            {/* Pin — always at map center, drags around it */}
            <View style={styles.pinAnchor} pointerEvents="box-none">
              <Animated.View
                style={{
                  transform: [
                    { translateX: panX },
                    { translateY: panY },
                  ],
                  alignItems: 'center',
                }}
                {...panResponder.panHandlers}
              >
                <Animated.View style={{ transform: [{ scale: pinScale }] }}>
                  <Ionicons name="location-sharp" size={46} color="#FFC244" />
                </Animated.View>
                {/* Pin shadow ellipse */}
                <Animated.View style={[styles.pinShadow, { transform: [{ scaleX: shadowScale }] }]} />
              </Animated.View>
            </View>

            {/* Drag hint label */}
            {!isDragging && (
              <View style={styles.dragHint} pointerEvents="none">
                <Ionicons name="hand-left-outline" size={13} color="#FFC244" />
                <Text style={styles.dragHintText}>Glissez le pin</Text>
              </View>
            )}

            {/* Coordinates badge */}
            <View style={styles.coordBadge} pointerEvents="none">
              <Text style={styles.coordText}>
                {lat.toFixed(4)}°N  {lng.toFixed(4)}°E
              </Text>
            </View>
          </View>

          {/* ── Address Type Picker ───────────────────────────────────── */}
          <Text style={styles.sectionLabel}>TYPE D'ADRESSE</Text>
          <View style={styles.labelRow}>
            {(['Maison', 'Travail', 'Autre'] as const).map(lbl => {
              const active = addressLabel === lbl;
              return (
                <Pressable
                  key={lbl}
                  style={[styles.labelBtn, active && styles.labelBtnActive]}
                  onPress={async () => { await Haptics.selectionAsync(); setAddressLabel(lbl); }}
                >
                  <Ionicons
                    name={lbl === 'Maison' ? 'home-outline' : lbl === 'Travail' ? 'briefcase-outline' : 'location-outline'}
                    size={15}
                    color={active ? '#000' : '#8E8E93'}
                  />
                  <Text style={[styles.labelText, active && styles.labelTextActive]}>{lbl}</Text>
                </Pressable>
              );
            })}
          </View>

          {/* ── Confirm ───────────────────────────────────────────────── */}
          <Pressable style={styles.confirmBtn} onPress={handleConfirm}>
            <Ionicons name="checkmark-circle" size={22} color="#000" />
            <Text style={styles.confirmText}>Confirmer cette adresse</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#111',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 38,
    paddingTop: 12,
  },
  handle: {
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#333',
    alignSelf: 'center',
    marginBottom: 18,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
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
  },
  subtitle: {
    color: '#555',
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Search input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginBottom: 8,
  },
  searchIcon: { marginRight: 8 },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
  },

  // Suggestions
  suggestions: {
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    marginBottom: 10,
    overflow: 'hidden',
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
  },
  suggestionDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  suggestionText: {
    color: '#CCC',
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },

  // Map
  mapContainer: {
    height: MAP_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#1a1a2e',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#222',
    position: 'relative',
  },
  tileGrid: {
    position: 'absolute',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  pinAnchor: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinShadow: {
    width: 16,
    height: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.4)',
    marginTop: -8,
  },
  dragHint: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.72)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFC24440',
  },
  dragHintText: {
    color: '#FFC244',
    fontSize: 12,
    fontWeight: '700',
  },
  coordBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.72)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFC24440',
  },
  coordText: {
    color: '#FFC244',
    fontSize: 11,
    fontWeight: '700',
  },

  // Label picker
  sectionLabel: {
    color: '#444',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
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
