const state = {
  reports: [],
  selectedSlug: null,
}

const byId = (id) => document.getElementById(id)

const selectedFromHash = () => window.location.hash.replace(/^#/, '')

const setSelectedReport = (report, { scrollToViewer = false } = {}) => {
  state.selectedSlug = report.slug
  window.location.hash = report.slug

  const selectedTitle = byId('selected-title')
  const selectedSubtitle = byId('selected-subtitle')
  const openReportLink = byId('open-report-link')
  const reportFrame = byId('report-frame')

  if (selectedTitle) selectedTitle.textContent = report.title
  if (selectedSubtitle) selectedSubtitle.textContent = report.subtitle
  if (openReportLink) openReportLink.href = report.report_url
  if (reportFrame) reportFrame.src = report.report_url

  document.querySelectorAll('.report-button').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.slug === report.slug)
  })

  if (scrollToViewer && window.matchMedia('(max-width: 1100px)').matches) {
    document.querySelector('.viewer-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
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
  button.addEventListener('click', () => setSelectedReport(report, { scrollToViewer: true }))
  return button
}

const renderReports = () => {
  const list = byId('report-list')
  if (!list) return
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
  const response = await fetch('reports/manifest.json', { cache: 'no-store' })
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
  const list = byId('report-list')
  if (list) {
    list.innerHTML = `<p>${error.message}</p>`
  }
})
