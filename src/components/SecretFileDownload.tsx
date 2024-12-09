import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface SecretFileDownloadProps {
  fileData: {
    data: string;
    name: string;
    type: string;
  };
}

export const SecretFileDownload = ({ fileData }: SecretFileDownloadProps) => {
  const handleDownload = () => {
    try {
      const link = document.createElement("a");
      link.href = fileData.data;
      link.download = fileData.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Fichier: {fileData.name}</p>
      <Button onClick={handleDownload} className="w-full" variant="outline">
        <Download className="h-4 w-4 mr-2" />
        Télécharger le fichier
      </Button>
    </div>
  );
};