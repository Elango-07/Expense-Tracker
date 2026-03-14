import React from "react";
import { View, Text, ScrollView } from "react-native";
import { 
  ShoppingBag, 
  Utensils, 
  Star, 
  Trash2, 
  Frown 
} from "lucide-react-native";
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withRepeat, 
  withSequence, 
  withTiming 
} from "react-native-reanimated";

interface CategoryButtonsProps {
  selected: string;
}

const CATEGORIES_DATA = [
  { id: "Spending", icon: ShoppingBag, color: "text-blue-400", glow: "glow-spending" },
  { id: "Canteen", icon: Utensils, color: "text-green-400", glow: "glow-canteen" },
  { id: "Important Thing", icon: Star, color: "text-yellow-400", glow: "glow-important" },
  { id: "Unnecessary Thing", icon: Trash2, color: "text-red-400", glow: "glow-unnecessary" },
  { id: "Unhappy Thing", icon: Frown, color: "text-purple-400", glow: "glow-unhappy" },
];

export default function CategoryButtons({ selected }: CategoryButtonsProps) {
  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      className="flex-row py-6 px-4"
      contentContainerStyle={{ alignItems: 'center', gap: 16 }}
    >
      {CATEGORIES_DATA.map((cat) => {
        const isSelected = selected === cat.id;
        const Icon = cat.icon;
        
        return (
          <View key={cat.id} className="items-center">
            <View 
              className={`w-16 h-16 rounded-full items-center justify-center border-2 ${
                isSelected 
                  ? `border-primary bg-primary/20 ${cat.glow}` 
                  : "border-slate-800 bg-surface"
              } transition-all duration-300`}
            >
              <Icon size={28} className={cat.color} />
            </View>
            <Text 
              className={`text-[10px] mt-2 font-medium ${
                isSelected ? cat.color : "text-slate-500"
              }`}
            >
              {cat.id.split(" ")[0]}
            </Text>
          </View>
        );
      })}
    </ScrollView>
  );
}
