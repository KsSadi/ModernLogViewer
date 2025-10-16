'use client'

import { useMemo } from 'react'
import { useLogStore } from '@/stores/logStore'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  Clock,
  FileText,
  Zap
} from 'lucide-react'

export default function LogAnalytics() {
  const { getActiveFile, getLogStats, isDarkMode, files } = useLogStore()
  
  const activeFile = getActiveFile()
  const stats = useMemo(() => getLogStats(), [getLogStats])

  const levelColors = {
    DEBUG: isDarkMode ? '#6B7280' : '#9CA3AF',
    INFO: isDarkMode ? '#3B82F6' : '#2563EB', 
    NOTICE: isDarkMode ? '#06B6D4' : '#0891B2',
    WARNING: isDarkMode ? '#F59E0B' : '#D97706',
    ERROR: isDarkMode ? '#EF4444' : '#DC2626',
    CRITICAL: isDarkMode ? '#DC2626' : '#B91C1C',
    ALERT: isDarkMode ? '#B91C1C' : '#991B1B',
    EMERGENCY: isDarkMode ? '#991B1B' : '#7F1D1D'
  }

  // Prepare chart data
  const levelChartData = Object.entries(stats.levelCounts).map(([level, count]) => ({
    level,
    count,
    fill: levelColors[level as keyof typeof levelColors] || levelColors.INFO
  }))

  const timeSeriesData = stats.entriesPerHour.map(({ hour, count }) => ({
    time: new Date(hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    count
  }))

  const channelData = stats.topChannels.slice(0, 8).map(({ channel, count }) => ({
    channel: channel.length > 15 ? channel.slice(0, 12) + '...' : channel,
    count,
    fill: `hsl(${Math.abs(channel.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % 360}, 70%, ${isDarkMode ? '60%' : '50%'})`
  }))

  if (!activeFile) {
    return (
      <div className={`text-center py-12 ${
        isDarkMode ? 'text-gray-400' : 'text-gray-600'
      }`}>
        <Activity size={64} className="mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-medium mb-2">No Active Log File</h3>
        <p>Upload a log file to see analytics and insights</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          Log Analytics
        </h2>
        <p className={`mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Insights and statistics for {activeFile.name}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Entries"
          value={stats.totalEntries.toLocaleString()}
          icon={<FileText size={20} />}
          color="blue"
        />
        
        <StatsCard
          title="Error Rate"
          value={`${((stats.levelCounts.ERROR || 0) / stats.totalEntries * 100).toFixed(1)}%`}
          icon={<AlertTriangle size={20} />}
          color="red"
        />
        
        <StatsCard
          title="Time Range"
          value={`${Math.ceil((stats.timeRange.end.getTime() - stats.timeRange.start.getTime()) / (1000 * 60 * 60 * 24))} days`}
          icon={<Clock size={20} />}
          color="green"
        />
        
        <StatsCard
          title="Peak Hour"
          value={stats.entriesPerHour.length > 0 ? 
            new Date(stats.entriesPerHour.reduce((max, curr) => 
              curr.count > max.count ? curr : max
            ).hour).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'
          }
          icon={<Zap size={20} />}
          color="purple"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Log Levels Distribution */}
        <ChartCard title="Log Levels Distribution">
          {levelChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={levelChartData}
                  dataKey="count"
                  nameKey="level"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry: any) => `${entry.level} ${(entry.percent * 100).toFixed(0)}%`}
                >
                  {levelChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    border: `1px solid ${isDarkMode ? '#4B5563' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    color: isDarkMode ? '#ffffff' : '#000000'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No level data available
            </div>
          )}
        </ChartCard>

        {/* Entries Over Time */}
        <ChartCard title="Entries Over Time">
          {timeSeriesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDarkMode ? '#374151' : '#E5E7EB'} 
                />
                <XAxis 
                  dataKey="time" 
                  tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280' }}
                />
                <YAxis 
                  tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    border: `1px solid ${isDarkMode ? '#4B5563' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    color: isDarkMode ? '#ffffff' : '#000000'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke={isDarkMode ? '#3B82F6' : '#2563EB'}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No time series data available
            </div>
          )}
        </ChartCard>

        {/* Top Channels */}
        <ChartCard title="Top Channels">
          {channelData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={channelData} layout="horizontal">
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDarkMode ? '#374151' : '#E5E7EB'} 
                />
                <XAxis 
                  type="number"
                  tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280' }}
                />
                <YAxis 
                  type="category"
                  dataKey="channel"
                  tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280' }}
                  width={100}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    border: `1px solid ${isDarkMode ? '#4B5563' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    color: isDarkMode ? '#ffffff' : '#000000'
                  }}
                />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No channel data available
            </div>
          )}
        </ChartCard>

        {/* Level Counts Bar Chart */}
        <ChartCard title="Level Distribution">
          {levelChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={levelChartData}>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDarkMode ? '#374151' : '#E5E7EB'} 
                />
                <XAxis 
                  dataKey="level"
                  tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280' }}
                />
                <YAxis 
                  tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDarkMode ? '#374151' : '#ffffff',
                    border: `1px solid ${isDarkMode ? '#4B5563' : '#E5E7EB'}`,
                    borderRadius: '8px',
                    color: isDarkMode ? '#ffffff' : '#000000'
                  }}
                />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No level data available
            </div>
          )}
        </ChartCard>
      </div>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InsightCard
          title="Error Analysis"
          insights={[
            `${stats.levelCounts.ERROR || 0} errors detected`,
            `${stats.levelCounts.WARNING || 0} warnings found`,
            `Error rate: ${((stats.levelCounts.ERROR || 0) / stats.totalEntries * 100).toFixed(2)}%`
          ]}
          color="red"
        />
        
        <InsightCard
          title="Activity Patterns"
          insights={[
            `${stats.entriesPerHour.length} unique hours logged`,
            `Peak activity: ${stats.entriesPerHour.reduce((max, curr) => 
              curr.count > max.count ? curr : max, { count: 0 }
            ).count} entries/hour`,
            `${stats.topChannels.length} different channels active`
          ]}
          color="blue"
        />
      </div>
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: string
  icon: React.ReactNode
  color: 'blue' | 'red' | 'green' | 'purple'
}

