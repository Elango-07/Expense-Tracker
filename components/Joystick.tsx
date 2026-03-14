import React, { useState } from "react";
import { View, Dimensions, Text } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
  interpolateColor,
  useDerivedValue,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const JOYSTICK_RADIUS = 90;
const KNOB_RADIUS = 35;

interface JoystickProps {
  onSelect: (category: string) => void;
  selectedCategory: string;
}

const CATEGORIES = {
  UP: "Spending",
  LEFT: "Unnecessary Thing",
  RIGHT: "Canteen",
  DOWN_LEFT: "Important Thing",
  DOWN_RIGHT: "Unhappy Thing",
};

export default function Joystick({ onSelect, selectedCategory }: JoystickProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isActive = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onStart(() => {
      isActive.value = 1;
    })
    .onUpdate((event) => {
      const distance = Math.sqrt(event.translationX ** 2 + event.translationY ** 2);
      const ratio = distance > JOYSTICK_RADIUS ? JOYSTICK_RADIUS / distance : 1;
      
      translateX.value = event.translationX * ratio;
      translateY.value = event.translationY * ratio;

      // Detection logic
      let selected = "";
      const angle = Math.atan2(translateY.value, translateX.value) * (180 / Math.PI);
      
      if (distance > 30) {
        // Up: -110 to -70
        if (angle > -120 && angle < -60) selected = CATEGORIES.UP;
        // Right: -30 to 30
        else if (angle > -30 && angle < 30) selected = CATEGORIES.RIGHT;
        // Left: 150 to -150
        else if (angle > 150 || angle < -150) selected = CATEGORIES.LEFT;
        // Down-Right: 30 to 80
        else if (angle >= 30 && angle <= 90) selected = CATEGORIES.DOWN_RIGHT;
        // Down-Left: 90 to 150
        else if (angle < 150 && angle > 90) selected = CATEGORIES.DOWN_LEFT;
        
        if (selected) {
          runOnJS(onSelect)(selected);
        }
      }
    })
    .onEnd(() => {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      isActive.value = withSpring(0);
    });

  const animatedKnobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
    backgroundColor: interpolateColor(
      isActive.value,
      [0, 1],
      ["#6366f1", "#818cf8"]
    ),
    borderWidth: withSpring(isActive.value * 2),
    borderColor: "rgba(255,255,255,0.5)",
  }));

  const Label = ({ title, active, position }: { title: string, active: boolean, position: string }) => (
    <View className={`absolute ${position} items-center justify-center`}>
      <Text 
        className={`text-[10px] uppercase font-black tracking-tighter ${
          active ? "text-primary scale-125" : "text-slate-600"
        } transition-all duration-200`}
      >
        {title.split(" ")[0]}
      </Text>
      {active && <View className="w-1 h-1 rounded-full bg-primary mt-1 shadow-glow" />}
    </View>
  );

  return (
    <View className="items-center justify-center py-6">
      <View 
        className="bg-slate-900/50 rounded-full items-center justify-center border-2 border-slate-800 relative shadow-inner"
        style={{ width: JOYSTICK_RADIUS * 2.5, height: JOYSTICK_RADIUS * 2.5 }}
      >
        {/* Connection Lines (Gaming Style) */}
        <View className="absolute w-[1px] h-full bg-slate-800/30" />
        <View className="absolute h-[1px] w-full bg-slate-800/30" />
        
        {/* Labels around the stick */}
        <Label title="Spending" active={selectedCategory === CATEGORIES.UP} position="-top-6" />
        <Label title="Canteen" active={selectedCategory === CATEGORIES.RIGHT} position="-right-8" />
        <Label title="Unnecessary" active={selectedCategory === CATEGORIES.LEFT} position="-left-10" />
        <Label title="Important" active={selectedCategory === CATEGORIES.DOWN_LEFT} position="-bottom-4 left-0" />
        <Label title="Unhappy" active={selectedCategory === CATEGORIES.DOWN_RIGHT} position="-bottom-4 right-0" />

        <View 
          className="bg-surface-light rounded-full items-center justify-center border border-slate-700"
          style={{ width: JOYSTICK_RADIUS * 1.8, height: JOYSTICK_RADIUS * 1.8 }}
        >
          <GestureDetector gesture={gesture}>
            <Animated.View
              className="rounded-full shadow-2xl shadow-primary/60"
              style={[
                { width: KNOB_RADIUS * 2, height: KNOB_RADIUS * 2 },
                animatedKnobStyle,
              ]}
            >
              {/* Inner Circle for tactile feel */}
              <View className="flex-1 m-2 rounded-full bg-white/10 border border-white/5" />
            </Animated.View>
          </GestureDetector>
        </View>
      </View>
    </View>
  );
}

