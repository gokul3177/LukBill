import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import VoiceInput from './components/VoiceInput';
import PrintableBill from './components/PrintableBill';

// ─── Toast System ───────────────────────────────────────────────────────────
function ToastContainer({ toasts }) {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`pointer-events-auto px-4 py-3 rounded-lg shadow-lg text-sm font-medium text-white animate-fadeIn transition-all
            ${t.type === 'error' ? 'bg-red-600' : t.type === 'success' ? 'bg-green-600' : 'bg-blue-600'}`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Product Suggestion Inline Panel ────────────────────────────────────────
function ProductSuggestions({ billData, allProducts, onApplySuggestion, onAddItem, darkMode }) {
  const [search, setSearch]       = useState('');
  const [showDrop, setShowDrop]   = useState(false);

  const filtered = search.length > 0
    ? allProducts.filter(p => p.name.includes(search.toLowerCase()) || (p.aliases || []).some(a => a.includes(search.toLowerCase())))
    : [];

  const unknownItems = billData?.items?.filter(i => i.price === 0) || [];

  return (
    <div className={`rounded-xl border p-4 mt-4 text-sm ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-blue-50 border-blue-200 text-gray-700'}`}>
      <p className="font-semibold mb-2 text-blue-600 dark:text-blue-400">💡 Smart Suggestions</p>

      {unknownItems.length > 0 && (
        <div className="mb-3 space-y-1">
          {unknownItems.map((item, i) => {
            const suggestion = allProducts.find(p =>
              p.aliases?.some(a => a.includes(item.name)) || p.name.includes(item.name)
            );
            return suggestion ? (
              <div key={i} className="flex items-center justify-between gap-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg px-3 py-2">
                <span>Did you mean <strong>{suggestion.name}</strong> instead of &quot;{item.name}&quot;?</span>
                <button
                  onClick={() => onApplySuggestion(i, suggestion)}
                  className="text-xs bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold px-2 py-1 rounded"
                >
                  Apply
                </button>
              </div>
            ) : null;
          })}
        </div>
      )}

      {/* Add Item autocomplete */}
      <div className="relative">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="🔍 Add product by name..."
            value={search}
            onChange={e => { setSearch(e.target.value); setShowDrop(true); }}
            onFocus={() => setShowDrop(true)}
            onBlur={() => setTimeout(() => setShowDrop(false), 150)}
            className={`flex-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-400
              ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-800'}`}
          />
          <button
            onClick={() => { if (search.trim()) { onAddItem({ name: search.trim(), quantity: 1, price: 0, total: 0 }); setSearch(''); } }}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg"
          >
            + Add
          </button>
        </div>
        {showDrop && filtered.length > 0 && (
          <ul className={`absolute z-20 mt-1 w-full rounded-lg border shadow-lg max-h-40 overflow-y-auto
            ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            {filtered.map(p => (
              <li
                key={p._id}
                onMouseDown={() => { onAddItem({ name: p.name, quantity: 1, price: p.price, total: p.price }); setSearch(''); setShowDrop(false); }}
                className={`px-4 py-2 cursor-pointer flex justify-between hover:bg-blue-50 dark:hover:bg-gray-700`}
              >
                <span className="font-medium">{p.name}</span>
                <span className="text-gray-400 text-xs">₹{p.price}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ─── Regex fallback (preserved from original) ────────────────────────────────
function extractDetailsRegex(text, billData, priceCache) {
  if (!text || text.length < 3) return null;
  const cleanText = text.replace(/['"]/g, '');
  let billTo = 'Unknown Customer';
  const namePatterns = [
    /(?:bill\s+to|bill\s+for|put\s+a?\s*bill\s+to|customer|for)\s+([a-z0-9\s]+?)(?:\s+(?:date|items?|item|are|bank|account|today|tomorrow|\d))/i,
    /(?:bill\s+to|bill\s+for|customer|put\s+a?\s*bill\s+to)\s+([a-z0-9\s]+?)$/i
  ];
  for (const pattern of namePatterns) {
    const match = cleanText.match(pattern);
    if (match && match[1].trim()) {
      billTo = match[1].trim().replace(/\s+(?:the|is|are|for|contains?)$/i, '').trim();
      break;
    }
  }
  const items = [];
  const itemsSectionMatch = cleanText.match(/(?:items?|products?|are|is)\s+(.+?)(?:\s+(?:bank|account)|\s*$)/i);
  if (itemsSectionMatch) {
    let itemsString = itemsSectionMatch[1].trim().replace(/^(?:are|is|contains|contain|of|items|products)\s+/i, '').trim();
    const qtyNamePattern = /(\d+)\s+([a-z0-9\s]+?)(?=\s+\d+|$)/gi;
    let m;
    while ((m = qtyNamePattern.exec(itemsString)) !== null) {
      const qty = parseInt(m[1]);
      let name = m[2].trim().toLowerCase().replace(/^(?:and|of|for|at)\s+/i, '').trim();
      if (name && !isNaN(qty)) {
        const cached = priceCache[name];
        items.push({ name: cached?.name || name, quantity: qty, price: cached?.price || 0, total: qty * (cached?.price || 0) });
      }
    }
  }
  const grandTotal = items.reduce((acc, item) => acc + item.total, 0);
  return { billTo, items, grandTotal, billDate: billData?.billDate || new Date(), bankAccount: billData?.bankAccount || '' };
}

// ─── Main App ────────────────────────────────────────────────────────────────
function App() {
  const [transcript,  setTranscript]  = useState('');
  const [billData,    setBillData]    = useState(null);
  const [searchDate,  setSearchDate]  = useState('');
  const [savedBills,  setSavedBills]  = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [viewMode,    setViewMode]    = useState('create');
  const [isEditing,   setIsEditing]   = useState(false);
  const [isParsing,   setIsParsing]   = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [toasts,      setToasts]      = useState([]);
  const [stats,       setStats]       = useState(null);
  const [darkMode,    setDarkMode]    = useState(() => localStorage.getItem('lukbill-dark') === 'true');

  const priceCache = useRef({});
  const parseDebounce = useRef(null);

  // ── Dark mode persistence ────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('lukbill-dark', String(darkMode));
  }, [darkMode]);

  // ── Toast helper ─────────────────────────────────────────────────────────
  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  // ── Fetch all products on mount ──────────────────────────────────────────
  useEffect(() => {
    axios.get('http://localhost:5000/api/products')
      .then(res => setAllProducts(res.data))
      .catch(() => {});
  }, []);

  // ── Claude AI parsing (debounced 1.5s) ──────────────────────────────────
  useEffect(() => {
    if (!transcript || isEditing || transcript.trim().length < 5) return;
    clearTimeout(parseDebounce.current);

    parseDebounce.current = setTimeout(async () => {
      const apiKey = import.meta.env.VITE_GROQ_API_KEY;

      if (!apiKey || apiKey === 'your_groq_key_here') {
        // No key — fall straight to regex
        const details = extractDetailsRegex(transcript, billData, priceCache.current);
        if (details) setBillData(details);
        return;
      }

      setIsParsing(true);
      try {
        // Groq is FREE — uses open-source Llama 3 (OpenAI-compatible API)
        const response = await axios.post(
          'https://api.groq.com/openai/v1/chat/completions',
          {
            model: 'llama3-70b-8192',
            temperature: 0,
            max_tokens: 256,
            response_format: { type: 'json_object' }, // enforce JSON mode
            messages: [
              {
                role: 'system',
                content: `You are a billing assistant for a shopkeeper. Extract from the user's voice transcript: the customer name (billTo) and a list of items with quantities. Respond ONLY with valid JSON in this exact format, no markdown, no explanation:
{"billTo":"string","items":[{"name":"string","quantity":number}]}
If something is unclear, make your best guess. Item names should be lowercase.`
              },
              { role: 'user', content: transcript }
            ]
          },
          {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const raw = response.data.choices[0].message.content.trim();
        const parsed = JSON.parse(raw);

        // Build items with cached prices
        const items = (parsed.items || []).map(item => {
          const key = item.name.toLowerCase();
          const cached = priceCache.current[key];
          return { name: cached?.name || key, quantity: item.quantity || 1, price: cached?.price || 0, total: (item.quantity || 1) * (cached?.price || 0) };
        });

        setBillData(prev => ({
          billTo: parsed.billTo || 'Unknown Customer',
          items,
          grandTotal: items.reduce((a, i) => a + i.total, 0),
          billDate: prev?.billDate || new Date(),
          bankAccount: prev?.bankAccount || ''
        }));
      } catch (err) {
        console.warn('Groq/Llama3 parse failed, falling back to regex:', err.message);
        const details = extractDetailsRegex(transcript, billData, priceCache.current);
        if (details) setBillData(details);
        if (err.response?.status === 401) showToast('Invalid Groq API key — using regex fallback.', 'error');
      } finally {
        setIsParsing(false);
      }
    }, 1500);

    return () => clearTimeout(parseDebounce.current);
  }, [transcript, isEditing]);

  // ── Debounced price fetching for items missing prices ────────────────────
  useEffect(() => {
    if (!billData || billData.items.length === 0) return;
    const itemsMissingPrices = billData.items.filter(item => item.price === 0);
    if (itemsMissingPrices.length === 0) return;

    const handler = setTimeout(async () => {
      try {
        const namesToFetch = itemsMissingPrices.map(i => i.name.toLowerCase());
        const response = await axios.post('http://localhost:5000/api/products/prices', { items: namesToFetch });
        const priceMap = response.data;
        Object.keys(priceMap).forEach(key => { priceCache.current[key] = priceMap[key]; });

        setBillData(prev => {
          if (!prev) return prev;
          const newItems = prev.items.map(item => {
            const match = priceMap[item.name.toLowerCase()];
            if (match) return { ...item, name: match.name, price: match.price, total: item.quantity * match.price };
            return item;
          });
          return { ...prev, items: newItems, grandTotal: newItems.reduce((a, i) => a + i.total, 0) };
        });

        if (Object.keys(priceMap).length < namesToFetch.length) {
          showToast('Some prices not found — please edit manually.', 'error');
        }
      } catch (err) {
        console.error('Price fetch error:', err);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [billData?.items?.length, transcript]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const saveBill = async () => {
    if (!billData || billData.items.length === 0) return showToast('Please add items first.', 'error');
    try {
      setLoading(true);
      await axios.post('http://localhost:5000/api/bills', billData);
      showToast('Bill saved successfully! 🎉', 'success');
      setTranscript('');
      setBillData(null);
    } catch {
      showToast('Failed to save bill.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const searchBills = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/bills', { params: { date: searchDate } });
      setSavedBills(res.data);
    } catch {
      showToast('Failed to fetch bills.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bills/stats');
      setStats(res.data);
    } catch {
      showToast('Could not load stats.', 'error');
    }
  };

  useEffect(() => {
    if (viewMode === 'search') fetchStats();
  }, [viewMode]);

  const clearAll = () => { setTranscript(''); setBillData(null); setIsEditing(false); };

  const handleEditChange = (field, value) => setBillData(prev => ({ ...prev, [field]: value }));

  const handleItemChange = (index, field, value) => {
    const newItems = [...billData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'price') {
      const qty = parseFloat(newItems[index].quantity) || 0;
      const price = parseFloat(newItems[index].price) || 0;
      newItems[index].total = qty * price;
    }
    setBillData(prev => ({ ...prev, items: newItems, grandTotal: newItems.reduce((acc, i) => acc + i.total, 0) }));
  };

  const addItem = (item = { name: 'New Item', quantity: 1, price: 0, total: 0 }) =>
    setBillData(prev => ({ ...prev, items: [...(prev?.items || []), item] }));

  const removeItem = (index) => {
    const newItems = billData.items.filter((_, i) => i !== index);
    setBillData(prev => ({ ...prev, items: newItems, grandTotal: newItems.reduce((acc, i) => acc + i.total, 0) }));
  };

  const onApplySuggestion = (itemIndex, suggestion) => {
    const newItems = [...billData.items];
    newItems[itemIndex] = { ...newItems[itemIndex], name: suggestion.name, price: suggestion.price, total: newItems[itemIndex].quantity * suggestion.price };
    setBillData(prev => ({ ...prev, items: newItems, grandTotal: newItems.reduce((a, i) => a + i.total, 0) }));
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'dark bg-gray-950 text-gray-100' : 'bg-gray-100 text-gray-900'} font-sans`}>
      <ToastContainer toasts={toasts} />

      {/* ── Header ── */}
      <header className={`${darkMode ? 'bg-gray-900 border-b border-gray-800' : 'bg-blue-900'} text-white p-4 shadow-md mb-6 no-print`}>
        <div className="container mx-auto flex justify-between items-center gap-4 flex-wrap">
          <h1 className="text-2xl font-bold tracking-wide">⚡ LukBill</h1>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setViewMode('create')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'create' ? 'bg-blue-600' : 'bg-blue-800 hover:bg-blue-700'}`}
            >
              📄 New Bill
            </button>
            <button
              onClick={() => setViewMode('search')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === 'search' ? 'bg-blue-600' : 'bg-blue-800 hover:bg-blue-700'}`}
            >
              🔍 Search Bills
            </button>
            <button
              onClick={() => setDarkMode(d => !d)}
              title="Toggle dark mode"
              className="px-3 py-2 rounded-md bg-blue-800 hover:bg-blue-700 text-lg transition-colors"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-10 animate-fadeIn">

        {/* ── CREATE view ── */}
        {viewMode === 'create' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Left panel — Input */}
            <div className={`p-6 rounded-2xl shadow-lg h-fit no-print ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <h2 className="text-xl font-semibold mb-4">🎙️ Voice Input</h2>
              <div className="mb-6 flex justify-center">
                <VoiceInput
                  onTranscript={setTranscript}
                  transcript={transcript}
                  onClear={clearAll}
                  darkMode={darkMode}
                />
              </div>

              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Transcript:
                </label>
                <textarea
                  className={`w-full p-3 border rounded-lg min-h-[100px] text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors
                    ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'}`}
                  value={transcript}
                  onChange={e => setTranscript(e.target.value)}
                  placeholder='Try: "Bill to John items 5 pencils and 2 notebooks"'
                />
              </div>

              {isParsing && (
                <div className="flex items-center gap-2 text-blue-500 text-sm mb-3">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Claude is parsing your transcript…
                </div>
              )}

              {/* Product suggestions panel */}
              {billData && (
                <ProductSuggestions
                  billData={billData}
                  allProducts={allProducts}
                  onApplySuggestion={onApplySuggestion}
                  onAddItem={addItem}
                  darkMode={darkMode}
                />
              )}

              <div className="flex gap-4 mt-4">
                <button
                  onClick={saveBill}
                  disabled={loading || !billData || isParsing}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow disabled:opacity-50 transition-colors"
                >
                  💾 Save Bill
                </button>
                <button
                  onClick={clearAll}
                  className={`font-bold py-3 px-6 rounded-xl shadow transition-colors ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'}`}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Right panel — Preview / Edit */}
            <div className={`p-6 rounded-2xl shadow-lg min-h-[500px] ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-4 no-print">
                <h2 className="text-xl font-semibold">{isEditing ? '✏️ Edit Bill' : '👁️ Preview'}</h2>
                {billData && !isEditing && (
                  <div className="space-x-2">
                    <button onClick={() => setIsEditing(true)} className="text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 px-3 py-1 rounded transition-colors">✏️ Edit</button>
                    <button onClick={() => window.print()} className="text-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800 px-3 py-1 rounded transition-colors">🖨️ Print</button>
                  </div>
                )}
                {isEditing && <button onClick={() => setIsEditing(false)} className="bg-green-600 text-white px-4 py-1 rounded">Done</button>}
              </div>

              {billData ? (
                isEditing ? (
                  <div className="space-y-4 no-print">
                    <div>
                      <label className="block text-sm font-bold mb-1">Bill To</label>
                      <input type="text" value={billData.billTo} onChange={e => handleEditChange('billTo', e.target.value)}
                        className={`w-full border p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`} />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-bold">Items</label>
                        <button onClick={() => addItem()} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded">+ Add Item</button>
                      </div>

                      <div className={`text-xs font-semibold mb-1 grid grid-cols-[1fr_60px_72px_56px_24px] gap-1 px-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span>Name</span><span className="text-center">Qty</span><span className="text-right">Price</span><span className="text-right">Total</span><span />
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {billData.items.map((item, idx) => (
                          <div key={idx} className={`grid grid-cols-[1fr_60px_72px_56px_24px] gap-1 items-center rounded-lg p-2 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
                            <input className={`border p-1 rounded text-sm w-full ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`} value={item.name} onChange={e => handleItemChange(idx, 'name', e.target.value)} />
                            <input className={`border p-1 rounded text-sm w-full text-center ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`} type="number" value={item.quantity} onChange={e => handleItemChange(idx, 'quantity', e.target.value)} />
                            <input className={`border p-1 rounded text-sm w-full text-right ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`} type="number" value={item.price} onChange={e => handleItemChange(idx, 'price', e.target.value)} />
                            <div className="text-sm text-right font-medium">₹{item.total}</div>
                            <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-400 font-bold text-center">×</button>
                          </div>
                        ))}
                      </div>
                      <div className={`text-right mt-2 font-bold text-lg ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Total: ₹{billData.grandTotal}</div>
                    </div>
                  </div>
                ) : <PrintableBill bill={billData} darkMode={darkMode} />
              ) : (
                <div className={`flex items-center justify-center h-64 italic font-medium ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                  Waiting for input… Say: &quot;Bill for Raja items 5 pencils&quot;
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SEARCH view ── */}
        {viewMode === 'search' && (
          <div className="space-y-6 animate-fadeIn">

            {/* Stats row */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: 'Bills Today',       value: stats.totalBillsToday, icon: '🧾' },
                  { label: 'Revenue Today',      value: `₹${stats.revenueToday.toFixed(2)}`, icon: '💰' },
                  { label: 'Top Item (Week)',     value: stats.mostBilledItem,  icon: '🏆' }
                ].map(s => (
                  <div key={s.label} className={`rounded-2xl p-5 shadow-md flex items-center gap-4 ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
                    <span className="text-3xl">{s.icon}</span>
                    <div>
                      <p className={`text-xs font-semibold uppercase tracking-wide ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{s.label}</p>
                      <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{s.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Search panel */}
            <div className={`p-6 rounded-2xl shadow-lg ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
              <h2 className="text-xl font-semibold mb-4">🔍 Search Previous Bills</h2>
              <div className="flex gap-4 mb-6 flex-wrap">
                <input
                  type="date"
                  value={searchDate}
                  onChange={e => setSearchDate(e.target.value)}
                  className={`p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 ${darkMode ? 'bg-gray-800 border-gray-700 text-white' : 'border-gray-300'}`}
                />
                <button
                  onClick={searchBills}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg disabled:opacity-50 font-medium transition-colors"
                >
                  {loading ? 'Searching…' : 'Search'}
                </button>
              </div>

              <div className="space-y-3">
                {savedBills.length === 0 && <p className={`text-sm italic ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>No results. Pick a date and search.</p>}
                {savedBills.map(bill => (
                  <div key={bill._id} className={`border rounded-xl p-4 flex justify-between items-center ${darkMode ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}>
                    <div>
                      <p className="font-bold">{bill.billTo}</p>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(bill.billDate).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">₹{bill.grandTotal}</p>
                      <button
                        className="text-blue-500 hover:text-blue-400 text-xs mt-1 transition-colors"
                        onClick={() => { setBillData(bill); setViewMode('create'); }}
                      >
                        View →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
