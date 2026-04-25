import { useMemo, useState } from "react";
import Select, { type SingleValue, type StylesConfig } from "react-select";

import { SCOPE_OPTIONS } from "../utils/constants";
import type { Scope, ScopeOption } from "../types/home";

let measureCanvas: HTMLCanvasElement | null = null;

function measureLabelWidth(label: string): number {
  if (typeof document === "undefined") {
    return label.length * 9;
  }

  if (!measureCanvas) {
    measureCanvas = document.createElement("canvas");
  }

  const context = measureCanvas.getContext("2d");

  if (!context) {
    return label.length * 9;
  }

  context.font = "500 16px Poppins, sans-serif";
  return context.measureText(label).width;
}

export function ScopeSelect({
  inputId,
  minimumWidth,
  onChange,
  value,
}: {
  inputId: string;
  minimumWidth: number;
  onChange: (scope: Scope) => void;
  value: Scope;
}): JSX.Element {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isExpanded = isHovered || isFocused || isMenuOpen;

  const selectedOption = useMemo(
    () =>
      SCOPE_OPTIONS.find((option) => option.value === value) ??
      SCOPE_OPTIONS[0],
    [value],
  );

  const containerWidth = useMemo(() => {
    const measured = measureLabelWidth(selectedOption.label) + 10;
    const withHover = (isExpanded ? 17 : 0) + Math.max(minimumWidth, measured);
    return withHover;
  }, [isExpanded, minimumWidth, selectedOption.label]);

  const selectStyles = useMemo<StylesConfig<ScopeOption, false>>(
    () => ({
      container: (base) => ({
        ...base,
        flexShrink: 0,
        marginLeft: -5,
        overflow: "visible",
        transition: "width 0.4s ease",
        width: containerWidth,
      }),
      control: (base) => ({
        ...base,
        backgroundColor: "transparent",
        border: "none",
        boxShadow: "none",
        cursor: "pointer",
        flexWrap: "nowrap",
        minHeight: 0,
        overflow: "visible",
      }),
      valueContainer: (base) => ({
        ...base,
        overflow: "visible",
        padding: "0 0 0 4px",
        whiteSpace: "nowrap",
      }),
      singleValue: (base) => ({
        ...base,
        color: "#3d3d43",
        fontSize: "1rem",
        fontWeight: 500,
        margin: 0,
        maxWidth: "none",
        overflow: "visible",
        textOverflow: "clip",
        whiteSpace: "nowrap",
      }),
      indicatorsContainer: (base, state) => ({
        ...base,
        overflow: "hidden",
        transition: "width 0.2s ease",
        width: isExpanded || state.selectProps.menuIsOpen ? 20 : 0,
      }),
      dropdownIndicator: (base, state) => ({
        ...base,
        color: "#343a40",
        display: isExpanded || state.selectProps.menuIsOpen ? "flex" : "none",
        padding: 0,
      }),
      indicatorSeparator: (base) => ({
        ...base,
        display: "none",
      }),
      menu: (base) => ({
        ...base,
        borderRadius: "0.5rem",
        boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)",
        marginTop: 8,
        overflow: "hidden",
        zIndex: 1040,
      }),
      menuList: (base) => ({
        ...base,
        paddingBottom: 0,
        paddingTop: 0,
      }),
      option: (base, state) => ({
        ...base,
        backgroundColor:
          state.isFocused || state.isSelected ? "#6800cb26" : "white",
        color: "#212529",
        cursor: "pointer",
        fontSize: 14,
        fontWeight: state.isSelected ? 500 : 400,
        padding: "0.35rem 0.8rem",
      }),
    }),
    [containerWidth, isExpanded],
  );

  return (
    <div
      className="home-scope-select-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Select<ScopeOption, false>
        aria-label={inputId}
        classNamePrefix="home-scope-select"
        components={{
          IndicatorSeparator: () => null,
        }}
        inputId={inputId}
        isSearchable={false}
        onBlur={() => {
          setIsFocused(false);
        }}
        onChange={(nextValue: SingleValue<ScopeOption>) => {
          if (nextValue) {
            onChange(nextValue.value);
          }
          setIsFocused(false);
        }}
        onFocus={() => {
          setIsFocused(true);
        }}
        onMenuClose={() => {
          setIsMenuOpen(false);
        }}
        onMenuOpen={() => {
          setIsMenuOpen(true);
        }}
        options={SCOPE_OPTIONS}
        styles={selectStyles}
        value={selectedOption}
      />
    </div>
  );
}
