import {
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

export type CountriesRailStyle = {
  height: string;
  left: string;
  top: string;
  width: string;
};

export function useCountriesRailLayout(
  activePanelId: string,
  panelCount: number,
): {
  countriesRailStyle: CountriesRailStyle | null;
  countriesRailWrapperRef: RefObject<HTMLDivElement | null>;
} {
  const countriesRailWrapperRef = useRef<HTMLDivElement | null>(null);
  const [countriesRailStyle, setCountriesRailStyle] =
    useState<CountriesRailStyle | null>(null);

  useLayoutEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    let frameId = 0;

    const updateCountriesRailLayout = (): void => {
      const wrapper = countriesRailWrapperRef.current;
      if (!wrapper) {
        return;
      }

      if (window.innerWidth < 1024) {
        setCountriesRailStyle((prev) => (prev ? null : prev));
        return;
      }

      const header = document.querySelector("header");
      const footer = document.querySelector("footer");
      const wrapperRect = wrapper.getBoundingClientRect();
      const headerBottom =
        header instanceof HTMLElement
          ? header.getBoundingClientRect().bottom
          : 72.5;
      const topOffset = Math.ceil(headerBottom + 10);
      const bottomGap = 20;
      const baseHeight = Math.max(0, window.innerHeight - topOffset - bottomGap);
      const footerTop =
        footer instanceof HTMLElement
          ? footer.getBoundingClientRect().top
          : Number.POSITIVE_INFINITY;
      const nextHeight = Math.max(
        0,
        Math.min(baseHeight, footerTop - topOffset - bottomGap),
      );
      const nextStyle = {
        height: `${Math.round(nextHeight)}px`,
        left: `${Math.round(wrapperRect.left)}px`,
        top: `${topOffset}px`,
        width: `${Math.round(wrapperRect.width)}px`,
      };

      setCountriesRailStyle((prev) => {
        if (
          prev &&
          prev.height === nextStyle.height &&
          prev.left === nextStyle.left &&
          prev.top === nextStyle.top &&
          prev.width === nextStyle.width
        ) {
          return prev;
        }
        return nextStyle;
      });
    };

    const requestUpdate = (): void => {
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateCountriesRailLayout);
    };

    requestUpdate();
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("scroll", requestUpdate, { passive: true });

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("scroll", requestUpdate);
    };
  }, [activePanelId, panelCount]);

  return {
    countriesRailStyle,
    countriesRailWrapperRef,
  };
}
