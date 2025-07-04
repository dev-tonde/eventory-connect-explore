import * as React from "react";
import * as AspectRatioPrimitive from "@radix-ui/react-aspect-ratio";

// Forward ref for consistency and future extensibility
const AspectRatio = React.forwardRef<
  React.ElementRef<typeof AspectRatioPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof AspectRatioPrimitive.Root>
>((props, ref) => <AspectRatioPrimitive.Root ref={ref} {...props} />);

AspectRatio.displayName = "AspectRatio";

export { AspectRatio };
// This component provides a simple aspect ratio wrapper using Radix UI's Aspect Ratio primitive.
// It allows you to maintain a specific aspect ratio for its children, which is useful for responsive images or videos.
