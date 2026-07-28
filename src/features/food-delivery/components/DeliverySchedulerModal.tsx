import React, { useState } from 'react';
import { Modal, StyleSheet, Text, View, Pressable, ScrollView } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';

interface DeliverySchedulerModalProps {
  visible: boolean;
  currentScheduleText: string;
  onConfirm: (scheduledText: string) => void;
  onClose: () => void;
}

const DAYS = [
  { id: 'today', label: "Aujourd'hui" },
  { id: 'tomorrow', label: 'Demain' },
  { id: 'after_tomorrow', label: 'Après-demain' },
];

const TIME_SLOTS = [
  '11:30', '12:00', '12:30', '13:00', '13:30', '14:00',
  '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
];

export function DeliverySchedulerModal({
  visible,
  currentScheduleText,
  onConfirm,
  onClose,
}: DeliverySchedulerModalProps) {
  const [selectedDayId, setSelectedDayId] = useState('today');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('20:00');

  if (!visible) return null;

  const handleSave = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const dayObj = DAYS.find((d) => d.id === selectedDayId);
    const formatted = `${dayObj?.label || "Aujourd'hui"} à ${selectedTimeSlot}`;
    onConfirm(formatted);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <Ionicons name="calendar" size={22} color="#000000" />
              </View>
              <View>
                <Text style={styles.title}>Planifier la Livraison</Text>
                <Text style={styles.subtitle}>Choisissez la date et le créneau idéal</Text>
              </View>
            </View>

            <Pressable style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={22} color="#8E8E93" />
            </Pressable>
          </View>

          {/* Day Selector */}
          <Text style={styles.sectionHeader}>JOUR DE LIVRAISON</Text>
          <View style={styles.daysRow}>
            {DAYS.map((day) => {
              const isSelected = selectedDayId === day.id;
              return (
                <Pressable
                  key={day.id}
                  style={[
                    styles.dayBtn,
                    isSelected && styles.dayBtnActive,
                  ]}
                  onPress={async () => {
                    await Haptics.selectionAsync();
                    setSelectedDayId(day.id);
                  }}
                >
                  <Text style={[styles.dayText, isSelected && styles.dayTextActive]}>
                    {day.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Time Slot Grid */}
          <Text style={styles.sectionHeader}>CRÉNEAU HORAIRE</Text>
          <ScrollView style={{ maxHeight: 180 }} showsVerticalScrollIndicator={false}>
            <View style={styles.timeGrid}>
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedTimeSlot === slot;
                return (
                  <Pressable
                    key={slot}
                    style={[
                      styles.timeSlotBtn,
                      isSelected && styles.timeSlotBtnActive,
                    ]}
                    onPress={async () => {
                      await Haptics.selectionAsync();
                      setSelectedTimeSlot(slot);
                    }}
                  >
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={isSelected ? '#000000' : '#8E8E93'}
                    />
                    <Text style={[styles.timeSlotText, isSelected && styles.timeSlotTextActive]}>
                      {slot}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>

          {/* Confirmation Button */}
          <View style={styles.footer}>
            <Pressable style={styles.confirmBtn} onPress={handleSave}>
              <Text style={styles.confirmText}>
                Confirmer pour {DAYS.find((d) => d.id === selectedDayId)?.label} à {selectedTimeSlot}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
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
    marginBottom: 20,
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
    fontSize: 13,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    color: '#8E8E93',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 12,
    marginBottom: 10,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  dayBtn: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  dayBtnActive: {
    backgroundColor: '#FFC244',
    borderColor: '#FFC244',
  },
  dayText: {
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: '700',
  },
  dayTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingBottom: 10,
  },
  timeSlotBtn: {
    width: '31%',
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
  timeSlotBtnActive: {
    backgroundColor: '#FFC244',
    borderColor: '#FFC244',
  },
  timeSlotText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  timeSlotTextActive: {
    color: '#000000',
    fontWeight: '800',
  },
  footer: {
    marginTop: 20,
  },
  confirmBtn: {
    backgroundColor: '#FFC244',
    paddingVertical: 18,
    borderRadius: 24,
    alignItems: 'center',
  },
  confirmText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '800',
  },
});
