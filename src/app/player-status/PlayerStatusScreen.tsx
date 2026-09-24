import { useCallback, useEffect, useState } from 'react'
import {
  fetchPlayerStatusData,
  getPlayerStatusData,
  PLAYER_STATUS_METRIC_DEFINITIONS,
  PLAYER_STATUS_RANGES,
  type PlayerStatusData,
  type PlayerStatusLevel,
  type RangeKey,
} from './playerStatusData'
import { PlayerStatusIcon } from './PlayerStatusIcons'

function Navigation() {
  return (
    <nav className="player-status__nav" aria-label="分析頁面">
      <a className="is-active" href="#overview"><PlayerStatusIcon name="activity" size={17} />總覽</a>
      <a href="#levels"><PlayerStatusIcon name="layers" size={17} />關卡健康</a>
      <a href="#players"><PlayerStatusIcon name="users" size={17} />玩家分群</a>
      <a href="#signals"><PlayerStatusIcon name="spark" size={17} />體驗訊號</a>
    </nav>
  )
}

function formatNumber(value: number | null): string {
  return value === null ? '—' : new Intl.NumberFormat('zh-TW').format(value)
}

function formatDuration(value: number | null): string {
  if (value === null) return '—'
  const totalSeconds = value / 1000
  if (totalSeconds >= 60) return `${Math.floor(totalSeconds / 60)}:${String(Math.floor(totalSeconds % 60)).padStart(2, '0')}`
  return `${totalSeconds.toFixed(1)} 秒`
}

function completionRate(attempts: number, completedAttempts: number): string {
  return attempts > 0 ? `${Math.round((completedAttempts / attempts) * 100)}%` : '—'
}

function formatFetchedAt(value: string | undefined): string {
  if (!value) return '尚未更新'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '更新時間無法驗證' : `更新於 ${new Intl.DateTimeFormat('zh-TW', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)}`
}

function DataContract() {
  return (
    <section className="player-status__data-contract-grid" aria-label="資料契約">
      <article className="player-status__card player-status__data-contract-card">
        <div className="player-status__card-heading">
          <div><p className="player-status__eyebrow">事件來源</p><h2>只接受真實事件</h2></div>
          <span className="player-status__heading-icon"><PlayerStatusIcon name="layers" size={18} /></span>
        </div>
        <p className="player-status__data-contract-intro">數字來自 Supabase `player_events`；沒有收到的事件會顯示為空白，不會用示範資料或亂數補上。</p>
        <ul className="player-status__event-list">
          {['session_started', 'level_started', 'level_completed', 'level_failed', 'hint_used', 'session_ended'].map((event) => <li key={event}><code>{event}</code></li>)}
        </ul>
      </article>

      <article className="player-status__card player-status__data-contract-card">
        <div className="player-status__card-heading">
          <div><p className="player-status__eyebrow">計算規則</p><h2>每個數字都要能追溯</h2></div>
          <span className="player-status__heading-icon player-status__heading-icon--yellow"><PlayerStatusIcon name="target" size={18} /></span>
        </div>
        <dl className="player-status__definition-list">
          {PLAYER_STATUS_METRIC_DEFINITIONS.map((item) => <div key={item.metric}><dt>{item.metric}</dt><dd>{item.definition}</dd><small>來源：{item.source}</small></div>)}
        </dl>
      </article>
    </section>
  )
}

function MetricCard({ icon, label, value, detail }: { icon: 'users' | 'target' | 'clock' | 'spark'; label: string; value: string; detail: string }) {
  return <article className="player-status__metric"><span className="player-status__metric-icon"><PlayerStatusIcon name={icon} size={17} /></span><div className="player-status__metric-content"><p>{label}</p><div className="player-status__metric-value-row"><strong>{value}</strong></div><small>{detail}</small></div></article>
}

