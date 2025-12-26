
import React from 'react';
import { Modal, StyleSheet, Dimensions, TouchableWithoutFeedback, View } from 'react-native';
import { useLuciaAI } from '../../contexts/LuciaAIContext';
import LuciaAIMiniView from './LuciaAIMiniView';
import LuciaAIFullView from './LuciaAIFullView';

const { height } = Dimensions.get('window');

export default function LuciaAIContainer() {
  const { isVisible, isExpanded, hideLucia } = useLuciaAI();

  if (!isVisible) return null;

  if (isExpanded) {
    return (
      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={hideLucia}
      >
        <LuciaAIFullView />
      </Modal>
    );
  }

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={hideLucia}
    >
      <TouchableWithoutFeedback onPress={hideLucia}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.miniContainer}>
              <LuciaAIMiniView />
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  miniContainer: {
    maxHeight: height * 0.5,
  },
});
