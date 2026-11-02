import React, { useState } from 'react';

export default function SimuladorMatematicaFinanceira() {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Abas: 'compostos', 'porcentagem', 'sacprice', 'avp', 'descontos'
  const [abaAtiva, setAbaAtiva] = useState('compostos');

  // 1. Estados para Juros Compostos & Simples
  const [capitalStr, setCapitalStr] = useState('10000');
  const [taxaStr, setTaxaStr] = useState('2.5');
  const [tempoStr, setTempoStr] = useState('12');

  // 2. Estados para Porcentagem
  const [valorBaseStr, setValorBaseStr] = useState('500');
  const [percentualStr, setPercentualStr] = useState('15');

  // 3. Estados para Financiamento (SAC vs Price)
  const [financiamentoStr, setFinanciamentoStr] = useState('120000');
  const [taxaFinStr, setTaxaFinStr] = useState('1.0'); 
  const [prazoMesesStr, setPrazoMesesStr] = useState('12'); 
  
  const [tabelaGerada, setTabelaGerada] = useState(false);
  const [cronogramaSac, setCronogramaSac] = useState([]);
  const [cronogramaPrice, setCronogramaPrice] = useState([]);

  // 4. Estados para AVP (CPC 12)
  const [valorFuturoStr, setValorFuturoStr] = useState('50000');
  const [taxaDescontoStr, setTaxaDescontoStr] = useState('1.5'); 
  const [mesesAvpStr, setMesesAvpStr] = useState('18');

  // 5. Estados para Descontos
  const [nominalStr, setNominalStr] = useState('10000');
  const [taxaDescStr, setTaxaDescStr] = useState('2.0'); 
  const [diasStr, setDiasStr] = useState('90'); 

  // CÁLCULOS
  const capital = parseFloat(capitalStr) || 0;
  const iComum = (parseFloat(taxaStr) || 0) / 100;
  const tComum = parseInt(tempoStr) || 0;
  const montanteCompostos = capital * Math.pow(1 + iComum, tComum);

  const valorBase = parseFloat(valorBaseStr) || 0;
  const percentual = (parseFloat(percentualStr) || 0) / 100;
  const valorAcrescimo = valorBase * (1 + percentual);
  const valorDesconto = valorBase * (1 - percentual);
  const partePercentual = valorBase * percentual;

  const pvFin = parseFloat(financiamentoStr) || 0;
  const iFin = (parseFloat(taxaFinStr) || 0) / 100;
  const nFin = parseInt(prazoMesesStr, 10) || 1;

  const pmtPrice = pvFin * (Math.pow(1 + iFin, nFin) * iFin) / (Math.pow(1 + iFin, nFin) - 1);
  const totalPrice = pmtPrice * nFin;

  const amortizacaoSac = pvFin / nFin;
  const primeiraPrestacaoSac = amortizacaoSac + (pvFin * iFin);
  const ultimaPrestacaoSac = amortizacaoSac + (amortizacaoSac * iFin);
  const totalSac = ((primeiraPrestacaoSac + ultimaPrestacaoSac) / 2) * nFin;

  const handleGerarTabela = (e) => {
    e.preventDefault();
    let saldoPrice = pvFin;
    let linhasPrice = [];
    for (let t = 1; t <= nFin; t++) {
      let juros = saldoPrice * iFin;
      let amort = pmtPrice - juros;
      saldoPrice -= amort;
      linhasPrice.push({ periodo: t, prestacao: pmtPrice, juros, amort, saldo: saldoPrice > 0 ? saldoPrice : 0 });
    }

    let saldoSac = pvFin;
    let linhasSac = [];
    for (let t = 1; t <= nFin; t++) {
      let juros = saldoSac * iFin;
      let prestacao = amortizacaoSac + juros;
      saldoSac -= amortizacaoSac;
      linhasSac.push({ periodo: t, prestacao, juros, amort: amortizacaoSac, saldo: saldoSac > 0 ? saldoSac : 0 });
    }

    setCronogramaPrice(linhasPrice);
    setCronogramaSac(linhasSac);
    setTabelaGerada(true);
  };

  const vfAvp = parseFloat(valorFuturoStr) || 0;
  const iAvp = (parseFloat(taxaDescontoStr) || 0) / 100;
  const nAvp = parseFloat(mesesAvpStr) || 0;
  const valorPresente = vfAvp / Math.pow(1 + iAvp, nAvp);
  const ajusteAvp = vfAvp - valorPresente;

  const nNominal = parseFloat(nominalStr) || 0;
  const iDesc = (parseFloat(taxaDescStr) || 0) / 100;
  const mesesDesc = (parseFloat(diasStr) || 30) / 30;
  
  const descontoComercial = nNominal * iDesc * mesesDesc;
  const valorLiberadoComercial = nNominal - descontoComercial;

  const descontoFinanceiro = (nNominal * iDesc * mesesDesc) / (1 + (iDesc * mesesDesc));
  const valorLiberadoFinanceiro = nNominal - descontoFinanceiro;

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px', boxSizing: 'border-box' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', wordBreak: 'break-word' }}>
            <span style={{ fontSize: '24px' }}>🧮</span> Matemática Financeira, SAC/Price, AVP & Descontos
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px', wordBreak: 'break-word' }}>
            Simulador completo de amortizações, Ajuste a Valor Presente, Porcentagens e Descontos para controladoria.
          </p>
        </div>

        {/* NAVEGAÇÃO ENTRE ABAS */}
        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0', gap: '4px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <button onClick={() => setAbaAtiva('compostos')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'compostos' ? '#2563eb' : 'transparent', color: abaAtiva === 'compostos' ? 'white' : '#64748b' }}>
            📈 Compostos
          </button>
          <button onClick={() => setAbaAtiva('porcentagem')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'porcentagem' ? '#16a34a' : 'transparent', color: abaAtiva === 'porcentagem' ? 'white' : '#64748b' }}>
            💯 Porcentagem
          </button>
          <button onClick={() => setAbaAtiva('sacprice')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'sacprice' ? '#0f172a' : 'transparent', color: abaAtiva === 'sacprice' ? 'white' : '#64748b' }}>
            🏠 SAC vs Price
          </button>
          <button onClick={() => setAbaAtiva('avp')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'avp' ? '#059669' : 'transparent', color: abaAtiva === 'avp' ? 'white' : '#64748b' }}>
            ⚖️ AVP (CPC 12)
          </button>
          <button onClick={() => setAbaAtiva('descontos')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'descontos' ? '#d97706' : 'transparent', color: abaAtiva === 'descontos' ? 'white' : '#64748b' }}>
            📉 Descontos
          </button>
        </div>
      </div>

      {/* 1. ABA: JUROS COMPOSTOS */}
      {abaAtiva === 'compostos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
          <div style={cardStyle}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', wordBreak: 'break-word' }}>Parâmetros da Aplicação</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Capital Inicial (C):</label>
                <input type="text" value={capitalStr} onChange={e => setCapitalStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Taxa (% ao mês - i):</label>
                <input type="text" value={taxaStr} onChange={e => setTaxaStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Prazo (meses - t):</label>
                <input type="text" value={tempoStr} onChange={e => setTempoStr(e.target.value.replace(/[^0-9]/g, ''))} style={inputStyle} />
              </div>
            </div>

            <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '12px', border: '1px solid #bfdbfe', marginTop: '16px', boxSizing: 'border-box', minWidth: 0 }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1d4ed8', display: 'block', wordBreak: 'break-word' }}>MONTANTE COMPOSTO:</span>
              <strong style={{ fontSize: '22px', color: '#1e40af', display: 'block', marginTop: '4px', wordBreak: 'break-word' }}>{formatMoeda(montanteCompostos)}</strong>
              <span style={{ fontSize: '11px', color: '#2563eb', display: 'block', marginTop: '2px', wordBreak: 'break-word' }}>Rendimento: <strong>{formatMoeda(montanteCompostos - capital)}</strong></span>
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', wordBreak: 'break-word' }}>🔍 Demonstração da Fórmula</h3>
            <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '14px', textAlign: 'center', color: '#2563eb', fontWeight: 'bold', margin: '14px 0', boxSizing: 'border-box', wordBreak: 'break-word' }}>
              M = C × (1 + i)^t
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', wordBreak: 'break-word' }}>
              No regime de juros compostos, o montante cresce exponencialmente a cada período sobre o capital acumulado.
            </p>
          </div>
        </div>
      )}

      {/* 2. ABA: PORCENTAGEM */}
      {abaAtiva === 'porcentagem' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
          <div style={cardStyle}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', wordBreak: 'break-word' }}>Calculadora de Percentuais</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Valor Base (R$):</label>
                <input type="text" value={valorBaseStr} onChange={e => setValorBaseStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Percentual (%):</label>
                <input type="text" value={percentualStr} onChange={e => setPercentualStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', wordBreak: 'break-word' }}>📊 Resultados Práticos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px', color: '#334155', marginTop: '14px', boxSizing: 'border-box' }}>
              <div style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px', boxSizing: 'border-box' }}>
                <span style={{ wordBreak: 'break-word' }}>Valor Correspondente ({percentualStr}%):</span>
                <strong style={{ color: '#2563eb', wordBreak: 'break-word' }}>{formatMoeda(partePercentual)}</strong>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#f0fdf4', borderRadius: '10px', border: '1px solid #86efac', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px', boxSizing: 'border-box' }}>
                <span style={{ color: '#166534', wordBreak: 'break-word' }}>Com Acréscimo (+{percentualStr}%):</span>
                <strong style={{ color: '#15803d', wordBreak: 'break-word' }}>{formatMoeda(valorAcrescimo)}</strong>
              </div>
              <div style={{ padding: '12px', backgroundColor: '#fff5f5', borderRadius: '10px', border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px', boxSizing: 'border-box' }}>
                <span style={{ color: '#991b1b', wordBreak: 'break-word' }}>Com Desconto (-{percentualStr}%):</span>
                <strong style={{ color: '#dc2626', wordBreak: 'break-word' }}>{formatMoeda(valorDesconto)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ABA: SAC VS PRICE */}
      {abaAtiva === 'sacprice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
            
            <div style={cardStyle}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', wordBreak: 'break-word' }}>Parâmetros do Financiamento</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0 }}>
                  <label style={labelStyle}>Valor Financiado (PV):</label>
                  <input type="text" value={financiamentoStr} onChange={e => setFinanciamentoStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label style={labelStyle}>Taxa de Juros (% a.m.):</label>
                  <input type="text" value={taxaFinStr} onChange={e => setTaxaFinStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label style={labelStyle}>Prazo (meses):</label>
                  <input type="text" value={prazoMesesStr} onChange={e => setPrazoMesesStr(e.target.value.replace(/[^0-9]/g, ''))} style={inputStyle} />
                </div>
                <button onClick={handleGerarTabela} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13.5px', marginTop: '4px', boxSizing: 'border-box', width: '100%' }}>
                  ⚙️ Gerar Cronograma Detalhado
                </button>
              </div>
            </div>

            <div style={cardStyle}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', wordBreak: 'break-word' }}>📊 Resumo Comparativo</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px', boxSizing: 'border-box' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box', minWidth: 0 }}>
                  <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px', wordBreak: 'break-word' }}>Tabela Price (Prestações Fixas)</strong>
                  <span style={{ fontSize: '12px', color: '#475569', wordBreak: 'break-word' }}>Parcela: <strong>{formatMoeda(pmtPrice)}</strong> (Fixa)</span><br/>
                  <span style={{ fontSize: '12px', color: '#64748b', wordBreak: 'break-word' }}>Custo Total: {formatMoeda(totalPrice)} (Juros: {formatMoeda(totalPrice - pvFin)})</span>
                </div>

                <div style={{ backgroundColor: '#f0fdf4', padding: '14px', borderRadius: '10px', border: '1px solid #86efac', boxSizing: 'border-box', minWidth: 0 }}>
                  <strong style={{ color: '#166534', display: 'block', marginBottom: '4px', wordBreak: 'break-word' }}>Tabela SAC (Amortização Constante)</strong>
                  <span style={{ fontSize: '12px', color: '#166534', wordBreak: 'break-word' }}>1ª Parcela: <strong>{formatMoeda(primeiraPrestacaoSac)}</strong> | Última: {formatMoeda(ultimaPrestacaoSac)}</span><br/>
                  <span style={{ fontSize: '12px', color: '#15803d', wordBreak: 'break-word' }}>Custo Total: <strong>{formatMoeda(totalSac)}</strong> (Juros Menores)</span>
                </div>
              </div>
            </div>
          </div>

          {tabelaGerada && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '20px', marginTop: '10px', boxSizing: 'border-box' }}>
              
              {/* Tabela Price */}
              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', overflowX: 'auto', boxSizing: 'border-box' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#0f172a', wordBreak: 'break-word' }}>Cronograma - Tabela Price</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'right', minWidth: '450px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Mês</th>
                      <th style={{ padding: '8px' }}>Prestação</th>
                      <th style={{ padding: '8px' }}>Amort.</th>
                      <th style={{ padding: '8px' }}>Juros</th>
                      <th style={{ padding: '8px' }}>Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cronogramaPrice.map(row => (
                      <tr key={row.periodo} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '6px', textAlign: 'center', whiteSpace: 'nowrap' }}>{row.periodo}</td>
                        <td style={{ padding: '6px', whiteSpace: 'nowrap' }}>{formatMoeda(row.prestacao)}</td>
                        <td style={{ padding: '6px', whiteSpace: 'nowrap' }}>{formatMoeda(row.amort)}</td>
                        <td style={{ padding: '6px', color: '#dc2626', whiteSpace: 'nowrap' }}>{formatMoeda(row.juros)}</td>
                        <td style={{ padding: '6px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{formatMoeda(row.saldo)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tabela SAC */}
              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', overflowX: 'auto', boxSizing: 'border-box' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#0f172a', wordBreak: 'break-word' }}>Cronograma - Tabela SAC</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'right', minWidth: '450px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Mês</th>
                      <th style={{ padding: '8px' }}>Prestação</th>
                      <th style={{ padding: '8px' }}>Amort.</th>
                      <th style={{ padding: '8px' }}>Juros</th>
                      <th style={{ padding: '8px' }}>Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cronogramaSac.map(row => (
                      <tr key={row.periodo} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '6px', textAlign: 'center', whiteSpace: 'nowrap' }}>{row.periodo}</td>
                        <td style={{ padding: '6px', whiteSpace: 'nowrap' }}>{formatMoeda(row.prestacao)}</td>
                        <td style={{ padding: '6px', whiteSpace: 'nowrap' }}>{formatMoeda(row.amort)}</td>
                        <td style={{ padding: '6px', color: '#dc2626', whiteSpace: 'nowrap' }}>{formatMoeda(row.juros)}</td>
                        <td style={{ padding: '6px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{formatMoeda(row.saldo)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </div>
      )}

      {/* 4. ABA: AVP (CPC 12) */}
      {abaAtiva === 'avp' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
          <div style={cardStyle}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', wordBreak: 'break-word' }}>Parâmetros AVP (CPC 12)</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Valor Nominal Futuro (R$):</label>
                <input type="text" value={valorFuturoStr} onChange={e => setValorFuturoStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Taxa de Desconto (% a.m.):</label>
                <input type="text" value={taxaDescontoStr} onChange={e => setTaxaDescontoStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Prazo (meses):</label>
                <input type="text" value={mesesAvpStr} onChange={e => setMesesAvpStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', wordBreak: 'break-word' }}>⚖️ Resultado Ajuste a Valor Presente</h3>
            <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1px solid #86efac', marginTop: '14px', boxSizing: 'border-box', minWidth: 0 }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#166534', display: 'block', wordBreak: 'break-word' }}>VALOR PRESENTE (VP):</span>
              <strong style={{ fontSize: '22px', color: '#15803d', display: 'block', marginTop: '4px', wordBreak: 'break-word' }}>{formatMoeda(valorPresente)}</strong>
              <span style={{ fontSize: '11px', color: '#166534', display: 'block', marginTop: '4px', wordBreak: 'break-word' }}>Ajuste a Apropriar (AVP): <strong>{formatMoeda(ajusteAvp)}</strong></span>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', margin: '14px 0 0 0', lineHeight: '1.5', wordBreak: 'break-word' }}>
              Conforme o <strong>CPC 12</strong>, os elementos de longo prazo devem ser ajustados a valor presente para refletir o valor econômico.
            </p>
          </div>
        </div>
      )}

      {/* 5. ABA: DESCONTOS */}
      {abaAtiva === 'descontos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
          <div style={cardStyle}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', wordBreak: 'break-word' }}>Parâmetros de Títulos</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Valor Nominal do Título (N):</label>
                <input type="text" value={nominalStr} onChange={e => setNominalStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Taxa de Desconto (% a.m.):</label>
                <input type="text" value={taxaDescStr} onChange={e => setTaxaDescStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
              </div>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Prazo até Vencimento (dias):</label>
                <input type="text" value={diasStr} onChange={e => setDiasStr(e.target.value.replace(/[^0-9]/g, ''))} style={inputStyle} />
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', wordBreak: 'break-word' }}>📉 Comparativo de Descontos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px', boxSizing: 'border-box' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box', minWidth: 0 }}>
                <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px', wordBreak: 'break-word' }}>Desconto Comercial ("Por Fora")</strong>
                <span style={{ fontSize: '12px', color: '#dc2626', wordBreak: 'break-word' }}>Desconto: {formatMoeda(descontoComercial)}</span><br/>
                <span style={{ fontSize: '12px', color: '#0f172a', wordBreak: 'break-word' }}>Valor Líquido: <strong>{formatMoeda(valorLiberadoComercial)}</strong></span>
              </div>

              <div style={{ backgroundColor: '#f0fdf4', padding: '14px', borderRadius: '10px', border: '1px solid #86efac', boxSizing: 'border-box', minWidth: 0 }}>
                <strong style={{ color: '#166534', display: 'block', marginBottom: '4px', wordBreak: 'break-word' }}>Desconto Racional / Financeiro ("Por Dentro")</strong>
                <span style={{ fontSize: '12px', color: '#15803d', wordBreak: 'break-word' }}>Desconto: {formatMoeda(descontoFinanceiro)}</span><br/>
                <span style={{ fontSize: '12px', color: '#0f172a', wordBreak: 'break-word' }}>Valor Líquido: <strong>{formatMoeda(valorLiberadoFinanceiro)}</strong></span>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}