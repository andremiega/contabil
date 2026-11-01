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
    // 1. Apuração do Valor Aduaneiro (Base de Cálculo em USD e BRL)
    const valorAduaneiroUSD = params.incoterm === 'FOB' ? (params.valorFOB + params.freteSeguroUSD) : params.valorFOB;
    const valorAduaneiroBRL = valorAduaneiroUSD * params.ptaxCompra;

    // 2. Cascata de Impostos (Reforma Tributária - IVA Dual)
    const impostoImportacaoBRL = valorAduaneiroBRL * (params.aliqII / 100);
    
    // A base do IVA Dual na importação costuma incluir o I.I. e taxas aduaneiras
    const baseIvaDual = valorAduaneiroBRL + impostoImportacaoBRL + params.taxaSiscomexBRL;
    const cbsRecuperavel = baseIvaDual * (params.aliqCBS / 100);
    const ibsRecuperavel = baseIvaDual * (params.aliqIBS / 100);

    // O Custo do Imobilizado (Ativo) NÃO inclui CBS e IBS, pois são 100% recuperáveis.
    // Inclui apenas Produto + Frete/Seguro + I.I. + Siscomex.
    const custoAtivoBRL = valorAduaneiroBRL + impostoImportacaoBRL + params.taxaSiscomexBRL;
    
    // Total de dinheiro que sai no momento do desembaraço (Apenas Impostos + Siscomex. O fornecedor será pago depois).
    const desembolsoAduaneiro = impostoImportacaoBRL + cbsRecuperavel + ibsRecuperavel + params.taxaSiscomexBRL;

    // 3. Fechamento de Câmbio (Variação e Hedge)
    const dividaOriginalBRL = valorAduaneiroUSD * params.ptaxCompra;
    const dividaFinalBRL = valorAduaneiroUSD * params.ptaxPagamento;
    const variacaoCambial = dividaFinalBRL - dividaOriginalBRL; // Se > 0, é prejuízo cambial.
    
    let pagamentoEfetivoFornecedor = dividaFinalBRL;
    let ganhoHedge = 0;

    if (params.usarHedge && params.ptaxPagamento > params.taxaHedge) {
      // O banco cobre a diferença entre o dólar de mercado e o dólar travado
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
      // Reconhecimento do Ativo, Impostos a Recuperar e a Dívida Internacional
      registrarFatoGerador(
        `Desembaraço Aduaneiro - ${params.produto} (IVA Dual)`,
        calculos.custoAtivoBRL, // Valor principal do Ativo
        'Comex/Imobilizado',
        ['1.2.03.01', '1.1.03.05', '1.1.03.06'], // Débitos: Ativo Imobilizado, CBS a Recuperar, IBS a Recuperar
        ['2.1.01.05', '1.1.01.02']  // Créditos: Fornecedores Estrangeiros, Banco (Pagamento Impostos/Siscomex)
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
      // Paga a dívida e reconhece a despesa cambial
      registrarFatoGerador(
        `Fechamento de Câmbio e Liquidação Invoice (PTAX ${params.ptaxPagamento})`,
        calculos.dividaFinalBRL,
        'Comex/Tesouraria',
        ['2.1.01.05', '5.2.05.01'], // Débitos: Baixa Fornecedor Estrangeiro, Despesa com Variação Cambial
        ['1.1.01.02']  // Crédito: Saída do Banco (Reais)
      );

      // Se usou Hedge e ganhou, registra a Receita Financeira do Derivativo
      if (params.usarHedge && calculos.ganhoHedge > 0) {
        registrarFatoGerador(
          `Liquidação NDF (Trava de Dólar) - Ganho com Derivativo`,
          calculos.ganhoHedge,
          'Comex/Hedge',
          ['1.1.01.02'], // Débito: Entrada no Banco (Prêmio pago pelo banco emissor do NDF)
          ['4.1.02.01']  // Crédito: Receita Financeira (Hedge)
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
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', animation: 'fadeIn 0.4s' }}>
      
      {/* CABEÇALHO */}
      <div className="no-print" style={{ backgroundColor: '#0f172a', color: 'white', padding: '24px', borderRadius: '14px 14px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #f43f5e' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ backgroundColor: '#f43f5e', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>CONTABILIDADE INTERNACIONAL</span>
            <span style={{ fontSize: '18px', fontWeight: '800' }}>Comércio Exterior & Variação Cambial</span>
          </div>
          <div style={{ fontSize: '13px', color: '#cbd5e1' }}>Gerencie a Invoice, calcule os tributos do IVA Dual e proteja o caixa com Hedge.</div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setAbaAtiva('invoice')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'invoice' ? '#f43f5e' : 'transparent', color: abaAtiva === 'invoice' ? 'white' : '#cbd5e1' }}>🚢 1. Invoice & Setup</button>
          <button onClick={() => setAbaAtiva('nacionalizacao')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'nacionalizacao' ? '#f43f5e' : 'transparent', color: abaAtiva === 'nacionalizacao' ? 'white' : '#cbd5e1' }}>🛂 2. Nacionalização (IVA Dual)</button>
          <button onClick={() => setAbaAtiva('cambio')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'cambio' ? '#f43f5e' : 'transparent', color: abaAtiva === 'cambio' ? 'white' : '#cbd5e1' }}>💱 3. Fechamento Câmbio (Hedge)</button>
        </div>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '0 0 14px 14px', border: '1px solid #e2e8f0', borderTop: 'none', minHeight: '600px' }}>
        
        {/* ========================================================
            ABA 1: SETUP DA IMPORTAÇÃO E HEDGE
            ======================================================== */}
        {abaAtiva === 'invoice' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px', animation: 'fadeIn 0.3s' }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>📄 Detalhes da Proforma Invoice (USD)</h3>
                <button onClick={resetarSimulador} style={{ background: 'none', border: 'none', color: '#f43f5e', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>🔄 Resetar</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label htmlFor="cxProduto" style={labelStyle}>Produto / Bem Imobilizado:</label>
                  <input id="cxProduto" type="text" style={inputStyle} value={params.produto} onChange={e => {setParams({...params, produto: e.target.value}); setStatus({nacionalizado:false, liquidado:false});}} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label htmlFor="cxValor" style={{...labelStyle, color: '#16a34a'}}>Valor da Mercadoria (USD $):</label>
                    <input id="cxValor" type="number" style={{...inputStyle, borderColor: '#86efac', backgroundColor: '#f0fdf4'}} value={params.valorFOB} onChange={e => {setParams({...params, valorFOB: e.target.value}); setStatus({nacionalizado:false, liquidado:false});}} />
                  </div>
                  <div>
                    <label htmlFor="cxIncoterm" style={labelStyle}>Incoterm Comercial:</label>
                    <select id="cxIncoterm" style={inputStyle} value={params.incoterm} onChange={e => {setParams({...params, incoterm: e.target.value}); setStatus({nacionalizado:false, liquidado:false});}}>
                      <option value="FOB">FOB (Frete por nossa conta)</option>
                      <option value="CIF">CIF (Frete já incluso no preço)</option>
                    </select>
                  </div>
                </div>
                {params.incoterm === 'FOB' && (
                  <div style={{ padding: '12px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px' }}>
                    <label htmlFor="cxFrete" style={{...labelStyle, color: '#b45309'}}>Frete Marítimo e Seguro (USD $):</label>
                    <input id="cxFrete" type="number" style={inputStyle} value={params.freteSeguroUSD} onChange={e => {setParams({...params, freteSeguroUSD: e.target.value}); setStatus({nacionalizado:false, liquidado:false});}} />
                    <span style={{ fontSize: '11px', color: '#92400e', marginTop: '4px', display: 'block' }}>Por ser FOB, o seguro e frete integram o Valor Aduaneiro para impostos.</span>
                  </div>
                )}
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>💱 Cotação da Moeda e Estratégia de Risco</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div>
                  <label htmlFor="cxPtax1" style={labelStyle}>PTAX Receita Federal (Hoje):</label>
                  <input id="cxPtax1" type="number" step="0.01" style={inputStyle} value={params.ptaxCompra} onChange={e => {setParams({...params, ptaxCompra: e.target.value}); setStatus({nacionalizado:false, liquidado:false});}} />
                </div>
                <div>
                  <label htmlFor="cxPtax2" style={{...labelStyle, color: '#dc2626'}}>PTAX Prevista Liquidação (Risco):</label>
                  <input id="cxPtax2" type="number" step="0.01" style={{...inputStyle, borderColor: '#fca5a5', backgroundColor: '#fef2f2'}} value={params.ptaxPagamento} onChange={e => {setParams({...params, ptaxPagamento: e.target.value}); setStatus({nacionalizado:false, liquidado:false});}} />
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', marginBottom: '12px' }}>
                  <input type="checkbox" checked={params.usarHedge} onChange={e => {setParams({...params, usarHedge: e.target.checked}); setStatus({nacionalizado:false, liquidado:false});}} style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontWeight: 'bold', color: '#1e40af' }}>Contratar Trava de Dólar (Derivativo NDF)</span>
                </label>
                
                {params.usarHedge && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1' }}>
                    <div>
                      <label htmlFor="cxHedgeTaxa" style={labelStyle}>Taxa Travada (R$):</label>
                      <input id="cxHedgeTaxa" type="number" step="0.01" style={inputStyle} value={params.taxaHedge} onChange={e => {setParams({...params, taxaHedge: e.target.value}); setStatus({nacionalizado:false, liquidado:false});}} />
                    </div>
                    <div>
                      <label htmlFor="cxHedgePre" style={labelStyle}>Prêmio ao Banco (R$):</label>
                      <input id="cxHedgePre" type="number" style={inputStyle} value={params.premioHedgeBRL} onChange={e => {setParams({...params, premioHedgeBRL: e.target.value}); setStatus({nacionalizado:false, liquidado:false});}} />
                    </div>
                  </div>
                )}
                {!params.usarHedge && (
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Deixar desmarcado significa que a empresa assumirá 100% do risco de variação cambial caso o dólar dispare.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 2: NACIONALIZAÇÃO E CASCATA TRIBUTÁRIA
            ======================================================== */}
        {abaAtiva === 'nacionalizacao' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '22px', color: '#0f172a' }}>🛂 Desembaraço Aduaneiro e Nova Reforma Tributária</h2>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '24px' }}>
              A mercadoria chegou ao porto. Com o IVA Dual, a CBS e o IBS são cobrados na entrada, mas geram créditos integrais para a empresa. Apenas o I.I. e as despesas aduaneiras viram "Custo" do produto.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              
              {/* CÁLCULOS DA CASCATA */}
              <div style={cardStyle}>
                <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '12px', borderRadius: '6px', textAlign: 'center', marginBottom: '16px' }}>
                  <div style={{ fontSize: '11px', textTransform: 'uppercase', color: '#94a3b8' }}>Base de Cálculo (Valor Aduaneiro em Reais)</div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#38bdf8' }}>{formatMoeda(calculos.valorAduaneiroBRL)}</div>
                  <div style={{ fontSize: '11px', color: '#cbd5e1' }}>US$ {formatNum(calculos.valorAduaneiroUSD)} × R$ {formatNum(params.ptaxCompra)} (PTAX de Hoje)</div>
                </div>

                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '8px 0', color: '#ef4444', fontWeight: 'bold' }}>(+) Imposto de Importação (I.I. - {params.aliqII}%)</td>
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
                <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '6px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Desembolso Imediato no Porto (Impostos + Taxas):</span><br/>
                  <strong style={{ fontSize: '16px', color: '#0f172a' }}>{formatMoeda(calculos.desembolsoAduaneiro)}</strong>
                </div>
              </div>

              {/* CONTABILIZAÇÃO */}
              <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '12px', color: 'white', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: '13px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '16px' }}>Partidas Dobradas (D.I.)</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                    <tbody>
                      <tr>
                        <td style={{ padding: '6px 0' }}><strong style={{color:'#38bdf8'}}>D</strong> 1.2.03.01 - Ativo Imob. (Custo)</td>
                        <td style={{ padding: '6px 0', textAlign: 'right', color: '#4ade80' }}>{formatMoeda(calculos.custoAtivoBRL)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '6px 0' }}><strong style={{color:'#38bdf8'}}>D</strong> 1.1.03.05 - CBS a Recuperar</td>
                        <td style={{ padding: '6px 0', textAlign: 'right', color: '#4ade80' }}>{formatMoeda(calculos.cbsRecuperavel)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '6px 0', borderBottom: '1px solid #334155' }}><strong style={{color:'#38bdf8'}}>D</strong> 1.1.03.06 - IBS a Recuperar</td>
                        <td style={{ padding: '6px 0', textAlign: 'right', color: '#4ade80', borderBottom: '1px solid #334155' }}>{formatMoeda(calculos.ibsRecuperavel)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '6px 0', paddingTop: '10px' }}><strong style={{color:'#f87171'}}>C</strong> 2.1.01.05 - Forn. Estrangeiros</td>
                        <td style={{ padding: '6px 0', textAlign: 'right', color: '#f87171', paddingTop: '10px' }}>{formatMoeda(calculos.valorAduaneiroBRL)}</td>
                      </tr>
                      <tr>
                        <td style={{ padding: '6px 0' }}><strong style={{color:'#f87171'}}>C</strong> 1.1.01.02 - Banco (Pag. Impostos)</td>
                        <td style={{ padding: '6px 0', textAlign: 'right', color: '#f87171' }}>{formatMoeda(calculos.desembolsoAduaneiro)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button 
                  onClick={handleDesembaraco}
                  disabled={status.nacionalizado}
                  style={{ backgroundColor: status.nacionalizado ? '#166534' : '#2563eb', color: 'white', border: 'none', padding: '14px', borderRadius: '8px', fontWeight: 'bold', cursor: status.nacionalizado ? 'not-allowed' : 'pointer', marginTop: '20px', transition: 'all 0.2s' }}
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
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '22px', color: '#0f172a' }}>💱 Liquidação Cambial e Contratos Derivativos (Hedge)</h2>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '24px' }}>
              Passaram-se 30 dias. É hora de remeter os dólares para o fornecedor. A variação cambial é o maior vilão da contabilidade internacional. Veja o impacto na DRE.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Impacto Cambial Apurado</h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569', marginBottom: '10px' }}>
                  <span>Dívida Original Reconhecida (PTAX {formatNum(params.ptaxCompra)}):</span>
                  <strong>{formatMoeda(calculos.dividaOriginalBRL)}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569', marginBottom: '10px' }}>
                  <span>Dívida Atualizada no Fechamento (PTAX {formatNum(params.ptaxPagamento)}):</span>
                  <strong style={{ color: '#0f172a' }}>{formatMoeda(calculos.dividaFinalBRL)}</strong>
                </div>
                
                <div style={{ backgroundColor: calculos.variacaoCambial > 0 ? '#fef2f2' : '#f0fdf4', padding: '16px', borderRadius: '8px', borderLeft: calculos.variacaoCambial > 0 ? '4px solid #ef4444' : '4px solid #16a34a', marginTop: '16px' }}>
                  <span style={{ fontSize: '12px', color: calculos.variacaoCambial > 0 ? '#991b1b' : '#166534', fontWeight: 'bold', textTransform: 'uppercase' }}>
                    {calculos.variacaoCambial > 0 ? 'Despesa com Variação Cambial Passiva' : 'Receita com Variação Cambial Ativa'}
                  </span>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: calculos.variacaoCambial > 0 ? '#dc2626' : '#16a34a' }}>
                    {formatMoeda(Math.abs(calculos.variacaoCambial))}
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>Este valor afeta diretamente o Lucro do Exercício (DRE).</span>
                </div>
              </div>

              {/* PAINEL DE HEDGE (SE ATIVADO) */}
              <div style={{ ...cardStyle, opacity: params.usarHedge ? 1 : 0.4, pointerEvents: params.usarHedge ? 'auto' : 'none', position: 'relative' }}>
                {!params.usarHedge && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: '#0f172a', color: 'white', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', zIndex: 10 }}>Hedge Desativado (Aba 1)</div>}
                
                <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1e40af', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>Efeito da Trava de Dólar (Derivativo NDF)</h4>
                
                <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', margin: '0 0 16px 0' }}>A empresa pagou um prêmio ao Banco para garantir a cotação a <strong>R$ {formatNum(params.taxaHedge)}</strong>. Como a cotação oficial disparou para R$ {formatNum(params.ptaxPagamento)}, o banco cobrirá a diferença.</p>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px', color: '#475569', marginBottom: '10px' }}>
                  <span>Indenização Paga pelo Banco (Receita Fin.):</span>
                  <strong style={{ color: '#16a34a' }}>+ {formatMoeda(calculos.ganhoHedge)}</strong>
                </div>

                <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginTop: '16px' }}>
                  <span style={{ fontSize: '12px', color: '#1e40af', fontWeight: 'bold', textTransform: 'uppercase' }}>Saída Real do Caixa da Empresa</span>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: '#1d4ed8' }}>
                    {formatMoeda(calculos.pagamentoEfetivoFornecedor)}
                  </div>
                  <span style={{ fontSize: '11.5px', color: '#3b82f6' }}>Graças ao Hedge, a sangria do caixa foi mitigada. A contabilidade salva empresas.</span>
                </div>
              </div>
            </div>

            {/* BOTAO CONTABILIZAÇÃO FINAL */}
            <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button 
                onClick={handleFechamentoCambio}
                disabled={status.liquidado || !status.nacionalizado}
                style={{ backgroundColor: status.liquidado ? '#166534' : '#f43f5e', color: 'white', border: 'none', padding: '16px 24px', borderRadius: '10px', fontWeight: '900', fontSize: '15px', cursor: status.liquidado || !status.nacionalizado ? 'not-allowed' : 'pointer', boxShadow: status.liquidado ? 'none' : '0 4px 12px rgba(244,63,94,0.3)', transition: 'all 0.2s' }}
              >
                {status.liquidado ? '✓ Remessa Cambial Efetivada' : '💸 Pagar Fornecedor e Reconhecer Variação no Diário'}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}