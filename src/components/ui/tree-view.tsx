import React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface TreeItemProps {
  label: string;
  children?: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
  onClick?: () => void;
}

export const TreeItem: React.FC<TreeItemProps> = ({
  label,
  children,
  defaultExpanded = false,
  className,
  onClick,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  const hasChildren = React.Children.count(children) > 0;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren) {
      setIsExpanded(!isExpanded);
    }
    onClick?.();
  };

  return (
    <div className={cn("select-none", className)}>
      <div
        className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-gray-100 cursor-pointer"
        onClick={handleClick}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )
        ) : (
          <div className="w-4" />
        )}
        <span className="text-sm">{label}</span>
      </div>
      {isExpanded && hasChildren && (
        <div className="ml-4 border-l border-gray-200 pl-2 mt-1">
          {children}
        </div>
      )}
    </div>
  );
};