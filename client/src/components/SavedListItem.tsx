import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { ChevronRight } from "lucide-react";

interface SavedListItemProps {
  id: string;
  productName: string;
  createdAt: Date;
  onClick: () => void;
}

export default function SavedListItem({ id, productName, createdAt, onClick }: SavedListItemProps) {
  return (
    <Card
      className="p-6 cursor-pointer hover-elevate active-elevate-2 transition-all"
      onClick={onClick}
      data-testid={`card-saved-${id}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold truncate" data-testid={`text-product-name-${id}`}>
            {productName}
          </h3>
          <p className="text-sm text-muted-foreground mt-1" data-testid={`text-created-at-${id}`}>
            {formatDistanceToNow(createdAt, { addSuffix: true, locale: ko })}
          </p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
      </div>
    </Card>
  );
}
