import Button from "@/components/ui/buttons/Button";

interface SectionHeadingProps {
  title: string;
  id?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function SectionHeading({
  title,
  id,
  actionLabel,
  onAction,
  className = "",
}: SectionHeadingProps) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <h2
        id={id}
        className="text-lg leading-6 font-bold text-text-primary md:text-xl md:leading-7 lg:text-2xl lg:leading-8"
      >
        {title}
      </h2>
      {actionLabel && (
        <Button variant="text" size="sm" onClick={onAction} className="px-0">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
