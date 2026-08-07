import { Plus } from "lucide-react";
import { Button } from "@/components/ui";

interface AdminPageHeaderProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function AdminPageHeader({ title, description, actionLabel }: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-primary-900 tracking-tight">{title}</h1>
        <p className="text-neutral-500 text-sm mt-1">{description}</p>
      </div>
      {actionLabel && (
        <Button variant="primary" size="sm" icon={Plus} iconPosition="left">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
