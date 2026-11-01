import React, { useState } from 'react';

export default function SimuladorPMP10Passos({ mostrarToast }) {
  // Controle de Abas Superiores: 'tap' | 'dash' | 'passos' | 'governanca' | 'gantt' | 'imprimir'
  const [visao, setVisao] = useState('tap');
  const [passo, setPasso] = useState(1);

  const [projeto, setProjeto] = useState({
    titulo: 'Redesenho e Lançamento do Portal E-commerce B2B',
    gerente: 'Andre Lopes da Silva',
    patrocinador: 'Diretoria Financeira & Comercial',
    dataInicio: '2026-11-01',
    justificativa: 'Modernizar o canal de vendas corporativas para evitar perda de market share para a concorrência direta.',
    visaoGeral: 'Projeto estratégico para modernizar o canal de vendas corporativas, integrando faturamento NF-e e estoque em tempo real com o ERP.',
    objetivoEspecifico: 'Aumentar o tráfego orgânico e a conversão de pedidos B2B pelo portal.',
    objetivoMensuravel: 'Crescer em 30% os leads qualificados e reduzir abandono de carrinho em 20%.',
    objetivoAtingivel: 'Utilizando a nova arquitetura React/Node e equipe interna dedicada.',
    objetivoRelevante: 'Essencial para expandir a margem líquida e escalar vendas sem aumentar a equipe comercial.',
    objetivoTemporal: 'Concluir até o final da Semana 8 (Go-Live completo).',
    declaracaoEscopo: 'Desenvolvimento completo da frente de loja B2B, painel do cliente e API de integração contábil/fiscal.',
    escopoDentro: '• Prototipação UI/UX e Wireframes\n• Front-end responsivo e Back-end de pedidos\n• Integração com motor de NF-e e Estoque\n• Testes de Carga e Segurança (UAT)',
    escopoFora: '• Migração de bancos de dados legados\n• Aplicativo nativo iOS/Android (fase 2)\n• Suporte técnico 24/7 pós-implantação',
    entregaveisPrincipais: '1. Doc. Requisitos; 2. Ambiente de Homologação; 3. Código em Produção.',
    stakeholders: [
      { id: 1, nome: 'Diretor Comercial', papel: 'Sponsor', responsabilidade: 'Aprovar orçamento, liberar recursos', interesse: 'Alto', influencia: 'Alta' },
      { id: 2, nome: 'Gerente (PM)', papel: 'Líder', responsabilidade: 'Planejar cronograma, controlar EVM', interesse: 'Alto', influencia: 'Alta' },
      { id: 3, nome: 'Tech Lead & Devs', papel: 'Execução', responsabilidade: 'Desenvolver arquitetura, codificar', interesse: 'Alto', influencia: 'Média' },
      { id: 4, nome: 'Clientes Chave', papel: 'Homologador', responsabilidade: 'Validar usabilidade no UAT', interesse: 'Médio', influencia: 'Alta' }
    ],
    wbsPacotes: [
      { codigo: '1.1', fase: 'Gestão do Projeto', entregas: '1.1.1 Planejamento Inicial | 1.1.2 Reuniões | 1.1.3 Relatórios', responsavel: 'Gerente (PM)', custoEstimado: 6000 },
      { codigo: '1.2', fase: 'Design (UI/UX)', entregas: '1.2.1 Wireframes | 1.2.2 Design UI | 1.2.3 Aprovação', responsavel: 'Designer UI/UX', custoEstimado: 7500 },
      { codigo: '1.3', fase: 'Desenvolvimento Core', entregas: '1.3.1 Front-end | 1.3.2 Back-end | 1.3.3 Integração ERP', responsavel: 'Devs Fullstack', custoEstimado: 21000 },
      { codigo: '1.4', fase: 'Testes (QA)', entregas: '1.4.1 Plano Testes | 1.4.2 Execução QA | 1.4.3 Correção', responsavel: 'Analista QA', custoEstimado: 6500 },
      { codigo: '1.5', fase: 'Implantação Final', entregas: '1.5.1 Homologação (UAT) | 1.5.2 Go-Live | 1.5.3 Suporte', responsavel: 'DevOps / PM', custoEstimado: 4000 }
    ],
    prazoTotalSemanas: 8,
    semanaAtual: 3,
    marcosProjeto: [
      { id: 1, marco: 'M1: Protótipo UI/UX Aprovado', semanaPrevista: 2, status: 'Concluído' },
      { id: 2, marco: 'M2: Integração Back-end', semanaPrevista: 5, status: 'Em Andamento' },
      { id: 3, marco: 'M3: Testes de Aceitação (UAT)', semanaPrevista: 7, status: 'Pendente' },
      { id: 4, marco: 'M4: Go-Live Oficial', semanaPrevista: 8, status: 'Pendente' }
    ],
    tarefasGantt: [
      { id: 1, nome: '1. Planejamento', dias: 7, inicioSem: 1, duracaoSem: 1, cor: '#3b82f6' },
      { id: 2, nome: '2. Levantamento Requisitos', dias: 5, inicioSem: 2, duracaoSem: 1, cor: '#10b981' },
      { id: 3, nome: '3. Design UI/UX', dias: 10, inicioSem: 2, duracaoSem: 2, cor: '#f59e0b' },
      { id: 4, nome: '4. Desenvolvimento Core', dias: 20, inicioSem: 4, duracaoSem: 3, cor: '#8b5cf6' },
      { id: 5, nome: '5. Testes Integrados (QA)', dias: 10, inicioSem: 6, duracaoSem: 2, cor: '#ec4899' },
      { id: 6, nome: '6. Implantação (Go-Live)', dias: 5, inicioSem: 8, duracaoSem: 1, cor: '#ef4444' }
    ],
    recursosAlocados: [
      { id: 1, recurso: 'Dev Fullstack Sênior (x2)', tipo: 'Humano', taxaSemanal: 3500, semanasAlocadas: 6, inicioSem: 3 },
      { id: 2, recurso: 'Designer UI/UX Pleno (x1)', tipo: 'Humano', taxaSemanal: 2200, semanasAlocadas: 3, inicioSem: 2 },
      { id: 3, recurso: 'Analista de Qualidade QA (x1)', tipo: 'Humano', taxaSemanal: 2000, semanasAlocadas: 3, inicioSem: 5 },
      { id: 4, recurso: 'Cluster Cloud AWS', tipo: 'Infraestrutura', taxaSemanal: 450, semanasAlocadas: 8, inicioSem: 1 }
    ],
    custoRecursosHumanos: 33600.00,
    custoFerramentasInfra: 6400.00,
    orcamentoBAC: 45000.00,
    reservaContingencia: 5000.00,
    reservaGerencial: 3000.00,
    riscos: [
      { id: 1, risco: 'Indisponibilidade de dev chave', impacto: 'Alto', probabilidade: 'Média', resposta: 'Mitigar: Par de backup técnico' },
      { id: 2, risco: 'Aumento de escopo (Scope Creep)', impacto: 'Alto', probabilidade: 'Alta', resposta: 'Evitar: Aprovação formal no CCB' },
      { id: 3, risco: 'Falha na integração fiscal', impacto: 'Médio', probabilidade: 'Baixa', resposta: 'Mitigar: Testes em sandbox cedo' },
    ],
    comunicacao: [
      { id: 1, stakeholder: 'Patrocinador', informacao: 'Progresso, Riscos, EVM', frequencia: 'Semanal', canal: 'E-mail + Reunião' },
      { id: 2, stakeholder: 'Equipe do Projeto', informacao: 'Tarefas, Impedimentos', frequencia: 'Diária', canal: 'Daily / Slack' },
      { id: 3, stakeholder: 'Clientes / Diretoria', informacao: 'Marcos Atingidos', frequencia: 'Quinzenal', canal: 'Call + Relatório' },
    ],
    progressoRealPct: 35,
    custoRealAC: 16500.00,
    padroesQualidade: '• Cobertura de 85% em testes\n• Tempo de resposta < 1.8s\n• Zero bugs críticos no UAT',
    planoAquisicoes: 'Gateway de pagamento e certificado digital via fornecedor externo SLA 99.9%.',
    premissasRestricoes: 'Premissa: Contabilidade disponível na sem. 4.\nRestrição: Orçamento máximo R$ 50.000.',
    statusAprovacao: 'Aprovado pela Diretoria (Baseline Fixada)'
  });

  // Estados dos novos inputs
  const [novoStakeholder, setNovoStakeholder] = useState({ nome: '', papel: '', responsabilidade: '', interesse: 'Alto', influencia: 'Média' });
  const [novoMarco, setNovoMarco] = useState({ marco: '', semanaPrevista: 1, status: 'Pendente' });
  const [novoRecurso, setNovoRecurso] = useState({ recurso: '', tipo: 'Humano', taxaSemanal: '', semanasAlocadas: '', inicioSem: 1 });
  const [novoRisco, setNovoRisco] = useState({ risco: '', impacto: 'Alto', probabilidade: 'Média', resposta: '' });
  const [novaComunicacao, setNovaComunicacao] = useState({ stakeholder: '', informacao: '', frequencia: '', canal: '' });

  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Cálculos EVM
  const bacTotal = Number(projeto.orcamentoBAC) || 1;
  const pvCalculado = ((Number(projeto.semanaAtual) / Number(projeto.prazoTotalSemanas)) * bacTotal);
  const evCalculado = ((Number(projeto.progressoRealPct) / 100) * bacTotal);
  const acAtual = Number(projeto.custoRealAC) || 1;
  const cpi = (evCalculado / acAtual).toFixed(2);
  const spi = (evCalculado / (pvCalculado || 1)).toFixed(2);
  const eac = (bacTotal / (Number(cpi) || 1)).toFixed(2);

  // Estilos
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' };
  const boxGuiaStyle = { backgroundColor: '#f0fdf4', borderLeft: '4px solid #16a34a', padding: '16px', borderRadius: '8px', marginBottom: '20px', color: '#166534', fontSize: '13px', lineHeight: '1.6' };

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
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', fontSize: '13px', maxWidth: '100%', boxSizing: 'border-box', animation: 'fadeIn 0.4s' }}>
      
      {/* CABEÇALHO SUPERIOR */}
      <div className="no-print" style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px 24px', borderRadius: '14px 14px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #2563eb' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ backgroundColor: '#3b82f6', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>PMBOK 7ª ED.</span>
            <span style={{ fontSize: '16px', fontWeight: '800' }}>Plano de Gerenciamento do Projeto</span>
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>
            Projeto: <strong style={{ color: '#fff' }}>{projeto.titulo}</strong> • PM: <strong>{projeto.gerente}</strong>
          </div>
        </div>

        {/* NAVEGAÇÃO DE VISÕES */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '12px' }}>
          {[
            { id: 'tap', label: '📜 Termo Abertura (TAP)' },
            { id: 'dash', label: '📊 Dashboard EVM' },
            { id: 'passos', label: `📝 Os 10 Passos (${passo}/10)` },
            { id: 'governanca', label: '🛡️ Governança' },
            { id: 'gantt', label: '📈 Gráficos Gantt' },
            { id: 'imprimir', label: '🖨️ Relatório Final' }
          ].map(aba => (
            <button
              key={aba.id} onClick={() => setVisao(aba.id)}
              style={{
                backgroundColor: visao === aba.id ? '#2563eb' : 'transparent', color: visao === aba.id ? 'white' : '#cbd5e1',
                border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', transition: 'all 0.2s'
              }}
            >
              {aba.label}
            </button>
          ))}
        </div>
      </div>

      {/* CORPO PRINCIPAL */}
      <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '0 0 14px 14px', border: '1px solid #e2e8f0', borderTop: 'none', minHeight: '600px' }}>

        {/* =====================================================================
            VISÃO 0: TERMO DE ABERTURA (TAP)
           ===================================================================== */}
        {visao === 'tap' && (
          <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '12px' }}>📜 Termo de Abertura do Projeto (Project Charter)</h3>
              <div style={{ ...boxGuiaStyle, backgroundColor: '#eff6ff', borderLeftColor: '#3b82f6', color: '#1e3a8a' }}>
                O <strong>Termo de Abertura do Projeto (TAP)</strong> é o documento formal que autoriza a existência do projeto e concede ao Gerente a autoridade para aplicar os recursos da organização. Sem ele, o projeto não existe legalmente.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="tapTitulo" style={labelStyle}>Nome do Projeto:</label>
                  <input id="tapTitulo" name="tapTitulo" style={inputStyle} value={projeto.titulo} onChange={e => setProjeto({...projeto, titulo: e.target.value})} />
                </div>
                <div>
                  <label htmlFor="tapGerente" style={labelStyle}>Gerente do Projeto (Project Manager):</label>
                  <input id="tapGerente" name="tapGerente" style={inputStyle} value={projeto.gerente} onChange={e => setProjeto({...projeto, gerente: e.target.value})} />
                </div>
                <div>
                  <label htmlFor="tapSponsor" style={labelStyle}>Patrocinador (Sponsor / Diretoria):</label>
                  <input id="tapSponsor" name="tapSponsor" style={inputStyle} value={projeto.patrocinador} onChange={e => setProjeto({...projeto, patrocinador: e.target.value})} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label htmlFor="tapJust" style={labelStyle}>Justificativa do Projeto (Dor de Negócio):</label>
                  <textarea id="tapJust" name="tapJust" rows="3" style={inputStyle} value={projeto.justificativa} onChange={e => setProjeto({...projeto, justificativa: e.target.value})} placeholder="Por que estamos gastando dinheiro neste projeto?" />
                </div>
                <div>
                  <label htmlFor="tapPrazo" style={labelStyle}>Prazo Macro Estimado (Semanas):</label>
                  <input id="tapPrazo" name="tapPrazo" type="number" style={inputStyle} value={projeto.prazoTotalSemanas} onChange={e => setProjeto({...projeto, prazoTotalSemanas: e.target.value})} />
                </div>
                <div>
                  <label htmlFor="tapOrc" style={{...labelStyle, color: '#16a34a'}}>Orçamento Macro Aprovado (R$):</label>
                  <input id="tapOrc" name="tapOrc" type="number" style={inputStyle} value={projeto.orcamentoBAC} onChange={e => setProjeto({...projeto, orcamentoBAC: e.target.value})} />
                </div>
              </div>

              <div style={{ marginTop: '24px', padding: '20px', backgroundColor: '#f1f5f9', borderRadius: '8px', border: '1px dashed #94a3b8', textAlign: 'center' }}>
                <strong style={{ display: 'block', fontSize: '14px', marginBottom: '10px' }}>Assinatura de Autorização Executiva</strong>
                <p style={{ fontStyle: 'italic', color: '#64748b' }}>Assinado eletronicamente por {projeto.patrocinador} em {new Date().toLocaleDateString('pt-BR')}.</p>
                <button onClick={() => setVisao('passos')} style={{ marginTop: '10px', padding: '10px 20px', backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                  Projeto Autorizado! Iniciar Planejamento (10 Passos) →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            VISÃO 1: DASHBOARD EXECUTIVO & VALOR AGREGADO (EVM)
           ===================================================================== */}
        {visao === 'dash' && (
          <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '800' }}>Painel Executivo (Project Overview)</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>Consolidação de Escopo, Prazos, Custos e Qualidade.</p>
              </div>
              <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '6px 14px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', border: '1px solid #bbf7d0' }}>
                ✓ {projeto.statusAprovacao}
              </span>
            </div>

            {/* KPIs FINANCEIROS EVM */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px' }}>
              <div style={cardStyle}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800' }}>ORÇAMENTO BASE (BAC)</span>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', margin: '4px 0' }}>R$ {formatMoeda(projeto.orcamentoBAC)}</div>
                <span style={{ fontSize: '11.5px', color: '#16a34a', fontWeight: '600' }}>+ R$ {formatMoeda(projeto.reservaContingencia)} Contingência</span>
              </div>
              <div style={cardStyle}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800' }}>VALOR PLANEJADO (PV)</span>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#2563eb', margin: '4px 0' }}>R$ {formatMoeda(pvCalculado)}</div>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>Semana {projeto.semanaAtual} de {projeto.prazoTotalSemanas}</span>
              </div>
              <div style={cardStyle}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800' }}>VALOR AGREGADO (EV)</span>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#10b981', margin: '4px 0' }}>R$ {formatMoeda(evCalculado)}</div>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>Progresso Físico: {projeto.progressoRealPct}%</span>
              </div>
              <div style={cardStyle}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '800' }}>CUSTO REAL (AC)</span>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#ef4444', margin: '4px 0' }}>R$ {formatMoeda(projeto.custoRealAC)}</div>
                <span style={{ fontSize: '11.5px', color: '#64748b' }}>EAC Previsto: R$ {formatMoeda(eac)}</span>
              </div>
              <div style={{ ...cardStyle, backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
                <span style={{ fontSize: '11px', color: '#1e40af', fontWeight: '800' }}>ÍNDICES DE DESEMPENHO</span>
                <div style={{ fontSize: '20px', fontWeight: '900', margin: '4px 0', display: 'flex', gap: '16px' }}>
                  <span style={{ color: Number(cpi) >= 1 ? '#16a34a' : '#ef4444' }}>CPI: {cpi}</span>
                  <span style={{ color: Number(spi) >= 1 ? '#16a34a' : '#f59e0b' }}>SPI: {spi}</span>
                </div>
                <span style={{ fontSize: '11.5px', color: '#1e3a8a', fontWeight: '600' }}>{Number(cpi) >= 1 ? '🟢 Custo Dentro do Previsto' : '🔴 Estouro de Custo'}</span>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            VISÃO 2: OS 10 PASSOS
           ===================================================================== */}
        {visao === 'passos' && (
          <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', backgroundColor: 'white', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.02)' }}>
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
                      flex: '1 1 auto', padding: '8px 12px', borderRadius: '6px', border: 'none',
                      fontSize: '12px', fontWeight: isActive ? '800' : '600', cursor: 'pointer',
                      backgroundColor: isActive ? '#0f172a' : 'transparent',
                      color: isActive ? 'white' : '#64748b', transition: 'all 0.2s'
                    }}
                  >
                    {stepNum}. {txt}
                  </button>
                );
              })}
            </div>

            <div style={cardStyle}>
              {passo === 1 && (
                <>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a' }}>1. Objetivos do Projeto (SMART)</h3>
                  <div style={boxGuiaStyle}>A metodologia <strong>SMART</strong> evita metas vagas. O objetivo deve ser Específico, Mensurável, Atingível, Relevante e Temporal.</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label htmlFor="pmpEsp" style={labelStyle}>S — Específico:</label>
                      <input id="pmpEsp" name="pmpEsp" style={inputStyle} value={projeto.objetivoEspecifico} onChange={e => setProjeto({...projeto, objetivoEspecifico: e.target.value})} />
                    </div>
                    <div>
                      <label htmlFor="pmpMens" style={labelStyle}>M — Mensurável:</label>
                      <input id="pmpMens" name="pmpMens" style={inputStyle} value={projeto.objetivoMensuravel} onChange={e => setProjeto({...projeto, objetivoMensuravel: e.target.value})} />
                    </div>
                    <div>
                      <label htmlFor="pmpAting" style={labelStyle}>A — Atingível:</label>
                      <input id="pmpAting" name="pmpAting" style={inputStyle} value={projeto.objetivoAtingivel} onChange={e => setProjeto({...projeto, objetivoAtingivel: e.target.value})} />
                    </div>
                    <div>
                      <label htmlFor="pmpRel" style={labelStyle}>R — Relevante:</label>
                      <input id="pmpRel" name="pmpRel" style={inputStyle} value={projeto.objetivoRelevante} onChange={e => setProjeto({...projeto, objetivoRelevante: e.target.value})} />
                    </div>
                    <div>
                      <label htmlFor="pmpTemp" style={labelStyle}>T — Temporal:</label>
                      <input id="pmpTemp" name="pmpTemp" style={inputStyle} value={projeto.objetivoTemporal} onChange={e => setProjeto({...projeto, objetivoTemporal: e.target.value})} />
                    </div>
                  </div>
                </>
              )}

              {passo === 2 && (
                <>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a' }}>2. Gerenciamento do Escopo</h3>
                  <div style={boxGuiaStyle}>Evite o <em>Scope Creep</em> documentando claramente o que está dentro e o que está expressamente fora do projeto.</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label htmlFor="pmpDecGeral" style={labelStyle}>Declaração Geral:</label>
                      <input id="pmpDecGeral" name="pmpDecGeral" style={inputStyle} value={projeto.declaracaoEscopo} onChange={e => setProjeto({...projeto, declaracaoEscopo: e.target.value})} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                      <div>
                        <label htmlFor="pmpInScope" style={{...labelStyle, color: '#16a34a'}}>✅ In Scope (Dentro):</label>
                        <textarea id="pmpInScope" name="pmpInScope" rows="4" style={inputStyle} value={projeto.escopoDentro} onChange={e => setProjeto({...projeto, escopoDentro: e.target.value})} />
                      </div>
                      <div>
                        <label htmlFor="pmpOutScope" style={{...labelStyle, color: '#ef4444'}}>❌ Out of Scope (Fora):</label>
                        <textarea id="pmpOutScope" name="pmpOutScope" rows="4" style={inputStyle} value={projeto.escopoFora} onChange={e => setProjeto({...projeto, escopoFora: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="pmpDeliver" style={labelStyle}>📦 Entregáveis (Deliverables):</label>
                      <input id="pmpDeliver" name="pmpDeliver" style={inputStyle} value={projeto.entregaveisPrincipais} onChange={e => setProjeto({...projeto, entregaveisPrincipais: e.target.value})} />
                    </div>
                  </div>
                </>
              )}

              {passo === 3 && (
                <>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a' }}>3. Stakeholders & Papéis</h3>
                  <div style={boxGuiaStyle}>Mapeie os envolvidos. O nível de "Interesse" e "Influência" define como você deve gerenciar cada pessoa (Monitorar, Manter Satisfeito, Gerenciar de Perto ou Manter Informado).</div>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '12px' }}>
                        <tr>
                          <th style={{ padding: '12px' }}>Nome / Cargo</th>
                          <th style={{ padding: '12px' }}>Papel</th>
                          <th style={{ padding: '12px' }}>Responsabilidades</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>Interesse</th>
                          <th style={{ padding: '12px', textAlign: 'center' }}>Influência</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projeto.stakeholders.map((s, idx) => (
                          <tr key={s.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '8px' }}>
                              <label htmlFor={`shNome_${s.id}`} className="sr-only" style={{display: 'none'}}>Nome Stakeholder</label>
                              <input id={`shNome_${s.id}`} name={`shNome_${s.id}`} style={inputStyle} value={s.nome} onChange={e => { const c = [...projeto.stakeholders]; c[idx].nome = e.target.value; setProjeto({...projeto, stakeholders: c}); }} />
                            </td>
                            <td style={{ padding: '8px' }}>
                              <label htmlFor={`shPapel_${s.id}`} className="sr-only" style={{display: 'none'}}>Papel Stakeholder</label>
                              <input id={`shPapel_${s.id}`} name={`shPapel_${s.id}`} style={inputStyle} value={s.papel} onChange={e => { const c = [...projeto.stakeholders]; c[idx].papel = e.target.value; setProjeto({...projeto, stakeholders: c}); }} />
                            </td>
                            <td style={{ padding: '8px' }}>
                              <label htmlFor={`shResp_${s.id}`} className="sr-only" style={{display: 'none'}}>Resp Stakeholder</label>
                              <input id={`shResp_${s.id}`} name={`shResp_${s.id}`} style={inputStyle} value={s.responsabilidade} onChange={e => { const c = [...projeto.stakeholders]; c[idx].responsabilidade = e.target.value; setProjeto({...projeto, stakeholders: c}); }} />
                            </td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>
                              <label htmlFor={`shInt_${s.id}`} className="sr-only" style={{display: 'none'}}>Interesse</label>
                              <select id={`shInt_${s.id}`} name={`shInt_${s.id}`} style={inputStyle} value={s.interesse} onChange={e => { const c = [...projeto.stakeholders]; c[idx].interesse = e.target.value; setProjeto({...projeto, stakeholders: c}); }}>
                                <option value="Alto">Alto</option>
                                <option value="Médio">Médio</option>
                                <option value="Baixo">Baixo</option>
                              </select>
                            </td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>
                              <label htmlFor={`shInf_${s.id}`} className="sr-only" style={{display: 'none'}}>Influência</label>
                              <select id={`shInf_${s.id}`} name={`shInf_${s.id}`} style={inputStyle} value={s.influencia} onChange={e => { const c = [...projeto.stakeholders]; c[idx].influencia = e.target.value; setProjeto({...projeto, stakeholders: c}); }}>
                                <option value="Alta">Alta</option>
                                <option value="Média">Média</option>
                                <option value="Baixa">Baixa</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* ADICIONAR NOVO STAKEHOLDER */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    <div>
                      <label htmlFor="newShNome" style={labelStyle}>Nome:</label>
                      <input id="newShNome" name="newShNome" style={inputStyle} placeholder="Nome / Cargo" value={novoStakeholder.nome} onChange={e => setNovoStakeholder({...novoStakeholder, nome: e.target.value})} />
                    </div>
                    <div>
                      <label htmlFor="newShPapel" style={labelStyle}>Papel:</label>
                      <input id="newShPapel" name="newShPapel" style={inputStyle} placeholder="Papel" value={novoStakeholder.papel} onChange={e => setNovoStakeholder({...novoStakeholder, papel: e.target.value})} />
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label htmlFor="newShResp" style={labelStyle}>Responsabilidade:</label>
                      <input id="newShResp" name="newShResp" style={inputStyle} placeholder="Responsabilidade" value={novoStakeholder.responsabilidade} onChange={e => setNovoStakeholder({...novoStakeholder, responsabilidade: e.target.value})} />
                    </div>
                    <div>
                      <label htmlFor="newShInt" style={labelStyle}>Interesse:</label>
                      <select id="newShInt" name="newShInt" style={inputStyle} value={novoStakeholder.interesse} onChange={e => setNovoStakeholder({...novoStakeholder, interesse: e.target.value})}>
                        <option value="Alto">Alto</option><option value="Médio">Médio</option><option value="Baixo">Baixo</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="newShInf" style={labelStyle}>Influência:</label>
                      <select id="newShInf" name="newShInf" style={inputStyle} value={novoStakeholder.influencia} onChange={e => setNovoStakeholder({...novoStakeholder, influencia: e.target.value})}>
                        <option value="Alta">Alta</option><option value="Média">Média</option><option value="Baixa">Baixa</option>
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: '1 / -1' }}>
                      <button type="button" onClick={() => {
                        if (!novoStakeholder.nome) return;
                        setProjeto({...projeto, stakeholders: [...projeto.stakeholders, { id: Date.now(), ...novoStakeholder }]});
                        setNovoStakeholder({ nome: '', papel: '', responsabilidade: '', interesse: 'Alto', influencia: 'Média' });
                      }} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', padding: '10px', width: '100%' }}>+ Adicionar Stakeholder</button>
                    </div>
                  </div>
                </>
              )}

              {passo === 4 && (
                <>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a' }}>4. WBS / Estrutura Analítica do Projeto (EAP)</h3>
                  <div style={boxGuiaStyle}>
                    Quebre o escopo em pacotes menores (regra dos 100%).<br/> 
                    <strong>💡 Dica:</strong> Nomeie as Fases como substantivos (ex: <em>"Desenvolvimento Core"</em> em vez de <em>"Desenvolver"</em>). Se uma entrega não está na WBS, ela será considerada fora do escopo!
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {projeto.wbsPacotes.map((pacote, idx) => (
                      <div key={pacote.codigo} style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', borderTop: '4px solid #3b82f6', borderRadius: '8px', padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                          <span style={{ fontWeight: '900', color: '#1e40af', fontSize: '14px' }}>{pacote.codigo}</span>
                          <label htmlFor={`wbsFase_${pacote.codigo}`} className="sr-only" style={{display:'none'}}>Título da Fase</label>
                          <input id={`wbsFase_${pacote.codigo}`} name={`wbsFase_${pacote.codigo}`} style={{ ...inputStyle, fontWeight: 'bold', color: '#1e40af', padding: '6px' }} value={pacote.fase} onChange={e => {
                            const copia = [...projeto.wbsPacotes];
                            copia[idx].fase = e.target.value;
                            setProjeto({...projeto, wbsPacotes: copia});
                          }} />
                        </div>
                        <label htmlFor={`wbsPacote_${pacote.codigo}`} style={labelStyle}>Pacotes de Trabalho (Entregas Menores):</label>
                        <textarea id={`wbsPacote_${pacote.codigo}`} name={`wbsPacote_${pacote.codigo}`} rows="3" style={{ ...inputStyle, marginBottom: '12px' }} value={pacote.entregas} onChange={e => {
                          const copia = [...projeto.wbsPacotes];
                          copia[idx].entregas = e.target.value;
                          setProjeto({...projeto, wbsPacotes: copia});
                        }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>Resp: <strong>{pacote.responsavel}</strong></span>
                          <span style={{ color: '#16a34a', fontWeight: 'bold' }}>R$ {formatMoeda(pacote.custoEstimado)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {passo === 5 && (
                <>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a' }}>5. Cronograma e Marcos (Milestones)</h3>
                  <div style={boxGuiaStyle}>
                    <strong>Marcos (Milestones)</strong> são entregas com duração zero. Eles servem como pontos de checagem com a diretoria.<br/>
                    💡 <em>Os marcos que você adicionar aqui aparecerão automaticamente integrados no seu Gráfico de Gantt!</em>
                  </div>
                  <h4 style={{ fontSize: '14px', color: '#334155', marginBottom: '10px' }}>Controle de Marcos do Projeto</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                    {projeto.marcosProjeto.map((m, idx) => (
                      <div key={m.id} style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                        <label htmlFor={`marco_${m.id}`} style={labelStyle}>Nome do Marco (Milestone):</label>
                        <input id={`marco_${m.id}`} name={`marco_${m.id}`} style={{ ...inputStyle, fontWeight: 'bold', marginBottom: '10px' }} value={m.marco} onChange={e => {
                          const copia = [...projeto.marcosProjeto];
                          copia[idx].marco = e.target.value;
                          setProjeto({...projeto, marcosProjeto: copia});
                        }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <label htmlFor={`mSem_${m.id}`} style={{ fontSize: '12px', margin: 0, fontWeight: 'bold', color: '#475569' }}>Semana Alvo:</label>
                            <input id={`mSem_${m.id}`} name={`mSem_${m.id}`} type="number" min="1" max={projeto.prazoTotalSemanas} value={m.semanaPrevista} onChange={e => {
                              const copia = [...projeto.marcosProjeto];
                              copia[idx].semanaPrevista = e.target.value;
                              setProjeto({...projeto, marcosProjeto: copia});
                            }} style={{ width: '50px', padding: '4px', textAlign: 'center', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} />
                          </div>
                          <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', backgroundColor: m.status === 'Concluído' ? '#dcfce7' : '#fef3c7', color: m.status === 'Concluído' ? '#166534' : '#92400e', fontWeight: 'bold' }}>{m.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* ADICIONAR NOVO MARCO */}
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    <div style={{ flex: 2 }}>
                      <label htmlFor="newMarco" style={labelStyle}>Novo Marco Crítico:</label>
                      <input id="newMarco" name="newMarco" style={inputStyle} placeholder="Ex: Assinatura do Contrato Principal" value={novoMarco.marco} onChange={e => setNovoMarco({...novoMarco, marco: e.target.value})} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label htmlFor="newMarcoSem" style={labelStyle}>Semana Alvo:</label>
                      <input id="newMarcoSem" name="newMarcoSem" type="number" min="1" max={projeto.prazoTotalSemanas} style={inputStyle} value={novoMarco.semanaPrevista} onChange={e => setNovoMarco({...novoMarco, semanaPrevista: e.target.value})} />
                    </div>
                    <button type="button" onClick={() => {
                      if (!novoMarco.marco) return;
                      setProjeto({...projeto, marcosProjeto: [...projeto.marcosProjeto, { id: Date.now(), ...novoMarco }]});
                      setNovoMarco({ marco: '', semanaPrevista: 1, status: 'Pendente' });
                    }} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', padding: '10px 20px', height: '39px' }}>+ Adicionar</button>
                  </div>
                </>
              )}

              {passo === 6 && (
                <>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a' }}>6. Gestão de Recursos (Humanos e Infra)</h3>
                  <div style={boxGuiaStyle}>Alocação de pessoal e infraestrutura para calcular orçamentos sem ociosidade. A matriz abaixo também gera um <strong>Gráfico de Gantt de Recursos</strong> automático na aba de Gráficos!</div>
                  
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '12px' }}>
                        <tr>
                          <th style={{ padding: '12px' }}>Recurso</th>
                          <th style={{ padding: '12px' }}>Tipo</th>
                          <th style={{ padding: '12px' }}>Custo/Sem</th>
                          <th style={{ padding: '12px' }}>Qtd Semanas</th>
                          <th style={{ padding: '12px' }}>Início (Sem)</th>
                          <th style={{ padding: '12px' }}>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projeto.recursosAlocados.map((r, idx) => (
                          <tr key={r.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '8px' }}>
                              <label htmlFor={`recNome_${r.id}`} className="sr-only" style={{display:'none'}}>Recurso</label>
                              <input id={`recNome_${r.id}`} name={`recNome_${r.id}`} style={inputStyle} value={r.recurso} onChange={e => { const c = [...projeto.recursosAlocados]; c[idx].recurso = e.target.value; setProjeto({...projeto, recursosAlocados: c}); }} />
                            </td>
                            <td style={{ padding: '8px' }}>
                              <label htmlFor={`recTipo_${r.id}`} className="sr-only" style={{display:'none'}}>Tipo</label>
                              <select id={`recTipo_${r.id}`} name={`recTipo_${r.id}`} style={inputStyle} value={r.tipo} onChange={e => { const c = [...projeto.recursosAlocados]; c[idx].tipo = e.target.value; setProjeto({...projeto, recursosAlocados: c}); }}>
                                <option value="Humano">Humano</option>
                                <option value="Infraestrutura">Infra</option>
                              </select>
                            </td>
                            <td style={{ padding: '8px' }}>
                              <label htmlFor={`recCusto_${r.id}`} className="sr-only" style={{display:'none'}}>Custo</label>
                              <input id={`recCusto_${r.id}`} name={`recCusto_${r.id}`} style={inputStyle} type="number" value={r.taxaSemanal} onChange={e => { const c = [...projeto.recursosAlocados]; c[idx].taxaSemanal = e.target.value; setProjeto({...projeto, recursosAlocados: c}); }} />
                            </td>
                            <td style={{ padding: '8px' }}>
                              <label htmlFor={`recSem_${r.id}`} className="sr-only" style={{display:'none'}}>Semana</label>
                              <input id={`recSem_${r.id}`} name={`recSem_${r.id}`} style={inputStyle} type="number" value={r.semanasAlocadas} onChange={e => { const c = [...projeto.recursosAlocados]; c[idx].semanasAlocadas = e.target.value; setProjeto({...projeto, recursosAlocados: c}); }} />
                            </td>
                            <td style={{ padding: '8px' }}>
                              <label htmlFor={`recInic_${r.id}`} className="sr-only" style={{display:'none'}}>Início</label>
                              <input id={`recInic_${r.id}`} name={`recInic_${r.id}`} style={inputStyle} type="number" value={r.inicioSem} onChange={e => { const c = [...projeto.recursosAlocados]; c[idx].inicioSem = e.target.value; setProjeto({...projeto, recursosAlocados: c}); }} />
                            </td>
                            <td style={{ padding: '8px', fontWeight: 'bold', color: '#2563eb' }}>R$ {formatMoeda(r.taxaSemanal * r.semanasAlocadas)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ADICIONAR NOVO RECURSO */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label htmlFor="newRecNome" style={labelStyle}>Nome do Recurso:</label>
                      <input id="newRecNome" name="newRecNome" style={inputStyle} placeholder="Ex: Licença Software ERP" value={novoRecurso.recurso} onChange={e => setNovoRecurso({...novoRecurso, recurso: e.target.value})} />
                    </div>
                    <div>
                      <label htmlFor="newRecTipo" style={labelStyle}>Tipo:</label>
                      <select id="newRecTipo" name="newRecTipo" style={inputStyle} value={novoRecurso.tipo} onChange={e => setNovoRecurso({...novoRecurso, tipo: e.target.value})}>
                        <option value="Humano">Equipe/Humano</option><option value="Infraestrutura">Infra/Máquina</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="newRecCusto" style={labelStyle}>Custo/Semana (R$):</label>
                      <input id="newRecCusto" name="newRecCusto" style={inputStyle} type="number" value={novoRecurso.taxaSemanal} onChange={e => setNovoRecurso({...novoRecurso, taxaSemanal: e.target.value})} />
                    </div>
                    <div>
                      <label htmlFor="newRecSem" style={labelStyle}>Qtd Semanas:</label>
                      <input id="newRecSem" name="newRecSem" style={inputStyle} type="number" value={novoRecurso.semanasAlocadas} onChange={e => setNovoRecurso({...novoRecurso, semanasAlocadas: e.target.value})} />
                    </div>
                    <div>
                      <label htmlFor="newRecInic" style={labelStyle}>Inicia na Sem.:</label>
                      <input id="newRecInic" name="newRecInic" style={inputStyle} type="number" value={novoRecurso.inicioSem} onChange={e => setNovoRecurso({...novoRecurso, inicioSem: e.target.value})} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: '1 / -1' }}>
                      <button type="button" onClick={() => {
                        if (!novoRecurso.recurso) return;
                        setProjeto({...projeto, recursosAlocados: [...projeto.recursosAlocados, { id: Date.now(), ...novoRecurso }]});
                        setNovoRecurso({ recurso: '', tipo: 'Humano', taxaSemanal: '', semanasAlocadas: '', inicioSem: 1 });
                      }} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', padding: '10px', width: '100%' }}>+ Alocar Recurso</button>
                    </div>
                  </div>
                </>
              )}

              {passo === 7 && (
                <>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a' }}>7. Orçamento e Linha de Base de Custos (BAC)</h3>
                  <div style={boxGuiaStyle}>Separe custos diretos das reservas de contingência (riscos previstos) e gerenciais (imprevistos diretores).</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                    <div>
                      <label htmlFor="pmpCustoRH" style={labelStyle}>Custos de Pessoal (R$):</label>
                      <input id="pmpCustoRH" name="pmpCustoRH" style={inputStyle} type="number" value={projeto.custoRecursosHumanos} onChange={e => setProjeto({...projeto, custoRecursosHumanos: e.target.value})} />
                    </div>
                    <div>
                      <label htmlFor="pmpCustoInfra" style={labelStyle}>Custos de Infra/Materiais (R$):</label>
                      <input id="pmpCustoInfra" name="pmpCustoInfra" style={inputStyle} type="number" value={projeto.custoFerramentasInfra} onChange={e => setProjeto({...projeto, custoFerramentasInfra: e.target.value})} />
                    </div>
                    <div>
                      <label htmlFor="pmpBac" style={{...labelStyle, color: '#2563eb'}}>Orçamento Base (BAC):</label>
                      <input id="pmpBac" name="pmpBac" style={{...inputStyle, borderColor: '#bfdbfe', backgroundColor: '#eff6ff'}} type="number" value={projeto.orcamentoBAC} onChange={e => setProjeto({...projeto, orcamentoBAC: e.target.value})} />
                    </div>
                    <div>
                      <label htmlFor="pmpResCont" style={{...labelStyle, color: '#d97706'}}>Reserva Contingência (R$):</label>
                      <input id="pmpResCont" name="pmpResCont" style={{...inputStyle, borderColor: '#fde68a', backgroundColor: '#fffbeb'}} type="number" value={projeto.reservaContingencia} onChange={e => setProjeto({...projeto, reservaContingencia: e.target.value})} />
                    </div>
                    <div>
                      <label htmlFor="pmpResGer" style={{...labelStyle, color: '#059669'}}>Reserva Gerencial (R$):</label>
                      <input id="pmpResGer" name="pmpResGer" style={{...inputStyle, borderColor: '#a7f3d0', backgroundColor: '#ecfdf5'}} type="number" value={projeto.reservaGerencial} onChange={e => setProjeto({...projeto, reservaGerencial: e.target.value})} />
                    </div>
                  </div>
                </>
              )}

              {passo === 8 && (
                <>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a' }}>8. Gestão de Riscos</h3>
                  <div style={boxGuiaStyle}>Mapeie o Impacto e Probabilidade. Defina uma resposta clara (Mitigar, Evitar, Aceitar, Transferir).</div>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '12px' }}>
                        <tr>
                          <th style={{ padding: '12px' }}>Risco Identificado</th>
                          <th style={{ padding: '12px', width: '120px', textAlign: 'center' }}>Impacto</th>
                          <th style={{ padding: '12px', width: '120px', textAlign: 'center' }}>Probabilidade</th>
                          <th style={{ padding: '12px' }}>Plano de Resposta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projeto.riscos.map((r, idx) => (
                          <tr key={r.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '8px' }}>
                              <label htmlFor={`riscoNome_${r.id}`} className="sr-only" style={{display:'none'}}>Risco</label>
                              <input id={`riscoNome_${r.id}`} name={`riscoNome_${r.id}`} style={inputStyle} value={r.risco} onChange={e => { const c = [...projeto.riscos]; c[idx].risco = e.target.value; setProjeto({...projeto, riscos: c}); }} />
                            </td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>
                              <label htmlFor={`riscoImp_${r.id}`} className="sr-only" style={{display:'none'}}>Impacto</label>
                              <select id={`riscoImp_${r.id}`} name={`riscoImp_${r.id}`} style={inputStyle} value={r.impacto} onChange={e => { const c = [...projeto.riscos]; c[idx].impacto = e.target.value; setProjeto({...projeto, riscos: c}); }}>
                                <option value="Alto">Alto</option><option value="Médio">Médio</option><option value="Baixo">Baixo</option>
                              </select>
                            </td>
                            <td style={{ padding: '8px', textAlign: 'center' }}>
                              <label htmlFor={`riscoProb_${r.id}`} className="sr-only" style={{display:'none'}}>Probab.</label>
                              <select id={`riscoProb_${r.id}`} name={`riscoProb_${r.id}`} style={inputStyle} value={r.probabilidade} onChange={e => { const c = [...projeto.riscos]; c[idx].probabilidade = e.target.value; setProjeto({...projeto, riscos: c}); }}>
                                <option value="Alta">Alta</option><option value="Média">Média</option><option value="Baixa">Baixa</option>
                              </select>
                            </td>
                            <td style={{ padding: '8px' }}>
                              <label htmlFor={`riscoResp_${r.id}`} className="sr-only" style={{display:'none'}}>Resposta</label>
                              <input id={`riscoResp_${r.id}`} name={`riscoResp_${r.id}`} style={inputStyle} value={r.resposta} onChange={e => { const c = [...projeto.riscos]; c[idx].resposta = e.target.value; setProjeto({...projeto, riscos: c}); }} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* ADICIONAR NOVO RISCO */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', backgroundColor: '#fff1f2', padding: '16px', borderRadius: '8px', border: '1px dashed #fecaca' }}>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label htmlFor="newRiscoNome" style={labelStyle}>Nova Ameaça:</label>
                      <input id="newRiscoNome" name="newRiscoNome" style={inputStyle} placeholder="O que pode dar errado?" value={novoRisco.risco} onChange={e => setNovoRisco({...novoRisco, risco: e.target.value})} />
                    </div>
                    <div>
                      <label htmlFor="newRiscoImp" style={labelStyle}>Impacto:</label>
                      <select id="newRiscoImp" name="newRiscoImp" style={inputStyle} value={novoRisco.impacto} onChange={e => setNovoRisco({...novoRisco, impacto: e.target.value})}>
                        <option value="Alto">Alto</option><option value="Médio">Médio</option><option value="Baixo">Baixo</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="newRiscoProb" style={labelStyle}>Probabilidade:</label>
                      <select id="newRiscoProb" name="newRiscoProb" style={inputStyle} value={novoRisco.probabilidade} onChange={e => setNovoRisco({...novoRisco, probabilidade: e.target.value})}>
                        <option value="Alta">Alta</option><option value="Média">Média</option><option value="Baixa">Baixa</option>
                      </select>
                    </div>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label htmlFor="newRiscoResp" style={labelStyle}>Resposta Estratégica:</label>
                      <input id="newRiscoResp" name="newRiscoResp" style={inputStyle} placeholder="Como mitigar ou evitar?" value={novoRisco.resposta} onChange={e => setNovoRisco({...novoRisco, resposta: e.target.value})} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: '1 / -1' }}>
                      <button type="button" onClick={() => {
                        if (!novoRisco.risco) return;
                        setProjeto({...projeto, riscos: [...projeto.riscos, { id: Date.now(), ...novoRisco }]});
                        setNovoRisco({ risco: '', impacto: 'Alto', probabilidade: 'Média', resposta: '' });
                      }} style={{ backgroundColor: '#e11d48', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', padding: '10px', width: '100%' }}>+ Mapear Risco</button>
                    </div>
                  </div>
                </>
              )}

              {passo === 9 && (
                <>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a' }}>9. Plano de Comunicação</h3>
                  <div style={boxGuiaStyle}>Evite falhas de alinhamento definindo quem recebe, o quê, quando e por onde.</div>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead style={{ backgroundColor: '#f1f5f9', color: '#475569', fontSize: '12px' }}>
                        <tr>
                          <th style={{ padding: '12px' }}>Stakeholder Público</th>
                          <th style={{ padding: '12px' }}>Informação (Conteúdo)</th>
                          <th style={{ padding: '12px' }}>Frequência</th>
                          <th style={{ padding: '12px' }}>Canal Oficial</th>
                        </tr>
                      </thead>
                      <tbody>
                        {projeto.comunicacao.map((c, idx) => (
                          <tr key={c.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                            <td style={{ padding: '8px' }}>
                              <label htmlFor={`comSh_${c.id}`} className="sr-only" style={{display:'none'}}>Stakeholder</label>
                              <input id={`comSh_${c.id}`} name={`comSh_${c.id}`} style={inputStyle} value={c.stakeholder} onChange={e => { const copia = [...projeto.comunicacao]; copia[idx].stakeholder = e.target.value; setProjeto({...projeto, comunicacao: copia}); }} />
                            </td>
                            <td style={{ padding: '8px' }}>
                              <label htmlFor={`comInfo_${c.id}`} className="sr-only" style={{display:'none'}}>Info</label>
                              <input id={`comInfo_${c.id}`} name={`comInfo_${c.id}`} style={inputStyle} value={c.informacao} onChange={e => { const copia = [...projeto.comunicacao]; copia[idx].informacao = e.target.value; setProjeto({...projeto, comunicacao: copia}); }} />
                            </td>
                            <td style={{ padding: '8px' }}>
                              <label htmlFor={`comFreq_${c.id}`} className="sr-only" style={{display:'none'}}>Freq</label>
                              <input id={`comFreq_${c.id}`} name={`comFreq_${c.id}`} style={inputStyle} value={c.frequencia} onChange={e => { const copia = [...projeto.comunicacao]; copia[idx].frequencia = e.target.value; setProjeto({...projeto, comunicacao: copia}); }} />
                            </td>
                            <td style={{ padding: '8px' }}>
                              <label htmlFor={`comCanal_${c.id}`} className="sr-only" style={{display:'none'}}>Canal</label>
                              <input id={`comCanal_${c.id}`} name={`comCanal_${c.id}`} style={inputStyle} value={c.canal} onChange={e => { const copia = [...projeto.comunicacao]; copia[idx].canal = e.target.value; setProjeto({...projeto, comunicacao: copia}); }} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ADICIONAR COMUNICAÇÃO */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', backgroundColor: '#f1f5f9', padding: '16px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                    <div>
                      <label htmlFor="newComSh" style={labelStyle}>Novo Stakeholder:</label>
                      <input id="newComSh" name="newComSh" style={inputStyle} placeholder="Público Alvo" value={novaComunicacao.stakeholder} onChange={e => setNovaComunicacao({...novaComunicacao, stakeholder: e.target.value})} />
                    </div>
                    <div>
                      <label htmlFor="newComInfo" style={labelStyle}>O que comunicar?</label>
                      <input id="newComInfo" name="newComInfo" style={inputStyle} placeholder="Informação" value={novaComunicacao.informacao} onChange={e => setNovaComunicacao({...novaComunicacao, informacao: e.target.value})} />
                    </div>
                    <div>
                      <label htmlFor="newComFreq" style={labelStyle}>Frequência:</label>
                      <input id="newComFreq" name="newComFreq" style={inputStyle} placeholder="Ex: Diária" value={novaComunicacao.frequencia} onChange={e => setNovaComunicacao({...novaComunicacao, frequencia: e.target.value})} />
                    </div>
                    <div>
                      <label htmlFor="newComCanal" style={labelStyle}>Canal:</label>
                      <input id="newComCanal" name="newComCanal" style={inputStyle} placeholder="Ex: E-mail" value={novaComunicacao.canal} onChange={e => setNovaComunicacao({...novaComunicacao, canal: e.target.value})} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gridColumn: '1 / -1' }}>
                      <button type="button" onClick={() => {
                        if (!novaComunicacao.stakeholder) return;
                        setProjeto({...projeto, comunicacao: [...projeto.comunicacao, { id: Date.now(), ...novaComunicacao }]});
                        setNovaComunicacao({ stakeholder: '', informacao: '', frequencia: '', canal: '' });
                      }} style={{ backgroundColor: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', padding: '10px', width: '100%' }}>+ Adicionar ao Plano</button>
                    </div>
                  </div>
                </>
              )}

              {passo === 10 && (
                <>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a' }}>10. Monitoramento EVM (Earned Value)</h3>
                  <div style={boxGuiaStyle}>Atualize a semana atual e o progresso físico para que o algoritmo calcule o CPI (Índice de Desempenho de Custos) e SPI (Prazos).</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                    <div>
                      <label htmlFor="pmpSemAtual" style={labelStyle}>Semana Atual Auditada:</label>
                      <input id="pmpSemAtual" name="pmpSemAtual" style={inputStyle} type="number" max={projeto.prazoTotalSemanas} value={projeto.semanaAtual} onChange={e => setProjeto({...projeto, semanaAtual: e.target.value})} />
                    </div>
                    <div>
                      <label htmlFor="pmpProg" style={labelStyle}>Progresso Físico Real (%):</label>
                      <input id="pmpProg" name="pmpProg" style={inputStyle} type="number" max="100" value={projeto.progressoRealPct} onChange={e => setProjeto({...projeto, progressoRealPct: e.target.value})} />
                    </div>
                    <div>
                      <label htmlFor="pmpCustReal" style={labelStyle}>Custo Real ERP (AC - R$):</label>
                      <input id="pmpCustReal" name="pmpCustReal" style={inputStyle} type="number" value={projeto.custoRealAC} onChange={e => setProjeto({...projeto, custoRealAC: e.target.value})} />
                    </div>
                  </div>
                  <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '10px', display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: '16px', color: 'white' }}>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Planejado (PV)</div><div style={{ fontSize: '18px', fontWeight: '900', color: '#38bdf8' }}>R$ {formatMoeda(pvCalculado)}</div></div>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Agregado (EV)</div><div style={{ fontSize: '18px', fontWeight: '900', color: '#10b981' }}>R$ {formatMoeda(evCalculado)}</div></div>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Índice Custo (CPI)</div><div style={{ fontSize: '18px', fontWeight: '900', color: Number(cpi) >= 1 ? '#10b981' : '#ef4444' }}>{cpi}</div></div>
                    <div style={{ textAlign: 'center' }}><div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>Índice Prazo (SPI)</div><div style={{ fontSize: '18px', fontWeight: '900', color: Number(spi) >= 1 ? '#10b981' : '#f59e0b' }}>{spi}</div></div>
                  </div>
                </>
              )}

              {/* BOTÕES DE NAVEGAÇÃO DOS PASSOS */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
                <button type="button" onClick={voltarPasso} disabled={passo === 1} style={{ backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: passo === 1 ? 'not-allowed' : 'pointer', opacity: passo === 1 ? 0.5 : 1, transition: 'all 0.2s' }}>
                  ← Etapa Anterior
                </button>
                <button type="button" onClick={avancarPasso} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(37,99,235,0.2)' }}>
                  {passo === 10 ? 'Concluir e Ver Dashboard 📊' : `Salvar e Ir para Etapa ${passo + 1} →`}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* =====================================================================
            VISÃO 3: GOVERNANÇA (QUALIDADE, AQUISIÇÕES, ETC)
           ===================================================================== */}
        {visao === 'governanca' && (
          <div className="no-print" style={cardStyle}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#0f172a' }}>Integração, Qualidade, Aquisições e Aprovações</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={{ gridColumn: '1 / -1' }}>
                <label htmlFor="govVisaoGeral" style={labelStyle}>Visão Geral Executiva (Integração):</label>
                <textarea id="govVisaoGeral" name="govVisaoGeral" rows="2" style={inputStyle} value={projeto.visaoGeral} onChange={e => setProjeto({...projeto, visaoGeral: e.target.value})} />
              </div>
              <div>
                <label htmlFor="govQualidade" style={{...labelStyle, color: '#2563eb'}}>Plano de Qualidade (Padrões):</label>
                <textarea id="govQualidade" name="govQualidade" rows="4" style={inputStyle} value={projeto.padroesQualidade} onChange={e => setProjeto({...projeto, padroesQualidade: e.target.value})} />
              </div>
              <div>
                <label htmlFor="govPremissas" style={{...labelStyle, color: '#0f766e'}}>Premissas e Restrições:</label>
                <textarea id="govPremissas" name="govPremissas" rows="4" style={inputStyle} value={projeto.premissasRestricoes} onChange={e => setProjeto({...projeto, premissasRestricoes: e.target.value})} />
              </div>
              <div>
                <label htmlFor="govAquisicoes" style={labelStyle}>Plano de Aquisições (Contratos Terceiros):</label>
                <textarea id="govAquisicoes" name="govAquisicoes" rows="3" style={inputStyle} value={projeto.planoAquisicoes} onChange={e => setProjeto({...projeto, planoAquisicoes: e.target.value})} />
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <label htmlFor="govPatrocinador" style={{...labelStyle, color: '#16a34a'}}>Status Oficial de Aprovação:</label>
                <input id="govPatrocinador" name="govPatrocinador" style={{ ...inputStyle, marginBottom: '10px' }} value={projeto.patrocinador} onChange={e => setProjeto({...projeto, patrocinador: e.target.value})} placeholder="Sponsor Aprovador" />
                <label htmlFor="govStatus" className="sr-only" style={{display:'none'}}>Status</label>
                <select id="govStatus" name="govStatus" style={inputStyle} value={projeto.statusAprovacao} onChange={e => setProjeto({...projeto, statusAprovacao: e.target.value})}>
                  <option value="Aprovado pela Diretoria (Baseline Fixada)">✅ Aprovado (Baseline Fixada)</option>
                  <option value="Em Revisão pelo Comitê (CCB)">⏳ Em Revisão (CCB)</option>
                  <option value="Aguardando Assinatura do Sponsor">📝 Aguardando Assinatura</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            VISÃO 4: GRÁFICO DE GANTT INTERATIVO (TAREFAS E RECURSOS)
           ===================================================================== */}
        {visao === 'gantt' && (
          <div className="no-print" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* GANTT DE TAREFAS E MARCOS */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>📈 Gráfico de Gantt (Tarefas e Marcos Integrados)</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>Altere a semana inicial e duração para remapear o projeto. Os Marcos (Losangos 🔸) aparecem na linha do tempo correspondente.</p>
              
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', color: 'white', fontSize: '11px' }}>
                      <th style={{ padding: '12px', textAlign: 'left', width: '220px' }}>Pacote de Trabalho / Marco</th>
                      <th style={{ padding: '12px', textAlign: 'center', width: '60px' }}>Dias</th>
                      <th style={{ padding: '12px', textAlign: 'center', width: '80px' }}>Início (S)</th>
                      <th style={{ padding: '12px', textAlign: 'center', width: '80px' }}>Dur (S)</th>
                      {Array.from({ length: projeto.prazoTotalSemanas }).map((_, i) => (
                        <th key={i} style={{ padding: '8px', textAlign: 'center', borderLeft: '1px solid #334155', backgroundColor: i + 1 === projeto.semanaAtual ? '#2563eb' : 'transparent' }}>
                          S{i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Renderiza Tarefas */}
                    {projeto.tarefasGantt.map((t, idx) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 'bold', color: '#334155', fontSize: '12px' }}>{t.nome}</td>
                        <td style={{ padding: '10px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>{t.dias}d</td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <label htmlFor={`ganttInic_${t.id}`} className="sr-only" style={{display:'none'}}>Semana Inicial</label>
                          <input id={`ganttInic_${t.id}`} name={`ganttInic_${t.id}`} type="number" min="1" max={projeto.prazoTotalSemanas} value={t.inicioSem} onChange={e => {
                            const c = [...projeto.tarefasGantt]; c[idx].inicioSem = e.target.value; setProjeto({...projeto, tarefasGantt: c});
                          }} style={{ width: '50px', padding: '6px', textAlign: 'center', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                        </td>
                        <td style={{ padding: '10px', textAlign: 'center' }}>
                          <label htmlFor={`ganttDur_${t.id}`} className="sr-only" style={{display:'none'}}>Duração Semanas</label>
                          <input id={`ganttDur_${t.id}`} name={`ganttDur_${t.id}`} type="number" min="1" max={projeto.prazoTotalSemanas} value={t.duracaoSem} onChange={e => {
                            const c = [...projeto.tarefasGantt]; c[idx].duracaoSem = e.target.value; setProjeto({...projeto, tarefasGantt: c});
                          }} style={{ width: '50px', padding: '6px', textAlign: 'center', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                        </td>
                        {Array.from({ length: projeto.prazoTotalSemanas }).map((_, semIdx) => {
                          const sNum = semIdx + 1;
                          const ativo = sNum >= t.inicioSem && sNum < t.inicioSem + t.duracaoSem;
                          return (
                            <td key={semIdx} style={{ padding: '8px', borderLeft: '1px dashed #e2e8f0', backgroundColor: sNum === projeto.semanaAtual ? '#f8fafc' : 'transparent' }}>
                              {ativo && <div style={{ height: '20px', backgroundColor: t.cor, borderRadius: '4px', width: '100%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                    
                    {/* Renderiza Marcos Integrados no Gantt */}
                    {projeto.marcosProjeto.map(m => (
                      <tr key={`m_${m.id}`} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#fef3c7' }}>
                        <td style={{ padding: '8px 12px', fontWeight: 'bold', color: '#92400e', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          🔸 {m.marco}
                        </td>
                        <td colSpan="3" style={{ padding: '8px', textAlign: 'center', fontSize: '11px', color: '#b45309' }}>Marco (Milestone)</td>
                        {Array.from({ length: projeto.prazoTotalSemanas }).map((_, semIdx) => (
                          <td key={semIdx} style={{ padding: '8px', borderLeft: '1px dashed #fde68a', textAlign: 'center' }}>
                            {(semIdx + 1) === m.semanaPrevista && <span style={{ fontSize: '16px' }}>🔸</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* GANTT DE RECURSOS (RESOURCE ALLOCATION) */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>👥 Histograma de Alocação de Recursos</h3>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px 0' }}>Visualização de quais recursos (humanos ou de infraestrutura) estão alocados em cada semana.</p>
              
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', color: '#334155', fontSize: '11px' }}>
                      <th style={{ padding: '12px', textAlign: 'left', width: '220px' }}>Recurso Alocado</th>
                      <th style={{ padding: '12px', textAlign: 'center', width: '60px' }}>Tipo</th>
                      {Array.from({ length: projeto.prazoTotalSemanas }).map((_, i) => (
                        <th key={i} style={{ padding: '8px', textAlign: 'center', borderLeft: '1px solid #cbd5e1' }}>S{i + 1}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {projeto.recursosAlocados.map(r => (
                      <tr key={`rGantt_${r.id}`} style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                        <td style={{ padding: '10px 12px', fontWeight: 'bold', color: '#334155', fontSize: '12px' }}>{r.recurso}</td>
                        <td style={{ padding: '10px', textAlign: 'center', fontSize: '11px', color: r.tipo === 'Humano' ? '#2563eb' : '#059669', fontWeight: 'bold' }}>{r.tipo}</td>
                        {Array.from({ length: projeto.prazoTotalSemanas }).map((_, semIdx) => {
                          const sNum = semIdx + 1;
                          const ativo = sNum >= r.inicioSem && sNum < r.inicioSem + r.semanasAlocadas;
                          return (
                            <td key={semIdx} style={{ padding: '8px', borderLeft: '1px dashed #e2e8f0', textAlign: 'center' }}>
                              {ativo && <div style={{ height: '12px', backgroundColor: r.tipo === 'Humano' ? '#93c5fd' : '#a7f3d0', borderRadius: '2px', width: '100%' }} />}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* =====================================================================
            VISÃO 5: RELATÓRIO DE IMPRESSÃO (TELA CHEIA E LIMPA)
           ===================================================================== */}
        {visao === 'imprimir' && (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
              <button onClick={handlePrint} style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px 24px', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37,99,235,0.2)' }}>
                🖨️ Imprimir Projeto Completo (Gerar PDF)
              </button>
            </div>

            {/* CONTEÚDO PRONTO PARA IMPRESSÃO (O CSS no topo esconderá os .no-print durante a impressão normal do navegador) */}
            <div className="print-only-content" style={{ color: 'black', fontFamily: 'serif' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid black', paddingBottom: '20px', marginBottom: '30px' }}>
                <h1 style={{ margin: '0 0 10px 0', fontSize: '28px', textTransform: 'uppercase' }}>Plano de Gerenciamento do Projeto</h1>
                <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'normal' }}>{projeto.titulo}</h2>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>1. Termo de Abertura do Projeto (TAP)</h3>
                <p><strong>Gerente de Projeto:</strong> {projeto.gerente}</p>
                <p><strong>Patrocinador Executivo:</strong> {projeto.patrocinador}</p>
                <p><strong>Justificativa de Negócio:</strong> {projeto.justificativa}</p>
                <p><strong>Visão Geral / Integração:</strong> {projeto.visaoGeral}</p>
                <p><strong>Orçamento Aprovado (BAC):</strong> R$ {formatMoeda(projeto.orcamentoBAC)}</p>
                <p><strong>Prazo Global:</strong> {projeto.prazoTotalSemanas} semanas (Início em {projeto.dataInicio})</p>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>2. Objetivos (SMART)</h3>
                <ul>
                  <li><strong>Específico:</strong> {projeto.objetivoEspecifico}</li>
                  <li><strong>Mensurável:</strong> {projeto.objetivoMensuravel}</li>
                  <li><strong>Atingível:</strong> {projeto.objetivoAtingivel}</li>
                  <li><strong>Relevante:</strong> {projeto.objetivoRelevante}</li>
                  <li><strong>Temporal:</strong> {projeto.objetivoTemporal}</li>
                </ul>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>3. Declaração do Escopo</h3>
                <p><strong>Escopo Geral:</strong> {projeto.declaracaoEscopo}</p>
                <p><strong>Dentro do Escopo:</strong> <br/><span style={{ whiteSpace: 'pre-line' }}>{projeto.escopoDentro}</span></p>
                <p><strong>Fora do Escopo:</strong> <br/><span style={{ whiteSpace: 'pre-line' }}>{projeto.escopoFora}</span></p>
                <p><strong>Entregáveis Principais:</strong> {projeto.entregaveisPrincipais}</p>
              </div>

              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>4. Estrutura Analítica do Projeto (WBS/EAP)</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', marginBottom: '10px' }}>
                  <thead><tr style={{ backgroundColor: '#eee' }}><th style={{ border: '1px solid #000', padding: '8px' }}>Fase</th><th style={{ border: '1px solid #000', padding: '8px' }}>Pacotes / Entregas</th><th style={{ border: '1px solid #000', padding: '8px' }}>Responsável</th></tr></thead>
                  <tbody>
                    {projeto.wbsPacotes.map(p => (
                      <tr key={p.codigo}>
                        <td style={{ border: '1px solid #000', padding: '8px' }}><strong>{p.codigo}</strong> {p.fase}</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>{p.entregas}</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>{p.responsavel}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginBottom: '30px', pageBreakInside: 'avoid' }}>
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>5. Stakeholders e Plano de Comunicação</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', marginBottom: '10px' }}>
                  <thead><tr style={{ backgroundColor: '#eee' }}><th style={{ border: '1px solid #000', padding: '8px' }}>Stakeholder / Papel</th><th style={{ border: '1px solid #000', padding: '8px' }}>Matriz de Poder</th><th style={{ border: '1px solid #000', padding: '8px' }}>Resp / Canal de Comunicação</th></tr></thead>
                  <tbody>
                    {projeto.stakeholders.map(s => {
                      const com = projeto.comunicacao.find(c => c.stakeholder.toLowerCase().includes(s.nome.split(' ')[0].toLowerCase())) || { frequencia: 'Sob demanda', canal: 'Direto' };
                      return (
                        <tr key={s.id}>
                          <td style={{ border: '1px solid #000', padding: '8px' }}><strong>{s.nome}</strong><br/>{s.papel}</td>
                          <td style={{ border: '1px solid #000', padding: '8px' }}>Int: {s.interesse} | Inf: {s.influencia}</td>
                          <td style={{ border: '1px solid #000', padding: '8px' }}>{s.responsabilidade}<br/><em>Comunicação {com.frequencia} via {com.canal}</em></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ marginBottom: '30px', pageBreakInside: 'avoid' }}>
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>6. Análise de Riscos</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left', marginBottom: '10px' }}>
                  <thead><tr style={{ backgroundColor: '#eee' }}><th style={{ border: '1px solid #000', padding: '8px' }}>Risco (Ameaça)</th><th style={{ border: '1px solid #000', padding: '8px' }}>Impacto / Probabilidade</th><th style={{ border: '1px solid #000', padding: '8px' }}>Plano de Resposta (Mitigação)</th></tr></thead>
                  <tbody>
                    {projeto.riscos.map(r => (
                      <tr key={r.id}>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>{r.risco}</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>{r.impacto} / {r.probabilidade}</td>
                        <td style={{ border: '1px solid #000', padding: '8px' }}>{r.resposta}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>7. Qualidade, Aquisições e Restrições</h3>
                <p><strong>Padrões de Qualidade:</strong> <br/><span style={{ whiteSpace: 'pre-line' }}>{projeto.padroesQualidade}</span></p>
                <p><strong>Premissas e Restrições:</strong> <br/><span style={{ whiteSpace: 'pre-line' }}>{projeto.premissasRestricoes}</span></p>
                <p><strong>Plano de Aquisições Externas:</strong> {projeto.planoAquisicoes}</p>
              </div>

              <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <div>
                  <div style={{ width: '250px', borderBottom: '1px solid black', marginBottom: '5px' }}></div>
                  <span>{projeto.gerente}<br/>Gerente de Projeto</span>
                </div>
                <div>
                  <div style={{ width: '250px', borderBottom: '1px solid black', marginBottom: '5px' }}></div>
                  <span>{projeto.patrocinador}<br/>Sponsor Executivo</span>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
      
      {/* Classe para ignorar botões na hora de imprimir o Ctrl+P do navegador */}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @media print {
          .no-print, button { display: none !important; }
          body { background-color: white !important; margin: 0; }
          .print-only-content { width: 100% !important; border: none !important; box-shadow: none !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}