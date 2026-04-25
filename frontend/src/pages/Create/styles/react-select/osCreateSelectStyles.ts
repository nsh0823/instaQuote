import type { StylesConfig } from "react-select";

import type { CreateSelectOption } from "@/pages/Create/types";

const sharedMenuStyles = {
  border: "1px solid #e4e4e4",
  borderRadius: "0.5rem",
  boxShadow: "0 0.5rem 1rem rgba(0,0,0,0.15)",
  zIndex: 50,
};

const sharedOptionStateStyles = {
  borderRadius: "0.5rem",
  color: "#212529",
  cursor: "pointer",
  fontSize: 13,
  padding: "0.35rem 0.8rem",
  ":hover": {
    backgroundColor: "#f5f3ff",
  },
};

const sharedControlStyles = (
  isFocused: boolean,
): Record<string, string | number | Record<string, string>> => ({
  backgroundColor: "white",
  borderColor: isFocused ? "#764cfc" : "#e4e4e4",
  borderRadius: "0.5rem",
  boxShadow: "none",
  "&:hover": {
    borderColor: isFocused ? "#764cfc" : "#e4e4e4",
  },
});

export const setupSelectStyles: StylesConfig<CreateSelectOption, false> = {
  control: (base, state) => ({
    ...base,
    ...sharedControlStyles(state.isFocused),
    height: 31,
    minHeight: 31,
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: 4,
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#6b7280",
    padding: 4,
  }),
  groupHeading: (base) => ({
    ...base,
    color: "#3d3d43",
    fontSize: 12,
    fontWeight: 600,
    textTransform: "none",
  }),
  indicatorSeparator: (base) => ({ ...base, display: "none" }),
  indicatorsContainer: (base) => ({
    ...base,
    height: 29,
  }),
  input: (base) => ({
    ...base,
    margin: 0,
    paddingBottom: 0,
    paddingTop: 0,
  }),
  menu: (base) => ({
    ...base,
    ...sharedMenuStyles,
  }),
  menuList: (base) => ({
    ...base,
    overflowX: "hidden",
    padding: "0.4rem",
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 10000,
  }),
  option: (base, state) => ({
    ...base,
    ...sharedOptionStateStyles,
    backgroundColor: state.isSelected ? "#6800cb26" : "white",
  }),
  placeholder: (base) => ({ ...base, color: "#9ca3af", fontSize: 13 }),
  singleValue: (base) => ({
    ...base,
    color: "#111827",
    fontSize: 13,
    margin: 0,
  }),
  valueContainer: (base) => ({
    ...base,
    height: 29,
    minHeight: 29,
    padding: "0 8px",
  }),
};

export const setupMultiSelectStyles: StylesConfig<CreateSelectOption, true> = {
  control: (base, state) => ({
    ...base,
    ...sharedControlStyles(state.isFocused),
    height: "auto",
    minHeight: 31,
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: 4,
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "#6b7280",
    padding: 4,
  }),
  indicatorSeparator: (base) => ({ ...base, display: "none" }),
  input: (base) => ({
    ...base,
    margin: 0,
    paddingBottom: 0,
    paddingTop: 0,
  }),
  menu: (base) => ({
    ...base,
    ...sharedMenuStyles,
  }),
  menuList: (base) => ({
    ...base,
    display: "grid",
    gap: 2,
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    overflowX: "hidden",
    padding: "0.4rem",
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 10000,
  }),
  multiValue: (base) => ({
    ...base,
    alignItems: "center",
    backgroundColor: "#f5f3ff",
    borderRadius: "0.5rem",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "#4c1d95",
    fontSize: 12,
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#6d28d9",
    ":hover": {
      backgroundColor: "#ddd6fe",
      color: "#4c1d95",
    },
  }),
  option: (base, state) => ({
    ...base,
    ...sharedOptionStateStyles,
    backgroundColor: state.isSelected ? "#6800cb26" : "white",
  }),
  placeholder: (base) => ({ ...base, color: "#9ca3af", fontSize: 13 }),
  singleValue: (base) => ({
    ...base,
    color: "#111827",
    fontSize: 13,
    margin: 0,
  }),
  valueContainer: (base) => ({
    ...base,
    height: 29,
    padding: "1px 8px",
  }),
};

export const inlineMultiSelectStyles: StylesConfig<CreateSelectOption, true> = {
  ...setupMultiSelectStyles,
  control: (base, state) => ({
    ...base,
    ...sharedControlStyles(state.isFocused),
    minHeight: 31,
  }),
  menuList: (base) => ({
    ...base,
    display: "block",
    gap: 0,
    maxHeight: 220,
    overflowX: "hidden",
    padding: "0.4rem",
  }),
  valueContainer: (base) => ({
    ...base,
    minHeight: 29,
    padding: "0 8px",
  }),
};

export const setupConnectedMultiSelectStyles: StylesConfig<
  CreateSelectOption,
  true
> = {
  ...setupMultiSelectStyles,
  control: (base, state) => {
    const nextBase =
      typeof setupMultiSelectStyles.control === "function"
        ? setupMultiSelectStyles.control(base, state)
        : base;

    return {
      ...nextBase,
      borderBottomRightRadius: 0,
      borderRightWidth: 0,
      borderTopRightRadius: 0,
    };
  },
};
