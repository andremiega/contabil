import React, { useState, useMemo } from 'react';
import {
  BarChart, Bar, Line, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, ReferenceLine, Legend, LabelList, Cell
} from 'recharts';

export default function SimuladorGreenBelt({ mostrarToast }) {
  // ==========================================
  // ESTADO: BACKLOG DE PROJETOS DMAIC
  // ==========================================
  const [projetos, setProjetos] = useState([
    {
      id: 1,
      titulo: 'Projeto Fast Close (Fechamento Contábil)',
      descricao: 'O tempo médio para emitir a DRE e Balanço após a virada do mês está em 15 dias úteis. A diretoria exige que caia para 4 dias.',
      status: 'pendente',
      faseAtual: 'definir'
    },
    {
      id: 2,
      titulo: 'Projeto Zero Multa (SPED Fiscal)',
      descricao: 'Autuações somaram R$ 45 mil no último semestre devido a divergências de CFOP e CST nas vendas. Precisamos estancar esse vazamento.',
      status: 'pendente',
      faseAtual: 'definir'
    }
  ]);

  const [projetoAtivo, setProjetoAtivo] = useState(null);

  // ==========================================
  // DADOS DO PROJETO (DMAIC)
  // ==========================================
  
  // D - DEFINIR (Project Charter)
  const [charter, setCharter] = useState({ 
    businessCase: '', problema: '', meta: '', escopo: '' 
  });

  // M - MEDIR (Coleta de Dados -> Pareto)
  const [defeitos, setDefeitos] = useState([
    { id: 1, falha: 'Conciliação Bancária Manual', qty: 120 },
    { id: 2, falha: 'Espera por NF Física', qty: 45 },
    { id: 3, falha: 'Correção de Lançamento', qty: 25 },
    { id: 4, falha: 'Queda do ERP', qty: 10 }
  ]);
  const [novoDefeito, setNovoDefeito] = useState('');

  // A - ANALISAR (5 Porquês + Ishikawa)
  const [ishikawa, setIshikawa] = useState({ metodo: '', maoDeObra: '', maquina: '', meioAmbiente: '', medida: '', material: '' });
  const [cincoPorques, setCincoPorques] = useState(['', '', '', '', '']);

  // I - MELHORAR (5W2H)
  const [planoAcao, setPlanoAcao] = useState([]);
  const [novoPlano, setNovoPlano] = useState({ what: '', who: '', when: '', how: '' });

  // C - CONTROLAR (CEP Before & After)
  // Valores iniciais representam o processo ANTES da melhoria (caótico)
  const [medicoesCep, setMedicoesCep] = useState([
    { dia: 'Semana 1', valor: 14, fase: 'Antes' },
    { dia: 'Semana 2', valor: 16, fase: 'Antes' },
    { dia: 'Semana 3', valor: 13, fase: 'Antes' },
    { dia: 'Semana 4', valor: 15, fase: 'Antes' },
    { dia: 'Semana 5', valor: 14, fase: 'Antes' }
  ]);
  const [novaMedicao, setNovaMedicao] = useState('');

  // ==========================================
  // MOTORES MATEMÁTICOS (ESTATÍSTICA)
  // ==========================================
  
  // Motor Pareto (Calcula Porcentagem Acumulada)
  const paretoData = useMemo(() => {
    const ord = [...defeitos].sort((a, b) => b.qty - a.qty);
    const tot = ord.reduce((sum, item) => sum + item.qty, 0);
    let acc = 0;
    return ord.map(item => {
      acc += item.qty;
      return { 
        falha: item.falha.substring(0, 16) + '...', 
        nomeCompleto: item.falha,
        Qtd: item.qty, 
        Acumulado: tot > 0 ? Number(((acc/tot)*100).toFixed(1)) : 0 
      };
    });
  }, [defeitos]);

  // Motor CEP (Calcula Limites do Antes e do Depois)
  const cepDataFull = useMemo(() => {
    if (medicoesCep.length === 0) return [];
    
    // Separa os dados em "Antes" e "Depois"
    const antes = medicoesCep.filter(m => m.fase === 'Antes');
    const depois = medicoesCep.filter(m => m.fase === 'Depois');

    const calcLimites = (dados) => {
      if (dados.length === 0) return { media: null, lsc: null, lic: null };
      const media = dados.reduce((a, b) => a + b.valor, 0) / dados.length;
      const variancia = dados.reduce((a, b) => a + Math.pow(b.valor - media, 2), 0) / dados.length;
      const dp = Math.sqrt(variancia);
      return { media, lsc: media + (3 * dp), lic: Math.max(0, media - (3 * dp)) };
    };

    const limAntes = calcLimites(antes);
    const limDepois = calcLimites(depois);

    return medicoesCep.map((m) => {
      const isAntes = m.fase === 'Antes';
      const limites = isAntes ? limAntes : limDepois;
      const foraDeControle = m.valor > limites.lsc || m.valor < limites.lic;

      return {
        dia: m.dia,
        Valor: m.valor,
        Media: Number(limites.media.toFixed(1)),
        LSC: Number(limites.lsc.toFixed(1)),
        LIC: Number(limites.lic.toFixed(1)),
        Fase: m.fase,
        Alerta: foraDeControle ? m.valor : null // Mostra estrela vermelha se fora do limite
      };
    });
  }, [medicoesCep]);

  // ==========================================
  // FUNÇÕES DE AÇÃO
  // ==========================================
  const iniciarProjeto = (p) => {
    setProjetoAtivo({ ...p, faseAtual: 'definir' });
    // Pré-preenche o Charter com dados do problema
    setCharter({ businessCase: p.descricao, problema: p.titulo, meta: '', escopo: '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addDefeito = () => {
    if(!novoDefeito) return;
    setDefeitos([...defeitos, { id: Date.now(), falha: novoDefeito, qty: 1 }]);
    setNovoDefeito('');
  };
  const upDefeito = (id, val) => setDefeitos(defeitos.map(d => d.id === id ? {...d, qty: Math.max(0, d.qty + val)} : d));

  const addPlano = () => {
    if(!novoPlano.what || !novoPlano.who) return;
    setPlanoAcao([...planoAcao, { ...novoPlano, id: Date.now() }]);
    setNovoPlano({ what: '', who: '', when: '', how: '' });
  };

  const addCepDepois = () => {
    const v = Number(novaMedicao);
    if(isNaN(v) || v <= 0) return;
    setMedicoesCep([...medicoesCep, { dia: `Semana ${medicoesCep.length + 1}`, valor: v, fase: 'Depois' }]);
    setNovaMedicao('');
    mostrarToast('Nova medição inserida. Observe o novo limite de controle estatístico.', 'sucesso');
  };

  // ==========================================
  // TELA 1: BACKLOG DE PROJETOS (COCKPIT)
  // ==========================================
  if (!projetoAtivo) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.4s' }}>
        <div style={{ backgroundColor: '#0f172a', padding: '25px', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '42px' }}>🥋</span>
          <div>
            <h2 style={{ margin: 0, fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: '900' }}>Cockpit Green Belt (DMAIC)</h2>
            <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>Gerencie projetos de otimização contínua baseados em dados (Lean Six Sigma).</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>📋 Backlog de Projetos Kaizen</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {projetos.map(proj => (
              <div key={proj.id} style={{ border: '1px solid #cbd5e1', borderRadius: '12px', padding: '20px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                   onClick={() => iniciarProjeto(proj)}
                   onMouseOver={e => e.currentTarget.style.boxShadow = '0 6px 15px rgba(0,0,0,0.08)'}
                   onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
              >
                <span style={{ alignSelf: 'flex-start', backgroundColor: '#e2e8f0', color: '#475569', fontSize: '11px', padding: '4px 10px', borderRadius: '15px', fontWeight: '800', textTransform: 'uppercase' }}>
                  {proj.status === 'pendente' ? 'Não Iniciado' : 'Concluído'}
                </span>
                <h4 style={{ margin: '12px 0 8px 0', color: '#0f172a', fontSize: '16.5px' }}>{proj.titulo}</h4>
                <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b', flex: 1, lineHeight: '1.5' }}>{proj.descricao}</p>
                <button style={{ ...btnStyle('#0f172a'), width: '100%', fontSize: '13.5px' }}>Abrir Project Charter 🚀</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const fs = projetoAtivo.faseAtual;

  // ==========================================
  // TELA 2: EXECUÇÃO DO PROJETO (WORKSPACE)
  // ==========================================
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.4s' }}>
      
      {/* HEADER DO PROJETO */}
      <div style={{ backgroundColor: '#0f172a', padding: '20px 25px', borderRadius: '12px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <button onClick={() => setProjetoAtivo(null)} style={{ background: 'none', border: 'none', color: '#38bdf8', fontWeight: 'bold', cursor: 'pointer', padding: '0 0 8px 0', fontSize: '13px' }}>← Voltar ao Portfólio</button>
          <h2 style={{ margin: 0, fontSize: 'clamp(18px, 3vw, 24px)' }}>{projetoAtivo.titulo}</h2>
        </div>
      </div>

      {/* NAVEGAÇÃO DMAIC TABS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', backgroundColor: 'white', padding: '10px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
        {[
          { id: 'definir', lbl: '1. Definir (Charter)' }, { id: 'medir', lbl: '2. Medir (Pareto)' }, 
          { id: 'analisar', lbl: '3. Analisar (Causa Raiz)' }, { id: 'melhorar', lbl: '4. Melhorar (5W2H)' }, 
          { id: 'controlar', lbl: '5. Controlar (CEP)' }
        ].map(f => (
          <button key={f.id} onClick={() => setProjetoAtivo({...projetoAtivo, faseAtual: f.id})} style={{
            flex: '1 1 120px', padding: '12px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12.5px', border: 'none', cursor: 'pointer',
            backgroundColor: fs === f.id ? '#2563eb' : 'transparent',
            color: fs === f.id ? 'white' : '#64748b', transition: 'all 0.2s', boxShadow: fs === f.id ? '0 4px 10px rgba(37,99,235,0.3)' : 'none'
          }}>
            {f.lbl}
          </button>
        ))}
      </div>

      {/* ÁREA DE TRABALHO DA FASE */}
      <div style={{ backgroundColor: 'white', padding: 'clamp(15px, 3vw, 30px)', borderRadius: '12px', border: '1px solid #cbd5e1', minHeight: '600px' }}>
        
        {/* D - DEFINIR */}
        {fs === 'definir' && (
          <div className="tool-fade">
            <ToolHeader icone="🎯" titulo="Definir (Project Charter)" desc="O Contrato do Projeto. Estabeleça exatamente o que está acontecendo e qual é a meta SMART antes de iniciar a análise." />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <InputCard titulo="Declaração do Problema" desc="O que está errado? Há quanto tempo? Qual o impacto?" val={charter.problema} set={(v) => setCharter({...charter, problema: v})} />
              <InputCard titulo="Meta do Projeto (Y)" desc="Ex: Reduzir de 15 dias para 3 dias úteis até o final do ano." val={charter.meta} set={(v) => setCharter({...charter, meta: v})} />
              <InputCard titulo="Business Case" desc="Por que este projeto é importante para o negócio?" val={charter.businessCase} set={(v) => setCharter({...charter, businessCase: v})} />
              <InputCard titulo="Escopo e Equipe" desc="Onde começa e termina? Quem são os membros (Green Belts/Sponsors)?" val={charter.escopo} set={(v) => setCharter({...charter, escopo: v})} />
            </div>
          </div>
        )}

        {/* M - MEDIR */}
        {fs === 'medir' && (
          <div className="tool-fade">
            <ToolHeader icone="📉" titulo="Medir (Coleta de Baseline & Pareto)" desc="Colete os dados históricos para entender a situação atual (Baseline). O gráfico de Pareto aplicará a regra 80/20 automaticamente." />
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
              <div style={{ flex: '1 1 300px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 15px 0' }}>Matriz de Defeitos (Histórico)</h4>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <input style={{...inpSty, padding: '8px'}} value={novoDefeito} onChange={e => setNovoDefeito(e.target.value)} placeholder="Novo tipo de defeito..." />
                  <button onClick={addDefeito} style={{...btnStyle('#2563eb'), padding: '8px 12px'}}>+</button>
                </div>
                {defeitos.map(d => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '6px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{d.falha}</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <button onClick={() => upDefeito(d.id, -1)} style={btnCirc}>-</button>
                      <span style={{ width: '30px', textAlign: 'center', fontWeight: 'bold', color: '#2563eb' }}>{d.qty}</span>
                      <button onClick={() => upDefeito(d.id, 1)} style={btnCirc}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ flex: '2 1 400px', height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={paretoData} margin={{ top: 20, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="falha" scale="band" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#ef4444' }} axisLine={false} tickLine={false} />
                    
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    
                    <Bar yAxisId="left" dataKey="Qtd" name="Quantidade" fill="#1e293b" radius={[4, 4, 0, 0]} barSize={50}>
                      <LabelList dataKey="Qtd" position="top" style={{ fontSize: '12px', fontWeight: 'bold' }} />
                    </Bar>
                    <Line yAxisId="right" type="monotone" dataKey="Acumulado" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} />
                    <ReferenceLine yAxisId="right" y={80} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Alvo 80%', fill: '#10b981', fontSize: 12, fontWeight: 'bold' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* A - ANALISAR */}
        {fs === 'analisar' && (
          <div className="tool-fade">
            <ToolHeader icone="🔍" titulo="Analisar (Causa Raiz)" desc="Identificou o pior defeito no Pareto? Agora use o diagrama de Ishikawa e os 5 Porquês para encontrar a causa raiz antes de propor soluções." />
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <IshikawaCard cor="#3b82f6" title="MÉTODO (Processos)" val={ishikawa.metodo} set={(v) => setIshikawa({...ishikawa, metodo: v})} />
              <IshikawaCard cor="#10b981" title="MÃO DE OBRA (Pessoas)" val={ishikawa.maoDeObra} set={(v) => setIshikawa({...ishikawa, maoDeObra: v})} />
              <IshikawaCard cor="#8b5cf6" title="MÁQUINA (Sistemas/TI)" val={ishikawa.maquina} set={(v) => setIshikawa({...ishikawa, maquina: v})} />
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
              <h4 style={{ margin: '0 0 15px 0' }}>Técnica dos 5 Porquês</h4>
              <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '15px' }}>Pergunte "Por quê?" até chegar na raiz do problema que o Ishikawa apontou.</p>
              {cincoPorques.map((pq, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{ fontWeight: 'bold', color: '#ef4444', width: '80px' }}>{idx + 1}º Por quê:</span>
                  <input style={inpSty} value={pq} onChange={e => { const nv = [...cincoPorques]; nv[idx] = e.target.value; setCincoPorques(nv); }} placeholder="Resposta..." />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* I - MELHORAR */}
        {fs === 'melhorar' && (
          <div className="tool-fade">
            <ToolHeader icone="📝" titulo="Melhorar (Plano de Ação 5W2H)" desc="Traduza a causa raiz em ações práticas. Um plano sem dono ou prazo é apenas uma intenção." />
            
            <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '10px' }}>
              <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f172a', color: 'white', textAlign: 'left', fontSize: '13px' }}>
                    <th style={tH}>O Que? (What)</th><th style={tH}>Quem? (Who)</th><th style={tH}>Quando? (When)</th><th style={tH}>Como? (How)</th>
                  </tr>
                </thead>
                <tbody>
                  {planoAcao.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '13.5px' }}>
                      <td style={tD}><strong>{p.what}</strong></td><td style={tD}>{p.who}</td><td style={tD}>{p.when}</td><td style={tD}>{p.how}</td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <td style={tD}><input style={inpMini} placeholder="Implantar RPA..." value={novoPlano.what} onChange={e => setNovoPlano({...novoPlano, what: e.target.value})} /></td>
                    <td style={tD}><input style={inpMini} placeholder="Resp. TI" value={novoPlano.who} onChange={e => setNovoPlano({...novoPlano, who: e.target.value})} /></td>
                    <td style={tD}><input style={inpMini} type="date" value={novoPlano.when} onChange={e => setNovoPlano({...novoPlano, when: e.target.value})} /></td>
                    <td style={tD}>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <input style={inpMini} placeholder="Mapeando API" value={novoPlano.how} onChange={e => setNovoPlano({...novoPlano, how: e.target.value})} />
                        <button onClick={addPlano} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', padding: '0 10px', fontWeight: 'bold' }}>+</button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* C - CONTROLAR */}
        {fs === 'controlar' && (
          <div className="tool-fade">
             <ToolHeader icone="📈" titulo="Controlar (Shift de Média - Carta de Controle CEP)" desc="Prove estatisticamente que a sua melhoria funcionou. Insira novos dados para Fase 'Depois' e observe a média e os limites (3-Sigma) caírem." />
             
             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 250px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                  <label style={lblSty}>Inserir Dado (Fase "Depois da Melhoria")</label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <input type="number" style={inpSty} value={novaMedicao} onChange={e => setNovaMedicao(e.target.value)} placeholder="Ex: 4 dias" />
                    <button onClick={addCepDepois} style={btnStyle('#8b5cf6')}>Registrar</button>
                  </div>
                  
                  <div style={{ padding: '15px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>Estatísticas da Fase</h4>
                    <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '13px' }}>LSC (Máx Seguro): {cepDataFull[cepDataFull.length - 1]?.LSC || 0}</div>
                    <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '13px', margin: '8px 0' }}>MÉDIA: {cepDataFull[cepDataFull.length - 1]?.Media || 0}</div>
                    <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '13px' }}>LIC (Mín Seguro): {cepDataFull[cepDataFull.length - 1]?.LIC || 0}</div>
                  </div>
                </div>

                {/* GRÁFICO CEP DINÂMICO (ANTES E DEPOIS) */}
                <div style={{ flex: '2 1 400px', height: '350px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={cepDataFull} margin={{ top: 20, right: 30, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px' }} />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      
                      {/* Linhas Limites LSC, LIC, Média Dinâmicas por Fase */}
                      <Line type="stepAfter" dataKey="LSC" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      <Line type="stepAfter" dataKey="Media" stroke="#10b981" strokeWidth={2} dot={false} />
                      <Line type="stepAfter" dataKey="LIC" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      
                      {/* O Processo Real */}
                      <Line type="monotone" dataKey="Valor" name="Medição Real" stroke="#1e293b" strokeWidth={3} dot={{ r: 5 }} />
                      
                      {/* Marca as fases (Antes e Depois) separadas */}
                      <ReferenceLine x="Semana 5" stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: 'Implantação da Melhoria ➔', fill: '#475569', fontSize: 12 }} />
                      
                      {/* Destaca se algum ponto fugiu do controle */}
                      <Scatter dataKey="Alerta" name="⚠️ Fora de Controle" fill="#ef4444" shape="star" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
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
// ESTILOS E COMPONENTES SECUNDÁRIOS
// ==========================================
const ToolHeader = ({ icone, titulo, desc }) => (
  <div style={{ marginBottom: '25px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
    <h3 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span>{icone}</span> {titulo}
    </h3>
    <p style={{ margin: 0, color: '#64748b', fontSize: '14.5px' }}>{desc}</p>
  </div>
);

const InputCard = ({ titulo, desc, val, set }) => (
  <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px' }}>{titulo}</label>
    <p style={{ fontSize: '11px', color: '#64748b', margin: '0 0 8px 0' }}>{desc}</p>
    <textarea value={val} onChange={(e) => set(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', minHeight: '60px', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '13px', resize: 'vertical', outline: 'none' }} />
  </div>
);

const IshikawaCard = ({ cor, title, val, set }) => (
  <div style={{ backgroundColor: 'white', border: `1px solid ${cor}50`, borderRadius: '10px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
    <div style={{ backgroundColor: cor, color: 'white', padding: '12px', fontSize: '12px', fontWeight: '900' }}>{title}</div>
    <textarea value={val} onChange={(e) => set(e.target.value)} placeholder="Anotações..."
      style={{ width: '100%', boxSizing: 'border-box', minHeight: '80px', padding: '12px', border: 'none', fontSize: '14px', resize: 'vertical', outline: 'none', color: '#1e293b' }} />
  </div>
);

const btnStyle = (bg) => ({ backgroundColor: bg, color: 'white', padding: '10px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' });
const lblSty = { display: 'block', fontSize: '12.5px', fontWeight: 'bold', color: '#475569', marginBottom: '8px' };
const inpSty = { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px', outline: 'none' };
const btnCirc = { width: '28px', height: '28px', borderRadius: '14px', border: 'none', backgroundColor: '#e2e8f0', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' };
const tH = { padding: '14px 12px', borderBottom: '2px solid #334155' };
const tD = { padding: '12px', verticalAlign: 'middle', borderRight: '1px solid #e2e8f0' };
const inpMini = { width: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '13px', outline: 'none' };