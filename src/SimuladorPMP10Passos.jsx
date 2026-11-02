import React, { useState } from 'react';

export default function SimuladorPMP10Passos({ mostrarToast }) {
  const [visao, setVisao] = useState('tap');
  const [passo, setPasso] = useState(1);

  const [projeto, setProjeto] = useState({
    titulo: 'Redesenho e Lançamento do Portal E-commerce B2B',
    gerente: 'Andre Lopes da Silva',
    patrocinador: 'Diretoria Financeira & Comercial',
    dataInicio: '2026-11-01',
    justificativa: 'Modernizar o canal de vendas corporativas para evitar perda de market share.',
    visaoGeral: 'Projeto estratégico para modernizar o canal de vendas corporativas, integrando faturamento e estoque em tempo real.',
    objetivoEspecifico: 'Aumentar o tráfego orgânico e a conversão de pedidos B2B pelo portal.',
    objetivoMensuravel: 'Crescer em 30% os leads qualificados e reduzir abandono de carrinho em 20%.',
    objetivoAtingivel: 'Utilizando a nova arquitetura React/Node e equipe interna dedicada.',
    objetivoRelevante: 'Essencial para expandir a margem líquida e escalar vendas sem aumentar a equipe comercial.',
    objetivoTemporal: 'Concluir até o final da Semana 8 (Go-Live completo).',
    declaracaoEscopo: 'Desenvolvimento completo da frente de loja B2B, painel do cliente e API de integração.',
    escopoDentro: '• Prototipação UI/UX\n• Front-end responsivo e Back-end\n• Integração com motor de NF-e\n• Testes de Carga e UAT',
    escopoFora: '• Migração de bancos de dados legados\n• App nativo iOS/Android\n• Suporte 24/7',
    entregaveisPrincipais: '1. Doc. Requisitos; 2. Homologação; 3. Produção.',
    stakeholders: [
      { id: 1, nome: 'Diretor Comercial', papel: 'Sponsor', responsabilidade: 'Aprovar orçamento', interesse: 'Alto', influencia: 'Alta' },
      { id: 2, nome: 'Gerente (PM)', papel: 'Líder', responsabilidade: 'Planejar cronograma', interesse: 'Alto', influencia: 'Alta' },
      { id: 3, nome: 'Tech Lead', papel: 'Execução', responsabilidade: 'Desenvolver arquitetura', interesse: 'Alto', influencia: 'Média' },
      { id: 4, nome: 'Clientes', papel: 'Homologador', responsabilidade: 'Validar UAT', interesse: 'Médio', influencia: 'Alta' }
    ],
    wbsPacotes: [
      { codigo: '1.1', fase: 'Gestão', entregas: 'Planejamento | Reuniões | Relatórios', responsavel: 'Gerente (PM)', custoEstimado: 6000 },
      { codigo: '1.2', fase: 'Design (UI/UX)', entregas: 'Wireframes | Design UI | Aprovação', responsavel: 'Designer UI/UX', custoEstimado: 7500 },
      { codigo: '1.3', fase: 'Desenvolvimento', entregas: 'Front-end | Back-end | ERP', responsavel: 'Devs', custoEstimado: 21000 },
      { codigo: '1.4', fase: 'Testes (QA)', entregas: 'Plano | Execução | Correção', responsavel: 'QA', custoEstimado: 6500 },
      { codigo: '1.5', fase: 'Implantação', entregas: 'UAT | Go-Live | Suporte', responsavel: 'DevOps / PM', custoEstimado: 4000 }
    ],
    prazoTotalSemanas: 8,
    semanaAtual: 3,
    marcosProjeto: [
      { id: 1, marco: 'M1: Protótipo UI/UX Aprovado', semanaPrevista: 2, status: 'Concluído' },
      { id: 2, marco: 'M2: Integração Back-end', semanaPrevista: 5, status: 'Em Andamento' },
      { id: 3, marco: 'M3: UAT', semanaPrevista: 7, status: 'Pendente' },
      { id: 4, marco: 'M4: Go-Live Oficial', semanaPrevista: 8, status: 'Pendente' }
    ],
    tarefasGantt: [
      { id: 1, nome: '1. Planejamento', dias: 7, inicioSem: 1, duracaoSem: 1, cor: '#3b82f6' },
      { id: 2, nome: '2. Requisitos', dias: 5, inicioSem: 2, duracaoSem: 1, cor: '#10b981' },
      { id: 3, nome: '3. Design UI/UX', dias: 10, inicioSem: 2, duracaoSem: 2, cor: '#f59e0b' },
      { id: 4, nome: '4. Desenvolvimento', dias: 20, inicioSem: 4, duracaoSem: 3, cor: '#8b5cf6' },
      { id: 5, nome: '5. Testes QA', dias: 10, inicioSem: 6, duracaoSem: 2, cor: '#ec4899' },
      { id: 6, nome: '6. Go-Live', dias: 5, inicioSem: 8, duracaoSem: 1, cor: '#ef4444' }
    ],
    recursosAlocados: [
      { id: 1, recurso: 'Dev Fullstack (x2)', tipo: 'Humano', taxaSemanal: 3500, semanasAlocadas: 6, inicioSem: 3 },
      { id: 2, recurso: 'Designer UI/UX (x1)', tipo: 'Humano', taxaSemanal: 2200, semanasAlocadas: 3, inicioSem: 2 },
      { id: 3, recurso: 'Analista QA (x1)', tipo: 'Humano', taxaSemanal: 2000, semanasAlocadas: 3, inicioSem: 5 },
      { id: 4, recurso: 'Cluster AWS', tipo: 'Infraestrutura', taxaSemanal: 450, semanasAlocadas: 8, inicioSem: 1 }
    ],
    custoRecursosHumanos: 33600.00,
    custoFerramentasInfra: 6400.00,
    orcamentoBAC: 45000.00,
    reservaContingencia: 5000.00,
    reservaGerencial: 3000.00,
    riscos: [
      { id: 1, risco: 'Indisponibilidade de dev chave', impacto: 'Alto', probabilidade: 'Média', resposta: 'Mitigar: Par de backup' },
      { id: 2, risco: 'Aumento de escopo', impacto: 'Alto', probabilidade: 'Alta', resposta: 'Evitar: Aprovação no CCB' },
      { id: 3, risco: 'Falha na integração fiscal', impacto: 'Médio', probabilidade: 'Baixa', resposta: 'Mitigar: Testes sandbox' }
    ],
    comunicacao: [
      { id: 1, stakeholder: 'Patrocinador', informacao: 'Progresso, Riscos, EVM', frequencia: 'Semanal', canal: 'E-mail + Reunião' },
      { id: 2, stakeholder: 'Equipe', informacao: 'Tarefas, Impedimentos', frequencia: 'Diária', canal: 'Daily / Slack' },
      { id: 3, stakeholder: 'Diretoria', informacao: 'Marcos Atingidos', frequencia: 'Quinzenal', canal: 'Call' }
    ],
    progressoRealPct: 35,
    custoRealAC: 16500.00,
    padroesQualidade: '• Cobertura de 85% em testes\n• Tempo de resposta < 1.8s\n• Zero bugs críticos no UAT',
    planoAquisicoes: 'Gateway de pagamento e certificado digital SLA 99.9%.',
    premissasRestricoes: 'Premissa: Contabilidade disponível na sem. 4.\nRestrição: Orçamento max R$ 50.000.',
    statusAprovacao: 'Aprovado pela Diretoria (Baseline Fixada)'
  });

  const [novoStakeholder, setNovoStakeholder] = useState({ nome: '', papel: '', responsabilidade: '', interesse: 'Alto', influencia: 'Média' });
  const [novoMarco, setNovoMarco] = useState({ marco: '', semanaPrevista: 1, status: 'Pendente' });
  const [novoRecurso, setNovoRecurso] = useState({ recurso: '', tipo: 'Humano', taxaSemanal: '', semanasAlocadas: '', inicioSem: 1 });
  const [novoRisco, setNovoRisco] = useState({ risco: '', impacto: 'Alto', probabilidade: 'Média', resposta: '' });
  const [novaComunicacao, setNovaComunicacao] = useState({ stakeholder: '', informacao: '', frequencia: '', canal: '' });

  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const bacTotal = Number(projeto.orcamentoBAC) || 1;
  const pvCalculado = ((Number(projeto.semanaAtual) / Number(projeto.prazoTotalSemanas)) * bacTotal);
  const evCalculado = ((Number(projeto.progressoRealPct) / 100) * bacTotal);
  const acAtual = Number(projeto.custoRealAC) || 1;
  const cpi = (evCalculado / acAtual).toFixed(2);
  const spi = (evCalculado / (pvCalculado || 1)).toFixed(2);
  const eac = (bacTotal / (Number(cpi) || 1)).toFixed(2);

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };
  const boxGuiaStyle = { backgroundColor: '#f0fdf4', borderLeft: '4px solid #16a34a', padding: '16px', borderRadius: '12px', marginBottom: '20px', color: '#166534', fontSize: '13px', lineHeight: '1.6', boxSizing: 'border-box', wordBreak: 'break-word' };

  const avancarPasso = () => {
    if (passo < 10) {
      setPasso(p => p + 1);
      if (typeof mostrarToast === 'function') mostrarToast(`Passo ${passo} concluído!`, 'sucesso');
    } else {
      setVisao('dash');
      if (typeof mostrarToast === 'function') mostrarToast('Plano de Projeto completo!', 'sucesso');
    }
  };

  const voltarPasso = () => {
    if (passo > 1) setPasso(p => p - 1);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.4s' }}>
      
      {/* CABEÇALHO SUPERIOR */}
      <div className="no-print" style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px 24px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #2563eb', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#3b82f6', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>PMBOK 7ª ED.</span>
            <span style={{ fontSize: '16px', fontWeight: '800', wordBreak: 'break-word' }}>Plano de Gerenciamento do Projeto</span>
          </div>
          <div style={{ fontSize: '12.5px', color: '#94a3b8', wordBreak: 'break-word' }}>
            Projeto: <strong style={{ color: '#fff' }}>{projeto.titulo}</strong> • PM: <strong>{projeto.gerente}</strong>
          </div>
        </div>

        {/* NAVEGAÇÃO DE VISÕES */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '12px', boxSizing: 'border-box' }}>
          {[
            { id: 'tap', label: '📜 TAP' },
            { id: 'dash', label: '📊 EVM' },
            { id: 'passos', label: `📝 10 Passos (${passo}/10)` },
            { id: 'governanca', label: '🛡️ Governança' },
            { id: 'gantt', label: '📈 Gantt' },
            { id: 'imprimir', label: '🖨️ Relatório' }
          ].map(aba => (
            <button
              key={aba.id} onClick={() => setVisao(aba.id)}
              style={{
                backgroundColor: visao === aba.id ? '#2563eb' : 'transparent', color: visao === aba.id ? 'white' : '#cbd5e1',
                border: 'none', padding: '8px 12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '11.5px', transition: 'all 0.2s', boxSizing: 'border-box', wordBreak: 'break-word'
              }}
            >
              {aba.label}
            </button>
          ))}
        </div>
      </div>

      {/* CORPO PRINCIPAL */}
      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '0 0 16px 16px', border: '1px solid #e2e8f0', borderTop: 'none', minHeight: '500px', boxSizing: 'border-box', width: '100%' }}>

        {/* VISÃO 0: TAP */}
        {visao === 'tap' && (
          <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '18px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px', wordBreak: 'break-word' }}>📜 Termo de Abertura (Project Charter)</h3>
              <div style={{ ...boxGuiaStyle, backgroundColor: '#eff6ff', borderLeftColor: '#3b82f6', color: '#1e3a8a' }}>
                O <strong>Termo de Abertura do Projeto (TAP)</strong> autoriza a existência do projeto e concede ao Gerente a autoridade para aplicar recursos.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '16px', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0, gridColumn: '1 / -1' }}>
                  <label htmlFor="tapTitulo" style={labelStyle}>Nome do Projeto:</label>
                  <input id="tapTitulo" name="tapTitulo" style={inputStyle} value={projeto.titulo} onChange={e => setProjeto({...projeto, titulo: e.target.value})} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label htmlFor="tapGerente" style={labelStyle}>Gerente (Project Manager):</label>
                  <input id="tapGerente" name="tapGerente" style={inputStyle} value={projeto.gerente} onChange={e => setProjeto({...projeto, gerente: e.target.value})} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label htmlFor="tapSponsor" style={labelStyle}>Patrocinador (Sponsor):</label>
                  <input id="tapSponsor" name="tapSponsor" style={inputStyle} value={projeto.patrocinador} onChange={e => setProjeto({...projeto, patrocinador: e.target.value})} />
                </div>
                <div style={{ minWidth: 0, gridColumn: '1 / -1' }}>
                  <label htmlFor="tapJust" style={labelStyle}>Justificativa de Negócio:</label>
                  <textarea id="tapJust" name="tapJust" rows="3" style={inputStyle} value={projeto.justificativa} onChange={e => setProjeto({...projeto, justificativa: e.target.value})} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label htmlFor="tapPrazo" style={labelStyle}>Prazo (Semanas):</label>
                  <input id="tapPrazo" name="tapPrazo" type="number" style={inputStyle} value={projeto.prazoTotalSemanas} onChange={e => setProjeto({...projeto, prazoTotalSemanas: e.target.value})} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label htmlFor="tapOrc" style={{...labelStyle, color: '#16a34a'}}>Orçamento BAC (R$):</label>
                  <input id="tapOrc" name="tapOrc" type="number" style={inputStyle} value={projeto.orcamentoBAC} onChange={e => setProjeto({...projeto, orcamentoBAC: e.target.value})} />
                </div>
              </div>

              <div style={{ marginTop: '20px', padding: '18px', backgroundColor: '#f1f5f9', borderRadius: '12px', border: '1px dashed #94a3b8', textAlign: 'center', boxSizing: 'border-box' }}>
                <strong style={{ display: 'block', fontSize: '13.5px', marginBottom: '8px', wordBreak: 'break-word' }}>Assinatura de Autorização Executiva</strong>
                <p style={{ fontStyle: 'italic', color: '#64748b', fontSize: '12.5px', wordBreak: 'break-word' }}>Assinado eletronicamente por {projeto.patrocinador} em {new Date().toLocaleDateString('pt-BR')}.</p>
                <button onClick={() => setVisao('passos')} style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', boxSizing: 'border-box' }}>
                  Projeto Autorizado! Iniciar Planejamento (10 Passos) →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VISÃO 1: DASHBOARD EVM */}
        {visao === 'dash' && (
          <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '17px', fontWeight: '800', wordBreak: 'break-word' }}>Painel Executivo (Project Overview)</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b', wordBreak: 'break-word' }}>Consolidação de Escopo, Prazos, Custos e Qualidade.</p>
              </div>
              <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '11.5px', border: '1px solid #bbf7d0', flexShrink: 0 }}>
                ✓ {projeto.statusAprovacao}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', boxSizing: 'border-box' }}>
              <div style={cardStyle}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '800' }}>ORÇAMENTO BASE (BAC)</span>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#0f172a', margin: '4px 0', wordBreak: 'break-word' }}>R$ {formatMoeda(projeto.orcamentoBAC)}</div>
                <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600', wordBreak: 'break-word' }}>+ R$ {formatMoeda(projeto.reservaContingencia)} Contingência</span>
              </div>
              <div style={cardStyle}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '800' }}>VALOR PLANEJADO (PV)</span>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#2563eb', margin: '4px 0', wordBreak: 'break-word' }}>R$ {formatMoeda(pvCalculado)}</div>
                <span style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>Semana {projeto.semanaAtual} de {projeto.prazoTotalSemanas}</span>
              </div>
              <div style={cardStyle}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '800' }}>VALOR AGREGADO (EV)</span>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#10b981', margin: '4px 0', wordBreak: 'break-word' }}>R$ {formatMoeda(evCalculado)}</div>
                <span style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>Progresso Físico: {projeto.progressoRealPct}%</span>
              </div>
              <div style={cardStyle}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '800' }}>CUSTO REAL (AC)</span>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#ef4444', margin: '4px 0', wordBreak: 'break-word' }}>R$ {formatMoeda(projeto.custoRealAC)}</div>
                <span style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>EAC: R$ {formatMoeda(eac)}</span>
              </div>
              <div style={{ ...cardStyle, backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
                <span style={{ fontSize: '10px', color: '#1e40af', fontWeight: '800' }}>DESEMPENHO</span>
                <div style={{ fontSize: '18px', fontWeight: '900', margin: '4px 0', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <span style={{ color: Number(cpi) >= 1 ? '#16a34a' : '#ef4444' }}>CPI: {cpi}</span>
                  <span style={{ color: Number(spi) >= 1 ? '#16a34a' : '#f59e0b' }}>SPI: {spi}</span>
                </div>
                <span style={{ fontSize: '11px', color: '#1e3a8a', fontWeight: '600', wordBreak: 'break-word' }}>{Number(cpi) >= 1 ? '🟢 Custo OK' : '🔴 Estouro'}</span>
              </div>
            </div>
          </div>
        )}

        {/* VISÃO 2: OS 10 PASSOS */}
        {visao === 'passos' && (
          <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>
            
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', backgroundColor: 'white', padding: '10px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)', boxSizing: 'border-box' }}>
              {[
                'Objetivos', 'Escopo', 'Stakeholders', 'WBS', 'Cronograma', 
                'Recursos', 'Custos', 'Riscos', 'Comunicação', 'EVM'
              ].map((txt, i) => {
                const stepNum = i + 1;
                const isActive = passo === stepNum;
                return (
                  <button
                    key={stepNum} onClick={() => setPasso(stepNum)}
                    style={{
                      flex: '1 1 90px', padding: '8px 10px', borderRadius: '8px', border: 'none',
                      fontSize: '11.5px', fontWeight: isActive ? '800' : '600', cursor: 'pointer',
                      backgroundColor: isActive ? '#0f172a' : 'transparent',
                      color: isActive ? 'white' : '#64748b', transition: 'all 0.2s', boxSizing: 'border-box', wordBreak: 'break-word'
                    }}
                  >
                    {stepNum}. {txt}
                  </button>
                );
              })}
            </div>

            <div style={cardStyle}>
              {passo === 1 && (
                <div style={{ boxSizing: 'border-box' }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '17px', color: '#0f172a', wordBreak: 'break-word' }}>1. Objetivos do Projeto (SMART)</h3>
                  <div style={boxGuiaStyle}>Metodologia SMART: Específico, Mensurável, Atingível, Relevante e Temporal.</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '14px', boxSizing: 'border-box' }}>
                    <div style={{ minWidth: 0, gridColumn: '1 / -1' }}>
                      <label style={labelStyle}>S — Específico:</label>
                      <input style={inputStyle} value={projeto.objetivoEspecifico} onChange={e => setProjeto({...projeto, objetivoEspecifico: e.target.value})} />
                    </div>
                    <div style={{ minWidth: 0 }}><label style={labelStyle}>M — Mensurável:</label><input style={inputStyle} value={projeto.objetivoMensuravel} onChange={e => setProjeto({...projeto, objetivoMensuravel: e.target.value})} /></div>
                    <div style={{ minWidth: 0 }}><label style={labelStyle}>A — Atingível:</label><input style={inputStyle} value={projeto.objetivoAtingivel} onChange={e => setProjeto({...projeto, objetivoAtingivel: e.target.value})} /></div>
                    <div style={{ minWidth: 0 }}><label style={labelStyle}>R — Relevante:</label><input style={inputStyle} value={projeto.objetivoRelevante} onChange={e => setProjeto({...projeto, objetivoRelevante: e.target.value})} /></div>
                    <div style={{ minWidth: 0 }}><label style={labelStyle}>T — Temporal:</label><input style={inputStyle} value={projeto.objetivoTemporal} onChange={e => setProjeto({...projeto, objetivoTemporal: e.target.value})} /></div>
                  </div>
                </div>
              )}

              {passo === 2 && (
                <div style={{ boxSizing: 'border-box' }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '17px', color: '#0f172a', wordBreak: 'break-word' }}>2. Gerenciamento do Escopo</h3>
                  <div style={boxGuiaStyle}>Evite o <em>Scope Creep</em> documentando o que está dentro e fora.</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' }}>
                    <div style={{ minWidth: 0 }}><label style={labelStyle}>Declaração Geral:</label><input style={inputStyle} value={projeto.declaracaoEscopo} onChange={e => setProjeto({...projeto, declaracaoEscopo: e.target.value})} /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '14px', boxSizing: 'border-box' }}>
                      <div style={{ minWidth: 0 }}><label style={{...labelStyle, color: '#16a34a'}}>✅ In Scope (Dentro):</label><textarea rows="4" style={inputStyle} value={projeto.escopoDentro} onChange={e => setProjeto({...projeto, escopoDentro: e.target.value})} /></div>
                      <div style={{ minWidth: 0 }}><label style={{...labelStyle, color: '#ef4444'}}>❌ Out of Scope (Fora):</label><textarea rows="4" style={inputStyle} value={projeto.escopoFora} onChange={e => setProjeto({...projeto, escopoFora: e.target.value})} /></div>
                    </div>
                    <div style={{ minWidth: 0 }}><label style={labelStyle}>📦 Entregáveis:</label><input style={inputStyle} value={projeto.entregaveisPrincipais} onChange={e => setProjeto({...projeto, entregaveisPrincipais: e.target.value})} /></div>
                  </div>
                </div>
              )}

              {passo === 3 && (
                <div style={{ boxSizing: 'border-box' }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '17px', color: '#0f172a', wordBreak: 'break-word' }}>3. Stakeholders & Papéis</h3>
                  <div style={boxGuiaStyle}>Mapeie o Interesse e Influência.</div>
                  <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '16px', boxSizing: 'border-box' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '550px' }}>
                      <thead style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '11.5px' }}>
                        <tr>
                          <th style={{ padding: '10px' }}>Nome / Cargo</th>
                          <th style={{ padding: '10px' }}>Papel</th>
                          <th style={{ padding: '10px' }}>Resp.</th>
                          <th style={{ padding: '10px', textAlign: 'center' }}>Interesse</th>
                          <th style={{ padding: '10px', textAlign: 'center' }}>Influência</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projeto.stakeholders.map((s, idx) => (
                          <tr key={s.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '8px' }}><input style={inputStyle} value={s.nome} onChange={e => { const c = [...projeto.stakeholders]; c[idx].nome = e.target.value; setProjeto({...projeto, stakeholders: c}); }} /></td>
                            <td style={{ padding: '8px' }}><input style={inputStyle} value={s.papel} onChange={e => { const c = [...projeto.stakeholders]; c[idx].papel = e.target.value; setProjeto({...projeto, stakeholders: c}); }} /></td>
                            <td style={{ padding: '8px' }}><input style={inputStyle} value={s.responsabilidade} onChange={e => { const c = [...projeto.stakeholders]; c[idx].responsabilidade = e.target.value; setProjeto({...projeto, stakeholders: c}); }} /></td>
                            <td style={{ padding: '8px', textAlign: 'center' }}><select style={inputStyle} value={s.interesse} onChange={e => { const c = [...projeto.stakeholders]; c[idx].interesse = e.target.value; setProjeto({...projeto, stakeholders: c}); }}><option value="Alto">Alto</option><option value="Médio">Médio</option><option value="Baixo">Baixo</option></select></td>
                            <td style={{ padding: '8px', textAlign: 'center' }}><select style={inputStyle} value={s.influencia} onChange={e => { const c = [...projeto.stakeholders]; c[idx].influencia = e.target.value; setProjeto({...projeto, stakeholders: c}); }}><option value="Alta">Alta</option><option value="Média">Média</option><option value="Baixa">Baixa</option></select></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {passo === 4 && (
                <div style={{ boxSizing: 'border-box' }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '17px', color: '#0f172a', wordBreak: 'break-word' }}>4. WBS / Estrutura Analítica do Projeto (EAP)</h3>
                  <div style={boxGuiaStyle}>Quebre o escopo em pacotes menores (regra dos 100%).</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', boxSizing: 'border-box' }}>
                    {projeto.wbsPacotes.map((pacote, idx) => (
                      <div key={pacote.codigo} style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderTop: '4px solid #3b82f6', borderRadius: '12px', padding: '16px', boxSizing: 'border-box', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', boxSizing: 'border-box' }}>
                          <span style={{ fontWeight: '900', color: '#1e40af', fontSize: '13.5px' }}>{pacote.codigo}</span>
                          <input style={{ ...inputStyle, fontWeight: 'bold', color: '#1e40af', padding: '6px 10px' }} value={pacote.fase} onChange={e => {
                            const copia = [...projeto.wbsPacotes]; copia[idx].fase = e.target.value; setProjeto({...projeto, wbsPacotes: copia});
                          }} />
                        </div>
                        <label style={labelStyle}>Pacotes de Trabalho:</label>
                        <textarea rows="3" style={{ ...inputStyle, marginBottom: '10px' }} value={pacote.entregas} onChange={e => {
                          const copia = [...projeto.wbsPacotes]; copia[idx].entregas = e.target.value; setProjeto({...projeto, wbsPacotes: copia});
                        }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px', boxSizing: 'border-box' }}>
                          <span style={{ fontSize: '11.5px', color: '#64748b', wordBreak: 'break-word' }}>Resp: <strong>{pacote.responsavel}</strong></span>
                          <span style={{ color: '#16a34a', fontWeight: 'bold', wordBreak: 'break-word' }}>R$ {formatMoeda(pacote.custoEstimado)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {passo === 5 && (
                <div style={{ boxSizing: 'border-box' }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '17px', color: '#0f172a', wordBreak: 'break-word' }}>5. Cronograma e Marcos (Milestones)</h3>
                  <div style={boxGuiaStyle}>Marcos possuem duração zero. Servirão para checagens e aparecerão no Gráfico de Gantt.</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '12px', marginBottom: '16px', boxSizing: 'border-box' }}>
                    {projeto.marcosProjeto.map((m, idx) => (
                      <div key={m.id} style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', boxSizing: 'border-box', minWidth: 0 }}>
                        <label style={labelStyle}>Marco (Milestone):</label>
                        <input style={{ ...inputStyle, fontWeight: 'bold', marginBottom: '8px' }} value={m.marco} onChange={e => {
                          const copia = [...projeto.marcosProjeto]; copia[idx].marco = e.target.value; setProjeto({...projeto, marcosProjeto: copia});
                        }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '4px', boxSizing: 'border-box' }}>
                          <span style={{ fontSize: '11.5px', wordBreak: 'break-word' }}>Semana Alvo: <strong>{m.semanaPrevista}</strong></span>
                          <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px', backgroundColor: m.status === 'Concluído' ? '#dcfce7' : '#fef3c7', color: m.status === 'Concluído' ? '#166534' : '#92400e', fontWeight: 'bold', wordBreak: 'break-word' }}>{m.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {passo === 6 && (
                <div style={{ boxSizing: 'border-box' }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '17px', color: '#0f172a', wordBreak: 'break-word' }}>6. Gestão de Recursos</h3>
                  <div style={boxGuiaStyle}>Alocação de pessoal e infraestrutura para calcular orçamentos.</div>
                  <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '16px', boxSizing: 'border-box' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '550px' }}>
                      <thead style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '11.5px' }}>
                        <tr>
                          <th style={{ padding: '10px' }}>Recurso</th>
                          <th style={{ padding: '10px' }}>Tipo</th>
                          <th style={{ padding: '10px' }}>Custo/Sem</th>
                          <th style={{ padding: '10px' }}>Semanas</th>
                          <th style={{ padding: '10px' }}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projeto.recursosAlocados.map((r, idx) => (
                          <tr key={r.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '8px' }}><input style={inputStyle} value={r.recurso} onChange={e => { const c = [...projeto.recursosAlocados]; c[idx].recurso = e.target.value; setProjeto({...projeto, recursosAlocados: c}); }} /></td>
                            <td style={{ padding: '8px' }}><select style={inputStyle} value={r.tipo} onChange={e => { const c = [...projeto.recursosAlocados]; c[idx].tipo = e.target.value; setProjeto({...projeto, recursosAlocados: c}); }}><option value="Humano">Humano</option><option value="Infraestrutura">Infra</option></select></td>
                            <td style={{ padding: '8px' }}><input style={inputStyle} type="number" value={r.taxaSemanal} onChange={e => { const c = [...projeto.recursosAlocados]; c[idx].taxaSemanal = e.target.value; setProjeto({...projeto, recursosAlocados: c}); }} /></td>
                            <td style={{ padding: '8px' }}><input style={inputStyle} type="number" value={r.semanasAlocadas} onChange={e => { const c = [...projeto.recursosAlocados]; c[idx].semanasAlocadas = e.target.value; setProjeto({...projeto, recursosAlocados: c}); }} /></td>
                            <td style={{ padding: '8px', fontWeight: 'bold', color: '#2563eb', whiteSpace: 'nowrap' }}>R$ {formatMoeda(r.taxaSemanal * r.semanasAlocadas)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {passo === 7 && (
                <div style={{ boxSizing: 'border-box' }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '17px', color: '#0f172a', wordBreak: 'break-word' }}>7. Orçamento e Linha de Base de Custos (BAC)</h3>
                  <div style={boxGuiaStyle}>Separe custos diretos das reservas de contingência e gerenciais.</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '14px', boxSizing: 'border-box' }}>
                    <div style={{ minWidth: 0 }}><label style={labelStyle}>Pessoal (R$):</label><input style={inputStyle} type="number" value={projeto.custoRecursosHumanos} onChange={e => setProjeto({...projeto, custoRecursosHumanos: e.target.value})} /></div>
                    <div style={{ minWidth: 0 }}><label style={labelStyle}>Infra/Materiais (R$):</label><input style={inputStyle} type="number" value={projeto.custoFerramentasInfra} onChange={e => setProjeto({...projeto, custoFerramentasInfra: e.target.value})} /></div>
                    <div style={{ minWidth: 0 }}><label style={{...labelStyle, color: '#2563eb'}}>Orçamento Base (BAC):</label><input style={{...inputStyle, borderColor: '#bfdbfe', backgroundColor: '#eff6ff'}} type="number" value={projeto.orcamentoBAC} onChange={e => setProjeto({...projeto, orcamentoBAC: e.target.value})} /></div>
                    <div style={{ minWidth: 0 }}><label style={{...labelStyle, color: '#d97706'}}>Reserva Contingência:</label><input style={{...inputStyle, borderColor: '#fde68a', backgroundColor: '#fffbeb'}} type="number" value={projeto.reservaContingencia} onChange={e => setProjeto({...projeto, reservaContingencia: e.target.value})} /></div>
                    <div style={{ minWidth: 0 }}><label style={{...labelStyle, color: '#059669'}}>Reserva Gerencial:</label><input style={{...inputStyle, borderColor: '#a7f3d0', backgroundColor: '#ecfdf5'}} type="number" value={projeto.reservaGerencial} onChange={e => setProjeto({...projeto, reservaGerencial: e.target.value})} /></div>
                  </div>
                </div>
              )}

              {passo === 8 && (
                <div style={{ boxSizing: 'border-box' }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '17px', color: '#0f172a', wordBreak: 'break-word' }}>8. Gestão de Riscos</h3>
                  <div style={boxGuiaStyle}>Mapeie Impacto e Probabilidade e defina respostas (Mitigar, Evitar, Aceitar, Transferir).</div>
                  <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '16px', boxSizing: 'border-box' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '550px' }}>
                      <thead style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '11.5px' }}>
                        <tr>
                          <th style={{ padding: '10px' }}>Risco</th>
                          <th style={{ padding: '10px', width: '100px', textAlign: 'center' }}>Impacto</th>
                          <th style={{ padding: '10px', width: '100px', textAlign: 'center' }}>Probab.</th>
                          <th style={{ padding: '10px' }}>Resposta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projeto.riscos.map((r, idx) => (
                          <tr key={r.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '8px' }}><input style={inputStyle} value={r.risco} onChange={e => { const c = [...projeto.riscos]; c[idx].risco = e.target.value; setProjeto({...projeto, riscos: c}); }} /></td>
                            <td style={{ padding: '8px', textAlign: 'center' }}><select style={inputStyle} value={r.impacto} onChange={e => { const c = [...projeto.riscos]; c[idx].impacto = e.target.value; setProjeto({...projeto, riscos: c}); }}><option value="Alto">Alto</option><option value="Médio">Médio</option><option value="Baixo">Baixo</option></select></td>
                            <td style={{ padding: '8px', textAlign: 'center' }}><select style={inputStyle} value={r.probabilidade} onChange={e => { const c = [...projeto.riscos]; c[idx].probabilidade = e.target.value; setProjeto({...projeto, riscos: c}); }}><option value="Alta">Alta</option><option value="Média">Média</option><option value="Baixa">Baixa</option></select></td>
                            <td style={{ padding: '8px' }}><input style={inputStyle} value={r.resposta} onChange={e => { const c = [...projeto.riscos]; c[idx].resposta = e.target.value; setProjeto({...projeto, riscos: c}); }} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {passo === 9 && (
                <div style={{ boxSizing: 'border-box' }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '17px', color: '#0f172a', wordBreak: 'break-word' }}>9. Plano de Comunicação</h3>
                  <div style={boxGuiaStyle}>Defina quem recebe, o quê, quando e por onde.</div>
                  <div style={{ overflowX: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '16px', boxSizing: 'border-box' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '550px' }}>
                      <thead style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '11.5px' }}>
                        <tr>
                          <th style={{ padding: '10px' }}>Stakeholder</th>
                          <th style={{ padding: '10px' }}>Informação</th>
                          <th style={{ padding: '10px' }}>Frequência</th>
                          <th style={{ padding: '10px' }}>Canal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projeto.comunicacao.map((c, idx) => (
                          <tr key={c.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '8px' }}><input style={inputStyle} value={c.stakeholder} onChange={e => { const copia = [...projeto.comunicacao]; copia[idx].stakeholder = e.target.value; setProjeto({...projeto, comunicacao: copia}); }} /></td>
                            <td style={{ padding: '8px' }}><input style={inputStyle} value={c.informacao} onChange={e => { const copia = [...projeto.comunicacao]; copia[idx].informacao = e.target.value; setProjeto({...projeto, comunicacao: copia}); }} /></td>
                            <td style={{ padding: '8px' }}><input style={inputStyle} value={c.frequencia} onChange={e => { const copia = [...projeto.comunicacao]; copia[idx].frequencia = e.target.value; setProjeto({...projeto, comunicacao: copia}); }} /></td>
                            <td style={{ padding: '8px' }}><input style={inputStyle} value={c.canal} onChange={e => { const copia = [...projeto.comunicacao]; copia[idx].canal = e.target.value; setProjeto({...projeto, comunicacao: copia}); }} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {passo === 10 && (
                <div style={{ boxSizing: 'border-box' }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: '17px', color: '#0f172a', wordBreak: 'break-word' }}>10. Monitoramento EVM (Earned Value)</h3>
                  <div style={boxGuiaStyle}>Atualize a semana e o progresso para calcular CPI e SPI.</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', marginBottom: '16px', boxSizing: 'border-box' }}>
                    <div style={{ minWidth: 0 }}><label style={labelStyle}>Semana Atual:</label><input style={inputStyle} type="number" max={projeto.prazoTotalSemanas} value={projeto.semanaAtual} onChange={e => setProjeto({...projeto, semanaAtual: e.target.value})} /></div>
                    <div style={{ minWidth: 0 }}><label style={labelStyle}>Progresso Real (%):</label><input style={inputStyle} type="number" max="100" value={projeto.progressoRealPct} onChange={e => setProjeto({...projeto, progressoRealPct: e.target.value})} /></div>
                    <div style={{ minWidth: 0 }}><label style={labelStyle}>Custo Real (AC - R$):</label><input style={inputStyle} type="number" value={projeto.custoRealAC} onChange={e => setProjeto({...projeto, custoRealAC: e.target.value})} /></div>
                  </div>
                  <div style={{ backgroundColor: '#0f172a', padding: '18px', borderRadius: '12px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px', color: 'white', boxSizing: 'border-box' }}>
                    <div style={{ textAlign: 'center', minWidth: 0 }}><div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>PV</div><div style={{ fontSize: '16px', fontWeight: '900', color: '#38bdf8', wordBreak: 'break-word' }}>R$ {formatMoeda(pvCalculado)}</div></div>
                    <div style={{ textAlign: 'center', minWidth: 0 }}><div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>EV</div><div style={{ fontSize: '16px', fontWeight: '900', color: '#10b981', wordBreak: 'break-word' }}>R$ {formatMoeda(evCalculado)}</div></div>
                    <div style={{ textAlign: 'center', minWidth: 0 }}><div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>CPI</div><div style={{ fontSize: '16px', fontWeight: '900', color: Number(cpi) >= 1 ? '#10b981' : '#ef4444', wordBreak: 'break-word' }}>{cpi}</div></div>
                    <div style={{ textAlign: 'center', minWidth: 0 }}><div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>SPI</div><div style={{ fontSize: '16px', fontWeight: '900', color: Number(spi) >= 1 ? '#10b981' : '#f59e0b', wordBreak: 'break-word' }}>{spi}</div></div>
                  </div>
                </div>
              )}

              {/* BOTÕES DE NAVEGAÇÃO DOS PASSOS */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px', flexWrap: 'wrap', gap: '10px', boxSizing: 'border-box' }}>
                <button type="button" onClick={voltarPasso} disabled={passo === 1} style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 18px', borderRadius: '10px', fontWeight: 'bold', cursor: passo === 1 ? 'not-allowed' : 'pointer', opacity: passo === 1 ? 0.5 : 1, fontSize: '12.5px', boxSizing: 'border-box' }}>
                  ← Etapa Anterior
                </button>
                <button type="button" onClick={avancarPasso} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 22px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12.5px', boxShadow: '0 4px 6px rgba(37,99,235,0.2)', boxSizing: 'border-box' }}>
                  {passo === 10 ? 'Concluir e Ver Dashboard 📊' : `Salvar e Ir para Etapa ${passo + 1} →`}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* VISÃO 3: GOVERNANÇA */}
        {visao === 'governanca' && (
          <div className="no-print" style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', color: '#0f172a', wordBreak: 'break-word' }}>Integração, Qualidade, Aquisições e Aprovações</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '16px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0, gridColumn: '1 / -1' }}>
                <label style={labelStyle}>Visão Geral Executiva:</label>
                <textarea rows="2" style={inputStyle} value={projeto.visaoGeral} onChange={e => setProjeto({...projeto, visaoGeral: e.target.value})} />
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={{...labelStyle, color: '#2563eb'}}>Plano de Qualidade:</label>
                <textarea rows="4" style={inputStyle} value={projeto.padroesQualidade} onChange={e => setProjeto({...projeto, padroesQualidade: e.target.value})} />
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={{...labelStyle, color: '#0f766e'}}>Premissas e Restrições:</label>
                <textarea rows="4" style={inputStyle} value={projeto.premissasRestricoes} onChange={e => setProjeto({...projeto, premissasRestricoes: e.target.value})} />
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Plano de Aquisições:</label>
                <textarea rows="3" style={inputStyle} value={projeto.planoAquisicoes} onChange={e => setProjeto({...projeto, planoAquisicoes: e.target.value})} />
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', boxSizing: 'border-box', minWidth: 0 }}>
                <label style={{...labelStyle, color: '#16a34a'}}>Status Oficial de Aprovação:</label>
                <input style={{ ...inputStyle, marginBottom: '10px' }} value={projeto.patrocinador} onChange={e => setProjeto({...projeto, patrocinador: e.target.value})} placeholder="Sponsor Aprovador" />
                <select style={inputStyle} value={projeto.statusAprovacao} onChange={e => setProjeto({...projeto, statusAprovacao: e.target.value})}>
                  <option value="Aprovado pela Diretoria (Baseline Fixada)">✅ Aprovado (Baseline Fixada)</option>
                  <option value="Em Revisão pelo Comitê (CCB)">⏳ Em Revisão (CCB)</option>
                  <option value="Aguardando Assinatura do Sponsor">📝 Aguardando Assinatura</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* VISÃO 4: GANTT */}
        {visao === 'gantt' && (
          <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#0f172a', wordBreak: 'break-word' }}>📈 Gráfico de Gantt (Tarefas e Marcos)</h3>
              <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 16px 0', wordBreak: 'break-word' }}>Altere a semana inicial e duração para remapear o projeto.</p>
              
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflowX: 'auto', boxSizing: 'border-box' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', color: 'white', fontSize: '11px' }}>
                      <th style={{ padding: '10px 12px', textAlign: 'left', width: '200px' }}>Pacote / Marco</th>
                      <th style={{ padding: '10px', textAlign: 'center', width: '50px' }}>Dias</th>
                      <th style={{ padding: '10px', textAlign: 'center', width: '65px' }}>Início</th>
                      <th style={{ padding: '10px', textAlign: 'center', width: '65px' }}>Dur</th>
                      {Array.from({ length: projeto.prazoTotalSemanas }).map((_, i) => (
                        <th key={i} style={{ padding: '8px', textAlign: 'center', borderLeft: '1px solid #334155', backgroundColor: i + 1 === Number(projeto.semanaAtual) ? '#2563eb' : 'transparent' }}>
                          S{i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {projeto.tarefasGantt.map((t, idx) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 'bold', color: '#334155', fontSize: '12px', wordBreak: 'break-word' }}>{t.nome}</td>
                        <td style={{ padding: '8px', textAlign: 'center', fontSize: '11.5px', color: '#64748b', whiteSpace: 'nowrap' }}>{t.dias}d</td>
                        <td style={{ padding: '8px', textAlign: 'center', whiteSpace: 'nowrap' }}><input type="number" min="1" max={projeto.prazoTotalSemanas} value={t.inicioSem} onChange={e => { const c = [...projeto.tarefasGantt]; c[idx].inicioSem = Number(e.target.value); setProjeto({...projeto, tarefasGantt: c}); }} style={{ width: '45px', padding: '4px', textAlign: 'center', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></td>
                        <td style={{ padding: '8px', textAlign: 'center', whiteSpace: 'nowrap' }}><input type="number" min="1" max={projeto.prazoTotalSemanas} value={t.duracaoSem} onChange={e => { const c = [...projeto.tarefasGantt]; c[idx].duracaoSem = Number(e.target.value); setProjeto({...projeto, tarefasGantt: c}); }} style={{ width: '45px', padding: '4px', textAlign: 'center', borderRadius: '6px', border: '1px solid #cbd5e1' }} /></td>
                        {Array.from({ length: projeto.prazoTotalSemanas }).map((_, semIdx) => {
                          const sNum = semIdx + 1;
                          const ativo = sNum >= t.inicioSem && sNum < t.inicioSem + t.duracaoSem;
                          return (
                            <td key={semIdx} style={{ padding: '6px', borderLeft: '1px dashed #e2e8f0', textAlign: 'center' }}>
                              {ativo && <div style={{ height: '16px', backgroundColor: t.cor, borderRadius: '4px', width: '100%' }} />}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    
                    {projeto.marcosProjeto.map(m => (
                      <tr key={`m_${m.id}`} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#fef3c7' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 'bold', color: '#92400e', fontSize: '11px', wordBreak: 'break-word' }}>🔸 {m.marco}</td>
                        <td colSpan="3" style={{ padding: '8px', textAlign: 'center', fontSize: '11px', color: '#b45309', whiteSpace: 'nowrap' }}>Milestone (Sem {m.semanaPrevista})</td>
                        {Array.from({ length: projeto.prazoTotalSemanas }).map((_, semIdx) => (
                          <td key={semIdx} style={{ padding: '6px', borderLeft: '1px dashed #fde68a', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            {(semIdx + 1) === Number(m.semanaPrevista) && <span style={{ fontSize: '14px' }}>🔸</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* VISÃO 5: RELATÓRIO FINAL */}
        {visao === 'imprimir' && (
          <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', boxSizing: 'border-box' }}>
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px', boxSizing: 'border-box' }}>
              <button onClick={handlePrint} style={{ backgroundColor: '#2563eb', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '13.5px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37,99,235,0.2)', boxSizing: 'border-box' }}>
                🖨️ Imprimir Projeto Completo (Gerar PDF)
              </button>
            </div>

            <div className="print-only-content" style={{ color: 'black', fontFamily: 'serif', boxSizing: 'border-box' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '16px', marginBottom: '24px', boxSizing: 'border-box' }}>
                <h1 style={{ margin: '0 0 8px 0', fontSize: '24px', textTransform: 'uppercase', wordBreak: 'break-word' }}>Plano de Gerenciamento do Projeto</h1>
                <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 'normal', wordBreak: 'break-word' }}>{projeto.titulo}</h2>
              </div>

              <div style={{ marginBottom: '24px', boxSizing: 'border-box' }}>
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '4px', wordBreak: 'break-word' }}>1. Termo de Abertura (TAP)</h3>
                <p style={{ wordBreak: 'break-word' }}><strong>Gerente:</strong> {projeto.gerente} | <strong>Sponsor:</strong> {projeto.patrocinador}</p>
                <p style={{ wordBreak: 'break-word' }}><strong>Justificativa:</strong> {projeto.justificativa}</p>
                <p style={{ wordBreak: 'break-word' }}><strong>Orçamento BAC:</strong> R$ {formatMoeda(projeto.orcamentoBAC)}</p>
              </div>

              <div style={{ marginBottom: '24px', boxSizing: 'border-box' }}>
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '4px', wordBreak: 'break-word' }}>2. Objetivos (SMART)</h3>
                <ul style={{ wordBreak: 'break-word' }}>
                  <li><strong>Específico:</strong> {projeto.objetivoEspecifico}</li>
                  <li><strong>Mensurável:</strong> {projeto.objetivoMensuravel}</li>
                </ul>
              </div>

              <div style={{ marginBottom: '24px', boxSizing: 'border-box' }}>
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '4px', wordBreak: 'break-word' }}>3. WBS / EAP</h3>
                <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left', minWidth: '450px' }}>
                    <thead><tr style={{ backgroundColor: '#eee' }}><th style={{ border: '1px solid #000', padding: '6px' }}>Fase</th><th style={{ border: '1px solid #000', padding: '6px' }}>Pacotes</th><th style={{ border: '1px solid #000', padding: '6px' }}>Resp.</th></tr></thead>
                    <tbody>
                      {projeto.wbsPacotes.map(p => (
                        <tr key={p.codigo}>
                          <td style={{ border: '1px solid #000', padding: '6px', wordBreak: 'break-word' }}><strong>{p.codigo}</strong> {p.fase}</td>
                          <td style={{ border: '1px solid #000', padding: '6px', wordBreak: 'break-word' }}>{p.entregas}</td>
                          <td style={{ border: '1px solid #000', padding: '6px', wordBreak: 'break-word' }}>{p.responsavel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @media print {
          .no-print, button { display: none !important; }
          body { background-color: white !important; margin: 0; }
          .print-only-content { width: 100% !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}