function StatsCard({ title, value, icon, color }: StatsCardProps) {
  const { isDarkMode } = useLogStore()
  
  const colorClasses = {
    blue: isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-600',
    red: isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-600',
    green: isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-600',
    purple: isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-600'
  }

  return (
    <div className={`p-4 rounded-lg border ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            {title}
          </p>
          <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
        </div>
      </div>
    </div>
  )
}

interface ChartCardProps {
  title: string
  children: React.ReactNode
}

function ChartCard({ title, children }: ChartCardProps) {
  const { isDarkMode } = useLogStore()
  
  return (
    <div className={`p-4 rounded-lg border ${
      isDarkMode 
        ? 'bg-gray-800 border-gray-700' 
        : 'bg-white border-gray-200'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        {title}
      </h3>
      {children}
    </div>
  )
}

interface InsightCardProps {
  title: string
  insights: string[]
  color: 'red' | 'blue'
}

function InsightCard({ title, insights, color }: InsightCardProps) {
  const { isDarkMode } = useLogStore()
  
  const colorClass = color === 'red' 
    ? isDarkMode ? 'border-red-700' : 'border-red-200'
    : isDarkMode ? 'border-blue-700' : 'border-blue-200'

  return (
    <div className={`p-4 rounded-lg border ${colorClass} ${
      isDarkMode 
        ? 'bg-gray-800' 
        : 'bg-white'
    }`}>
      <h3 className={`text-lg font-semibold mb-3 ${
        isDarkMode ? 'text-white' : 'text-gray-900'
      }`}>
        {title}
      </h3>
      <ul className="space-y-2">
        {insights.map((insight, index) => (
          <li key={index} className={`flex items-center gap-2 text-sm ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            <TrendingUp size={16} className={
              color === 'red'
                ? 'text-red-500'
                : 'text-blue-500'
            } />
            {insight}
          </li>
        ))}
      </ul>
    </div>
  )
}