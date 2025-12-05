import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, LogIn, UserPlus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface AuthHistory {
  id: string;
  user_id: string;
  user_email: string | null;
  event_type: string;
  created_at: string;
}

const AuthHistoryManagement = () => {
  const [history, setHistory] = useState<AuthHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("auth_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (!error && data) {
      setHistory(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Les 100 dernières activités
        </p>
        <Button variant="outline" size="sm" onClick={fetchHistory}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Actualiser
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Date & Heure</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {history.length === 0 ? (
            <TableRow>
              <TableCell colSpan={3} className="text-center text-muted-foreground">
                Aucun historique disponible
              </TableCell>
            </TableRow>
          ) : (
            history.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  {item.event_type === "signup" ? (
                    <Badge className="bg-[hsl(152_76%_40%)] hover:bg-[hsl(152_76%_35%)]">
                      <UserPlus className="w-3 h-3 mr-1" />
                      Inscription
                    </Badge>
                  ) : (
                    <Badge className="bg-[hsl(217_91%_55%)] hover:bg-[hsl(217_91%_50%)]">
                      <LogIn className="w-3 h-3 mr-1" />
                      Connexion
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {item.user_email || "Email non disponible"}
                </TableCell>
                <TableCell>
                  {format(new Date(item.created_at), "dd MMM yyyy à HH:mm", { locale: fr })}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AuthHistoryManagement;
