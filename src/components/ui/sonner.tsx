"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      style={
        {
          // Base toast styling
          "--normal-bg": "oklch(1 0 0)",
          "--normal-text": "oklch(0.145 0 0)",
          "--normal-border": "oklch(0.922 0 0)",

          // Success toast styling - using existing color values from the theme
          "--success-bg": "oklch(0.72 0.22 50)",
          "--success-text": "oklch(0.985 0 0)",
          "--success-border": "oklch(0.72 0.22 50 / 0.2)",

          // Error toast styling - using destructive colors
          "--error-bg": "oklch(0.577 0.245 27.325)",
          "--error-text": "oklch(0.985 0 0)",
          "--error-border": "oklch(0.577 0.245 27.325 / 0.2)",

          // Info toast styling - using chart-2 color
          "--info-bg": "oklch(0.6 0.118 184.704)",
          "--info-text": "oklch(0.985 0 0)",
          "--info-border": "oklch(0.6 0.118 184.704 / 0.2)",

          // Warning toast styling - using chart-4 color
          "--warning-bg": "oklch(0.828 0.189 84.429)",
          "--warning-text": "oklch(0.145 0 0)",
          "--warning-border": "oklch(0.828 0.189 84.429 / 0.2)",

          // Loading toast styling
          "--loading-bg": "oklch(0.97 0 0)",
          "--loading-text": "oklch(0.556 0 0)",
          "--loading-border": "oklch(0.922 0 0)",

          // Additional styling
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
