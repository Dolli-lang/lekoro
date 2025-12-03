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
    { 
      title: "Utilisateurs", 
      value: stats.users, 
      icon: Users, 
      gradient: "from-[hsl(262_83%_58%)] to-[hsl(280_70%_65%)]",
      bgGradient: "bg-gradient-to-br from-[hsl(var(--highlight-purple))] to-card",
      iconBg: "bg-[hsl(262_83%_58%/0.15)]",
      iconColor: "text-[hsl(var(--color-purple))]"
    },
    { 
      title: "UEs", 
      value: stats.ues, 
      icon: BookOpen, 
      gradient: "from-[hsl(152_76%_40%)] to-[hsl(175_70%_41%)]",
      bgGradient: "bg-gradient-to-br from-[hsl(var(--highlight-teal))] to-card",
      iconBg: "bg-[hsl(152_76%_40%/0.15)]",
      iconColor: "text-[hsl(var(--color-green))]"
    },
    { 
      title: "Corrigés", 
      value: stats.corriges, 
      icon: FileText, 
      gradient: "from-[hsl(25_95%_53%)] to-[hsl(35_95%_55%)]",
      bgGradient: "bg-gradient-to-br from-[hsl(var(--highlight-orange))] to-card",
      iconBg: "bg-[hsl(25_95%_53%/0.15)]",
      iconColor: "text-[hsl(var(--color-orange))]"
    },
    { 
      title: "Consultations", 
      value: stats.consultations, 
      icon: Eye, 
      gradient: "from-[hsl(330_80%_55%)] to-[hsl(280_70%_65%)]",
      bgGradient: "bg-gradient-to-br from-[hsl(var(--highlight-pink))] to-card",
      iconBg: "bg-[hsl(330_80%_55%/0.15)]",
      iconColor: "text-[hsl(var(--color-pink))]"
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <Card 
          key={index} 
          className={`${stat.bgGradient} border-none shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elegant)] transition-all duration-300 hover:scale-105 hover:-translate-y-1 overflow-hidden relative group`}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
          <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2.5 rounded-xl ${stat.iconBg} transition-transform duration-300 group-hover:scale-110`}>
              <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            <div className={`h-1 w-12 mt-3 rounded-full bg-gradient-to-r ${stat.gradient}`} />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminStats;
