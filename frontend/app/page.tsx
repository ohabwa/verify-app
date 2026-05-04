import { Sidebar } from '@/components/Sidebar'

export default function HomePage() {
  return (
    <Sidebar />
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-8 py-4">
        <h2 className="text-2xl font-semibold text-neutral-900">Dashboard</h2>
        <p className="text-sm text-neutral-500">Welcome to Verify API</p>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-6xl">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <StatCard
              title="Total Verifications"
              value="1,234"
              change="+12% from last month"
              icon="✓"
            />
            <StatCard
              title="API Calls Today"
              value="89"
              change="+5% from yesterday"
              icon="📊"
            />
            <StatCard
              title="Quota Remaining"
              value="10,000"
              change="Resets in 15 days"
              icon="🔋"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Quick Start</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <QuickAction
                title="Verify Text"
                description="Analyze text for AI generation"
                href="/verify"
                icon="✓"
              />
              <QuickAction
                title="Create API Key"
                description="Generate new API credentials"
                href="/keys"
                icon="🔑"
              />
              <QuickAction
                title="Read Docs"
                description="API documentation and examples"
                href="/docs"
                icon="📖"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Recent Verifications</h3>
            <div className="space-y-4">
              <RecentItem
                text="The quick brown fox jumps over..."
                result="85% AI"
                time="2 minutes ago"
              />
              <RecentItem
                text="I believe that the truth is..."
                result="12% AI"
                time="15 minutes ago"
              />
              <RecentItem
                text="In the beginning, there was..."
                result="45% AI"
                time="1 hour ago"
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  change, 
  icon 
}: { 
  title: string
  value: string
  change: string
  icon: string
}) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 p-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs text-green-600 font-medium">{change}</span>
      </div>
      <h3 className="text-sm text-neutral-500 mb-1">{title}</h3>
      <p className="text-3xl font-bold text-neutral-900">{value}</p>
    </div>
  )
}

function QuickAction({
  title,
  description,
  href,
  icon
}: {
  title: string
  description: string
  href: string
  icon: string
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-4 p-4 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors"
    >
      <span className="text-2xl">{icon}</span>
      <div>
        <h4 className="font-medium text-neutral-900">{title}</h4>
        <p className="text-sm text-neutral-500">{description}</p>
      </div>
    </a>
  )
}

function RecentItem({
  text,
  result,
  time
}: {
  text: string
  result: string
  time: string
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm text-neutral-900 truncate">{text}</p>
        <p className="text-xs text-neutral-500">{time}</p>
      </div>
      <span className="ml-4 px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600">
        {result}
      </span>
    </div>
  )
}