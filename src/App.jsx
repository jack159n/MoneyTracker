import { useMemo, useState } from 'react';

const people = ['我', '女友'];
const categories = ['吃飯', '交通', '生活', '約會', '房租', '其他'];
const storageKey = 'our-ledger-demo-v1';

const seedExpenses = [
  {
    id: crypto.randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    title: '晚餐',
    amount: 860,
    payer: '我',
    split: ['我', '女友'],
    category: '吃飯',
    note: '週五下班',
  },
  {
    id: crypto.randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    title: '咖啡豆',
    amount: 520,
    payer: '女友',
    split: ['我', '女友'],
    category: '生活',
    note: '',
  },
];

function loadExpenses() {
  try {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : seedExpenses;
  } catch {
    return seedExpenses;
  }
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

function App() {
  const [expenses, setExpenses] = useState(loadExpenses);
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    title: '',
    amount: '',
    payer: people[0],
    category: categories[0],
    split: people,
    note: '',
  });

  const months = useMemo(() => {
    const values = [...new Set(expenses.map((expense) => monthOf(expense.date)))].sort().reverse();
    return values.length ? values : [selectedMonth];
  }, [expenses, selectedMonth]);

  const monthlyExpenses = useMemo(
    () => expenses.filter((expense) => monthOf(expense.date) === selectedMonth),
    [expenses, selectedMonth],
  );

  const summary = useMemo(() => {
    const totals = Object.fromEntries(people.map((person) => [person, { paid: 0, share: 0 }]));

    monthlyExpenses.forEach((expense) => {
      const amount = Number(expense.amount);
      totals[expense.payer].paid += amount;
      const splitAmount = amount / expense.split.length;
      expense.split.forEach((person) => {
        totals[person].share += splitAmount;
      });
    });

    const netMine = totals['我'].paid - totals['我'].share;
    return {
      total: monthlyExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0),
      count: monthlyExpenses.length,
      totals,
      settlement:
        Math.abs(netMine) < 1
          ? '這個月剛好打平'
          : netMine > 0
            ? `女友要給我 ${money(netMine)}`
            : `我要給女友 ${money(Math.abs(netMine))}`,
    };
  }, [monthlyExpenses]);

  function persist(nextExpenses) {
    setExpenses(nextExpenses);
    localStorage.setItem(storageKey, JSON.stringify(nextExpenses));
  }

  function updateForm(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleSplit(person) {
    setForm((current) => {
      const exists = current.split.includes(person);
      const nextSplit = exists
        ? current.split.filter((item) => item !== person)
        : [...current.split, person];
      return { ...current, split: nextSplit.length ? nextSplit : [person] };
    });
  }

  function addExpense(event) {
    event.preventDefault();
    const amount = Number(form.amount);
    if (!form.title.trim() || !amount || amount <= 0) return;

    const nextExpense = {
      ...form,
      id: crypto.randomUUID(),
      title: form.title.trim(),
      amount,
      split: [...form.split],
    };

    const nextExpenses = [nextExpense, ...expenses];
    persist(nextExpenses);
    setSelectedMonth(monthOf(form.date));
    setForm((current) => ({ ...current, title: '', amount: '', note: '' }));
  }

  function removeExpense(id) {
    persist(expenses.filter((expense) => expense.id !== id));
  }

  function exportCsv() {
    const rows = [
      ['date', 'title', 'amount', 'payer', 'split', 'category', 'note'],
      ...monthlyExpenses.map((expense) => [
        expense.date,
        expense.title,
        expense.amount,
        expense.payer,
        expense.split.join('/'),
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

  return (
    <main className="app-shell">
      <section className="top-panel">
        <div>
          <p className="eyebrow">兩人共同記帳</p>
          <h1>Our Ledger</h1>
        </div>
        <div className="month-select">
          <label htmlFor="month">月份</label>
          <select id="month" value={selectedMonth} onChange={(event) => setSelectedMonth(event.target.value)}>
            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="summary-grid" aria-label="本月摘要">
        <div className="metric primary">
          <span>本月總支出</span>
          <strong>{money(summary.total)}</strong>
          <small>{summary.count} 筆紀錄</small>
        </div>
        <div className="metric">
          <span>結算</span>
          <strong>{summary.settlement}</strong>
          <small>依每筆分攤人數平均計算</small>
        </div>
      </section>

      <section className="person-strip">
        {people.map((person) => (
          <article className="person-card" key={person}>
            <span>{person}</span>
            <div>
              <strong>{money(summary.totals[person].paid)}</strong>
              <small>已付款</small>
            </div>
            <div>
              <strong>{money(summary.totals[person].share)}</strong>
              <small>應分攤</small>
            </div>
          </article>
        ))}
      </section>

      <form className="expense-form" onSubmit={addExpense}>
        <div className="section-title">
          <h2>新增一筆</h2>
          <button className="ghost-button" type="button" onClick={exportCsv}>
            匯出
          </button>
        </div>

        <label>
          名稱
          <input
            value={form.title}
            onChange={(event) => updateForm('title', event.target.value)}
            placeholder="早餐、電影票、水電費"
          />
        </label>

        <div className="two-columns">
          <label>
            金額
            <input
              inputMode="decimal"
              value={form.amount}
              onChange={(event) => updateForm('amount', event.target.value)}
              placeholder="0"
            />
          </label>
          <label>
            日期
            <input type="date" value={form.date} onChange={(event) => updateForm('date', event.target.value)} />
          </label>
        </div>

        <div className="two-columns">
          <label>
            誰付款
            <select value={form.payer} onChange={(event) => updateForm('payer', event.target.value)}>
              {people.map((person) => (
                <option key={person}>{person}</option>
              ))}
            </select>
          </label>
          <label>
            分類
            <select value={form.category} onChange={(event) => updateForm('category', event.target.value)}>
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
        </div>

        <fieldset>
          <legend>誰要分攤</legend>
          <div className="segmented">
            {people.map((person) => (
              <button
                type="button"
                key={person}
                className={form.split.includes(person) ? 'active' : ''}
                onClick={() => toggleSplit(person)}
              >
                {person}
              </button>
            ))}
          </div>
        </fieldset>

        <label>
          備註
          <input value={form.note} onChange={(event) => updateForm('note', event.target.value)} placeholder="可不填" />
        </label>

        <button className="submit-button" type="submit">
          新增支出
        </button>
      </form>

      <section className="ledger-list">
        <div className="section-title">
          <h2>本月明細</h2>
          <span>{monthlyExpenses.length} 筆</span>
        </div>

        {monthlyExpenses.length === 0 ? (
          <div className="empty-state">這個月還沒有支出。</div>
        ) : (
          monthlyExpenses.map((expense) => (
            <article className="expense-item" key={expense.id}>
              <div className="expense-main">
                <span className="category">{expense.category}</span>
                <div>
                  <strong>{expense.title}</strong>
                  <small>
                    {expense.date} · {expense.payer} 付款 · {expense.split.join('、')} 分攤
                  </small>
                </div>
              </div>
              <div className="expense-side">
                <strong>{money(expense.amount)}</strong>
                <button type="button" onClick={() => removeExpense(expense.id)} aria-label={`刪除 ${expense.title}`}>
                  刪除
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="backend-note">
        <h2>之後接 Supabase 可以這樣存</h2>
        <div className="schema-grid">
          <code>expenses</code>
          <span>date, title, amount, payer_id, category, note</span>
          <code>expense_splits</code>
          <span>expense_id, person_id, share_ratio</span>
          <code>members</code>
          <span>name, couple_id, role</span>
        </div>
      </section>
    </main>
  );
}

export default App;
