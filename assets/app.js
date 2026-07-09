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
  document.getElementById('selected-subtitle').textContent = report.subtitle
  document.getElementById('open-report-link').href = report.report_url
  document.getElementById('meta-dataset').textContent = report.dataset
  document.getElementById('meta-scale').textContent = `Scale ${report.scale}`
  document.getElementById('meta-setup').textContent = `${report.paraphrases} paraphrases · ${report.seeds} seeds`
  document.getElementById('meta-examples').textContent = report.examples_used
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
    <h3>${report.title}</h3>
    <p class="model">${report.subtitle}</p>
    <div class="report-button-meta">
      Score stability ${formatMetric(report.metrics.score_stability, 4)} ·
      Ranking stability ${formatMetric(report.metrics.ranking_stability, 3)} ·
      Ties ${formatPercent(report.metrics.ties)}
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
