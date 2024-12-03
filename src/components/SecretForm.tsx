import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { PasswordInput } from "./PasswordInput";
import { ExpirySelector } from "./ExpirySelector";
import { Copy, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { encryptContent } from "@/lib/encryption";

export const SecretForm = () => {
  const [secret, setSecret] = useState("");
  const [password, setPassword] = useState("");
  const [expiryType, setExpiryType] = useState<"time" | "views">("time");
  const [expiryValue, setExpiryValue] = useState(15);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const encryptedContent = await encryptContent(secret, password);

      const { data, error } = await supabase
        .from("secrets")
        .insert([
          {
            encrypted_content: encryptedContent,
            encrypted_password: password,
            expiry_type: expiryType,
            expiry_value: expiryValue,
            view_count: 0,
            is_expired: false
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const secretLink = `${window.location.origin}/secret/${data.id}`;
      setGeneratedLink(secretLink);

      toast({
        title: "Secret créé !",
        description: "Le lien vers votre secret a été généré.",
      });
    } catch (error) {
      console.error("Erreur lors de la création du secret:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la création du secret.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink);
      toast({
        title: "Lien copié !",
        description: "Le lien du secret a été copié dans le presse-papier.",
      });
    }
  };

  const goToAdminLogin = () => {
    navigate("/admin/login");
  };

  return (
    <Card className="w-full max-w-lg animate-fadeIn">
      <CardHeader className="relative">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4"
          onClick={goToAdminLogin}
          title="Connexion Admin"
        >
          <Shield className="h-5 w-5" />
        </Button>
        <CardTitle className="text-2xl font-bold text-center text-secondary">
          Créer un Secret
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-secondary">Votre Secret</label>
            <Textarea
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Entrez votre texte secret ici..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-secondary">Protection par mot de passe</label>
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="Entrez un mot de passe pour protéger votre secret"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-secondary">Paramètres d'expiration</label>
            <ExpirySelector
              type={expiryType}
              value={expiryValue}
              onTypeChange={setExpiryType}
              onValueChange={setExpiryValue}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-hover text-secondary"
            disabled={isLoading}
          >
            {isLoading ? "Création..." : "Générer le lien secret"}
          </Button>

          {generatedLink && (
            <div className="mt-4 p-4 bg-primary-light rounded-lg relative">
              <p className="text-sm break-all pr-10 text-secondary">{generatedLink}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary hover:text-secondary"
                onClick={copyToClipboard}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};