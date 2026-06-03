"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { UserRef } from "@/lib/api/documents.api";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

interface UserChipProps {
  user: UserRef | null | undefined;
  /** Avatar-only, name shown in a tooltip. Useful in dense rows. */
  compact?: boolean;
  /** Muted line shown under the name (full mode only), e.g. a timestamp. */
  subtitle?: string;
  className?: string;
}

export function UserChip({ user, compact, subtitle, className }: UserChipProps) {
  if (!user) {
    return (
      <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
        Unassigned
      </Badge>
    );
  }

  const avatar = (
    <Avatar className="size-6 shrink-0">
      <AvatarFallback className="text-[10px] font-medium bg-teal-50 text-teal-700">
        {initials(user.name)}
      </AvatarFallback>
    </Avatar>
  );

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={className}>{avatar}</span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="font-medium">{user.name}</div>
          {user.email && <div className="text-background/70">{user.email}</div>}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div className={`flex items-center gap-2 min-w-0 ${className ?? ""}`}>
      {avatar}
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground truncate">{user.name}</div>
        {subtitle && <div className="text-xs text-muted-foreground truncate">{subtitle}</div>}
      </div>
    </div>
  );
}
