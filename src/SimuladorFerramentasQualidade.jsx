import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, ReferenceLine, Legend, LabelList, Cell
} from 'recharts';

export default function SimuladorFerramentasQualidade({ mostrarToast }) {
  // ==========================================
  // ESTADO GLOBAL: BACKLOG DE PROBLEMAS
  // ==========================================
  const [problemas, setProblemas] = useState([
    { id: 1, titulo: 'Atraso Crônico no Fechamento Contábil', area: 'Contabilidade / Controladoria', desc: 'O "Fast Close" não funciona. A equipe leva em média 12 dias úteis para fechar a DRE e o Balanço, impactando a tomada de decisão da diretoria.', resolvido: false },
    { id: 2, titulo: 'Multas Fiscais (Autuação SPED)', area: 'Fiscal / Tributário', desc: 'A Receita Federal cruzou as notas fiscais emitidas com o SPED EFD-Contribuições e autuou a empresa em R$ 45.000,00 por divergências nos últimos 6 meses.', resolvido: false },
    { id: 3, titulo: 'Inadimplência de Clientes > 18%', area: 'Financeiro / Tesouraria', desc: 'O índice de inadimplência saltou de 5% para 18% no último trimestre. A empresa está recorrendo ao cheque especial para cobrir a Folha de Pagamento.', resolvido: false },
    { id: 4, titulo: 'Erros na Rescisão e Reclamação Trabalhista', area: 'Departamento Pessoal', desc: 'Nos últimos 3 meses, 4 ex-funcionários acionaram a Justiça do Trabalho alegando erros no cálculo das verbas rescisórias (TRCT) e falta de recolhimento de FGTS.', resolvido: false },
    { id: 5, titulo: 'Divergência Crítica de Estoque (Físico vs Contábil)', area: 'Auditoria Interna', desc: 'A auditoria anual revelou que o saldo do estoque na contabilidade (Balanço) é 30% maior que o estoque físico real no galpão logístico.', resolvido: false }
  ]);

  const [problemaAtivo, setProblemaAtivo] = useState(null);
  const [ferramentaAtiva, setFerramentaAtiva] = useState('folha');

  // Estados para Adicionar Novo Problema
  const [isAdicionando, setIsAdicionando] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novaArea, setNovaArea] = useState('Contabilidade');
  const [novaDesc, setNovaDesc] = useState('');

  // ==========================================
  // ESTADOS E DADOS DAS FERRAMENTAS DA QUALIDADE
  // ==========================================
  const [dadosCheckSheet, setDadosCheckSheet] = useState([
    { id: 1, falha: 'Falta de Documento Base (NF/Recibo)', contagem: 65 },
    { id: 2, falha: 'Erro Humano (Digitação D/C)', contagem: 110 },
    { id: 3, falha: 'Sistema/ERP Lento ou Travando', contagem: 15 },
    { id: 4, falha: 'Aprovação Atrasada dos Gestores', contagem: 40 },
    { id: 5, falha: 'Integração Bancária (OFX) Falha', contagem: 20 },
  ]);
  const [novaFalha, setNovaFalha] = useState('');

  const dadosHistograma = [
    { range: '1-3 dias', freq: 5 }, { range: '4-6 dias', freq: 12 }, 
    { range: '7-9 dias', freq: 45 }, { range: '10-12 dias', freq: 80 }, 
    { range: '13-15 dias', freq: 25 }, { range: '16+ dias', freq: 5 }
  ];

  const [ishikawa, setIshikawa] = useState({ metodo: '', maoDeObra: '', maquina: '', meioAmbiente: '', medida: '', material: '' });

  const [dispersaoDados, setDispersaoDados] = useState([
    { x: 10, y: 15 }, { x: 20, y: 35 }, { x: 30, y: 45 }, { x: 40, y: 60 }, { x: 50, y: 80 }, { x: 60, y: 95 }
  ]);
  const [novoPontoDisp, setNovoPontoDisp] = useState({ x: '', y: '' });

  const [cepDados, setCepDados] = useState([10, 11, 9, 12, 11, 28, 10, 9, 11, 10]); 
  const [novaMedicaoCep, setNovaMedicaoCep] = useState('');

  const [planoAcao, setPlanoAcao] = useState([]);
  const [novoPlano, setNovoPlano] = useState({ what: '', why: '', who: '', when: '', how: '', howMuch: '' });

  // ==========================================
  // MOTORES MATEMÁTICOS DOS GRÁFICOS
  // ==========================================
  const paretoData = useMemo(() => {
    const ordenado = [...dadosCheckSheet].sort((a, b) => b.contagem - a.contagem);
    const total = ordenado.reduce((acc, curr) => acc + curr.contagem, 0);
    let acumulado = 0;
    
    return ordenado.map(item => {
      acumulado += item.contagem;
      return {
        falha: item.falha.substring(0, 15) + '...', 
        nomeCompleto: item.falha,
        Qtd: item.contagem,
        Acumulado: total > 0 ? Number(((acumulado / total) * 100).toFixed(1)) : 0
      };
    });
  }, [dadosCheckSheet]);

  const cepDataFull = useMemo(() => {
    if (cepDados.length === 0) return [];
    const media = cepDados.reduce((a, b) => a + b, 0) / cepDados.length;
    const variancia = cepDados.reduce((a, b) => a + Math.pow(b - media, 2), 0) / (cepDados.length || 1);
    const dp = Math.sqrt(variancia);
    const lsc = media + (3 * dp);
    const lic = Math.max(0, media - (3 * dp));

    return cepDados.map((val, idx) => ({
      dia: `T-${idx + 1}`,
      Valor: val,
      Media: Number(media.toFixed(1)),
      LSC: Number(lsc.toFixed(1)),
      LIC: Number(lic.toFixed(1)),
      CausaEspecial: val > lsc || val < lic ? val : null 
    }));
  }, [cepDados]);

  const adicionarProblema = (e) => {
    e.preventDefault();
    if (!novoTitulo || !novaDesc) return;
    setProblemas([{ id: Date.now(), titulo: novoTitulo, area: novaArea, desc: novaDesc, resolvido: false }, ...problemas]);
    setNovoTitulo(''); setNovaDesc('');
    setIsAdicionando(false);
    if (typeof mostrarToast === 'function') mostrarToast('Ocorrência inserida no Backlog!', 'sucesso');
  };

  const selecionarProblema = (prob) => {
    setProblemaAtivo(prob);
    setFerramentaAtiva('folha'); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resolverProblema = () => {
    setProblemas(problemas.map(p => p.id === problemaAtivo.id ? { ...p, resolvido: true } : p));
    if (typeof mostrarToast === 'function') mostrarToast('Plano de ação aprovado! Ocorrência baixada.', 'sucesso');
    setProblemaAtivo(null);
  };

  const alterarContagemFolha = (id, delta) => {
    setDadosCheckSheet(prev => prev.map(item => item.id === id ? { ...item, contagem: Math.max(0, item.contagem + delta) } : item));
  };
  const inserirFalhaFolha = () => {
    if (!novaFalha) return;
    setDadosCheckSheet([...dadosCheckSheet, { id: Date.now(), falha: novaFalha, contagem: 1 }]);
    setNovaFalha('');
    if (typeof mostrarToast === 'function') mostrarToast('Nova categoria registrada. Pareto recalibrado.', 'sucesso');
  };
  const inserirDispersao = () => {
    const vx = Number(novoPontoDisp.x); const vy = Number(novoPontoDisp.y);
    if (isNaN(vx) || isNaN(vy)) return;
    setDispersaoDados([...dispersaoDados, { x: vx, y: vy }]);
    setNovoPontoDisp({ x: '', y: '' });
  };
  const inserirMedicaoCep = () => {
    const val = Number(novaMedicaoCep);
    if (isNaN(val)) return;
    setCepDados([...cepDados, val]);
    setNovaMedicaoCep('');
  };
  const inserirPlano = () => {
    if (!novoPlano.what || !novoPlano.who) return;
    setPlanoAcao([...planoAcao, { ...novoPlano, id: Date.now() }]);
    setNovoPlano({ what: '', why: '', who: '', when: '', how: '', howMuch: '' });
  };

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  // ==========================================
  // TELA 1: BACKLOG DE PROBLEMAS (RAIZ)
  // ==========================================
  if (!problemaAtivo) {
    return (
      <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
        
        {/* CABEÇALHO HERO */}
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '24px', borderRadius: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', boxSizing: 'border-box' }}>
          <span style={{ fontSize: '38px' }}>⚙️</span>
          <div style={{ minWidth: 0, flex: '1 1 250px' }}>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', wordBreak: 'break-word' }}>Engenharia da Qualidade (TQM)</h2>
            <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '13.5px', wordBreak: 'break-word' }}>As 7 ferramentas estatísticas para diagnóstico e auditoria de processos empresariais.</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '20px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '16px', wordBreak: 'break-word' }}>📋 Backlog de Auditoria (Casos Críticos)</h3>
            <button onClick={() => setIsAdicionando(!isAdicionando)} style={btnStyle(isAdicionando ? '#ef4444' : '#2563eb')}>
              {isAdicionando ? '✖ Cancelar' : '➕ Novo Chamado'}
            </button>
          </div>

          {/* FORM NOVO CHAMADO */}
          {isAdicionando && (
            <form onSubmit={adicionarProblema} style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px dashed #94a3b8', marginBottom: '20px', animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '16px', marginBottom: '14px', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0 }}>
                  <label style={labelStyle}>Sintoma Principal (O Problema)</label>
                  <input type="text" value={novoTitulo} onChange={e => setNovoTitulo(e.target.value)} placeholder="Ex: Multa trabalhista por erro no DP..." style={inputStyle} required />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label style={labelStyle}>Setor Responsável</label>
                  <select value={novaArea} onChange={e => setNovaArea(e.target.value)} style={{ ...inputStyle, backgroundColor: 'white' }}>
                    <option>Contabilidade / Controladoria</option><option>Fiscal / Tributário</option><option>Financeiro / Tesouraria</option><option>Departamento Pessoal</option><option>Auditoria Interna</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '14px', minWidth: '0' }}>
                <label style={labelStyle}>Descrição do Impacto (Por que isso é um problema?)</label>
                <textarea value={novaDesc} onChange={e => setNovaDesc(e.target.value)} placeholder="Detalhe o prejuízo financeiro ou operacional..." style={{ ...inputStyle, minHeight: '80px', resize: 'vertical' }} required />
              </div>
              <button type="submit" style={{ ...btnStyle('#10b981'), width: '100%', boxSizing: 'border-box', maxWidth: '240px' }}>Salvar Ocorrência no Backlog</button>
            </form>
          )}

          {/* GRID DE CARDS DE PROBLEMAS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
            {problemas.map(prob => (
              <div key={prob.id} style={{ border: `1px solid ${prob.resolvido ? '#10b981' : '#cbd5e1'}`, borderRadius: '16px', padding: '20px', backgroundColor: prob.resolvido ? '#ecfdf5' : '#ffffff', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s', boxSizing: 'border-box', minWidth: 0 }}
                   onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.06)'}
                   onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
                
                <span style={{ alignSelf: 'flex-start', backgroundColor: prob.resolvido ? '#10b981' : '#e2e8f0', color: prob.resolvido ? 'white' : '#475569', fontSize: '10.5px', padding: '3px 8px', borderRadius: '12px', fontWeight: '800', textTransform: 'uppercase', wordBreak: 'break-word' }}>
                  {prob.area}
                </span>
                
                <h4 style={{ margin: '10px 0 6px 0', color: '#0f172a', fontSize: '15.5px', wordBreak: 'break-word' }}>{prob.titulo}</h4>
                <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b', flex: 1, lineHeight: '1.5', wordBreak: 'break-word' }}>{prob.desc}</p>
                
                <button onClick={() => selecionarProblema(prob)} style={{ ...btnStyle(prob.resolvido ? 'transparent' : '#0f172a'), color: prob.resolvido ? '#065f46' : 'white', border: prob.resolvido ? '1px solid #10b981' : 'none', width: '100%', fontSize: '13px', boxSizing: 'border-box' }}>
                  {prob.resolvido ? 'Revisar Solução 🔍' : 'Investigar Causa Raiz 🚀'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TELA 2: WORKSPACE (AS 7 FERRAMENTAS)
  // ==========================================
  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.4s', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* HEADER INVESTIGAÇÃO */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '20px 24px', borderRadius: '16px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', boxSizing: 'border-box' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <button onClick={() => setProblemaAtivo(null)} style={{ background: 'none', border: 'none', color: '#38bdf8', fontWeight: 'bold', cursor: 'pointer', padding: '0 0 6px 0', fontSize: '12.5px' }}>← Voltar ao Backlog</button>
          <h2 style={{ margin: 0, fontSize: '18px', wordBreak: 'break-word' }}>Caso: {problemaAtivo.titulo}</h2>
        </div>
        {!problemaAtivo.resolvido && (
          <button onClick={resolverProblema} style={{...btnStyle('#10b981'), padding: '10px 18px', fontSize: '13px', boxSizing: 'border-box'}}>✅ Assinar Parecer & Aprovar Solução</button>
        )}
      </div>

      {/* TABS DAS 7 FERRAMENTAS */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
        <TabBtn id="fluxograma" label="1. Fluxograma" ativo={ferramentaAtiva} set={setFerramentaAtiva} />
        <TabBtn id="folha" label="2. Verificação" ativo={ferramentaAtiva} set={setFerramentaAtiva} />
        <TabBtn id="histograma" label="3. Histograma" ativo={ferramentaAtiva} set={setFerramentaAtiva} />
        <TabBtn id="pareto" label="4. Pareto (80/20)" ativo={ferramentaAtiva} set={setFerramentaAtiva} />
        <TabBtn id="ishikawa" label="5. Ishikawa" ativo={ferramentaAtiva} set={setFerramentaAtiva} />
        <TabBtn id="dispersao" label="6. Dispersão" ativo={ferramentaAtiva} set={setFerramentaAtiva} />
        <TabBtn id="cep" label="7. CEP" ativo={ferramentaAtiva} set={setFerramentaAtiva} />
        <TabBtn id="5w2h" label="+ Plano 5W2H" ativo={ferramentaAtiva} set={setFerramentaAtiva} cor="#10b981" />
      </div>

      {/* RENDERIZADOR DINÂMICO DA FERRAMENTA SELECIONADA */}
      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', minHeight: '450px', boxSizing: 'border-box' }}>
        
        {/* 1. FLUXOGRAMA */}
        {ferramentaAtiva === 'fluxograma' && (
          <div className="tool-fade" style={{ boxSizing: 'border-box' }}>
            <ToolHeader icone="🔀" titulo="Fluxograma do Processo" desc="Mapeie visualmente a rotina do departamento para entender onde a informação está se perdendo antes de culpar alguém." />
            <div style={{ overflowX: 'auto', padding: '20px 10px', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '700px', flexWrap: 'nowrap' }}>
                <FluxoBox tipo="inicio" texto="Entrada NFs" /> ➔
                <FluxoBox tipo="processo" texto="Validação Fiscal" /> ➔
                <FluxoBox tipo="decisao" texto="Imposto Retido?" /> ➔
                <FluxoBox tipo="processo" texto="Lançamento ERP" /> ➔
                <FluxoBox tipo="decisao" texto="Concilia OFX?" /> ➔
                <FluxoBox tipo="fim" texto="Fechamento" />
              </div>
            </div>
            <div style={{ backgroundColor: '#fffbeb', padding: '14px', borderRadius: '10px', border: '1px solid #fde68a', color: '#b45309', fontSize: '13px', marginTop: '16px', boxSizing: 'border-box', wordBreak: 'break-word' }}>
              <strong>Dica de Auditor:</strong> Geralmente, os atrasos e erros costumam ocorrer nos losangos (Tomadas de Decisão). O processo de verificação é manual ou automático?
            </div>
          </div>
        )}

        {/* 2. FOLHA DE VERIFICAÇÃO */}
        {ferramentaAtiva === 'folha' && (
          <div className="tool-fade" style={{ boxSizing: 'border-box' }}>
            <ToolHeader icone="📋" titulo="Folha de Verificação (Check Sheet)" desc="Registre a frequência com que os erros acontecem no dia a dia. Esses dados vão alimentar o gráfico de Pareto." />
            
            <div style={{ maxWidth: '600px', backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', boxSizing: 'border-box', minWidth: 0 }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
                <input style={{ ...inputStyle, flex: '1 1 200px' }} value={novaFalha} onChange={e => setNovaFalha(e.target.value)} placeholder="Nova categoria (Ex: Faltou comprovante...)" />
                <button onClick={inserirFalhaFolha} style={btnStyle('#2563eb')}>Adicionar</button>
              </div>

              {dadosCheckSheet.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '10px', flexWrap: 'wrap', gap: '8px', boxSizing: 'border-box', minWidth: 0 }}>
                  <span style={{ fontSize: '13.5px', fontWeight: '600', color: '#1e293b', wordBreak: 'break-word', minWidth: 0, flex: '1 1 200px' }}>{item.falha}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                    <button onClick={() => alterarContagemFolha(item.id, -1)} style={btnCirc}>-</button>
                    <span style={{ fontSize: '16px', fontWeight: '900', color: '#2563eb', minWidth: '32px', textAlign: 'center' }}>{item.contagem}</span>
                    <button onClick={() => alterarContagemFolha(item.id, 1)} style={btnCirc}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. HISTOGRAMA */}
        {ferramentaAtiva === 'histograma' && (
          <div className="tool-fade" style={{ boxSizing: 'border-box' }}>
            <ToolHeader icone="📊" titulo="Histograma de Frequência" desc="Qual a variação real do nosso processo? Esta curva mostra onde os eventos mais se concentram ao longo dos dias." />
            
            <div style={{ width: '100%', height: '320px', backgroundColor: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', boxSizing: 'border-box', minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosHistograma} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="range" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }} />
                  <Bar dataKey="freq" name="Ocorrências" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={35}>
                    {dadosHistograma.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.freq === Math.max(...dadosHistograma.map(o => o.freq)) ? '#ef4444' : '#3b82f6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 4. PARETO */}
        {ferramentaAtiva === 'pareto' && (
          <div className="tool-fade" style={{ boxSizing: 'border-box' }}>
            <ToolHeader icone="📉" titulo="Gráfico de Pareto (Vital vs Trivial)" desc="O gráfico cruzou seus dados da Folha de Verificação. Concentre seus recursos nas poucas causas (à esquerda) que somam 80% dos problemas." />
            
            <div style={{ width: '100%', height: '360px', backgroundColor: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', boxSizing: 'border-box', minWidth: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={paretoData} margin={{ top: 20, right: 10, bottom: 20, left: -10 }}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="falha" scale="band" tick={{ fontSize: 10, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 10, fill: '#ef4444', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  
                  <Bar yAxisId="left" dataKey="Qtd" name="Qtd de Erros" fill="#1e293b" radius={[4, 4, 0, 0]} barSize={40}>
                    <LabelList dataKey="Qtd" position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#0f172a' }} />
                  </Bar>
                  
                  <Line yAxisId="right" type="monotone" dataKey="Acumulado" name="% Acumulado" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3, strokeWidth: 2, fill: '#ef4444' }} />
                  <ReferenceLine yAxisId="right" y={80} stroke="#10b981" strokeDasharray="5 5" label={{ position: 'top', value: 'Alvo 80%', fill: '#10b981', fontSize: 11, fontWeight: 'bold' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 5. ISHIKAWA */}
        {ferramentaAtiva === 'ishikawa' && (
          <div className="tool-fade" style={{ boxSizing: 'border-box' }}>
            <ToolHeader icone="🐟" titulo="Ishikawa (Diagnóstico da Causa Raiz)" desc="Por que as falhas que vimos no Pareto acontecem? Preencha os 6 M's para esgotar as hipóteses." />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '16px', boxSizing: 'border-box' }}>
              <IshikawaCard cor="#3b82f6" title="MÉTODO (Processos/Regras)" val={ishikawa.metodo} set={(v) => setIshikawa({...ishikawa, metodo: v})} />
              <IshikawaCard cor="#10b981" title="MÃO DE OBRA (Treinamento)" val={ishikawa.maoDeObra} set={(v) => setIshikawa({...ishikawa, maoDeObra: v})} />
              <IshikawaCard cor="#8b5cf6" title="MÁQUINA (Software ERP/Infra)" val={ishikawa.maquina} set={(v) => setIshikawa({...ishikawa, maquina: v})} />
              <IshikawaCard cor="#f59e0b" title="MEIO AMBIENTE (Cultura/Físico)" val={ishikawa.meioAmbiente} set={(v) => setIshikawa({...ishikawa, meioAmbiente: v})} />
              <IshikawaCard cor="#ef4444" title="MEDIDA (Metas Inatingíveis)" val={ishikawa.medida} set={(v) => setIshikawa({...ishikawa, medida: v})} />
              <IshikawaCard cor="#64748b" title="MATERIAL (Notas Fiscais/OFX)" val={ishikawa.material} set={(v) => setIshikawa({...ishikawa, material: v})} />
            </div>
          </div>
        )}

        {/* 6. DISPERSÃO */}
        {ferramentaAtiva === 'dispersao' && (
          <div className="tool-fade" style={{ boxSizing: 'border-box' }}>
            <ToolHeader icone="✨" titulo="Diagrama de Dispersão" desc="Existe relação entre duas variáveis? (Ex: X = Volume de NFs no dia | Y = Tempo gasto). Adicione pontos e veja a tendência." />
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', boxSizing: 'border-box', minWidth: 0 }}>
                <label style={labelStyle}>Variável X (Causa?)</label>
                <input type="number" style={{...inputStyle, marginBottom: '10px'}} value={novoPontoDisp.x} onChange={e => setNovoPontoDisp({...novoPontoDisp, x: e.target.value})} placeholder="Ex: 10" />
                <label style={labelStyle}>Variável Y (Efeito?)</label>
                <input type="number" style={{...inputStyle, marginBottom: '14px'}} value={novoPontoDisp.y} onChange={e => setNovoPontoDisp({...novoPontoDisp, y: e.target.value})} placeholder="Ex: 15" />
                <button onClick={inserirDispersao} style={{...btnStyle('#3b82f6'), width: '100%', boxSizing: 'border-box' }}>Adicionar Coordenada</button>
              </div>

              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', height: '320px', boxSizing: 'border-box', minWidth: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" dataKey="x" name="Eixo X" tick={{ fontSize: 10 }} />
                    <YAxis type="number" dataKey="y" name="Eixo Y" tick={{ fontSize: 10 }} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    <Scatter name="Ocorrências" data={dispersaoDados} fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* 7. CEP - CARTAS DE CONTROLE */}
        {ferramentaAtiva === 'cep' && (
          <div className="tool-fade" style={{ boxSizing: 'border-box' }}>
             <ToolHeader icone="📈" titulo="Controle Estatístico de Processo (CEP)" desc="A média histórica é verde. O desvio padrão cria faixas de perigo. Se algo sair da faixa vermelha, não culpe a equipe, pare o processo." />
             
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
                <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', boxSizing: 'border-box', minWidth: 0 }}>
                  <label style={labelStyle}>Nova Medição (Ex: Dias de Atraso)</label>
                  <input type="number" style={{...inputStyle, marginBottom: '14px'}} value={novaMedicaoCep} onChange={e => setNovaMedicaoCep(e.target.value)} />
                  <button onClick={inserirMedicaoCep} style={{...btnStyle('#8b5cf6'), width: '100%', boxSizing: 'border-box' }}>Analisar Amostra</button>
                  
                  <div style={{ marginTop: '20px', padding: '14px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
                    <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '12px' }}>🔴 LSC (Limite Superior)</div>
                    <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '12px', margin: '6px 0' }}>🟢 MÉDIA DO PROCESSO</div>
                    <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '12px' }}>🟡 LIC (Limite Inferior)</div>
                  </div>
                </div>

                <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', height: '320px', boxSizing: 'border-box', minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={cepDataFull} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="dia" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      
                      <Line type="step" dataKey="LSC" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      <Line type="step" dataKey="Media" stroke="#10b981" strokeWidth={2} dot={false} />
                      <Line type="step" dataKey="LIC" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      
                      <Line type="monotone" dataKey="Valor" name="Processo" stroke="#1e293b" strokeWidth={2} dot={{ r: 3 }} />
                      <Scatter dataKey="CausaEspecial" name="⚠️ Alerta" fill="#ef4444" shape="star" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>
        )}

        {/* 8. PLANO 5W2H */}
        {ferramentaAtiva === '5w2h' && (
          <div className="tool-fade" style={{ boxSizing: 'border-box' }}>
             <ToolHeader icone="🎯" titulo="Plano de Ação 5W2H" desc="Converta as causas raízes em ações definitivas. O que não tem dono nem prazo, nunca é executado." />
             
             <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', backgroundColor: 'white', boxSizing: 'border-box' }}>
                <table style={{ width: '100%', minWidth: '750px', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', color: 'white', textAlign: 'left', fontSize: '11.5px', textTransform: 'uppercase' }}>
                      <th style={tH}>O Que? (What)</th><th style={tH}>Por Quê? (Why)</th><th style={tH}>Quem? (Who)</th><th style={tH}>Quando? (When)</th><th style={tH}>Como? (How)</th><th style={tH}>Custo? (How Much)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planoAcao.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '13px' }}>
                        <td style={tD}><strong style={{ wordBreak: 'break-word' }}>{p.what}</strong></td>
                        <td style={{ ...tD, wordBreak: 'break-word' }}>{p.why}</td>
                        <td style={{ ...tD, wordBreak: 'break-word' }}>{p.who}</td>
                        <td style={{ ...tD, whiteSpace: 'nowrap' }}>{p.when}</td>
                        <td style={{ ...tD, wordBreak: 'break-word' }}>{p.how}</td>
                        <td style={{ ...tD, whiteSpace: 'nowrap' }}>{p.howMuch}</td>
                      </tr>
                    ))}
                    {!problemaAtivo.resolvido && (
                      <tr style={{ backgroundColor: '#f8fafc' }}>
                        <td style={tD}><input style={inpMini} placeholder="Implantar..." value={novoPlano.what} onChange={e => setNovoPlano({...novoPlano, what: e.target.value})} /></td>
                        <td style={tD}><input style={inpMini} placeholder="Evitar erro" value={novoPlano.why} onChange={e => setNovoPlano({...novoPlano, why: e.target.value})} /></td>
                        <td style={tD}><input style={inpMini} placeholder="Resp." value={novoPlano.who} onChange={e => setNovoPlano({...novoPlano, who: e.target.value})} /></td>
                        <td style={tD}><input style={inpMini} type="date" value={novoPlano.when} onChange={e => setNovoPlano({...novoPlano, when: e.target.value})} /></td>
                        <td style={tD}><input style={inpMini} placeholder="Com OFX" value={novoPlano.how} onChange={e => setNovoPlano({...novoPlano, how: e.target.value})} /></td>
                        <td style={tD}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <input style={inpMini} placeholder="R$ 1500" value={novoPlano.howMuch} onChange={e => setNovoPlano({...novoPlano, howMuch: e.target.value})} />
                            <button onClick={inserirPlano} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', padding: '0 10px', flexShrink: 0 }}>+</button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
             </div>
          </div>
        )}

      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .tool-fade { animation: fadeIn 0.4s ease-out; }
      `}</style>
    </div>
  );
}

// ==========================================
// COMPONENTES DE UI & ESTILOS REUSÁVEIS
// ==========================================
const ToolHeader = ({ icone, titulo, desc }) => (
  <div style={{ marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px', boxSizing: 'border-box' }}>
    <h3 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
      <span>{icone}</span> {titulo}
    </h3>
    <p style={{ margin: 0, color: '#64748b', fontSize: '13.5px', lineHeight: '1.5', wordBreak: 'break-word' }}>{desc}</p>
  </div>
);

const TabBtn = ({ id, label, ativo, set, cor = '#2563eb' }) => {
  const isAt = ativo === id;
  return (
    <button onClick={() => set(id)} style={{
      padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', border: 'none', whiteSpace: 'nowrap', flexShrink: 0,
      backgroundColor: isAt ? cor : 'transparent', color: isAt ? 'white' : '#64748b', transition: 'all 0.2s',
      boxShadow: isAt ? `0 4px 10px ${cor}40` : 'none'
    }}>
      {label}
    </button>
  );
};

const FluxoBox = ({ tipo, texto }) => {
  const cores = { inicio: '#10b981', processo: '#3b82f6', decisao: '#f59e0b', fim: '#ef4444' };
  const borderRad = tipo === 'inicio' || tipo === 'fim' ? '16px' : (tipo === 'decisao' ? '0px' : '6px');
  const transform = tipo === 'decisao' ? 'rotate(45deg)' : 'none';
  const textTransform = tipo === 'decisao' ? 'rotate(-45deg)' : 'none';
  return (
    <div style={{ backgroundColor: cores[tipo], color: 'white', padding: tipo === 'decisao' ? '16px' : '12px', borderRadius: borderRad, transform, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '90px', textAlign: 'center', fontSize: '11.5px', fontWeight: 'bold', flexShrink: 0, boxSizing: 'border-box' }}>
      <span style={{ transform: textTransform, wordBreak: 'break-word' }}>{texto}</span>
    </div>
  );
};

const IshikawaCard = ({ cor, title, val, set }) => (
  <div style={{ backgroundColor: 'white', border: `1px solid ${cor}50`, borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', minWidth: 0 }}>
    <div style={{ backgroundColor: cor, color: 'white', padding: '10px 14px', fontSize: '11.5px', fontWeight: '900', wordBreak: 'break-word' }}>{title}</div>
    <textarea value={val} onChange={(e) => set(e.target.value)} placeholder="Liste os problemas..."
      style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', minHeight: '90px', padding: '12px', border: 'none', fontSize: '13px', resize: 'vertical', outline: 'none', color: '#1e293b', backgroundColor: '#f8fafc' }} />
  </div>
);

const btnStyle = (bg) => ({ backgroundColor: bg, color: 'white', padding: '10px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px', boxSizing: 'border-box' });
const lblSty = { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px', wordBreak: 'break-word' };
const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
const btnCirc = { width: '28px', height: '28px', borderRadius: '14px', border: 'none', backgroundColor: '#e2e8f0', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
const tH = { padding: '12px 10px', borderBottom: '2px solid #334155' };
const tD = { padding: '10px', verticalAlign: 'middle', borderRight: '1px solid #e2e8f0' };
const inpMini = { width: '100%', maxWidth: '100%', padding: '8px 10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12.5px', outline: 'none', backgroundColor: '#f8fafc' };