import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

const AdminPanel = () => {
  const [secrets, setSecrets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuth();
    fetchSecrets();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/admin/login");
      return;
    }

    // Vérifier si l'utilisateur est un admin
    const { data: adminData, error: adminError } = await supabase
      .from("admin_profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (adminError || !adminData) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits d'accès nécessaires",
        variant: "destructive",
      });
      navigate("/admin/login");
    }
  };

  const fetchSecrets = async () => {
    try {
      const { data, error } = await supabase
        .from("secrets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSecrets(data || []);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les secrets",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-white p-4">
      <Card className="w-full max-w-4xl mx-auto animate-fadeIn">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold text-primary">
            Panneau d'administration
          </CardTitle>
          <Button variant="outline" onClick={handleLogout}>
            Déconnexion
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Chargement...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Créé le</TableHead>
                  <TableHead>Type d'expiration</TableHead>
                  <TableHead>Valeur d'expiration</TableHead>
                  <TableHead>Vues</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {secrets.map((secret) => (
                  <TableRow key={secret.id}>
                    <TableCell className="font-mono">{secret.id}</TableCell>
                    <TableCell>
                      {new Date(secret.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell>{secret.expiry_type}</TableCell>
                    <TableCell>{secret.expiry_value}</TableCell>
                    <TableCell>{secret.view_count || 0}</TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          secret.is_expired
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {secret.is_expired ? "Expiré" : "Actif"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPanel;