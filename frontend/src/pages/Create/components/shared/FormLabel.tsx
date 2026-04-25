import { memo, type ReactNode } from "react";

export const FormLabel = memo(function FormLabel({
  children,
  required,
  type,
}: {
  children: ReactNode;
  required?: boolean;
  type?: "card";
}): JSX.Element {
  return (
    <label
      className={`mb-1 block text-[12px] text-[#5b5b5b] ${type === "card" ? "opacity-80" : "font-medium"}`}
    >
      {children}
      {required ? <span className="ml-1 text-[#cc2b4f]">*</span> : null}
    </label>
  );
});

FormLabel.displayName = "FormLabel";
