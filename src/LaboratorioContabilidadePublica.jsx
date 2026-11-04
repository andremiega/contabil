import React, { useState } from 'react';

export default function LaboratorioContabilidadePublicaPratico({ mostrarToast }) {
  const [abaAtiva, setAbaAtiva] = useState('ppa');
  const [menuLateralAberto, setMenuLateralAberto] = useState(true);

  const dispararToast = (msg, tipo = 'sucesso') => {
    if (typeof mostrarToast === 'function') mostrarToast(msg, tipo);
  };

  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatPct = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';

  // ==========================================
  // ESTADOS DOS SIMULADORES PRÁTICOS (GOVTECH)
  // ==========================================

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
  const pessoalMax = loa.receitaPrevista * 0.54;

  const validacaoLoa = () => {
    let msg = 'LOA Válida! ';
    let tipo = 'sucesso';
    if (loa.receitaPrevista !== loa.despesaFixada) {
      msg = 'Erro: Receita Prevista deve ser igual à Despesa Fixada (Princípio do Equilíbrio).';
      tipo = 'erro';
    } else if (loa.saudePct < 15) {
      msg = 'Erro: Aplicação na Saúde abaixo do mínimo constitucional (15%).';
      tipo = 'erro';
    } else if (loa.educacaoPct < 25) {
      msg = 'Erro: Aplicação na Educação abaixo do mínimo constitucional (25%).';
      tipo = 'erro';
    } else if (loa.pessoalPct > 54) {
      msg = 'Alerta: Limite de despesa com pessoal ultrapassado (LRF).';
      tipo = 'erro';
    }
    dispararToast(msg, tipo);
  };

  // 2. Execução da Despesa (Empenho, Liquidação, Pagamento)
  const [despesa, setDespesa] = useState({
    dotacao: 150000,
    fornecedor: 'Construtora Alfa Ltda',
    valorEmpenho: '',
    estagio: 'planejamento', // planejamento, empenhado, liquidado, pago
    saldoDotacao: 150000
  });

  const empenharDespesa = () => {
    const valor = Number(despesa.valorEmpenho);
    if (!valor || valor <= 0) { dispararToast('Informe um valor válido para o empenho.', 'erro'); return; }
    if (valor > despesa.saldoDotacao) { dispararToast('Erro: Empenho excede o saldo da dotação orçamentária.', 'erro'); return; }
    setDespesa({ ...despesa, estagio: 'empenhado', saldoDotacao: despesa.saldoDotacao - valor });
    dispararToast('Nota de Empenho emitida com sucesso! Valor reservado.', 'sucesso');
  };

  const liquidarDespesa = () => {
    if (despesa.estagio !== 'empenhado') { dispararToast('Erro: A despesa deve ser empenhada antes da liquidação.', 'erro'); return; }
    setDespesa({ ...despesa, estagio: 'liquidado' });
    dispararToast('Despesa Liquidada! O serviço foi atestado/recebido.', 'sucesso');
  };

  const pagarDespesa = () => {
    if (despesa.estagio !== 'liquidado') { dispararToast('Erro: A despesa deve ser liquidada antes do pagamento.', 'erro'); return; }
    setDespesa({ ...despesa, estagio: 'pago' });
    dispararToast('Ordem Bancária (OB) emitida! Fornecedor pago.', 'sucesso');
  };

  const resetarDespesa = () => {
      setDespesa({ ...despesa, valorEmpenho: '', estagio: 'planejamento' });
  }

  // 3. Gestão Fiscal (LRF e RCL)
  const [lrf, setLrf] = useState({
    rcl: 120000000,
    despesaPessoal: 62000000
  });
  const comprometimentoRCL = lrf.rcl > 0 ? (lrf.despesaPessoal / lrf.rcl) * 100 : 0;
  
  let lrfStatus = { msg: 'Adequado (Abaixo do Limite de Alerta)', cor: '#10b981', acao: 'Nenhuma restrição legal.' };
  if (comprometimentoRCL > 54) {
    lrfStatus = { msg: 'ACIMA DO LIMITE MÁXIMO (54%)', cor: '#ef4444', acao: 'Obrigatório reduzir excedente em 2 quadrimestres. Sanções aplicáveis (bloqueio de repasses).' };
  } else if (comprometimentoRCL > 51.3) {
    lrfStatus = { msg: 'Acima do Limite Prudencial (51,3%)', cor: '#f59e0b', acao: 'Proibido criar cargos, conceder aumentos (salvo decisão judicial), contratar hora extra.' };
  } else if (comprometimentoRCL > 48.6) {
    lrfStatus = { msg: 'Acima do Limite de Alerta (48,6%)', cor: '#38bdf8', acao: 'Tribunal de Contas emite alerta. Gestão deve ter cautela.' };
  }

  // 4. PCASP (Plano de Contas) e Partidas Dobradas
  const [lancamentoPCASP, setLancamentoPCASP] = useState({ fato: 'arrecadacao_receita' });

  const pcaspExemplos = {
    arrecadacao_receita: [
      { sub: 'Orçamentário', debito: '6.2.1.1 Receita a Realizar', credito: '6.2.1.2 Receita Realizada' },
      { sub: 'Patrimonial', debito: '1.1.1.1 Caixa e Equivalentes de Caixa', credito: '4.1.1.1 Impostos, Taxas e Contribuições' },
      { sub: 'Controle', debito: '7.1.2.3 Controle da Disponibilidade', credito: '8.1.2.3 DDR (Disponibilidade por Destinação)' }
    ],
    empenho_despesa: [
      { sub: 'Orçamentário', debito: '6.2.2.1 Crédito Disponível', credito: '6.2.2.1 Crédito Empenhado a Liquidar' },
      { sub: 'Patrimonial', debito: 'Não há lançamento patrimonial no empenho (Regra Geral).', credito: '-' }
    ],
    liquidacao_despesa: [
      { sub: 'Orçamentário', debito: '6.2.2.1 Crédito Empenhado a Liquidar', credito: '6.2.2.1 Crédito Empenhado Liquidado a Pagar' },
      { sub: 'Patrimonial', debito: '3.3.1.1 VPD - Variação Patrimonial Diminutiva (Despesa)', credito: '2.1.1.1 Fornecedores a Pagar (Passivo)' }
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
  // ESTILOS (SIAFI / GOVTECH)
  // ==========================================
  const mainBg = '#0f172a'; const cardBg = '#1e293b'; const borderC = '#334155';
  const textP = '#f8fafc'; const textS = '#94a3b8';
  const accGov = '#1d4ed8'; // Azul Governo (SIAFI)
  const accD = '#10b981'; const accW = '#f59e0b'; const accE = '#ef4444';

  const containerStyle = { backgroundColor: mainBg, color: textP, fontFamily: 'system-ui, sans-serif', minHeight: '100vh', display: 'flex', flexDirection: 'column' };
  const navStyle = { backgroundColor: '#18181b', padding: '16px 24px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'center', position: 'sticky', top: 0, zIndex: 50, borderBottom: `1px solid ${borderC}` };
  const navBtnStyle = (ativo) => ({
    padding: '10px 16px', borderRadius: '8px', border: 'none',
    backgroundColor: ativo ? accGov : 'transparent', color: ativo ? '#ffffff' : textS,
    fontWeight: ativo ? 'bold' : '600', cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px'
  });
  
  const contentArea = { flex: 1, padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%', boxSizing: 'border-box' };
  const cardStyle = { backgroundColor: cardBg, padding: '24px', borderRadius: '12px', border: `1px solid ${borderC}`, marginBottom: '20px' };
  const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: `1px solid ${borderC}`, fontSize: '13px', backgroundColor: mainBg, color: '#38bdf8', outline: 'none', marginTop: '6px', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: 'bold', fontSize: '11px', color: textS, textTransform: 'uppercase' };
  const headerSection = { color: textP, margin: '0 0 16px 0', fontSize: '18px', fontWeight: 'bold', borderBottom: `1px solid ${borderC}`, paddingBottom: '10px' };
  const dicaStyle = { backgroundColor: '#1e3a8a', borderLeft: `4px solid #3b82f6`, padding: '16px', borderRadius: '8px', color: '#bfdbfe', fontSize: '13px', lineHeight: '1.6', marginBottom: '20px' };

  return (
    <div style={containerStyle}>
      
      {/* NAVEGAÇÃO SUPERIOR */}
      <div style={navStyle}>
        <div style={{ color: 'white', fontWeight: '900', fontSize: '16px', marginRight: '20px' }}>🏛️ SIAFI PRÁTICO (MCASP)</div>
        <button style={navBtnStyle(abaAtiva === 'ppa')} onClick={() => setAbaAtiva('ppa')}>1. Ciclo Orçamentário</button>
        <button style={navBtnStyle(abaAtiva === 'execucao')} onClick={() => setAbaAtiva('execucao')}>2. Execução (Empenho/Liq)</button>
        <button style={navBtnStyle(abaAtiva === 'lrf')} onClick={() => setAbaAtiva('lrf')}>3. Limites LRF (DTP)</button>
        <button style={navBtnStyle(abaAtiva === 'pcasp')} onClick={() => setAbaAtiva('pcasp')}>4. Partidas PCASP</button>
        <button style={navBtnStyle(abaAtiva === 'rap')} onClick={() => setAbaAtiva('rap')}>5. Restos a Pagar (RAP)</button>
      </div>

      <div style={contentArea}>

        {/* ========================================================= */}
        {/* ABA 1: CICLO ORÇAMENTÁRIO (LOA E EQUILÍBRIO)              */}
        {/* ========================================================= */}
        {abaAtiva === 'ppa' && (
          <div style={{ animation: 'fadeIn 0.4s' }}>
            <div style={dicaStyle}>
              <strong>O Paradigma do Orçamento Público:</strong> Diferente de uma empresa privada, o ente público só pode realizar despesas se houver autorização prévia no orçamento (LOA). Além disso, deve respeitar a Regra de Ouro (não se endividar para pagar custeio) e os mínimos constitucionais de Saúde (15%) e Educação (25%).
            </div>
            
            <div style={cardStyle}>
              <h3 style={headerSection}>Simulador de LOA (Lei Orçamentária Anual) - Município Fictício</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div><label style={labelStyle}>Receita Total Prevista (R$):</label><input type="number" style={inputStyle} value={loa.receitaPrevista} onChange={e => setLoa({...loa, receitaPrevista: Number(e.target.value)})} /></div>
                <div><label style={labelStyle}>Despesa Total Fixada (R$):</label><input type="number" style={inputStyle} value={loa.despesaFixada} onChange={e => setLoa({...loa, despesaFixada: Number(e.target.value)})} /></div>
                <div><label style={labelStyle}>Aplicação em Saúde (% da Receita):</label><input type="number" style={inputStyle} value={loa.saudePct} onChange={e => setLoa({...loa, saudePct: Number(e.target.value)})} /></div>
                <div><label style={labelStyle}>Aplicação em Educação (% da Receita):</label><input type="number" style={inputStyle} value={loa.educacaoPct} onChange={e => setLoa({...loa, educacaoPct: Number(e.target.value)})} /></div>
                <div><label style={labelStyle}>Despesa com Pessoal (Folha %):</label><input type="number" style={inputStyle} value={loa.pessoalPct} onChange={e => setLoa({...loa, pessoalPct: Number(e.target.value)})} /></div>
              </div>
              <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={validacaoLoa} style={{ padding: '12px 24px', backgroundColor: accGov, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Validar Orçamento no TCE</button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
               <div style={{ ...cardStyle, borderTop: `4px solid ${loa.receitaPrevista === loa.despesaFixada ? accD : accE}` }}>
                 <h4 style={{ margin: '0 0 10px 0' }}>Princípio do Equilíbrio</h4>
                 <div style={{ fontSize: '13px', color: textS }}>Receita Prevista: {formatMoeda(loa.receitaPrevista)}</div>
                 <div style={{ fontSize: '13px', color: textS }}>Despesa Fixada: {formatMoeda(loa.despesaFixada)}</div>
                 <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '10px', color: loa.receitaPrevista === loa.despesaFixada ? accD : accE }}>
                   {loa.receitaPrevista === loa.despesaFixada ? '✅ Orçamento Equilibrado' : '❌ Déficit/Superávit não ajustado'}
                 </div>
               </div>
               <div style={{ ...cardStyle, borderTop: `4px solid ${loa.saudePct >= 15 ? accD : accE}` }}>
                 <h4 style={{ margin: '0 0 10px 0' }}>Mínimo Constitucional (Saúde 15%)</h4>
                 <div style={{ fontSize: '13px', color: textS }}>Valor Mínimo Exigido: {formatMoeda(saudeMin)}</div>
                 <div style={{ fontSize: '13px', color: textS }}>Valor Informado ({loa.saudePct}%): {formatMoeda(loa.receitaPrevista * (loa.saudePct/100))}</div>
                 <div style={{ fontSize: '14px', fontWeight: 'bold', marginTop: '10px', color: loa.saudePct >= 15 ? accD : accE }}>
                   {loa.saudePct >= 15 ? '✅ Aprovado (Saúde)' : '❌ Rejeição de Contas (Constituição)'}
                 </div>
               </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 2: EXECUÇÃO DA DESPESA                                */}
        {/* ========================================================= */}
        {abaAtiva === 'execucao' && (
          <div style={{ animation: 'fadeIn 0.4s' }}>
            <div style={{...dicaStyle, backgroundColor: '#451a03', borderLeftColor: '#f59e0b', color: '#fef3c7'}}>
              <strong>A Rigidez do Gasto Público (Lei 4.320/64):</strong> Diferente da contabilidade privada, o governo não pode simplesmente transferir dinheiro para um fornecedor. A despesa obedece a um rito estrito: <strong>1. Empenho</strong> (reserva a dotação), <strong>2. Liquidação</strong> (atesta que o serviço foi feito) e <strong>3. Pagamento</strong> (ordem bancária).
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${borderC}`, paddingBottom: '15px', marginBottom: '20px' }}>
                <h3 style={{ margin: 0 }}>Terminal SIAFI: Execução de Despesa Orçamentária</h3>
                <div style={{ backgroundColor: '#0f172a', padding: '8px 16px', borderRadius: '8px', border: `1px solid ${accGov}`, color: '#60a5fa', fontWeight: 'bold' }}>
                  Dotação Orçamentária Original: {formatMoeda(despesa.dotacao)}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                <div><label style={labelStyle}>Fornecedor Vencedor da Licitação:</label><input type="text" style={inputStyle} value={despesa.fornecedor} readOnly /></div>
                <div><label style={labelStyle}>Valor a Empenhar (R$):</label><input type="number" style={inputStyle} value={despesa.valorEmpenho} onChange={e => setDespesa({...despesa, valorEmpenho: e.target.value})} disabled={despesa.estagio !== 'planejamento'} /></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', alignItems: 'center' }}>
                <div style={{ flex: 1, padding: '15px', borderRadius: '8px', border: `2px dashed ${despesa.estagio === 'planejamento' ? accGov : borderC}`, opacity: despesa.estagio === 'planejamento' ? 1 : 0.5, textAlign: 'center' }}>
                   <h4 style={{ margin: '0 0 10px 0', color: textP }}>Estágio 1: Empenho</h4>
                   <button onClick={empenharDespesa} disabled={despesa.estagio !== 'planejamento'} style={{ padding: '10px', backgroundColor: accGov, color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}>Emitir Nota de Empenho</button>
                </div>
                <div style={{ fontSize: '24px', color: textS }}>➔</div>
                <div style={{ flex: 1, padding: '15px', borderRadius: '8px', border: `2px dashed ${despesa.estagio === 'empenhado' ? accW : borderC}`, opacity: (despesa.estagio === 'empenhado' || despesa.estagio === 'liquidado' || despesa.estagio === 'pago') ? 1 : 0.5, textAlign: 'center' }}>
                   <h4 style={{ margin: '0 0 10px 0', color: textP }}>Estágio 2: Liquidação</h4>
                   <button onClick={liquidarDespesa} disabled={despesa.estagio !== 'empenhado'} style={{ padding: '10px', backgroundColor: accW, color: '#0f172a', border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}>Atestar Recebimento (NF)</button>
                </div>
                <div style={{ fontSize: '24px', color: textS }}>➔</div>
                <div style={{ flex: 1, padding: '15px', borderRadius: '8px', border: `2px dashed ${despesa.estagio === 'liquidado' ? accD : borderC}`, opacity: (despesa.estagio === 'liquidado' || despesa.estagio === 'pago') ? 1 : 0.5, textAlign: 'center' }}>
                   <h4 style={{ margin: '0 0 10px 0', color: textP }}>Estágio 3: Pagamento</h4>
                   <button onClick={pagarDespesa} disabled={despesa.estagio !== 'liquidado'} style={{ padding: '10px', backgroundColor: accD, color: '#0f172a', border: 'none', borderRadius: '6px', cursor: 'pointer', width: '100%', fontWeight: 'bold' }}>Emitir Ordem Bancária</button>
                </div>
              </div>

              <div style={{ marginTop: '24px', backgroundColor: mainBg, padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: textS }}>Status Atual: <strong>{despesa.estagio.toUpperCase()}</strong></span>
                <span style={{ fontSize: '14px', color: textP }}>Saldo Restante da Dotação: <strong style={{ color: accGov, fontSize: '18px' }}>{formatMoeda(despesa.saldoDotacao)}</strong></span>
                <button onClick={resetarDespesa} style={{ padding: '8px 12px', backgroundColor: 'transparent', border: `1px solid ${textS}`, color: textP, borderRadius: '6px', cursor: 'pointer' }}>Novo Lançamento</button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 3: GESTÃO FISCAL (LRF)                                */}
        {/* ========================================================= */}
        {abaAtiva === 'lrf' && (
          <div style={{ animation: 'fadeIn 0.4s' }}>
             <div style={{...dicaStyle, backgroundColor: '#022c22', borderLeftColor: '#10b981', color: '#a7f3d0'}}>
              <strong>O Coração da Lei de Responsabilidade Fiscal (LRF):</strong> A Despesa Total com Pessoal (DTP) é o indicador mais vigiado pelos Tribunais de Contas. Para os Municípios, o Executivo não pode gastar mais que 54% da Receita Corrente Líquida (RCL) com folha de pagamento.
            </div>

            <div style={cardStyle}>
              <h3 style={headerSection}>Relatório de Gestão Fiscal (RGF) - Executivo Municipal</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div><label style={labelStyle}>Receita Corrente Líquida (RCL - R$):</label><input type="number" style={inputStyle} value={lrf.rcl} onChange={e => setLrf({...lrf, rcl: Number(e.target.value)})} /></div>
                <div><label style={labelStyle}>Despesa Total com Pessoal (DTP - R$):</label><input type="number" style={inputStyle} value={lrf.despesaPessoal} onChange={e => setLrf({...lrf, despesaPessoal: Number(e.target.value)})} /></div>
              </div>

              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, backgroundColor: mainBg, padding: '20px', borderRadius: '12px', borderLeft: `6px solid ${lrfStatus.cor}`, borderTop: `1px solid ${borderC}`, borderRight: `1px solid ${borderC}`, borderBottom: `1px solid ${borderC}` }}>
                  <span style={{ fontSize: '13px', color: textS, textTransform: 'uppercase', fontWeight: 'bold' }}>Comprometimento da RCL</span>
                  <div style={{ fontSize: '42px', fontWeight: '900', color: lrfStatus.cor, margin: '10px 0' }}>{formatPct(comprometimentoRCL)}</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: textP }}>{lrfStatus.msg}</div>
                </div>
                
                <div style={{ flex: 1, backgroundColor: '#111827', padding: '20px', borderRadius: '12px', border: `1px solid ${borderC}` }}>
                  <h4 style={{ margin: '0 0 15px 0', color: textP, fontSize: '15px' }}>Implicações Legais e Sanções (TCE):</h4>
                  <p style={{ fontSize: '14px', lineHeight: '1.6', color: '#cbd5e1', margin: 0 }}>
                    {lrfStatus.acao}
                  </p>
                  
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ fontSize: '12px', color: textS, display: 'flex', justifyContent: 'space-between' }}><span>Limite Prudencial (51,3%):</span><span>{formatMoeda(lrf.rcl * 0.513)}</span></div>
                    <div style={{ fontSize: '12px', color: textS, display: 'flex', justifyContent: 'space-between', marginTop: '5px' }}><span>Limite Máximo (54%):</span><span>{formatMoeda(lrf.rcl * 0.54)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 4: PCASP (PARTIDAS DOBRADAS)                          */}
        {/* ========================================================= */}
        {abaAtiva === 'pcasp' && (
          <div style={{ animation: 'fadeIn 0.4s' }}>
             <div style={{...dicaStyle, backgroundColor: '#4c1d95', borderLeftColor: '#8b5cf6', color: '#ddd6fe'}}>
              <strong>O PCASP (Plano de Contas Aplicado ao Setor Público):</strong> A maior diferença para a contabilidade privada é que no setor público um único "Fato Gerador" (ex: empenhar uma despesa) dispara lançamentos simultâneos em até três subsistemas diferentes: Orçamentário, Patrimonial e de Controle.
            </div>

            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '18px' }}>Mecânica Contábil Pública (MCASP)</h3>
                <select style={{...inputStyle, width: '300px', marginTop: 0}} value={lancamentoPCASP.fato} onChange={e => setLancamentoPCASP({fato: e.target.value})}>
                  <option value="arrecadacao_receita">Arrecadação de Receita (IPTU)</option>
                  <option value="empenho_despesa">Estágio 1: Empenho de Despesa</option>
                  <option value="liquidacao_despesa">Estágio 2: Liquidação de Despesa</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {pcaspExemplos[lancamentoPCASP.fato].map((lanc, idx) => (
                  <div key={idx} style={{ backgroundColor: mainBg, padding: '16px', borderRadius: '8px', borderLeft: `4px solid ${lanc.sub === 'Orçamentário' ? accGov : lanc.sub === 'Patrimonial' ? accD : accW}` }}>
                    <h4 style={{ margin: '0 0 10px 0', color: textP, fontSize: '14px' }}>Subsistema {lanc.sub}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', fontFamily: 'monospace' }}>
                      <div style={{ color: '#38bdf8' }}><strong>DÉBITO:</strong> {lanc.debito}</div>
                      <div style={{ color: '#f59e0b' }}><strong>CRÉDITO:</strong> {lanc.credito}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 5: RESTOS A PAGAR (RAP)                               */}
        {/* ========================================================= */}
        {abaAtiva === 'rap' && (
          <div style={{ animation: 'fadeIn 0.4s' }}>
            <div style={dicaStyle}>
              <strong>O Paradigma do Fechamento do Ano (31/12):</strong> O que acontece com a despesa que foi empenhada, mas não deu tempo de pagar no ano civil? Ela é inscrita em "Restos a Pagar". Isso afeta o Balanço Financeiro e exige que a prefeitura tenha "disponibilidade de caixa" para cobrir essa dívida no ano seguinte.
            </div>

            <div style={cardStyle}>
              <h3 style={headerSection}>Auditoria de Restos a Pagar (Inscrição em 31/12)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '24px' }}>
                <div><label style={labelStyle}>Total Empenhado (R$):</label><input type="number" style={inputStyle} value={restos.empenhadoNL} onChange={e => setRestos({...restos, empenhadoNL: Number(e.target.value)})} /></div>
                <div><label style={labelStyle}>Deste Total, Liquidados (R$):</label><input type="number" style={inputStyle} value={restos.liquidado} onChange={e => setRestos({...restos, liquidado: Number(e.target.value)})} /></div>
                <div><label style={labelStyle}>Deste Total, Pagos (R$):</label><input type="number" style={inputStyle} value={restos.pago} onChange={e => setRestos({...restos, pago: Number(e.target.value)})} /></div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ backgroundColor: mainBg, padding: '20px', borderRadius: '12px', border: `1px solid ${borderC}`, borderTop: `4px solid ${accW}` }}>
                  <h4 style={{ margin: '0 0 10px 0', color: textP }}>RAP Processados</h4>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: accW, marginBottom: '10px' }}>{formatMoeda(rapProcessado)}</div>
                  <p style={{ fontSize: '12px', color: textS, margin: 0, lineHeight: '1.5' }}>
                    O fornecedor <strong>já entregou</strong> o produto (liquidou), mas a prefeitura não pagou. É dívida certa e compõe o Passivo Financeiro do Balanço.
                  </p>
                </div>
                <div style={{ backgroundColor: mainBg, padding: '20px', borderRadius: '12px', border: `1px solid ${borderC}`, borderTop: `4px solid ${accE}` }}>
                  <h4 style={{ margin: '0 0 10px 0', color: textP }}>RAP Não Processados</h4>
                  <div style={{ fontSize: '28px', fontWeight: 'bold', color: accE, marginBottom: '10px' }}>{formatMoeda(rapNaoProcessado)}</div>
                  <p style={{ fontSize: '12px', color: textS, margin: 0, lineHeight: '1.5' }}>
                    O fornecedor <strong>ainda não entregou</strong> o produto (não liquidou), mas o empenho foi garantido. Exige rigorosa análise no 1º ano de novo mandato (Lei 4.320).
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}