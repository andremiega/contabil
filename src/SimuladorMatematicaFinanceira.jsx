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
  const [taxaFinStr, setTaxaFinStr] = useState('1.0'); // % ao mês
  const [prazoMesesStr, setPrazoMesesStr] = useState('12'); // meses
  
  // Estado para exibir a tabela após clicar no botão
  const [tabelaGerada, setTabelaGerada] = useState(false);
  const [cronogramaSac, setCronogramaSac] = useState([]);
  const [cronogramaPrice, setCronogramaPrice] = useState([]);

  // 4. Estados para AVP (CPC 12)
  const [valorFuturoStr, setValorFuturoStr] = useState('50000');
  const [taxaDescontoStr, setTaxaDescontoStr] = useState('1.5'); // % ao mês
  const [mesesAvpStr, setMesesAvpStr] = useState('18');

  // 5. Estados para Descontos (Comercial vs Financeiro)
  const [nominalStr, setNominalStr] = useState('10000');
  const [taxaDescStr, setTaxaDescStr] = useState('2.0'); // % ao mês
  const [diasStr, setDiasStr] = useState('90'); // dias

  // ================= CÁLCULOS =================
  const capital = parseFloat(capitalStr) || 0;
  const iComum = (parseFloat(taxaStr) || 0) / 100;
  const tComum = parseInt(tempoStr) || 0;
  const montanteCompostos = capital * Math.pow(1 + iComum, tComum);

  // Porcentagem
  const valorBase = parseFloat(valorBaseStr) || 0;
  const percentual = (parseFloat(percentualStr) || 0) / 100;
  const valorAcrescimo = valorBase * (1 + percentual);
  const valorDesconto = valorBase * (1 - percentual);
  const partePercentual = valorBase * percentual;

  // Financiamento SAC vs Price
  const pvFin = parseFloat(financiamentoStr) || 0;
  const iFin = (parseFloat(taxaFinStr) || 0) / 100;
  const nFin = parseInt(prazoMesesStr) || 1;

  // Prestação Tabela Price (Sistema Francês)
  const pmtPrice = pvFin * (Math.pow(1 + iFin, nFin) * iFin) / (Math.pow(1 + iFin, nFin) - 1);
  const totalPrice = pmtPrice * nFin;

  // Tabela SAC (Amortização Constante)
  const amortizacaoSac = pvFin / nFin;
  const primeiraPrestacaoSac = amortizacaoSac + (pvFin * iFin);
  const ultimaPrestacaoSac = amortizacaoSac + (amortizacaoSac * iFin);
  const totalSac = ((primeiraPrestacaoSac + ultimaPrestacaoSac) / 2) * nFin;

  // Função para Gerar as Tabelas Detalhadas SAC e Price
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

  // AVP (CPC 12)
  const vfAvp = parseFloat(valorFuturoStr) || 0;
  const iAvp = (parseFloat(taxaDescontoStr) || 0) / 100;
  const nAvp = parseFloat(mesesAvpStr) || 0;
  const valorPresente = vfAvp / Math.pow(1 + iAvp, nAvp);
  const ajusteAvp = vfAvp - valorPresente;

  // Descontos
  const nNominal = parseFloat(nominalStr) || 0;
  const iDesc = (parseFloat(taxaDescStr) || 0) / 100;
  const mesesDesc = (parseFloat(diasStr) || 30) / 30;
  
  const descontoComercial = nNominal * iDesc * mesesDesc;
  const valorLiberadoComercial = nNominal - descontoComercial;

  const descontoFinanceiro = (nNominal * iDesc * mesesDesc) / (1 + (iDesc * mesesDesc));
  const valorLiberadoFinanceiro = nNominal - descontoFinanceiro;

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🧮</span> Matemática Financeira, SAC/Price, AVP & Descontos
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Simulador completo de amortizações, Ajuste a Valor Presente, Porcentagens e Descontos para controladoria.
          </p>
        </div>

        {/* NAVEGAÇÃO ENTRE ABAS */}
        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0', gap: '4px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => setAbaAtiva('compostos')}
            style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', backgroundColor: abaAtiva === 'compostos' ? '#2563eb' : 'transparent', color: abaAtiva === 'compostos' ? 'white' : '#64748b' }}
          >
            📈 Juros Compostos
          </button>
          <button 
            onClick={() => setAbaAtiva('porcentagem')}
            style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', backgroundColor: abaAtiva === 'porcentagem' ? '#16a34a' : 'transparent', color: abaAtiva === 'porcentagem' ? 'white' : '#64748b' }}
          >
            💯 Porcentagem
          </button>
          <button 
            onClick={() => setAbaAtiva('sacprice')}
            style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', backgroundColor: abaAtiva === 'sacprice' ? '#0f172a' : 'transparent', color: abaAtiva === 'sacprice' ? 'white' : '#64748b' }}
          >
            🏠 SAC vs Price
          </button>
          <button 
            onClick={() => setAbaAtiva('avp')}
            style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', backgroundColor: abaAtiva === 'avp' ? '#059669' : 'transparent', color: abaAtiva === 'avp' ? 'white' : '#64748b' }}
          >
            ⚖️ AVP (CPC 12)
          </button>
          <button 
            onClick={() => setAbaAtiva('descontos')}
            style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', backgroundColor: abaAtiva === 'descontos' ? '#d97706' : 'transparent', color: abaAtiva === 'descontos' ? 'white' : '#64748b' }}
          >
            📉 Descontos
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. ABA: JUROS COMPOSTOS                                   */}
      {/* ========================================================= */}
      {abaAtiva === 'compostos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', animation: 'fadeIn 0.3s' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>Parâmetros da Aplicação</h3>
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Capital Inicial (C):
              <input type="text" value={capitalStr} onChange={e => setCapitalStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Taxa (% ao mês - i):
              <input type="text" value={taxaStr} onChange={e => setTaxaStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Prazo (meses - t):
              <input type="text" value={tempoStr} onChange={e => setTempoStr(e.target.value.replace(/[^0-9]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </label>
            <div style={{ backgroundColor: '#eff6ff', padding: '14px', borderRadius: '8px', border: '1px solid #bfdbfe', marginTop: '10px' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#1d4ed8', display: 'block' }}>MONTANTE COMPOSTO:</span>
              <strong style={{ fontSize: '20px', color: '#1e40af', display: 'block', marginTop: '4px' }}>{formatMoeda(montanteCompostos)}</strong>
              <span style={{ fontSize: '11px', color: '#2563eb' }}>Rendimento Líquido: <strong>{formatMoeda(montanteCompostos - capital)}</strong></span>
            </div>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>🔍 Demonstração da Fórmula</h3>
            <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '13px', textAlign: 'center', color: '#2563eb', fontWeight: 'bold' }}>
              M = C × (1 + i)^t
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
              No regime de juros compostos, o montante cresce exponencialmente a cada período.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ABA: PORCENTAGEM                                       */}
      {/* ========================================================= */}
      {abaAtiva === 'porcentagem' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', animation: 'fadeIn 0.3s' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>Calculadora de Percentuais</h3>
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Valor Base (R$):
              <input type="text" value={valorBaseStr} onChange={e => setValorBaseStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Percentual (%):
              <input type="text" value={percentualStr} onChange={e => setPercentualStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </label>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>📊 Resultados Práticos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px', color: '#334155' }}>
              <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between' }}>
                <span>Valor Correspondente ({percentualStr}%):</span>
                <strong style={{ color: '#2563eb' }}>{formatMoeda(partePercentual)}</strong>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '1px solid #86efac', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#166534' }}>Com Acréscimo (+{percentualStr}%):</span>
                <strong style={{ color: '#15803d' }}>{formatMoeda(valorAcrescimo)}</strong>
              </div>
              <div style={{ padding: '10px', backgroundColor: '#fff5f5', borderRadius: '8px', border: '1px solid #fecaca', display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#991b1b' }}>Com Desconto (-{percentualStr}%):</span>
                <strong style={{ color: '#dc2626' }}>{formatMoeda(valorDesconto)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. ABA: TABELA SAC VS PRICE COM BOTÃO GERAR TABELA        */}
      {/* ========================================================= */}
      {abaAtiva === 'sacprice' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            
            {/* Parâmetros */}
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>Parâmetros do Financiamento</h3>
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                Valor Financiado (PV):
                <input type="text" value={financiamentoStr} onChange={e => setFinanciamentoStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                Taxa de Juros (% a.m.):
                <input type="text" value={taxaFinStr} onChange={e => setTaxaFinStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </label>
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                Prazo (meses):
                <input type="text" value={prazoMesesStr} onChange={e => setPrazoMesesStr(e.target.value.replace(/[^0-9]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </label>
              <button onClick={handleGerarTabela} style={{ backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px', marginTop: '5px' }}>
                ⚙️ Gerar Tabela
              </button>
            </div>

            {/* Resumo */}
            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>📊 Resumo Comparativo</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>Tabela Price (Prestações Fixas)</strong>
                  <span style={{ fontSize: '12px', color: '#475569' }}>Parcela Mensal: <strong>{formatMoeda(pmtPrice)}</strong> (Fixa)</span><br/>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Custo Total: {formatMoeda(totalPrice)} (Juros: {formatMoeda(totalPrice - pvFin)})</span>
                </div>

                <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>Tabela SAC (Amortização Constante)</strong>
                  <span style={{ fontSize: '12px', color: '#475569' }}>1ª Parcela: <strong>{formatMoeda(primeiraPrestacaoSac)}</strong> | Última: {formatMoeda(ultimaPrestacaoSac)}</span><br/>
                  <span style={{ fontSize: '12px', color: '#16a34a' }}>Custo Total: <strong>{formatMoeda(totalSac)}</strong> (Juros Totais Menores)</span>
                </div>
              </div>
            </div>
          </div>

          {/* TABELAS DETALHADAS APÓS CLICAR EM GERAR TABELA */}
          {tabelaGerada && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '10px' }}>
              
              {/* Tabela Price */}
              <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #cbd5e1', overflowX: 'auto' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>Cronograma Detalhado - Tabela Price</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'right' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Mês</th>
                      <th style={{ padding: '8px' }}>Prestação</th>
                      <th style={{ padding: '8px' }}>Amortização</th>
                      <th style={{ padding: '8px' }}>Juros</th>
                      <th style={{ padding: '8px' }}>Saldo Devedor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cronogramaPrice.map(row => (
                      <tr key={row.periodo} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '6px', textAlign: 'center' }}>{row.periodo}</td>
                        <td style={{ padding: '6px' }}>{formatMoeda(row.prestacao)}</td>
                        <td style={{ padding: '6px' }}>{formatMoeda(row.amort)}</td>
                        <td style={{ padding: '6px', color: '#dc2626' }}>{formatMoeda(row.juros)}</td>
                        <td style={{ padding: '6px', fontWeight: 'bold' }}>{formatMoeda(row.saldo)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tabela SAC */}
              <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #cbd5e1', overflowX: 'auto' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>Cronograma Detalhado - Tabela SAC</h4>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'right' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', color: '#0f172a' }}>
                      <th style={{ padding: '8px', textAlign: 'center' }}>Mês</th>
                      <th style={{ padding: '8px' }}>Prestação</th>
                      <th style={{ padding: '8px' }}>Amortização</th>
                      <th style={{ padding: '8px' }}>Juros</th>
                      <th style={{ padding: '8px' }}>Saldo Devedor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cronogramaSac.map(row => (
                      <tr key={row.periodo} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '6px', textAlign: 'center' }}>{row.periodo}</td>
                        <td style={{ padding: '6px' }}>{formatMoeda(row.prestacao)}</td>
                        <td style={{ padding: '6px' }}>{formatMoeda(row.amort)}</td>
                        <td style={{ padding: '6px', color: '#dc2626' }}>{formatMoeda(row.juros)}</td>
                        <td style={{ padding: '6px', fontWeight: 'bold' }}>{formatMoeda(row.saldo)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. ABA: AVP (CPC 12)                                      */}
      {/* ========================================================= */}
      {abaAtiva === 'avp' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', animation: 'fadeIn 0.3s' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>Parâmetros AVP (CPC 12)</h3>
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Valor Nominal Futuro (R$):
              <input type="text" value={valorFuturoStr} onChange={e => setValorFuturoStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Taxa de Desconto (% a.m.):
              <input type="text" value={taxaDescontoStr} onChange={e => setTaxaDescontoStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Prazo (meses):
              <input type="text" value={mesesAvpStr} onChange={e => setMesesAvpStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </label>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>⚖️ Resultado Ajuste a Valor Presente</h3>
            <div style={{ backgroundColor: '#f0fdf4', padding: '14px', borderRadius: '8px', border: '1px solid #86efac' }}>
              <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#166534', display: 'block' }}>VALOR PRESENTE (VP):</span>
              <strong style={{ fontSize: '20px', color: '#15803d', display: 'block', marginTop: '4px' }}>{formatMoeda(valorPresente)}</strong>
              <span style={{ fontSize: '11px', color: '#166534' }}>Ajuste a Apropriar (AVP): <strong>{formatMoeda(ajusteAvp)}</strong></span>
            </div>
            <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: '1.4' }}>
              Conforme o <strong>CPC 12</strong>, os elementos de longo prazo devem ser ajustados a valor presente.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. ABA: DESCONTOS COMERCIAL X FINANCEIRO                  */}
      {/* ========================================================= */}
      {abaAtiva === 'descontos' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', animation: 'fadeIn 0.3s' }}>
          <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>Parâmetros de Títulos</h3>
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Valor Nominal do Título (N):
              <input type="text" value={nominalStr} onChange={e => setNominalStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Taxa de Desconto (% a.m.):
              <input type="text" value={taxaDescStr} onChange={e => setTaxaDescStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Prazo até o Vencimento (dias):
              <input type="text" value={diasStr} onChange={e => setDiasStr(e.target.value.replace(/[^0-9]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
            </label>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>📉 Comparativo de Descontos</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>Desconto Comercial ("Por Fora")</strong>
                <span style={{ fontSize: '12px', color: '#dc2626' }}>Desconto: {formatMoeda(descontoComercial)}</span><br/>
                <span style={{ fontSize: '12px', color: '#0f172a' }}>Valor Líquido Liberado: <strong>{formatMoeda(valorLiberadoComercial)}</strong></span>
              </div>

              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong style={{ color: '#0f172a', display: 'block', marginBottom: '2px' }}>Desconto Racional / Financeiro ("Por Dentro")</strong>
                <span style={{ fontSize: '12px', color: '#16a34a' }}>Desconto: {formatMoeda(descontoFinanceiro)}</span><br/>
                <span style={{ fontSize: '12px', color: '#0f172a' }}>Valor Líquido Liberado: <strong>{formatMoeda(valorLiberadoFinanceiro)}</strong></span>
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