import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, BookOpen, FileText, Eye } from "lucide-react";

const AdminStats = () => {
  const [stats, setStats] = useState({
    users: 0,
    ues: 0,
    corriges: 0,
    consultations: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const [usersRes, uesRes, corrigesRes, consultationsRes] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("ues").select("*", { count: "exact", head: true }),
        supabase.from("corriges").select("*", { count: "exact", head: true }),
        supabase.from("consultations").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        users: usersRes.count || 0,
        ues: uesRes.count || 0,
        corriges: corrigesRes.count || 0,
        consultations: consultationsRes.count || 0,
      });
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: "Utilisateurs", value: stats.users, icon: Users, color: "text-blue-500" },
    { title: "UEs", value: stats.ues, icon: BookOpen, color: "text-green-500" },
    { title: "Corrigés", value: stats.corriges, icon: FileText, color: "text-orange-500" },
    { title: "Consultations", value: stats.consultations, icon: Eye, color: "text-purple-500" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminStats;
