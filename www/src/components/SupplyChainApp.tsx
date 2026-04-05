import { useState } from 'react';
import { useQuery, useMutation, QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

interface Calcado {
    id: string;
    marca: string;
    modelo: string;
    tamanho: number;
    donoAtual: string;
    status: string;
}

// ─── Inject global styles ───────────────────────────────────────────────────
const GlobalStyles = () => (
    <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --ocean-900: #020d18;
            --ocean-800: #041c2c;
            --ocean-700: #062840;
            --ocean-600: #0a3a5c;
            --ocean-500: #0e5080;
            --amber-warm: #f59e0b;
            --amber-glow: #fbbf24;
            --amber-light: #fde68a;
            --teal-accent: #06b6d4;
            --glass-bg: rgba(4, 28, 44, 0.65);
            --glass-border: rgba(6, 182, 212, 0.18);
            --glass-hover: rgba(4, 28, 44, 0.80);
            --text-primary: #f0f9ff;
            --text-secondary: #94c9e0;
            --text-muted: #4d8aaa;
            --success: #10b981;
            --danger: #ef4444;
        }

        body {
            font-family: 'DM Sans', sans-serif;
            background: var(--ocean-900);
            color: var(--text-primary);
            min-height: 100vh;
        }

        .syne { font-family: 'Syne', sans-serif; }

        /* ── Background ── */
        .bg-maritime {
            min-height: 100vh;
            background-image: url('/bg.jpg');
            background-size: cover;
            background-position: center top;
            background-attachment: fixed;
            position: relative;
        }
        .bg-maritime::before {
            content: '';
            position: fixed;
            inset: 0;
            background: linear-gradient(
                160deg,
                rgba(2,13,24,0.82) 0%,
                rgba(4,28,44,0.70) 40%,
                rgba(2,13,24,0.88) 100%
            );
            pointer-events: none;
            z-index: 0;
        }

        /* ── Glass card ── */
        .glass {
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            backdrop-filter: blur(18px);
            -webkit-backdrop-filter: blur(18px);
            border-radius: 16px;
            transition: border-color 0.3s, background 0.3s;
        }
        .glass:hover { border-color: rgba(6,182,212,0.32); }

        /* ── Login cards ── */
        .login-card {
            background: rgba(4, 28, 44, 0.55);
            border: 1px solid var(--glass-border);
            backdrop-filter: blur(20px);
            border-radius: 14px;
            padding: 28px 24px;
            cursor: pointer;
            transition: all 0.3s ease;
            text-align: left;
            width: 100%;
        }
        .login-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 16px 48px rgba(0,0,0,0.4), 0 0 24px rgba(6,182,212,0.15);
        }
        .login-card.fabrica:hover  { border-color: #3b82f6; box-shadow: 0 16px 48px rgba(0,0,0,0.4), 0 0 28px rgba(59,130,246,0.25); }
        .login-card.logistica:hover { border-color: var(--amber-warm); box-shadow: 0 16px 48px rgba(0,0,0,0.4), 0 0 28px rgba(245,158,11,0.25); }
        .login-card.varejo:hover  { border-color: var(--success); box-shadow: 0 16px 48px rgba(0,0,0,0.4), 0 0 28px rgba(16,185,129,0.25); }

        /* ── Topbar ── */
        .topbar {
            background: rgba(2, 10, 18, 0.80);
            border-bottom: 1px solid var(--glass-border);
            backdrop-filter: blur(24px);
            position: sticky;
            top: 0;
            z-index: 50;
        }

        /* ── Inputs ── */
        .field {
            width: 100%;
            padding: 10px 14px;
            background: rgba(2, 13, 24, 0.60);
            border: 1px solid rgba(6,182,212,0.20);
            border-radius: 10px;
            color: var(--text-primary);
            font-family: 'DM Sans', sans-serif;
            font-size: 14px;
            outline: none;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        .field::placeholder { color: var(--text-muted); }
        .field:focus {
            border-color: var(--teal-accent);
            box-shadow: 0 0 0 3px rgba(6,182,212,0.12);
        }
        .field-lg {
            padding: 14px 18px;
            font-size: 16px;
            border-radius: 12px;
        }

        /* ── Buttons ── */
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-family: 'Syne', sans-serif;
            font-weight: 700;
            letter-spacing: 0.02em;
            border: none;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.25s ease;
        }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-primary {
            background: linear-gradient(135deg, var(--teal-accent), #0891b2);
            color: #fff;
            padding: 12px 24px;
            font-size: 14px;
            box-shadow: 0 4px 16px rgba(6,182,212,0.30);
        }
        .btn-primary:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(6,182,212,0.45);
        }

        .btn-amber {
            background: linear-gradient(135deg, var(--amber-warm), #d97706);
            color: #fff;
            padding: 13px 20px;
            font-size: 14px;
            flex: 1;
            box-shadow: 0 4px 16px rgba(245,158,11,0.25);
        }
        .btn-amber:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(245,158,11,0.40);
        }

        .btn-emerald {
            background: linear-gradient(135deg, #10b981, #059669);
            color: #fff;
            padding: 13px 20px;
            font-size: 14px;
            flex: 1;
            box-shadow: 0 4px 16px rgba(16,185,129,0.25);
        }
        .btn-emerald:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(16,185,129,0.40);
        }

        .btn-register {
            background: linear-gradient(135deg, #3b82f6, #1d4ed8);
            color: #fff;
            padding: 14px;
            font-size: 15px;
            width: 100%;
            margin-top: 8px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(59,130,246,0.30);
        }
        .btn-register:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 8px 28px rgba(59,130,246,0.45);
        }

        .btn-search {
            background: rgba(6,182,212,0.15);
            border: 1px solid var(--teal-accent);
            color: var(--teal-accent);
            padding: 14px 28px;
            font-size: 15px;
            border-radius: 12px;
            white-space: nowrap;
        }
        .btn-search:hover {
            background: var(--teal-accent);
            color: var(--ocean-900);
            box-shadow: 0 6px 20px rgba(6,182,212,0.35);
        }

        .btn-sair {
            background: transparent;
            border: 1px solid rgba(6,182,212,0.25);
            color: var(--text-secondary);
            padding: 7px 16px;
            font-size: 13px;
            border-radius: 8px;
        }
        .btn-sair:hover { border-color: var(--teal-accent); color: var(--text-primary); }

        /* ── Label ── */
        label {
            display: block;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: var(--text-muted);
            margin-bottom: 6px;
        }

        /* ── Badge ── */
        .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 999px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
        }
        .badge-teal { background: rgba(6,182,212,0.15); color: var(--teal-accent); border: 1px solid rgba(6,182,212,0.30); }
        .badge-emerald { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.30); }
        .badge-amber { background: rgba(245,158,11,0.15); color: var(--amber-glow); border: 1px solid rgba(245,158,11,0.30); }
        .badge-blue { background: rgba(59,130,246,0.15); color: #93c5fd; border: 1px solid rgba(59,130,246,0.30); }

        /* ── Data grid ── */
        .data-cell p.label { color: var(--text-muted); font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; margin: 0 0 4px; }
        .data-cell p.value { color: var(--text-primary); font-size: 18px; font-weight: 700; font-family: 'Syne', sans-serif; }

        /* ── Divider ── */
        .divider { height: 1px; background: var(--glass-border); margin: 0; }

        /* ── Alert ── */
        .alert-error {
            background: rgba(239,68,68,0.10);
            border: 1px solid rgba(239,68,68,0.30);
            color: #fca5a5;
            padding: 14px 18px;
            border-radius: 12px;
            font-size: 14px;
        }

        /* ── Pulse loading ── */
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }
        .animate-pulse { animation: pulse 2s ease-in-out infinite; }

        /* ── Glow dot ── */
        .dot-live {
            width: 8px; height: 8px;
            background: var(--teal-accent);
            border-radius: 50%;
            box-shadow: 0 0 8px var(--teal-accent);
            display: inline-block;
            margin-right: 6px;
        }

        /* ── Hero section ── */
        .hero-content {
            position: relative;
            z-index: 1;
            max-width: 960px;
            margin: 0 auto;
            padding: 0 24px;
        }

        /* ── Layout helpers ── */
        .z1 { position: relative; z-index: 1; }
        .grid-3 { display: grid; grid-template-columns: 1fr; gap: 16px; }
        @media (min-width: 768px) { .grid-3 { grid-template-columns: repeat(3, 1fr); } }

        .grid-dashboard { display: grid; grid-template-columns: 1fr; gap: 24px; }
        @media (min-width: 1024px) {
            .grid-dashboard { grid-template-columns: repeat(12, 1fr); }
            .col-4 { grid-column: span 4; }
            .col-8 { grid-column: span 8; }
            .col-12 { grid-column: span 12; }
        }

        .space-y-4 > * + * { margin-top: 16px; }
        .space-y-3 > * + * { margin-top: 12px; }
        .space-y-6 > * + * { margin-top: 24px; }

        .flex { display: flex; }
        .flex-col { flex-direction: column; }
        .items-center { align-items: center; }
        .justify-between { justify-content: space-between; }
        .gap-2 { gap: 8px; }
        .gap-3 { gap: 12px; }
        .gap-4 { gap: 16px; }
        .gap-6 { gap: 24px; }
        .flex-1 { flex: 1; }
        .w-full { width: 100%; }
        .text-center { text-align: center; }
        .italic { font-style: italic; }

        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .grid-4 { display: grid; grid-template-columns: repeat(2,1fr); gap: 20px; }
        @media (min-width: 768px) { .grid-4 { grid-template-columns: repeat(4,1fr); } }

        /* scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: var(--ocean-900); }
        ::-webkit-scrollbar-thumb { background: var(--ocean-600); border-radius: 99px; }
    `}</style>
);

// ─── Org config ─────────────────────────────────────────────────────────────
const orgConfig: Record<string, { label: string; emoji: string; desc: string; cls: string; badge: string }> = {
    org1: { label: 'Fábrica', emoji: '🏭', desc: 'Manufatura e criação de novos lotes · Org1', cls: 'fabrica', badge: 'badge-blue' },
    org2: { label: 'Logística', emoji: '🚢', desc: 'Transportadoras e distribuidores · Org2', cls: 'logistica', badge: 'badge-amber' },
    org3: { label: 'Varejo', emoji: '🏪', desc: 'Lojas físicas e recebimento final · Org3', cls: 'varejo', badge: 'badge-emerald' },
};

// ─── Main App ────────────────────────────────────────────────────────────────
function MainApp() {
    const [loggedOrg, setLoggedOrg] = useState<string | null>(null);
    const [loteId, setLoteId] = useState('LOTE-001');
    const [novoId, setNovoId] = useState('LOTE-002');
    const [novaMarca, setNovaMarca] = useState('Nike');
    const [novoModelo, setNovoModelo] = useState('Air Max');
    const [novoTamanho, setNovoTamanho] = useState('42');

    const { data, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['calcado', loteId, loggedOrg],
        queryFn: async () => {
            const response = await fetch(`http://localhost:3000/api/calcados/${loteId}`, {
                headers: { 'x-org-id': loggedOrg!, 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error((await response.json()).erro || 'Erro na consulta');
            return (await response.json()) as Calcado;
        },
        enabled: !!loggedOrg,
        retry: false,
    });

    const fabricarMutation = useMutation({
        mutationFn: async () => {
            const response = await fetch('http://localhost:3000/api/calcados', {
                method: 'POST',
                headers: { 'x-org-id': loggedOrg!, 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: novoId, marca: novaMarca, modelo: novoModelo, tamanho: Number(novoTamanho) })
            });
            if (!response.ok) throw new Error((await response.json()).erro || 'Erro ao fabricar');
            return await response.json();
        },
        onSuccess: () => { alert('✅ Lote fabricado!'); setLoteId(novoId); refetch(); },
        onError: (err: any) => alert(`❌ Erro: ${err.message}`)
    });

    const transferirMutation = useMutation({
        mutationFn: async (passo: 'logistica' | 'varejo') => {
            const response = await fetch(`http://localhost:3000/api/calcados/${loteId}/transferir`, {
                method: 'PUT',
                headers: { 'x-org-id': loggedOrg!, 'Content-Type': 'application/json' },
                body: JSON.stringify({ passo })
            });
            if (!response.ok) throw new Error((await response.json()).erro || 'Erro ao transferir');
            return await response.json();
        },
        onSuccess: () => { alert('🚚 Transferência registrada!'); refetch(); },
        onError: (err: any) => alert(`❌ Erro: ${err.message}`)
    });

    // ── TELA DE LOGIN ──────────────────────────────────────────────────────
    if (!loggedOrg) {
        return (
            <div className="bg-maritime" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '32px 16px' }}>
                <GlobalStyles />
                <div className="hero-content" style={{ width: '100%' }}>
                    {/* Logotype */}
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                            <span style={{ fontSize: '28px' }}>⚓</span>
                            <h1 className="syne" style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-0.03em', color: 'var(--text-primary)' }}>
                                Recife<span style={{ color: 'var(--teal-accent)' }}>llos</span>
                            </h1>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '520px', margin: '0 auto', lineHeight: 1.65 }}>
                            Rastreabilidade de ponta a ponta na cadeia de suprimentos de calçados — imutável, seguro e em tempo real via Hyperledger Fabric.
                        </p>
                    </div>

                    {/* Login panel */}
                    <div className="glass" style={{ padding: '40px 36px', maxWidth: '780px', margin: '0 auto' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '28px' }}>
                            <span className="dot-live"></span>
                            <p className="syne" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                                Selecione seu portal de acesso
                            </p>
                        </div>
                        <div className="grid-3">
                            {Object.entries(orgConfig).map(([key, cfg]) => (
                                <button key={key} onClick={() => setLoggedOrg(key)} className={`login-card ${cfg.cls}`}>
                                    <div style={{ fontSize: '36px', marginBottom: '16px' }}>{cfg.emoji}</div>
                                    <h3 className="syne" style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>{cfg.label}</h3>
                                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{cfg.desc}</p>
                                </button>
                            ))}
                        </div>

                        {/* Tech note */}
                        <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                            {['Hyperledger Fabric', 'Imutável', 'Tempo Real'].map(t => (
                                <span key={t} className="syne" style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                    ✦ {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ── DASHBOARD ─────────────────────────────────────────────────────────
    const org = orgConfig[loggedOrg];

    return (
        <div className="bg-maritime" style={{ minHeight: '100vh' }}>
            <GlobalStyles />

            {/* Topbar */}
            <header className="topbar">
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>⚓</span>
                        <h1 className="syne" style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em' }}>
                            Recife<span style={{ color: 'var(--teal-accent)' }}>llos</span>
                        </h1>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className={`badge ${org.badge}`}>{org.emoji} {org.label}</span>
                        <button className="btn btn-sair syne" onClick={() => setLoggedOrg(null)}>Sair</button>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="z1" style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
                <div className="grid-dashboard">

                    {/* ── Fabricação (org1 only) ── */}
                    {loggedOrg === 'org1' && (
                        <div className="glass col-4" style={{ padding: '28px', alignSelf: 'start' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                                <span style={{ fontSize: '18px' }}>🏭</span>
                                <h2 className="syne" style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                                    Novo Ativo
                                </h2>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label>ID do Lote</label>
                                    <input className="field" value={novoId} onChange={e => setNovoId(e.target.value)} />
                                </div>
                                <div className="grid-2">
                                    <div>
                                        <label>Marca</label>
                                        <input className="field" value={novaMarca} onChange={e => setNovaMarca(e.target.value)} />
                                    </div>
                                    <div>
                                        <label>Modelo</label>
                                        <input className="field" value={novoModelo} onChange={e => setNovoModelo(e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label>Tamanho</label>
                                    <input type="number" className="field" value={novoTamanho} onChange={e => setNovoTamanho(e.target.value)} />
                                </div>
                                <button
                                    className="btn btn-register syne"
                                    onClick={() => fabricarMutation.mutate()}
                                    disabled={fabricarMutation.isPending}
                                >
                                    {fabricarMutation.isPending ? '⏳ Gravando no Ledger...' : '+ Registrar Ativo'}
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── Rastreador ── */}
                    <div className={`glass ${loggedOrg === 'org1' ? 'col-8' : 'col-12'}`} style={{ padding: '28px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                            <span style={{ fontSize: '18px' }}>🔍</span>
                            <h2 className="syne" style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                                Rastreador do Livro-Razão
                            </h2>
                        </div>

                        {/* Search bar */}
                        <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
                            <input
                                value={loteId}
                                onChange={e => setLoteId(e.target.value)}
                                className="field field-lg"
                                placeholder="Digite o ID do Lote..."
                                style={{ flex: 1 }}
                            />
                            <button className="btn btn-search syne" onClick={() => refetch()}>
                                Buscar
                            </button>
                        </div>

                        {/* States */}
                        {isLoading && (
                            <div className="animate-pulse" style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)', fontSize: '15px' }}>
                                <div style={{ fontSize: '32px', marginBottom: '12px' }}>⛵</div>
                                Consultando a rede Blockchain...
                            </div>
                        )}
                        {isError && (
                            <div className="alert-error">
                                ❌ {(error as any).message}
                            </div>
                        )}

                        {data && !isLoading && !isError && (
                            <div style={{ border: '1px solid var(--glass-border)', borderRadius: '12px', overflow: 'hidden' }}>
                                {/* Header */}
                                <div style={{ padding: '18px 22px', background: 'rgba(2,13,24,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                                    <div>
                                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Ativo Blockchain</p>
                                        <h3 className="syne" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{data.id}</h3>
                                    </div>
                                    <span className="badge badge-emerald">{data.status}</span>
                                </div>

                                <div className="divider"></div>

                                {/* Data */}
                                <div className="grid-4" style={{ padding: '24px 22px' }}>
                                    {[
                                        { label: 'Marca', value: data.marca },
                                        { label: 'Modelo', value: data.modelo },
                                        { label: 'Tamanho', value: String(data.tamanho) },
                                        { label: 'Custódia', value: data.donoAtual, highlight: true },
                                    ].map(item => (
                                        <div key={item.label} className="data-cell">
                                            <p className="label">{item.label}</p>
                                            <p className="value" style={item.highlight ? { color: 'var(--teal-accent)', fontSize: '15px' } : {}}>{item.value}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="divider"></div>

                                {/* Actions */}
                                <div style={{ padding: '20px 22px', background: 'rgba(2,13,24,0.35)' }}>
                                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>Ações na Rede</p>
                                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                        {loggedOrg === 'org1' && data.donoAtual === 'Org1MSP' && (
                                            <button className="btn btn-amber syne" onClick={() => transferirMutation.mutate('logistica')} disabled={transferirMutation.isPending}>
                                                🚢 Despachar para Logística
                                            </button>
                                        )}
                                        {loggedOrg === 'org1' && data.donoAtual !== 'Org1MSP' && (
                                            <p className="italic" style={{ color: 'var(--text-muted)', fontSize: '13px', paddingTop: '8px' }}>Este lote não está mais sob custódia da Fábrica.</p>
                                        )}
                                        {loggedOrg === 'org2' && data.donoAtual === 'Org2MSP' && (
                                            <button className="btn btn-emerald syne" onClick={() => transferirMutation.mutate('varejo')} disabled={transferirMutation.isPending}>
                                                🏪 Entregar na Loja (Varejo)
                                            </button>
                                        )}
                                        {loggedOrg === 'org2' && data.donoAtual !== 'Org2MSP' && (
                                            <p className="italic" style={{ color: 'var(--text-muted)', fontSize: '13px', paddingTop: '8px' }}>Este lote não está com a transportadora no momento.</p>
                                        )}
                                        {loggedOrg === 'org3' && data.donoAtual === 'Org3MSP' && (
                                            <div style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '10px', padding: '13px 20px', color: '#34d399', fontWeight: 600, fontSize: '14px' }}>
                                                ✅ Lote finalizado e disponível para venda!
                                            </div>
                                        )}
                                        {loggedOrg === 'org3' && data.donoAtual !== 'Org3MSP' && (
                                            <p className="italic" style={{ color: 'var(--text-muted)', fontSize: '13px', paddingTop: '8px' }}>Aguardando transportadora entregar este lote.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {!data && !isLoading && !isError && (
                            <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--text-muted)' }}>
                                <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }}>📦</div>
                                <p style={{ fontSize: '14px' }}>Insira um ID e clique em Buscar para rastrear um lote.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function SupplyChainApp() {
    return (
        <QueryClientProvider client={queryClient}>
            <MainApp />
        </QueryClientProvider>
    );
}