import React, {useEffect, useState} from 'react';
import {
  DeviceEventEmitter,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {getUserFacingErrorMessage} from './errorMessages';

export type FoodEAlertButton = {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
};

export type FoodEAlertPayload = {
  title: string;
  message?: string;
  buttons?: FoodEAlertButton[];
};

export const FOODE_ALERT_EVENT = 'FOODE_ALERT_EVENT';

export const FoodEAlert = {
  alert: (
    title: string,
    message?: string,
    buttons?: FoodEAlertButton[],
  ) => {
    const safeMessage = message
      ? getUserFacingErrorMessage(message)
      : undefined;
    DeviceEventEmitter.emit(FOODE_ALERT_EVENT, {
      title,
      message: safeMessage,
      buttons: buttons?.length
        ? buttons
        : [{text: 'OK'}],
    } satisfies FoodEAlertPayload);
  },
};

const FoodEAlertHost: React.FC = () => {
  const [alert, setAlert] = useState<FoodEAlertPayload | null>(null);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      FOODE_ALERT_EVENT,
      (payload: FoodEAlertPayload) => setAlert(payload),
    );

    return () => subscription.remove();
  }, []);

  const close = (button?: FoodEAlertButton) => {
    setAlert(null);
    requestAnimationFrame(() => button?.onPress?.());
  };

  return (
    <Modal
      transparent
      visible={!!alert}
      animationType="fade"
      onRequestClose={() => close(alert?.buttons?.[0])}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>✦</Text>
          </View>

          <Text style={styles.title}>{alert?.title}</Text>
          {!!alert?.message && (
            <Text style={styles.message}>{alert.message}</Text>
          )}

          <View style={styles.actions}>
            {(alert?.buttons ?? []).map((button, index) => {
              const destructive = button.style === 'destructive';
              const cancel = button.style === 'cancel';
              const primary = !cancel && !destructive;

              return (
                <Pressable
                  key={`${button.text}-${index}`}
                  onPress={() => close(button)}
                  style={({pressed}) => [
                    styles.button,
                    primary && styles.primaryButton,
                    cancel && styles.cancelButton,
                    destructive && styles.destructiveButton,
                    pressed && styles.pressed,
                  ]}>
                  <Text
                    style={[
                      styles.buttonText,
                      primary && styles.primaryText,
                      cancel && styles.cancelText,
                      destructive && styles.destructiveText,
                    ]}>
                    {button.text}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default FoodEAlertHost;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    maxWidth: 390,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 12},
    elevation: 12,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: '#FFF2E6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    color: '#FF7A00',
    fontSize: 25,
    fontWeight: '900',
  },
  title: {
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '900',
    color: '#17171B',
  },
  message: {
    marginTop: 9,
    fontSize: 14,
    lineHeight: 21,
    color: '#6B7280',
  },
  actions: {
    marginTop: 22,
    gap: 10,
  },
  button: {
    minHeight: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryButton: {
    backgroundColor: '#FF7A00',
  },
  cancelButton: {
    backgroundColor: '#F4F5F7',
  },
  destructiveButton: {
    backgroundColor: '#FFF0F0',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  cancelText: {
    color: '#4B5563',
  },
  destructiveText: {
    color: '#DC2626',
  },
  pressed: {
    opacity: 0.78,
  },
});
