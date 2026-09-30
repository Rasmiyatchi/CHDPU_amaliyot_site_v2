import { Monitor, Moon, Sun } from "lucide-react";
import type { JSX } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTheme } from "@/hooks/use-theme";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
};

export function ThemeToggle({ className, size = "icon" }: ThemeToggleProps): JSX.Element {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const current = {
    light: {
      icon: Sun,
      label: t("theme.light", "Yorug' mavzu (Light)"),
      next: t("theme.switchToDark", "Qorong'i rejimga o'tish"),
      color: "text-amber-500 hover:text-amber-600 dark:text-amber-400",
    },
    dark: {
      icon: Moon,
      label: t("theme.dark", "Qorong'i mavzu (Dark)"),
      next: t("theme.switchToSystem", "Tizim rejimiga o'tish"),
      color: "text-indigo-500 hover:text-indigo-600 dark:text-indigo-400",
    },
    system: {
      icon: Monitor,
      label: t("theme.system", "Tizim mavzusi (System)"),
      next: t("theme.switchToLight", "Yorug' rejimga o'tish"),
      color: "text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200",
    },
  }[theme];

  const Icon = current.icon;
  const fullTooltip = `${current.label} • ${current.next}`;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size={size}
            onClick={cycleTheme}
            title={fullTooltip}
            aria-label={fullTooltip}
            className={cn(
              "h-8 w-8 rounded-lg text-slate-600 hover:bg-slate-200/70 active:scale-95 transition-all dark:text-slate-300 dark:hover:bg-slate-800",
              className,
            )}
          >
            <Icon className={cn("h-4 w-4 transition-transform duration-300 hover:rotate-12", current.color)} />
            <span className="sr-only">{fullTooltip}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">
          <span className="font-semibold">{current.label}</span>
          <span className="block text-[10px] text-muted-foreground mt-0.5">{current.next}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
