import { useEffect, useState } from "react";

export function useHeaderFloating(threshold = 10): boolean {
  const [isHeaderFloating, setIsHeaderFloating] = useState(false);

  useEffect(() => {
    const handleScroll = (): void => {
      setIsHeaderFloating(window.scrollY > threshold);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [threshold]);

  return isHeaderFloating;
}
