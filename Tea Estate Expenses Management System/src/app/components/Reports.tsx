import { useState } from 'react';
import { Download, FileText, Filter, BarChart3, Eye, FileSpreadsheet } from 'lucide-react';
import { estates, sections, services, workers, dailyAssignments, expenses, serviceRates } from '../data/mockData';

type ReportType = 'worker-payments' | 'daily-assignments' | 'expenses' | 'harvest-summary';

const reportTypes = [
  { id: 'worker-payments' as ReportType, label: 'Worker Payments', icon: '💰', description: 'Payment summary per worker for selected period' },
  { id: 'daily-assignments' as ReportType, label: 'Daily Assignments', icon: '📋', description: 'Detailed work assignments with units and amounts' },
  { id: 'expenses' as ReportType, label: 'Expense Report', icon: '💸', description: 'Categorized expense breakdown by estate/section' },
  { id: 'harvest-summary' as ReportType, label: 'Harvest Summary', icon: '🍃', description: 'Total harvest (KG) by section and service type' },
];

interface ReportRow {
  [key: string]: string | number;
}

function generateReport(type: ReportType, filters: { from: string; to: string; estateId: string; sectionId: string; workerId: string; serviceId: string }) {
  const { from, to, estateId, sectionId, workerId, serviceId } = filters;

  if (type === 'worker-payments') {
    const rows: ReportRow[] = [];
    const filteredAssignments = dailyAssignments.filter(a =>
      (!from || a.date >= from) &&
      (!to || a.date <= to) &&
      (!estateId || a.estateId === estateId) &&
      (!sectionId || a.sectionId === sectionId) &&
      (!serviceId || a.serviceId === serviceId)
    );

    const workerTotals: Record<string, { units: number; amount: number; days: number }> = {};
    filteredAssignments.forEach(a => {
      a.assignments.forEach(wa => {
        if (workerId && wa.workerId !== workerId) return;
        if (!workerTotals[wa.workerId]) workerTotals[wa.workerId] = { units: 0, amount: 0, days: 0 };
        workerTotals[wa.workerId].units += wa.unitsCompleted;
        workerTotals[wa.workerId].amount += wa.paymentAmount;
        workerTotals[wa.workerId].days += 1;
      });
    });

    Object.entries(workerTotals).forEach(([wId, totals]) => {
      const w = workers.find(wk => wk.id === wId);
      rows.push({
        'Employee ID': w?.employeeId || '',
        'Worker Name': w?.name || '',
        'Total Days': totals.days,
        'Total Units': totals.units.toFixed(1),
        'Total Payment (LKR)': totals.amount.toLocaleString(),
      });
    });
    return { columns: ['Employee ID', 'Worker Name', 'Total Days', 'Total Units', 'Total Payment (LKR)'], rows };
  }

  if (type === 'daily-assignments') {
    const filteredAssignments = dailyAssignments.filter(a =>
      (!from || a.date >= from) &&
      (!to || a.date <= to) &&
      (!estateId || a.estateId === estateId) &&
      (!sectionId || a.sectionId === sectionId) &&
      (!serviceId || a.serviceId === serviceId)
    );

    const rows: ReportRow[] = [];
    filteredAssignments.forEach(a => {
      const estate = estates.find(e => e.id === a.estateId);
      const section = sections.find(s => s.id === a.sectionId);
      const service = services.find(s => s.id === a.serviceId);
      const rate = serviceRates.find(r => r.id === a.serviceRateId);

      a.assignments.forEach(wa => {
        if (workerId && wa.workerId !== workerId) return;
        const w = workers.find(wk => wk.id === wa.workerId);
        rows.push({
          'Date': a.date,
          'Estate': estate?.name || '',
          'Section': section?.name || '',
          'Service': service?.name || '',
          'Worker': w?.name || '',
          'Employee ID': w?.employeeId || '',
          'Units': wa.unitsCompleted,
          'Unit Type': rate?.unit || '',
          'Rate (LKR)': rate?.ratePerUnit || 0,
          'Payment (LKR)': wa.paymentAmount.toLocaleString(),
          'Status': a.status,
        });
      });
    });
    return { columns: ['Date', 'Estate', 'Section', 'Service', 'Worker', 'Employee ID', 'Units', 'Unit Type', 'Rate (LKR)', 'Payment (LKR)', 'Status'], rows };
  }

  if (type === 'expenses') {
    const filteredExpenses = expenses.filter(e =>
      (!from || e.date >= from) &&
      (!to || e.date <= to) &&
      (!estateId || e.estateId === estateId) &&
      (!sectionId || !e.sectionId || e.sectionId === sectionId)
    );

    const rows: ReportRow[] = filteredExpenses.map(e => ({
      'Date': e.date,
      'Category': e.category,
      'Description': e.description,
      'Estate': estates.find(es => es.id === e.estateId)?.name || '',
      'Section': sections.find(s => s.id === e.sectionId)?.name || 'All',
      'Amount (LKR)': e.amount.toLocaleString(),
      'Status': e.status,
    }));
    return { columns: ['Date', 'Category', 'Description', 'Estate', 'Section', 'Amount (LKR)', 'Status'], rows };
  }

  // harvest-summary
  const filteredAssignments = dailyAssignments.filter(a =>
    (!from || a.date >= from) &&
    (!to || a.date <= to) &&
    (!estateId || a.estateId === estateId) &&
    (!sectionId || a.sectionId === sectionId) &&
    a.serviceId === 'sv1' // Leaf Plucking
  );

  const sectionTotals: Record<string, number> = {};
  filteredAssignments.forEach(a => {
    if (!sectionTotals[a.sectionId]) sectionTotals[a.sectionId] = 0;
    sectionTotals[a.sectionId] += a.assignments.reduce((s, wa) => s + wa.unitsCompleted, 0);
  });

  const rows: ReportRow[] = Object.entries(sectionTotals).map(([sId, total]) => {
    const section = sections.find(s => s.id === sId);
    const estate = estates.find(e => e.id === section?.estateId);
    return {
      'Estate': estate?.name || '',
      'Section': section?.name || '',
      'Total KG Harvested': total.toFixed(1),
      'No. of Assignments': filteredAssignments.filter(a => a.sectionId === sId).length,
    };
  });

  return { columns: ['Estate', 'Section', 'Total KG Harvested', 'No. of Assignments'], rows };
}

