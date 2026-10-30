import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import AppTextInput from '../../../components/inputs/AppTextInput';
import {SafeAreaView} from 'react-native-safe-area-context';

import {
  Clock,
  Plus,
  Trash,
} from 'phosphor-react-native';

import {useAuth} from '../../../context/AuthContext';
import API_BASE_URL from '../../../config/api';
import {FoodEAlert} from '../../../utils/FoodEAlert';
import {formatTime12} from '../../../utils/time';

// =====================================================
// TYPES
// =====================================================

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

// =====================================================
// DATE HELPERS
// =====================================================

const pad = (value: number) => String(value).padStart(2, '0');

const todayDate = () => {
  const now = new Date();

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate(),
  )}`;
};

const tomorrowDate = () => {
  const tomorrow = new Date();

  tomorrow.setDate(tomorrow.getDate() + 1);

  return `${tomorrow.getFullYear()}-${pad(
    tomorrow.getMonth() + 1,
  )}-${pad(tomorrow.getDate())}`;
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

// =====================================================
// TIME HELPERS
// =====================================================

const timeToMinutes = (value: string) => {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    return -1;
  }

  const [hours, minutes] = value.split(':').map(Number);

  return hours * 60 + minutes;
};

const calculateDuration = (
  startTime: string,
  endTime: string,
) => {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  return start < 0 || end <= start ? 0 : end - start;
};

// =====================================================
// 12-HOUR / 24-HOUR CONVERSION
// =====================================================

const splitTo12Hour = (time24: string) => {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time24)) {
    return {
      hour: '12',
      minute: '00',
      period: 'PM' as 'AM' | 'PM',
    };
  }

  const [h, m] = time24.split(':').map(Number);

  const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';

  const hour12 = h % 12 || 12;

  return {
    hour: String(hour12).padStart(2, '0'),
    minute: String(m).padStart(2, '0'),
    period,
  };
};

const joinTo24Hour = (
  hour12Str: string,
  minuteStr: string,
  period: 'AM' | 'PM',
) => {
  let h = Number(hour12Str) || 12;

  h = Math.min(12, Math.max(1, h));

  const m = Math.min(
    59,
    Math.max(0, Number(minuteStr) || 0),
  );

  if (period === 'AM') {
    h = h === 12 ? 0 : h;
  } else {
    h = h === 12 ? 12 : h + 12;
  }

  return `${String(h).padStart(2, '0')}:${String(m).padStart(
    2,
    '0',
  )}`;
};

// =====================================================
// CREATE EMPTY SLOT
// DEFAULT DATE: TODAY
// =====================================================

const createEmptySlot = (
  defaultDate = todayDate(),
): DeliverySlot => ({
  date: defaultDate,
  startTime: '12:00',
  endTime: '13:00',
  durationMinutes: 60,
  isActive: true,
  cutoffMinutes: 10,
});

// =====================================================
// TIME FIELD COMPONENT
// =====================================================

interface TimeField12Props {
  label: string;
  value24: string;
  onChange24: (value24: string) => void;
}

const TimeField12: React.FC<TimeField12Props> = ({
  label,
  value24,
  onChange24,
}) => {
  const parts = useMemo(
    () => splitTo12Hour(value24),
    [value24],
  );

  const [hour, setHour] = useState(parts.hour);
  const [minute, setMinute] = useState(parts.minute);

  const [period, setPeriod] = useState<'AM' | 'PM'>(
    parts.period,
  );

  const lastEmitted24Ref = useRef<string | null>(null);

  useEffect(() => {
    if (value24 === lastEmitted24Ref.current) {
      return;
    }

    setHour(parts.hour);
    setMinute(parts.minute);
    setPeriod(parts.period);
  }, [value24, parts]);

  const handleHourChange = (text: string) => {
    let clean = text.replace(/\D/g, '').slice(0, 2);

    if (clean !== '' && Number(clean) > 12) {
      clean = '12';
    }

    setHour(clean);

    const new24 = joinTo24Hour(
      clean || '12',
      minute || '00',
      period,
    );

    lastEmitted24Ref.current = new24;

    onChange24(new24);
  };

  const handleHourBlur = () => {
    if (hour === '' || Number(hour) === 0) {
      setHour('12');

      const new24 = joinTo24Hour(
        '12',
        minute || '00',
        period,
      );

      lastEmitted24Ref.current = new24;

      onChange24(new24);
    } else if (hour.length === 1) {
      const padded = hour.padStart(2, '0');

      setHour(padded);

      const new24 = joinTo24Hour(
        padded,
        minute || '00',
        period,
      );

      lastEmitted24Ref.current = new24;

      onChange24(new24);
    }
  };

  const handleMinuteChange = (text: string) => {
    let clean = text.replace(/\D/g, '').slice(0, 2);

    if (clean !== '' && Number(clean) > 59) {
      clean = '59';
    }

    setMinute(clean);

    const new24 = joinTo24Hour(
      hour || '12',
      clean || '00',
      period,
    );

    lastEmitted24Ref.current = new24;

    onChange24(new24);
  };

  const handleMinuteBlur = () => {
    if (minute === '') {
      setMinute('00');

      const new24 = joinTo24Hour(
        hour || '12',
        '00',
        period,
      );

      lastEmitted24Ref.current = new24;

      onChange24(new24);
    } else if (minute.length === 1) {
      const padded = minute.padStart(2, '0');

      setMinute(padded);

      const new24 = joinTo24Hour(
        hour || '12',
        padded,
        period,
      );

      lastEmitted24Ref.current = new24;

      onChange24(new24);
    }
  };

  const handlePeriodChange = (newPeriod: 'AM' | 'PM') => {
    setPeriod(newPeriod);

    const new24 = joinTo24Hour(
      hour || '12',
      minute || '00',
      newPeriod,
    );

    lastEmitted24Ref.current = new24;

    onChange24(new24);
  };

  return (
    <View style={styles.timeField}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.timeInputContainer}>
        <View style={styles.timeUnitBox}>
          <AppTextInput
            value={hour}
            onChangeText={handleHourChange}
            onBlur={handleHourBlur}
            placeholder="12"
            placeholderTextColor="#A0A4AC"
            style={styles.timeUnitInput}
            keyboardType="number-pad"
            maxLength={2}
            selectTextOnFocus
          />
        </View>

        <Text style={styles.timeColon}>:</Text>

        <View style={styles.timeUnitBox}>
          <AppTextInput
            value={minute}
            onChangeText={handleMinuteChange}
            onBlur={handleMinuteBlur}
            placeholder="00"
            placeholderTextColor="#A0A4AC"
            style={styles.timeUnitInput}
            keyboardType="number-pad"
            maxLength={2}
            selectTextOnFocus
          />
        </View>

        <View style={styles.periodGroup}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handlePeriodChange('AM')}
            style={[
              styles.periodButton,
              period === 'AM' && styles.periodButtonActive,
            ]}>
            <Text
              style={[
                styles.periodText,
                period === 'AM' && styles.periodTextActive,
              ]}>
              AM
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handlePeriodChange('PM')}
            style={[
              styles.periodButton,
              period === 'PM' && styles.periodButtonActive,
            ]}>
            <Text
              style={[
                styles.periodText,
                period === 'PM' && styles.periodTextActive,
              ]}>
              PM
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.timeHelper}>
        {formatTime12(value24)}
      </Text>
    </View>
  );
};

// =====================================================
// DELIVERY SLOTS SCREEN
// =====================================================

const DeliverySlotsScreen: React.FC = () => {
  const {token} = useAuth();

  const [deliverySlots, setDeliverySlots] = useState<
    DeliverySlot[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ===================================================
  // API REQUEST
  // ===================================================

  const apiRequest = useCallback(
    async (
      path: string,
      method = 'GET',
      body?: object,
    ) => {
      if (!token) {
        throw new Error(
          'Please log in as a restaurant owner.',
        );
      }

      const response = await fetch(
        `${API_BASE_URL}${path}`,
        {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            ...(body
              ? {'Content-Type': 'application/json'}
              : {}),
          },
          ...(body
            ? {body: JSON.stringify(body)}
            : {}),
        },
      );

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || 'Something went wrong.',
        );
      }

      return data;
    },
    [token],
  );

  // ===================================================
  // FETCH DELIVERY SLOTS
  // ONLY TODAY AND TOMORROW
  // ===================================================

  const fetchDeliverySlots = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest('/delivery-slots/my');

      const today = todayDate();
      const tomorrow = tomorrowDate();

      const slots = (data.deliverySlots || [])
        .filter(
          slot =>
            slot.date === today ||
            slot.date === tomorrow,
        )
        .map(slot => ({
          _id: slot._id,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          durationMinutes:
            Number(slot.durationMinutes) ||
            calculateDuration(
              slot.startTime,
              slot.endTime,
            ),
          isActive: slot.isActive !== false,
          cutoffMinutes: Number(
            slot.cutoffMinutes ?? 10,
          ),
        }));

      setDeliverySlots(slots);
    } catch (error: any) {
      FoodEAlert.alert(
        'Unable to Load',
        error?.message ||
          'Could not load delivery slots.',
      );
    } finally {
      setLoading(false);
    }
  }, [apiRequest, token]);

  useEffect(() => {
    fetchDeliverySlots();
  }, [fetchDeliverySlots]);

  // ===================================================
  // UPDATE SLOT
  // ===================================================

  const updateSlot = (
    index: number,
    patch: Partial<DeliverySlot>,
  ) => {
    setDeliverySlots(previous =>
      previous.map((slot, i) =>
        i === index
          ? {...slot, ...patch}
          : slot,
      ),
    );
  };

  const updateStartTime = (
    index: number,
    new24: string,
  ) => {
    const slot = deliverySlots[index];

    if (!slot) return;

    updateSlot(index, {
      startTime: new24,
      durationMinutes: calculateDuration(
        new24,
        slot.endTime,
      ),
    });
  };

  const updateEndTime = (
    index: number,
    new24: string,
  ) => {
    const slot = deliverySlots[index];

    if (!slot) return;

    updateSlot(index, {
      endTime: new24,
      durationMinutes: calculateDuration(
        slot.startTime,
        new24,
      ),
    });
  };

  // ===================================================
  // ADD AND REMOVE SLOTS
  // ===================================================

  const addCustomSlot = (
    date = todayDate(),
  ) => {
    setDeliverySlots(previous => [
      ...previous,
      createEmptySlot(date),
    ]);
  };

  const removeSlot = (index: number) => {
    setDeliverySlots(previous =>
      previous.filter((_, i) => i !== index),
    );
  };

  // ===================================================
  // VALIDATE DELIVERY SLOTS
  // ===================================================

  const validateSlots = () => {
    const activeSlots = deliverySlots.filter(
      slot => slot.isActive,
    );

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

      if (
        slot.date !== todayDate() &&
        slot.date !== tomorrowDate()
      ) {
        FoodEAlert.alert(
          'Invalid Date',
          'Delivery slots can only be scheduled for Today or Tomorrow.',
        );

        return false;
      }

      if (
        timeToMinutes(slot.startTime) < 0 ||
        timeToMinutes(slot.endTime) < 0
      ) {
        FoodEAlert.alert(
          'Invalid Time',
          'Ensure valid 12-hour times with AM/PM selected.',
        );

        return false;
      }

      const duration = calculateDuration(
        slot.startTime,
        slot.endTime,
      );

      if (duration <= 0) {
        FoodEAlert.alert(
          'Invalid Time Range',
          'End time must be later than start time.',
        );

        return false;
      }

      if (
        !Number.isFinite(Number(slot.cutoffMinutes)) ||
        slot.cutoffMinutes < 0
      ) {
        FoodEAlert.alert(
          'Invalid Cutoff',
          'Cutoff must be 0 or a positive whole number.',
        );

        return false;
      }
    }

    // Check overlapping delivery slots.
    const sorted = [...activeSlots].sort(
      (a, b) =>
        a.date.localeCompare(b.date) ||
        timeToMinutes(a.startTime) -
          timeToMinutes(b.startTime),
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
          `${formatTime12(
            previous.startTime,
          )}–${formatTime12(
            previous.endTime,
          )} overlaps with ${formatTime12(
            current.startTime,
          )}–${formatTime12(
            current.endTime,
          )} on ${current.date}.`,
        );

        return false;
      }
    }

    return true;
  };

  // ===================================================
  // SAVE DELIVERY SLOTS
  // ===================================================

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

      const existingData = await apiRequest(
        '/delivery-slots/my',
      );

      const existingSlots =
        existingData.deliverySlots || [];

      const localIds = new Set(
        deliverySlots
          .filter(slot => slot._id)
          .map(slot => slot._id),
      );

      for (const slot of deliverySlots) {
        const payload = {
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          durationMinutes: calculateDuration(
            slot.startTime,
            slot.endTime,
          ),
          cutoffMinutes: Number(
            slot.cutoffMinutes,
          ),
          isActive: slot.isActive,
        };

        if (slot._id) {
          await apiRequest(
            `/delivery-slots/${slot._id}`,
            'PUT',
            payload,
          );
        } else {
          await apiRequest(
            '/delivery-slots',
            'POST',
            payload,
          );
        }
      }

      // Deactivate slots removed from this schedule.
      for (const oldSlot of existingSlots) {
        if (
          oldSlot._id &&
          !localIds.has(oldSlot._id)
        ) {
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
        'Your delivery slots have been updated successfully.',
      );
    } catch (error: any) {
      FoodEAlert.alert(
        'Save Failed',
        error?.message ||
          'Unable to save delivery slots.',
      );

      await fetchDeliverySlots();
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // COUNTERS AND DATE LABELS
  // ===================================================

  const activeCount = useMemo(
    () =>
      deliverySlots.filter(slot => slot.isActive).length,
    [deliverySlots],
  );

  const getSlotDateLabel = (dateStr: string) => {
    if (dateStr === todayDate()) return 'Today';

    if (dateStr === tomorrowDate()) return 'Tomorrow';

    return dateStr;
  };

  // ===================================================
  // LOADING SCREEN
  // ===================================================

  if (loading) {
    return (
      <SafeAreaView
        style={styles.loadingContainer}
        edges={['left', 'right']}>

        <StatusBar hidden={true} />

        <ActivityIndicator
          size="large"
          color="#FF7A00"
        />

        <Text style={styles.loadingText}>
          Loading delivery schedule...
        </Text>
      </SafeAreaView>
    );
  }

  // ===================================================
  // MAIN SCREEN
  // ===================================================

  return (
    <SafeAreaView
      style={styles.container}
      edges={['left', 'right']}>

      <StatusBar hidden={true} />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">

        {/* HEADER */}

        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <Clock
              size={28}
              color="#FF7A00"
              weight="duotone"
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.eyebrow}>
              SCHEDULE MANAGEMENT
            </Text>

            <Text style={styles.title}>
              Delivery Slots
            </Text>

            <Text style={styles.subtitle}>
              Set delivery times for Today and Tomorrow only.
            </Text>
          </View>
        </View>

        {/* QUICK ADD BUTTONS */}

        <View style={styles.quickAddRow}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => addCustomSlot(todayDate())}
            style={styles.quickAddPill}>

            <Plus
              size={15}
              color="#FF7A00"
              weight="bold"
            />

            <Text style={styles.quickAddText}>
              Add for Today
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => addCustomSlot(tomorrowDate())}
            style={[
              styles.quickAddPill,
              styles.quickAddPillTomorrow,
            ]}>

            <Plus
              size={15}
              color="#2563EB"
              weight="bold"
            />

            <Text
              style={[
                styles.quickAddText,
                {color: '#2563EB'},
              ]}>
              Add for Tomorrow
            </Text>
          </TouchableOpacity>
        </View>

        {/* DELIVERY SLOTS */}

        {deliverySlots.map((slot, index) => {
          const duration = calculateDuration(
            slot.startTime,
            slot.endTime,
          );

          const isToday =
            slot.date === todayDate();

          const isTomorrow =
            slot.date === tomorrowDate();

          return (
            <View
              key={slot._id || `new-${index}`}
              style={styles.slotCard}>

              {/* SLOT HEADER */}

              <View style={styles.slotHeader}>
                <View style={styles.slotTitleWrap}>
                  <View style={styles.slotTitleRow}>
                    <Text style={styles.slotTitle}>
                      Slot {index + 1}
                    </Text>

                    <View
                      style={[
                        styles.dateTag,
                        isToday && styles.dateTagToday,
                        isTomorrow && styles.dateTagTomorrow,
                      ]}>

                      <Text
                        style={[
                          styles.dateTagText,
                          isToday &&
                            styles.dateTagTextToday,
                          isTomorrow &&
                            styles.dateTagTextTomorrow,
                        ]}>
                        {getSlotDateLabel(slot.date)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.slotPreview}>
                    {formatTime12(slot.startTime)} –{' '}
                    {formatTime12(slot.endTime)}
                  </Text>
                </View>

                <Switch
                  value={slot.isActive}
                  onValueChange={value =>
                    updateSlot(index, {
                      isActive: value,
                    })
                  }
                  trackColor={{
                    false: '#D7D9DE',
                    true: '#FFB978',
                  }}
                  thumbColor={
                    slot.isActive
                      ? '#FF7A00'
                      : '#FFFFFF'
                  }
                />
              </View>

              {/* TODAY / TOMORROW SELECTOR */}

              <Text style={styles.label}>
                Delivery Day
              </Text>

              <View style={styles.dateSelectorRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    updateSlot(index, {
                      date: todayDate(),
                    })
                  }
                  style={[
                    styles.dateOptionPill,
                    isToday &&
                      styles.dateOptionPillActive,
                  ]}>

                  <Text
                    style={[
                      styles.dateOptionText,
                      isToday &&
                        styles.dateOptionTextActive,
                    ]}>
                    Today
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() =>
                    updateSlot(index, {
                      date: tomorrowDate(),
                    })
                  }
                  style={[
                    styles.dateOptionPill,
                    isTomorrow &&
                      styles.dateOptionPillActiveTomorrow,
                  ]}>

                  <Text
                    style={[
                      styles.dateOptionText,
                      isTomorrow &&
                        styles.dateOptionTextActiveTomorrow,
                    ]}>
                    Tomorrow
                  </Text>
                </TouchableOpacity>
              </View>

              {/* TIME FIELDS */}

              <View style={styles.timeFieldsRow}>
                <TimeField12
                  label="Start Time"
                  value24={slot.startTime}
                  onChange24={new24 =>
                    updateStartTime(index, new24)
                  }
                />

                <TimeField12
                  label="End Time"
                  value24={slot.endTime}
                  onChange24={new24 =>
                    updateEndTime(index, new24)
                  }
                />
              </View>

              {/* DURATION */}

              <View style={styles.durationCard}>
                <View>
                  <Text style={styles.durationLabel}>
                    Slot Duration
                  </Text>

                  <Text style={styles.durationHint}>
                    Calculated automatically
                  </Text>
                </View>

                <Text style={styles.durationValue}>
                  {duration > 0
                    ? `${duration} min`
                    : '--'}
                </Text>
              </View>

              {/* BOOKING CUTOFF */}

              <View style={styles.cutoffRow}>
                <View style={styles.cutoffText}>
                  <Text style={styles.cutoffLabel}>
                    Booking Closes
                  </Text>

                  <Text style={styles.cutoffHint}>
                    Minutes before the slot starts
                  </Text>
                </View>

                <AppTextInput
                  value={String(slot.cutoffMinutes)}
                  onChangeText={value =>
                    updateSlot(index, {
                      cutoffMinutes:
                        value.trim() === ''
                          ? 0
                          : Number(
                              value.replace(/\D/g, ''),
                            ),
                    })
                  }
                  keyboardType="number-pad"
                  style={styles.cutoffInput}
                  maxLength={4}
                />

                <Text style={styles.cutoffUnit}>
                  min
                </Text>
              </View>

              {/* REMOVE SLOT */}

              <TouchableOpacity
                activeOpacity={0.8}
                style={styles.deleteButton}
                onPress={() => removeSlot(index)}>

                <Trash
                  size={16}
                  color="#DC2626"
                />

                <Text style={styles.deleteText}>
                  Remove Slot
                </Text>
              </TouchableOpacity>
            </View>
          );
        })}

        {/* ADD ANOTHER SLOT */}

        <TouchableOpacity
          activeOpacity={0.86}
          style={styles.addButton}
          onPress={() => addCustomSlot()}>

          <Plus
            size={20}
            color="#FF7A00"
            weight="bold"
          />

          <Text style={styles.addText}>
            Add another delivery slot
          </Text>
        </TouchableOpacity>

        {/* FOOTER */}

        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>
            {activeCount} active slot
            {activeCount === 1 ? '' : 's'} configured
          </Text>

          <Text style={styles.footerText}>
            Customers can book your active delivery slots for Today and Tomorrow.
          </Text>
        </View>

        {/* SAVE */}

        <TouchableOpacity
          activeOpacity={0.88}
          disabled={saving}
          style={[
            styles.saveButton,
            saving && styles.disabled,
          ]}
          onPress={saveDeliverySlots}>

          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveText}>
              Save Delivery Schedule
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default DeliverySlotsScreen;

// =====================================================
// STYLES
// =====================================================

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
    padding: 16,
    paddingBottom: 40,
  },

  // HEADER

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#FFF0E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
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
    fontSize: 24,
    fontWeight: '900',
    color: '#17171B',
    marginTop: 2,
  },

  subtitle: {
    fontSize: 12,
    lineHeight: 17,
    color: '#7B8089',
    marginTop: 2,
  },

  // QUICK ADD

  quickAddRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },

  quickAddPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF2E6',
    borderWidth: 1,
    borderColor: '#FFE0C2',
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },

  quickAddPillTomorrow: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },

  quickAddText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF7A00',
  },

  // SLOT CARD

  slotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOpacity: 0.045,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 3,
    },
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ECECEC',
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

  slotTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  slotTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#17171B',
  },

  dateTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#F3F4F6',
  },

  dateTagToday: {
    backgroundColor: '#FFF2E6',
  },

  dateTagTomorrow: {
    backgroundColor: '#EFF6FF',
  },

  dateTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },

  dateTagTextToday: {
    color: '#FF7A00',
  },

  dateTagTextTomorrow: {
    color: '#2563EB',
  },

  slotPreview: {
    marginTop: 3,
    color: '#FF7A00',
    fontSize: 12,
    fontWeight: '700',
  },

  label: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    marginBottom: 6,
    marginTop: 10,
  },

  // DATE SELECTOR

  dateSelectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },

  dateOptionPill: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  dateOptionPillActive: {
    backgroundColor: '#FF7A00',
    borderColor: '#FF7A00',
  },

  dateOptionPillActiveTomorrow: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },

  dateOptionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },

  dateOptionTextActive: {
    color: '#FFFFFF',
  },

  dateOptionTextActiveTomorrow: {
    color: '#FFFFFF',
  },

  // TIME FIELDS

  timeFieldsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },

  timeField: {
    flex: 1,
    minWidth: 0,
  },

  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 4,
  },

  timeUnitBox: {
    width: 32,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  timeUnitInput: {
    width: '100%',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
    color: '#17171B',
    padding: 0,
  },

  timeColon: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9CA3AF',
    marginHorizontal: 1,
  },

  periodGroup: {
    flexDirection: 'row',
    marginLeft: 'auto',
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },

  periodButton: {
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
  },

  periodButtonActive: {
    backgroundColor: '#FF7A00',
  },

  periodText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4B5563',
  },

  periodTextActive: {
    color: '#FFFFFF',
  },

  timeHelper: {
    marginTop: 4,
    fontSize: 10,
    color: '#8A8F98',
    fontWeight: '700',
  },

  // DURATION

  durationCard: {
    marginTop: 12,
    padding: 11,
    borderRadius: 12,
    backgroundColor: '#FFF5EA',
    borderWidth: 1,
    borderColor: '#FFE0C2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  durationLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#17171B',
  },

  durationHint: {
    fontSize: 10,
    color: '#9A6B3A',
    marginTop: 1,
  },

  durationValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#FF7A00',
  },

  // BOOKING CUTOFF

  cutoffRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 11,
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
    marginTop: 1,
  },

  cutoffInput: {
    width: 50,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F5F6F8',
    textAlign: 'center',
    color: '#17171B',
    fontWeight: '800',
    padding: 0,
  },

  cutoffUnit: {
    fontSize: 11,
    color: '#7B8089',
    marginLeft: 6,
    fontWeight: '700',
  },

  // REMOVE BUTTON

  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
    marginTop: 12,
    paddingVertical: 4,
  },

  deleteText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 5,
  },

  // ADD BUTTON

  addButton: {
    height: 50,
    borderRadius: 14,
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
    fontWeight: '800',
    fontSize: 13,
    marginLeft: 6,
  },

  // FOOTER

  footerCard: {
    marginTop: 12,
    padding: 13,
    borderRadius: 14,
    backgroundColor: '#FFF2E6',
  },

  footerTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#17171B',
  },

  footerText: {
    fontSize: 11,
    lineHeight: 16,
    color: '#7B5B3B',
    marginTop: 2,
  },

  // SAVE BUTTON

  saveButton: {
    height: 52,
    borderRadius: 14,
    backgroundColor: '#FF7A00',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
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
