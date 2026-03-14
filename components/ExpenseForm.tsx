import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";

interface ExpenseFormProps {
  selectedCategory: string;
}

export default function ExpenseForm({ selectedCategory }: ExpenseFormProps) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSave = async () => {
    if (!user) {
      Alert.alert("Authentication required", "Please sign in to save expenses.");
      return;
    }

    if (!amount || isNaN(parseFloat(amount))) {
      Alert.alert("Invalid input", "Please enter a valid amount.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("expenses").insert([
        {
          category: selectedCategory,
          amount: parseFloat(amount),
          description,
          user_id: user.id,
        },
      ]);

      if (error) throw error;

      Alert.alert("Success", "Expense saved successfully!");
      setAmount("");
      setDescription("");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to save expense.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="bg-surface rounded-3xl p-6 mx-4 mb-2 shadow-2xl shadow-black/80">
      <View className="flex-row items-center border-b border-primary/20 pb-4 mb-6">
        <Text className="text-text-secondary text-base">Selected: </Text>
        <Text className="text-primary text-xl font-bold">{selectedCategory || "None"}</Text>
      </View>

      <View className="mb-6">
        <Text className="text-text-secondary mb-2 font-medium">Amount (₹)</Text>
        <TextInput 
          className="bg-surface-light text-text-primary px-4 py-4 rounded-xl text-2xl font-bold border border-slate-700"
          placeholder="0.00"
          placeholderTextColor="#475569"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      <View className="mb-8">
        <Text className="text-text-secondary mb-2 font-medium">Description</Text>
        <TextInput 
          className="bg-surface-light text-text-primary px-4 py-4 rounded-xl text-lg border border-slate-700"
          placeholder="What did you buy?"
          placeholderTextColor="#475569"
          multiline
          numberOfLines={1}
          value={description}
          onChangeText={setDescription}
        />
      </View>

      <TouchableOpacity 
        className={`bg-primary h-16 rounded-2xl items-center justify-center flex-row shadow-lg shadow-primary/40 ${
          loading ? "opacity-50" : ""
        }`}
        onPress={handleSave}
        disabled={loading}
      >
        <Text className="text-white text-lg font-bold">
          {loading ? "Saving..." : "Save Expense"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
