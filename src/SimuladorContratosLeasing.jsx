import React, { useState, useMemo } from 'react';

export default function SimuladorContratosLeasing({ mostrarToast, registrarFatoGerador }) {
  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatNum = (v, dec = 2) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

  // Estado do Simulador de Contratos (CPC 06)
  const [params, setParams] = useState({
    objetoContrato: 'Galpão Logístico e Frota de Caminhões',
    valorParcela: 15000.00, // Parcela mensal
    prazoMeses: 60, // Prazo do contrato em meses (5 anos)
    taxaDesconto: 1.5, // Taxa de juros incremental (Custo de oportunidade % a.m.)
  });

  const [abaAtiva, setAbaAtiva] = useState('parametros');
  const [jaContabilizado, setJaContabilizado] = useState(false);

  // ==========================================
  // MOTOR DE CÁLCULO DE LEASING (VP E AMORTIZAÇÃO)
  // ==========================================
  const calculos = useMemo(() => {
    const pmt = Number(params.valorParcela) || 0;
    const n = Number(params.prazoMeses) || 1;
    const i = (Number(params.taxaDesconto) || 0) / 100;

    let valorPresente = 0;
    
    if (i > 0) {
      valorPresente = pmt * ((1 - Math.pow(1 + i, -n)) / i);
    } else {
      valorPresente = pmt * n; 
    }

    const valorTotalContrato = pmt * n;
    const jurosEmbutidos = valorTotalContrato - valorPresente;
    const depreciacaoMensal = valorPresente / n;

    const tabelaAmortizacao = [];
    let saldoDevedor = valorPresente;

    for (let mes = 1; mes <= n; mes++) {
      const jurosMes = saldoDevedor * i;
      const amortizacaoMes = pmt - jurosMes;
      saldoDevedor -= amortizacaoMes;
      
      if (mes <= 12 || mes === n) {
        tabelaAmortizacao.push({
          mes,
          pmt,
          juros: jurosMes,
          amortizacao: amortizacaoMes,
          saldoFinal: Math.max(0, saldoDevedor)
        });
      }
    }

    return {
      valorPresente,
      valorTotalContrato,
      jurosEmbutidos,
      depreciacaoMensal,
      tabelaAmortizacao
    };
  }, [params]);

  // ==========================================
  // DISPARO PARA O LIVRO DIÁRIO
  // ==========================================
  const handleContabilizarContrato = () => {
    if (!calculos) return;
    if (jaContabilizado) {
      if (typeof mostrarToast === 'function') mostrarToast('Este contrato já foi capitalizado!', 'aviso');
      return;
    }
    if (typeof registrarFatoGerador !== 'function') {
      if (typeof mostrarToast === 'function') mostrarToast('Erro de integração: Motor Diário ausente.', 'erro');
      return;
    }

    try {
      registrarFatoGerador(
        `Capitalização de Contrato CPC06 - ${params.objetoContrato}`,
        calculos.valorPresente,
        'Compliance/Contratos',
        ['1.2.03.01'], 
        ['2.1.04.01']  
      );

      setJaContabilizado(true);
      if (typeof mostrarToast === 'function') mostrarToast('Contrato auditado e capitalizado com sucesso no Livro Diário!', 'sucesso');
    } catch (e) {
      if (typeof mostrarToast === 'function') mostrarToast('Erro ao integrar com o Livro Diário.', 'erro');
    }
  };

  const resetarSimulador = () => {
    setJaContabilizado(false);
    if (typeof mostrarToast === 'function') mostrarToast('Painel limpo para análise de um novo contrato.', 'sucesso');
  };

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#0d9488', color: 'white', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>COMPLIANCE</span>
            <span style={{ fontSize: '17px', fontWeight: '800', wordBreak: 'break-word' }}>Arrendamentos (Leasing - CPC 06)</span>
          </div>
          <p style={{ margin: 0, color: '#64748b', fontSize: '13px', wordBreak: 'break-word' }}>Avalie contratos longos, calcule o Valor Presente e neutralize riscos de auditoria.</p>
        </div>
        
        {/* NAVEGAÇÃO INTERNA */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <button onClick={() => setAbaAtiva('parametros')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'parametros' ? '#0d9488' : 'transparent', color: abaAtiva === 'parametros' ? 'white' : '#64748b' }}>⚙️ Setup</button>
          <button onClick={() => setAbaAtiva('tabela')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'tabela' ? '#0d9488' : 'transparent', color: abaAtiva === 'tabela' ? 'white' : '#64748b' }}>📉 Amortização</button>
          <button onClick={() => setAbaAtiva('memoria')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'memoria' ? '#0d9488' : 'transparent', color: abaAtiva === 'memoria' ? 'white' : '#64748b' }}>🧠 Regras</button>
          <button onClick={() => setAbaAtiva('contabilidade')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'contabilidade' ? '#0d9488' : 'transparent', color: abaAtiva === 'contabilidade' ? 'white' : '#64748b' }}>📖 Diário</button>
        </div>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', minHeight: '500px', boxSizing: 'border-box', width: '100%' }}>
        
        {/* ========================================================
            ABA 1: PARÂMETROS DO CONTRATO
            ======================================================== */}
        {abaAtiva === 'parametros' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            
            {/* PAINEL DE INPUTS */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', wordBreak: 'break-word' }}>📄 Detalhes do Acordo Comercial</h3>
                <button onClick={resetarSimulador} style={{ background: 'none', border: 'none', color: '#0d9488', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>🔄 Limpar Dados</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0 }}>
                  <label htmlFor="cObjeto" style={labelStyle}>Objeto do Contrato de Arrendamento:</label>
                  <input id="cObjeto" name="cObjeto" type="text" style={inputStyle} value={params.objetoContrato} onChange={e => {setParams({...params, objetoContrato: e.target.value}); setJaContabilizado(false);}} placeholder="Ex: Aluguel de Sede, Frota de Veículos..." />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '12px', boxSizing: 'border-box' }}>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="cParcela" style={labelStyle}>Valor da Parcela Mensal (R$):</label>
                    <input id="cParcela" name="cParcela" type="number" style={{...inputStyle, borderColor: '#5eead4', backgroundColor: '#f0fdfa'}} value={params.valorParcela} onChange={e => {setParams({...params, valorParcela: e.target.value}); setJaContabilizado(false);}} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="cPrazo" style={labelStyle}>Prazo de Duração (Meses):</label>
                    <input id="cPrazo" name="cPrazo" type="number" style={inputStyle} value={params.prazoMeses} onChange={e => {setParams({...params, prazoMeses: e.target.value}); setJaContabilizado(false);}} />
                  </div>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca', marginTop: '6px', boxSizing: 'border-box', minWidth: 0 }}>
                  <label htmlFor="cTaxa" style={{ ...labelStyle, color: '#991b1b' }}>Taxa Incremental de Empréstimo (% a.m.):</label>
                  <input id="cTaxa" name="cTaxa" type="number" step="0.1" style={{...inputStyle, borderColor: '#fca5a5'}} value={params.taxaDesconto} onChange={e => {setParams({...params, taxaDesconto: e.target.value}); setJaContabilizado(false);}} />
                  <span style={{ fontSize: '11px', color: '#991b1b', marginTop: '4px', display: 'block', wordBreak: 'break-word' }}>*Taxa de juros anual/mensal implícita ou de oportunidade.</span>
                </div>
              </div>
            </div>

            {/* PAINEL DE RESULTADOS (DIAGNOSTICO CPC 06) */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', wordBreak: 'break-word' }}>🔬 Diagnóstico de Conformidade (IFRS 16)</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', flexWrap: 'wrap', gap: '6px' }}>
                  <span>Valor Nominal do Contrato:</span>
                  <strong style={{ color: '#0f172a', wordBreak: 'break-word' }}>{formatMoeda(calculos.valorTotalContrato)}</strong>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#dc2626', flexWrap: 'wrap', gap: '6px' }}>
                  <span>(-) Juros Embutidos nas Parcelas:</span>
                  <strong style={{ wordBreak: 'break-word' }}>{formatMoeda(calculos.jurosEmbutidos)}</strong>
                </div>

                <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '16px', borderRadius: '10px', marginTop: '6px', textAlign: 'center', boxSizing: 'border-box' }}>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>VALOR PRESENTE (Ativo de Direito de Uso)</div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#2dd4bf', wordBreak: 'break-word' }}>
                    {formatMoeda(calculos.valorPresente)}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', padding: '12px', borderRadius: '10px', marginTop: '6px', borderLeft: '4px solid #0d9488', boxSizing: 'border-box' }}>
                  <strong style={{ fontSize: '12px', color: '#0f766e', display: 'block', marginBottom: '6px' }}>Impacto Operacional Mensal Projetado:</strong>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#115e59', marginTop: '4px', flexWrap: 'wrap', gap: '4px' }}>
                    <span>Despesa com Depreciação:</span>
                    <strong style={{ wordBreak: 'break-word' }}>{formatMoeda(calculos.depreciacaoMensal)} / mês</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#991b1b', marginTop: '4px', flexWrap: 'wrap', gap: '4px' }}>
                    <span>Despesa com Juros (Mês 1):</span>
                    <strong style={{ wordBreak: 'break-word' }}>{formatMoeda(calculos.tabelaAmortizacao[0]?.juros)} / mês</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 2: TABELA DE AMORTIZAÇÃO
            ======================================================== */}
        {abaAtiva === 'tabela' && (
          <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#0f172a', wordBreak: 'break-word' }}>📉 Tabela de Amortização do Passivo (PRICE)</h2>
            <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '20px', wordBreak: 'break-word' }}>A cada parcela paga de {formatMoeda(params.valorParcela)}, uma parte é Despesa Financeira (Juros) na DRE, e a outra reduz o Passivo. Abaixo, os 12 primeiros meses.</p>
            
            <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'right', minWidth: '550px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                    <th style={{ padding: '12px 14px', textAlign: 'center' }}>Mês</th>
                    <th style={{ padding: '12px 14px' }}>Parcela Paga (R$)</th>
                    <th style={{ padding: '12px 14px', color: '#fca5a5' }}>Despesa Juros (DRE)</th>
                    <th style={{ padding: '12px 14px', color: '#6ee7b7' }}>Amortização (Passivo)</th>
                    <th style={{ padding: '12px 14px' }}>Saldo Devedor (Balanço)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 'bold' }}>0</td>
                    <td style={{ padding: '10px 14px' }}>—</td>
                    <td style={{ padding: '10px 14px' }}>—</td>
                    <td style={{ padding: '10px 14px' }}>—</td>
                    <td style={{ padding: '10px 14px', fontWeight: '900', color: '#0f172a' }}>{formatMoeda(calculos.valorPresente)}</td>
                  </tr>
                  {calculos.tabelaAmortizacao.map((p) => (
                    <React.Fragment key={p.mes}>
                      {p.mes === params.prazoMeses && params.prazoMeses > 12 && (
                        <tr style={{ backgroundColor: '#f8fafc' }}><td colSpan="5" style={{ padding: '10px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>... salto no tempo ...</td></tr>
                      )}
                      <tr style={{ borderBottom: '1px dashed #e2e8f0' }}>
                        <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 'bold' }}>{p.mes}</td>
                        <td style={{ padding: '10px 14px', color: '#475569', fontWeight: 'bold' }}>{formatMoeda(p.pmt)}</td>
                        <td style={{ padding: '10px 14px', color: '#dc2626' }}>{formatMoeda(p.juros)}</td>
                        <td style={{ padding: '10px 14px', color: '#16a34a' }}>{formatMoeda(p.amortizacao)}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 'bold', color: '#0f766e' }}>{formatMoeda(p.saldoFinal)}</td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 3: MEMÓRIA DE CÁLCULO E REGRAS (COMPLIANCE)
            ======================================================== */}
        {abaAtiva === 'memoria' && (
          <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#0f172a', wordBreak: 'break-word' }}>🧠 Auditoria de Contratos e a Norma CPC 06 (R2)</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
              
              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 10px 0', color: '#0d9488', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px', wordBreak: 'break-word' }}><span>🏢</span> O Fim do "Fora do Balanço"</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.6', wordBreak: 'break-word' }}>
                  No passado, assinar um contrato de aluguel por 5 anos não aparecia nas dívidas do Balanço. O IFRS 16 (CPC 06) corrigiu isso: a empresa agora é obrigada a reconhecer o direito de usar o galpão/frota como um <strong>Ativo</strong> e a obrigação de pagar os 5 anos como uma <strong>Dívida (Passivo)</strong>.
                </p>
              </div>

              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 10px 0', color: '#0d9488', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px', wordBreak: 'break-word' }}><span>⏱️</span> O Valor do Dinheiro no Tempo</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.6', wordBreak: 'break-word' }}>
                  Não podemos simplesmente multiplicar a parcela pelo prazo e registrar o valor bruto no Balanço. Descontamos todo o contrato a uma taxa de {params.taxaDesconto}% a.m., expurgando os <strong>R$ {formatNum(calculos.jurosEmbutidos)}</strong> de juros embutidos, chegando ao Valor Presente (VP) de <strong>R$ {formatNum(calculos.valorPresente)}</strong>.
                </p>
              </div>

              <div style={{ ...cardStyle, borderLeft: '4px solid #0ea5e9', backgroundColor: '#f0f9ff' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#0369a1', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px', wordBreak: 'break-word' }}><span>📊</span> Impacto na DRE (EBITDA)</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#0c4a6e', lineHeight: '1.6', wordBreak: 'break-word' }}>
                  A adoção do CPC 06 melhora artificialmente o EBITDA. O que antes era "Despesa de Aluguel" (operacional) agora é desmembrado em <strong>Depreciação</strong> e <strong>Despesa Financeira</strong> (Juros), elevando o lucro operacional.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================
            ABA 4: CONTABILIZAÇÃO (CAPITALIZAÇÃO DO CONTRATO)
            ======================================================== */}
        {abaAtiva === 'contabilidade' && (
          <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#0f172a', wordBreak: 'break-word' }}>📖 Capitalização e Reconhecimento Inicial</h2>
            <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '20px', wordBreak: 'break-word' }}>
              Para assinar a conformidade deste contrato, precisamos reconhecer o <strong>Ativo de Direito de Uso</strong> e o <strong>Passivo de Arrendamento</strong> no momento da assinatura.
            </p>
            
            <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', color: 'white', border: '1px solid #334155', boxShadow: '0 10px 20px rgba(0,0,0,0.15)', boxSizing: 'border-box', overflowX: 'hidden' }}>
              <div style={{ fontSize: '12px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '14px', letterSpacing: '0.5px' }}>
                Lançamento Contábil (Ativação CPC 06)
              </div>
              
              <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left', minWidth: '450px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                      <th style={{ padding: '8px 0' }}>Conta Contábil (Plano de Contas)</th>
                      <th style={{ padding: '8px 0', textAlign: 'right' }}>Débito</th>
                      <th style={{ padding: '8px 0', textAlign: 'right' }}>Crédito</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '12px 0', wordBreak: 'break-word' }}>
                        <span style={{ backgroundColor: '#3b82f6', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', marginRight: '6px' }}>ATIVO</span>
                        <strong>1.2.03.01 - Ativo Imobilizado (Direito de Uso)</strong>
                      </td>
                      <td style={{ padding: '12px 0', textAlign: 'right', color: '#4ade80', fontWeight: 'bold', fontSize: '15px' }}>{formatMoeda(calculos.valorPresente)}</td>
                      <td style={{ padding: '12px 0', textAlign: 'right' }}>—</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 0', paddingLeft: '16px', wordBreak: 'break-word' }}>
                        <span style={{ backgroundColor: '#f59e0b', color: '#0f172a', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', marginRight: '6px' }}>PASSIVO</span>
                        <strong>2.1.04.01 - Arrendamentos a Pagar</strong>
                      </td>
                      <td style={{ padding: '12px 0', textAlign: 'right' }}>—</td>
                      <td style={{ padding: '12px 0', textAlign: 'right', color: '#f87171', fontWeight: 'bold', fontSize: '15px' }}>{formatMoeda(calculos.valorPresente)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '16px', borderTop: '2px solid #334155', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontWeight: '900', fontSize: '14.5px' }}>Validação do Balanço:</span>
                <span style={{ color: '#38bdf8', fontWeight: '900', fontSize: '13.5px', wordBreak: 'break-word' }}>Ativo e Passivo alinhados. Impacto zero no Caixa neste momento.</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '16px', boxSizing: 'border-box' }}>
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #16a34a', flex: '1 1 300px', boxSizing: 'border-box' }}>
                <strong style={{ fontSize: '13.5px', color: '#166534', display: 'block', marginBottom: '6px' }}>E as parcelas futuras?</strong>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#15803d', lineHeight: '1.5', wordBreak: 'break-word' }}>
                  Mês a mês, ao pagar a parcela, parte baixa a dívida no Passivo e parte vai para a DRE como Juros. O Ativo sofre depreciação linear de {formatMoeda(calculos.depreciacaoMensal)}.
                </p>
              </div>

              <button 
                onClick={handleContabilizarContrato}
                disabled={jaContabilizado}
                style={{ 
                  backgroundColor: jaContabilizado ? '#166534' : '#0d9488', 
                  color: 'white', border: 'none', padding: '14px 22px', borderRadius: '10px', 
                  fontWeight: '900', fontSize: '14px', cursor: jaContabilizado ? 'not-allowed' : 'pointer',
                  boxShadow: jaContabilizado ? 'none' : '0 4px 12px rgba(13, 148, 136, 0.3)',
                  transition: 'all 0.2s', width: '100%', maxWidth: '360px', boxSizing: 'border-box'
                }}
              >
                {jaContabilizado ? '✓ Contrato Capitalizado no ERP' : '📝 Assinar Contrato e Capitalizar no Balanço'}
              </button>
            </div>
          </div>
        )}

      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}