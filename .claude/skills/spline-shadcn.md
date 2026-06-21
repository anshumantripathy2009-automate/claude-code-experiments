---
name: spline-shadcn
description: "Integrate Spline 3D scenes into a React/Next.js project using shadcn/ui, Tailwind CSS, and TypeScript. Actions: install, integrate, add 3D, spline scene, interactive 3D, spline component. Includes SplineScene wrapper, Spotlight effect (aceternity + ibelick variants), shadcn Card, and all required npm dependencies."
---

# Spline 3D Scene — shadcn/ui Integration Guide

Use this skill whenever the user wants to add an interactive 3D Spline scene to a React or Next.js project.

---

## Step 0 — Verify Project Prerequisites

Check for shadcn, Tailwind, and TypeScript. If missing, set them up first.

### shadcn/ui (required)
```bash
# Check
cat components.json 2>/dev/null || echo "shadcn not found"

# Setup if missing
npx shadcn@latest init
```

### Tailwind CSS (required)
```bash
# Check
cat tailwind.config.ts 2>/dev/null || cat tailwind.config.js 2>/dev/null || echo "Tailwind not found"

# Setup if missing (Next.js example)
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### TypeScript (required)
```bash
# Check
cat tsconfig.json 2>/dev/null || echo "TypeScript not found"

# Setup if missing
npm install -D typescript @types/react @types/node
npx tsc --init
```

---

## Step 1 — Verify /components/ui Exists

shadcn expects all UI primitives at `components/ui/`. If it doesn't exist:

```bash
mkdir -p components/ui
```

> Why this matters: shadcn's `cn()` utility, theme tokens, and the CLI all assume this path. Putting components elsewhere breaks auto-imports and shadcn CLI updates.

---

## Step 2 — Install npm Dependencies

```bash
npm install @splinetool/react-spline @splinetool/runtime framer-motion
```

---

## Step 3 — Copy Component Files

### `components/ui/splite.tsx`
```tsx
'use client'

import { Suspense, lazy } from 'react'
const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
  scene: string
  className?: string
}

export function SplineScene({ scene, className }: SplineSceneProps) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center">
          <span className="loader"></span>
        </div>
      }
    >
      <Spline
        scene={scene}
        className={className}
      />
    </Suspense>
  )
}
```

### `components/ui/spotlight.tsx` — Aceternity variant (SVG, no framer-motion)
```tsx
import React from "react";
import { cn } from "@/lib/utils";

type SpotlightProps = {
  className?: string;
  fill?: string;
};

export const Spotlight = ({ className, fill }: SpotlightProps) => {
  return (
    <svg
      className={cn(
        "animate-spotlight pointer-events-none absolute z-[1] h-[169%] w-[138%] lg:w-[84%] opacity-0",
        className
      )}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 3787 2842"
      fill="none"
    >
      <g filter="url(#filter)">
        <ellipse
          cx="1924.71"
          cy="273.501"
          rx="1924.71"
          ry="273.501"
          transform="matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)"
          fill={fill || "white"}
          fillOpacity="0.21"
        />
      </g>
      <defs>
        <filter
          id="filter"
          x="0.860352"
          y="0.838989"
          width="3785.16"
          height="2840.26"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="151" result="effect1_foregroundBlur_1065_8" />
        </filter>
      </defs>
    </svg>
  );
};
```

### `components/ui/spotlight-motion.tsx` — ibelick variant (framer-motion, mouse-tracking)
```tsx
'use client';
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { motion, useSpring, useTransform, SpringOptions } from 'framer-motion';
import { cn } from '@/lib/utils';

type SpotlightProps = {
  className?: string;
  size?: number;
  springOptions?: SpringOptions;
};

