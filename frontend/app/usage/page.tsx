'use client'

import { Sidebar } from '@/components/Sidebar'
import { formatNumber } from '@/lib/utils'

export default function UsagePage() {
  const usageData = {
    current_period: 'January 1-31, 2025',
    total_verifications: 3847,
    included_in_plan: 10000,
    remaining: 6153,
    daily_usage: [
      { date: 'Jan 14', count: 89 },
      { date: 'Jan 13', count: 102 },
      { date: 'Jan 12', count: 156 },
      { date: 'Jan 11', count: 78 },
      { date: 'Jan 10', count: 134 },
      { date: 'Jan 9', count: 167 },
      { date: 'Jan 8', count: 201 },
    ],
    plan: {
      name: 'Pro',
      price: 499,
      limit: 100000,
      next_billing: 'February 1, 2025',
    },
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-neutral-200 px-8 py-4">
          <h2 className="text-2xl font-semibold text-neutral-900">Usage Statistics</h2>
          <p className="text-sm text-neutral-500">Monitor your API usage and quotas</p>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-6xl">
            {/* Current Period Summary */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Current Period</h3>
                <span className="text-sm text-neutral-500">{usageData.current_period}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-neutral-50 rounded-lg">
                  <div className="text-3xl font-bold text-neutral-900">
                    {formatNumber(usageData.total_verifications)}
                  </div>
                  <div className="text-sm text-neutral-500 mt-1">Total Verifications</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {formatNumber(usageData.remaining)}
                  </div>
                  <div className="text-sm text-green-600 mt-1">Remaining</div>
                </div>
                <div className="text-center p-4 bg-neutral-50 rounded-lg">
                  <div className="text-3xl font-bold text-neutral-900">
                    {Math.round((1 - usageData.remaining / usageData.included_in_plan) * 100)}%
                  </div>
                  <div className="text-sm text-neutral-500 mt-1">Plan Used</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-neutral-600">Usage</span>
                  <span className="text-neutral-900 font-medium">
                    {formatNumber(usageData.total_verifications)} / {formatNumber(usageData.included_in_plan)}
                  </span>
                </div>
                <div className="h-3 bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary-500 rounded-full"
                    style={{ width: `${(usageData.total_verifications / usageData.included_in_plan) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Daily Usage Chart */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Daily Usage (Last 7 Days)</h3>
              <div className="flex items-end gap-4 h-48">
                {usageData.daily_usage.map((day, idx) => {
                  const maxCount = Math.max(...usageData.daily_usage.map(d => d.count))
                  const heightPercent = (day.count / maxCount) * 100
                  
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-primary-500 rounded-t-sm transition-all hover:bg-primary-600"
                        style={{ height: `${heightPercent}%` }}
                      />
                      <div className="text-xs text-neutral-500 mt-2">{day.date}</div>
                      <div className="text-sm font-medium text-neutral-900">{day.count}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Plan Details */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold mb-4">Current Plan</h3>
              <div className="flex items-center justify-between py-4 border-b border-neutral-100">
                <div>
                  <div className="text-xl font-bold text-neutral-900">{usageData.plan.name}</div>
                  <div className="text-sm text-neutral-500">${usageData.plan.price}/month</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-neutral-600">Next billing date</div>
                  <div className="text-sm font-medium text-neutral-900">{usageData.plan.next_billing}</div>
                </div>
              </div>
              <div className="py-4">
                <div className="text-sm text-neutral-600 mb-2">Plan limits:</div>
                <ul className="text-sm text-neutral-700 space-y-1">
                  <li>• {formatNumber(usageData.plan.limit)} verifications/month</li>
                  <li>• Priority API access</li>
                  <li>• Advanced analytics</li>
                  <li>• Email support</li>
                </ul>
              </div>
              <button className="mt-4 px-4 py-2 border border-neutral-300 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors">
                Upgrade Plan
              </button>
            </div>

            {/* Usage by Endpoint */}
            <div className="bg-white rounded-xl border border-neutral-200 p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Usage by Endpoint</h3>
              <div className="space-y-4">
                <EndpointRow
                  endpoint="/v1/verify/text"
                  calls={2847}
                  percentage={74}
                />
                <EndpointRow
                  endpoint="/v1/verify/batch"
                  calls={987}
                  percentage={26}
                />
                <EndpointRow
                  endpoint="/v1/health"
                  calls={13}
                  percentage={0}
                />
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  )
}

function EndpointRow({
  endpoint,
  calls,
  percentage,
}: {
  endpoint: string
  calls: number
  percentage: number
}) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-neutral-100 last:border-0">
      <div className="flex-1">
        <code className="text-sm font-mono text-neutral-700">{endpoint}</code>
      </div>
      <div className="w-32">
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-500 rounded-full"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className="w-20 text-right text-sm text-neutral-600">
        {calls.toLocaleString()} calls
      </div>
    </div>
  )
}