function Metrics({ data }: { data: Extract<PlayerStatusData, { status: 'ready' | 'empty' }> }) {
  const { summary } = data
  return <section className="player-status__metric-grid" aria-label="真實指標">
    <MetricCard icon="users" label="活躍玩家" value={formatNumber(summary.activePlayers)} detail={`${formatNumber(summary.events)} 筆有效事件`} />
    <MetricCard icon="target" label="關卡完成率" value={completionRate(summary.attempts, summary.completedAttempts)} detail={`${formatNumber(summary.completedAttempts)} / ${formatNumber(summary.attempts)} 次嘗試`} />
    <MetricCard icon="clock" label="平均過關時間" value={formatDuration(summary.averageClearTimeMs)} detail={`中位數 ${formatDuration(summary.medianClearTimeMs)}`} />
    <MetricCard icon="spark" label="平均星等" value={summary.averageStars === null ? '—' : summary.averageStars.toFixed(2)} detail={`${formatNumber(summary.hints)} 次提示事件`} />
  </section>
}

function LevelHealth({ levels }: { levels: PlayerStatusLevel[] }) {
  return <section id="levels" className="player-status__levels-layout" aria-label="關卡健康">
    <article className="player-status__card player-status__level-card">
      <div className="player-status__card-heading"><div><p className="player-status__eyebrow">Level health</p><h2>關卡完成與過關時間</h2></div><span className="player-status__heading-icon"><PlayerStatusIcon name="clock" size={18} /></span></div>
      {levels.length === 0 ? <p className="player-status__card-note">目前期間沒有包含 level_id 的關卡事件，因此不顯示關卡排名或推測。</p> : <div className="player-status__table-wrap"><table><thead><tr><th>關卡</th><th>嘗試</th><th>完成率</th><th>平均時間</th><th>中位數</th><th>平均星等</th><th>失敗</th></tr></thead><tbody>{levels.map((level) => <tr key={level.levelId}><td><strong>第 {level.levelId} 關</strong></td><td>{formatNumber(level.attempts)}</td><td>{completionRate(level.attempts, level.completedAttempts)}</td><td>{formatDuration(level.averageClearTimeMs)}</td><td>{formatDuration(level.medianClearTimeMs)}</td><td>{level.averageStars === null ? '—' : level.averageStars.toFixed(2)}</td><td>{formatNumber(level.failures)}</td></tr>)}</tbody></table></div>}
    </article>
  </section>
}

function StatusMessage({ data }: { data: PlayerStatusData }) {
  if (data.status === 'empty') {
    return <section className="player-status__data-empty" aria-labelledby="player-status-empty-heading"><div className="player-status__data-empty-icon"><PlayerStatusIcon name="clock" size={24} /></div><div className="player-status__data-empty-copy"><p className="player-status__eyebrow">資料完整性</p><h2 id="player-status-empty-heading">已接入，但目前沒有事件</h2><p>{`${data.rangeLabel} Supabase 實際回傳 0 筆事件。這是空樣本，不代表完成率為 0%，也不會顯示推測數字。`}</p><div className="player-status__data-empty-status"><span>資料來源</span><strong>Supabase</strong><span>目前狀態</span><strong>等待真實事件</strong></div></div></section>
  }
  if (data.status !== 'unavailable') return null
  const description = `${data.rangeLabel}${data.reason}`
  return <section className="player-status__data-empty" aria-labelledby="player-status-empty-heading"><div className="player-status__data-empty-icon"><PlayerStatusIcon name="alert" size={24} /></div><div className="player-status__data-empty-copy"><p className="player-status__eyebrow">資料完整性</p><h2 id="player-status-empty-heading">尚無可驗證的玩家資料</h2><p>{description}</p><div className="player-status__data-empty-status"><span>資料來源</span><strong>{data.source === 'query-error' ? '查詢失敗' : '尚未設定'}</strong><span>目前狀態</span><strong>不顯示數字</strong></div></div></section>
}

