const state = {
  reports: [],
  selectedSlug: null,
}

const selectedFromHash = () => window.location.hash.replace(/^#/, '')

const setSelectedReport = (report) => {
  state.selectedSlug = report.slug
  window.location.hash = report.slug

  document.getElementById('selected-title').textContent = report.title
  document.getElementById('selected-subtitle').textContent = report.subtitle
  document.getElementById('open-report-link').href = report.report_url
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
