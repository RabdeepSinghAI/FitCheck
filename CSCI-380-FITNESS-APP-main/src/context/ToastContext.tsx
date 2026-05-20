import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { useTheme } from './ThemeContext';

type Toast = { id: string; message: string };

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const [toast, setToast] = useState<Toast | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;

  const showToast = useCallback(
    (message: string) => {
      const id = `toast-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      setToast({ id, message });
      opacity.setValue(0);
      Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }).start(() => {
        setTimeout(() => {
          Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
            setToast(prev => (prev?.id === id ? null : prev));
          });
        }, 1200);
      });
    },
    [opacity],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: 24,
            opacity,
          }}
        >
          <View
            style={{
              borderRadius: 14,
              paddingVertical: 12,
              paddingHorizontal: 14,
              backgroundColor: colors.text,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Text style={{ color: colors.card, fontWeight: '900', textAlign: 'center' }}>{toast.message}</Text>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

