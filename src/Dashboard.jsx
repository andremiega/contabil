import { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

export default function DashboardPrincipal({ setAbaAtiva, setTarefaCorrente, clienteSelecionado = {} }) {
  const [modo, setModo] = useState('aluno');
  const [periodoFiltro, setPeriodoFiltro] = useState('semestre');

  // ==========================================
  // DETECÇÃO INTELIGENTE DO TIPO DE ENTIDADE
  // ==========================================
 
 // ==========================================
  // DETECÇÃO INTELIGENTE DO TIPO DE ENTIDADE
  // ==========================================
  const isTerceiroSetor = useMemo(() => {
    const nome = (clienteSelecionado?.nome_empresa || clienteSelecionado?.nome || '').toLowerCase();
    
    return nome.includes('igreja') || nome.includes('ong') || nome.includes('instituto') || nome.includes('associação') || nome.includes('associacao');
  }, [clienteSelecionado]);

  // ==========================================
  // DADOS DINÂMICOS: FILA DE AUDITORIA
  // ==========================================
  const pendencias = [
    {
      id: 1, modulo: 'Folha & DP',
      desc: isTerceiroSetor ? 'Lançamento de Salários e INSS/FGTS' : 'Lançamento de Salários, Pró-Labore e Encargos',
      valor: 'R$ 8.500,00', numValor: 8500.00, status: 'pendente', rota: 'diario', debito: '4.1.1.01', credito: '2.1.2.01'
    },
    {
      id: 2, modulo: isTerceiroSetor ? 'Captação de Recursos' : 'Kardex / Estoque',
      desc: isTerceiroSetor ? 'Reconhecimento de Doação Recebida' : 'Reconhecimento de CMV (Venda NF-e 459)',
      valor: 'R$ 1.200,00', numValor: 1200.00, status: 'pendente', rota: 'diario',
      debito: isTerceiroSetor ? '1.1.1.02' : '4.1.1.02', 
      credito: isTerceiroSetor ? '4.1.1.05' : '1.1.5.01'
    },
    {
      id: 3, modulo: isTerceiroSetor ? 'Isenção / Imunidade' : 'Fiscal / ICMS',
      desc: isTerceiroSetor ? 'Apropriação PIS s/ Folha (1%)' : 'Apropriação de ICMS e DIFAL a Recolher',
      valor: 'R$ 450,00', numValor: 450.00, status: 'resolvido', rota: 'diario', debito: '3.1.2.01', credito: '2.1.3.01'
    },
    {
      id: 4, modulo: 'Ativo Imobilizado',
      desc: 'Depreciação Mensal de Equipamentos (NBC TG 27)',
      valor: 'R$ 680,00', numValor: 680.00, status: 'pendente', rota: 'diario', debito: '4.1.2.05', credito: '1.2.3.09'
    }
  ];

  // ==========================================
  // DADOS DINÂMICOS: GRÁFICOS
  // ==========================================
  const dadosGraficoFluxo = [
    { mes: 'Jan', receitas: 18500, despesas: 11200, resultado: 7300 },
    { mes: 'Fev', receitas: 21400, despesas: 12800, resultado: 8600 },
    { mes: 'Mar', receitas: 19800, despesas: 12100, resultado: 7700 },
    { mes: 'Abr', receitas: 25600, despesas: 14500, resultado: 11100 },
    { mes: 'Mai', receitas: 29200, despesas: 16100, resultado: 13100 },
    { mes: 'Jun', receitas: 34800, despesas: 18400, resultado: 16400 },
  ];

  const dadosComposicaoCustos = isTerceiroSetor ? [
    { name: 'Projetos Sociais', value: 45, color: '#3b82f6' },
    { name: 'Folha & Encargos', value: 35, color: '#10b981' },
    { name: 'Custos Fixos Adm.', value: 15, color: '#6366f1' },
    { name: 'Tributos (PIS Folha)', value: 5, color: '#f59e0b' },
  ] : [
    { name: 'CMV / Fornecedores', value: 38, color: '#3b82f6' },
    { name: 'Folha & Encargos', value: 29, color: '#10b981' },
    { name: 'Tributos (DAS/IVA)', value: 18, color: '#f59e0b' },
    { name: 'Custos Fixos Adm.', value: 15, color: '#6366f1' },
  ];

  // Gráfico de Barras Metamórfico
  const dadosComparativoEmpresa = [
    { nome: 'Simples Nacional', valor: 14200 },
    { nome: 'Lucro Presumido', valor: 19800 },
    { nome: 'Lucro Real', valor: 16900 },
    { nome: 'IVA Dual (Créditos)', valor: 15400 },
  ];

  const dadosOrigemTerceiroSetor = [
    { nome: 'Doações PF', valor: 18500 },
    { nome: 'Convênios Públicos', valor: 25000 },
    { nome: 'Eventos/Bazares', valor: 8200 },
    { nome: 'Rendimentos Financ.', valor: 2400 },
  ];

  const dadosBarChart = isTerceiroSetor ? dadosOrigemTerceiroSetor : dadosComparativoEmpresa;

  // ==========================================
  // DADOS DINÂMICOS: KPIs e AGENDA
  // ==========================================
  const indicadoresLiquidez = [
    { sigla: 'LC', nome: 'Liquidez Corrente', valor: '1,84', meta: '> 1,20', status: 'Saudável', cor: '#10b981', pct: 85 },
    { sigla: 'LS', nome: 'Liquidez Seca', valor: '1,42', meta: '> 1,00', status: 'Excelente', cor: '#3b82f6', pct: 75 },
    { sigla: 'EG', nome: 'Endividamento Geral', valor: '28,4%', meta: '< 50%', status: 'Baixo Risco', cor: '#8b5cf6', pct: 28 },
    isTerceiroSetor 
      ? { sigla: 'IS', nome: 'Índice de Sobrevivência', valor: '5,2', meta: '> 3 meses', status: 'Caixa Forte', cor: '#f59e0b', pct: 90 }
      : { sigla: 'ROE', nome: 'Retorno s/ PL (ROE)', valor: '22,6%', meta: '> 15%', status: 'Alta Rentab.', cor: '#f59e0b', pct: 90 }
  ];

  const obrigacoesFiscais = isTerceiroSetor ? [
    { sigla: 'DCTFWeb / eSocial', vencimento: 'Dia 15', status: 'Transmitido', cor: '#16a34a', bg: '#dcfce7', aba: 'esocial' },
    { sigla: 'EFD-Contribuições (PIS)', vencimento: 'Dia 15', status: 'Auditoria', cor: '#2563eb', bg: '#dbeafe', aba: 'fiscal' },
    { sigla: 'ECF (Imunes/Isentas)', vencimento: 'Julho', status: 'No Prazo', cor: '#16a34a', bg: '#dcfce7', aba: 'sped' },
    { sigla: 'CEBAS / Renovação', vencimento: 'Anual', status: 'Em Análise', cor: '#d97706', bg: '#fef3c7', aba: 'legalizacao' }
  ] : [
    { sigla: 'DCTFWeb / eSocial', vencimento: 'Dia 15', status: 'Transmitido', cor: '#16a34a', bg: '#dcfce7', aba: 'esocial' },
    { sigla: 'PGDAS-D (Simples)', vencimento: 'Dia 20', status: 'Em Apuração', cor: '#d97706', bg: '#fef3c7', aba: 'simples' },
    { sigla: 'SPED ECD / ECF', vencimento: 'Dia 25', status: 'Pendente', cor: '#2563eb', bg: '#dbeafe', aba: 'sped' },
    { sigla: 'EFD-Reinf', vencimento: 'Dia 15', status: 'Conciliado', cor: '#16a34a', bg: '#dcfce7', aba: 'notas' }
  ];

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', width: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.4s ease-out' }}>

      {/* =================================================================
          1. BANNER EXECUTIVO SUPERIOR (COCKPIT DE COMANDO)
         ================================================================= */}
      <div style={{
        background: isTerceiroSetor ? 'linear-gradient(135deg, #4c0519 0%, #831843 100%)' : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        color: 'white', padding: '22px 26px', borderRadius: '14px', border: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '18px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ backgroundColor: isTerceiroSetor ? '#be185d' : '#2563eb', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
              {isTerceiroSetor ? 'Controladoria Terceiro Setor' : 'BI & Controladoria 4.0'}
            </span>
            <span style={{ fontSize: '12px', color: '#f8fafc', fontWeight: '600' }}>
              • {clienteSelecionado?.nome || 'Dashboard Geral'}
            </span>
          </div>
          <h1 style={{ margin: '0 0 4px 0', color: 'white', fontSize: '24px', fontWeight: '900' }}>
            Painel Executivo de Controladoria & BI {isTerceiroSetor ? '🕊️' : '🚀'}
          </h1>
          <p style={{ margin: 0, color: '#cbd5e1', fontSize: '13.5px' }}>
            {isTerceiroSetor 
              ? 'Acompanhe a aplicação do Fundo Patrimonial, doações e obrigações da Imunidade Tributária.'
              : 'Acompanhe a evolução patrimonial, audite lançamentos e simule cenários tributários.'}
          </p>
        </div>

        <div style={{ display: 'flex', backgroundColor: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <button type="button" onClick={() => setModo('aluno')} style={{ padding: '8px 16px', borderRadius: '7px', border: 'none', fontWeight: 'bold', fontSize: '12.5px', cursor: 'pointer', backgroundColor: modo === 'aluno' ? (isTerceiroSetor ? '#be185d' : '#2563eb') : 'transparent', color: modo === 'aluno' ? 'white' : '#94a3b8' }}>
            🎓 Modo Acadêmico
          </button>
          <button type="button" onClick={() => setModo('profissional')} style={{ padding: '8px 16px', borderRadius: '7px', border: 'none', fontWeight: 'bold', fontSize: '12.5px', cursor: 'pointer', backgroundColor: modo === 'profissional' ? '#10b981' : 'transparent', color: modo === 'profissional' ? '#0f172a' : '#94a3b8' }}>
            💼 Controller Pro
          </button>
        </div>
      </div>

      {modo === 'profissional' && (
        <div style={{ backgroundColor: '#f0fdf4', padding: '12px 18px', borderRadius: '10px', border: '1px solid #86efac', color: '#166534', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13.5px' }}>
          <div><span>⚡</span> <strong>Motor de Automação Ativo:</strong> Integração contábil contínua ativada.</div>
          <button type="button" onClick={() => setAbaAtiva && setAbaAtiva('balanco')} style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
            Ver Balanço Consolidado →
          </button>
        </div>
      )}

      {/* =================================================================
          2. FAIXA DE 4 KPIs EXECUTIVOS
         ================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div style={{ backgroundColor: 'white', padding: '18px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: '#64748b', fontSize: '11.5px', fontWeight: '800', textTransform: 'uppercase' }}>Disponibilidade Caixa</span>
            <span style={{ backgroundColor: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>+14,2%</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>R$ 42.500,00</div>
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>Bancos + Caixa (Liquidez)</span>
        </div>

        <div style={{ backgroundColor: 'white', padding: '18px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: '#64748b', fontSize: '11.5px', fontWeight: '800', textTransform: 'uppercase' }}>
              {isTerceiroSetor ? 'Arrecadação Total' : 'Receita Bruta'}
            </span>
            <span style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>Meta 96%</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a' }}>R$ 149.300,00</div>
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>Acumulado do Semestre</span>
        </div>

        <div style={{ backgroundColor: 'white', padding: '18px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', borderLeft: `4px solid ${isTerceiroSetor ? '#be185d' : '#8b5cf6'}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: '#64748b', fontSize: '11.5px', fontWeight: '800', textTransform: 'uppercase' }}>
              {isTerceiroSetor ? 'Superávit do Período' : 'Lucro Líquido / EBITDA'}
            </span>
            <span style={{ backgroundColor: isTerceiroSetor ? '#fce7f3' : '#f3e8ff', color: isTerceiroSetor ? '#be185d' : '#6d28d9', padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }}>
              {isTerceiroSetor ? 'Fundo +22%' : 'Margem 42,9%'}
            </span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: isTerceiroSetor ? '#be185d' : '#16a34a' }}>R$ 64.200,00</div>
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>{isTerceiroSetor ? 'Recursos para reinvestimento' : 'Após deduções e impostos'}</span>
        </div>

        <div style={{ backgroundColor: 'white', padding: '18px 20px', borderRadius: '12px', border: '1px solid #cbd5e1', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ color: '#64748b', fontSize: '11.5px', fontWeight: '800', textTransform: 'uppercase' }}>Score Compliance</span>
            <span style={{ fontSize: '16px' }}>🏆</span>
          </div>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#2563eb' }}>1.250 XP</div>
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>Nível: Auditor Sênior</span>
        </div>
      </div>

     {/* =================================================================
          3. GRÁFICO DE ÁREA + FILA DE AUDITORIA (Vacinado para Mobile)
         ================================================================= */}
      <div style={{ 
        display: 'grid', 
        /* O truque mágico: min(100%, 320px) garante que ele nunca será maior que a tela do telemóvel */
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', 
        gap: '20px' 
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '22px', 
          borderRadius: '12px', 
          border: '1px solid #cbd5e1', 
          display: 'flex', 
          flexDirection: 'column',
          /* Blindagem extra: impede que o conteúdo de dentro estique esta caixa */
          minWidth: 0,
          overflowX: 'auto' 
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>📈 Evolução de {isTerceiroSetor ? 'Arrecadação vs Aplicação' : 'Receitas vs Custos'}</h3>
              <span style={{ fontSize: '12px', color: '#64748b' }}>Regime de Competência (R$)</span>
            </div>
          </div>
          
          {/* Se a tela for muito pequena, o gráfico ganha um pequeno scroll só para ele, mas não quebra a página */}
          <div style={{ width: '100%', minWidth: '300px', height: '270px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dadosGraficoFluxo} margin={{ top: 10, right: 15, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorDesp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor={isTerceiroSetor ? "#be185d" : "#3b82f6"} stopOpacity={0.3}/><stop offset="95%" stopColor={isTerceiroSetor ? "#be185d" : "#3b82f6"} stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 12, fill: '#475569' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v / 1000}k`} />
                <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, '']} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="receitas" name={isTerceiroSetor ? "Arrecadação" : "Receita Bruta"} stroke="#10b981" strokeWidth={3} fill="url(#colorRec)" />
                <Area type="monotone" dataKey="despesas" name={isTerceiroSetor ? "Aplicação Social" : "Custos/Despesas"} stroke="#ef4444" strokeWidth={2.5} fill="url(#colorDesp)" />
                <Area type="monotone" dataKey="resultado" name={isTerceiroSetor ? "Superávit" : "Lucro Líquido"} stroke={isTerceiroSetor ? "#be185d" : "#3b82f6"} strokeWidth={2.5} fill="url(#colorRes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      
        <div style={{ backgroundColor: 'white', padding: '22px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <span style={{ fontSize: '20px' }}>📋</span>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Fila de Auditoria Contábil</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>Aguardando escrituração no Diário</p>
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gap: '10px' }}>
            {pendencias.map(pend => (
              <div key={pend.id} style={{ padding: '12px', borderRadius: '10px', border: pend.status === 'pendente' ? '1px solid #fcd34d' : '1px solid #bbf7d0', backgroundColor: pend.status === 'pendente' ? '#fffbeb' : '#f0fdf4' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: '800', color: pend.status === 'pendente' ? '#b45309' : '#15803d' }}>{pend.status === 'pendente' ? '⚠️ ' : '✅ '}{pend.modulo}</span>
                  <span style={{ fontSize: '12.5px', fontWeight: '900' }}>{pend.valor}</span>
                </div>
                <p style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: '600' }}>{pend.desc}</p>
                {pend.status === 'pendente' ? (
                  <button onClick={() => setAbaAtiva && setAbaAtiva(pend.rota)} style={{ width: '100%', padding: '7px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', fontSize: '11.5px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Escriturar no Diário ➔
                  </button>
                ) : (
                  <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#15803d', textAlign: 'center', padding: '5px', backgroundColor: '#dcfce7', borderRadius: '6px' }}>✓ Lançamento Conciliado</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* =================================================================
          4. GRÁFICOS INFERIORES METAMÓRFICOS (DONUT E BARRAS)
         ================================================================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        <div style={{ backgroundColor: 'white', padding: '22px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '15.5px', fontWeight: '800' }}>🍩 Estrutura de {isTerceiroSetor ? 'Gastos e Projetos' : 'Custos & Despesas'}</h3>
          <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b' }}>Distribuição das saídas operacionais</p>
          <div style={{ width: '100%', height: '200px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dadosComposicaoCustos} cx="50%" cy="50%" innerRadius={52} outerRadius={78} paddingAngle={4} dataKey="value">
                  {dadosComposicaoCustos.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {dadosComposicaoCustos.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#f8fafc', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '11px' }}>
                <span style={{ fontWeight: '600' }}><span style={{ color: item.color }}>●</span> {item.name}</span>
                <strong>{item.value}%</strong>
              </div>
            ))}
          </div>
        </div>

        {/* GRÁFICO METAMÓRFICO: TRIBUTOS (Empresa) vs ORIGEM DE RECURSOS (ONG) */}
        <div style={{ backgroundColor: 'white', padding: '22px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '15.5px', fontWeight: '800' }}>
              {isTerceiroSetor ? '🤝 Matriz de Captação de Recursos' : '🏛️ Planejamento Tributário (Elisão Fiscal)'}
            </h3>
            <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#64748b' }}>
              {isTerceiroSetor ? 'Composição das doações e convênios no semestre' : 'Comparativo de carga tributária por regime (R$)'}
            </p>
            <div style={{ width: '100%', height: '210px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosBarChart} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="nome" tick={{ fontSize: 10, fill: '#334155', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v/1000}k`} />
                  <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString('pt-BR')}`, isTerceiroSetor ? 'Arrecadado' : 'Imposto Estimado']} />
                  <Bar dataKey="valor" fill={isTerceiroSetor ? '#be185d' : '#2563eb'} radius={[6, 6, 0, 0]} barSize={38} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ backgroundColor: isTerceiroSetor ? '#fdf2f8' : '#eff6ff', border: `1px solid ${isTerceiroSetor ? '#fbcfe8' : '#bfdbfe'}`, padding: '10px 12px', borderRadius: '8px', fontSize: '12px', color: isTerceiroSetor ? '#831843' : '#1e3a8a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>💡 <strong>{isTerceiroSetor ? 'Maior Fonte:' : 'Melhor Cenário:'}</strong> {isTerceiroSetor ? 'Convênios Públicos' : 'Simples Nacional'}</span>
          </div>
        </div>

        {/* INDICADORES E CALENDÁRIO */}
        <div style={{ backgroundColor: 'white', padding: '22px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '15.5px', fontWeight: '800' }}>⚖️ Índices e Compliance Fiscal</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px', marginTop: '12px' }}>
            {indicadoresLiquidez.map((ind, i) => (
              <div key={i} style={{ backgroundColor: '#f8fafc', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 'bold' }}>{ind.nome} ({ind.sigla})</span>
                  <strong>{ind.valor}</strong>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: '#e2e8f0', borderRadius: '3px' }}>
                  <div style={{ width: `${ind.pct}%`, height: '100%', backgroundColor: ind.cor, borderRadius: '3px' }}></div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#475569', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>📅 Agenda Fiscal</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {obrigacoesFiscais.map((ob, idx) => (
                <div key={idx} style={{ backgroundColor: ob.bg, padding: '6px 10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <strong>{ob.sigla}</strong>
                  <span style={{ color: ob.cor, fontWeight: 'bold' }}>{ob.vencimento}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}