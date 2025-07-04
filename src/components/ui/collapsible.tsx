import * as React from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

// Root Collapsible component
const Collapsible = CollapsiblePrimitive.Root;

// Collapsible Trigger with forwardRef for consistency and extensibility
const CollapsibleTrigger = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.CollapsibleTrigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleTrigger>
>(({ ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleTrigger ref={ref} {...props} />
));
CollapsibleTrigger.displayName = "CollapsibleTrigger";

// Collapsible Content with forwardRef for consistency and extensibility
const CollapsibleContent = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.CollapsibleContent>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent>
>(({ ...props }, ref) => (
  <CollapsiblePrimitive.CollapsibleContent ref={ref} {...props} />
));
CollapsibleContent.displayName = "CollapsibleContent";

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
// This component provides a customizable collapsible UI using Radix UI primitives.
