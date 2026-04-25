import type {
  ApiMutationResult,
  BackendResponse,
  ClientDataset,
  GmailEmail,
  OtherFeeDataset,
  OSMergedTable,
  RateDataset,
  RfqOverview,
  RfqStatusInfo,
  TableRows,
} from '../types/backend';

declare global {
  interface Window {
    __INSTAQUOTE_BACKEND_API_BASE__?: string;
  }
}

function resolveApiBase(): string {
  const runtimeOverride = window.__INSTAQUOTE_BACKEND_API_BASE__?.trim();
  if (runtimeOverride) {
    return runtimeOverride.replace(/\/$/, '');
  }

  const envBase = (import.meta.env.VITE_BACKEND_API_BASE ?? '').trim();
  if (envBase) {
    if (import.meta.env.DEV && /^https?:\/\//.test(envBase)) {
      return '/__gas_api__';
    }
    return envBase.replace(/\/$/, '');
  }

  return '';
}

async function requestBackend<T>(fn: string, args: unknown[] = []): Promise<T> {
  const base = resolveApiBase();
  if (!base) {
    throw new Error('VITE_BACKEND_API_BASE is not configured.');
  }

  const url = /^https?:\/\//.test(base)
    ? new URL(base)
    : new URL(base, window.location.origin);
  url.searchParams.set('api', '1');
  url.searchParams.set('fn', fn);
  url.searchParams.set('args', JSON.stringify(args));

  const res = await fetch(url.toString(), {
    method: 'GET',
  });

  let payload: BackendResponse<T>;

  try {
    payload = (await res.json()) as BackendResponse<T>;
  } catch (_error) {
    throw new Error('Backend did not return JSON.');
  }

  if (!res.ok) {
    throw new Error('Backend request failed with status ' + res.status);
  }

  if (!payload.ok) {
    throw new Error(payload.error || 'Backend returned error');
  }

  return payload.data;
}

async function submitLegacyForm<T>(fields: Record<string, string>): Promise<T> {
  const base = resolveApiBase();
  if (!base) {
    throw new Error('VITE_BACKEND_API_BASE is not configured.');
  }

  const body = new URLSearchParams();
  body.set('api', '1');
  Object.entries(fields).forEach(([key, value]) => {
    body.set(key, value);
  });

  body.set('api', '1');

  const res = await fetch(base, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    },
    body: body.toString(),
  });

  if (!res.ok) {
    throw new Error('Backend form submission failed with status ' + res.status);
  }

  let payload: BackendResponse<T>;

  try {
    payload = (await res.json()) as BackendResponse<T>;
  } catch (_error) {
    throw new Error('Backend did not return JSON.');
  }

  if (!payload.ok) {
    throw new Error(payload.error || 'Backend returned error');
  }

  return payload.data;
}

export async function getActiveUserName(): Promise<string> {
  // return requestBackend<string>('getActiveUserName');
  return "User 1";
}

export async function getActiveUserEmail(): Promise<string> {
  return requestBackend<string>('getActiveUserEmail');
}

export async function getCountry(): Promise<string[][]> {
  return requestBackend<string[][]>('getCountry');
}

export async function getClient(): Promise<ClientDataset> {
  return requestBackend<ClientDataset>('getClient');
}

export async function getLink(): Promise<string[][]> {
  return requestBackend<string[][]>('getLink');
}

export async function getGmailEmails(): Promise<GmailEmail[]> {
  return requestBackend<GmailEmail[]>('getGmailEmails');
}

export async function getCompPt(): Promise<string[][]> {
  return requestBackend<string[][]>('getCompPt');
}

export async function getOtherFee(): Promise<OtherFeeDataset> {
  return requestBackend<OtherFeeDataset>('getOtherFee');
}

export async function getRate(): Promise<RateDataset> {
  return requestBackend<RateDataset>('getRate');
}

export async function getRFQ(rfqId?: string): Promise<TableRows> {
  return requestBackend<TableRows>('getRFQ', rfqId ? [rfqId] : []);
}

export async function getDraft(rfqId?: string): Promise<TableRows> {
  return requestBackend<TableRows>('getDraft', rfqId ? [rfqId] : []);
}

export async function getRFQOS(rfqId?: string): Promise<OSMergedTable> {
  return requestBackend<OSMergedTable>('getRFQOS', rfqId ? [rfqId] : []);
}

export async function getDraftOS(rfqId?: string): Promise<OSMergedTable> {
  return requestBackend<OSMergedTable>('getDraftOS', rfqId ? [rfqId] : []);
}

export async function getVendors(): Promise<TableRows> {
  return requestBackend<TableRows>('getVendors');
}

export async function getRFQOverview(): Promise<RfqOverview> {
  return requestBackend<RfqOverview>('getRFQOverview');
}

export async function getRFQStatusInfo(): Promise<RfqStatusInfo> {
  return requestBackend<RfqStatusInfo>('getRFQStatusInfo');
}

export async function getFilteredRFQ(): Promise<TableRows> {
  return requestBackend<TableRows>('getFilteredRFQ');
}

export async function getMergedRFQOS(): Promise<OSMergedTable> {
  return requestBackend<OSMergedTable>('getMergedRFQOS');
}

export async function updateRfqStatus(
  rfqType: 'KR' | 'OS',
  rfqId: string,
  status: string,
): Promise<void> {
  await submitLegacyForm({
    'RFQ ID': rfqId,
    'RFQ Status': status,
    Notes: '',
    'Last submit type': 'update-status',
    'RFQ type': rfqType,
  });
}

export async function updateRfqNotes(
  rfqType: 'KR' | 'OS',
  rfqId: string,
  notes: string,
): Promise<void> {
  await submitLegacyForm({
    'RFQ ID': rfqId,
    'RFQ Status': '',
    Notes: notes,
    'Last submit type': 'update-comments',
    'RFQ type': rfqType,
  });
}

export async function updateRfqOutputUrl(rfqId: string, outputUrl: string): Promise<void> {
  await submitLegacyForm<ApiMutationResult>({
    'RFQ ID': rfqId,
    'RFQ Status': '',
    Notes: '',
    'Output URL': outputUrl,
    'Last submit type': 'update-outputurl',
    'RFQ type': 'OS',
  });
}

export async function createRfq(fields: Record<string, string>): Promise<ApiMutationResult> {
  return submitLegacyForm<ApiMutationResult>({
    ...fields,
    'Last submit type': 'save',
  });
}

export async function saveDraft(fields: Record<string, string>): Promise<ApiMutationResult> {
  return submitLegacyForm<ApiMutationResult>({
    ...fields,
    'Last submit type': 'save-draft',
  });
}

export async function updateRfq(fields: Record<string, string>): Promise<ApiMutationResult> {
  return submitLegacyForm<ApiMutationResult>({
    ...fields,
    'Last submit type': 'update',
  });
}

export async function exportRfq(fields: Record<string, string>): Promise<ApiMutationResult> {
  return submitLegacyForm<ApiMutationResult>({
    ...fields,
    'Last submit type': 'export',
  });
}

export async function saveExportRfq(fields: Record<string, string>): Promise<ApiMutationResult> {
  return submitLegacyForm<ApiMutationResult>({
    ...fields,
    'Last submit type': 'save-export',
  });
}