export function Spotlight({
  className,
  size = 200,
  springOptions = { bounce: 0 },
}: SpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [parentElement, setParentElement] = useState<HTMLElement | null>(null);

  const mouseX = useSpring(0, springOptions);
  const mouseY = useSpring(0, springOptions);

  const spotlightLeft = useTransform(mouseX, (x) => `${x - size / 2}px`);
  const spotlightTop  = useTransform(mouseY, (y) => `${y - size / 2}px`);

  useEffect(() => {
    if (containerRef.current) {
      const parent = containerRef.current.parentElement;
      if (parent) {
        parent.style.position = 'relative';
        parent.style.overflow = 'hidden';
        setParentElement(parent);
      }
    }
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!parentElement) return;
      const { left, top } = parentElement.getBoundingClientRect();
      mouseX.set(event.clientX - left);
      mouseY.set(event.clientY - top);
    },
    [mouseX, mouseY, parentElement]
  );

  useEffect(() => {
    if (!parentElement) return;
    parentElement.addEventListener('mousemove', handleMouseMove);
    parentElement.addEventListener('mouseenter', () => setIsHovered(true));
    parentElement.addEventListener('mouseleave', () => setIsHovered(false));
    return () => {
      parentElement.removeEventListener('mousemove', handleMouseMove);
      parentElement.removeEventListener('mouseenter', () => setIsHovered(true));
      parentElement.removeEventListener('mouseleave', () => setIsHovered(false));
    };
  }, [parentElement, handleMouseMove]);

  return (
    <motion.div
      ref={containerRef}
      className={cn(
        'pointer-events-none absolute rounded-full bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops),transparent_80%)] blur-xl transition-opacity duration-200',
        'from-zinc-50 via-zinc-100 to-zinc-200',
        isHovered ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{ width: size, height: size, left: spotlightLeft, top: spotlightTop }}
    />
  );
}
```

### `components/ui/card.tsx` — shadcn Card primitive
```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)} {...props} />
  )
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-2xl font-semibold leading-none tracking-tight", className)} {...props} />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />
  )
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

---

## Step 4 — Add Spotlight Animation to Tailwind Config

Add the `animate-spotlight` keyframe to `tailwind.config.ts`:

```ts
theme: {
  extend: {
    animation: {
      spotlight: "spotlight 2s ease .75s 1 forwards",
    },
    keyframes: {
      spotlight: {
        "0%":   { opacity: "0", transform: "translate(-72%, -62%) scale(0.5)" },
        "100%": { opacity: "1", transform: "translate(-50%, -40%) scale(1)" },
      },
    },
  },
},
```

---

## Step 5 — Demo Usage

```tsx
// app/page.tsx or any page/component
'use client'

import { SplineScene } from "@/components/ui/splite"
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"

export function SplineSceneBasic() {
  return (
    <Card className="w-full h-[500px] bg-black/[0.96] relative overflow-hidden">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />

      <div className="flex h-full">
        {/* Left: text */}
        <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
            Interactive 3D
          </h1>
          <p className="mt-4 text-neutral-300 max-w-lg">
            Bring your UI to life with beautiful 3D scenes. Create immersive experiences
            that capture attention and enhance your design.
          </p>
        </div>

        {/* Right: 3D scene */}
        <div className="flex-1 relative">
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  )
}
```

---

## Integration Checklist

Before delivering:

- [ ] `components/ui/` folder exists
- [ ] `@splinetool/react-spline`, `@splinetool/runtime`, `framer-motion` installed
- [ ] `cn()` utility available at `@/lib/utils`
- [ ] `animate-spotlight` keyframe added to `tailwind.config.ts`
- [ ] Component uses `'use client'` directive (required for Spline + hooks)
- [ ] Spline scene URL is valid and accessible
- [ ] `Suspense` fallback loader visible during scene load
- [ ] Responsive: test at 375px, 768px, 1024px (flex layout stacks on mobile if needed)

## Questions to Ask Before Integrating

1. **What Spline scene URL** should be used? (Get from spline.design export → "Public link")
2. **Which Spotlight variant?** Aceternity (CSS animation, simpler) or ibelick (mouse-tracking, needs framer-motion)
3. **Where in the app** does this component appear? (Hero, feature section, landing page above-fold?)
4. **Mobile layout?** Should the 3D scene stack below text on small screens or be hidden?
5. **Dark/light mode?** Spline scenes render on transparent background — confirm bg color works in both modes.

## Common Issues

| Problem | Fix |
|---|---|
| Scene loads blank | Check the Spline URL is a public `.splinecode` link, not a viewer URL |
| `cn is not a function` | Ensure `lib/utils.ts` exists with `clsx` + `tailwind-merge` |
| Spotlight not animating | Add `animate-spotlight` keyframe to `tailwind.config.ts` |
| `'use client'` error | Add directive to top of any file using Spline/framer-motion hooks |
| Scene overflows container | Add `overflow-hidden` to parent and explicit `h-[]` height |
| Heavy bundle size | Spline scenes are large — use `lazy()` + `Suspense` (already done in SplineScene) |
