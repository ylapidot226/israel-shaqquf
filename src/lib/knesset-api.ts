import { KNESSET_ODATA_BASE } from './utils'

export interface KnessetBill {
  BillID: number
  Name: string
  StatusID: number
  StatusDesc?: string
  InitiatorPersonID?: number
  KnessetNum?: number
  LastUpdatedDate?: string
  SubTypeID?: number
  SubTypeDesc?: string
}

export interface KnessetPerson {
  PersonID: number
  FirstName?: string
  LastName?: string
  Name?: string
  GenderID?: number
  IsCurrent?: boolean
  FactionID?: number
  FactionName?: string
  PhotoUrl?: string
  LastUpdatedDate?: string
}

export interface KnessetFaction {
  FactionID: number
  Name: string
  KnessetNum?: number
}

export interface KnessetCommittee {
  CommitteeID: number
  Name: string
  KnessetNum?: number
}

export interface KnessetCommitteeSession {
  SessionID: number
  CommitteeID?: number
  CommitteeName?: string
  StartDate?: string
  StatusID?: number
  StatusDesc?: string
  Name?: string
  BroadcastUrl?: string
  LastUpdatedDate?: string
}

export interface KnessetAgendaItem {
  AgendaID: number
  Name: string
  StatusID?: number
  StatusDesc?: string
  PersonID?: number
  Date?: string
  LastUpdatedDate?: string
}

async function fetchOdata<T>(entity: string, params: Record<string, string> = {}): Promise<T[]> {
  const qs = new URLSearchParams({ $format: 'json', $top: '50', ...params })
  const url = `${KNESSET_ODATA_BASE}/${entity}?${qs}`
  const res = await fetch(url, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error(`Knesset API error: ${res.status}`)
  const json = await res.json()
  return json?.value ?? []
}

export async function fetchRecentBills(top = 20): Promise<KnessetBill[]> {
  return fetchOdata<KnessetBill>('KNS_Bill', {
    $top: String(top),
    $orderby: 'LastUpdatedDate desc',
    $select: 'BillID,Name,StatusID,StatusDesc,InitiatorPersonID,KnessetNum,LastUpdatedDate,SubTypeID,SubTypeDesc',
  })
}

function toOdataDatetime(iso: string): string {
  return iso.replace(/\.\d{3}Z$/, '').replace('Z', '')
}

export async function fetchUpcomingCommitteeSessions(top = 15): Promise<KnessetCommitteeSession[]> {
  const now = toOdataDatetime(new Date().toISOString())
  return fetchOdata<KnessetCommitteeSession>('KNS_CommitteeSession', {
    $top: String(top),
    $orderby: 'StartDate asc',
    $filter: `StartDate ge datetime'${now}'`,
    $select: 'SessionID,CommitteeID,StartDate,StatusID,StatusDesc,Name,BroadcastUrl,LastUpdatedDate',
  })
}

export async function fetchRecentAgendaItems(top = 20): Promise<KnessetAgendaItem[]> {
  return fetchOdata<KnessetAgendaItem>('KNS_Agenda', {
    $top: String(top),
    $orderby: 'Date desc',
    $select: 'AgendaID,Name,StatusID,StatusDesc,PersonID,Date,LastUpdatedDate',
  })
}

export async function fetchPersons(top = 120): Promise<KnessetPerson[]> {
  return fetchOdata<KnessetPerson>('KNS_Person', {
    $top: String(top),
    $filter: 'IsCurrent eq true',
    $orderby: 'LastName asc',
    $select: 'PersonID,FirstName,LastName,GenderID,IsCurrent,FactionID,LastUpdatedDate',
  })
}

export async function fetchFactions(): Promise<KnessetFaction[]> {
  return fetchOdata<KnessetFaction>('KNS_Faction', {
    $filter: 'KnessetNum eq 25',
    $orderby: 'Name asc',
    $select: 'FactionID,Name,KnessetNum',
  })
}

export async function fetchCommittees(): Promise<KnessetCommittee[]> {
  return fetchOdata<KnessetCommittee>('KNS_Committee', {
    $filter: 'KnessetNum eq 25',
    $orderby: 'Name asc',
    $select: 'CommitteeID,Name,KnessetNum',
  })
}

export async function fetchBillsByPerson(personId: number): Promise<KnessetBill[]> {
  return fetchOdata<KnessetBill>('KNS_Bill', {
    $top: '30',
    $filter: `InitiatorPersonID eq ${personId}`,
    $orderby: 'LastUpdatedDate desc',
    $select: 'BillID,Name,StatusID,StatusDesc,KnessetNum,LastUpdatedDate,SubTypeDesc',
  })
}

export async function fetchSessionsByCommittee(committeeId: number): Promise<KnessetCommitteeSession[]> {
  return fetchOdata<KnessetCommitteeSession>('KNS_CommitteeSession', {
    $top: '30',
    $filter: `CommitteeID eq ${committeeId}`,
    $orderby: 'StartDate desc',
    $select: 'SessionID,CommitteeID,StartDate,StatusID,StatusDesc,Name,BroadcastUrl',
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
