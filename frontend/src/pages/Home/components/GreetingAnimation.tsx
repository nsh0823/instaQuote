import { DotLottieReact } from "@lottiefiles/dotlottie-react";

import type { GreetingKind } from "../types/home";

export function GreetingAnimation({ kind }: { kind: GreetingKind }): JSX.Element {
  const sourceByKind: Record<GreetingKind, { src: string; size: number }> = {
    morning: {
      src: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f31e/lottie.json",
      size: 30,
    },
    afternoon: {
      src: "https://fonts.gstatic.com/s/e/notoemoji/latest/1f600/lottie.json",
      size: 28,
    },
    evening: {
      src: "https://fonts.gstatic.com/s/e/notoemoji/latest/263a_fe0f/lottie.json",
      size: 28,
    },
  };

  const config = sourceByKind[kind];

  return (
    <span
      className="inline-flex items-center justify-center"
      style={{ width: config.size, height: config.size }}
    >
      <DotLottieReact
        autoplay
        loop
        src={config.src}
        style={{ width: config.size, height: config.size }}
      />
    </span>
  );
}
