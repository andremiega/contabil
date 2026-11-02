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
  
  // Motor Pareto
  const paretoData = useMemo(() => {
    const ord = [...defeitos].sort((a, b) => b.qty - a.qty);
    const tot = ord.reduce((sum, item) => sum + item.qty, 0);
    let acc = 0;
    return ord.map(item => {
      acc += item.qty;
      return { 
        falha: item.falha.substring(0, 14) + '...', 
        nomeCompleto: item.falha,
        Qtd: item.qty, 
        Acumulado: tot > 0 ? Number(((acc/tot)*100).toFixed(1)) : 0 
      };
    });
  }, [defeitos]);

  // Motor CEP
  const cepDataFull = useMemo(() => {
    if (medicoesCep.length === 0) return [];
    
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
        Alerta: foraDeControle ? m.valor : null 
      };
    });
  }, [medicoesCep]);

  // ==========================================
  // FUNÇÕES DE AÇÃO
  // ==========================================
  const iniciarProjeto = (p) => {
    setProjetoAtivo({ ...p, faseAtual: 'definir' });
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
    if (typeof mostrarToast === 'function') mostrarToast('Nova medição inserida. Observe o novo limite de controle estatístico.', 'sucesso');
  };

  // ==========================================
  // TELA 1: BACKLOG DE PROJETOS (COCKPIT)
  // ==========================================
  if (!projetoAtivo) {
    return (
      <div translate="no" className="notranslate" style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.4s', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '24px', borderRadius: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <span style={{ fontSize: '38px' }}>🥋</span>
          <div style={{ minWidth: 0, flex: '1 1 250px' }}>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: '900', wordBreak: 'break-word' }}>Cockpit Green Belt (DMAIC)</h2>
            <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '13.5px' }}>Gerencie projetos de otimização contínua baseados em dados (Lean Six Sigma).</p>
          </div>
        </div>

        <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '16px' }}>📋 Backlog de Projetos Kaizen</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
            {projetos.map(proj => (
              <div key={proj.id} style={{ border: '1px solid #cbd5e1', borderRadius: '16px', padding: '20px', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', cursor: 'pointer', boxSizing: 'border-box', minWidth: 0, transition: 'transform 0.2s' }}
                   onClick={() => iniciarProjeto(proj)}
                   onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                   onMouseOut={e => e.currentTarget.style.transform = 'none'}
              >
                <span style={{ alignSelf: 'flex-start', backgroundColor: '#e2e8f0', color: '#475569', fontSize: '10.5px', padding: '3px 8px', borderRadius: '12px', fontWeight: '800', textTransform: 'uppercase' }}>
                  {proj.status === 'pendente' ? 'Não Iniciado' : 'Concluído'}
                </span>
                <h4 style={{ margin: '10px 0 6px 0', color: '#0f172a', fontSize: '15.5px', wordBreak: 'break-word' }}>{proj.titulo}</h4>
                <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#64748b', flex: 1, lineHeight: '1.5', wordBreak: 'break-word' }}>{proj.descricao}</p>
                <button style={{ ...btnStyle('#0f172a'), width: '100%', fontSize: '13px', boxSizing: 'border-box' }}>Abrir Project Charter 🚀</button>
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
    <div translate="no" className="notranslate" style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.4s', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* HEADER DO PROJETO */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '20px 24px', borderRadius: '16px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px', boxSizing: 'border-box' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <button onClick={() => setProjetoAtivo(null)} style={{ background: 'none', border: 'none', color: '#38bdf8', fontWeight: 'bold', cursor: 'pointer', padding: '0 0 6px 0', fontSize: '12.5px' }}>← Voltar ao Portfólio</button>
          <h2 style={{ margin: 0, fontSize: '18px', wordBreak: 'break-word' }}>{projetoAtivo.titulo}</h2>
        </div>
      </div>

      {/* NAVEGAÇÃO DMAIC TABS (Grelha Flexível Inteligente) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: '8px', backgroundColor: '#e2e8f0', padding: '6px', borderRadius: '14px', boxSizing: 'border-box' }}>
        {[
          { id: 'definir', lbl: '1. Definir' }, { id: 'medir', lbl: '2. Medir' }, 
          { id: 'analisar', lbl: '3. Analisar' }, { id: 'melhorar', lbl: '4. Melhorar' }, 
          { id: 'controlar', lbl: '5. Controlar' }
        ].map(f => (
          <button key={f.id} onClick={() => setProjetoAtivo({...projetoAtivo, faseAtual: f.id})} style={{
            padding: '10px 12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', border: 'none', cursor: 'pointer',
            backgroundColor: fs === f.id ? '#2563eb' : '#ffffff',
            color: fs === f.id ? 'white' : '#334155', transition: 'all 0.2s', textAlign: 'center', boxSizing: 'border-box'
          }}>
            {f.lbl}
          </button>
        ))}
      </div>

      {/* ÁREA DE TRABALHO DA FASE */}
      <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #cbd5e1', minHeight: '500px', boxSizing: 'border-box' }}>
        
        {/* D - DEFINIR */}
        {fs === 'definir' && (
          <div className="tool-fade" style={{ boxSizing: 'border-box' }}>
            <ToolHeader icone="🎯" titulo="Definir (Project Charter)" desc="O Contrato do Projeto. Estabeleça exatamente o que está acontecendo e qual é a meta SMART antes de iniciar a análise." />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', boxSizing: 'border-box' }}>
              <InputCard titulo="Declaração do Problema" desc="O que está errado? Há quanto tempo? Qual o impacto?" val={charter.problema} set={(v) => setCharter({...charter, problema: v})} />
              <InputCard titulo="Meta do Projeto (Y)" desc="Ex: Reduzir de 15 dias para 3 dias úteis até o final do ano." val={charter.meta} set={(v) => setCharter({...charter, meta: v})} />
              <InputCard titulo="Business Case" desc="Por que este projeto é importante para o negócio?" val={charter.businessCase} set={(v) => setCharter({...charter, businessCase: v})} />
              <InputCard titulo="Escopo e Equipe" desc="Onde começa e termina? Quem são os membros (Green Belts/Sponsors)?" val={charter.escopo} set={(v) => setCharter({...charter, escopo: v})} />
            </div>
          </div>
        )}

        {/* M - MEDIR */}
        {fs === 'medir' && (
          <div className="tool-fade" style={{ boxSizing: 'border-box' }}>
            <ToolHeader icone="📉" titulo="Medir (Coleta de Baseline & Pareto)" desc="Colete os dados históricos para entender a situação atual (Baseline). O gráfico de Pareto aplicará a regra 80/20 automaticamente." />
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxSizing: 'border-box', minWidth: 0 }}>
                <h4 style={{ margin: '0 0 14px 0', fontSize: '15px', color: '#0f172a' }}>Matriz de Defeitos (Histórico)</h4>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px', boxSizing: 'border-box' }}>
                  <input style={{...inpSty, padding: '10px'}} value={novoDefeito} onChange={e => setNovoDefeito(e.target.value)} placeholder="Novo tipo de defeito..." />
                  <button onClick={addDefeito} style={{...btnStyle('#2563eb'), padding: '10px 14px'}}>+</button>
                </div>
                {defeitos.map(d => (
                  <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '8px', boxSizing: 'border-box' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', wordBreak: 'break-word', marginRight: '8px' }}>{d.falha}</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                      <button onClick={() => upDefeito(d.id, -1)} style={btnCirc}>-</button>
                      <span style={{ width: '26px', textAlign: 'center', fontWeight: 'bold', color: '#2563eb' }}>{d.qty}</span>
                      <button onClick={() => upDefeito(d.id, 1)} style={btnCirc}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ height: '350px', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={paretoData} margin={{ top: 20, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="falha" scale="band" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#ef4444' }} axisLine={false} tickLine={false} />
                    
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    
                    <Bar yAxisId="left" dataKey="Qtd" name="Quantidade" fill="#1e293b" radius={[4, 4, 0, 0]} barSize={40}>
                      <LabelList dataKey="Qtd" position="top" style={{ fontSize: '11px', fontWeight: 'bold' }} />
                    </Bar>
                    <Line yAxisId="right" type="monotone" dataKey="Acumulado" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, fill: '#ef4444' }} />
                    <ReferenceLine yAxisId="right" y={80} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: 'Alvo 80%', fill: '#10b981', fontSize: 11, fontWeight: 'bold' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* A - ANALISAR */}
        {fs === 'analisar' && (
          <div className="tool-fade" style={{ boxSizing: 'border-box' }}>
            <ToolHeader icone="🔍" titulo="Analisar (Causa Raiz)" desc="Identificou o pior defeito no Pareto? Agora use o diagrama de Ishikawa e os 5 Porquês para encontrar a causa raiz antes de propor soluções." />
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '16px', marginBottom: '24px', boxSizing: 'border-box' }}>
              <IshikawaCard cor="#3b82f6" title="MÉTODO (Processos)" val={ishikawa.metodo} set={(v) => setIshikawa({...ishikawa, metodo: v})} />
              <IshikawaCard cor="#10b981" title="MÃO DE OBRA (Pessoas)" val={ishikawa.maoDeObra} set={(v) => setIshikawa({...ishikawa, maoDeObra: v})} />
              <IshikawaCard cor="#8b5cf6" title="MÁQUINA (Sistemas/TI)" val={ishikawa.maquina} set={(v) => setIshikawa({...ishikawa, maquina: v})} />
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0f172a' }}>Técnica dos 5 Porquês</h4>
              <p style={{ fontSize: '12.5px', color: '#64748b', marginBottom: '14px' }}>Pergunte "Por quê?" até chegar na raiz do problema que o Ishikawa apontou.</p>
              {cincoPorques.map((pq, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
                  <span style={{ fontWeight: 'bold', color: '#ef4444', width: '80px', flexShrink: 0 }}>{idx + 1}º Por quê:</span>
                  <input style={{...inpSty, flex: '1 1 200px'}} value={pq} onChange={e => { const nv = [...cincoPorques]; nv[idx] = e.target.value; setCincoPorques(nv); }} placeholder="Resposta..." />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* I - MELHORAR */}
        {fs === 'melhorar' && (
          <div className="tool-fade" style={{ boxSizing: 'border-box' }}>
            <ToolHeader icone="📝" titulo="Melhorar (Plano de Ação 5W2H)" desc="Traduza a causa raiz em ações práticas. Um plano sem dono ou prazo é apenas uma intenção." />
            
            <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '12px', boxSizing: 'border-box' }}>
              <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', backgroundColor: 'white' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f172a', color: 'white', textAlign: 'left', fontSize: '12.5px' }}>
                    <th style={tH}>O Que? (What)</th><th style={tH}>Quem? (Who)</th><th style={tH}>Quando? (When)</th><th style={tH}>Como? (How)</th>
                  </tr>
                </thead>
                <tbody>
                  {planoAcao.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0', fontSize: '13px' }}>
                      <td style={tD}><strong>{p.what}</strong></td><td style={tD}>{p.who}</td><td style={tD}>{p.when}</td><td style={tD}>{p.how}</td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <td style={tD}><input style={inpMini} placeholder="Implantar RPA..." value={novoPlano.what} onChange={e => setNovoPlano({...novoPlano, what: e.target.value})} /></td>
                    <td style={tD}><input style={inpMini} placeholder="Resp. TI" value={novoPlano.who} onChange={e => setNovoPlano({...novoPlano, who: e.target.value})} /></td>
                    <td style={tD}><input style={inpMini} type="date" value={novoPlano.when} onChange={e => setNovoPlano({...novoPlano, when: e.target.value})} /></td>
                    <td style={tD}>
                      <div style={{ display: 'flex', gap: '6px', boxSizing: 'border-box' }}>
                        <input style={inpMini} placeholder="Mapeando API" value={novoPlano.how} onChange={e => setNovoPlano({...novoPlano, how: e.target.value})} />
                        <button onClick={addPlano} style={{ backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '0 12px', fontWeight: 'bold', fontSize: '15px' }}>+</button>
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
          <div className="tool-fade" style={{ boxSizing: 'border-box' }}>
             <ToolHeader icone="📈" titulo="Controlar (Shift de Média - Carta de Controle CEP)" desc="Prove estatisticamente que a sua melhoria funcionou. Insira novos dados para Fase 'Depois' e observe a média e os limites (3-Sigma) caírem." />
             
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', boxSizing: 'border-box', minWidth: 0 }}>
                  <label style={lblSty}>Inserir Dado (Fase "Depois da Melhoria")</label>
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', boxSizing: 'border-box' }}>
                    <input type="number" style={inpSty} value={novaMedicao} onChange={e => setNovaMedicao(e.target.value)} placeholder="Ex: 4 dias" />
                    <button onClick={addCepDepois} style={btnStyle('#8b5cf6')}>Registrar</button>
                  </div>
                  
                  <div style={{ padding: '16px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '14.5px' }}>Estatísticas da Fase</h4>
                    <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '12.5px' }}>LSC (Máx Seguro): {cepDataFull[cepDataFull.length - 1]?.LSC || 0}</div>
                    <div style={{ color: '#10b981', fontWeight: 'bold', fontSize: '12.5px', margin: '8px 0' }}>MÉDIA: {cepDataFull[cepDataFull.length - 1]?.Media || 0}</div>
                    <div style={{ color: '#f59e0b', fontWeight: 'bold', fontSize: '12.5px' }}>LIC (Mín Seguro): {cepDataFull[cepDataFull.length - 1]?.LIC || 0}</div>
                  </div>
                </div>

                <div style={{ height: '350px', width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={cepDataFull} margin={{ top: 20, right: 30, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="dia" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                      <Legend wrapperStyle={{ fontSize: '11px' }} />
                      
                      <Line type="stepAfter" dataKey="LSC" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      <Line type="stepAfter" dataKey="Media" stroke="#10b981" strokeWidth={2} dot={false} />
                      <Line type="stepAfter" dataKey="LIC" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                      
                      <Line type="monotone" dataKey="Valor" name="Medição Real" stroke="#1e293b" strokeWidth={3} dot={{ r: 5 }} />
                      
                      <ReferenceLine x="Semana 5" stroke="#94a3b8" strokeDasharray="3 3" label={{ position: 'top', value: 'Melhoria ➔', fill: '#475569', fontSize: 11 }} />
                      
                      <Scatter dataKey="Alerta" name="⚠️ Fora" fill="#ef4444" shape="star" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
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
// ESTILOS E COMPONENTES SECUNDÁRIOS
// ==========================================
const ToolHeader = ({ icone, titulo, desc }) => (
  <div style={{ marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '14px', boxSizing: 'border-box' }}>
    <h3 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
      <span>{icone}</span> {titulo}
    </h3>
    <p style={{ margin: 0, color: '#64748b', fontSize: '13.5px', wordBreak: 'break-word' }}>{desc}</p>
  </div>
);

const InputCard = ({ titulo, desc, val, set }) => (
  <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', boxSizing: 'border-box', minWidth: 0 }}>
    <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#0f172a', marginBottom: '4px', wordBreak: 'break-word' }}>{titulo}</label>
    <p style={{ fontSize: '11.5px', color: '#64748b', margin: '0 0 8px 0', wordBreak: 'break-word' }}>{desc}</p>
    <textarea value={val} onChange={(e) => set(e.target.value)} style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', minHeight: '60px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'vertical', outline: 'none', backgroundColor: 'white' }} />
  </div>
);

const IshikawaCard = ({ cor, title, val, set }) => (
  <div style={{ backgroundColor: 'white', border: `1px solid ${cor}50`, borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxSizing: 'border-box', minWidth: 0 }}>
    <div style={{ backgroundColor: cor, color: 'white', padding: '12px', fontSize: '12px', fontWeight: '900', wordBreak: 'break-word' }}>{title}</div>
    <textarea value={val} onChange={(e) => set(e.target.value)} placeholder="Anotações..."
      style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', minHeight: '80px', padding: '12px', border: 'none', fontSize: '13.5px', resize: 'vertical', outline: 'none', color: '#1e293b' }} />
  </div>
);

const btnStyle = (bg) => ({ backgroundColor: bg, color: 'white', padding: '10px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxSizing: 'border-box' });
const lblSty = { display: 'block', fontSize: '12.5px', fontWeight: 'bold', color: '#475569', marginBottom: '6px', wordBreak: 'break-word' };
const inpSty = { width: '100%', maxWidth: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '13.5px', outline: 'none', backgroundColor: 'white' };
const btnCirc = { width: '28px', height: '28px', borderRadius: '14px', border: 'none', backgroundColor: '#e2e8f0', color: '#0f172a', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px', flexShrink: 0 };
const tH = { padding: '12px 14px', borderBottom: '2px solid #334155' };
const tD = { padding: '12px 14px', verticalAlign: 'middle', borderRight: '1px solid #e2e8f0', wordBreak: 'break-word' };
const inpMini = { width: '100%', maxWidth: '100%', padding: '10px', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', backgroundColor: 'white' };