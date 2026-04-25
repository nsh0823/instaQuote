export type CountryOption = {
  code: string;
  nameKr: string;
  nameEn: string;
  keyword: string;
  group: string;
};

export type ClientGroup = {
  label: string;
  options: Array<{ label: string; token: string }>;
};

export type CreateSelectOption = {
  flagCode?: string;
  group?: string;
  keyword?: string;
  label: string;
  token?: string;
  value: string;
};
