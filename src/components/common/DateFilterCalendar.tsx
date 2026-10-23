import React, {useMemo, useState} from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  StyleProp,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import {CalendarBlank, CaretLeft, CaretRight} from 'phosphor-react-native';

interface DateFilterCalendarProps {
  value: string;
  onChange: (date: string) => void;
  style?: StyleProp<ViewStyle>;
}

const toDateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

const DateFilterCalendar: React.FC<DateFilterCalendarProps> = ({
  value,
  onChange,
  style,
}) => {
  const [visible, setVisible] = useState(false);
  const [month, setMonth] = useState(() => {
    const selected = new Date(`${value}T12:00:00`);
    return new Date(selected.getFullYear(), selected.getMonth(), 1);
  });

  const days = useMemo(() => {
    const firstWeekday = (month.getDay() + 6) % 7;
    const daysInMonth = new Date(
      month.getFullYear(),
      month.getMonth() + 1,
      0,
    ).getDate();

    return [
      ...Array.from({length: firstWeekday}, () => null),
      ...Array.from({length: daysInMonth}, (_, index) => index + 1),
    ];
  }, [month]);

  const selectedDate = new Date(`${value}T12:00:00`);
  const label = selectedDate.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const changeMonth = (offset: number) =>
    setMonth(current =>
      new Date(current.getFullYear(), current.getMonth() + offset, 1),
    );

  const chooseDate = (day: number) => {
    onChange(
      toDateKey(new Date(month.getFullYear(), month.getMonth(), day)),
    );
    setVisible(false);
  };

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Filter orders by date, ${label}`}
        onPress={() => {
          setMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
          setVisible(true);
        }}
        style={({pressed}) => [
          styles.dateButton,
          style,
          pressed && styles.pressed,
        ]}>
        <CalendarBlank size={18} color="#E65C00" weight="duotone" />
        <Text style={styles.dateLabel}>{label}</Text>
        <CaretRight size={15} color="#8B919C" weight="bold" />
      </Pressable>

      <Modal
        transparent
        visible={visible}
        animationType="fade"
        onRequestClose={() => setVisible(false)}>
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)}>
          <Pressable style={styles.calendarCard} onPress={() => {}}>
            <View style={styles.monthHeader}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Previous month"
                hitSlop={8}
                onPress={() => changeMonth(-1)}
                style={styles.monthButton}>
                <CaretLeft size={18} color="#414852" weight="bold" />
              </Pressable>
              <Text style={styles.monthTitle}>
                {month.toLocaleDateString('en-IN', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Next month"
                hitSlop={8}
                onPress={() => changeMonth(1)}
                style={styles.monthButton}>
                <CaretRight size={18} color="#414852" weight="bold" />
              </Pressable>
            </View>

            <View style={styles.grid}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, index) => (
                <Text key={`${day}-${index}`} style={styles.weekday}>
                  {day}
                </Text>
              ))}
              {days.map((day, index) =>
                day === null ? (
                  <View key={`blank-${index}`} style={styles.dayCell} />
                ) : (
                  <Pressable
                    key={day}
                    accessibilityRole="button"
                    accessibilityLabel={`${month.toLocaleDateString('en-IN', {
                      month: 'long',
                    })} ${day}`}
                    onPress={() => chooseDate(day)}
                    style={[
                      styles.dayCell,
                      toDateKey(
                        new Date(month.getFullYear(), month.getMonth(), day),
                      ) === value && styles.selectedDay,
                    ]}>
                    <Text
                      style={[
                        styles.dayText,
                        toDateKey(
                          new Date(month.getFullYear(), month.getMonth(), day),
                        ) === value && styles.selectedDayText,
                      ]}>
                      {day}
                    </Text>
                  </Pressable>
                ),
              )}
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={() => {
                const todayKey = getLocalDateKey();
                const [year, month] = todayKey.split('-').map(Number);
                setMonth(new Date(year, month - 1, 1));
                onChange(todayKey);
                setVisible(false);
              }}
              style={styles.todayButton}>
              <Text style={styles.todayText}>Go to today</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

// Match the backend's Asia/Kolkata order-date filter, regardless of device zone.
export const getLocalDateKey = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const part = (type: string) =>
    parts.find(item => item.type === type)?.value || '';
  return `${part('year')}-${part('month')}-${part('day')}`;
};


export default DateFilterCalendar;

const styles = StyleSheet.create({
  dateButton: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 9,
    paddingHorizontal: 13,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#F1D5C1',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 18,
    marginTop: 12,
    marginBottom: 12,
  },
  dateLabel: {
    color: '#323842',
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
  },
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(20, 24, 32, 0.42)',
  },
  calendarCard: {
    width: '100%',
    maxWidth: 360,
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    elevation: 12,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  monthButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: '#F7F8FA',
  },
  monthTitle: {
    color: '#20242C',
    fontSize: 16,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  weekday: {
    width: '14.2857%',
    paddingVertical: 9,
    color: '#858B95',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  dayCell: {
    width: '14.2857%',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  dayText: {
    color: '#323842',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedDay: {
    backgroundColor: '#FF6B00',
  },
  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  todayButton: {
    alignSelf: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    marginTop: 12,
  },
  todayText: {
    color: '#E65C00',
    fontSize: 14,
    fontWeight: '800',
  },
});
