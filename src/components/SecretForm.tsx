import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { PasswordInput } from "./PasswordInput";
import { ExpirySelector } from "./ExpirySelector";
import { Copy } from "lucide-react";

export const SecretForm = () => {
  const [secret, setSecret] = useState("");
  const [password, setPassword] = useState("");
  const [expiryType, setExpiryType] = useState<"time" | "views">("time");
  const [expiryValue, setExpiryValue] = useState(15);
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call
    const fakeLink = `https://yourdomain.com/secret/${Math.random().toString(36).substring(7)}`;
    setGeneratedLink(fakeLink);
  };

  const copyToClipboard = async () => {
    if (generatedLink) {
      await navigator.clipboard.writeText(generatedLink);
      toast({
        title: "Link copied!",
        description: "The secret link has been copied to your clipboard.",
      });
    }
  };

  return (
    <Card className="w-full max-w-lg animate-fadeIn">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-primary">
          Create a Secret
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Your Secret</label>
            <Textarea
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Enter your secret text here..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Password Protection</label>
            <PasswordInput
              value={password}
              onChange={setPassword}
              placeholder="Enter a password to protect your secret"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Expiry Settings</label>
            <ExpirySelector
              type={expiryType}
              value={expiryValue}
              onTypeChange={setExpiryType}
              onValueChange={setExpiryValue}
            />
          </div>

          <Button type="submit" className="w-full bg-primary hover:bg-primary-hover">
            Generate Secret Link
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