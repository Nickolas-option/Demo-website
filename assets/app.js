const state = {
  reports: [],
  selectedSlug: null,
}

const formatMetric = (value, digits) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-'
  return value.toFixed(digits)
}

const formatPercent = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-'
  return `${value.toFixed(1)}%`
}

const selectedFromHash = () => window.location.hash.replace(/^#/, '')

const setSelectedReport = (report) => {
  state.selectedSlug = report.slug
  window.location.hash = report.slug

  document.getElementById('selected-title').textContent = report.title
  document.getElementById('selected-subtitle').textContent = `${report.subtitle} · ${report.run_name}`
  document.getElementById('open-report-link').href = report.report_url
  document.getElementById('open-core-link').href = report.artifacts.core_output_json
  document.getElementById('meta-dataset').textContent = report.dataset
  document.getElementById('meta-scale').textContent = report.scale
  document.getElementById('meta-setup').textContent = report.setup
  document.getElementById('meta-examples').textContent = report.examples_used
  document.getElementById('meta-score').textContent = formatMetric(report.metrics.score_stability, 4)
  document.getElementById('meta-ranking').textContent = formatMetric(report.metrics.ranking_stability, 3)
  document.getElementById('report-frame').src = report.report_url

  document.querySelectorAll('.report-button').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.slug === report.slug)
  })
}

const renderReportButton = (report) => {
  const button = document.createElement('button')
  button.type = 'button'
  button.className = 'report-button'
  button.dataset.slug = report.slug
  button.innerHTML = `
    <div class="report-button-top">
      <h3>${report.title}</h3>
      <span class="chip">${report.setup}</span>
    </div>
    <p class="model">${report.subtitle}</p>
    <div class="chip-row">
      <span class="chip">${report.dataset}</span>
      <span class="chip">scale ${report.scale}</span>
      <span class="chip">${report.examples_used}</span>
    </div>
    <div class="metrics-row">
      <div class="metric-box">
        <span class="metric-name">Score Stability</span>
        <span class="metric-value">${formatMetric(report.metrics.score_stability, 4)}</span>
      </div>
      <div class="metric-box">
        <span class="metric-name">Ranking Stability</span>
        <span class="metric-value">${formatMetric(report.metrics.ranking_stability, 3)}</span>
      </div>
      <div class="metric-box">
        <span class="metric-name">Ties</span>
        <span class="metric-value">${formatPercent(report.metrics.ties)}</span>
      </div>
    </div>
  `
  button.addEventListener('click', () => setSelectedReport(report))
  return button
}

const renderReports = () => {
  const list = document.getElementById('report-list')
  list.innerHTML = ''
  state.reports.forEach((report) => {
    list.appendChild(renderReportButton(report))
  })
  const initialSlug = selectedFromHash()
  const initialReport = state.reports.find((report) => report.slug === initialSlug) || state.reports[0]
  if (initialReport) {
    setSelectedReport(initialReport)
  }
}

const loadReports = async () => {
  const response = await fetch('reports/manifest.json')
  if (!response.ok) {
    throw new Error(`Failed to load report manifest: ${response.status}`)
  }
  const payload = await response.json()
  state.reports = payload.reports || []
  renderReports()
}

window.addEventListener('hashchange', () => {
  const nextSlug = selectedFromHash()
  const nextReport = state.reports.find((report) => report.slug === nextSlug)
  if (nextReport && nextReport.slug !== state.selectedSlug) {
    setSelectedReport(nextReport)
  }
})

loadReports().catch((error) => {
  document.getElementById('report-list').innerHTML = `<p>${error.message}</p>`
})
