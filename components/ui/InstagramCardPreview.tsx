"use client";

import { forwardRef } from "react";
import {
  CardStyle1,
  CardStyle2,
  CardStyle3,
  CardStyleVariant,
} from "./instagram-card";

export type { CardStyleVariant };

export interface InstagramCardPreviewProps {
  message: string;
  logoSrc?: string;
  variant?: CardStyleVariant;
}

export const InstagramCardPreview = forwardRef<
  HTMLDivElement,
  InstagramCardPreviewProps
>(({ message, logoSrc, variant = "style2" }, ref) => {
  switch (variant) {
    case "style1":
      return <CardStyle1 ref={ref} message={message} logoSrc={logoSrc} />;
    case "style3":
      return <CardStyle3 ref={ref} message={message} logoSrc={logoSrc} />;
    case "style2":
    default:
      return <CardStyle2 ref={ref} message={message} logoSrc={logoSrc} />;
  }
});

InstagramCardPreview.displayName = "InstagramCardPreview";