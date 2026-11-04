import React, { useState } from 'react';

export default function LaboratorioContabilidadePublicaPratico({ mostrarToast }) {
  // ==========================================
  // ESTADOS DOS SIMULADORES PRÁTICOS (GOVTECH)
  // ==========================================
  const [abaAtiva, setAbaAtiva] = useState('ppa');

  const dispararToast = (msg, tipo = 'sucesso') => {
    if (typeof mostrarToast === 'function') mostrarToast(msg, tipo);
  };

  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatPct = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';

  // 1. Planejamento (PPA, LDO, LOA)
  const [loa, setLoa] = useState({
    receitaPrevista: 50000000,
    despesaFixada: 50000000,
    saudePct: 15,
    educacaoPct: 25,
    pessoalPct: 54
  });

  const saudeMin = loa.receitaPrevista * 0.15;
  const educacaoMin = loa.receitaPrevista * 0.25;

  const validacaoLoa = () => {
    let msg = 'LOA Válida perante as normas constitucionais!';
    let tipo = 'sucesso';
    if (loa.receitaPrevista !== loa.despesaFixada) {
      msg = 'Erro: Receita Prevista deve ser igual à Despesa Fixada (Princípio do Equilíbrio).';
      tipo = 'erro';
    } else if (loa.saudePct < 15) {
      msg = 'Erro: Aplicação na Saúde abaixo do mínimo constitucional obrigatório (15%).';
      tipo = 'erro';
    } else if (loa.educacaoPct < 25) {
      msg = 'Erro: Aplicação na Educação abaixo do mínimo constitucional obrigatório (25%).';
      tipo = 'erro';
    } else if (loa.pessoalPct > 54) {
      msg = 'Alerta: Limite de despesa com pessoal ultrapassado conforme a LRF.';
      tipo = 'erro';
    }
    dispararToast(msg, tipo);
  };

  // 2. Execução da Despesa (Empenho, Liquidação, Pagamento)
  const [despesa, setDespesa] = useState({
    dotacao: 150000,
    fornecedor: 'Construtora Alfa Ltda (Licitação 04/2026)',
    valorEmpenho: '',
    estagio: 'planejamento', // planejamento, empenhado, liquidado, pago
    saldoDotacao: 150000
  });

  const empenharDespesa = () => {
    const valor = Number(despesa.valorEmpenho);
    if (!valor || valor <= 0) { dispararToast('Informe um valor válido para o empenho.', 'erro'); return; }
    if (valor > despesa.saldoDotacao) { dispararToast('Erro: Empenho excede o saldo da dotação orçamentária.', 'erro'); return; }
    setDespesa({ ...despesa, estagio: 'empenhado', saldoDotacao: despesa.saldoDotacao - valor });
    dispararToast('Nota de Empenho (NE) emitida! Saldo reservado na dotação.', 'sucesso');
  };

  const liquidarDespesa = () => {
    if (despesa.estagio !== 'empenhado') { dispararToast('Erro: A despesa deve ser empenhada antes da liquidação.', 'erro'); return; }
    setDespesa({ ...despesa, estagio: 'liquidado' });
    dispararToast('Despesa Liquidada! Atesto de entrega de serviço concluído.', 'sucesso');
  };

  const pagarDespesa = () => {
    if (despesa.estagio !== 'liquidado') { dispararToast('Erro: A despesa deve ser liquidada antes do pagamento.', 'erro'); return; }
    setDespesa({ ...despesa, estagio: 'pago' });
    dispararToast('Ordem Bancária (OB) emitida! Pagamento concluído via Conta Única.', 'sucesso');
  };

  const resetarDespesa = () => {
    setDespesa({ ...despesa, valorEmpenho: '', estagio: 'planejamento' });
  };

  // 3. Gestão Fiscal (LRF e RCL)
  const [lrf, setLrf] = useState({
    rcl: 120000000,
    despesaPessoal: 62000000
  });
  const comprometimentoRCL = lrf.rcl > 0 ? (lrf.despesaPessoal / lrf.rcl) * 100 : 0;
  
  let lrfStatus = { msg: 'Adequado (Abaixo do Limite de Alerta)', cor: '#0284c7', bg: '#f0f9ff', acao: 'Nenhuma restrição legal de contratação ou gastos.' };
  if (comprometimentoRCL > 54) {
    lrfStatus = { msg: 'ACIMA DO LIMITE MÁXIMO (54%)', cor: '#dc2626', bg: '#fef2f2', acao: 'Obrigatório reduzir excedente em 2 quadrimestres. Sanções do TCE e bloqueio de transferências voluntárias.' };
  } else if (comprometimentoRCL > 51.3) {
    lrfStatus = { msg: 'Acima do Limite Prudencial (51,3%)', cor: '#d97706', bg: '#fffbeb', acao: 'Vedada criação de cargos, reajustes salariais, novas contratações e pagamento de horas extras.' };
  } else if (comprometimentoRCL > 48.6) {
    lrfStatus = { msg: 'Acima do Limite de Alerta (48,6%)', cor: '#0369a1', bg: '#e0f2fe', acao: 'Tribunal de Contas emite notificação formal de alerta ao Gestor Público.' };
  }

  // 4. PCASP (Plano de Contas) e Partidas Dobradas
  const [lancamentoPCASP, setLancamentoPCASP] = useState({ fato: 'arrecadacao_receita' });

  const pcaspExemplos = {
    arrecadacao_receita: [
      { sub: 'Orçamentário', debito: '6.2.1.1 Receita a Realizar', credito: '6.2.1.2 Receita Realizada' },
      { sub: 'Patrimonial', debito: '1.1.1.1 Caixa e Equivalentes de Caixa', credito: '4.1.1.1 Impostos, Taxas e Contribuições (VPA)' },
      { sub: 'Controle', debito: '7.1.2.3 Controle da Disponibilidade por Destinação', credito: '8.1.2.3 Disponibilidade por Destinação de Recursos (DDR)' }
    ],
    empenho_despesa: [
      { sub: 'Orçamentário', debito: '6.2.2.1 Crédito Disponível', credito: '6.2.2.1 Crédito Empenhado a Liquidar' },
      { sub: 'Patrimonial', debito: 'Não afeta o subsistema patrimonial no empenho (Regra Geral MCASP)', credito: '-' }
    ],
    liquidacao_despesa: [
      { sub: 'Orçamentário', debito: '6.2.2.1 Crédito Empenhado a Liquidar', credito: '6.2.2.1 Crédito Empenhado Liquidado a Pagar' },
      { sub: 'Patrimonial', debito: '3.3.1.1 VPD - Variação Patrimonial Diminutiva (Custo/Despesa)', credito: '2.1.1.1 Fornecedores e Contas a Pagar (Passivo)' }
    ]
  };

  // 5. Restos a Pagar e SIAFI
  const [restos, setRestos] = useState({
    empenhadoNL: 500000,
    liquidado: 350000,
    pago: 300000
  });
  const rapProcessado = restos.liquidado - restos.pago;
  const rapNaoProcessado = restos.empenhadoNL - restos.liquidado;

  // ==========================================
  // PALETA AZUL CLARA & GOVTECH RESPONSIVO
  // ==========================================
  // Tema: Azul Céu / Azul Claro Sereno (#0284c7, #0284c7, #bae6fd, #f0f9ff)
  const azulHeader = '#0369a1';       // Azul profundo para barra superior
  const azulClaroAtivo = '#0284c7';   // Azul claro vívido para botões ativos
  const azulInativo = '#075985';      // Azul médio para botões em repouso
  const fundoAzulGeral = '#f0f9ff';   // Fundo geral azul clarinho
  const cardBranco = '#ffffff';       // Fundo dos cartões
  const bordaAzul = '#bae6fd';        // Borda suave azul claro
  const textoAzulForte = '#0c4a6e';   // Texto principal escuro para leitura perfeita
  const textoSuave = '#475569';       // Texto secundário

  // Botão de Navegação Horizontal - NÃO FIXO / ROLA COM A TELA NO CELULAR
  const navBtnStyle = (ativo) => ({
    padding: '10px 14px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: ativo ? azulClaroAtivo : azulInativo,
    color: '#ffffff',
    fontWeight: ativo ? '700' : '500',
    cursor: 'pointer',
    fontSize: '12.5px',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s ease',
    flex: '1 1 auto',
    textAlign: 'center'
  });

  const inputStyle = {
    width: '100%',
    padding: '11px 13px',
    borderRadius: '8px',
    border: `1px solid ${bordaAzul}`,
    fontSize: '13.5px',
    backgroundColor: '#ffffff',
    color: textoAzulForte,
    outline: 'none',
    marginTop: '5px',
    boxSizing: 'border-box',
    maxWidth: '100%'
  };

  const labelStyle = {
    fontWeight: '700',
    fontSize: '11.5px',
    color: textoSuave,
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
    display: 'block'
  };

  return (
    <div style={{ backgroundColor: fundoAzulGeral, color: textoAzulForte, fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%', overflowX: 'hidden', boxSizing: 'border-box' }}>
      
      {/* CABEÇALHO E MENU AZUL CLARO (NORMAL DOCUMENT FLOW - ROLA NATURALMENTE COM A TELA) */}
      <header style={{ backgroundColor: azulHeader, color: '#ffffff', padding: '16px 14px', width: '100%', boxSizing: 'border-box', borderBottom: `3px solid #38bdf8` }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center', textAlign: 'center' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ backgroundColor: '#0284c7', color: '#ffffff', padding: '3px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.8px' }}>
              GOVTECH • MCASP
            </span>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: '#e0f2fe' }}>
              🏛️ Laboratório de Contabilidade Pública & SIAFI
            </h1>
          </div>

          {/* MENU HORIZONTAL RESPONSIVO - NÃO FIXO / ROLA JUNTO */}
          <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', width: '100%', justifyContent: 'center' }} aria-label="Navegação da Contabilidade Pública">
            <button style={navBtnStyle(abaAtiva === 'ppa')} onClick={() => setAbaAtiva('ppa')}>1. Ciclo Orçamentário (LOA)</button>
            <button style={navBtnStyle(abaAtiva === 'execucao')} onClick={() => setAbaAtiva('execucao')}>2. Execução (Empenho/Liq)</button>
            <button style={navBtnStyle(abaAtiva === 'lrf')} onClick={() => setAbaAtiva('lrf')}>3. Limites LRF (DTP)</button>
            <button style={navBtnStyle(abaAtiva === 'pcasp')} onClick={() => setAbaAtiva('pcasp')}>4. Partidas PCASP</button>
            <button style={navBtnStyle(abaAtiva === 'rap')} onClick={() => setAbaAtiva('rap')}>5. Restos a Pagar (RAP)</button>
          </nav>

        </div>
      </header>

      {/* ÁREA DE CONTEÚDO RESPONSIVA (SEM TRANSBORDAMENTO) */}
      <main style={{ flex: 1, padding: '16px 12px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
        
        {/* ========================================================= */}
        {/* ABA 1: CICLO ORÇAMENTÁRIO (LOA E EQUILÍBRIO)              */}
        {/* ========================================================= */}
        {abaAtiva === 'ppa' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            
            <div style={{ backgroundColor: '#e0f2fe', borderLeft: '4px solid #0284c7', padding: '14px', borderRadius: '8px', color: '#0369a1', fontSize: '13px', lineHeight: '1.6' }}>
              <strong>Planejamento e Orçamento Público:</strong> Na administração pública, nenhuma despesa pode ser efetuada sem prévia autorização legislativa na LOA. A lei orçamentária deve manter o equilíbrio fiscal e assegurar os pisos constitucionais de Saúde (mínimo 15%) e Educação (mínimo 25%).
            </div>
            
            <div style={{ backgroundColor: cardBranco, padding: '18px 14px', borderRadius: '12px', border: `1px solid ${bordaAzul}`, boxShadow: '0 2px 4px rgba(2,132,199,0.05)', width: '100%', boxSizing: 'border-box' }}>
              <div style={{ borderLeft: '4px solid #0284c7', paddingLeft: '10px', marginBottom: '14px' }}>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: textoAzulForte }}>Simulador da Lei Orçamentária Anual (LOA)</h2>
                <span style={{ fontSize: '12px', color: textoSuave }}>Validação de consistência e conformidade com os limites fiscais</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', width: '100%' }}>
                <div>
                  <label style={labelStyle}>Receita Total Prevista (R$):</label>
                  <input type="number" style={inputStyle} value={loa.receitaPrevista} onChange={e => setLoa({...loa, receitaPrevista: Number(e.target.value)})} />
                </div>
                <div>
                  <label style={labelStyle}>Despesa Total Fixada (R$):</label>
                  <input type="number" style={inputStyle} value={loa.despesaFixada} onChange={e => setLoa({...loa, despesaFixada: Number(e.target.value)})} />
                </div>
                <div>
                  <label style={labelStyle}>Aplicação em Saúde (% Receita):</label>
                  <input type="number" style={inputStyle} value={loa.saudePct} onChange={e => setLoa({...loa, saudePct: Number(e.target.value)})} />
                </div>
                <div>
                  <label style={labelStyle}>Aplicação em Educação (% Receita):</label>
                  <input type="number" style={inputStyle} value={loa.educacaoPct} onChange={e => setLoa({...loa, educacaoPct: Number(e.target.value)})} />
                </div>
                <div>
                  <label style={labelStyle}>Despesa com Pessoal (% Folha):</label>
                  <input type="number" style={inputStyle} value={loa.pessoalPct} onChange={e => setLoa({...loa, pessoalPct: Number(e.target.value)})} />
                </div>
              </div>

              <button 
                onClick={validacaoLoa} 
                style={{ marginTop: '16px', padding: '12px 20px', backgroundColor: azulClaroAtivo, color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: '700', width: '100%', cursor: 'pointer', fontSize: '13.5px', boxShadow: '0 2px 4px rgba(2,132,199,0.2)' }}
              >
                Validar Orçamento no Tribunal de Contas (TCE)
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', width: '100%' }}>
              <div style={{ backgroundColor: cardBranco, padding: '16px', borderRadius: '10px', border: `1px solid ${bordaAzul}`, borderTop: `4px solid ${loa.receitaPrevista === loa.despesaFixada ? '#0284c7' : '#dc2626'}` }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: textoAzulForte }}>Princípio do Equilíbrio</h3>
                <div style={{ fontSize: '12.5px', color: textoSuave }}>Receita Prevista: {formatMoeda(loa.receitaPrevista)}</div>
                <div style={{ fontSize: '12.5px', color: textoSuave }}>Despesa Fixada: {formatMoeda(loa.despesaFixada)}</div>
                <div style={{ fontSize: '13.5px', fontWeight: '800', marginTop: '8px', color: loa.receitaPrevista === loa.despesaFixada ? '#0284c7' : '#dc2626' }}>
                  {loa.receitaPrevista === loa.despesaFixada ? '✅ Orçamento Equilibrado' : '❌ Desequilíbrio Orçamentário'}
                </div>
              </div>

              <div style={{ backgroundColor: cardBranco, padding: '16px', borderRadius: '10px', border: `1px solid ${bordaAzul}`, borderTop: `4px solid ${loa.saudePct >= 15 ? '#0284c7' : '#dc2626'}` }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: textoAzulForte }}>Piso Constitucional (Saúde 15%)</h3>
                <div style={{ fontSize: '12.5px', color: textoSuave }}>Piso Mínimo Exigido: {formatMoeda(saudeMin)}</div>
                <div style={{ fontSize: '12.5px', color: textoSuave }}>Valor Previsto ({loa.saudePct}%): {formatMoeda(loa.receitaPrevista * (loa.saudePct/100))}</div>
                <div style={{ fontSize: '13.5px', fontWeight: '800', marginTop: '8px', color: loa.saudePct >= 15 ? '#0284c7' : '#dc2626' }}>
                  {loa.saudePct >= 15 ? '✅ Atende ao Art. 198 da CF' : '❌ Risco de Rejeição de Contas'}
                </div>
              </div>
            </div>

          </section>
        )}

        {/* ========================================================= */}
        {/* ABA 2: EXECUÇÃO DA DESPESA (SIAFI)                        */}
        {/* ========================================================= */}
        {abaAtiva === 'execucao' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            
            <div style={{ backgroundColor: '#e0f2fe', borderLeft: '4px solid #0284c7', padding: '14px', borderRadius: '8px', color: '#0369a1', fontSize: '13px', lineHeight: '1.6' }}>
              <strong>Os Três Estágios da Despesa (Lei 4.320/64):</strong> No setor público não há pagamento sem prévio empenho e ateste de liquidação. O <strong>Empenho</strong> reserva a dotação; a <strong>Liquidação</strong> atesta que o bem/serviço foi entregue; o <strong>Pagamento</strong> expede a Ordem Bancária.
            </div>

            <div style={{ backgroundColor: cardBranco, padding: '18px 14px', borderRadius: '12px', border: `1px solid ${bordaAzul}`, width: '100%', boxSizing: 'border-box' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: textoAzulForte }}>Terminal SIAFI: Execução de Despesa Orçamentária</h2>
                <div style={{ backgroundColor: '#e0f2fe', padding: '6px 12px', borderRadius: '6px', border: `1px solid ${bordaAzul}`, color: '#0369a1', fontWeight: '800', fontSize: '12.5px' }}>
                  Dotação Orçamentária: {formatMoeda(despesa.dotacao)}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '18px', width: '100%' }}>
                <div>
                  <label style={labelStyle}>Fornecedor Vencedor:</label>
                  <input type="text" style={inputStyle} value={despesa.fornecedor} readOnly />
                </div>
                <div>
                  <label style={labelStyle}>Valor a Empenhar (R$):</label>
                  <input type="number" style={inputStyle} placeholder="Ex: 50000" value={despesa.valorEmpenho} onChange={e => setDespesa({...despesa, valorEmpenho: e.target.value})} disabled={despesa.estagio !== 'planejamento'} />
                </div>
              </div>

              {/* ETAPAS DA DESPESA - FLEXÍVEL E TOTALMENTE RESPONSIVO EM QUALQUER CELULAR */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', width: '100%' }}>
                
                {/* 1. Empenho */}
                <div style={{ padding: '14px', borderRadius: '8px', border: `2px solid ${despesa.estagio === 'planejamento' ? azulClaroAtivo : bordaAzul}`, backgroundColor: despesa.estagio === 'planejamento' ? '#f0f9ff' : '#ffffff', textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '13.5px', color: textoAzulForte }}>Estágio 1: Empenho</h3>
                  <button onClick={empenharDespesa} disabled={despesa.estagio !== 'planejamento'} style={{ padding: '9px 12px', backgroundColor: azulClaroAtivo, color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%', fontWeight: '700', fontSize: '12px' }}>
                    Emitir Nota de Empenho (NE)
                  </button>
                </div>

                {/* 2. Liquidação */}
                <div style={{ padding: '14px', borderRadius: '8px', border: `2px solid ${despesa.estagio === 'empenhado' ? '#f59e0b' : bordaAzul}`, backgroundColor: despesa.estagio === 'empenhado' ? '#fffbeb' : '#ffffff', textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '13.5px', color: textoAzulForte }}>Estágio 2: Liquidação</h3>
                  <button onClick={liquidarDespesa} disabled={despesa.estagio !== 'empenhado'} style={{ padding: '9px 12px', backgroundColor: '#f59e0b', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%', fontWeight: '700', fontSize: '12px' }}>
                    Atestar Recebimento / NF
                  </button>
                </div>

                {/* 3. Pagamento */}
                <div style={{ padding: '14px', borderRadius: '8px', border: `2px solid ${despesa.estagio === 'liquidado' ? '#10b981' : bordaAzul}`, backgroundColor: despesa.estagio === 'liquidado' ? '#f0fdf4' : '#ffffff', textAlign: 'center' }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '13.5px', color: textoAzulForte }}>Estágio 3: Pagamento</h3>
                  <button onClick={pagarDespesa} disabled={despesa.estagio !== 'liquidado'} style={{ padding: '9px 12px', backgroundColor: '#10b981', color: '#ffffff', border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%', fontWeight: '700', fontSize: '12px' }}>
                    Emitir Ordem Bancária (OB)
                  </button>
                </div>

              </div>

              <div style={{ marginTop: '16px', backgroundColor: '#e0f2fe', padding: '12px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '13px', color: '#0369a1' }}>Status Atual: <strong>{despesa.estagio.toUpperCase()}</strong></span>
                <span style={{ fontSize: '13px', color: textoAzulForte }}>Saldo Restante da Dotação: <strong>{formatMoeda(despesa.saldoDotacao)}</strong></span>
                <button onClick={resetarDespesa} style={{ padding: '6px 12px', backgroundColor: '#ffffff', border: `1px solid ${bordaAzul}`, color: textoAzulForte, borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' }}>
                  Reiniciar
                </button>
              </div>

            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* ABA 3: GESTÃO FISCAL (LRF)                                */}
        {/* ========================================================= */}
        {abaAtiva === 'lrf' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            
            <div style={{ backgroundColor: '#e0f2fe', borderLeft: '4px solid #0284c7', padding: '14px', borderRadius: '8px', color: '#0369a1', fontSize: '13px', lineHeight: '1.6' }}>
              <strong>Controle Fiscal e Pessoal (LC 101/2000):</strong> A Despesa Total com Pessoal (DTP) do Poder Executivo Municipal não pode exceder 54% da Receita Corrente Líquida (RCL). Ao atingir 51,3% (Limite Prudencial), acionam-se vedações imediatas.
            </div>

            <div style={{ backgroundColor: cardBranco, padding: '18px 14px', borderRadius: '12px', border: `1px solid ${bordaAzul}`, width: '100%', boxSizing: 'border-box' }}>
              <div style={{ borderLeft: '4px solid #0284c7', paddingLeft: '10px', marginBottom: '14px' }}>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: textoAzulForte }}>Relatório de Gestão Fiscal (RGF) - Análise de Pessoal</h2>
                <span style={{ fontSize: '12px', color: textoSuave }}>Cálculo dos limites de Alerta (48,6%), Prudencial (51,3%) e Máximo (54%)</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '18px', width: '100%' }}>
                <div>
                  <label style={labelStyle}>Receita Corrente Líquida (RCL - R$):</label>
                  <input type="number" style={inputStyle} value={lrf.rcl} onChange={e => setLrf({...lrf, rcl: Number(e.target.value)})} />
                </div>
                <div>
                  <label style={labelStyle}>Despesa Total com Pessoal (DTP - R$):</label>
                  <input type="number" style={inputStyle} value={lrf.despesaPessoal} onChange={e => setLrf({...lrf, despesaPessoal: Number(e.target.value)})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', width: '100%' }}>
                <div style={{ backgroundColor: lrfStatus.bg, padding: '16px', borderRadius: '10px', borderLeft: `5px solid ${lrfStatus.cor}`, border: `1px solid ${bordaAzul}` }}>
                  <span style={{ fontSize: '11.5px', color: textoSuave, textTransform: 'uppercase', fontWeight: '800' }}>Comprometimento da RCL</span>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: lrfStatus.cor, margin: '6px 0' }}>{formatPct(comprometimentoRCL)}</div>
                  <div style={{ fontSize: '14px', fontWeight: '800', color: textoAzulForte }}>{lrfStatus.msg}</div>
                </div>

                <div style={{ backgroundColor: '#fcfdfe', padding: '16px', borderRadius: '10px', border: `1px solid ${bordaAzul}` }}>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '13.5px', color: textoAzulForte, fontWeight: '800' }}>Parecer e Ações Recomendadas:</h3>
                  <p style={{ fontSize: '12.5px', lineHeight: '1.5', color: textoSuave, margin: 0 }}>{lrfStatus.acao}</p>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* ========================================================= */}
        {/* ABA 4: PCASP (PARTIDAS DOBRADAS)                          */}
        {/* ========================================================= */}
        {abaAtiva === 'pcasp' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            
            <div style={{ backgroundColor: '#e0f2fe', borderLeft: '4px solid #0284c7', padding: '14px', borderRadius: '8px', color: '#0369a1', fontSize: '13px', lineHeight: '1.6' }}>
              <strong>Mecânica Contábil do PCASP:</strong> Na contabilidade pública, os fatos são escriturados simultaneamente em três subsistemas autônomos: <strong>Orçamentário</strong> (controle dos créditos e autorizações), <strong>Patrimonial</strong> (variações que afetam o saldo líquido) e <strong>Controle</strong> (atos potenciais e disponibilidades).
            </div>

            <div style={{ backgroundColor: cardBranco, padding: '18px 14px', borderRadius: '12px', border: `1px solid ${bordaAzul}`, width: '100%', boxSizing: 'border-box' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: textoAzulForte }}>Lançamentos Contábeis Concomitantes</h2>
                <select style={{ ...inputStyle, width: 'auto', minWidth: '220px', marginTop: 0 }} value={lancamentoPCASP.fato} onChange={e => setLancamentoPCASP({fato: e.target.value})}>
                  <option value="arrecadacao_receita">Arrecadação de Receita (IPTU)</option>
                  <option value="empenho_despesa">Estágio 1: Empenho da Despesa</option>
                  <option value="liquidacao_despesa">Estágio 2: Liquidação da Despesa</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
                {pcaspExemplos[lancamentoPCASP.fato].map((lanc, idx) => (
                  <div key={idx} style={{ backgroundColor: '#f0f9ff', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #0284c7', border: `1px solid ${bordaAzul}` }}>
                    <span style={{ fontSize: '11px', fontWeight: '800', color: '#0369a1', textTransform: 'uppercase' }}>Subsistema {lanc.sub}</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12.5px', fontFamily: 'monospace', marginTop: '6px' }}>
                      <div style={{ color: '#0284c7' }}><strong>DÉBITO:</strong> {lanc.debito}</div>
                      <div style={{ color: '#0369a1' }}><strong>CRÉDITO:</strong> {lanc.credito}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>
        )}

        {/* ========================================================= */}
        {/* ABA 5: RESTOS A PAGAR (RAP)                               */}
        {/* ========================================================= */}
        {abaAtiva === 'rap' && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            
            <div style={{ backgroundColor: '#e0f2fe', borderLeft: '4px solid #0284c7', padding: '14px', borderRadius: '8px', color: '#0369a1', fontSize: '13px', lineHeight: '1.6' }}>
              <strong>Encerramento de Exercício (31/12) e Restos a Pagar:</strong> Despesas empenhadas e não pagas no ano financeiro são inscritas em Restos a Pagar. Os <strong>Processados</strong> são bens já entregues (direito adquirido pelo credor); os <strong>Não Processados</strong> exigem disponibilidade de caixa suficiente segundo o Art. 42 da LRF.
            </div>

            <div style={{ backgroundColor: cardBranco, padding: '18px 14px', borderRadius: '12px', border: `1px solid ${bordaAzul}`, width: '100%', boxSizing: 'border-box' }}>
              <div style={{ borderLeft: '4px solid #0284c7', paddingLeft: '10px', marginBottom: '14px' }}>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: textoAzulForte }}>Inscrição e Controle de Restos a Pagar (RAP)</h2>
                <span style={{ fontSize: '12px', color: textoSuave }}>Apuração contábil em 31 de dezembro para fechamento do Balanço Financeiro</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '18px', width: '100%' }}>
                <div>
                  <label style={labelStyle}>Total Empenhado (R$):</label>
                  <input type="number" style={inputStyle} value={restos.empenhadoNL} onChange={e => setRestos({...restos, empenhadoNL: Number(e.target.value)})} />
                </div>
                <div>
                  <label style={labelStyle}>Liquidados no Exercício (R$):</label>
                  <input type="number" style={inputStyle} value={restos.liquidado} onChange={e => setRestos({...restos, liquidado: Number(e.target.value)})} />
                </div>
                <div>
                  <label style={labelStyle}>Pagos até 31/12 (R$):</label>
                  <input type="number" style={inputStyle} value={restos.pago} onChange={e => setRestos({...restos, pago: Number(e.target.value)})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', width: '100%' }}>
                <div style={{ backgroundColor: '#f0f9ff', padding: '16px', borderRadius: '10px', border: `1px solid ${bordaAzul}`, borderTop: '4px solid #0284c7' }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '14px', color: textoAzulForte }}>Restos a Pagar Processados</h3>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#0284c7', marginBottom: '6px' }}>{formatMoeda(rapProcessado)}</div>
                  <p style={{ fontSize: '12px', color: textoSuave, margin: 0, lineHeight: '1.5' }}>Serviço atestado e entregue. Compõe passivo financeiro certo exigível de imediato.</p>
                </div>

                <div style={{ backgroundColor: '#f0f9ff', padding: '16px', borderRadius: '10px', border: `1px solid ${bordaAzul}`, borderTop: '4px solid #0369a1' }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: '14px', color: textoAzulForte }}>Restos a Pagar Não Processados</h3>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#0369a1', marginBottom: '6px' }}>{formatMoeda(rapNaoProcessado)}</div>
                  <p style={{ fontSize: '12px', color: textoSuave, margin: 0, lineHeight: '1.5' }}>Empenho vigente sem entrega do objeto até 31/12. Depende de liquidação futura ou cancelamento.</p>
                </div>
              </div>

            </div>
          </section>
        )}

      </main>
    </div>
  );
}