import React, { useState, useEffect } from 'react';

export default function SimuladorNotaFiscal() {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Tipo de Documento: 'produto' (NF-e modelo 55) ou 'servico' (NFS-e Municipal)
  const [tipoDocumento, setTipoDocumento] = useState('produto');

  // Identificação
  const [emitenteRazao] = useState('Contábil Soluções Empresariais Ltda');
  const [emitenteCnpj] = useState('12.345.678/0001-90');
  const [tomadorRazao, setTomadorRazao] = useState('Indústria e Comércio Bandeirantes S/A');
  const [tomadorCnpj, setTomadorCnpj] = useState('44.555.666/0001-22');

  // Dados do Item / Serviço (Inputs em String para não travar o zero no Backspace)
  const [descricao, setDescricao] = useState('Consultoria e Planejamento Tributário');
  const [valorBrutoStr, setValorBrutoStr] = useState('12000.00');
  const [descontoIncondicionalStr, setDescontoIncondicionalStr] = useState('0.00');

  // Alíquotas e Tributos para Produtos (NF-e)
  const [aliqIcmsStr, setAliqIcmsStr] = useState('18.0');
  const [aliqIpiStr, setAliqIpiStr] = useState('0.0');

  // Alíquotas e Retenções para Serviços (NFS-e)
  const [aliqIssStr, setAliqIssStr] = useState('5.0');
  const [reterIss, setReterIss] = useState(false);
  const [reterFederais, setReterFederais] = useState(true); // PIS/COFINS/CSLL (4.65%) e IRRF (1.5%)

  // Totais Calculados
  const [totais, setTotais] = useState({
    valorBruto: 0,
    desconto: 0,
    baseCalculo: 0,
    // Tributos NF-e
    icms: 0,
    ipi: 0,
    // Tributos NFS-e
    iss: 0,
    irrfRetido: 0,
    pisCofinsCsllRetido: 0,
    totalRetencoesFonte: 0,
    // Totais Finais
    valorLiquidoReceber: 0,
    totalFaturado: 0
  });

  useEffect(() => {
    const vBruto = parseFloat(valorBrutoStr) || 0;
    const vDesc = parseFloat(descontoIncondicionalStr) || 0;
    const base = Math.max(0, vBruto - vDesc);

    if (tipoDocumento === 'produto') {
      const aIcms = (parseFloat(aliqIcmsStr) || 0) / 100;
      const aIpi = (parseFloat(aliqIpiStr) || 0) / 100;

      const vIcms = base * aIcms;
      const vIpi = base * aIpi;
      const totalNota = base + vIpi;

      setTotais({
        valorBruto: vBruto,
        desconto: vDesc,
        baseCalculo: base,
        icms: vIcms,
        ipi: vIpi,
        iss: 0,
        irrfRetido: 0,
        pisCofinsCsllRetido: 0,
        totalRetencoesFonte: 0,
        valorLiquidoReceber: totalNota,
        totalFaturado: totalNota
      });
    } else {
      // NFS-e (Serviços)
      const aIss = (parseFloat(aliqIssStr) || 0) / 100;
      const vIss = base * aIss;

      // Retenções na fonte (Lei 10.833 e RIR)
      const vIrrf = reterFederais ? base * 0.015 : 0; // 1,5% IRRF
      const vCsrf = reterFederais ? base * 0.0465 : 0; // 4,65% (PIS 0,65% + COFINS 3% + CSLL 1%)
      const vIssRetido = reterIss ? vIss : 0;

      const totalRetencoes = vIrrf + vCsrf + vIssRetido;
      const liqReceber = base - totalRetencoes;

      setTotais({
        valorBruto: vBruto,
        desconto: vDesc,
        baseCalculo: base,
        icms: 0,
        ipi: 0,
        iss: vIss,
        irrfRetido: vIrrf,
        pisCofinsCsllRetido: vCsrf,
        totalRetencoesFonte: totalRetencoes,
        valorLiquidoReceber: liqReceber,
        totalFaturado: base
      });
    }
  }, [tipoDocumento, valorBrutoStr, descontoIncondicionalStr, aliqIcmsStr, aliqIpiStr, aliqIssStr, reterIss, reterFederais]);

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO COM SELEÇÃO DO TIPO DE NOTA */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>📄</span> Emissor Fiscal de Nota Fiscal
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Emissão didática de NF-e (Mercadorias/SEFAZ) e NFS-e (Serviços/Prefeitura).
          </p>
        </div>

        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0', gap: '4px' }}>
          <button 
            onClick={() => { setTipoDocumento('produto'); setDescricao('Mesa Diretor em L com Gaveteiro'); }}
            style={{ 
              padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: tipoDocumento === 'produto' ? '#0f172a' : 'transparent', 
              color: tipoDocumento === 'produto' ? 'white' : '#64748b'
            }}
          >
            📦 NF-e (Mercadorias)
          </button>
          <button 
            onClick={() => { setTipoDocumento('servico'); setDescricao('Consultoria e Planejamento Tributário'); }}
            style={{ 
              padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: tipoDocumento === 'servico' ? '#2563eb' : 'transparent', 
              color: tipoDocumento === 'servico' ? 'white' : '#64748b'
            }}
          >
            💼 NFS-e (Serviços)
          </button>
        </div>
      </div>

      {/* DASHBOARDS DE RESULTADOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #64748b' }}>
          <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Valor Bruto do Documento</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '24px', marginTop: '4px' }}>
            {formatMoeda(totais.valorBruto)}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Base contratual do faturamento</span>
        </div>

        <div style={{ backgroundColor: '#fff5f5', padding: '18px', borderRadius: '12px', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444' }}>
          <span style={{ color: '#991b1b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {tipoDocumento === 'produto' ? 'Tributos Incidentes (ICMS+IPI)' : 'Retenções na Fonte (Tomador)'}
          </span>
          <strong style={{ display: 'block', color: '#dc2626', fontSize: '24px', marginTop: '4px' }}>
            {formatMoeda(tipoDocumento === 'produto' ? (totais.icms + totais.ipi) : totais.totalRetencoesFonte)}
          </strong>
          <span style={{ fontSize: '11px', color: '#991b1b' }}>
            {tipoDocumento === 'produto' ? 'Destacados no documento fiscal' : 'Descontados pelo cliente no pagamento'}
          </span>
        </div>

        <div style={{ backgroundColor: '#f0fdf4', padding: '18px', borderRadius: '12px', border: '1px solid #86efac', borderLeft: '4px solid #16a34a' }}>
          <span style={{ color: '#166534', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Valor Líquido a Receber</span>
          <strong style={{ display: 'block', color: '#15803d', fontSize: '24px', marginTop: '4px' }}>
            {formatMoeda(totais.valorLiquidoReceber)}
          </strong>
          <span style={{ fontSize: '11px', color: '#166534' }}>Entrada efetiva no Caixa/Banco</span>
        </div>
      </div>

      {/* ÁREA DE PREENCHIMENTO E ESPELHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        
        {/* FORMULÁRIO DE ENTRADA */}
        <div style={{ flex: '1 1 340px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
            Parâmetros do Documento
          </h3>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
            Cliente / Tomador:
            <input 
              type="text" 
              value={tomadorRazao} 
              onChange={e => setTomadorRazao(e.target.value)} 
              style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
            Discriminação do Item / Serviço:
            <input 
              type="text" 
              value={descricao} 
              onChange={e => setDescricao(e.target.value)} 
              style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
            />
          </label>

          <div style={{ display: 'flex', gap: '10px' }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>
              Valor Total do Serviço/Produto (R$):
              <input 
                type="text" 
                value={valorBrutoStr} 
                onChange={e => setValorBrutoStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
              />
            </label>

            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Desconto Comercial (R$):
              <input 
                type="text" 
                value={descontoIncondicionalStr} 
                onChange={e => setDescontoIncondicionalStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
              />
            </label>
          </div>

          {/* Campos específicos de Mercadorias */}
          {tipoDocumento === 'produto' && (
            <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
              <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                ICMS (%):
                <input 
                  type="text" 
                  value={aliqIcmsStr} 
                  onChange={e => setAliqIcmsStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                  style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
                />
              </label>

              <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                IPI (%):
                <input 
                  type="text" 
                  value={aliqIpiStr} 
                  onChange={e => setAliqIpiStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                  style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
                />
              </label>
            </div>
          )}

          {/* Campos específicos de Serviços */}
          {tipoDocumento === 'servico' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', borderTop: '1px solid #e2e8f0', paddingTop: '10px' }}>
              <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                Alíquota ISS Municipal (%):
                <input 
                  type="text" 
                  value={aliqIssStr} 
                  onChange={e => setAliqIssStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                  style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
                />
              </label>

              <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', color: '#0f172a' }}>
                  <input type="checkbox" checked={reterFederais} onChange={e => setReterFederais(e.target.checked)} />
                  Reter Tributos Federais na Fonte (IRRF 1,5% + CSRF 4,65%)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', cursor: 'pointer', color: '#0f172a' }}>
                  <input type="checkbox" checked={reterIss} onChange={e => setReterIss(e.target.checked)} />
                  Tomador é responsável pelo recolhimento do ISS (Retido na Fonte)
                </label>
              </div>
            </div>
          )}
        </div>

        {/* ESPELHO FISCAL E GUIA CONTÁBIL */}
        <div style={{ flex: '1 1 380px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* Card Visual da Nota Fiscal */}
          <div style={{ backgroundColor: 'white', border: '1px solid #0f172a', borderRadius: '12px', padding: '18px', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
            <div style={{ borderBottom: '1px solid #cbd5e1', paddingBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>
                  {tipoDocumento === 'produto' ? 'DANFE - NOTA FISCAL ELETRÔNICA' : 'NFS-e - NOTA FISCAL DE SERVIÇOS ELETRÔNICA'}
                </strong>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Ambiente de Produção e Homologação</span>
              </div>
              <span style={{ backgroundColor: '#0f172a', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '3px 8px', borderRadius: '4px' }}>
                Nº 000.014.280
              </span>
            </div>

            <div style={{ padding: '12px 0', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px', borderBottom: '1px dashed #cbd5e1' }}>
              <div><strong>Prestador / Emitente:</strong> {emitenteRazao} ({emitenteCnpj})</div>
              <div><strong>Tomador / Destinatário:</strong> {tomadorRazao} ({tomadorCnpj})</div>
              <div><strong>Discriminação:</strong> {descricao}</div>
            </div>

            {/* Quadro de Tributos do Espelho */}
            <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#475569' }}>Valor dos Serviços / Produtos:</span>
                <strong>{formatMoeda(totais.valorBruto)}</strong>
              </div>

              {tipoDocumento === 'servico' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>ISS Calculado ({aliqIssStr}%):</span>
                    <span>{formatMoeda(totais.iss)} {reterIss ? '(Retido)' : ''}</span>
                  </div>
                  {reterFederais && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                        <span>(-) IRRF Retido na Fonte (1,5%):</span>
                        <span>- {formatMoeda(totais.irrfRetido)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#dc2626' }}>
                        <span>(-) PIS / COFINS / CSLL Retidos (4,65%):</span>
                        <span>- {formatMoeda(totais.pisCofinsCsllRetido)}</span>
                      </div>
                    </>
                  )}
                </>
              )}

              {tipoDocumento === 'produto' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                    <span>ICMS Destacado ({aliqIcmsStr}%):</span>
                    <span>{formatMoeda(totais.icms)}</span>
                  </div>
                  {totais.ipi > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}>
                      <span>IPI Destacado ({aliqIpiStr}%):</span>
                      <span>{formatMoeda(totais.ipi)}</span>
                    </div>
                  )}
                </>
              )}
            </div>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
              <span style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '13px' }}>Líquido da Fatura:</span>
              <strong style={{ fontSize: '18px', color: '#16a34a' }}>{formatMoeda(totais.valorLiquidoReceber)}</strong>
            </div>
          </div>

          {/* MAPA CONTÁBIL NO LIVRO DIÁRIO */}
          <div style={{ backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', padding: '18px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🧭</span> Mapa de Lançamentos no Livro Diário
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontFamily: 'monospace' }}>
              <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '6px' }}>
                <div style={{ color: '#059669', fontWeight: 'bold' }}>1. Pelo Faturamento / Direito a Receber:</div>
                <div>D: Clientes a Receber (Ativo Circulante) .. {formatMoeda(totais.valorLiquidoReceber)}</div>
                {totais.irrfRetido > 0 && <div>D: IRRF a Compensar (Ativo Circulante) ....... {formatMoeda(totais.irrfRetido)}</div>}
                {totais.pisCofinsCsllRetido > 0 && <div>D: CSRF a Compensar (Ativo Circulante) ...... {formatMoeda(totais.pisCofinsCsllRetido)}</div>}
                <div>C: Receita Bruta de Serviços/Vendas (DRE) ... {formatMoeda(totais.baseCalculo)}</div>
              </div>

              <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '6px' }}>
                <div style={{ color: '#dc2626', fontWeight: 'bold' }}>2. Pelas Deduções Tributárias Incidentes:</div>
                {tipoDocumento === 'servico' && !reterIss && (
                  <div>
                    <div>D: ISS sobre Serviços (Redutora DRE) ........ {formatMoeda(totais.iss)}</div>
                    <div>C: ISS a Recolher (Passivo Circulante) ....... {formatMoeda(totais.iss)}</div>
                  </div>
                )}
                {tipoDocumento === 'produto' && (
                  <div>
                    <div>D: ICMS sobre Vendas (Redutora DRE) ......... {formatMoeda(totais.icms)}</div>
                    <div>C: ICMS a Recolher (Passivo Circulante) ...... {formatMoeda(totais.icms)}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}