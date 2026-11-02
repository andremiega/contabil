import React, { useState } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

export default function SimuladorCEO({ registrarFatoGerador, mostrarToast }) {
  // ==========================================
  // 1. CENÁRIOS E ESTADO GLOBAL
  // ==========================================
  const cenarios = [
    { 
      id: 'padaria', nome: 'Padaria Pão de Ouro', tipo: 'Varejo Físico',
      caixaInicial: 15000, custoFixo: 12000, publicoAlvo: 1500, clientesBase: 300,
      desafio: 'Margens esmagadas pela inflação. Aumente a rentabilidade sem perder a clientela do bairro.'
    },
    { 
      id: 'tech', nome: 'SaaS CloudContábil', tipo: 'Tecnologia / B2B',
      caixaInicial: 80000, custoFixo: 45000, publicoAlvo: 800, clientesBase: 50,
      desafio: 'Alto Custo de Aquisição (CAC). Precisa estruturar marketing e reter clientes com bom suporte.'
    },
    { 
      id: 'franquia', nome: 'Açaí Tropical (Franquia)', tipo: 'Alimentação',
      caixaInicial: 30000, custoFixo: 20000, publicoAlvo: 5000, clientesBase: 500,
      desafio: 'Guerra de preços. Melhore o supply chain, calcule taxas de app (iFood) e o SAC para fidelizar.'
    }
  ];

  const [cenarioAtivo, setCenarioAtivo] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('estrategico');
  const [mesAtual, setMesAtual] = useState(1);
  
  // KPIs Dinâmicos
  const [caixa, setCaixa] = useState(0);
  const [clientes, setClientes] = useState(0);
  const [satisfacao, setSatisfacao] = useState(80); // 0 a 100
  const [qualidade, setQualidade] = useState(80);
  const [historicoDRE, setHistoricoDRE] = useState([]);
  
  // ==========================================
  // 2. PLANEJAMENTO ESTRATÉGICO & SWOT
  // ==========================================
  const [swot, setSwot] = useState({ forcas: '', fraquezas: '', oportunidades: '', ameacas: '' });
  const [planos, setPlanos] = useState({
    estrategico: 'Ex: Dobrar faturamento em 12 meses.',
    tatico: 'Ex: Expandir para canais de delivery.',
    operacional: 'Ex: Cotar fornecedores toda semana.'
  });

  // ==========================================
  // 3. MARKETING E VENDAS (4 Ps)
  // ==========================================
  const [marketing, setMarketing] = useState({
    produto: '', praca: '', promocao: '',
    verbaInsta: 0, verbaOffline: 0, verbaInfluencer: 0
  });

  // ==========================================
  // 4. SUPPLY CHAIN E FORMAÇÃO DE PREÇOS (MARKUP)
  // ==========================================
  const fornecedores = [
    { id: 'f1', nome: 'Atacadão (Baixo Custo)', custoUnid: 15, prazoPagamento: 0, qualidadeQA: 60, confianca: 'Baixa' },
    { id: 'f2', nome: 'Distribuidora Regional (Médio)', custoUnid: 22, prazoPagamento: 30, qualidadeQA: 85, confianca: 'Média' },
    { id: 'f3', nome: 'Premium Import (Alto Padrão)', custoUnid: 35, prazoPagamento: 60, qualidadeQA: 100, confianca: 'Alta' }
  ];
  
  const [op, setOp] = useState({ 
    fornecedorId: 'f2', 
    precoVenda: 50, 
    metaVendas: 1000,
    impostosPct: 8, 
    comissaoPct: 3  
  });

  // ==========================================
  // 5. SAC & ATENDIMENTO
  // ==========================================
  const [chamadosSAC, setChamadosSAC] = useState([
    { id: 1, tipo: 'Atraso', desc: 'Meu pedido demorou muito para chegar!', resolvido: false }
  ]);

  // ==========================================
  // MOTOR DE CÁLCULO EM TEMPO REAL
  // ==========================================
  const selecionarCenario = (c) => {
    setCenarioAtivo(c);
    setCaixa(c.caixaInicial);
    setClientes(c.clientesBase);
    setSatisfacao(80);
    setQualidade(80);
    setHistoricoDRE([]);
    setMesAtual(1);
    setOp({ ...op, impostosPct: c.id === 'tech' ? 12 : 8, comissaoPct: c.id === 'franquia' ? 15 : 3 });
    setChamadosSAC([{ id: 1, tipo: 'Boas-vindas', desc: 'O cliente adorou a inauguração!', resolvido: false }]);
  };

  const getForn = () => fornecedores.find(f => f.id === op.fornecedorId) || fornecedores[1];
  
  const custoAtual = getForn().custoUnid;
  const valorImpostos = op.precoVenda * (op.impostosPct / 100);
  const valorComissao = op.precoVenda * (op.comissaoPct / 100);
  
  const margemContribuicaoReais = op.precoVenda - custoAtual - valorImpostos - valorComissao;
  const margemContribuicaoPct = op.precoVenda > 0 ? (margemContribuicaoReais / op.precoVenda) * 100 : 0;
  
  const totalMarketing = marketing.verbaInsta + marketing.verbaOffline + marketing.verbaInfluencer;
  const despesasFixasTotais = (cenarioAtivo?.custoFixo || 0) + totalMarketing;
  
  const pontoEquilibrioQtde = margemContribuicaoReais > 0 ? Math.ceil(despesasFixasTotais / margemContribuicaoReais) : 0;

  // ==========================================
  // EXECUTAR MÊS (FECHAMENTO DRE)
  // ==========================================
  const executarMes = () => {
    if (margemContribuicaoReais <= 0) return mostrarToast('Cuidado! Sua Margem de Contribuição está negativa. Você paga para trabalhar!', 'erro');
    if (totalMarketing > caixa) return mostrarToast('Você não tem caixa para essa verba de marketing!', 'erro');

    const f = getForn();
    
    const pendenciasSAC = chamadosSAC.filter(c => !c.resolvido).length;
    const novaQualidade = Math.floor((qualidade + f.qualidadeQA) / 2);
    
    let novaSatisfacao = satisfacao;
    if (pendenciasSAC > 0) novaSatisfacao -= (pendenciasSAC * 8); 
    if (novaQualidade < 70) novaSatisfacao -= 10;
    if (novaQualidade > 85 && pendenciasSAC === 0) novaSatisfacao += 5;
    novaSatisfacao = Math.max(0, Math.min(100, novaSatisfacao)); 

    const alcance = (marketing.verbaInsta * 2.5) + (marketing.verbaOffline * 1.5) + (marketing.verbaInfluencer * 3) + cenarioAtivo.publicoAlvo;
    const fatorPreco = op.precoVenda > (f.custoUnid * 3) ? 0.5 : (op.precoVenda > (f.custoUnid * 2) ? 0.8 : 1.2);
    
    let vendasReais = Math.floor(alcance * 0.15 * fatorPreco * (novaSatisfacao / 100)); 
    if (vendasReais > op.metaVendas) vendasReais = op.metaVendas; 
    
    const receitaBruta = vendasReais * op.precoVenda;
    const cmv = vendasReais * f.custoUnid;
    const despesaImpostos = receitaBruta * (op.impostosPct / 100); 
    const despesaComissoes = receitaBruta * (op.comissaoPct / 100); 
    
    const lucroLiquido = receitaBruta - cmv - despesaImpostos - despesaComissoes - despesasFixasTotais;
    
    let fluxoCaixaMes = receitaBruta - despesasFixasTotais - despesaImpostos - despesaComissoes - totalMarketing;
    if (f.prazoPagamento === 0) fluxoCaixaMes -= cmv; 
    const novoCaixa = caixa + fluxoCaixaMes;

    if (novoCaixa < 0) {
      return mostrarToast('FALÊNCIA! O caixa zerou. Faltou Capital de Giro.', 'erro');
    }

    setCaixa(novoCaixa);
    setClientes(clientes + Math.floor(vendasReais * 0.1)); 
    setQualidade(novaQualidade);
    setSatisfacao(novaSatisfacao);
    
    setHistoricoDRE([...historicoDRE, { 
      mes: `Mês ${mesAtual}`, receita: receitaBruta, lucro: lucroLiquido, caixa: novoCaixa, breakEven: pontoEquilibrioQtde * op.precoVenda 
    }]);
    
    setMesAtual(mesAtual + 1);

    const probProblema = (100 - novaQualidade) / 100;
    if (Math.random() < probProblema || vendasReais > 1000) {
      const novosChamados = [...chamadosSAC.filter(c => !c.resolvido), { id: Date.now(), tipo: 'Reclamação', desc: 'A qualidade do produto caiu e a entrega atrasou.', resolvido: false }];
      setChamadosSAC(novosChamados);
    } else {
      setChamadosSAC(chamadosSAC.filter(c => !c.resolvido));
    }

    if (typeof registrarFatoGerador === 'function') {
      registrarFatoGerador(`Vendas do Mês ${mesAtual}`, receitaBruta, 'Gestão', ['1.1.1.02'], ['3.1.1.01']);
      registrarFatoGerador(`Impostos s/ Vendas (Mês ${mesAtual})`, despesaImpostos, 'Gestão', ['4.1.1.02'], ['2.1.1.01']);
      registrarFatoGerador(`Comissões/Taxas de App (Mês ${mesAtual})`, despesaComissoes, 'Gestão', ['4.1.2.04'], ['1.1.1.02']);
      registrarFatoGerador(`CMV e MKT (Mês ${mesAtual})`, cmv + totalMarketing, 'Gestão', ['4.1.1.01', '4.1.2.03'], f.prazoPagamento === 0 ? ['1.1.1.02'] : ['2.1.1.02', '1.1.1.02']);
    }

    mostrarToast(`Mês fechado! Vendas: ${vendasReais} unid | Lucro Líquido: R$ ${lucroLiquido.toFixed(2)}`, lucroLiquido > 0 ? 'sucesso' : 'aviso');
  };

  const resolverSAC = (id, custo) => {
    if (caixa < custo) return mostrarToast('Caixa insuficiente para cobrir estorno/brinde.', 'erro');
    setCaixa(caixa - custo);
    setChamadosSAC(chamadosSAC.map(c => c.id === id ? { ...c, resolvido: true } : c));
    if (typeof registrarFatoGerador === 'function') {
      registrarFatoGerador(`Despesa com Reembolso/SAC`, custo, 'Gestão', ['4.1.2.09'], ['1.1.1.02']);
    }
    mostrarToast('Problema resolvido! Isso protegerá o NPS da empresa.', 'sucesso');
  };

  // ==========================================
  // TELA DE ESCOLHA DE CENÁRIO
  // ==========================================
  if (!cenarioAtivo) {
    return (
      <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', minHeight: '80vh', display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px', boxSizing: 'border-box' }}>
          <span style={{ fontSize: '48px' }}>🏢</span>
          <h2 style={{ color: '#0f172a', margin: '10px 0 5px 0', fontSize: '22px', wordBreak: 'break-word' }}>Consultoria & Gestão (Business Game)</h2>
          <p style={{ color: '#64748b', fontSize: '13.5px', wordBreak: 'break-word' }}>Escolha uma empresa real, desenhe o plano de negócios e gerencie até o lucro.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
          {cenarios.map(c => (
            <div key={c.id} onClick={() => selecionarCenario(c)} style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #cbd5e1', cursor: 'pointer', transition: 'all 0.3s', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', boxSizing: 'border-box', minWidth: 0 }}
                 onMouseOver={e => e.currentTarget.style.borderColor = '#2563eb'} onMouseOut={e => e.currentTarget.style.borderColor = '#cbd5e1'}>
              <span style={{ backgroundColor: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{c.tipo}</span>
              <h3 style={{ color: '#0f172a', margin: '10px 0', fontSize: '17px', wordBreak: 'break-word' }}>{c.nome}</h3>
              <p style={{ color: '#475569', fontSize: '13.5px', lineHeight: '1.5', wordBreak: 'break-word' }}><strong>Desafio:</strong> {c.desafio}</p>
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', fontSize: '13px', flexWrap: 'wrap', gap: '6px', boxSizing: 'border-box' }}>
                <span style={{ color: '#64748b' }}>Caixa: <strong style={{color: '#10b981'}}>R$ {c.caixaInicial.toLocaleString('pt-BR')}</strong></span>
                <span style={{ color: '#64748b' }}>Custo Fixo: <strong style={{color: '#ef4444'}}>R$ {c.custoFixo.toLocaleString('pt-BR')}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ==========================================
  // WAR ROOM (MESA DE COMANDO)
  // ==========================================
  const qtdSAC = chamadosSAC.filter(c => !c.resolvido).length;

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#f1f5f9', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.4s', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* HEADER DE KPIs */}
      <div style={{ backgroundColor: '#0f172a', padding: '20px 24px', borderRadius: '16px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', position: 'sticky', top: '10px', zIndex: 10, boxShadow: '0 10px 25px rgba(0,0,0,0.2)', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ minWidth: 0, flex: '1 1 200px' }}>
          <button onClick={() => setCenarioAtivo(null)} style={{ background: 'none', border: 'none', color: '#93c5fd', cursor: 'pointer', fontSize: '12px', padding: 0, marginBottom: '4px' }}>← Trocar Empresa</button>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '900', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', wordBreak: 'break-word' }}>
            CEO: {cenarioAtivo.nome} <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'normal' }}>| Mês {mesAtual}</span>
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <div style={kpiBox('#1e293b', caixa > 0 ? '#10b981' : '#ef4444')}>
            <span style={kpiLbl}>CAIXA (LIVRE)</span>
            <span style={kpiVal}>R$ {caixa.toLocaleString('pt-BR', {minimumFractionDigits: 0})}</span>
          </div>
          <div style={kpiBox('#1e293b', satisfacao > 70 ? '#f59e0b' : '#ef4444')}>
            <span style={kpiLbl}>NPS / SATISFAÇÃO</span>
            <span style={kpiVal}>⭐ {satisfacao}%</span>
          </div>
          <button onClick={executarMes} style={{ backgroundColor: '#10b981', color: 'white', padding: '12px 20px', borderRadius: '8px', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '14px', boxShadow: '0 4px 0 #047857', transition: 'all 0.1s', boxSizing: 'border-box' }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(4px)'; e.currentTarget.style.boxShadow = '0 0 0 #047857'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 0 #047857'; }}>
            ⏩ Fechar Mês {mesAtual}
          </button>
        </div>
      </div>

      {/* MENUS DAS ABAS (Grelha Flexível Inteligente) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))', gap: '8px', backgroundColor: '#e2e8f0', padding: '6px', borderRadius: '14px', boxSizing: 'border-box' }}>
        <TabBtn id="estrategico" label="🎯 Estratégia" ativo={abaAtiva} set={setAbaAtiva} />
        <TabBtn id="marketing" label="📣 Marketing" ativo={abaAtiva} set={setAbaAtiva} />
        <TabBtn id="supply" label="📦 Operações" ativo={abaAtiva} set={setAbaAtiva} />
        <TabBtn id="sac" label={`🎧 SAC (${qtdSAC})`} ativo={abaAtiva} set={setAbaAtiva} cor={qtdSAC > 0 ? '#ef4444' : '#2563eb'} />
        <TabBtn id="dre" label="📊 Resultados" ativo={abaAtiva} set={setAbaAtiva} cor="#8b5cf6" />
      </div>

      {/* ÁREA DE TRABALHO */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #cbd5e1', minHeight: '450px', boxSizing: 'border-box', width: '100%' }}>
        
        {/* ===================================================
            ABA 1: ESTRATÉGICO
            =================================================== */}
        {abaAtiva === 'estrategico' && (
          <div className="fade-in" style={{ boxSizing: 'border-box' }}>
            <h3 style={tituloSecao}>Canvas de Gestão Estratégica</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px', marginBottom: '30px', boxSizing: 'border-box' }}>
              <InputBlock label="Nível Estratégico (Longo Prazo)" val={planos.estrategico} set={(v) => setPlanos({...planos, estrategico: v})} />
              <InputBlock label="Nível Tático (Médio Prazo)" val={planos.tatico} set={(v) => setPlanos({...planos, tatico: v})} />
              <InputBlock label="Nível Operacional (Rotina Diária)" val={planos.operacional} set={(v) => setPlanos({...planos, operacional: v})} />
            </div>
            <h4 style={subTitulo}>Matriz SWOT (F.O.F.A)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', boxSizing: 'border-box' }}>
              <div style={swotBox('#f0fdf4', '#16a34a')}><strong style={{color:'#16a34a', fontSize:'12px', display:'block', marginBottom:'6px'}}>S - Forças (Interna)</strong><textarea style={swotArea} value={swot.forcas} onChange={e => setSwot({...swot, forcas: e.target.value})} placeholder="Descreva..." /></div>
              <div style={swotBox('#fef2f2', '#dc2626')}><strong style={{color:'#dc2626', fontSize:'12px', display:'block', marginBottom:'6px'}}>W - Fraquezas (Interna)</strong><textarea style={swotArea} value={swot.fraquezas} onChange={e => setSwot({...swot, fraquezas: e.target.value})} placeholder="Descreva..." /></div>
              <div style={swotBox('#eff6ff', '#2563eb')}><strong style={{color:'#2563eb', fontSize:'12px', display:'block', marginBottom:'6px'}}>O - Oportunidades (Externa)</strong><textarea style={swotArea} value={swot.oportunidades} onChange={e => setSwot({...swot, oportunidades: e.target.value})} placeholder="Descreva..." /></div>
              <div style={swotBox('#fffbeb', '#d97706')}><strong style={{color:'#d97706', fontSize:'12px', display:'block', marginBottom:'6px'}}>T - Ameaças (Externa)</strong><textarea style={swotArea} value={swot.ameacas} onChange={e => setSwot({...swot, ameacas: e.target.value})} placeholder="Descreva..." /></div>
            </div>
          </div>
        )}

        {/* ===================================================
            ABA 2: MARKETING E 4Ps
            =================================================== */}
        {abaAtiva === 'marketing' && (
          <div className="fade-in" style={{ boxSizing: 'border-box' }}>
            <h3 style={tituloSecao}>Plano de Marketing (Os 4 P's)</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px', marginBottom: '30px', boxSizing: 'border-box' }}>
              <div style={pBox}><strong style={pTitle}>1. Produto</strong><textarea style={pArea} placeholder="Diferencial?" value={marketing.produto} onChange={e => setMarketing({...marketing, produto: e.target.value})} /></div>
              <div style={pBox}><strong style={pTitle}>2. Preço</strong><div style={{fontSize: '13px', color: '#475569', marginTop: '10px'}}>Gerenciado matematicamente na aba Operações.</div></div>
              <div style={pBox}><strong style={pTitle}>3. Praça</strong><textarea style={pArea} placeholder="E-commerce? Loja?" value={marketing.praca} onChange={e => setMarketing({...marketing, praca: e.target.value})} /></div>
              <div style={pBox}><strong style={pTitle}>4. Promoção</strong><textarea style={pArea} placeholder="Como descobrirão?" value={marketing.promocao} onChange={e => setMarketing({...marketing, promocao: e.target.value})} /></div>
            </div>

            <h4 style={subTitulo}>Alocação de Verba de Tráfego (C.A.C)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px', boxSizing: 'border-box' }}>
              <InputValor icon="📱" label="Meta / Insta Ads (R$)" val={marketing.verbaInsta} set={(v) => setMarketing({...marketing, verbaInsta: Number(v)})} />
              <InputValor icon="📰" label="Mídia Offline (R$)" val={marketing.verbaOffline} set={(v) => setMarketing({...marketing, verbaOffline: Number(v)})} />
              <InputValor icon="⭐" label="Influenciadores (R$)" val={marketing.verbaInfluencer} set={(v) => setMarketing({...marketing, verbaInfluencer: Number(v)})} />
              <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxSizing: 'border-box', minWidth: 0 }}>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>ORÇAMENTO DE MARKETING</span>
                <span style={{ fontSize: '20px', fontWeight: '900', wordBreak: 'break-word', marginTop: '4px' }}>R$ {totalMarketing.toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            ABA 3: SUPPLY CHAIN E ENGENHARIA DE PREÇOS
            =================================================== */}
        {abaAtiva === 'supply' && (
          <div className="fade-in" style={{ boxSizing: 'border-box' }}>
            <h3 style={tituloSecao}>Engenharia de Preços e Supply Chain</h3>
            <p style={{ color: '#475569', fontSize: '13.5px', marginBottom: '20px', wordBreak: 'break-word' }}>Escolha o fornecedor e defina os impostos/taxas. Se a Margem de Contribuição ficar negativa, a cada venda você perde dinheiro!</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', marginBottom: '30px', boxSizing: 'border-box' }}>
              {fornecedores.map(f => (
                <div key={f.id} onClick={() => setOp({...op, fornecedorId: f.id})} style={{ padding: '20px', borderRadius: '16px', border: op.fornecedorId === f.id ? '2px solid #2563eb' : '1px solid #cbd5e1', backgroundColor: op.fornecedorId === f.id ? '#eff6ff' : 'white', cursor: 'pointer', transition: '0.2s', boxSizing: 'border-box', minWidth: 0 }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#0f172a', wordBreak: 'break-word' }}>{f.nome}</h4>
                  <div style={linhaForn}><span>Custo Unid (CMV):</span> <strong style={{color: '#ef4444'}}>R$ {f.custoUnid}</strong></div>
                  <div style={linhaForn}><span>Prazo p/ Pagar:</span> <strong style={{color: '#2563eb'}}>{f.prazoPagamento === 0 ? 'À Vista' : `${f.prazoPagamento} dias`}</strong></div>
                  <div style={linhaForn}><span>Qualidade (NPS):</span> <strong style={{color: '#10b981'}}>{f.qualidadeQA}%</strong></div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
              
              {/* Entradas (Inputs de Preço e Taxas) */}
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box', minWidth: 0 }}>
                <div style={{ minWidth: 0 }}>
                  <label style={lbl}>Preço de Venda Final (R$)</label>
                  <input type="number" style={{...inpArea, fontSize: '18px', fontWeight: 'bold', color: '#2563eb'}} value={op.precoVenda} onChange={e => setOp({...op, precoVenda: e.target.value})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
                  <div style={{ minWidth: 0 }}>
                    <label style={lbl}>Impostos (%)</label>
                    <input type="number" style={inpArea} value={op.impostosPct} onChange={e => setOp({...op, impostosPct: e.target.value})} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={lbl}>Comissões/Apps (%)</label>
                    <input type="number" style={inpArea} value={op.comissaoPct} onChange={e => setOp({...op, comissaoPct: e.target.value})} />
                  </div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <label style={lbl}>Meta de Vendas (Unidades no Mês)</label>
                  <input type="number" style={inpArea} value={op.metaVendas} onChange={e => setOp({...op, metaVendas: e.target.value})} />
                </div>
              </div>

              {/* Saídas */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', boxSizing: 'border-box', minWidth: 0 }}>
                <h4 style={{ margin: '0 0 5px 0', color: '#0f172a', wordBreak: 'break-word' }}>Decomposição do Preço (Unitário)</h4>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ color: '#475569' }}>Preço de Venda Bruto (100%):</span>
                  <strong style={{ wordBreak: 'break-word' }}>R$ {Number(op.precoVenda || 0).toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ color: '#ef4444' }}>(-) Custo Fornecedor (CMV):</span>
                  <strong style={{ color: '#ef4444', wordBreak: 'break-word' }}>R$ {custoAtual.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ color: '#ef4444' }}>(-) Impostos ({op.impostosPct}%):</span>
                  <strong style={{ color: '#ef4444', wordBreak: 'break-word' }}>R$ {valorImpostos.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ color: '#ef4444' }}>(-) Comissões/Taxas ({op.comissaoPct}%):</span>
                  <strong style={{ color: '#ef4444', wordBreak: 'break-word' }}>R$ {valorComissao.toFixed(2)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14.5px', padding: '10px 12px', marginTop: '4px', backgroundColor: margemContribuicaoReais > 0 ? '#ecfdf5' : '#fef2f2', borderRadius: '8px', flexWrap: 'wrap', gap: '6px', boxSizing: 'border-box' }}>
                  <span style={{ color: margemContribuicaoReais > 0 ? '#065f46' : '#991b1b', fontWeight: 'bold' }}>= Margem de Contribuição:</span>
                  <strong style={{ color: margemContribuicaoReais > 0 ? '#10b981' : '#ef4444', wordBreak: 'break-word' }}>R$ {margemContribuicaoReais.toFixed(2)} ({margemContribuicaoPct.toFixed(1)}%)</strong>
                </div>

                <div style={{...indBox('#f8fafc', '#94a3b8'), marginTop: '8px', boxSizing: 'border-box' }}>
                  <span>Custo Fixo + Marketing / Mês:</span>
                  <strong style={{wordBreak: 'break-word'}}>R$ {despesasFixasTotais.toLocaleString('pt-BR')}</strong>
                </div>
                <div style={{...indBox('#eff6ff', '#2563eb', true), boxSizing: 'border-box' }}>
                  <span>Ponto de Equilíbrio (Break-Even):</span>
                  <div style={{textAlign: 'right', wordBreak: 'break-word'}}>
                    <strong>{pontoEquilibrioQtde} unidades</strong> <br/>
                    <span style={{fontSize:'11px', fontWeight:'normal'}}>Mínimo p/ cobrir custos.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===================================================
            ABA 4: SAC
            =================================================== */}
        {abaAtiva === 'sac' && (
          <div className="fade-in" style={{ boxSizing: 'border-box' }}>
            <h3 style={tituloSecao}>SAC e Experiência do Cliente</h3>
            <p style={{ color: '#475569', fontSize: '13.5px', marginBottom: '20px', wordBreak: 'break-word' }}>Resolver problemas custa caixa, mas protege o seu NPS. Clientes insatisfeitos derrubam suas vendas no próximo mês.</p>
            {qtdSAC === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#ecfdf5', borderRadius: '16px', border: '1px dashed #10b981', color: '#065f46', boxSizing: 'border-box' }}>
                <span style={{ fontSize: '40px' }}>🎉</span>
                <h4 style={{ margin: '10px 0 4px 0', wordBreak: 'break-word' }}>Nenhum chamado aberto!</h4>
                <p style={{ margin: 0, wordBreak: 'break-word' }}>A qualidade do seu fornecedor e sua operação estão alinhadas.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', boxSizing: 'border-box' }}>
                {chamadosSAC.filter(c => !c.resolvido).map(c => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fef2f2', padding: '16px 20px', borderRadius: '12px', border: '1px solid #fecaca', flexWrap: 'wrap', gap: '15px', boxSizing: 'border-box' }}>
                    <div style={{ minWidth: 0, flex: '1 1 250px' }}>
                      <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '3px 8px', borderRadius: '6px', fontSize: '10.5px', fontWeight: 'bold' }}>TICKET #{c.id.toString().slice(-4)} • {c.tipo}</span>
                      <p style={{ margin: '8px 0 0 0', color: '#7f1d1d', fontWeight: 'bold', fontSize: '13.5px', wordBreak: 'break-word' }}>"{c.desc}"</p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
                      <button onClick={() => resolverSAC(c.id, 150)} style={btnAcao('#10b981')}>Estorno Rápido (R$ 150)</button>
                      <button onClick={() => resolverSAC(c.id, 50)} style={btnAcao('#f59e0b')}>Enviar Brinde (R$ 50)</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ===================================================
            ABA 5: DASHBOARD DRE & CAIXA
            =================================================== */}
        {abaAtiva === 'dre' && (
          <div className="fade-in" style={{ boxSizing: 'border-box' }}>
            <h3 style={tituloSecao}>Resultados Consolidados (DRE) e Fluxo de Caixa</h3>
            {historicoDRE.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '50px', color: '#64748b' }}>
                <span style={{ fontSize: '40px' }}>📈</span><p style={{ wordBreak: 'break-word' }}>Execute o primeiro mês para visualizar os dados.</p>
              </div>
            ) : (
              <div style={{ height: '380px', width: '100%', marginTop: '20px', boxSizing: 'border-box', minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={historicoDRE} margin={{ top: 20, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="mes" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tickFormatter={(v) => `R$${v/1000}k`} stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `R$${v/1000}k`} stroke="#10b981" tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => `R$ ${Number(value || 0).toLocaleString('pt-BR')}`} cursor={{fill: '#f1f5f9'}} contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                    
                    <Bar yAxisId="left" dataKey="receita" name="Receita Bruta" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="left" dataKey="lucro" name="Lucro Líquido" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    <Line yAxisId="right" type="monotone" dataKey="caixa" name="Saldo em Caixa" stroke="#10b981" strokeWidth={3} dot={{r:4}} />
                    
                    <ReferenceLine yAxisId="left" y={historicoDRE[historicoDRE.length - 1].breakEven} stroke="#ef4444" strokeDasharray="3 3" label={{ position: 'top', value: 'Break-Even', fill: '#ef4444', fontSize: 11 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } } .fade-in { animation: fadeIn 0.3s ease-out; }`}</style>
    </div>
  );
}

// ==========================================
// COMPONENTES MENORES E ESTILOS
// ==========================================
const TabBtn = ({ id, label, ativo, set, cor = '#2563eb' }) => {
  const isAt = ativo === id;
  return (
    <button onClick={() => set(id)} style={{ padding: '10px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', border: 'none', whiteSpace: 'nowrap', backgroundColor: isAt ? cor : '#ffffff', color: isAt ? 'white' : '#334155', transition: 'all 0.2s', boxShadow: isAt ? `0 4px 10px ${cor}40` : 'none', boxSizing: 'border-box' }}>
      {label}
    </button>
  );
};

const kpiBox = (bg, cor) => ({ backgroundColor: bg, padding: '10px 14px', borderRadius: '10px', borderLeft: `4px solid ${cor}`, display: 'flex', flexDirection: 'column', boxSizing: 'border-box', minWidth: 0 });
const kpiLbl = { fontSize: '10px', color: '#94a3b8', fontWeight: 'bold', letterSpacing: '0.5px' };
const kpiVal = { fontSize: '16px', color: 'white', fontWeight: '900', marginTop: '2px', wordBreak: 'break-word' };

const InputBlock = ({ label, val, set }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', boxSizing: 'border-box', minWidth: 0 }}>
    <label style={lbl}>{label}</label>
    <textarea style={{...inpArea, minHeight: '70px', resize: 'vertical'}} value={val} onChange={e => set(e.target.value)} />
  </div>
);

const InputValor = ({ icon, label, val, set }) => (
  <div style={{ flex: '1 1 min(100%, 180px)', backgroundColor: '#f8fafc', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', boxSizing: 'border-box', minWidth: 0 }}>
    <label style={{...lbl, fontSize: '11.5px'}}>{icon} {label}</label>
    <input type="number" style={{...inpArea, fontWeight: 'bold'}} value={val} onChange={e => set(e.target.value)} />
  </div>
);

const btnAcao = (bg) => ({ backgroundColor: bg, color: 'white', padding: '8px 14px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', transition: '0.2s', boxSizing: 'border-box' });

const tituloSecao = { margin: '0 0 16px 0', color: '#0f172a', fontSize: '19px', wordBreak: 'break-word' };
const subTitulo = { color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '14px', marginTop: '20px', wordBreak: 'break-word', fontSize: '15px' };
const lbl = { fontSize: '12.5px', fontWeight: 'bold', color: '#475569', wordBreak: 'break-word' };
const inpArea = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '13.5px', fontFamily: 'inherit', boxSizing: 'border-box', backgroundColor: 'white' };

const swotBox = (bg, color) => ({ backgroundColor: bg, padding: '14px', borderRadius: '12px', border: `1px solid ${color}40`, boxSizing: 'border-box', minWidth: 0 });
const swotArea = { width: '100%', maxWidth: '100%', minHeight: '70px', background: 'transparent', border: 'none', outline: 'none', resize: 'none', fontSize: '13px', color: '#334155', marginTop: '4px', fontWeight: '500', boxSizing: 'border-box' };

const pBox = { backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', boxSizing: 'border-box', minWidth: '0' };
const pTitle = { color: '#0f172a', display: 'block', marginBottom: '8px', fontSize: '14.5px', wordBreak: 'break-word' };
const pArea = { width: '100%', maxWidth: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', minHeight: '60px', fontSize: '13px', color: '#475569', boxSizing: 'border-box' };

const linhaForn = { display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px', color: '#475569', flexWrap: 'wrap', gap: '4px' };
const indBox = (bg, color, isDestaque = false) => ({ backgroundColor: bg, padding: '14px 16px', borderRadius: '10px', borderLeft: `4px solid ${color}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: isDestaque ? '15px' : '13px', color: '#0f172a', flexWrap: 'wrap', gap: '8px', boxSizing: 'border-box' });