import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface Restaurant {
  id: string;
  owner_user_id: string;
  name: string;
  city: string | null;
  currency: string;
  target_margin_percent: number;
}

export const useRestaurant = () => {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchRestaurant = async () => {
    if (!user) { setLoading(false); return; }
    const { data } = await supabase
      .from("restaurants")
      .select("*")
      .eq("owner_user_id", user.id)
      .maybeSingle();
    setRestaurant(data as Restaurant | null);
    setLoading(false);
  };

  useEffect(() => {
    fetchRestaurant();
  }, [user]);

  const createRestaurant = async (values: { name: string; city: string; currency: string; target_margin_percent: number }) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("restaurants")
      .insert({ ...values, owner_user_id: user.id })
      .select()
      .single();
    if (error) throw error;
    setRestaurant(data as Restaurant);
    return data as Restaurant;
  };

  const updateRestaurant = async (values: Partial<Restaurant>) => {
    if (!restaurant) return;
    const { data, error } = await supabase
      .from("restaurants")
      .update(values)
      .eq("id", restaurant.id)
      .select()
      .single();
    if (error) throw error;
    setRestaurant(data as Restaurant);
  };

  return { restaurant, loading, createRestaurant, updateRestaurant, refetch: fetchRestaurant };
};
