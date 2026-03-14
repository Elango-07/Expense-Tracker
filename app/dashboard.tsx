import React, { useMemo } from "react";
import { View, Text, ScrollView, Dimensions, ActivityIndicator } from "react-native";
import { 
  VictoryChart, 
  VictoryLine, 
  VictoryBar, 
  VictoryPie, 
  VictoryAxis, 
  VictoryTheme, 
  VictoryArea,
  VictoryContainer
} from "victory-native";
import { TrendingUp, PieChart as PieIcon, Calendar, CheckSquare, AlertCircle, Brain, Info, List, BarChart as BarIcon } from "lucide-react-native";
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

    return last7Days.map(d => ({ x: d.day, y: d.value }));
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

    return Object.entries(categories)
      .filter(([_, data]) => data.value > 0)
      .map(([label, data]) => ({
        x: label,
        y: data.value,
        color: data.color,
        label: `${Math.round((data.value / total) * 100)}%`
      }));
  }, [expenses]);

  // 3. Process Weekly Data (Last 4 weeks)
  const weeklyData = useMemo(() => {
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

    return weeks.map((val, i) => ({ x: `Wk ${i + 1}`, y: val }));
  }, [expenses]);

  // 4. Monthly Report Data (Last 6 months)
  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        month: months[d.getMonth()],
        monthIdx: d.getMonth(),
        year: d.getFullYear(),
        y: 0
      };
    });

    expenses.forEach(exp => {
      const date = new Date(exp.created_at);
      const m = date.getMonth();
      const y = date.getFullYear();
      const found = last6Months.find(d => d.monthIdx === m && d.year === y);
      if (found) found.y += exp.amount;
    });

    return last6Months.map(d => ({ x: d.month, y: d.y }));
  }, [expenses]);

  const totalSpending = useMemo(() => 
    expenses.reduce((sum, exp) => sum + exp.amount, 0), 
  [expenses]);

  if (loading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#6366f1" />
        <Text className="text-text-secondary mt-4 font-medium italic">Scanning financial data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-background items-center justify-center px-10">
        <AlertCircle size={48} color="#ef4444" />
        <Text className="text-text-primary text-xl font-bold mt-4">System Overload</Text>
        <Text className="text-text-secondary text-center mt-2">{error}</Text>
      </View>
    );
  }

  const chartTheme = {
    axis: {
      style: {
        axis: { stroke: "#334155" },
        tickLabels: { fill: "#64748b", fontSize: 10, padding: 5 },
        grid: { stroke: "rgba(51, 65, 85, 0.3)", strokeDasharray: "4, 4" }
      }
    }
  };

  return (
    <ScrollView className="flex-1 bg-background px-5 py-8" showsVerticalScrollIndicator={false}>
      
      <View className="mb-10 items-center">
        <Text className="text-text-secondary uppercase tracking-[6px] text-xs font-black">Financial Intelligence</Text>
        <View className="h-1 w-12 bg-primary mt-2 rounded-full" />
      </View>

      {/* 1. Daily Spending Line Chart */}
      <View className="mb-10 bg-surface/40 p-6 rounded-[40px] border border-white/5 overflow-hidden">
        <View className="flex-row items-center mb-2">
          <TrendingUp size={20} color="#6366f1" />
          <Text className="text-text-primary text-lg font-bold ml-3">Daily Velocity</Text>
        </View>
        <VictoryChart width={width - 80} height={220} theme={chartTheme as any} padding={{ top: 20, bottom: 40, left: 50, right: 20 }}>
          <VictoryLine
            data={lineData}
            interpolation="monotoneX"
            style={{ data: { stroke: "#6366f1", strokeWidth: 4, strokeLinecap: "round" } }}
            animate={{ duration: 1000, onLoad: { duration: 500 } }}
          />
          <VictoryAxis />
          <VictoryAxis dependentAxis tickFormat={(x: any) => `₹${x > 999 ? (x/1000).toFixed(0) + 'k' : x}`} />
        </VictoryChart>
      </View>

      {/* 2. Category Pie Chart */}
      <View className="mb-10 bg-surface/40 p-6 rounded-[40px] border border-white/5">
        <View className="flex-row items-center mb-4">
          <PieIcon size={20} color="#10b981" />
          <Text className="text-text-primary text-lg font-bold ml-3">Sector Analysis</Text>
        </View>
        {pieData.length > 0 ? (
          <View className="items-center">
            <VictoryPie
              data={pieData}
              innerRadius={70}
              width={width - 80}
              height={280}
              colorScale={pieData.map(d => d.color)}
              labelRadius={100}
              padAngle={2}
              style={{
                labels: { fill: "#fff", fontSize: 12, fontWeight: "bold" },
              }}
              animate={{ duration: 1000 }}
            />
            <View className="flex-row flex-wrap justify-center mt-4">
              {pieData.map((item, idx) => (
                <View key={idx} className="flex-row items-center mx-3 mb-2">
                  <View className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                  <Text className="text-text-secondary text-[10px] font-bold uppercase">{item.x}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View className="py-20 items-center">
            <Text className="text-slate-600 font-medium lowercase tracking-widest">No spectral data detected</Text>
          </View>
        )}
      </View>

      {/* 4. Monthly Report (Area Chart) */}
      <View className="mb-10 bg-surface/40 p-6 rounded-[40px] border border-white/5">
        <View className="flex-row items-center mb-2">
          <BarIcon size={20} color="#8b5cf6" />
          <Text className="text-text-primary text-lg font-bold ml-3">Monthly Trajectory</Text>
        </View>
        <VictoryChart width={width - 80} height={220} theme={chartTheme as any} padding={{ top: 20, bottom: 40, left: 50, right: 20 }}>
          <VictoryArea
            data={monthlyData}
            interpolation="cardinal"
            style={{ 
              data: { 
                fill: "rgba(139, 92, 246, 0.2)", 
                stroke: "#8b5cf6", 
                strokeWidth: 3 
              } 
            }}
            animate={{ duration: 1500 }}
          />
          <VictoryAxis />
          <VictoryAxis dependentAxis tickFormat={(x: any) => `₹${x > 999 ? (x/1000).toFixed(0) + 'k' : x}`} />
        </VictoryChart>
      </View>

      {/* 3. Weekly Spending Chart (Bar Chart) */}
      <View className="mb-10 bg-surface/40 p-6 rounded-[40px] border border-white/5">
        <View className="flex-row items-center mb-2">
          <Calendar size={20} color="#f59e0b" />
          <Text className="text-text-primary text-lg font-bold ml-3">Weekly Quotas</Text>
        </View>
        <VictoryChart 
          domainPadding={25}
          width={width - 80} 
          height={220} 
          theme={chartTheme as any}
          padding={{ top: 20, bottom: 40, left: 50, right: 20 }}
        >
          <VictoryBar
            data={weeklyData}
            style={{ 
              data: { 
                fill: "#f59e0b", 
                width: 25,
                borderRadius: 6 
              } 
            }}
            animate={{ duration: 1000, onLoad: { duration: 500 } }}
          />
          <VictoryAxis />
          <VictoryAxis dependentAxis tickFormat={(x: any) => `₹${x > 999 ? (x/1000).toFixed(0) + 'k' : x}`} />
        </VictoryChart>
      </View>

      {/* AI Insights Section */}
      <View className="mb-10 bg-indigo-900/40 p-8 rounded-[40px] border border-indigo-500/30">
        <View className="flex-row items-center mb-4">
          <View className="p-2 bg-indigo-500/20 rounded-xl">
             <Brain size={20} color="#818cf8" />
          </View>
          <Text className="text-indigo-200 text-xl font-bold ml-4">Neural Advisor</Text>
        </View>
        <Text className="text-indigo-100 text-sm leading-relaxed font-medium opacity-90">
          {totalSpending > 15000 
            ? "CRITICAL: Liquidity is decreasing rapidly. High-intensity 'Unnecessary' spending detected. Calibration required."
            : totalSpending > 5000 
            ? "STABLE: Financial velocity optimal. Sector allocation balanced. Recommend maintaining current trajectory."
            : "OPTIMAL: Minimal drainage detected. Perfect environment for capital accumulation."}
        </Text>
        <View className="mt-6 pt-4 border-t border-indigo-500/20 flex-row items-center">
          <Info size={14} color="#818cf8" />
          <Text className="text-indigo-400 text-[9px] ml-2 font-black uppercase tracking-[3px]">Secure Analysis AI</Text>
        </View>
      </View>

      <View className="mb-20 bg-slate-900/40 p-8 rounded-[40px] border border-white/5">
        <View className="flex-row items-center justify-between mb-8">
          <View className="flex-row items-center">
            <List size={20} color="#64748b" />
            <Text className="text-text-primary text-lg font-bold ml-3">Data Stream</Text>
          </View>
          <View className="bg-slate-800 px-3 py-1 rounded-full">
            <Text className="text-slate-400 text-[8px] font-black uppercase">Recent Logs</Text>
          </View>
        </View>
        
        {expenses.slice(0, 5).map((exp) => (
          <View key={exp.id} className="flex-row items-center justify-between py-5 border-b border-white/5">
            <View>
              <Text className="text-slate-200 font-bold text-sm tracking-tight">{exp.category}</Text>
              <Text className="text-slate-500 text-[10px] uppercase font-black tracking-widest mt-1">{new Date(exp.created_at).toLocaleDateString()}</Text>
            </View>
            <View className="items-end">
              <Text className="text-white font-black text-lg">₹{exp.amount.toLocaleString()}</Text>
            </View>
          </View>
        ))}
        {expenses.length === 0 && (
          <Text className="text-slate-600 text-center py-10 italic">No data records found in the stack</Text>
        )}
      </View>

    </ScrollView>
  );
}

