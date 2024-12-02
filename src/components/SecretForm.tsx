import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { PasswordInput } from "./PasswordInput";
import { ExpirySelector } from "./ExpirySelector";
import { Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { encryptContent } from "@/lib/encryption";
import { useNavigate } from "react-router-dom";

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
      // Chiffrer le contenu
      const encryptedContent = await encryptContent(secret, password);

      // Créer le secret dans Supabase
      const { data, error } = await supabase
        .from("secrets")
        .insert([
          {
            encrypted_content: encryptedContent,
            password_hash: password, // Note: Dans un environnement de production, il faudrait hasher le mot de passe
            expiry_type: expiryType,
            expiry_value: expiryValue,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Générer le lien
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

  return (
    <Card className="w-full max-w-lg animate-fadeIn">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-primary">
          Créer un Secret
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Votre Secret</label>
            <Textarea
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Entrez votre texte secret ici..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Protection par mot de passe</label>
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="Entrez un mot de passe pour protéger votre secret"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Paramètres d'expiration</label>
            <ExpirySelector
              type={expiryType}
              value={expiryValue}
              onTypeChange={setExpiryType}
              onValueChange={setExpiryValue}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-hover"
            disabled={isLoading}
          >
            {isLoading ? "Création..." : "Générer le lien secret"}
          </Button>

          {generatedLink && (
            <div className="mt-4 p-4 bg-primary-light rounded-lg relative">
              <p className="text-sm break-all pr-10">{generatedLink}</p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
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