export function PlayerStatusScreen() {
  const [range, setRange] = useState<RangeKey>('7d')
  const [data, setData] = useState<PlayerStatusData>(() => getPlayerStatusData('7d'))
  const [loading, setLoading] = useState(false)
  const refresh = useCallback(async (nextRange: RangeKey) => {
    setLoading(true)
    const next = await fetchPlayerStatusData(nextRange)
    setData(next)
    setLoading(false)
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    void fetchPlayerStatusData(range).then((next) => { if (active) { setData(next); setLoading(false) } })
    return () => { active = false }
  }, [range])

  const hasMetrics = data.status === 'ready' || data.status === 'empty'
  const connected = hasMetrics || data.source === 'query-error'
  const badge = data.status === 'ready' ? '已接收真實資料' : data.status === 'empty' ? '已接入，等待事件' : data.source === 'query-error' ? '查詢需檢查' : '資料尚未接入'

  return <main className="player-status">
    <aside className="player-status__sidebar" aria-label="玩家狀態導覽"><a href="/player-status" className="player-status__brand" aria-label="MeowBox 玩家狀態首頁"><span className="player-status__brand-mark">M</span><span><strong>MeowBox</strong><small>PLAYER LAB</small></span></a><div className="player-status__workspace"><span className={`player-status__workspace-dot${connected ? '' : ' player-status__workspace-dot--pending'}`} /> MeowBox / data source <span className="player-status__workspace-caret">⌄</span></div><Navigation /><div className="player-status__sidebar-footer"><div className={`player-status__build-dot${connected ? '' : ' player-status__build-dot--pending'}`} />{connected ? 'Supabase analytics' : '資料來源未設定'} <small>{loading ? '讀取中' : '實際事件'}</small></div></aside>
    <section className="player-status__main">
      <header className="player-status__header"><div><p className="player-status__breadcrumb">MEOWBOX <span>/</span> PLAYER ANALYTICS</p><h1>玩家狀態</h1><p className="player-status__subtitle">只顯示能由 Supabase 實際事件驗證的玩家行為，不用估算數字填空。</p></div><div className="player-status__header-actions"><span className="player-status__data-badge"><i aria-hidden="true" />{badge}</span><span className="player-status__updated">{data.status === 'ready' || data.status === 'empty' ? formatFetchedAt(data.fetchedAt) : '尚未更新'}</span><button type="button" className="player-status__icon-button" aria-label="重新整理資料" disabled={loading || data.source === 'not-configured'} onClick={() => void refresh(range)} title={data.source === 'not-configured' ? '尚未設定資料來源' : '重新整理資料'}><PlayerStatusIcon name="refresh" size={16} /></button></div></header>
      <div className="player-status__toolbar"><div className="player-status__range" aria-label="資料期間">{PLAYER_STATUS_RANGES.map((item) => <button key={item.key} type="button" className={item.key === range ? 'is-active' : undefined} aria-pressed={item.key === range} onClick={() => { if (item.key === range) void refresh(item.key); else { setRange(item.key); setData(getPlayerStatusData(item.key)) } }}>{item.label}</button>)}</div><div className="player-status__toolbar-actions"><button type="button" className="player-status__secondary-button" disabled><PlayerStatusIcon name="filter" size={15} />篩選</button><button type="button" className="player-status__secondary-button" disabled><PlayerStatusIcon name="download" size={15} />匯出資料</button></div></div>
      {hasMetrics && <Metrics data={data as Extract<PlayerStatusData, { status: 'ready' | 'empty' }>} />}
      {data.status !== 'ready' && <StatusMessage data={data} />}
      {data.status === 'ready' && <LevelHealth levels={data.levels} />}
      <DataContract />
      <section className="player-status__data-next" aria-labelledby="player-status-next-heading"><div className="player-status__data-next-icon"><PlayerStatusIcon name="clock" size={20} /></div><div><p className="player-status__eyebrow">可信度規則</p><h2 id="player-status-next-heading">過關時間會跟著真實完成事件更新</h2><p>只有遊戲實際送出 level_completed 且帶有 clear_time_ms，才會進入平均與中位數；缺少資料時顯示「—」，不把空樣本當成 0。</p></div><ol><li>匿名 Supabase 使用者 ID 去重</li><li>attempt_id 連結開始、完成與失敗</li><li>RLS 阻擋前端讀取原始事件</li></ol></section>
      <footer className="player-status__footer">MeowBox Player Lab <span>•</span> 正式頁面只顯示已接收、可追溯的事件資料。</footer>
    </section>
  </main>
}
