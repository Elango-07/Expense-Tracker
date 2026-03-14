import React, { useMemo } from "react";
import { View, Text, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { LineChart, BarChart, PieChart } from "react-native-gifted-charts";
import { TrendingUp, PieChart as PieIcon, Calendar, CheckSquare, AlertCircle, Brain, Info, List } from "lucide-react-native";
import { useExpenses, Expense } from "../hooks/useExpenses";

const { width } = Dimensions.get("window");

export default function Analytics() {
  const { expenses, loading, error } = useExpenses();

  // 1. Process Daily Spending Data (Last 7 days)
  const lineData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { 
        day: days[d.getDay()], 
        dateStr: d.toISOString().split('T')[0],
        value: 0 
      };
    });

    expenses.forEach(exp => {
      const expDate = exp.created_at.split('T')[0];
      const found = last7Days.find(d => d.dateStr === expDate);
      if (found) found.value += exp.amount;
    });

    return last7Days.map(d => ({ value: d.value, label: d.day }));
  }, [expenses]);

  // 2. Process Category Analysis Data
  const pieData = useMemo(() => {
    const categories: Record<string, { value: number, color: string }> = {
      'Spending': { value: 0, color: '#3b82f6' },
      'Canteen': { value: 0, color: '#10b981' },
      'Important Thing': { value: 0, color: '#f59e0b' },
      'Unnecessary Thing': { value: 0, color: '#ef4444' },
      'Unhappy Thing': { value: 0, color: '#8b5cf6' },
    };

    let total = 0;
    expenses.forEach(exp => {
      if (categories[exp.category]) {
        categories[exp.category].value += exp.amount;
        total += exp.amount;
      }
    });

    if (total === 0) return [];

    return Object.entries(categories).map(([label, data]) => ({
      value: data.value,
      color: data.color,
      label,
      text: `${Math.round((data.value / total) * 100)}%`
    })).filter(d => d.value > 0);
  }, [expenses]);

  // 3. Process Weekly Data (Last 4 weeks)
  const barData = useMemo(() => {
    const weeks = [0, 0, 0, 0];
    const now = new Date();
    
    expenses.forEach(exp => {
      const expDate = new Date(exp.created_at);
      const diffTime = Math.abs(now.getTime() - expDate.getTime());
      const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
      if (diffWeeks < 4) {
        weeks[3 - diffWeeks] += exp.amount;
      }
    });

    return weeks.map((val, i) => ({ value: val, label: `Wk ${i + 1}` }));
  }, [expenses]);

  const totalSpending = useMemo(() => 
    expenses.reduce((sum, exp) => sum + exp.amount, 0), 
  [expenses]);

  if (loading) {
    return (
      <View className="flex-1 bg-[#0f172a] items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="text-slate-400 mt-4 font-medium">Loading analytics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-[#0f172a] items-center justify-center px-10">
        <AlertCircle size={48} color="#ef4444" />
        <Text className="text-white text-xl font-bold mt-4">Error</Text>
        <Text className="text-slate-400 text-center mt-2">{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#0f172a] px-5 py-8">
      
      {/* 1. Daily Spending Line Chart */}
      <View className="mb-10 bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
        <View className="flex-row items-center mb-6">
          <TrendingUp size={24} color="#6366f1" />
          <Text className="text-white text-xl font-bold ml-3">Daily Spending</Text>
        </View>
        <LineChart
          data={lineData}
          width={width - 100}
          height={200}
          color="#6366f1"
          thickness={4}
          startFillColor="rgba(99, 102, 241, 0.4)"
          endFillColor="rgba(99, 102, 241, 0.01)"
          startOpacity={1}
          endOpacity={0}
          noOfSections={4}
          yAxisTextStyle={{ color: '#94a3b8' }}
          xAxisLabelTextStyle={{ color: '#94a3b8' }}
          hideDataPoints={false}
          dataPointsColor="#f8fafc"
          curved
        />
      </View>

      {/* 2. Category Pie Chart */}
      <View className="mb-10 bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
        <View className="flex-row items-center mb-8">
          <PieIcon size={24} color="#10b981" />
          <Text className="text-white text-xl font-bold ml-3">Category Analysis</Text>
        </View>
        {pieData.length > 0 ? (
          <>
            <View className="items-center mb-6">
              <PieChart
                data={pieData}
                donut
                sectionAutoFocus
                radius={85}
                innerRadius={55}
                innerCircleColor={'#1e293b'}
                centerLabelComponent={() => (
                  <View className="items-center">
                    <Text className="text-lg font-bold text-white">₹{totalSpending > 1000 ? (totalSpending/1000).toFixed(1) + 'k' : totalSpending}</Text>
                    <Text className="text-slate-400 text-[10px]">Total</Text>
                  </View>
                )}
              />
            </View>
            <View className="flex-row flex-wrap justify-between">
              {pieData.map((item: any, idx) => (
                <View key={idx} className="flex-row items-center w-[45%] mb-4">
                  <View className="w-4 h-4 rounded-full mr-3" style={{ backgroundColor: item.color }} />
                  <Text className="text-slate-300 text-xs" numberOfLines={1}>{item.label}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View className="py-10 items-center">
            <Text className="text-slate-500">No data for category analysis</Text>
          </View>
        )}
      </View>

      {/* 3. Weekly Spending Chart */}
      <View className="mb-10 bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
        <View className="flex-row items-center mb-6">
          <Calendar size={24} color="#f59e0b" />
          <Text className="text-white text-xl font-bold ml-3">Weekly Totals (₹)</Text>
        </View>
        <BarChart
          data={barData}
          width={width - 100}
          height={200}
          barWidth={40}
          frontColor="#f59e0b"
          roundedTop
          noOfSections={4}
          yAxisTextStyle={{ color: '#94a3b8' }}
          xAxisLabelTextStyle={{ color: '#94a3b8' }}
          barBorderRadius={8}
        />
      </View>

      {/* 4. AI Insights Section */}
      <View className="mb-10 bg-indigo-900/40 p-6 rounded-3xl border border-indigo-500/30">
        <View className="flex-row items-center mb-4">
          <Brain size={24} color="#818cf8" />
          <Text className="text-indigo-200 text-xl font-bold ml-3">AI Insights</Text>
        </View>
        <Text className="text-indigo-100 text-sm leading-relaxed italic">
          {totalSpending > 15000 
            ? "Your spending is reaching high levels this month. Consider reducing 'Unnecessary' expenses to stay within budget."
            : totalSpending > 5000 
            ? "You're doing great! Your 'Important' spending is balanced. Maybe allocate some towards savings?"
            : "Low spending detected. A perfect time to plan for your future goals!"}
        </Text>
        <View className="mt-4 bg-indigo-500/20 p-3 rounded-xl flex-row items-center">
          <Info size={16} color="#818cf8" />
          <Text className="text-indigo-300 text-[10px] ml-2 font-medium uppercase tracking-tighter">AI Advisory Activated</Text>
        </View>
      </View>

      {/* 5. Recent Transactions List */}
      <View className="mb-14 bg-slate-900/50 p-6 rounded-3xl border border-slate-800">
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <List size={22} color="#94a3b8" />
            <Text className="text-white text-xl font-bold ml-3">Recent Items</Text>
          </View>
          <Text className="text-slate-500 text-xs">Latest 5</Text>
        </View>
        
        {expenses.slice(0, 5).map((exp) => (
          <View key={exp.id} className="flex-row items-center justify-between py-4 border-b border-slate-800/50">
            <View>
              <Text className="text-slate-200 font-bold">{exp.category}</Text>
              <Text className="text-slate-500 text-xs">{new Date(exp.created_at).toLocaleDateString()}</Text>
            </View>
            <Text className="text-white font-extrabold text-lg">₹{exp.amount}</Text>
          </View>
        ))}
        {expenses.length === 0 && (
          <Text className="text-slate-500 text-center py-4">No transactions found</Text>
        )}
      </View>

      {/* 6. Budget Usage Progress Chart (Dynamic) */}
      <View className="mb-14 bg-slate-900/50 p-8 rounded-3xl border border-slate-800">
        <View className="flex-row items-center mb-6 justify-between">
          <View className="flex-row items-center">
            <CheckSquare size={24} color="#ec4899" />
            <Text className="text-white text-xl font-bold ml-3">Budget Progress</Text>
          </View>
          <Text className="text-pink-400 font-bold">
            {Math.min(Math.round((totalSpending / 20000) * 100), 100)}% Used
          </Text>
        </View>
        <View className="h-6 bg-slate-800 rounded-full overflow-hidden">
          <View 
            className="h-full bg-pink-500 shadow-lg shadow-pink-500/50" 
            style={{ width: `${Math.min((totalSpending / 20000) * 100, 100)}%` }}
          />
        </View>
        <View className="flex-row justify-between mt-4">
          <Text className="text-slate-500">₹ {totalSpending.toLocaleString()} spent</Text>
          <Text className="text-slate-500">₹ 20,000 budget</Text>
        </View>
      </View>

    </ScrollView>
  );
}

