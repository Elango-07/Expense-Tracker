import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export interface Expense {
  id: string;
  created_at: string;
  category: string;
  amount: number;
  description: string;
  user_id: string;
}

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setExpenses(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();

    // Set up real-time subscription
    const subscription = supabase
      .channel("expenses_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setExpenses((prev) => [payload.new as Expense, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setExpenses((prev) => prev.filter((e) => e.id !== payload.old.id));
          } else if (payload.eventType === "UPDATE") {
            setExpenses((prev) =>
              prev.map((e) => (e.id === payload.new.id ? (payload.new as Expense) : e))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  return { expenses, loading, error, refresh: fetchExpenses };
}
