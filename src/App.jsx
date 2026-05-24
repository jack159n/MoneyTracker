import { useCallback, useEffect, useMemo, useState } from 'react';
import { hasSupabaseConfig, supabase, supabaseConfigError } from './supabaseClient.js';

import {
  BarChart3,
  CheckCircle2,
  Copy,
  Download,
  Pencil,
  Plus,
  Search,
  Smartphone,
  Trash2,
  X,
} from 'lucide-react';

const appName = '\u5169\u4eba\u5c0f\u5e33\u672c';

const categories = [
  '\u98f2\u98df',
  '\u4ea4\u901a',
  '\u751f\u6d3b',
  '\u7d04\u6703',
  '\u623f\u79df',
  '\u5176\u4ed6',
];

const categoryColors = ['#17324d', '#2b6f74', '#d75a4a', '#b9852f', '#6d597a', '#5e6470'];
const categoryColorMap = {
  '\u98f2\u98df': { background: '#f5ded6', color: '#8d3226' },
  '\u4ea4\u901a': { background: '#dcebed', color: '#1e5e64' },
  '\u751f\u6d3b': { background: '#e4eadb', color: '#47622d' },
  '\u7d04\u6703': { background: '#f2dfeb', color: '#7a3e68' },
  '\u623f\u79df': { background: '#e1e5ef', color: '#283f67' },
  '\u5176\u4ed6': { background: '#eee7dd', color: '#5e5143' },
};
const jointPayerLabel = 'Jay&Ling';

const quickTemplates = [
  { title: '\u65e9\u9910', category: '\u98f2\u98df' },
  { title: '\u5348\u9910', category: '\u98f2\u98df' },
  { title: '\u665a\u9910', category: '\u98f2\u98df' },
  { title: '\u98f2\u6599', category: '\u98f2\u98df' },
  { title: '\u4ea4\u901a', category: '\u4ea4\u901a' },
  { title: '\u623f\u79df', category: '\u623f\u79df' },
  { title: '\u7d04\u6703', category: '\u7d04\u6703' },
];

const text = {
  appKicker: '\u5169\u4eba\u5171\u540c\u8a18\u5e33',
  month: '\u6708\u4efd',
  total: '\u672c\u6708\u7e3d\u652f\u51fa',
  records: '\u7b46\u7d00\u9304',
  payerSummary: '\u4ed8\u6b3e\u4f86\u6e90',
  payerSummaryHint: '\u7d00\u9304\u9019\u500b\u6708\u7684\u82b1\u8cbb\u662f\u7531\u8ab0\u4ed8\u6b3e',
  categoryChart: '\u672c\u6708\u5206\u985e\u5713\u9905\u5716',
  chartTitle: '\u672c\u6708\u5716\u8868',
  chartEmpty: '\u6709\u65b0\u589e\u652f\u51fa\u5f8c\uff0c\u9019\u88e1\u6703\u986f\u793a\u6bd4\u4f8b\u3002',
  chartModeTotal: '\u7e3d\u984d',
  chartModePayer: '\u4ed8\u6b3e\u4eba',
  installTip: '\u7528 iPhone Safari \u5206\u4eab\u9078\u55ae\u52a0\u5230\u4e3b\u756b\u9762\uff0c\u4e0b\u6b21\u5c31\u50cf App \u4e00\u6a23\u6253\u958b\u3002',
  all: '\u5168\u90e8',
  user: 'User',
  dateRange: '\u65e5\u671f',
  thisMonth: '\u672c\u6708',
  thisWeek: '\u672c\u9031',
  lastWeek: '\u4e0a\u9031',
  specificDay: '\u67d0\u65e5',
  paid: '\u5df2\u4ed8\u6b3e',
  addOne: '\u65b0\u589e\u4e00\u7b46',
  quickTemplates: '\u5e38\u7528\u652f\u51fa',
  export: '\u532f\u51fa',
  title: '\u540d\u7a31',
  titlePlaceholder: '\u65e9\u9910\u3001\u96fb\u5f71\u7968\u3001\u6c34\u96fb\u8cbb',
  amount: '\u91d1\u984d',
  date: '\u65e5\u671f',
  payer: '\u8ab0\u4ed8\u6b3e',
  category: '\u5206\u985e',
  note: '\u5099\u8a3b',
  optional: '\u53ef\u4e0d\u586b',
  addExpense: '\u65b0\u589e\u652f\u51fa',
  details: '\u672c\u6708\u660e\u7d30',
  empty: '\u9019\u500b\u6708\u9084\u6c92\u6709\u652f\u51fa\u3002',
  search: '\u641c\u5c0b',
  searchPlaceholder: '\u641c\u5c0b\u540d\u7a31\u6216\u5099\u8a3b',
  sort: '\u6392\u5e8f',
  newest: '\u6700\u65b0',
  amountHigh: '\u91d1\u984d\u5927\u5230\u5c0f',
  amountLow: '\u91d1\u984d\u5c0f\u5230\u5927',
  edit: '\u7de8\u8f2f',
  save: '\u5132\u5b58',
  cancel: '\u53d6\u6d88',
  copy: '\u8907\u88fd',
  copiedToForm: '\u5df2\u8907\u88fd\u5230\u65b0\u589e\u8868\u55ae',
  delete: '\u522a\u9664',
  confirmDelete: '\u78ba\u8a8d\u522a\u9664',
  signInTitle: '\u767b\u5165\u5171\u540c\u5e33\u672c',
  signInCopy: '\u7528\u5df2\u5efa\u7acb\u7684 email \u548c\u5bc6\u78bc\u767b\u5165\u3002',
  email: 'Email',
  password: '\u5bc6\u78bc',
  passwordHint: '\u81f3\u5c11 6 \u500b\u5b57\u5143',
  signIn: '\u767b\u5165',
  signOut: '\u767b\u51fa',
  loading: '\u8f09\u5165\u4e2d...',
  setupTitle: '\u9700\u8981 Supabase \u8a2d\u5b9a',
  setupCopy: '\u8acb\u5148\u5efa\u7acb .env.local\uff0c\u653e\u5165 VITE_SUPABASE_URL \u548c VITE_SUPABASE_ANON_KEY\u3002',
  setupError: 'Supabase config error',
  lockedTitle: '\u9019\u500b\u5e33\u865f\u9084\u4e0d\u5728\u5171\u540c\u5e33\u672c\u88e1',
  lockedCopy: '\u8acb\u5230 Supabase Auth \u8907\u88fd\u9019\u500b user id\uff0c\u518d\u628a\u5b83\u52a0\u5230 members \u8868\u3002',
  reload: '\u91cd\u65b0\u8f09\u5165',
  noMembers: '\u9084\u6c92\u6709\u6210\u54e1\u8cc7\u6599',
  equal: '\u9019\u500b\u6708\u525b\u597d\u6253\u5e73',
  owedTo: '\u8981\u7d66',
  createdBy: '\u4ed8\u6b3e',
  added: '\u5df2\u65b0\u589e',
};

function normalizeCategory(category) {
  return category === '\u5403\u98ef' ? '\u98f2\u98df' : category;
}

function getCategoryStyle(category) {
  return categoryColorMap[normalizeCategory(category)] || categoryColorMap['\u5176\u4ed6'];
}

function polarToCartesian(center, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: center + radius * Math.cos(angleInRadians),
    y: center + radius * Math.sin(angleInRadians),
  };
}

