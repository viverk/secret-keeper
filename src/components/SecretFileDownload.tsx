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
      // Créer un blob directement à partir des données binaires
      const blob = new Blob([fileData.data], { type: fileData.type });

      // Créer une URL pour le blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileData.name;
      document.body.appendChild(link);
      link.click();
      
      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
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