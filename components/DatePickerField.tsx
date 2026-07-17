// components/DatePickerField.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Typography } from '../constants/Typography';

interface DatePickerFieldProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
}

export default function DatePickerField({
  label,
  value,
  onChange,
}: DatePickerFieldProps) {
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState<Date>(value || new Date());

  const handlePress = () => {
    setShow(true);
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (selectedDate && event.type !== 'dismissed') {
        onChange(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const handleIosConfirm = () => {
    onChange(tempDate);
    setShow(false);
  };

  const handleIosCancel = () => {
    setShow(false);
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'jj/mm/aaaa';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <View style={styles.container}>
      <Text style={[Typography.inputLabel, styles.label]}>{label}</Text>
      
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        style={styles.fieldContainer}
      >
        <Feather name="calendar" size={18} color="#6d80a1" style={styles.leftIcon} />
        <Text style={[styles.dateText, !value && styles.placeholderText]}>
          {formatDate(value)}
        </Text>
        <Feather name="calendar" size={16} color="#6d80a1" style={styles.rightIcon} />
      </TouchableOpacity>

      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {show && Platform.OS === 'ios' && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={show}
          onRequestClose={handleIosCancel}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.pickerContainer}>
              <View style={styles.header}>
                <TouchableOpacity onPress={handleIosCancel}>
                  <Text style={styles.cancelButton}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleIosConfirm}>
                  <Text style={styles.confirmButton}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                style={styles.iosPicker}
                textColor="#ffffff"
                maximumDate={new Date()}
              />
            </View>
          </View>
        </Modal>
      )}
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
  dateText: {
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
    paddingBottom: 30,
    borderTopWidth: 1.5,
    borderColor: '#1c2e56',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1c2e56',
  },
  cancelButton: {
    color: '#6d80a1',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    color: '#2c87e8',
    fontSize: 16,
    fontWeight: '600',
  },
  iosPicker: {
    height: 200,
  },
});