import { useEffect, useState } from "react";
import { getAdminWhatsAppNumber } from "@/src/services/adminSettingsService";

export function useAdminWhatsApp() {
  const [number, setNumber] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const result = await getAdminWhatsAppNumber();
      if (mounted) {
        setNumber(result);
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  return { number, loading };
}