export function Reports() {
  const [reportType, setReportType] = useState<ReportType>('worker-payments');
  const [filters, setFilters] = useState({
    from: '2026-05-01',
    to: '2026-06-01',
    estateId: '',
    sectionId: '',
    workerId: '',
    serviceId: '',
  });
  const [reportData, setReportData] = useState<{ columns: string[]; rows: ReportRow[] } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadMsg, setDownloadMsg] = useState('');

  const estateSections = sections.filter(s => s.estateId === filters.estateId);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const data = generateReport(reportType, filters);
      setReportData(data);
      setIsGenerating(false);
    }, 800);
  };

  const handleDownload = (format: 'excel' | 'pdf') => {
    setDownloadMsg(`${format === 'excel' ? 'Excel' : 'PDF'} report downloaded successfully!`);
    setTimeout(() => setDownloadMsg(''), 3000);
  };

  const totalRows = reportData?.rows.length || 0;

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Reports</h1>
          <p className="text-gray-500 text-sm mt-0.5">Generate and export detailed estate reports</p>
        </div>
      </div>

      {/* Download Success */}
      {downloadMsg && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700">
          <FileText className="w-4 h-4 flex-shrink-0" />
          <p className="text-sm">{downloadMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        {/* Filter Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="text-gray-800 mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              Report Filters
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1.5">Report Type</label>
                <div className="space-y-2">
                  {reportTypes.map(rt => (
                    <button
                      key={rt.id}
                      onClick={() => { setReportType(rt.id); setReportData(null); }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition-all ${reportType === rt.id ? 'border-green-500 bg-green-50' : 'border-gray-100 hover:border-green-200'}`}
                    >
                      <span className="text-xl">{rt.icon}</span>
                      <div>
                        <p className={`text-xs font-medium ${reportType === rt.id ? 'text-green-700' : 'text-gray-700'}`}>{rt.label}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">From Date</label>
                  <input type="date" value={filters.from} onChange={e => setFilters(f => ({ ...f, from: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">To Date</label>
                  <input type="date" value={filters.to} onChange={e => setFilters(f => ({ ...f, to: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Estate</label>
                  <select value={filters.estateId} onChange={e => setFilters(f => ({ ...f, estateId: e.target.value, sectionId: '' }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                    <option value="">All Estates</option>
                    {estates.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                </div>
                {filters.estateId && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Section</label>
                    <select value={filters.sectionId} onChange={e => setFilters(f => ({ ...f, sectionId: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                      <option value="">All Sections</option>
                      {estateSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                )}
                {(reportType === 'worker-payments' || reportType === 'daily-assignments') && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Worker</label>
                    <select value={filters.workerId} onChange={e => setFilters(f => ({ ...f, workerId: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                      <option value="">All Workers</option>
                      {workers.filter(w => !filters.estateId || w.estateId === filters.estateId).map(w => (
                        <option key={w.id} value={w.id}>{w.name} ({w.employeeId})</option>
                      ))}
                    </select>
                  </div>
                )}
                {(reportType === 'daily-assignments') && (
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Service</label>
                    <select value={filters.serviceId} onChange={e => setFilters(f => ({ ...f, serviceId: e.target.value }))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-white">
                      <option value="">All Services</option>
                      {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                )}
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-3 rounded-xl text-sm transition-colors"
              >
                {isGenerating ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
        </div>

        {/* Report Preview */}
        <div className="lg:col-span-3">
          {!reportData ? (
            <div className="h-full min-h-96 flex flex-col items-center justify-center bg-white rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
              <BarChart3 className="w-14 h-14 mb-3 opacity-20" />
              <p className="text-sm">Configure filters and generate report</p>
              <p className="text-xs mt-1">Select report type, date range, and filters</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Report Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h3 className="text-gray-800">{reportTypes.find(r => r.id === reportType)?.label}</h3>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {filters.from} to {filters.to} · {totalRows} records
                    {filters.estateId && ` · ${estates.find(e => e.id === filters.estateId)?.name}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownload('excel')}
                    className="flex items-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl text-sm transition-colors border border-green-200"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Excel
                  </button>
                  <button
                    onClick={() => handleDownload('pdf')}
                    className="flex items-center gap-2 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-sm transition-colors border border-red-200"
                  >
                    <FileText className="w-4 h-4" />
                    PDF
                  </button>
                </div>
              </div>

              {/* Summary Stats */}
              {reportData.rows.length > 0 && (
                <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="text-gray-600">Total Records: <strong className="text-gray-800">{totalRows}</strong></span>
                    {reportType === 'worker-payments' && (
                      <span className="text-gray-600">
                        Total Amount: <strong className="text-green-700">
                          LKR {reportData.rows.reduce((s, r) => s + Number(String(r['Total Payment (LKR)']).replace(/,/g, '')), 0).toLocaleString()}
                        </strong>
                      </span>
                    )}
                    {reportType === 'expenses' && (
                      <span className="text-gray-600">
                        Total Expenses: <strong className="text-red-700">
                          LKR {reportData.rows.reduce((s, r) => s + Number(String(r['Amount (LKR)']).replace(/,/g, '')), 0).toLocaleString()}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                {reportData.rows.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No data found for selected filters</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0 text-xs text-gray-500 uppercase tracking-wide">
                      <tr>
                        <th className="text-left px-4 py-3 w-8">#</th>
                        {reportData.columns.map(col => (
                          <th key={col} className="text-left px-4 py-3 whitespace-nowrap">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {reportData.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-400 text-xs">{i + 1}</td>
                          {reportData.columns.map(col => (
                            <td key={col} className="px-4 py-3 text-gray-700 whitespace-nowrap">
                              {col.includes('Payment') || col.includes('Amount') || col.includes('Rate') ? (
                                <span className="text-green-700 font-medium">{row[col]}</span>
                              ) : col === 'Status' ? (
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  row[col] === 'approved' ? 'bg-green-100 text-green-700' :
                                  row[col] === 'completed' ? 'bg-blue-100 text-blue-700' :
                                  row[col] === 'rejected' ? 'bg-red-100 text-red-600' :
                                  'bg-orange-100 text-orange-700'
                                }`}>{row[col]}</span>
                              ) : (
                                <span>{row[col]}</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
