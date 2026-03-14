import React, { useState } from "react";
import { View, Dimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const JOYSTICK_RADIUS = 100;
const KNOB_RADIUS = 40;

interface JoystickProps {
  onSelect: (category: string) => void;
}

const CATEGORIES = {
  UP: "Spending",
  RIGHT: "Canteen",
  DOWN: "Unhappy Thing",
  LEFT: "Unnecessary Thing",
  DIAGONAL_UP_RIGHT: "Important Thing",
};

export default function Joystick({ onSelect }: JoystickProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onUpdate((event) => {
      const distance = Math.sqrt(event.translationX ** 2 + event.translationY ** 2);
      const ratio = Math.min(distance, JOYSTICK_RADIUS) / distance;
      
      translateX.value = event.translationX * ratio;
      translateY.value = event.translationY * ratio;

      // Detection logic
      let selected = "";
      const angle = Math.atan2(translateY.value, translateX.value) * (180 / Math.PI);
      
      // Map angle to categories
      // -180 to 180
      // Right is around 0
      // Down is around 90
      // Left is around 180 or -180
      // Up is around -90

      if (distance > 40) {
        if (angle > -110 && angle < -70) selected = CATEGORIES.UP;
        else if (angle > -20 && angle < 20) selected = CATEGORIES.RIGHT;
        else if (angle > 70 && angle < 110) selected = CATEGORIES.DOWN;
        else if (angle < -160 || angle > 160) selected = CATEGORIES.LEFT;
        else if (angle > -60 && angle < -30) selected = CATEGORIES.DIAGONAL_UP_RIGHT;
        
        if (selected) {
          runOnJS(onSelect)(selected);
        }
      }
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
    });

  const animatedKnobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <View className="items-center justify-center py-10">
      <View 
        className="bg-surface-light rounded-full items-center justify-center border-2 border-slate-700"
        style={{ width: JOYSTICK_RADIUS * 2, height: JOYSTICK_RADIUS * 2 }}
      >
        <GestureDetector gesture={gesture}>
          <Animated.View
            className="bg-primary rounded-full shadow-lg shadow-primary/50"
            style={[
              { width: KNOB_RADIUS * 2, height: KNOB_RADIUS * 2 },
              animatedKnobStyle,
            ]}
          />
        </GestureDetector>
      </View>
    </View>
  );
}
