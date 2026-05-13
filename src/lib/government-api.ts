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

// Government 37 decisions tracking dataset from data.gov.il
const GOV_DECISIONS_RESOURCE_ID = '5b6cd1b1-c553-4838-af7e-c1132e7234f1'

// Fetch recent government decisions from data.gov.il
export async function fetchGovDecisions(limit = 20, offset = 0): Promise<GovDecision[]> {
  const params = new URLSearchParams({
    resource_id: GOV_DECISIONS_RESOURCE_ID,
    limit: String(limit),
    offset: String(offset),
    sort: '_id desc',
  })
  const url = `${CKAN_API_BASE}/datastore_search?${params}`

  try {
    const res = await fetch(url, { next: { revalidate: 300 }, signal: AbortSignal.timeout(8000) })
    if (!res.ok) throw new Error(`CKAN error: ${res.status}`)
    const json = await res.json()
    if (json.success && json.result?.records?.length) {
      return json.result.records.map(mapCkanDecision)
    }
  } catch {
    // Fall through to mock
  }
  return getMockDecisions(limit)
}

function mapCkanDecision(r: Record<string, unknown>): GovDecision {
  const decisionNum = String(r['Decision Number ‏'] ?? r.decision_num ?? r.DecisionNum ?? '').trim()
  const rawId = r._id ?? r.id ?? r.decision_id
  return {
    decision_id: rawId != null && String(rawId) !== '' ? String(rawId) : undefined,
    gov_num: 37,
    decision_num: decisionNum,
    title: String(r['Name Of Government Decision'] ?? r.title ?? r.Title ?? '').trim(),
    date: String(r['Date Published'] ?? r.date ?? r.Deadline ?? '').split(' ')[0],
    ministry_name: String(r['Responsible Unit'] ?? r.ministry_name ?? r.Ministry ?? '').trim(),
    summary: String(r.Task ?? r.summary ?? r.Summary ?? '').trim(),
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
