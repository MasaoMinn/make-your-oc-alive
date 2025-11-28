// lib/userService.ts
import { supabase } from "@/utils/supabase";

export async function findUserByName(name: string) {
  try {
    const user = await supabase.from("users").select("*").eq("name", name).single();
    if (user.error || !user.data) {
      return {
        msg: user.error?.message || "User not found",
        data: null
      };
    }
    return {
      msg: "User found",
      data: user.data
    };
  } catch (error) {
    return {
      msg: error instanceof Error ? error.message : "Unknown error",
      data: null
    };
  }
}
