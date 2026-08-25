import { useState } from 'react'
import NewsAdmin from '../components/admin/NewsAdmin'
import EventsAdmin from '../components/admin/EventsAdmin'
import MatchesAdmin from '../components/admin/MatchesAdmin'
import MemberPostsAdmin from '../components/admin/MemberPostsAdmin'
import DocumentsAdmin from '../components/admin/DocumentsAdmin'
import GalleryAdmin from '../components/admin/GalleryAdmin'
import CalendarAdmin from '../components/admin/CalendarAdmin'

const TABS = [
  { key: 'news', label: 'Nyheter', Component: NewsAdmin },
  { key: 'events', label: 'Händelser', Component: EventsAdmin },
  { key: 'matches', label: 'Matcher', Component: MatchesAdmin },
  { key: 'calendar', label: 'Kalender', Component: CalendarAdmin },
  { key: 'member-posts', label: 'Medlemsinlägg', Component: MemberPostsAdmin },
  { key: 'documents', label: 'Dokument', Component: DocumentsAdmin },
  { key: 'gallery', label: 'Bilder', Component: GalleryAdmin },
] as const

type TabKey = (typeof TABS)[number]['key']

export default function Admin() {
  const [activeTab, setActiveTab] = useState<TabKey>(TABS[0].key)

  const active = TABS.find((tab) => tab.key === activeTab) ?? TABS[0]
  const ActiveComponent = active.Component

  return (
    <div>
      <h1>Admin</h1>

      <div
        role="tablist"
        aria-label="Adminsektioner"
        className="scrollbar-hide mt-6 flex gap-2 overflow-x-auto border-b-2 border-gray-200"
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            id={`admin-tab-${tab.key}`}
            aria-selected={tab.key === activeTab}
            aria-controls={`admin-panel-${tab.key}`}
            onClick={() => setActiveTab(tab.key)}
            className={`min-h-11 shrink-0 border-b-4 px-5 py-3 text-lg font-semibold transition-colors ${
              tab.key === activeTab
                ? 'border-accent text-primary'
                : 'border-transparent text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`admin-panel-${active.key}`}
        aria-labelledby={`admin-tab-${active.key}`}
        className="mt-6"
      >
        <ActiveComponent />
      </div>
    </div>
  )
}
