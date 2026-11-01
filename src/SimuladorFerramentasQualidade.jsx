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

  // Estados para Adicionar Novo Problema (AQUI ESTÁ A CORREÇÃO! 👇)
  const [isAdicionando, setIsAdicionando] = useState(false);
  const [novoTitulo, setNovoTitulo] = useState('');
  const [novaArea, setNovaArea] = useState('Contabilidade');
  const [novaDesc, setNovaDesc] = useState('');

  // ==========================================
  // ESTADOS E DADOS DAS FERRAMENTAS DA QUALIDADE
  // ==========================================
  
  // 1. FOLHA DE VERIFICAÇÃO (Alimenta o Pareto)
  const [dadosCheckSheet, setDadosCheckSheet] = useState([
    { id: 1, falha: 'Falta de Documento Base (NF/Recibo)', contagem: 65 },
    { id: 2, falha: 'Erro Humano (Digitação D/C)', contagem: 110 },
    { id: 3, falha: 'Sistema/ERP Lento ou Travando', contagem: 15 },
    { id: 4, falha: 'Aprovação Atrasada dos Gestores', contagem: 40 },
    { id: 5, falha: 'Integração Bancária (OFX) Falha', contagem: 20 },
  ]);
  const [novaFalha, setNovaFalha] = useState('');

  // 3. HISTOGRAMA (Frequência de Atrasos/Erros)
  const dadosHistograma = [
    { range: '1-3 dias', freq: 5 }, { range: '4-6 dias', freq: 12 }, 
    { range: '7-9 dias', freq: 45 }, { range: '10-12 dias', freq: 80 }, 
    { range: '13-15 dias', freq: 25 }, { range: '16+ dias', freq: 5 }
  ];

  // 4. ISHIKAWA
  const [ishikawa, setIshikawa] = useState({ metodo: '', maoDeObra: '', maquina: '', meioAmbiente: '', medida: '', material: '' });

  // 5. DISPERSÃO (Correlação: x = Cansaço/Horas Extras, y = Qtd Erros)
  const [dispersaoDados, setDispersaoDados] = useState([
    { x: 10, y: 15 }, { x: 20, y: 35 }, { x: 30, y: 45 }, { x: 40, y: 60 }, { x: 50, y: 80 }, { x: 60, y: 95 }
  ]);
  const [novoPontoDisp, setNovoPontoDisp] = useState({ x: '', y: '' });

  // 6. CEP (Controle Estatístico)
  const [cepDados, setCepDados] = useState([10, 11, 9, 12, 11, 28, 10, 9, 11, 10]); // Pico na medição 6
  const [novaMedicaoCep, setNovaMedicaoCep] = useState('');

  // 7. PLANO DE AÇÃO 5W2H
  const [planoAcao, setPlanoAcao] = useState([]);
  const [novoPlano, setNovoPlano] = useState({ what: '', why: '', who: '', when: '', how: '', howMuch: '' });

  // ==========================================
  // MOTORES MATEMÁTICOS DOS GRÁFICOS
  // ==========================================
  
  // A. Pareto (Regra 80/20) - Auto Calcula Porcentagens e Acumulado
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

  // B. Carta de Controle CEP (Limites)
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

  // ==========================================
  // FUNÇÕES DE AÇÃO DO BACKLOG
  // ==========================================
  const adicionarProblema = (e) => {
    e.preventDefault();
    if (!novoTitulo || !novaDesc) return;
    setProblemas([{ id: Date.now(), titulo: novoTitulo, area: novaArea, desc: novaDesc, resolvido: false }, ...problemas]);
    setNovoTitulo(''); setNovaDesc('');
    setIsAdicionando(false);
    mostrarToast('Ocorrência inserida no Backlog!', 'sucesso');
  };

  const selecionarProblema = (prob) => {
    setProblemaAtivo(prob);
    setFerramentaAtiva('folha'); // Reseta para a etapa 1
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resolverProblema = () => {
    setProblemas(problemas.map(p => p.id === problemaAtivo.id ? { ...p, resolvido: true } : p));
    mostrarToast('Plano de ação aprovado! Ocorrência baixada.', 'sucesso');
    setProblemaAtivo(null);
  };

  // ==========================================
  // INTERAÇÃO DO USUÁRIO NAS FERRAMENTAS
  // ==========================================
  const alterarContagemFolha = (id, delta) => {
    setDadosCheckSheet(prev => prev.map(item => item.id === id ? { ...item, contagem: Math.max(0, item.contagem + delta) } : item));
  };
  const inserirFalhaFolha = () => {
    if (!novaFalha) return;
    setDadosCheckSheet([...dadosCheckSheet, { id: Date.now(), falha: novaFalha, contagem: 1 }]);
    setNovaFalha('');
    mostrarToast('Nova categoria registrada. Pareto recalibrado.', 'sucesso');
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

  // ==========================================
  // TELA 1: BACKLOG DE PROBLEMAS (RAIZ)
  // ==========================================
  if (!problemaAtivo) {
    return (
      <div style={{ backgroundColor: '#f1f5f9', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s' }}>
        
        {/* CABEÇALHO HERO */}
        <div style={{ backgroundColor: '#0f172a', padding: '25px', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}>
          <span style={{ fontSize: '42px' }}>⚙️</span>
          <div>
            <h2 style={{ margin: 0, fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: '900' }}>Engenharia da Qualidade (TQM)</h2>
            <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '14.5px' }}>As 7 ferramentas estatísticas para diagnóstico e auditoria de processos empresariais.</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', marginBottom: '25px' }}>
            <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>📋 Backlog de Auditoria (Casos Críticos)</h3>
            <button onClick={() => setIsAdicionando(!isAdicionando)} style={btnStyle(isAdicionando ? '#ef4444' : '#2563eb')}>
              {isAdicionando ? '✖ Cancelar' : '➕ Novo Chamado'}
            </button>
          </div>

          {/* FORM NOVO CHAMADO */}
          {isAdicionando && (
            <form onSubmit={adicionarProblema} style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px dashed #94a3b8', marginBottom: '25px', animation: 'fadeIn 0.3s' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <label style={lblSty}>Sintoma Principal (O Problema)</label>
                  <input type="text" value={novoTitulo} onChange={e => setNovoTitulo(e.target.value)} placeholder="Ex: Multa trabalhista por erro no DP..." style={inpSty} required />
                </div>
                <div>
                  <label style={lblSty}>Setor Responsável</label>
                  <select value={novaArea} onChange={e => setNovaArea(e.target.value)} style={inpSty}>
                    <option>Contabilidade / Controladoria</option><option>Fiscal / Tributário</option><option>Financeiro / Tesouraria</option><option>Departamento Pessoal</option><option>Auditoria Interna</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={lblSty}>Descrição do Impacto (Por que isso é um problema?)</label>
                <textarea value={novaDesc} onChange={e => setNovaDesc(e.target.value)} placeholder="Detalhe o prejuízo financeiro ou operacional..." style={{ ...inpSty, minHeight: '80px', resize: 'vertical' }} required />
              </div>
              <button type="submit" style={btnStyle('#10b981')}>Salvar Ocorrência no Backlog</button>
            </form>
          )}

          {/* GRID DE CARDS DE PROBLEMAS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {problemas.map(prob => (
              <div key={prob.id} style={{ border: `1px solid ${prob.resolvido ? '#10b981' : '#cbd5e1'}`, borderRadius: '10px', padding: '20px', backgroundColor: prob.resolvido ? '#ecfdf5' : '#ffffff', display: 'flex', flexDirection: 'column', transition: 'box-shadow 0.2s' }}
                   onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.06)'}
                   onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
                
                <span style={{ alignSelf: 'flex-start', backgroundColor: prob.resolvido ? '#10b981' : '#e2e8f0', color: prob.resolvido ? 'white' : '#475569', fontSize: '10.5px', padding: '4px 10px', borderRadius: '15px', fontWeight: '800', textTransform: 'uppercase' }}>
                  {prob.area}
                </span>
                
                <h4 style={{ margin: '12px 0 8px 0', color: '#0f172a', fontSize: '16.5px' }}>{prob.titulo}</h4>
                <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b', flex: 1, lineHeight: '1.5' }}>{prob.desc}</p>
                
                <button onClick={() => selecionarProblema(prob)} style={{ ...btnStyle(prob.resolvido ? 'transparent' : '#0f172a'), color: prob.resolvido ? '#065f46' : 'white', border: prob.resolvido ? '1px solid #10b981' : 'none', width: '100%', fontSize: '13.5px' }}>
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.4s' }}>
      
      {/* HEADER INVESTIGAÇÃO */}
      <div style={{ backgroundColor: '#0f172a', padding: '20px 25px', borderRadius: '12px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <button onClick={() => setProblemaAtivo(null)} style={{ background: 'none', border: 'none', color: '#38bdf8', fontWeight: 'bold', cursor: 'pointer', padding: '0 0 8px 0', fontSize: '13px' }}>← Voltar ao Backlog</button>
          <h2 style={{ margin: 0, fontSize: 'clamp(18px, 3vw, 24px)' }}>Caso: {problemaAtivo.titulo}</h2>
        </div>
        {!problemaAtivo.resolvido && (
          <button onClick={resolverProblema} style={{...btnStyle('#10b981'), padding: '10px 20px'}}>✅ Assinar Parecer & Aprovar Solução</button>
        )}
      </div>

      {/* TABS DAS 7 FERRAMENTAS */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '8px', backgroundColor: 'white', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
        <TabBtn id="fluxograma" label="1. Fluxograma" ativo={ferramentaAtiva} set={setFerramentaAtiva} />
        <TabBtn id="folha" label="2. Folha Verificação" ativo={ferramentaAtiva} set={setFerramentaAtiva} />
        <TabBtn id="histograma" label="3. Histograma" ativo={ferramentaAtiva} set={setFerramentaAtiva} />
        <TabBtn id="pareto" label="4. Pareto (80/20)" ativo={ferramentaAtiva} set={setFerramentaAtiva} />
        <TabBtn id="ishikawa" label="5. Ishikawa (6Ms)" ativo={ferramentaAtiva} set={setFerramentaAtiva} />
        <TabBtn id="dispersao" label="6. Dispersão" ativo={ferramentaAtiva} set={setFerramentaAtiva} />
        <TabBtn id="cep" label="7. Controle (CEP)" ativo={ferramentaAtiva} set={setFerramentaAtiva} />
        <TabBtn id="5w2h" label="+ Plano 5W2H" ativo={ferramentaAtiva} set={setFerramentaAtiva} cor="#10b981" />
      </div>

      {/* RENDERIZADOR DINÂMICO DA FERRAMENTA SELECIONADA */}
      <div style={{ backgroundColor: 'white', padding: 'clamp(15px, 3vw, 30px)', borderRadius: '12px', border: '1px solid #cbd5e1', minHeight: '500px' }}>
        
        {/* 1. FLUXOGRAMA */}
        {ferramentaAtiva === 'fluxograma' && (
          <div className="tool-fade">
            <ToolHeader icone="🔀" titulo="Fluxograma do Processo" desc="Mapeie visualmente a rotina do departamento para entender onde a informação está se perdendo antes de culpar alguém." />
            <div style={{ overflowX: 'auto', padding: '30px 10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', minWidth: '800px' }}>
                <FluxoBox tipo="inicio" texto="Entrada de Notas" /> ➔
                <FluxoBox tipo="processo" texto="Validação Fiscal" /> ➔
                <FluxoBox tipo="decisao" texto="Imposto Retido?" /> ➔
                <FluxoBox tipo="processo" texto="Lançamento ERP" /> ➔
                <FluxoBox tipo="decisao" texto="Concilia OFX?" /> ➔
                <FluxoBox tipo="fim" texto="Fechamento Mês" />
              </div>
            </div>
            <div style={{ backgroundColor: '#fffbeb', padding: '15px', borderRadius: '8px', border: '1px solid #fde68a', color: '#b45309', fontSize: '13px', marginTop: '20px' }}>
              <strong>Dica de Auditor:</strong> Geralmente, os atrasos e erros costumam ocorrer nos losangos amarelos (Tomadas de Decisão). O processo de verificação é manual ou automático?
            </div>
          </div>
        )}

        {/* 2. FOLHA DE VERIFICAÇÃO */}
        {ferramentaAtiva === 'folha' && (
          <div className="tool-fade">
            <ToolHeader icone="📋" titulo="Folha de Verificação (Check Sheet)" desc="Registre a frequência com que os erros acontecem no dia a dia. Esses dados vão gerar o Pareto." />
            
            <div style={{ maxWidth: '600px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
                <input style={{ ...inpSty, flex: '1 1 200px' }} value={novaFalha} onChange={e => setNovaFalha(e.target.value)} placeholder="Nova categoria (Ex: Faltou comprovante...)" />
                <button onClick={inserirFalhaFolha} style={btnStyle('#2563eb')}>Adicionar Linha</button>
              </div>

              {dadosCheckSheet.map(item => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '10px', flexWrap: 'wrap', gap: '10px' }}>
                  <span style={{ fontSize: '14.5px', fontWeight: '600', color: '#1e293b' }}>{item.falha}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={() => alterarContagemFolha(item.id, -1)} style={btnCirc}>-</button>
                    <span style={{ fontSize: '18px', fontWeight: '900', color: '#2563eb', minWidth: '40px', textAlign: 'center' }}>{item.contagem}</span>
                    <button onClick={() => alterarContagemFolha(item.id, 1)} style={btnCirc}>+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. HISTOGRAMA */}
        {ferramentaAtiva === 'histograma' && (
          <div className="tool-fade">
            <ToolHeader icone="📊" titulo="Histograma de Frequência" desc="Qual a variação real do nosso processo? Esta curva de Gauss (sino) mostra onde os eventos mais se concentram." />
            
            <div style={{ width: '100%', height: '350px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosHistograma} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="freq" name="Ocorrências" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={50}>
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
          <div className="tool-fade">
            <ToolHeader icone="📉" titulo="Gráfico de Pareto (Vital vs Trivial)" desc="O gráfico cruzou seus dados da Folha de Verificação. Concentre seus recursos nas poucas causas (à esquerda) que somam 80% da linha vermelha." />
            
            <div style={{ width: '100%', height: '400px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={paretoData} margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                  <CartesianGrid stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="falha" scale="band" tick={{ fontSize: 11, fill: '#475569' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#ef4444', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  
                  <Bar yAxisId="left" dataKey="Qtd" name="Qtd de Erros" fill="#1e293b" radius={[4, 4, 0, 0]} barSize={60}>
                    <LabelList dataKey="Qtd" position="top" style={{ fontSize: '12px', fontWeight: 'bold', fill: '#0f172a' }} />
                  </Bar>
                  
                  <Line yAxisId="right" type="monotone" dataKey="Acumulado" name="% Acumulado" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#ef4444' }} />
                  <ReferenceLine yAxisId="right" y={80} stroke="#10b981" strokeDasharray="5 5" label={{ position: 'top', value: 'Alvo 80%', fill: '#10b981', fontSize: 12, fontWeight: 'bold' }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 5. ISHIKAWA */}
        {ferramentaAtiva === 'ishikawa' && (
          <div className="tool-fade">
            <ToolHeader icone="🐟" titulo="Ishikawa (Diagnóstico da Causa Raiz)" desc="Por que as falhas que vimos no Pareto acontecem? Preencha os 6 M's." />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
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
          <div className="tool-fade">
            <ToolHeader icone="✨" titulo="Diagrama de Dispersão" desc="Existe relação entre duas coisas? (Ex: X = Volume de NFs no dia | Y = Tempo gasto). Adicione os pontos e veja a tendência." />
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ flex: '1 1 250px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <label style={lblSty}>Variável X (Causa?)</label>
                <input type="number" style={{...inpSty, marginBottom: '10px'}} value={novoPontoDisp.x} onChange={e => setNovoPontoDisp({...novoPontoDisp, x: e.target.value})} placeholder="Ex: 10" />
                <label style={lblSty}>Variável Y (Efeito?)</label>
                <input type="number" style={{...inpSty, marginBottom: '15px'}} value={novoPontoDisp.y} onChange={e => setNovoPontoDisp({...novoPontoDisp, y: e.target.value})} placeholder="Ex: 15" />
                <button onClick={inserirDispersao} style={{...btnStyle('#3b82f6'), width: '100%'}}>Adicionar Coordenada</button>
              </div>

              <div style={{ flex: '2 1 400px', height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" dataKey="x" name="Eixo X" tick={{ fontSize: 12 }} />
                    <YAxis type="number" dataKey="y" name="Eixo Y" tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ borderRadius: '8px' }} />
                    <Scatter name="Ocorrências" data={dispersaoDados} fill="#3b82f6" />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* 7. CEP - CARTAS DE CONTROLE */}
        {ferramentaAtiva === 'cep' && (
          <div className="tool-fade">
             <ToolHeader icone="📈" titulo="Controle Estatístico de Processo (CEP)" desc="A média histórica é verde. O desvio padrão (3-Sigma) cria as faixas de perigo. Se algo sair da faixa vermelha, não culpe a equipe, pare o processo." />
             
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 250px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <label style={lblSty}>Nova Medição (Ex: Dias de Atraso)</label>
                  <input type="number" style={{...inpSty, marginBottom: '15px'}} value={novaMedicaoCep} onChange={e => setNovaMedicaoCep(e.target.value)} />
                  <button onClick={inserirMedicaoCep} style={{...btnStyle('#8b5cf6'), width: '100%'}}>Analisar Amostra</button>
                  
                  <div style={{ marginTop: '25px', padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '13px' }}>LSC (Limite Superior)</div>
                    <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '13px', margin: '8px 0' }}>MÉDIA DO PROCESSO</div>
                    <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '13px' }}>LIC (Limite Inferior)</div>
                  </div>
                </div>

                <div style={{ flex: '2 1 400px', height: '350px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={cepDataFull} margin={{ top: 20, right: 30, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px' }} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      
                      <Line type="step" dataKey="LSC" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      <Line type="step" dataKey="Media" stroke="#10b981" strokeWidth={2} dot={false} />
                      <Line type="step" dataKey="LIC" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      
                      <Line type="monotone" dataKey="Valor" name="Processo" stroke="#1e293b" strokeWidth={2} dot={{ r: 4 }} />
                      <Scatter dataKey="CausaEspecial" name="⚠️ Causa Especial" fill="#ef4444" shape="star" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>
        )}

        {/* 8. PLANO 5W2H */}
        {ferramentaAtiva === '5w2h' && (
          <div className="tool-fade">
             <ToolHeader icone="🎯" titulo="Plano de Ação 5W2H" desc="Converta as causas raízes em ações. O que não tem dono nem prazo, nunca é feito." />
             
             <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                <table style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', color: 'white', textAlign: 'left', fontSize: '12px', textTransform: 'uppercase' }}>
                      <th style={tH}>O Que? (What)</th><th style={tH}>Por Quê? (Why)</th><th style={tH}>Quem? (Who)</th><th style={tH}>Quando? (When)</th><th style={tH}>Como? (How)</th><th style={tH}>Custo? (How Much)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planoAcao.map(p => (
                      <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '13.5px' }}>
                        <td style={tD}><strong>{p.what}</strong></td><td style={tD}>{p.why}</td><td style={tD}>{p.who}</td><td style={tD}>{p.when}</td><td style={tD}>{p.how}</td><td style={tD}>{p.howMuch}</td>
                      </tr>
                    ))}
                    {!problemaAtivo.resolvido && (
                      <tr style={{ backgroundColor: '#f8fafc' }}>
                        <td style={tD}><input style={inpMini} placeholder="Implantar..." value={novoPlano.what} onChange={e => setNovoPlano({...novoPlano, what: e.target.value})} /></td>
                        <td style={tD}><input style={inpMini} placeholder="Para evitar erro" value={novoPlano.why} onChange={e => setNovoPlano({...novoPlano, why: e.target.value})} /></td>
                        <td style={tD}><input style={inpMini} placeholder="Resp." value={novoPlano.who} onChange={e => setNovoPlano({...novoPlano, who: e.target.value})} /></td>
                        <td style={tD}><input style={inpMini} type="date" value={novoPlano.when} onChange={e => setNovoPlano({...novoPlano, when: e.target.value})} /></td>
                        <td style={tD}><input style={inpMini} placeholder="Com OFX" value={novoPlano.how} onChange={e => setNovoPlano({...novoPlano, how: e.target.value})} /></td>
                        <td style={tD}>
                          <div style={{ display: 'flex', gap: '5px' }}>
                            <input style={inpMini} placeholder="R$ 1500" value={novoPlano.howMuch} onChange={e => setNovoPlano({...novoPlano, howMuch: e.target.value})} />
                            <button onClick={inserirPlano} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', padding: '0 10px' }}>+</button>
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
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .tool-fade { animation: fadeIn 0.4s ease-out; }
      `}</style>
    </div>
  );
}

// ==========================================
// COMPONENTES DE UI & ESTILOS REUSÁVEIS
// ==========================================
const ToolHeader = ({ icone, titulo, desc }) => (
  <div style={{ marginBottom: '25px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
    <h3 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span>{icone}</span> {titulo}
    </h3>
    <p style={{ margin: 0, color: '#64748b', fontSize: '14.5px' }}>{desc}</p>
  </div>
);

const TabBtn = ({ id, label, ativo, set, cor = '#2563eb' }) => {
  const isAt = ativo === id;
  return (
    <button onClick={() => set(id)} style={{
      padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', border: 'none', whiteSpace: 'nowrap', flexShrink: 0,
      backgroundColor: isAt ? cor : 'transparent', color: isAt ? 'white' : '#64748b', transition: 'all 0.2s',
      boxShadow: isAt ? `0 4px 10px ${cor}40` : 'none'
    }}>
      {label}
    </button>
  );
};

const FluxoBox = ({ tipo, texto }) => {
  const cores = { inicio: '#10b981', processo: '#3b82f6', decisao: '#f59e0b', fim: '#ef4444' };
  const borderRad = tipo === 'inicio' || tipo === 'fim' ? '20px' : (tipo === 'decisao' ? '0px' : '6px');
  const transform = tipo === 'decisao' ? 'rotate(45deg)' : 'none';
  const textTransform = tipo === 'decisao' ? 'rotate(-45deg)' : 'none';
  return (
    <div style={{ backgroundColor: cores[tipo], color: 'white', padding: tipo === 'decisao' ? '20px' : '15px', borderRadius: borderRad, transform, display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: '100px', textAlign: 'center', fontSize: '12.5px', fontWeight: 'bold', flexShrink: 0 }}>
      <span style={{ transform: textTransform }}>{texto}</span>
    </div>
  );
};

const IshikawaCard = ({ cor, title, val, set }) => (
  <div style={{ backgroundColor: 'white', border: `1px solid ${cor}50`, borderRadius: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
    <div style={{ backgroundColor: cor, color: 'white', padding: '12px', fontSize: '12px', fontWeight: '900' }}>{title}</div>
    <textarea value={val} onChange={(e) => set(e.target.value)} placeholder="Liste os problemas aqui..."
      style={{ width: '100%', boxSizing: 'border-box', minHeight: '100px', padding: '12px', border: 'none', fontSize: '14px', resize: 'vertical', outline: 'none', color: '#1e293b' }} />
  </div>
);

const btnStyle = (bg) => ({ backgroundColor: bg, color: 'white', padding: '12px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' });
const lblSty = { display: 'block', fontSize: '12.5px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' };
const inpSty = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px', outline: 'none' };
const btnCirc = { width: '30px', height: '30px', borderRadius: '15px', border: 'none', backgroundColor: '#e2e8f0', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' };
const tH = { padding: '14px 12px', borderBottom: '2px solid #334155' };
const tD = { padding: '12px', verticalAlign: 'middle', borderRight: '1px solid #e2e8f0' };
const inpMini = { width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none' };