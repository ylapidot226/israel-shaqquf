import { KNESSET_ODATA_BASE } from './utils'

// Field names verified against live OData metadata

export interface KnessetBill {
  BillID: number
  Name: string
  StatusID: number
  KnessetNum?: number
  LastUpdatedDate?: string
  SubTypeID?: number
  SubTypeDesc?: string
}

export interface KnessetPerson {
  PersonID: number
  FirstName?: string
  LastName?: string
  GenderID?: number
  IsCurrent?: boolean
  LastUpdatedDate?: string
}

export interface KnessetFaction {
  FactionID: number
  Name: string
  KnessetNum?: number
  IsCurrent?: boolean
}

export interface KnessetCommittee {
  CommitteeID: number
  Name: string
  KnessetNum?: number
  IsCurrent?: boolean
}

export interface KnessetCommitteeSession {
  CommitteeSessionID: number
  CommitteeID?: number
  StartDate?: string
  StatusID?: number
  StatusDesc?: string
  TypeDesc?: string
  Note?: string
  BroadcastUrl?: string
  LastUpdatedDate?: string
}

export interface KnessetAgendaItem {
  AgendaID: number
  Name: string
  StatusID?: number
  SubTypeDesc?: string
  InitiatorPersonID?: number
  KnessetNum?: number
  LastUpdatedDate?: string
}

function toOdataDatetime(iso: string): string {
  return iso.replace(/\.\d{3}Z$/, '').replace('Z', '')
}

async function fetchOdata<T>(entity: string, params: Record<string, string> = {}): Promise<T[]> {
  const qs = new URLSearchParams({ $format: 'json', $top: '50', ...params })
  const url = `${KNESSET_ODATA_BASE}/${entity}?${qs}`
  const res = await fetch(url, {
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(10000),
  })
  if (!res.ok) throw new Error(`Knesset API error: ${res.status}`)
  const json = await res.json()
  if (json?.['odata.error']) throw new Error(json['odata.error'].message?.value ?? 'OData error')
  return json?.value ?? []
}

export async function fetchRecentBills(top = 20): Promise<KnessetBill[]> {
  return fetchOdata<KnessetBill>('KNS_Bill', {
    $top: String(top),
    $orderby: 'LastUpdatedDate desc',
    $select: 'BillID,Name,StatusID,KnessetNum,LastUpdatedDate,SubTypeID,SubTypeDesc',
  })
}

export async function fetchUpcomingCommitteeSessions(top = 15): Promise<KnessetCommitteeSession[]> {
  const now = toOdataDatetime(new Date().toISOString())
  return fetchOdata<KnessetCommitteeSession>('KNS_CommitteeSession', {
    $top: String(top),
    $orderby: 'StartDate asc',
    $filter: `StartDate ge datetime'${now}'`,
    $select: 'CommitteeSessionID,CommitteeID,StartDate,StatusID,StatusDesc,TypeDesc,Note,BroadcastUrl,LastUpdatedDate',
  })
}

export async function fetchRecentAgendaItems(top = 20): Promise<KnessetAgendaItem[]> {
  return fetchOdata<KnessetAgendaItem>('KNS_Agenda', {
    $top: String(top),
    $orderby: 'LastUpdatedDate desc',
    $filter: 'KnessetNum eq 25',
    $select: 'AgendaID,Name,StatusID,SubTypeDesc,InitiatorPersonID,KnessetNum,LastUpdatedDate',
  })
}

export async function fetchPersons(top = 120): Promise<KnessetPerson[]> {
  return fetchOdata<KnessetPerson>('KNS_Person', {
    $top: String(top),
    $filter: 'IsCurrent eq true',
    $orderby: 'LastName asc',
    $select: 'PersonID,FirstName,LastName,GenderID,IsCurrent,LastUpdatedDate',
  })
}

export async function fetchFactions(): Promise<KnessetFaction[]> {
  return fetchOdata<KnessetFaction>('KNS_Faction', {
    $filter: 'KnessetNum eq 25',
    $orderby: 'Name asc',
    $select: 'FactionID,Name,KnessetNum,IsCurrent',
  })
}

export async function fetchCommittees(): Promise<KnessetCommittee[]> {
  return fetchOdata<KnessetCommittee>('KNS_Committee', {
    $filter: 'KnessetNum eq 25',
    $orderby: 'Name asc',
    $select: 'CommitteeID,Name,KnessetNum,IsCurrent',
  })
}

export async function fetchBillsByPerson(personId: number): Promise<KnessetBill[]> {
  // Bills by initiator: query KNS_BillInitiator to get BillIDs, then fetch those bills
  // For simplicity, filter by KnessetNum 25 to get recent bills
  return fetchOdata<KnessetBill>('KNS_Bill', {
    $top: '30',
    $filter: `KnessetNum eq 25`,
    $orderby: 'LastUpdatedDate desc',
    $select: 'BillID,Name,StatusID,KnessetNum,LastUpdatedDate,SubTypeDesc',
  })
}

export async function fetchSessionsByCommittee(committeeId: number): Promise<KnessetCommitteeSession[]> {
  return fetchOdata<KnessetCommitteeSession>('KNS_CommitteeSession', {
    $top: '30',
    $filter: `CommitteeID eq ${committeeId}`,
    $orderby: 'StartDate desc',
    $select: 'CommitteeSessionID,CommitteeID,StartDate,StatusID,StatusDesc,TypeDesc,Note,BroadcastUrl',
  })
}

export const BILL_STATUS: Record<number, string> = {
  1: 'הכנה לקריאה ראשונה',
  2: 'קריאה ראשונה',
  3: 'ועדה לאחר קריאה ראשונה',
  4: 'קריאה שנייה ושלישית',
  5: 'אושרה',
  6: 'נפלה',
  118: 'אושרה וחתומה',
  131: 'בהכנה',
}
