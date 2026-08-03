// components/GenderPicker.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

interface GenderPickerProps {
  label: string;
  value: string;
  onChange: (gender: string) => void;
}

export default function GenderPicker({
  label,
  value,
  onChange,
}: GenderPickerProps) {
  const [show, setShow] = useState(false);
  const options = ['Male', 'Female', 'Other'];

  const handleSelect = (gender: string) => {
    onChange(gender);
    setShow(false);
  };

  return (
    <View style={styles.container}>
      <Text style={[Typography.inputLabel, styles.label]}>{label}</Text>
      
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setShow(true)}
        style={styles.fieldContainer}
      >
        <Feather name="user" size={18} color="#6d80a1" style={styles.leftIcon} />
        <Text style={[styles.genderText, !value && styles.placeholderText]}>
          {value || 'Select gender'}
        </Text>
        <Feather name="chevron-down" size={16} color="#6d80a1" style={styles.rightIcon} />
      </TouchableOpacity>

      <Modal
        transparent={true}
        animationType="slide"
        visible={show}
        onRequestClose={() => setShow(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShow(false)}
        >
          <View style={styles.pickerContainer}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Select Gender</Text>
              <TouchableOpacity onPress={() => setShow(false)}>
                <Feather name="x" size={20} color="#6d80a1" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const isSelected = item === value;
                return (
                  <TouchableOpacity
                    style={[
                      styles.optionItem,
                      isSelected && styles.optionItemSelected,
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.optionTextSelected,
                      ]}
                    >
                      {item}
                    </Text>
                    {isSelected && (
                      <Feather name="check" size={18} color="#2c87e8" />
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    textTransform: 'uppercase',
    fontSize: 11,
    fontWeight: '600',
    color: '#6d80a1',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 54,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    backgroundColor: Colors.inputBg,
    paddingHorizontal: 16,
  },
  leftIcon: {
    marginRight: 12,
  },
  rightIcon: {
    marginLeft: 'auto',
  },
  genderText: {
    fontSize: 15,
    color: '#ffffff',
  },
  placeholderText: {
    color: Colors.textMuted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  pickerContainer: {
    backgroundColor: '#09152e',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: 300,
    paddingBottom: 30,
    borderTopWidth: 1.5,
    borderColor: '#1c2e56',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1c2e56',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(28, 46, 86, 0.5)',
  },
  optionItemSelected: {
    backgroundColor: 'rgba(44, 135, 232, 0.08)',
  },
  optionText: {
    fontSize: 16,
    color: '#6d80a1',
  },
  optionTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
});