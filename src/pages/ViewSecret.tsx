import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/PasswordInput";
import { supabase } from "@/integrations/supabase/client";
import { decryptContent } from "@/lib/encryption";
import { useToast } from "@/components/ui/use-toast";
import { Shield, Eye } from "lucide-react";

const ViewSecret = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Récupérer le secret
      const { data: secretData, error: fetchError } = await supabase
        .from("secrets")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      if (!secretData) throw new Error("Secret non trouvé");
      
      if (secretData.is_expired) {
        setError("Ce secret a expiré");
        return;
      }

      // Déchiffrer le contenu
      try {
        const decryptedContent = await decryptContent(
          secretData.encrypted_content,
          password
        );
        setSecret(decryptedContent);

        // Mettre à jour le compteur de vues uniquement si le déchiffrement a réussi
        const newViewCount = (secretData.view_count || 0) + 1;
        const { error: updateError } = await supabase
          .from("secrets")
          .update({ 
            view_count: newViewCount,
            is_expired: secretData.expiry_type === 'views' && newViewCount >= secretData.expiry_value
          })
          .eq("id", id)
          .select();

        if (updateError) {
          console.error("Erreur lors de la mise à jour du compteur:", updateError);
        }

      } catch (decryptError) {
        setError("Mot de passe incorrect");
        return;
      }
    } catch (error) {
      console.error("Erreur lors de la récupération du secret:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la récupération du secret.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-lg animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-secondary flex items-center justify-center gap-2">
            <Shield className="h-6 w-6" />
            Voir le Secret
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!secret ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary">Entrez le mot de passe</label>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  placeholder="Entrez le mot de passe du secret"
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary-hover text-secondary"
                disabled={isLoading}
              >
                <Eye className="h-4 w-4 mr-2" />
                {isLoading ? "Chargement..." : "Voir le Secret"}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-primary-light rounded-lg">
                <p className="break-all whitespace-pre-wrap text-secondary">{secret}</p>
              </div>
              <p className="text-sm text-gray-500 text-center">
                Ce secret sera détruit après avoir quitté cette page.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewSecret;