import { useCallback, useEffect, useMemo, useState } from 'react';
import { hasSupabaseConfig, supabase } from './supabaseClient.js';

const categories = [
  '\u5403\u98ef',
  '\u4ea4\u901a',
  '\u751f\u6d3b',
  '\u7d04\u6703',
  '\u623f\u79df',
  '\u5176\u4ed6',
];

const text = {
  appKicker: '\u5169\u4eba\u5171\u540c\u8a18\u5e33',
  month: '\u6708\u4efd',
  total: '\u672c\u6708\u7e3d\u652f\u51fa',
  records: '\u7b46\u7d00\u9304',
  settlement: '\u7d50\u7b97',
  splitHint: '\u4f9d\u6bcf\u7b46\u5206\u64d4\u4eba\u6578\u5e73\u5747\u8a08\u7b97',
  paid: '\u5df2\u4ed8\u6b3e',
  share: '\u61c9\u5206\u64d4',
  addOne: '\u65b0\u589e\u4e00\u7b46',
  export: '\u532f\u51fa',
  title: '\u540d\u7a31',
  titlePlaceholder: '\u65e9\u9910\u3001\u96fb\u5f71\u7968\u3001\u6c34\u96fb\u8cbb',
  amount: '\u91d1\u984d',
  date: '\u65e5\u671f',
  payer: '\u8ab0\u4ed8\u6b3e',
  category: '\u5206\u985e',
  splitWith: '\u8ab0\u8981\u5206\u64d4',
  note: '\u5099\u8a3b',
  optional: '\u53ef\u4e0d\u586b',
  addExpense: '\u65b0\u589e\u652f\u51fa',
  details: '\u672c\u6708\u660e\u7d30',
  empty: '\u9019\u500b\u6708\u9084\u6c92\u6709\u652f\u51fa\u3002',
  delete: '\u522a\u9664',
  signInTitle: '\u767b\u5165\u5171\u540c\u5e33\u672c',
  signInCopy: '\u7528 email \u548c\u5bc6\u78bc\u767b\u5165\uff0c\u7b2c\u4e00\u6b21\u4f7f\u7528\u5148\u8a3b\u518a\u3002',
  email: 'Email',
  password: '\u5bc6\u78bc',
  passwordHint: '\u81f3\u5c11 6 \u500b\u5b57\u5143',
  signIn: '\u767b\u5165',
  signUp: '\u8a3b\u518a',
  signOut: '\u767b\u51fa',
  loading: '\u8f09\u5165\u4e2d...',
  setupTitle: '\u9700\u8981 Supabase \u8a2d\u5b9a',
  setupCopy: '\u8acb\u5148\u5efa\u7acb .env.local\uff0c\u653e\u5165 VITE_SUPABASE_URL \u548c VITE_SUPABASE_ANON_KEY\u3002',
  lockedTitle: '\u9019\u500b\u5e33\u865f\u9084\u4e0d\u5728\u5171\u540c\u5e33\u672c\u88e1',
  lockedCopy: '\u8acb\u5230 Supabase Auth \u8907\u88fd\u9019\u500b user id\uff0c\u518d\u628a\u5b83\u52a0\u5230 members \u8868\u3002',
  reload: '\u91cd\u65b0\u8f09\u5165',
  noMembers: '\u9084\u6c92\u6709\u6210\u54e1\u8cc7\u6599',
  equal: '\u9019\u500b\u6708\u525b\u597d\u6253\u5e73',
  owedTo: '\u8981\u7d66',
  createdBy: '\u4ed8\u6b3e',
  splitLabel: '\u5206\u64d4',
  signedUp: '\u8a3b\u518a\u5b8c\u6210\uff0c\u5982\u679c Supabase \u8981\u6c42\u9a57\u8b49\u4fe1\u7bb1\uff0c\u8acb\u5148\u53bb\u4fe1\u7bb1\u9ede\u958b\u9a57\u8b49\u4fe1\u3002',
};

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
    payer_member_id: row.payer_member_id,
    category: row.category,
    note: row.note || '',
    split: (row.expense_splits || []).map((split) => split.member).filter(Boolean),
  };
}

function App() {
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState('sign-in');
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [authMessage, setAuthMessage] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentMember, setCurrentMember] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    title: '',
    amount: '',
    payer_member_id: '',
    category: categories[0],
    split_member_ids: [],
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
        'id, couple_id, payer_member_id, date, title, amount, category, note, payer:members!expenses_payer_member_id_fkey(id, display_name, user_id), expense_splits(member:members(id, display_name, user_id))',
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
      payer_member_id: current.payer_member_id || myMember.id,
      split_member_ids: current.split_member_ids.length
        ? current.split_member_ids
        : (memberRows || []).map((member) => member.id),
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
        setAppLoading(false);
      }
    });

    return () => subscription.subscription.unsubscribe();
  }, [loadLedger]);

  const months = useMemo(() => {
    const values = [...new Set(expenses.map((expense) => monthOf(expense.date)))].sort().reverse();
    return values.includes(selectedMonth) ? values : [selectedMonth, ...values];
  }, [expenses, selectedMonth]);

  const monthlyExpenses = useMemo(
    () => expenses.filter((expense) => monthOf(expense.date) === selectedMonth),
    [expenses, selectedMonth],
  );

  const summary = useMemo(() => {
    const totals = Object.fromEntries(members.map((member) => [member.id, { paid: 0, share: 0 }]));

    monthlyExpenses.forEach((expense) => {
      const amount = Number(expense.amount);
      if (totals[expense.payer_member_id]) totals[expense.payer_member_id].paid += amount;
      const splitAmount = amount / Math.max(expense.split.length, 1);
      expense.split.forEach((member) => {
        if (totals[member.id]) totals[member.id].share += splitAmount;
      });
    });

    const balances = members.map((member) => ({
      ...member,
      net: (totals[member.id]?.paid || 0) - (totals[member.id]?.share || 0),
    }));
    const creditor = balances.find((member) => member.net > 1);
    const debtor = balances.find((member) => member.net < -1);

    return {
      total: monthlyExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0),
      count: monthlyExpenses.length,
      totals,
      settlement:
        creditor && debtor
          ? `${debtor.display_name} ${text.owedTo} ${creditor.display_name} ${money(Math.min(creditor.net, Math.abs(debtor.net)))}`
          : text.equal,
    };
  }, [members, monthlyExpenses]);

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleSplit(memberId) {
    setForm((current) => {
      const exists = current.split_member_ids.includes(memberId);
      const nextSplit = exists
        ? current.split_member_ids.filter((id) => id !== memberId)
        : [...current.split_member_ids, memberId];
      return { ...current, split_member_ids: nextSplit.length ? nextSplit : [memberId] };
    });
  }

  async function submitAuth(event) {
    event.preventDefault();
    if (!supabase || !authForm.email.trim() || !authForm.password) return;
    setAuthLoading(true);
    setAuthMessage('');
    setError('');

    const credentials = {
      email: authForm.email.trim(),
      password: authForm.password,
    };

    const { error: authError } =
      authMode === 'sign-up'
        ? await supabase.auth.signUp(credentials)
        : await supabase.auth.signInWithPassword(credentials);

    if (authError) setError(authError.message);
    else if (authMode === 'sign-up') setAuthMessage(text.signedUp);
    setAuthLoading(false);
  }

  async function addExpense(event) {
    event.preventDefault();
    if (!supabase || !currentMember) return;
    const amount = Number(form.amount);
    if (!form.title.trim() || !amount || amount <= 0) return;

    setError('');
    const { data: expense, error: expenseError } = await supabase
      .from('expenses')
      .insert({
        couple_id: currentMember.couple_id,
        payer_member_id: form.payer_member_id,
        date: form.date,
        title: form.title.trim(),
        amount,
        category: form.category,
        note: form.note.trim(),
        created_by: session.user.id,
      })
      .select('id')
      .single();

    if (expenseError) {
      setError(expenseError.message);
      return;
    }

    const { error: splitError } = await supabase.from('expense_splits').insert(
      form.split_member_ids.map((memberId) => ({
        expense_id: expense.id,
        member_id: memberId,
        share_ratio: 1,
      })),
    );

    if (splitError) {
      setError(splitError.message);
      return;
    }

    setSelectedMonth(monthOf(form.date));
    setForm((current) => ({ ...current, title: '', amount: '', note: '' }));
    await loadLedger(session);
  }

  async function removeExpense(id) {
    if (!supabase) return;
    const { error: deleteError } = await supabase.from('expenses').delete().eq('id', id);
    if (deleteError) setError(deleteError.message);
    else await loadLedger(session);
  }

  function exportCsv() {
    const rows = [
      ['date', 'title', 'amount', 'payer', 'split', 'category', 'note'],
      ...monthlyExpenses.map((expense) => [
        expense.date,
        expense.title,
        expense.amount,
        expense.payer?.display_name || '',
        expense.split.map((member) => member.display_name).join('/'),
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

  if (!hasSupabaseConfig) {
    return (
      <main className="app-shell auth-shell">
        <section className="auth-card">
          <p className="eyebrow">{text.appKicker}</p>
          <h1>Our Ledger</h1>
          <h2>{text.setupTitle}</h2>
          <p>{text.setupCopy}</p>
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
          <h1>Our Ledger</h1>
          <h2>{text.signInTitle}</h2>
          <p>{text.signInCopy}</p>
          <div className="auth-tabs" role="tablist" aria-label={text.signInTitle}>
            <button
              className={authMode === 'sign-in' ? 'active' : ''}
              type="button"
              onClick={() => {
                setAuthMode('sign-in');
                setAuthMessage('');
                setError('');
              }}
            >
              {text.signIn}
            </button>
            <button
              className={authMode === 'sign-up' ? 'active' : ''}
              type="button"
              onClick={() => {
                setAuthMode('sign-up');
                setAuthMessage('');
                setError('');
              }}
            >
              {text.signUp}
            </button>
          </div>
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
              autoComplete={authMode === 'sign-in' ? 'current-password' : 'new-password'}
              placeholder={text.passwordHint}
              required
            />
          </label>
          <button className="submit-button" type="submit" disabled={authLoading}>
            {authLoading ? text.loading : authMode === 'sign-up' ? text.signUp : text.signIn}
          </button>
          {authMessage ? <p className="success-message">{authMessage}</p> : null}
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
          <h1>Our Ledger</h1>
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
          <h1>Our Ledger</h1>
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

      <section className="summary-grid" aria-label={text.total}>
        <div className="metric primary">
          <span>{text.total}</span>
          <strong>{money(summary.total)}</strong>
          <small>
            {summary.count} {text.records}
          </small>
        </div>
        <div className="metric">
          <span>{text.settlement}</span>
          <strong>{summary.settlement}</strong>
          <small>{text.splitHint}</small>
        </div>
      </section>

      <section className="person-strip">
        {members.map((member) => (
          <article className="person-card" key={member.id}>
            <span>{member.display_name}</span>
            <div>
              <strong>{money(summary.totals[member.id]?.paid || 0)}</strong>
              <small>{text.paid}</small>
            </div>
            <div>
              <strong>{money(summary.totals[member.id]?.share || 0)}</strong>
              <small>{text.share}</small>
            </div>
          </article>
        ))}
      </section>

      <form className="expense-form" onSubmit={addExpense}>
        <div className="section-title">
          <h2>{text.addOne}</h2>
          <button className="ghost-button" type="button" onClick={exportCsv}>
            {text.export}
          </button>
        </div>

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
            <select value={form.payer_member_id} onChange={(event) => updateForm('payer_member_id', event.target.value)}>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.display_name}
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

        <fieldset>
          <legend>{text.splitWith}</legend>
          <div className="segmented">
            {members.map((member) => (
              <button
                type="button"
                key={member.id}
                className={form.split_member_ids.includes(member.id) ? 'active' : ''}
                onClick={() => toggleSplit(member.id)}
              >
                {member.display_name}
              </button>
            ))}
          </div>
        </fieldset>

        <label>
          {text.note}
          <input value={form.note} onChange={(event) => updateForm('note', event.target.value)} placeholder={text.optional} />
        </label>

        <button className="submit-button" type="submit">
          {text.addExpense}
        </button>
      </form>

      <section className="ledger-list">
        <div className="section-title">
          <h2>{text.details}</h2>
          <span>
            {monthlyExpenses.length} {text.records}
          </span>
        </div>

        {monthlyExpenses.length === 0 ? (
          <div className="empty-state">{text.empty}</div>
        ) : (
          monthlyExpenses.map((expense) => (
            <article className="expense-item" key={expense.id}>
              <div className="expense-main">
                <span className="category">{expense.category}</span>
                <div>
                  <strong>{expense.title}</strong>
                  <small>
                    {expense.date} · {expense.payer?.display_name} {text.createdBy} ·{' '}
                    {expense.split.map((member) => member.display_name).join(' / ')} {text.splitLabel}
                  </small>
                </div>
              </div>
              <div className="expense-side">
                <strong>{money(expense.amount)}</strong>
                <button type="button" onClick={() => removeExpense(expense.id)} aria-label={`${text.delete} ${expense.title}`}>
                  {text.delete}
                </button>
              </div>
            </article>
          ))
        )}
      </section>
    </main>
  );
}

export default App;
