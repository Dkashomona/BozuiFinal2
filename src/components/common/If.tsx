import React from "react";

type Props = {
  condition: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export default function If({ condition, children, fallback = null }: Props) {
  if (!condition) return <>{fallback}</>;
  return <>{children}</>;
}
