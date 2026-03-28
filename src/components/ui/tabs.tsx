"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex items-center gap-0 border-b border-[#222]",
      "font-mono",
      className
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative px-4 py-2",
      "text-[10px] uppercase tracking-[0.2em]",
      "text-[#666] font-mono",
      "transition-colors duration-100",
      "hover:text-white",
      "data-[state=active]:text-white",
      "outline-none focus-visible:text-white",
      "bg-transparent border-none cursor-pointer",
      className
    )}
    {...props}
  >
    {children}
    <TabsUnderline />
  </TabsPrimitive.Trigger>
));
TabsTrigger.displayName = "TabsTrigger";

function TabsUnderline() {
  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#ff0000]"
      initial={false}
      style={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    />
  );
}

const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("mt-3 font-mono outline-none", className)}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

export { Tabs, TabsList, TabsTrigger, TabsContent };
