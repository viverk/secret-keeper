import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const SecretCounter = () => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    // Initial count
    const fetchCount = async () => {
      const { count } = await supabase
        .from("secrets")
        .select("*", { count: "exact", head: true })
        .eq("is_expired", false);
      
      setCount(count || 0);
    };

    fetchCount();

    // Subscribe to changes
    const channel = supabase
      .channel("secret_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "secrets",
        },
        async () => {
          // Refetch count on any change
          const { count } = await supabase
            .from("secrets")
            .select("*", { count: "exact", head: true })
            .eq("is_expired", false);
          
          setCount(count || 0);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="text-center text-sm text-muted-foreground">
      <p>{count} secret{count !== 1 ? 's' : ''} actuellement partagé{count !== 1 ? 's' : ''}</p>
    </div>
  );
};