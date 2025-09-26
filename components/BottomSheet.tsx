
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  Modal,
  Animated,
  TouchableWithoutFeedback,
  Dimensions
} from 'react-native';
import { colors } from '../styles/commonStyles';
import { PanGestureHandler, State } from 'react-native-gesture-handler';

interface SimpleBottomSheetProps {
  children?: React.ReactNode;
  isVisible?: boolean;
  onClose?: () => void;
}

const SNAP_POINTS = [0, Dimensions.get('window').height * 0.5];

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 200,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.grey,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
});

export default function SimpleBottomSheet({ children, isVisible = false, onClose }: SimpleBottomSheetProps) {
  const translateY = useRef(new Animated.Value(SNAP_POINTS[1])).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const gestureTranslateY = useRef(new Animated.Value(0)).current;
  const [visible, setVisible] = useState(isVisible);

  const animateToPosition = useCallback((position: number) => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: position,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: position === 0 ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (position === SNAP_POINTS[1]) {
        setVisible(false);
      }
    });
  }, [translateY, backdropOpacity]);

  useEffect(() => {
    if (isVisible) {
      setVisible(true);
      animateToPosition(0);
    } else {
      animateToPosition(SNAP_POINTS[1]);
    }
  }, [isVisible, animateToPosition, gestureTranslateY]);

  const handleBackdropPress = () => {
    if (onClose) {
      onClose();
    }
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: gestureTranslateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: any) => {
    if (event.nativeEvent.state === State.END) {
      const { translationY, velocityY } = event.nativeEvent;
      
      if (translationY > 100 || velocityY > 500) {
        if (onClose) {
          onClose();
        }
      } else {
        Animated.spring(gestureTranslateY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={handleBackdropPress}>
        <Animated.View style={[styles.overlay, { opacity: backdropOpacity }]}>
          <TouchableWithoutFeedback>
            <PanGestureHandler
              onGestureEvent={onGestureEvent}
              onHandlerStateChange={onHandlerStateChange}
            >
              <Animated.View
                style={[
                  styles.bottomSheet,
                  {
                    transform: [
                      { translateY: translateY },
                      { translateY: gestureTranslateY },
                    ],
                  },
                ]}
              >
                <View style={styles.handle} />
                {children}
              </Animated.View>
            </PanGestureHandler>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