function describeArc(center, radius, startAngle, endAngle) {
  const start = polarToCartesian(center, radius, endAngle);
  const end = polarToCartesian(center, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${center} ${center} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`;
}

function makeSlices(entries, total, palette = categoryColors) {
  return entries
    .filter(([, amount]) => Number(amount) > 0)
    .map(([category, amount], index) => ({
      category,
      amount,
      percent: total ? amount / total : 0,
      color: palette[index % palette.length],
    }))
    .sort((first, second) => second.amount - first.amount);
}

function buildCategorySummary(expenses, filterPayerLabel) {
  const totals = new Map();
  expenses.forEach((expense) => {
    const payerLabel = expense.payer_label || expense.payer?.display_name || jointPayerLabel;
    if (filterPayerLabel && payerLabel !== filterPayerLabel) return;
    const category = normalizeCategory(expense.category);
    totals.set(category, (totals.get(category) || 0) + Number(expense.amount));
  });

  const total = [...totals.values()].reduce((sum, amount) => sum + amount, 0);
  return { total, slices: makeSlices([...totals.entries()], total) };
}

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function addDays(date, days) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

function getWeekBounds(offsetWeeks = 0) {
  const today = startOfDay(new Date());
  const mondayOffset = (today.getDay() + 6) % 7;
  const start = addDays(today, -mondayOffset + offsetWeeks * 7);
  const end = addDays(start, 7);
  return { start, end };
}

function PieChartBlock({ modes, activeMode, onModeChange }) {
  const selectedMode = modes.find((mode) => mode.key === activeMode) || modes[0];
  const slices = selectedMode?.slices || [];
  const total = selectedMode?.total || 0;

  if (!slices.length) {
    return (
      <section className="chart-panel">
        <div className="section-title">
          <h2>
            <BarChart3 size={18} aria-hidden="true" />
            {text.chartTitle}
          </h2>
        </div>
        <div className="chart-mode-scroll" aria-label={text.chartTitle}>
          {modes.map((mode) => (
            <button
              className={mode.key === activeMode ? 'active' : ''}
              type="button"
              key={mode.key}
              onClick={() => onModeChange(mode.key)}
            >
              {mode.label}
            </button>
          ))}
        </div>
        <div className="empty-state">{text.chartEmpty}</div>
      </section>
    );
  }

  let angle = 0;

  return (
    <section className="chart-panel">
      <div className="section-title">
        <h2>
          <BarChart3 size={18} aria-hidden="true" />
          {text.chartTitle}
        </h2>
        <span>{money(total)}</span>
      </div>
      <div className="chart-mode-scroll" aria-label={text.chartTitle}>
        {modes.map((mode) => (
          <button
            className={mode.key === activeMode ? 'active' : ''}
            type="button"
            key={mode.key}
            onClick={() => onModeChange(mode.key)}
          >
            {mode.label}
          </button>
        ))}
      </div>
      <div className="chart-layout">
        <div className="pie-wrap" aria-label={selectedMode.label}>
          <svg viewBox="0 0 120 120" role="img">
            {slices.length === 1 ? (
              <circle cx="60" cy="60" r="54" fill={slices[0].color} />
            ) : (
              slices.map((slice) => {
                const startAngle = angle;
                const endAngle = angle + slice.percent * 360;
                angle = endAngle;
                return (
                  <path
                    key={slice.category}
                    d={describeArc(60, 54, startAngle, endAngle)}
                    fill={slice.color}
                    stroke="#fffaf0"
                    strokeWidth="1.6"
                  />
                );
              })
            )}
            <circle cx="60" cy="60" r="28" fill="#fffaf0" />
            <text x="60" y="57" textAnchor="middle" className="pie-total-label">
              Total
            </text>
            <text x="60" y="72" textAnchor="middle" className="pie-total-value">
              {money(total)}
            </text>
          </svg>
        </div>
        <div className="chart-legend">
          {slices.map((slice) => (
            <div className="legend-row" key={slice.category}>
              <span className="legend-dot" style={{ background: slice.color }} />
              <strong>{slice.category}</strong>
              <small>{Math.round(slice.percent * 100)}%</small>
              <span>{money(slice.amount)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function money(value) {
  return new Intl.NumberFormat('zh-TW', {
    style: 'currency',
    currency: 'TWD',
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function monthOf(date) {
  return date.slice(0, 7);
}

function compactExpense(row) {
  return {
    id: row.id,
    date: row.date,
    title: row.title,
    amount: Number(row.amount),
    payer: row.payer,
    payer_label: row.payer_label || row.payer?.display_name || '',
    payer_member_id: row.payer_member_id,
    category: normalizeCategory(row.category),
    note: row.note || '',
  };
}

function App() {
  const [session, setSession] = useState(null);
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [authLoading, setAuthLoading] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [chartMode, setChartMode] = useState('category');
  const [detailFilters, setDetailFilters] = useState({
    payer: 'all',
    category: 'all',
    dateRange: 'month',
    day: todayString(),
    search: '',
    sort: 'newest',
  });
  const [currentMember, setCurrentMember] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    title: '',
    amount: '',
    payer_key: '',
    category: categories[0],
    note: '',
  });
  const [editForm, setEditForm] = useState({
    date: todayString(),
    title: '',
    amount: '',
    payer_key: '',
    category: categories[0],
    note: '',
  });

  const loadLedger = useCallback(async (activeSession) => {
    if (!supabase || !activeSession) return;
    setAppLoading(true);
    setError('');

    const { data: myMember, error: memberError } = await supabase
      .from('members')
      .select('id, couple_id, display_name, user_id')
      .eq('user_id', activeSession.user.id)
      .maybeSingle();

    if (memberError) {
      setError(memberError.message);
      setAppLoading(false);
      return;
    }

    if (!myMember) {
      setCurrentMember(null);
      setMembers([]);
      setExpenses([]);
      setAppLoading(false);
      return;
    }

    const { data: memberRows, error: membersError } = await supabase
      .from('members')
      .select('id, couple_id, display_name, user_id')
      .eq('couple_id', myMember.couple_id)
      .order('created_at');

    if (membersError) {
      setError(membersError.message);
      setAppLoading(false);
      return;
    }

    const { data: expenseRows, error: expensesError } = await supabase
      .from('expenses')
      .select(
        'id, couple_id, payer_member_id, payer_label, date, title, amount, category, note, payer:members!expenses_payer_member_id_fkey(id, display_name, user_id)',
      )
      .eq('couple_id', myMember.couple_id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false });

    if (expensesError) {
      setError(expensesError.message);
      setAppLoading(false);
      return;
    }

    setCurrentMember(myMember);
    setMembers(memberRows || []);
    setExpenses((expenseRows || []).map(compactExpense));
    setForm((current) => ({
      ...current,
      payer_key: myMember.id,
    }));
    setAppLoading(false);
  }, []);

  useEffect(() => {
    if (!supabase) {
      setAppLoading(false);
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) loadLedger(data.session);
      else setAppLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) loadLedger(nextSession);
      else {
        setCurrentMember(null);
        setMembers([]);
        setExpenses([]);
        setForm((current) => ({ ...current, payer_key: '' }));
        setAppLoading(false);
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, [loadLedger]);

  useEffect(() => {
    if (!successMessage) return undefined;
    const timer = window.setTimeout(() => setSuccessMessage(''), 2600);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const months = useMemo(() => {
    const values = [...new Set(expenses.map((expense) => monthOf(expense.date)))].sort().reverse();
    return values.includes(selectedMonth) ? values : [selectedMonth, ...values];
  }, [expenses, selectedMonth]);

  const monthlyExpenses = useMemo(
    () => expenses.filter((expense) => monthOf(expense.date) === selectedMonth),
    [expenses, selectedMonth],
  );

  const payerOptions = useMemo(
    () => [
      ...members.map((member) => ({ key: member.id, label: member.display_name, memberId: member.id })),
      { key: 'joint', label: jointPayerLabel, memberId: currentMember?.id },
    ],
    [currentMember?.id, members],
  );

  const summary = useMemo(() => {
    const payerTotals = new Map(payerOptions.map((option) => [option.label, 0]));

    monthlyExpenses.forEach((expense) => {
      const amount = Number(expense.amount);
      const label = expense.payer_label || expense.payer?.display_name || jointPayerLabel;
      payerTotals.set(label, (payerTotals.get(label) || 0) + amount);
    });

    return {
      total: monthlyExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0),
      count: monthlyExpenses.length,
      payerTotals: [...payerTotals.entries()].map(([label, amount]) => ({ label, amount })),
    };
  }, [monthlyExpenses, payerOptions]);

  const visibleDetailExpenses = useMemo(() => {
    const query = detailFilters.search.trim().toLocaleLowerCase('zh-TW');
    const filtered = monthlyExpenses.filter((expense) => {
      const payerLabel = expense.payer_label || expense.payer?.display_name || jointPayerLabel;
      if (detailFilters.payer !== 'all' && payerLabel !== detailFilters.payer) return false;
      if (detailFilters.category !== 'all' && expense.category !== detailFilters.category) return false;
      if (query) {
        const haystack = `${expense.title} ${expense.note || ''}`.toLocaleLowerCase('zh-TW');
        if (!haystack.includes(query)) return false;
      }

      if (detailFilters.dateRange === 'day') return expense.date === detailFilters.day;

      if (detailFilters.dateRange === 'week' || detailFilters.dateRange === 'last-week') {
        const bounds = getWeekBounds(detailFilters.dateRange === 'week' ? 0 : -1);
        const expenseDate = startOfDay(new Date(`${expense.date}T00:00:00`));
        return expenseDate >= bounds.start && expenseDate < bounds.end;
      }

      return true;
    });

    return [...filtered].sort((first, second) => {
      if (detailFilters.sort === 'amount-high') return second.amount - first.amount;
      if (detailFilters.sort === 'amount-low') return first.amount - second.amount;
      return second.date.localeCompare(first.date);
    });
  }, [detailFilters, monthlyExpenses]);

  const chartModes = useMemo(() => {
    const categorySummary = buildCategorySummary(monthlyExpenses);
    const payerEntries = summary.payerTotals.map((payerTotal) => [payerTotal.label, payerTotal.amount]);
    const payerSummary = {
      total: summary.total,
      slices: makeSlices(payerEntries, summary.total, ['#2b6f74', '#d75a4a', '#17324d']),
    };
    const payerLabels = [...new Set([...payerOptions.map((option) => option.label), jointPayerLabel])];

    return [
      { key: 'category', label: text.chartModeTotal, ...categorySummary },
      { key: 'payer', label: text.chartModePayer, ...payerSummary },
      ...payerLabels.map((label) => ({
        key: `payer-${label}`,
        label,
        ...buildCategorySummary(monthlyExpenses, label),
      })),
    ];
  }, [monthlyExpenses, payerOptions, summary.payerTotals, summary.total]);

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateEditForm(key, value) {
    setEditForm((current) => ({ ...current, [key]: value }));
  }

  function updateDetailFilter(key, value) {
    setDetailFilters((current) => ({ ...current, [key]: value }));
  }

  function applyTemplate(template) {
    setForm((current) => ({
      ...current,
      title: template.title,
      category: template.category,
      amount: '',
    }));
    setEditingExpenseId(null);
    setDeleteTargetId(null);
  }

  function duplicateExpense(expense) {
    const payerLabel = expense.payer_label || expense.payer?.display_name || jointPayerLabel;
    const payerOption = payerOptions.find((option) => option.label === payerLabel);
    const today = todayString();
    setForm({
      date: today,
      title: expense.title,
      amount: String(expense.amount),
      payer_key: payerOption?.key || currentMember?.id || '',
      category: normalizeCategory(expense.category),
      note: expense.note || '',
    });
    setSelectedMonth(monthOf(today));
    setEditingExpenseId(null);
    setDeleteTargetId(null);
    setSuccessMessage(text.copiedToForm);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startEditing(expense) {
    const payerLabel = expense.payer_label || expense.payer?.display_name || jointPayerLabel;
    const payerOption = payerOptions.find((option) => option.label === payerLabel);
    setError('');
    setDeleteTargetId(null);
    setEditingExpenseId(expense.id);
    setEditForm({
      date: expense.date,
      title: expense.title,
      amount: String(expense.amount),
      payer_key: payerOption?.key || 'joint',
      category: normalizeCategory(expense.category),
      note: expense.note || '',
    });
  }

  function stopEditing() {
    setEditingExpenseId(null);
  }

  async function submitAuth(event) {
    event.preventDefault();
    if (!supabase || !authForm.email.trim() || !authForm.password) return;
    setAuthLoading(true);
    setError('');

    const credentials = {
      email: authForm.email.trim(),
      password: authForm.password,
    };

    const { error: authError } = await supabase.auth.signInWithPassword(credentials);

    if (authError) setError(authError.message);
    setAuthLoading(false);
  }

  async function addExpense(event) {
    event.preventDefault();
    if (!supabase || !currentMember) return;
    const amount = Number(form.amount);
    if (!form.title.trim() || !amount || amount <= 0) return;

    setError('');
    setSuccessMessage('');
    const selectedPayer = payerOptions.find((option) => option.key === form.payer_key) || payerOptions[0];
    const payerMemberId = selectedPayer?.key === 'joint' ? currentMember.id : selectedPayer?.memberId;
    const { error: expenseError } = await supabase
      .from('expenses')
      .insert({
        couple_id: currentMember.couple_id,
        payer_member_id: payerMemberId,
        payer_label: selectedPayer?.label || jointPayerLabel,
        date: form.date,
        title: form.title.trim(),
        amount,
        category: form.category,
        note: form.note.trim(),
        created_by: session.user.id,
      });

    if (expenseError) {
      setError(expenseError.message);
      return;
    }

    setSelectedMonth(monthOf(form.date));
    setSuccessMessage(`${text.added} ${form.category} ${money(amount)}`);
    setForm((current) => ({ ...current, title: '', amount: '', note: '' }));
    await loadLedger(session);
  }

  async function saveExpense(event) {
    event.preventDefault();
    if (!supabase || !currentMember || !editingExpenseId) return;
    const amount = Number(editForm.amount);
    if (!editForm.title.trim() || !amount || amount <= 0) return;

    setError('');
    const selectedPayer = payerOptions.find((option) => option.key === editForm.payer_key) || payerOptions[0];
    const payerMemberId = selectedPayer?.key === 'joint' ? currentMember.id : selectedPayer?.memberId;
    const { error: updateError } = await supabase
      .from('expenses')
      .update({
        payer_member_id: payerMemberId,
        payer_label: selectedPayer?.label || jointPayerLabel,
        date: editForm.date,
        title: editForm.title.trim(),
        amount,
        category: editForm.category,
        note: editForm.note.trim(),
      })
      .eq('id', editingExpenseId);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSelectedMonth(monthOf(editForm.date));
    setEditingExpenseId(null);
    await loadLedger(session);
  }

  async function removeExpense(id) {
    if (!supabase) return;
    const { error: deleteError } = await supabase.from('expenses').delete().eq('id', id);
    if (deleteError) setError(deleteError.message);
    else {
      setDeleteTargetId(null);
      if (editingExpenseId === id) setEditingExpenseId(null);
      await loadLedger(session);
    }
  }

  function exportCsv() {
    const rows = [
      ['date', 'title', 'amount', 'payer', 'category', 'note'],
      ...visibleDetailExpenses.map((expense) => [
        expense.date,
        expense.title,
        expense.amount,
        expense.payer_label || expense.payer?.display_name || '',
        expense.category,
        expense.note,
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `our-ledger-${selectedMonth}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!hasSupabaseConfig || !supabase) {
    return (
      <main className="app-shell auth-shell">
        <section className="auth-card">
          <p className="eyebrow">{text.appKicker}</p>
          <h1>{appName}</h1>
          <h2>{text.setupTitle}</h2>
          <p>{text.setupCopy}</p>
          {supabaseConfigError ? <p className="error-message">{text.setupError}: {supabaseConfigError}</p> : null}
          <code>.env.example</code>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="app-shell auth-shell">
        <form className="auth-card" onSubmit={submitAuth}>
          <p className="eyebrow">{text.appKicker}</p>
          <h1>{appName}</h1>
          <h2>{text.signInTitle}</h2>
          <p>{text.signInCopy}</p>
          <label>
            {text.email}
            <input
              value={authForm.email}
              onChange={(event) => setAuthForm((current) => ({ ...current, email: event.target.value }))}
              type="email"
              autoComplete="email"
              required
            />
          </label>
          <label>
            {text.password}
            <input
              value={authForm.password}
              onChange={(event) => setAuthForm((current) => ({ ...current, password: event.target.value }))}
              type="password"
              minLength={6}
              autoComplete="current-password"
              placeholder={text.passwordHint}
              required
            />
          </label>
          <button className="submit-button" type="submit" disabled={authLoading}>
            {authLoading ? text.loading : text.signIn}
          </button>
          {error ? <p className="error-message">{error}</p> : null}
        </form>
      </main>
    );
  }

  if (appLoading) {
    return <main className="app-shell loading-screen">{text.loading}</main>;
  }

  if (!currentMember) {
    return (
      <main className="app-shell auth-shell">
        <section className="auth-card">
          <p className="eyebrow">{text.appKicker}</p>
          <h1>{appName}</h1>
          <h2>{text.lockedTitle}</h2>
          <p>{text.lockedCopy}</p>
          <code>{session.user.id}</code>
          <div className="auth-actions">
            <button className="ghost-button" type="button" onClick={() => loadLedger(session)}>
              {text.reload}
            </button>
            <button className="ghost-button" type="button" onClick={() => supabase.auth.signOut()}>
              {text.signOut}
            </button>
          </div>
          {error ? <p className="error-message">{error}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <section className="top-panel">
        <div>
          <p className="eyebrow">{text.appKicker}</p>
          <h1>{appName}</h1>
        </div>
        <div className="top-actions">
          <div className="month-select">
            <label htmlFor="month">{text.month}</label>
            <select id="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)}>
              {months.map((month) => (
                <option key={month} value={month}>
                  {month}
                </option>
              ))}
            </select>
          </div>
          <button className="ghost-button" type="button" onClick={() => supabase.auth.signOut()}>
            {text.signOut}
          </button>
        </div>
      </section>

      {error ? <p className="error-message">{error}</p> : null}
      {successMessage ? (
        <p className="success-message">
          <CheckCircle2 size={17} aria-hidden="true" />
          {successMessage}
        </p>
      ) : null}

      <section className="summary-grid" aria-label={text.total}>
        <div className="metric primary">
          <span>{text.total}</span>
          <strong>{money(summary.total)}</strong>
          <small>
            {summary.count} {text.records}
          </small>
        </div>
      </section>

      <aside className="install-tip">
        <Smartphone size={18} aria-hidden="true" />
        <span>{text.installTip}</span>
      </aside>

      <form className="expense-form" onSubmit={addExpense}>
        <div className="section-title">
          <h2>
            <Plus size={18} aria-hidden="true" />
            {text.addOne}
          </h2>
          <button className="ghost-button icon-text-button" type="button" onClick={exportCsv}>
            <Download size={16} aria-hidden="true" />
            <span>{text.export}</span>
          </button>
        </div>

        <section className="quick-template-panel" aria-label={text.quickTemplates}>
          <span>{text.quickTemplates}</span>
          <div className="quick-template-list">
            {quickTemplates.map((template) => (
              <button type="button" key={template.title} onClick={() => applyTemplate(template)}>
                {template.title}
              </button>
            ))}
          </div>
        </section>

        <label>
          {text.title}
          <input
            value={form.title}
            onChange={(event) => updateForm('title', event.target.value)}
            placeholder={text.titlePlaceholder}
          />
        </label>

        <div className="two-columns">
          <label>
            {text.amount}
            <input
              inputMode="decimal"
              value={form.amount}
              onChange={(event) => updateForm('amount', event.target.value)}
              placeholder="0"
            />
          </label>
          <label>
            {text.date}
            <input type="date" value={form.date} onChange={(event) => updateForm('date', event.target.value)} />
          </label>
        </div>

        <div className="two-columns">
          <label>
            {text.payer}
            <select value={form.payer_key} onChange={(event) => updateForm('payer_key', event.target.value)}>
              {payerOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            {text.category}
            <select value={form.category} onChange={(event) => updateForm('category', event.target.value)}>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
        </div>

        <label>
          {text.note}
          <input value={form.note} onChange={(event) => updateForm('note', event.target.value)} placeholder={text.optional} />
        </label>

        <button className="submit-button icon-text-button" type="submit">
          <Plus size={18} aria-hidden="true" />
          <span>{text.addExpense}</span>
        </button>
      </form>

      <section className="ledger-list">
        <div className="section-title">
          <h2>
            <Search size={18} aria-hidden="true" />
            {text.details}
          </h2>
          <span>
            {visibleDetailExpenses.length} {text.records}
          </span>
        </div>

        <div className="detail-search-row">
          <label className="search-field">
            {text.search}
            <span>
              <Search size={16} aria-hidden="true" />
              <input
                value={detailFilters.search}
                onChange={(event) => updateDetailFilter('search', event.target.value)}
                placeholder={text.searchPlaceholder}
              />
            </span>
          </label>
          <label>
            {text.sort}
            <select value={detailFilters.sort} onChange={(event) => updateDetailFilter('sort', event.target.value)}>
              <option value="newest">{text.newest}</option>
              <option value="amount-high">{text.amountHigh}</option>
              <option value="amount-low">{text.amountLow}</option>
            </select>
          </label>
        </div>

        <div className="detail-filters">
          <label>
            {text.user}
            <select value={detailFilters.payer} onChange={(event) => updateDetailFilter('payer', event.target.value)}>
              <option value="all">{text.all}</option>
              {payerOptions.map((option) => (
                <option key={option.label} value={option.label}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            {text.category}
            <select value={detailFilters.category} onChange={(event) => updateDetailFilter('category', event.target.value)}>
              <option value="all">{text.all}</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
          <label>
            {text.dateRange}
            <select value={detailFilters.dateRange} onChange={(event) => updateDetailFilter('dateRange', event.target.value)}>
              <option value="month">{text.thisMonth}</option>
              <option value="week">{text.thisWeek}</option>
              <option value="last-week">{text.lastWeek}</option>
              <option value="day">{text.specificDay}</option>
            </select>
          </label>
          {detailFilters.dateRange === 'day' ? (
            <label>
              {text.specificDay}
              <input type="date" value={detailFilters.day} onChange={(event) => updateDetailFilter('day', event.target.value)} />
            </label>
          ) : null}
        </div>

        {visibleDetailExpenses.length === 0 ? (
          <div className="empty-state">{text.empty}</div>
        ) : (
          visibleDetailExpenses.map((expense) => {
            const categoryStyle = getCategoryStyle(expense.category);
            const isEditing = editingExpenseId === expense.id;
            const isConfirmingDelete = deleteTargetId === expense.id;

            return (
              <article className={isEditing ? 'expense-item editing' : 'expense-item'} key={expense.id}>
                {isEditing ? (
                  <form className="expense-edit-form" onSubmit={saveExpense}>
                    <label>
                      {text.title}
                      <input
                        value={editForm.title}
                        onChange={(event) => updateEditForm('title', event.target.value)}
                        placeholder={text.titlePlaceholder}
                      />
                    </label>
                    <div className="two-columns">
                      <label>
                        {text.amount}
                        <input
                          inputMode="decimal"
                          value={editForm.amount}
                          onChange={(event) => updateEditForm('amount', event.target.value)}
                          placeholder="0"
                        />
                      </label>
                      <label>
                        {text.date}
                        <input type="date" value={editForm.date} onChange={(event) => updateEditForm('date', event.target.value)} />
                      </label>
                    </div>
                    <div className="two-columns">
                      <label>
                        {text.payer}
                        <select value={editForm.payer_key} onChange={(event) => updateEditForm('payer_key', event.target.value)}>
                          {payerOptions.map((option) => (
                            <option key={option.key} value={option.key}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        {text.category}
                        <select value={editForm.category} onChange={(event) => updateEditForm('category', event.target.value)}>
                          {categories.map((category) => (
                            <option key={category}>{category}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <label>
                      {text.note}
                      <input
                        value={editForm.note}
                        onChange={(event) => updateEditForm('note', event.target.value)}
                        placeholder={text.optional}
                      />
                    </label>
                    <div className="edit-actions">
                      <button className="submit-button icon-text-button" type="submit">
                        <CheckCircle2 size={17} aria-hidden="true" />
                        <span>{text.save}</span>
                      </button>
                      <button className="ghost-button icon-text-button" type="button" onClick={stopEditing}>
                        <X size={17} aria-hidden="true" />
                        <span>{text.cancel}</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="expense-main">
                      <span className="category" style={{ color: categoryStyle.color, background: categoryStyle.background }}>
                        {expense.category}
                      </span>
                      <div>
                        <strong>{expense.title}</strong>
                        <small>
                          {expense.date} · {expense.payer_label || expense.payer?.display_name} {text.createdBy}
                        </small>
                        {expense.note ? <p className="expense-note">{expense.note}</p> : null}
                      </div>
                    </div>
                    <div className="expense-side">
                      <strong>{money(expense.amount)}</strong>
                      <div className="expense-actions">
                        <button type="button" onClick={() => duplicateExpense(expense)} aria-label={`${text.copy} ${expense.title}`}>
                          <Copy size={15} aria-hidden="true" />
                          <span>{text.copy}</span>
                        </button>
                        <button type="button" onClick={() => startEditing(expense)} aria-label={`${text.edit} ${expense.title}`}>
                          <Pencil size={15} aria-hidden="true" />
                          <span>{text.edit}</span>
                        </button>
                        {isConfirmingDelete ? (
                          <>
                            <button
                              className="danger"
                              type="button"
                              onClick={() => removeExpense(expense.id)}
                              aria-label={`${text.confirmDelete} ${expense.title}`}
                            >
                              <Trash2 size={15} aria-hidden="true" />
                              <span>{text.confirmDelete}</span>
                            </button>
                            <button type="button" onClick={() => setDeleteTargetId(null)}>
                              <X size={15} aria-hidden="true" />
                              <span>{text.cancel}</span>
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingExpenseId(null);
                              setDeleteTargetId(expense.id);
                            }}
                            aria-label={`${text.delete} ${expense.title}`}
                          >
                            <Trash2 size={15} aria-hidden="true" />
                            <span>{text.delete}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </article>
            );
          })
        )}
      </section>

      <PieChartBlock modes={chartModes} activeMode={chartMode} onModeChange={setChartMode} />

      <section className="person-strip">
        {summary.payerTotals.map((payerTotal) => (
          <article className="person-card" key={payerTotal.label}>
            <span>{payerTotal.label}</span>
            <div>
              <strong>{money(payerTotal.amount)}</strong>
              <small>{text.paid}</small>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default App;

