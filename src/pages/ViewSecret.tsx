import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/PasswordInput";

const ViewSecret = () => {
  const { id } = useParams();
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call
    if (password === "test") {
      setSecret("This is a test secret");
      setError(null);
    } else {
      setError("Invalid password");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-lg animate-fadeIn">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-primary">
            View Secret
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!secret ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Enter Password</label>
                <PasswordInput
                  value={password}
                  onChange={setPassword}
                  placeholder="Enter the secret's password"
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
              </div>
              <Button type="submit" className="w-full bg-primary hover:bg-primary-hover">
                View Secret
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-primary-light rounded-lg">
                <p className="break-all">{secret}</p>
              </div>
              <p className="text-sm text-gray-500 text-center">
                This secret will be destroyed after you leave this page.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ViewSecret;