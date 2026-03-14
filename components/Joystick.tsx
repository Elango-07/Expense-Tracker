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
  RIGHT: "Canteen",
  DOWN: "Unhappy Thing",
  LEFT: "Unnecessary Thing",
  CENTER: "Important Thing", // Default fallback is Important
};

export default function Joystick({ onSelect, selectedCategory }: JoystickProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isActive = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onStart(() => {
      isActive.value = withSpring(1);
    })
    .onUpdate((event) => {
      const distance = Math.sqrt(event.translationX ** 2 + event.translationY ** 2);
      const ratio = distance > JOYSTICK_RADIUS ? JOYSTICK_RADIUS / distance : 1;
      
      translateX.value = event.translationX * ratio;
      translateY.value = event.translationY * ratio;

      // Detection logic based on thresholds
      let selected = "";
      if (translateY.value < -40) selected = CATEGORIES.UP;
      else if (translateX.value > 40) selected = CATEGORIES.RIGHT;
      else if (translateY.value > 40) selected = CATEGORIES.DOWN;
      else if (translateX.value < -40) selected = CATEGORIES.LEFT;
      else if (distance > 20) selected = CATEGORIES.CENTER;
      
      if (selected) {
        runOnJS(onSelect)(selected);
      }
    })
    .onEnd(() => {
      // Spring back to center
      translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
      translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
      isActive.value = withSpring(0);
    });

  const animatedKnobStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: withSpring(isActive.value === 1 ? 1.15 : 1) }
    ],
    backgroundColor: interpolateColor(
      isActive.value,
      [0, 1],
      ["#6366f1", "#4f46e5"]
    ),
    shadowOpacity: withSpring(isActive.value * 0.5),
  }));

  const Label = ({ title, active, position }: { title: string, active: boolean, position: string }) => (
    <View className={`absolute ${position} items-center justify-center`}>
      <Text 
        className={`text-[9px] uppercase font-black tracking-widest ${
          active ? "text-primary scale-110" : "text-slate-700"
        }`}
      >
        {title.split(" ")[0]}
      </Text>
    </View>
  );

  return (
    <View className="items-center justify-center py-4">
      <View 
        className="bg-slate-950 rounded-full items-center justify-center border-[4px] border-slate-900 relative shadow-2xl elevation-5"
        style={{ width: JOYSTICK_RADIUS * 2.5, height: JOYSTICK_RADIUS * 2.5 }}
      >
        {/* Mechanical Guideline Ring */}
        <View className="absolute w-[80%] h-[80%] rounded-full border border-slate-800/30 border-dashed" />
        
        {/* Dynamic Static Labels */}
        <Label title="Spending" active={selectedCategory === CATEGORIES.UP} position="-top-6" />
        <Label title="Canteen" active={selectedCategory === CATEGORIES.RIGHT} position="-right-8" />
        <Label title="Unnecessary" active={selectedCategory === CATEGORIES.LEFT} position="-left-11" />
        <Label title="Unhappy" active={selectedCategory === CATEGORIES.DOWN} position="-bottom-6" />
        
        {/* Important label at center/diagonal fallback */}
        <View className="absolute z-[-1] opacity-20">
          <Text className={`text-[8px] font-bold text-slate-500 uppercase ${selectedCategory === CATEGORIES.CENTER ? "text-primary opacity-100" : ""}`}>Important Central Focus</Text>
        </View>

        <View 
          className="bg-slate-900 rounded-full items-center justify-center border border-slate-800 shadow-inner"
          style={{ width: JOYSTICK_RADIUS * 1.8, height: JOYSTICK_RADIUS * 1.8 }}
        >
          <GestureDetector gesture={gesture}>
            <Animated.View
              className="rounded-full shadow-2xl elevation-10"
              style={[
                { width: KNOB_RADIUS * 2, height: KNOB_RADIUS * 2 },
                animatedKnobStyle,
              ]}
            >
              <View className="flex-1 m-2 rounded-full border-2 border-white/5 bg-slate-100/5" />
            </Animated.View>
          </GestureDetector>
        </View>
      </View>
    </View>
  );
}

