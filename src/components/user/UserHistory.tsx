import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface Consultation {
  id: string;
  viewed_at: string;
  corriges: {
    type: string;
    annee: string;
    ues: {
      nom: string;
    };
  };
}

const UserHistory = () => {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;

      const { data } = await supabase
        .from("consultations")
        .select("*, corriges(type, annee, ues(nom))")
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(20);

      if (data) {
        setConsultations(data as any);
      }
      setLoading(false);
    };

    fetchHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>UE</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Année</TableHead>
          <TableHead>Date de consultation</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {consultations.map((consultation) => (
          <TableRow key={consultation.id}>
            <TableCell>{consultation.corriges?.ues?.nom ?? "UE supprimée"}</TableCell>
            <TableCell>{consultation.corriges?.type ?? "-"}</TableCell>
            <TableCell>{consultation.corriges?.annee ?? "-"}</TableCell>
            <TableCell>{new Date(consultation.viewed_at).toLocaleDateString()}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserHistory;
