import { CKAN_API_BASE } from './utils'

export interface GovDecision {
  decision_id?: string
  gov_num?: number
  decision_num?: string
  title: string
  date?: string
  ministry_name?: string
  summary?: string
  url?: string
  tags?: string[]
}

export interface Ministry {
  ministry_id: string
  name: string
  hebrew_name?: string
}

// Fetch recent government decisions from data.gov.il
export async function fetchGovDecisions(limit = 20, offset = 0): Promise<GovDecision[]> {
  const url = `${CKAN_API_BASE}/datastore_search?resource_id=https://www.gov.il/he/departments/policies&limit=${limit}&offset=${offset}&sort=date desc`

  try {
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) throw new Error(`CKAN error: ${res.status}`)
    const json = await res.json()
    if (json.success && json.result?.records) {
      return json.result.records.map(mapCkanDecision)
    }
  } catch {
    // Fall through to scrape fallback
  }

  // Fallback: try known resource_id for government decisions
  return fetchGovDecisionsFallback(limit)
}

async function fetchGovDecisionsFallback(limit = 20): Promise<GovDecision[]> {
  const resourceId = 'cb8e9e4e-7c6f-41a1-b0ad-5f8f83ee4f65'
  const url = `${CKAN_API_BASE}/datastore_search?resource_id=${resourceId}&limit=${limit}&sort=date%20desc`

  try {
    const res = await fetch(url, { next: { revalidate: 300 } })
    if (!res.ok) return getMockDecisions(limit)
    const json = await res.json()
    if (json.success && json.result?.records?.length) {
      return json.result.records.map(mapCkanDecision)
    }
  } catch {
    // return mock
  }
  return getMockDecisions(limit)
}

function mapCkanDecision(r: Record<string, unknown>): GovDecision {
  return {
    decision_id: String(r.id ?? r.decision_id ?? r.DecisionID ?? ''),
    gov_num: Number(r.gov_num ?? r.GovNum ?? 37),
    decision_num: String(r.decision_num ?? r.DecisionNum ?? r.Number ?? ''),
    title: String(r.title ?? r.Title ?? r.name ?? ''),
    date: String(r.date ?? r.Date ?? ''),
    ministry_name: String(r.ministry_name ?? r.Ministry ?? r.office ?? ''),
    summary: String(r.summary ?? r.Summary ?? r.description ?? ''),
    url: String(r.url ?? r.Url ?? ''),
    tags: [],
  }
}

function getMockDecisions(limit: number): GovDecision[] {
  const decisions: GovDecision[] = [
    { decision_id: '1', gov_num: 37, decision_num: '4521', title: 'החלטה בנושא תוכנית לפיתוח כלכלי', date: '2025-05-01', ministry_name: 'משרד האוצר', summary: 'אישור תוכנית חומש לפיתוח כלכלי באזורי הפריפריה', url: '#' },
    { decision_id: '2', gov_num: 37, decision_num: '4520', title: 'החלטה בנושא חינוך ותעסוקה', date: '2025-04-28', ministry_name: 'משרד החינוך', summary: 'הרחבת תוכנית ניסויית לשילוב תלמידים עם צרכים מיוחדים', url: '#' },
    { decision_id: '3', gov_num: 37, decision_num: '4519', title: 'החלטה בנושא בריאות הציבור', date: '2025-04-25', ministry_name: 'משרד הבריאות', summary: 'הקמת מרכזי בריאות בפריפריה', url: '#' },
    { decision_id: '4', gov_num: 37, decision_num: '4518', title: 'החלטה בנושא ביטחון לאומי', date: '2025-04-22', ministry_name: 'משרד הביטחון', summary: 'חיזוק מוכנות הצבא לאתגרים עתידיים', url: '#' },
    { decision_id: '5', gov_num: 37, decision_num: '4517', title: 'החלטה בנושא תשתיות תחבורה', date: '2025-04-20', ministry_name: "משרד התחבורה", summary: 'פיתוח תשתיות תחבורה ציבורית במטרופולינים', url: '#' },
    { decision_id: '6', gov_num: 37, decision_num: '4516', title: 'החלטה בנושא מדיניות דיור', date: '2025-04-18', ministry_name: 'משרד השיכון', summary: 'עדכון מסלולי סיוע לרכישת דיור לזכאים', url: '#' },
  ]
  return decisions.slice(0, limit)
}

export async function fetchMinistries(): Promise<Ministry[]> {
  return [
    { ministry_id: 'finance', name: 'Ministry of Finance', hebrew_name: 'משרד האוצר' },
    { ministry_id: 'defense', name: 'Ministry of Defense', hebrew_name: 'משרד הביטחון' },
    { ministry_id: 'education', name: 'Ministry of Education', hebrew_name: 'משרד החינוך' },
    { ministry_id: 'health', name: 'Ministry of Health', hebrew_name: 'משרד הבריאות' },
    { ministry_id: 'justice', name: 'Ministry of Justice', hebrew_name: 'משרד המשפטים' },
    { ministry_id: 'interior', name: 'Ministry of Interior', hebrew_name: 'משרד הפנים' },
    { ministry_id: 'foreign', name: 'Ministry of Foreign Affairs', hebrew_name: 'משרד החוץ' },
    { ministry_id: 'transport', name: 'Ministry of Transport', hebrew_name: "משרד התחבורה" },
    { ministry_id: 'housing', name: 'Ministry of Housing', hebrew_name: 'משרד השיכון' },
    { ministry_id: 'economy', name: 'Ministry of Economy', hebrew_name: 'משרד הכלכלה' },
    { ministry_id: 'agriculture', name: 'Ministry of Agriculture', hebrew_name: 'משרד החקלאות' },
    { ministry_id: 'energy', name: 'Ministry of Energy', hebrew_name: 'משרד האנרגיה' },
  ]
}
