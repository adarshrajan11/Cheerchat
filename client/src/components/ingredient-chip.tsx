import { Button } from "@/components/ui/button";

interface IngredientChipProps {
  ingredient: string;
  selected?: boolean;
  onToggle?: (ingredient: string) => void;
}

export default function IngredientChip({ ingredient, selected = false, onToggle }: IngredientChipProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      className={`ingredient-chip ${selected ? "selected" : ""}`}
      onClick={() => onToggle?.(ingredient)}
    >
      {ingredient}
    </Button>
  );
}
