import React, { useState } from "react";
import { View, Text, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import { Link } from "expo-router";
import { PieChart, User as UserIcon, LogOut } from "lucide-react-native";
import CategoryButtons from "../components/CategoryButtons";
import ExpenseForm from "../components/ExpenseForm";
import Joystick from "../components/Joystick";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("Spending");
  const { user, signOut } = useAuth();

  const handleQuickSignIn = async () => {
    const { error } = await supabase.auth.signInAnonymously();
    if (error) Alert.alert("Error", error.message);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-1 px-4 py-8">
        
        {/* Header Section */}
        <View className="flex-row items-center justify-between mb-8">
          <View>
            <Text className="text-text-primary text-4xl font-extrabold tracking-tight">AI Tracker</Text>
            <View className="flex-row items-center mt-1">
              {user ? (
                <TouchableOpacity onPress={() => signOut()} className="flex-row items-center">
                  <Text className="text-text-secondary text-[10px] font-medium uppercase tracking-widest mr-2">
                    {user.is_anonymous ? "Guest Session" : user.email}
                  </Text>
                  <LogOut size={12} color="#94a3b8" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={handleQuickSignIn}>
                  <Text className="text-primary text-[10px] font-bold uppercase tracking-widest">
                    Tap to Sign In
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
          <Link href="/dashboard" asChild>
            <TouchableOpacity className="bg-surface p-4 rounded-2xl border border-slate-800 shadow-lg shadow-black/40">
              <PieChart size={28} color="#6366f1" />
            </TouchableOpacity>
          </Link>
        </View>

        {/* 1. TOP SECTION: Categories */}
        <View className="mb-4">
          <CategoryButtons selected={selectedCategory} />
        </View>

        {/* 2. MIDDLE SECTION: Panel */}
        <View className="mb-6">
          <ExpenseForm selectedCategory={selectedCategory} />
        </View>

        {/* 3. BOTTOM SECTION: Joystick */}
        <View className="flex-1 items-center justify-center -mt-4">
          <Joystick onSelect={setSelectedCategory} />
        </View>

      </View>
    </SafeAreaView>
  );
}
