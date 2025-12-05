import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const signUpSchema = z.object({
  fullName: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères").max(100),
  email: z.string().trim().email("Email invalide").max(255),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").max(100),
  ufrId: z.string().min(1, "Veuillez sélectionner un UFR"),
  departementId: z.string().min(1, "Veuillez sélectionner un département"),
});

const signInSchema = z.object({
  email: z.string().trim().email("Email invalide").max(255),
  password: z.string().min(1, "Mot de passe requis"),
});

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "login";
  const [activeTab, setActiveTab] = useState(mode === "signup" ? "signup" : "login");
  
  const [signUpData, setSignUpData] = useState({ fullName: "", email: "", password: "", ufrId: "", departementId: "" });
  const [signInData, setSignInData] = useState({ email: "", password: "" });
  const [resetEmail, setResetEmail] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showNewPasswordForm, setShowNewPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showEmailConfirmation, setShowEmailConfirmation] = useState(false);
  const [ufrs, setUfrs] = useState<Array<{ id: string; nom: string }>>([]);
  const [departements, setDepartements] = useState<Array<{ id: string; nom: string }>>([]);
  
  const { user, isAdmin, signUp, signIn, resetPassword, updatePassword } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUfrs = async () => {
      const { data } = await supabase.from("ufrs").select("id, nom").eq("visible", true);
      if (data) setUfrs(data);
    };
    fetchUfrs();
  }, []);

  useEffect(() => {
    const fetchDepartements = async () => {
      if (signUpData.ufrId) {
        const { data } = await supabase
          .from("departements")
          .select("id, nom")
          .eq("ufr_id", signUpData.ufrId)
          .eq("visible", true);
        if (data) {
          setDepartements(data);
        } else {
          setDepartements([]);
        }
      } else {
        setDepartements([]);
        setSignUpData({ ...signUpData, departementId: "" });
      }
    };
    fetchDepartements();
  }, [signUpData.ufrId]);

  useEffect(() => {
    // Check for password recovery mode first
    const isRecoveryMode = window.location.hash.includes("type=recovery");
    
    if (isRecoveryMode) {
      setActiveTab("login");
      setShowResetPassword(false);
      setShowNewPasswordForm(true);
      // Clear the hash to prevent issues on refresh
      window.history.replaceState(null, "", window.location.pathname);
      return; // Don't redirect, show the new password form
    }

    // Only redirect if not in recovery mode
    if (user && !showNewPasswordForm) {
      if (isAdmin) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, isAdmin, navigate, showNewPasswordForm]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      signUpSchema.parse(signUpData);
      setLoading(true);
      const { error } = await signUp(signUpData.email, signUpData.password, signUpData.fullName, signUpData.ufrId, signUpData.departementId);
      if (!error) {
        setShowEmailConfirmation(true);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) newErrors[err.path[0] as string] = err.message;
        });
        setErrors(newErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      signInSchema.parse(signInData);
      setLoading(true);
      const { error } = await signIn(signInData.email, signInData.password);
      
      // Log the login event if successful
      if (!error) {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session?.user) {
          await supabase.from("auth_history").insert({
            user_id: sessionData.session.user.id,
            user_email: sessionData.session.user.email,
            event_type: "login"
          });
        }
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) newErrors[err.path[0] as string] = err.message;
        });
        setErrors(newErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const emailSchema = z.string().email("Email invalide");
      emailSchema.parse(resetEmail);
      setLoading(true);
      await resetPassword(resetEmail);
      setShowResetPassword(false);
      setResetEmail("");
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ email: error.errors[0].message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center py-12 px-4 bg-secondary/20">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Le Koro</CardTitle>
            <CardDescription className="text-center">
              Accédez à votre espace personnel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Connexion</TabsTrigger>
                <TabsTrigger value="signup">Inscription</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                {showNewPasswordForm ? (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      setErrors({});

                      try {
                        const passwordSchema = z
                          .string()
                          .min(6, "Le mot de passe doit contenir au moins 6 caractères");
                        passwordSchema.parse(newPassword);
                        setLoading(true);

                        const { error } = await updatePassword(newPassword);
                        if (!error) {
                          setShowNewPasswordForm(false);
                          setNewPassword("");
                          navigate("/dashboard");
                        }
                      } catch (error) {
                        if (error instanceof z.ZodError) {
                          setErrors({ newPassword: error.errors[0].message });
                        }
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="new-password">Nouveau mot de passe</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={loading}
                      />
                      {errors.newPassword && (
                        <p className="text-sm text-destructive">{errors.newPassword}</p>
                      )}
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Mise à jour..." : "Mettre à jour le mot de passe"}
                    </Button>
                  </form>
                ) : showResetPassword ? (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="votre@email.com"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        disabled={loading}
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Envoi..." : "Réinitialiser le mot de passe"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full"
                      onClick={() => {
                        setShowResetPassword(false);
                        setResetEmail("");
                        setErrors({});
                      }}
                    >
                      Retour à la connexion
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="votre@email.com"
                        value={signInData.email}
                        onChange={(e) =>
                          setSignInData({ ...signInData, email: e.target.value })
                        }
                        disabled={loading}
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="login-password">Mot de passe</Label>
                        <button
                          type="button"
                          onClick={() => setShowResetPassword(true)}
                          className="text-sm text-primary hover:underline"
                        >
                          Mot de passe oublié ?
                        </button>
                      </div>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={signInData.password}
                        onChange={(e) =>
                          setSignInData({ ...signInData, password: e.target.value })
                        }
                        disabled={loading}
                      />
                      {errors.password && (
                        <p className="text-sm text-destructive">{errors.password}</p>
                      )}
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Connexion..." : "Se connecter"}
                    </Button>
                  </form>
                )}
              </TabsContent>
              
              <TabsContent value="signup">
                {showEmailConfirmation ? (
                  <div className="text-center space-y-4 py-6">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                      <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold">Vérifiez votre email</h3>
                    <p className="text-muted-foreground">
                      Un email de confirmation a été envoyé à <strong>{signUpData.email}</strong>.
                      <br />
                      Veuillez cliquer sur le lien dans l'email pour activer votre compte.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowEmailConfirmation(false);
                        setActiveTab("login");
                      }}
                      className="mt-4"
                    >
                      Retour à la connexion
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Nom complet</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Jean Dupont"
                        value={signUpData.fullName}
                        onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                        disabled={loading}
                      />
                      {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-ufr">UFR</Label>
                      <Select
                        value={signUpData.ufrId}
                        onValueChange={(value) => setSignUpData({ ...signUpData, ufrId: value, departementId: "" })}
                        disabled={loading}
                      >
                        <SelectTrigger id="signup-ufr">
                          <SelectValue placeholder="Sélectionnez votre UFR" />
                        </SelectTrigger>
                        <SelectContent>
                          {ufrs.map((ufr) => (
                            <SelectItem key={ufr.id} value={ufr.id}>
                              {ufr.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.ufrId && <p className="text-sm text-destructive">{errors.ufrId}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-departement">Faculté / Département</Label>
                      <Select
                        value={signUpData.departementId}
                        onValueChange={(value) => setSignUpData({ ...signUpData, departementId: value })}
                        disabled={loading || !signUpData.ufrId}
                      >
                        <SelectTrigger id="signup-departement">
                          <SelectValue placeholder="Sélectionnez votre faculté" />
                        </SelectTrigger>
                        <SelectContent>
                          {departements.map((dept) => (
                            <SelectItem key={dept.id} value={dept.id}>
                              {dept.nom}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.departementId && <p className="text-sm text-destructive">{errors.departementId}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="votre@email.com"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                        disabled={loading}
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Mot de passe</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        disabled={loading}
                      />
                      {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? "Inscription..." : "S'inscrire"}
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default Auth;