import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/PasswordInput";
import { supabase } from "@/integrations/supabase/client";
import { decryptContent } from "@/lib/encryption";
import { verifyPassword } from "@/lib/password";
import { useToast } from "@/components/ui/use-toast";
import { Shield, Eye, Download } from "lucide-react";

const ViewSecret = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState<string | null>(null);
  const [fileData, setFileData] = useState<{ data: string; name: string; type: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [expiryMessage, setExpiryMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data: secretData, error: fetchError } = await supabase
        .from("secrets")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;
      if (!secretData) {
        setError("Secret non trouvé");
        return;
      }

      if (secretData.is_expired) {
        setError("Ce secret a expiré");
        return;
      }

      // Verify password
      const isPasswordValid = await verifyPassword(password, secretData.encrypted_password);
      if (!isPasswordValid) {
        setError("Mot de passe incorrect");
        return;
      }

      try {
        if (secretData.encrypted_content) {
          const decryptedContent = await decryptContent(
            secretData.encrypted_content,
            password
          );
          setSecret(decryptedContent);
        }

        if (secretData.file_data) {
          setFileData({
            data: secretData.file_data,
            name: secretData.file_name,
            type: secretData.file_type,
          });
        }

        // Log view
        const userAgent = navigator.userAgent;
        const location = "Unknown"; // You might want to implement actual geolocation here

        const { error: viewError } = await supabase
          .from("secret_views")
          .insert({
            secret_id: id,
            user_agent: userAgent,
            location: location,
          });

        if (viewError) {
          console.error("Error logging view:", viewError);
        }

        // Send notification if email is provided
        if (secretData.notify_email) {
          await supabase.functions.invoke("notify-secret-viewed", {
            body: {
              secretId: id,
              userAgent,
              location,
              notifyEmail: secretData.notify_email,
            },
          });
        }

        // Update view count
        const newViewCount = (secretData.view_count || 0) + 1;
        const { error: updateError } = await supabase
          .from("secrets")
          .update({ view_count: newViewCount })
          .eq("id", id);

        if (updateError) {
          console.error("Error updating view count:", updateError);
        }

        // Set expiry message
        if (secretData.expiry_type === "time") {
          const expiryValue = secretData.expiry_value;
          const createdAt = new Date(secretData.created_at);
          const now = new Date();
          const diffInMinutes = (now.getTime() - createdAt.getTime()) / 1000 / 60;
          setExpiryMessage(
            `Ce secret expirera dans ${Math.ceil(
              expiryValue - diffInMinutes
            )} minutes.`
          );
        } else {
          const remainingViews = secretData.expiry_value - newViewCount;
          setExpiryMessage(
            `Ce secret peut encore être consulté ${remainingViews} fois.`
          );
        }
      } catch (decryptError) {
        setError("Erreur lors du déchiffrement");
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

  const handleDownload = () => {
    if (fileData) {
      const link = document.createElement("a");
      link.href = fileData.data;
      link.download = fileData.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
          {!secret && !fileData ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-secondary">
                  Entrez le mot de passe
                </label>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  placeholder="Entrez le mot de passe du secret"
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
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
              {secret && (
                <div className="p-4 bg-primary-light rounded-lg">
                  <p className="break-all whitespace-pre-wrap text-secondary">
                    {secret}
                  </p>
                </div>
              )}
              {fileData && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Fichier: {fileData.name}
                  </p>
                  <Button
                    onClick={handleDownload}
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger le fichier
                  </Button>
                </div>
              )}
              <p className="text-sm text-gray-500 text-center">
                {expiryMessage}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewSecret;