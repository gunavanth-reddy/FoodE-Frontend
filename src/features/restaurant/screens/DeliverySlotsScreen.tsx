
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {
  CalendarBlank,
  CheckCircle,
  Clock,
  Plus,
  Trash,
} from 'phosphor-react-native';

import {useAuth} from '../../../context/AuthContext';
import API_BASE_URL from '../../../config/api';
import {FoodEAlert} from '../../../utils/FoodEAlert';
import {formatTime12} from '../../../utils/time';

interface DeliverySlot {
  _id?: string;
  date: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  isActive: boolean;
  cutoffMinutes: number;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  deliverySlots?: DeliverySlot[];
  deliverySlot?: DeliverySlot;
}

const pad = (value: number) => String(value).padStart(2, '0');

const todayDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate(),
  )}`;
};

const timeToMinutes = (value: string) => {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    return -1;
  }

  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
};

const isValidDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  const parsed = new Date(year, month - 1, day);

  return (
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day
  );
};

const calculateDuration = (startTime: string, endTime: string) => {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  return start < 0 || end <= start ? 0 : end - start;
};

const createEmptySlot = (): DeliverySlot => ({
  date: todayDate(),
  startTime: '12:00',
  endTime: '12:30',
  durationMinutes: 30,
  isActive: true,
  cutoffMinutes: 10,
});

const DeliverySlotsScreen: React.FC = () => {
  const {token} = useAuth();

  const [deliverySlots, setDeliverySlots] = useState<DeliverySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const apiRequest = useCallback(
    async (path: string, method = 'GET', body?: object) => {
      if (!token) {
        throw new Error('Please log in as a restaurant owner.');
      }

      const response = await fetch(`${API_BASE_URL}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
          ...(body ? {'Content-Type': 'application/json'} : {}),
        },
        ...(body ? {body: JSON.stringify(body)} : {}),
      });

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Something went wrong.');
      }

      return data;
    },
    [token],
  );

  const fetchDeliverySlots = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest('/delivery-slots/my');

      const slots = (data.deliverySlots || []).map(slot => ({
        _id: slot._id,
        date: slot.date || todayDate(),
        startTime: slot.startTime,
        endTime: slot.endTime,
        durationMinutes:
          Number(slot.durationMinutes) ||
          calculateDuration(slot.startTime, slot.endTime),
        isActive: slot.isActive !== false,
        cutoffMinutes: Number(slot.cutoffMinutes ?? 10),
      }));

      setDeliverySlots(slots);
    } catch (error: any) {
      FoodEAlert.alert(
        'Unable to Load',
        error?.message || 'Could not load delivery slots.',
      );
    } finally {
      setLoading(false);
    }
  }, [apiRequest, token]);

  useEffect(() => {
    fetchDeliverySlots();
  }, [fetchDeliverySlots]);

  const updateSlot = (index: number, patch: Partial<DeliverySlot>) => {
    setDeliverySlots(previous =>
      previous.map((slot, i) =>
        i === index ? {...slot, ...patch} : slot,
      ),
    );
  };

  const updateStartTime = (index: number, value: string) => {
    const slot = deliverySlots[index];
    if (!slot) return;

    updateSlot(index, {
      startTime: value,
      durationMinutes: calculateDuration(value, slot.endTime),
    });
  };

  const updateEndTime = (index: number, value: string) => {
    const slot = deliverySlots[index];
    if (!slot) return;

    updateSlot(index, {
      endTime: value,
      durationMinutes: calculateDuration(slot.startTime, value),
    });
  };

  const addCustomSlot = () => {
    setDeliverySlots(previous => [...previous, createEmptySlot()]);
  };

  const removeSlot = (index: number) => {
    setDeliverySlots(previous => previous.filter((_, i) => i !== index));
  };

  const validateSlots = () => {
    const activeSlots = deliverySlots.filter(slot => slot.isActive);

    if (activeSlots.length === 0) {
      FoodEAlert.alert(
        'No Active Slots',
        'Enable at least one delivery slot before saving.',
      );
      return false;
    }

    for (const slot of activeSlots) {
      if (!isValidDate(slot.date)) {
        FoodEAlert.alert(
          'Invalid Date',
          'Enter a valid date in YYYY-MM-DD format.',
        );
        return false;
      }

      if (slot.date < todayDate()) {
        FoodEAlert.alert(
          'Past Date',
          'Delivery slots cannot be scheduled for a past date.',
        );
        return false;
      }

      if (
        timeToMinutes(slot.startTime) < 0 ||
        timeToMinutes(slot.endTime) < 0
      ) {
        FoodEAlert.alert(
          'Invalid Time',
          'Use 24-hour time such as 09:00 or 18:30.',
        );
        return false;
      }

      const duration = calculateDuration(
        slot.startTime,
        slot.endTime,
      );

      if (duration < 10) {
        FoodEAlert.alert(
          'Invalid Time Range',
          'The end time must be later than the start time, and the slot must be at least 10 minutes.',
        );
        return false;
      }

      if (
        !Number.isInteger(Number(slot.cutoffMinutes)) ||
        slot.cutoffMinutes < 0 ||
        slot.cutoffMinutes >= duration
      ) {
        FoodEAlert.alert(
          'Invalid Cutoff',
          'Cutoff must be a whole number, at least 0 and less than the slot duration.',
        );
        return false;
      }
    }

    const sorted = [...activeSlots].sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
    );

    for (let i = 1; i < sorted.length; i++) {
      const previous = sorted[i - 1];
      const current = sorted[i];

      if (
        current.date === previous.date &&
        timeToMinutes(current.startTime) <
          timeToMinutes(previous.endTime)
      ) {
        FoodEAlert.alert(
          'Overlapping Slots',
          `${formatTime12(previous.startTime)}–${formatTime12(
            previous.endTime,
          )} overlaps with ${formatTime12(
            current.startTime,
          )}–${formatTime12(current.endTime)}.`,
        );
        return false;
      }
    }

    return true;
  };

  const saveDeliverySlots = async () => {
    if (!token) {
      FoodEAlert.alert(
        'Login Required',
        'Please log in as a restaurant owner.',
      );
      return;
    }

    if (!validateSlots()) return;

    try {
      setSaving(true);

      // Fetch the authoritative server schedule before applying changes.
      const existingData = await apiRequest('/delivery-slots/my');
      const existingSlots = existingData.deliverySlots || [];
      const localIds = new Set(
        deliverySlots.filter(slot => slot._id).map(slot => slot._id),
      );

      // Update existing slots, rather than deleting and recreating them.
      for (const slot of deliverySlots) {
        const payload = {
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          durationMinutes: calculateDuration(
            slot.startTime,
            slot.endTime,
          ),
          cutoffMinutes: Number(slot.cutoffMinutes),
          isActive: slot.isActive,
        };

        if (slot._id) {
          await apiRequest(
            `/delivery-slots/${slot._id}`,
            'PUT',
            payload,
          );
        } else if (slot.isActive) {
          // The create endpoint creates active slots.
          await apiRequest('/delivery-slots', 'POST', payload);
        }
        // New inactive drafts are not sent to the server.
      }

      // Slots removed from the editor are disabled on the server,
      // preserving their records in case orders reference them.
      for (const oldSlot of existingSlots) {
        if (oldSlot._id && !localIds.has(oldSlot._id)) {
          await apiRequest(
            `/delivery-slots/${oldSlot._id}`,
            'PUT',
            {isActive: false},
          );
        }
      }

      await fetchDeliverySlots();

      FoodEAlert.alert(
        'Schedule Saved',
        'Your delivery schedule has been updated.',
      );
    } catch (error: any) {
      FoodEAlert.alert(
        'Save Failed',
        error?.message || 'Unable to save delivery slots.',
      );

      await fetchDeliverySlots();
    } finally {
      setSaving(false);
    }
  };

  const activeCount = useMemo(
    () => deliverySlots.filter(slot => slot.isActive).length,
    [deliverySlots],
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'left', 'right']}>
        <StatusBar hidden={true} />
        <ActivityIndicator size="large" color="#FF7A00" />
        <Text style={styles.loadingText}>Loading delivery schedule...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar hidden={true} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <CalendarBlank size={25} color="#FF7A00" weight="duotone" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>BOOKING SCHEDULE</Text>
            <Text style={styles.title}>Delivery slots</Text>
            <Text style={styles.subtitle}>
              Set a date, start time, end time and booking cutoff.
            </Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <CheckCircle size={20} color="#16A34A" weight="fill" />
          <Text style={styles.infoText}>
            Only active slots are available to customers. Booking closes
            according to the cutoff you configure.
          </Text>
        </View>

        {deliverySlots.map((slot, index) => {
          const duration = calculateDuration(
            slot.startTime,
            slot.endTime,
          );

          return (
            <View key={slot._id || `new-${index}`} style={styles.slotCard}>
              <View style={styles.slotHeader}>
                <View style={styles.slotTitleWrap}>
                  <Text style={styles.slotTitle}>Slot {index + 1}</Text>
                  <Text style={styles.slotPreview}>
                    {formatTime12(slot.startTime)} –{' '}
                    {formatTime12(slot.endTime)}
                  </Text>
                </View>

                <Switch
                  value={slot.isActive}
                  onValueChange={value =>
                    updateSlot(index, {isActive: value})
                  }
                  trackColor={{false: '#D7D9DE', true: '#FFB978'}}
                  thumbColor={slot.isActive ? '#FF7A00' : '#FFFFFF'}
                />
              </View>

              <Text style={styles.label}>Date</Text>
              <View style={styles.inputRow}>
                <CalendarBlank size={18} color="#FF7A00" />
                <TextInput
                  value={slot.date}
                  onChangeText={value => updateSlot(index, {date: value})}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#A0A4AC"
                  style={styles.input}
                  autoCapitalize="none"
                  maxLength={10}
                />
              </View>
              <Text style={styles.helper}>Format: YYYY-MM-DD</Text>

              <Text style={styles.label}>Start time (24-hour format)</Text>
              <View style={styles.inputRow}>
                <Clock size={18} color="#FF7A00" />
                <TextInput
                  value={slot.startTime}
                  onChangeText={value => updateStartTime(index, value)}
                  placeholder="09:00"
                  placeholderTextColor="#A0A4AC"
                  style={styles.input}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
                <Text style={styles.helper}>
                  {formatTime12(slot.startTime)}
                </Text>
              </View>

              <Text style={styles.label}>End time (24-hour format)</Text>
              <View style={styles.inputRow}>
                <Clock size={18} color="#FF7A00" />
                <TextInput
                  value={slot.endTime}
                  onChangeText={value => updateEndTime(index, value)}
                  placeholder="11:00"
                  placeholderTextColor="#A0A4AC"
                  style={styles.input}
                  keyboardType="numbers-and-punctuation"
                  maxLength={5}
                />
                <Text style={styles.helper}>
                  {formatTime12(slot.endTime)}
                </Text>
              </View>

              <View style={styles.durationCard}>
                <View>
                  <Text style={styles.durationLabel}>Slot duration</Text>
                  <Text style={styles.durationHint}>
                    Calculated automatically
                  </Text>
                </View>
                <Text style={styles.durationValue}>
                  {duration > 0 ? `${duration} min` : '--'}
                </Text>
              </View>

              <View style={styles.cutoffRow}>
                <View style={styles.cutoffText}>
                  <Text style={styles.cutoffLabel}>Booking closes</Text>
                  <Text style={styles.cutoffHint}>
                    Minutes before the slot starts
                  </Text>
                </View>
                <TextInput
                  value={String(slot.cutoffMinutes)}
                  onChangeText={value =>
                    updateSlot(index, {
                      cutoffMinutes:
                        value.trim() === ''
                          ? 0
                          : Number(value.replace(/\D/g, '')),
                    })
                  }
                  keyboardType="number-pad"
                  style={styles.cutoffInput}
                  maxLength={4}
                />
                <Text style={styles.cutoffUnit}>min</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.deleteButton}
                onPress={() => removeSlot(index)}>
                <Trash size={18} color="#DC2626" />
                <Text style={styles.deleteText}>Remove from schedule</Text>
              </TouchableOpacity>
            </View>
          );
        })}

        <TouchableOpacity
          activeOpacity={0.86}
          style={styles.addButton}
          onPress={addCustomSlot}>
          <Plus size={21} color="#FF7A00" weight="bold" />
          <Text style={styles.addText}>Add another slot</Text>
        </TouchableOpacity>

        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>
            {activeCount} active slot{activeCount === 1 ? '' : 's'}
          </Text>
          <Text style={styles.footerText}>
            Customers can book active slots for the dates and times saved here.
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          disabled={saving}
          style={[styles.saveButton, saving && styles.disabled]}
          onPress={saveDeliverySlots}>
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveText}>Save delivery schedule</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DeliverySlotsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F8FA',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F8F8FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontWeight: '600',
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: '#FFF0E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    color: '#FF7A00',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#17171B',
    marginTop: 2,
  },
  subtitle: {
    fontSize: 12,
    lineHeight: 18,
    color: '#7B8089',
    marginTop: 3,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFFBF2',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  infoText: {
    flex: 1,
    color: '#166534',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  slotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 17,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.045,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 4},
    elevation: 2,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  slotTitleWrap: {
    flex: 1,
  },
  slotTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#17171B',
  },
  slotPreview: {
    marginTop: 3,
    color: '#FF7A00',
    fontSize: 12,
    fontWeight: '800',
  },
  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    marginBottom: 7,
    marginTop: 10,
  },
  inputRow: {
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FAFAFB',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
  },
  input: {
    flex: 1,
    color: '#17171B',
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 9,
    paddingVertical: 11,
  },
  helper: {
    fontSize: 11,
    color: '#8A8F98',
    fontWeight: '700',
  },
  durationCard: {
    marginTop: 14,
    padding: 13,
    borderRadius: 15,
    backgroundColor: '#FFF5EA',
    borderWidth: 1,
    borderColor: '#FFE0C2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  durationLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#17171B',
  },
  durationHint: {
    fontSize: 10,
    color: '#9A6B3A',
    marginTop: 2,
  },
  durationValue: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FF7A00',
  },
  cutoffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 13,
    borderTopWidth: 1,
    borderTopColor: '#F0F1F3',
  },
  cutoffText: {
    flex: 1,
  },
  cutoffLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '800',
  },
  cutoffHint: {
    fontSize: 10,
    color: '#9A9EA6',
    marginTop: 2,
  },
  cutoffInput: {
    width: 55,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#F5F6F8',
    textAlign: 'center',
    color: '#17171B',
    fontWeight: '800',
  },
  cutoffUnit: {
    fontSize: 11,
    color: '#7B8089',
    marginLeft: 7,
    fontWeight: '700',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 15,
    paddingVertical: 6,
  },
  deleteText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '800',
    marginLeft: 7,
  },
  addButton: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#FFD0A8',
    borderStyle: 'dashed',
    backgroundColor: '#FFF9F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addText: {
    color: '#FF7A00',
    fontWeight: '900',
    fontSize: 13,
    marginLeft: 8,
  },
  footerCard: {
    marginTop: 14,
    padding: 15,
    borderRadius: 17,
    backgroundColor: '#FFF2E6',
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#17171B',
  },
  footerText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#7B5B3B',
    marginTop: 3,
  },
  saveButton: {
    height: 54,
    borderRadius: 17,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  disabled: {
    opacity: 0.6,
  },
});
