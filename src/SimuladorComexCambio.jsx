import React, { useState, useMemo } from 'react';

export default function SimuladorComexCambio({ mostrarToast, registrarFatoGerador }) {
  const formatMoeda = (v, currency = 'BRL') => 
    Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency });
  const formatNum = (v, dec = 2) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

  // Estados do Simulador de Comex e Câmbio
  const [params, setParams] = useState({
    produto: 'Centro de Usinagem CNC (Alemanha)',
    valorFOB: 100000.00, // Em Dólares (USD)
    incoterm: 'FOB', // FOB ou CIF
    freteSeguroUSD: 5000.00, // Aplicado se FOB
    ptaxCompra: 5.00, // Cotação no desembaraço
    ptaxPagamento: 5.80, // Cotação no dia de pagar (Dólar explodiu)
    
    // IVA Dual e Impostos Aduaneiros
    aliqII: 10, // Imposto de Importação (Custo)
    aliqCBS: 8.8, // Nova CBS (Recuperável)
    aliqIBS: 17.7, // Novo IBS (Recuperável)
    taxaSiscomexBRL: 250.00, // Despesa fixa aduaneira
    
    // Gestão de Risco
    usarHedge: false, // Contratou trava de dólar (NDF)?
    taxaHedge: 5.15, // Dólar travado no contrato de derivativo
    premioHedgeBRL: 5000.00 // Custo para contratar a trava
  });

  const [abaAtiva, setAbaAtiva] = useState('invoice');
  const [status, setStatus] = useState({ nacionalizado: false, liquidado: false });

  // ==========================================
  // MOTOR DE CÁLCULO DE IMPORTAÇÃO (COMEX E IVA DUAL)
  // ==========================================
  const calculos = useMemo(() => {
    const valorAduaneiroUSD = params.incoterm === 'FOB' ? (params.valorFOB + params.freteSeguroUSD) : params.valorFOB;
    const valorAduaneiroBRL = valorAduaneiroUSD * params.ptaxCompra;

    const impostoImportacaoBRL = valorAduaneiroBRL * (params.aliqII / 100);
    
    const baseIvaDual = valorAduaneiroBRL + impostoImportacaoBRL + params.taxaSiscomexBRL;
    const cbsRecuperavel = baseIvaDual * (params.aliqCBS / 100);
    const ibsRecuperavel = baseIvaDual * (params.aliqIBS / 100);

    const custoAtivoBRL = valorAduaneiroBRL + impostoImportacaoBRL + params.taxaSiscomexBRL;
    const desembolsoAduaneiro = impostoImportacaoBRL + cbsRecuperavel + ibsRecuperavel + params.taxaSiscomexBRL;

    const dividaOriginalBRL = valorAduaneiroUSD * params.ptaxCompra;
    const dividaFinalBRL = valorAduaneiroUSD * params.ptaxPagamento;
    const variacaoCambial = dividaFinalBRL - dividaOriginalBRL; 
    
    let pagamentoEfetivoFornecedor = dividaFinalBRL;
    let ganhoHedge = 0;

    if (params.usarHedge && params.ptaxPagamento > params.taxaHedge) {
      ganhoHedge = (params.ptaxPagamento - params.taxaHedge) * valorAduaneiroUSD;
      pagamentoEfetivoFornecedor = dividaFinalBRL - ganhoHedge;
    }

    return {
      valorAduaneiroUSD, valorAduaneiroBRL, impostoImportacaoBRL, baseIvaDual, 
      cbsRecuperavel, ibsRecuperavel, custoAtivoBRL, desembolsoAduaneiro,
      dividaOriginalBRL, dividaFinalBRL, variacaoCambial, ganhoHedge, pagamentoEfetivoFornecedor
    };
  }, [params]);

  // ==========================================
  // DISPAROS PARA O LIVRO DIÁRIO
  // ==========================================
  const handleDesembaraco = () => {
    if (status.nacionalizado) return mostrarToast('Nacionalização já registrada!', 'aviso');
    if (typeof registrarFatoGerador !== 'function') return mostrarToast('Erro: Motor Diário ausente.', 'erro');

    try {
      registrarFatoGerador(
        `Desembaraço Aduaneiro - ${params.produto} (IVA Dual)`,
        calculos.custoAtivoBRL, 
        'Comex/Imobilizado',
        ['1.2.03.01', '1.1.03.05', '1.1.03.06'], 
        ['2.1.01.05', '1.1.01.02']  
      );
      setStatus(prev => ({ ...prev, nacionalizado: true }));
      mostrarToast('Mercadoria nacionalizada! Ativo e Dívida Cambial registrados no Diário.', 'sucesso');
    } catch (e) {
      mostrarToast('Erro ao integrar com o Livro Diário.', 'erro');
    }
  };

  const handleFechamentoCambio = () => {
    if (!status.nacionalizado) return mostrarToast('Faça o desembaraço antes de fechar o câmbio!', 'erro');
    if (status.liquidado) return mostrarToast('Câmbio já liquidado!', 'aviso');
    if (typeof registrarFatoGerador !== 'function') return mostrarToast('Erro: Motor Diário ausente.', 'erro');

    try {
      registrarFatoGerador(
        `Fechamento de Câmbio e Liquidação Invoice (PTAX ${params.ptaxPagamento})`,
        calculos.dividaFinalBRL,
        'Comex/Tesouraria',
        ['2.1.01.05', '5.2.05.01'], 
        ['1.1.01.02']  
      );

      if (params.usarHedge && calculos.ganhoHedge > 0) {
        registrarFatoGerador(
          `Liquidação NDF (Trava de Dólar) - Ganho com Derivativo`,
          calculos.ganhoHedge,
          'Comex/Hedge',
          ['1.1.01.02'], 
          ['4.1.02.01']  
        );
      }

      setStatus(prev => ({ ...prev, liquidado: true }));
      mostrarToast('Câmbio fechado! Variação cambial apurada na DRE.', 'sucesso');
    } catch (e) {
      mostrarToast('Erro ao integrar com o Livro Diário.', 'erro');
    }
  };

  const resetarSimulador = () => {
    setStatus({ nacionalizado: false, liquidado: false });
    mostrarToast('Painel limpo para nova importação.', 'sucesso');
  };

  // Estilos Padronizados
  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.4s' }}>
      
      {/* CABEÇALHO */}
      <div className="no-print" style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px 24px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #f43f5e', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#f43f5e', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>CONTABILIDADE INTERNACIONAL</span>
            <span style={{ fontSize: '17px', fontWeight: '800', wordBreak: 'break-word' }}>Comércio Exterior & Variação Cambial</span>
          </div>
          <div style={{ fontSize: '13px', color: '#cbd5e1', wordBreak: 'break-word' }}>Gerencie a Invoice, calcule os tributos do IVA Dual e proteja o caixa com Hedge.</div>
        </div>
        
        {/* NAVEGAÇÃO INTERNA */}
        <div style={{ display: 'flex', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '10px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <button onClick={() => setAbaAtiva('invoice')} style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'invoice' ? '#f43f5e' : 'transparent', color: abaAtiva === 'invoice' ? 'white' : '#cbd5e1' }}>🚢 1. Invoice & Setup</button>
          <button onClick={() => setAbaAtiva('nacionalizacao')} style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'nacionalizacao' ? '#f43f5e' : 'transparent', color: abaAtiva === 'nacionalizacao' ? 'white' : '#cbd5e1' }}>🛂 2. Nacionalização</button>
          <button onClick={() => setAbaAtiva('cambio')} style={{ padding: '8px 14px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'cambio' ? '#f43f5e' : 'transparent', color: abaAtiva === 'cambio' ? 'white' : '#cbd5e1' }}>💱 3. Câmbio & Hedge</button>
        </div>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '0 0 16px 16px', border: '1px solid #e2e8f0', borderTop: 'none', minHeight: '500px', boxSizing: 'border-box', width: '100%' }}>
        
        {/* ========================================================
            ABA 1: SETUP DA IMPORTAÇÃO E HEDGE
            ======================================================== */}
        {abaAtiva === 'invoice' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', wordBreak: 'break-word' }}>📄 Detalhes da Proforma Invoice (USD)</h3>
                <button onClick={resetarSimulador} style={{ background: 'none', border: 'none', color: '#f43f5e', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>🔄 Resetar</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0 }}>
                  <label htmlFor="cxProduto" style={labelStyle}>Produto / Bem Imobilizado:</label>
                  <input id="cxProduto" type="text" style={inputStyle} value={params.produto} onChange={e => {setParams({...params, produto: e.target.value}); setStatus({nacionalizado:false, liquidado:false});}} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '12px', boxSizing: 'border-box' }}>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="cxValor" style={{...labelStyle, color: '#16a34a'}}>Valor da Mercadoria (USD $):</label>
                    <input id="cxValor" type="number" style={{...inputStyle, borderColor: '#86efac', backgroundColor: '#f0fdf4'}} value={params.valorFOB} onChange={e => {setParams({...params, valorFOB: e.target.value}); setStatus({nacionalizado:false, liquidado:false});}} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="cxIncoterm" style={labelStyle}>Incoterm Comercial:</label>
                    <select id="cxIncoterm" style={{...inputStyle, backgroundColor: 'white'}} value={params.incoterm} onChange={e => {setParams({...params, incoterm: e.target.value}); setStatus({nacionalizado:false, liquidado:false});}}>
                      <option value="FOB">FOB (Frete por nossa conta)</option>
                      <option value="CIF">CIF (Frete incluso no preço)</option>
                    </select>
                  </div>
                </div>
                {params.incoterm === 'FOB' && (
                  <div style={{ padding: '14px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', boxSizing: 'border-box', minWidth: 0 }}>
                    <label htmlFor="cxFrete" style={{...labelStyle, color: '#b45309'}}>Frete Marítimo e Seguro (USD $):</label>
                    <input id="cxFrete" type="number" style={inputStyle} value={params.freteSeguroUSD} onChange={e => {setParams({...params, freteSeguroUSD: e.target.value}); setStatus({nacionalizado:false, liquidado:false});}} />
                    <span style={{ fontSize: '11px', color: '#92400e', marginTop: '4px', display: 'block', wordBreak: 'break-word' }}>Por ser FOB, o seguro e frete integram o Valor Aduaneiro para impostos.</span>
                  </div>
                )}
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', wordBreak: 'break-word' }}>💱 Cotação da Moeda e Estratégia de Risco</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '12px', marginBottom: '16px', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0 }}>
                  <label htmlFor="cxPtax1" style={labelStyle}>PTAX Receita Federal (Hoje):</label>
                  <input id="cxPtax1" type="number" step="0.01" style={inputStyle} value={params.ptaxCompra} onChange={e => {setParams({...params, ptaxCompra: e.target.value}); setStatus({nacionalizado:false, liquidado:false});}} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label htmlFor="cxPtax2" style={{...labelStyle, color: '#dc2626'}}>PTAX Prevista Liquidação (Risco):</label>
                  <input id="cxPtax2" type="number" step="0.01" style={{...inputStyle, borderColor: '#fca5a5', backgroundColor: '#fef2f2'}} value={params.ptaxPagamento} onChange={e => {setParams({...params, ptaxPagamento: e.target.value}); setStatus({nacionalizado:false, liquidado:false});}} />
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '10px', wordBreak: 'break-word' }}>
                  <input type="checkbox" checked={params.usarHedge} onChange={e => {setParams({...params, usarHedge: e.target.checked}); setStatus({nacionalizado:false, liquidado:false});}} style={{ width: '18px', height: '18px', flexShrink: 0 }} />
                  <span style={{ fontWeight: 'bold', color: '#1e40af', fontSize: '13px' }}>Contratar Trava de Dólar (Derivativo NDF)</span>
                </label>
                
                {params.usarHedge && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 120px), 1fr))', gap: '10px', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', boxSizing: 'border-box' }}>
                    <div style={{ minWidth: 0 }}>
                      <label htmlFor="cxHedgeTaxa" style={labelStyle}>Taxa Travada (R$):</label>
                      <input id="cxHedgeTaxa" type="number" step="0.01" style={inputStyle} value={params.taxaHedge} onChange={e => {setParams({...params, taxaHedge: e.target.value}); setStatus({nacionalizado:false, liquidado:false});}} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <label htmlFor="cxHedgePre" style={labelStyle}>Prêmio ao Banco (R$):</label>
                      <input id="cxHedgePre" type="number" style={inputStyle} value={params.premioHedgeBRL} onChange={e => {setParams({...params, premioHedgeBRL: e.target.value}); setStatus({nacionalizado:false, liquidado:false});}} />
                    </div>
                  </div>
                )}
                {!params.usarHedge && (
                  <span style={{ fontSize: '12px', color: '#64748b', wordBreak: 'break-word' }}>Deixar desmarcado significa que a empresa assumirá 100% do risco de variação cambial caso o dólar dispare.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 2: NACIONALIZAÇÃO E CASCATA TRIBUTÁRIA
            ======================================================== */}
        {abaAtiva === 'nacionalizacao' && (
          <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#0f172a', wordBreak: 'break-word' }}>🛂 Desembaraço Aduaneiro e Nova Reforma Tributária</h2>
            <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '20px', wordBreak: 'break-word' }}>
              A mercadoria chegou ao porto. Com o IVA Dual, a CBS e o IBS são cobrados na entrada, mas geram créditos integrais para a empresa. Apenas o I.I. e as despesas aduaneiras viram "Custo" do produto.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
              
              {/* CÁLCULOS DA CASCATA */}
              <div style={cardStyle}>
                <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '12px', borderRadius: '8px', textAlign: 'center', marginBottom: '16px', boxSizing: 'border-box' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8' }}>Base de Cálculo (Valor Aduaneiro em Reais)</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#38bdf8', wordBreak: 'break-word' }}>{formatMoeda(calculos.valorAduaneiroBRL)}</div>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', wordBreak: 'break-word' }}>US$ {formatNum(calculos.valorAduaneiroUSD)} × R$ {formatNum(params.ptaxCompra)} (PTAX)</div>
                </div>

                <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left', minWidth: '380px' }}>
                    <tbody>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px 0', color: '#ef4444', fontWeight: 'bold' }}>(+) Imposto de Importação ({params.aliqII}%)</td>
                        <td style={{ padding: '8px 0', textAlign: 'right' }}>{formatMoeda(calculos.impostoImportacaoBRL)}</td>
                      </tr>
                      <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px 0', color: '#ef4444', fontWeight: 'bold' }}>(+) Taxa Siscomex Fixa</td>
                        <td style={{ padding: '8px 0', textAlign: 'right' }}>{formatMoeda(params.taxaSiscomexBRL)}</td>
                      </tr>
                      <tr style={{ backgroundColor: '#f0fdf4', borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px 6px', color: '#16a34a', fontWeight: 'bold' }}>(+) CBS a Recuperar ({params.aliqCBS}%)</td>
                        <td style={{ padding: '8px 6px', textAlign: 'right', color: '#16a34a' }}>{formatMoeda(calculos.cbsRecuperavel)}</td>
                      </tr>
                      <tr style={{ backgroundColor: '#f0fdf4', borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '8px 6px', color: '#16a34a', fontWeight: 'bold' }}>(+) IBS a Recuperar ({params.aliqIBS}%)</td>
                        <td style={{ padding: '8px 6px', textAlign: 'right', color: '#16a34a' }}>{formatMoeda(calculos.ibsRecuperavel)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', textAlign: 'center', border: '1px dashed #cbd5e1', boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Desembolso Imediato no Porto (Impostos + Taxas):</span><br/>
                  <strong style={{ fontSize: '15px', color: '#0f172a', wordBreak: 'break-word' }}>{formatMoeda(calculos.desembolsoAduaneiro)}</strong>
                </div>
              </div>

              {/* CONTABILIZAÇÃO */}
              <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', color: 'white', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', minWidth: 0 }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '14px', letterSpacing: '0.5px' }}>Partidas Dobradas (D.I.)</div>
                  <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', minWidth: '380px' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '6px 0', wordBreak: 'break-word' }}><strong style={{color:'#38bdf8'}}>D</strong> 1.2.03.01 - Ativo Imob. (Custo)</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', color: '#4ade80' }}>{formatMoeda(calculos.custoAtivoBRL)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px 0', wordBreak: 'break-word' }}><strong style={{color:'#38bdf8'}}>D</strong> 1.1.03.05 - CBS a Recuperar</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', color: '#4ade80' }}>{formatMoeda(calculos.cbsRecuperavel)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px 0', borderBottom: '1px solid #334155', wordBreak: 'break-word' }}><strong style={{color:'#38bdf8'}}>D</strong> 1.1.03.06 - IBS a Recuperar</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', color: '#4ade80', borderBottom: '1px solid #334155' }}>{formatMoeda(calculos.ibsRecuperavel)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px 0', paddingTop: '10px', wordBreak: 'break-word' }}><strong style={{color:'#f87171'}}>C</strong> 2.1.01.05 - Forn. Estrangeiros</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', color: '#f87171', paddingTop: '10px' }}>{formatMoeda(calculos.valorAduaneiroBRL)}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '6px 0', wordBreak: 'break-word' }}><strong style={{color:'#f87171'}}>C</strong> 1.1.01.02 - Banco (Pag. Impostos)</td>
                          <td style={{ padding: '6px 0', textAlign: 'right', color: '#f87171' }}>{formatMoeda(calculos.desembolsoAduaneiro)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <button 
                  onClick={handleDesembaraco}
                  disabled={status.nacionalizado}
                  style={{ backgroundColor: status.nacionalizado ? '#166534' : '#2563eb', color: 'white', border: 'none', padding: '14px', borderRadius: '10px', fontWeight: 'bold', cursor: status.nacionalizado ? 'not-allowed' : 'pointer', marginTop: '20px', transition: 'all 0.2s', width: '100%', boxSizing: 'border-box' }}
                >
                  {status.nacionalizado ? '✓ Desembaraço Registrado' : '📥 Confirmar Nacionalização no Diário'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 3: FECHAMENTO DE CÂMBIO E HEDGE
            ======================================================== */}
        {abaAtiva === 'cambio' && (
          <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '20px', color: '#0f172a', wordBreak: 'break-word' }}>💱 Liquidação Cambial e Contratos Derivativos (Hedge)</h2>
            <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '20px', wordBreak: 'break-word' }}>
              Passaram-se 30 dias. É hora de remeter os dólares para o fornecedor. A variação cambial é o maior vilão da contabilidade internacional. Veja o impacto na DRE.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', wordBreak: 'break-word' }}>Impacto Cambial Apurado</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                  <span>Dívida Original (PTAX {formatNum(params.ptaxCompra)}):</span>
                  <strong style={{ wordBreak: 'break-word' }}>{formatMoeda(calculos.dividaOriginalBRL)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                  <span>Dívida Atualizada (PTAX {formatNum(params.ptaxPagamento)}):</span>
                  <strong style={{ color: '#0f172a', wordBreak: 'break-word' }}>{formatMoeda(calculos.dividaFinalBRL)}</strong>
                </div>
                
                <div style={{ backgroundColor: calculos.variacaoCambial > 0 ? '#fef2f2' : '#f0fdf4', padding: '14px', borderRadius: '10px', borderLeft: calculos.variacaoCambial > 0 ? '4px solid #ef4444' : '4px solid #16a34a', marginTop: '16px', boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '11.5px', color: calculos.variacaoCambial > 0 ? '#991b1b' : '#166534', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', wordBreak: 'break-word' }}>
                    {calculos.variacaoCambial > 0 ? 'Despesa com Variação Cambial Passiva' : 'Receita com Variação Cambial Ativa'}
                  </span>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: calculos.variacaoCambial > 0 ? '#dc2626' : '#16a34a', wordBreak: 'break-word', marginTop: '4px' }}>
                    {formatMoeda(Math.abs(calculos.variacaoCambial))}
                  </div>
                  <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px', wordBreak: 'break-word' }}>Este valor afeta diretamente o Lucro do Exercício (DRE).</span>
                </div>
              </div>

              {/* PAINEL DE HEDGE */}
              <div style={{ ...cardStyle, opacity: params.usarHedge ? 1 : 0.4, pointerEvents: params.usarHedge ? 'auto' : 'none', position: 'relative' }}>
                {!params.usarHedge && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#0f172a', color: 'white', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', zIndex: 10, textAlign: 'center' }}>Hedge Desativado (Aba 1)</div>}
                
                <h4 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#1e40af', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', wordBreak: 'break-word' }}>Efeito da Trava de Dólar (Derivativo NDF)</h4>
                
                <p style={{ fontSize: '12.5px', color: '#475569', lineHeight: '1.5', margin: '0 0 16px 0', wordBreak: 'break-word' }}>A empresa garantiu a cotação a <strong>R$ {formatNum(params.taxaHedge)}</strong>. Como o dólar foi a R$ {formatNum(params.ptaxPagamento)}, o banco cobrirá a diferença.</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                  <span>Indenização Paga pelo Banco:</span>
                  <strong style={{ color: '#16a34a', wordBreak: 'break-word' }}>+ {formatMoeda(calculos.ganhoHedge)}</strong>
                </div>

                <div style={{ backgroundColor: '#eff6ff', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #3b82f6', marginTop: '16px', boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '11.5px', color: '#1e40af', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', wordBreak: 'break-word' }}>Saída Real do Caixa da Empresa</span>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: '#1d4ed8', wordBreak: 'break-word', marginTop: '4px' }}>
                    {formatMoeda(calculos.pagamentoEfetivoFornecedor)}
                  </div>
                  <span style={{ fontSize: '11px', color: '#3b82f6', display: 'block', marginTop: '4px', wordBreak: 'break-word' }}>Graças ao Hedge, a sangria do caixa foi mitigada.</span>
                </div>
              </div>
            </div>

            {/* BOTAO CONTABILIZAÇÃO FINAL */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', boxSizing: 'border-box' }}>
              <button 
                onClick={handleFechamentoCambio}
                disabled={status.liquidado || !status.nacionalizado}
                style={{ backgroundColor: status.liquidado ? '#166534' : '#f43f5e', color: 'white', border: 'none', padding: '14px 22px', borderRadius: '10px', fontWeight: '900', fontSize: '14px', cursor: status.liquidado || !status.nacionalizado ? 'not-allowed' : 'pointer', boxShadow: status.liquidado ? 'none' : '0 4px 12px rgba(244,63,94,0.3)', transition: 'all 0.2s', width: '100%', maxWidth: '380px', boxSizing: 'border-box' }}
              >
                {status.liquidado ? '✓ Remessa Cambial Efetivada' : '💸 Pagar Fornecedor e Reconhecer Variação'}
              </button>
            </div>

          </div>
        )}

      </div>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        @media print {
          .no-print { display: none !important; }
          body { background-color: white !important; margin: 0; }
          .print-only-content { width: 100% !important; border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
}