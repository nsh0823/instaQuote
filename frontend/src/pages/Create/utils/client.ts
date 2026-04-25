import type { ClientGroup } from '@/pages/Create/types';

export function findClientGroupIndex(client: string, groups: ClientGroup[]): number {
  return groups.findIndex((group) =>
    group.options.some((option) => option.label === client),
  );
}

export function findClientGroupLabel(
  client: string,
  groups: ClientGroup[],
  customGroupByClient: Record<string, string>,
): string {
  if (customGroupByClient[client]) {
    return customGroupByClient[client];
  }

  const matched = groups.find((group) =>
    group.options.some((option) => option.label === client),
  );
  return matched?.label ?? '';
}

export function chooseClientFromHint(
  hint: string,
  groups: ClientGroup[],
): string {
  const lookup = hint.trim().toLowerCase();

  if (!lookup) {
    return '';
  }

  for (const group of groups) {
    for (const option of group.options) {
      if (option.token.toLowerCase().includes(lookup)) {
        return option.label;
      }
    }
  }

  return '';
}
