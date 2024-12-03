import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ExpirySelectorProps {
  type: "time" | "views";
  value: number;
  onTypeChange: (type: "time" | "views") => void;
  onValueChange: (value: number) => void;
}

export const ExpirySelector = ({
  type,
  value,
  onTypeChange,
  onValueChange,
}: ExpirySelectorProps) => {
  return (
    <div className="space-y-4">
      <RadioGroup
        value={type}
        onValueChange={(val) => onTypeChange(val as "time" | "views")}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="time" id="time" />
          <Label htmlFor="time">Temps (minutes)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="views" id="views" />
          <Label htmlFor="views">Nombres de vues</Label>
        </div>
      </RadioGroup>

      <Input
        type="number"
        min="1"
        value={value}
        onChange={(e) => onValueChange(parseInt(e.target.value) || 1)}
        className="w-32"
      />
    </div>
  );
};
