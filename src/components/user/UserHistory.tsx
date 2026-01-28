import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";

interface Consultation {
  id: string;
  viewed_at: string;
  corriges: {
    id: string;
    ue_id: string;
    exercice_id: string | null;
    ues: {
      nom: string;
    } | null;
    exercices: {
      type: string;
      annee: string;
      numero: number;
    } | null;
  } | null;
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
        .select("id, viewed_at, corriges(id, ue_id, exercice_id, ues(nom), exercices(type, annee, numero))")
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(50);

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

  if (consultations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Aucune consultation récente.</p>
        <p className="text-sm mt-2">Vos corrigés consultés apparaîtront ici.</p>
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
          <TableHead>Exercice</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {consultations.map((consultation) => (
          <TableRow key={consultation.id}>
            <TableCell className="font-medium">{consultation.corriges?.ues?.nom ?? "UE supprimée"}</TableCell>
            <TableCell>{consultation.corriges?.exercices?.type ?? "-"}</TableCell>
            <TableCell>{consultation.corriges?.exercices?.annee ?? "-"}</TableCell>
            <TableCell>
              {consultation.corriges?.exercices?.numero 
                ? `Exercice ${consultation.corriges.exercices.numero}` 
                : "-"}
            </TableCell>
            <TableCell>{new Date(consultation.viewed_at).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserHistory;
