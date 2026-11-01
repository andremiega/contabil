import React, { useState, useEffect } from 'react';

export default function SimuladorNFe() {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // 1. Dados do Emitente e Destinatário
  const [emitenteRazao] = useState('Contábil Cloud Soluções Comerciais Ltda');
  const [emitenteCnpj] = useState('12.345.678/0001-90');
  const [destinatarioNome, setDestinatarioNome] = useState('Comércio de Alimentos São Paulo Ltda');
  const [destinatarioCnpj, setDestinatarioCnpj] = useState('98.765.432/0001-11');
  const [naturezaOperacao, setNaturezaOperacao] = useState('5.102 - Venda de mercadoria adquirida de terceiros');

  // 2. Itens da NF-e (Inputs em string para não travar no zero)
  const [descricaoItem, setDescricaoItem] = useState('Cadeira Giratória Ergonômica NR-17');
  const [ncmItem, setNcmItem] = useState('9401.30.00');
  const [cstItem, setCstItem] = useState('000 - Tributada Integralmente');
  const [cfopItem, setCfopItem] = useState('5102');
  const [qtdStr, setQtdStr] = useState('10');
  const [valorUnitStr, setValorUnitStr] = useState('450.00');
  const [freteStr, setFreteStr] = useState('120.00');
  const [descontoStr, setDescontoStr] = useState('50.00');

  // 3. Alíquotas de Tributos
  const [aliqIcmsStr, setAliqIcmsStr] = useState('18.0');
  const [aliqIpiStr, setAliqIpiStr] = useState('5.0');
  const [aliqPisStr, setAliqPisStr] = useState('1.65');
  const [aliqCofinsStr, setAliqCofinsStr] = useState('7.6');

  // 4. Totais Calculados
  const [totais, setTotais] = useState({
    totalProdutos: 0,
    baseIcms: 0,
    valorIcms: 0,
    valorIpi: 0,
    valorPis: 0,
    valorCofins: 0,
    totalTributosDeducoes: 0,
    totalNota: 0,
    chaveAcesso: ''
  });

  // Gerador de Chave de Acesso Didática de 44 dígitos
  useEffect(() => {
    const uf = '35'; // SP
    const aamm = '2610'; // Out/2026
    const cnpjLimpo = emitenteCnpj.replace(/\D/g, '');
    const mod = '55';
    const serie = '001';
    const nroNf = '000008452';
    const forma = '1';
    const codAleatorio = '83921045';
    const chaveSemDv = `${uf}${aamm}${cnpjLimpo}${mod}${serie}${nroNf}${forma}${codAleatorio}`;
    const chaveFormatada = `${chaveSemDv}8`.replace(/(\d{4})/g, '$1 ').trim();

    const qtd = parseFloat(qtdStr) || 0;
    const unit = parseFloat(valorUnitStr) || 0;
    const frete = parseFloat(freteStr) || 0;
    const desconto = parseFloat(descontoStr) || 0;

    const aliqIcms = (parseFloat(aliqIcmsStr) || 0) / 100;
    const aliqIpi = (parseFloat(aliqIpiStr) || 0) / 100;
    const aliqPis = (parseFloat(aliqPisStr) || 0) / 100;
    const aliqCofins = (parseFloat(aliqCofinsStr) || 0) / 100;

    const prodTotal = qtd * unit;
    
    // Base de cálculo do ICMS inclui o frete e exclui descontos incondicionais
    const baseCalculoIcms = Math.max(0, prodTotal + frete - desconto);
    const vIcms = baseCalculoIcms * aliqIcms;
    const vIpi = prodTotal * aliqIpi;
    const vPis = prodTotal * aliqPis;
    const vCofins = prodTotal * aliqCofins;

    // Total da Nota = Produtos + Frete + IPI - Desconto
    const vTotalNota = Math.max(0, prodTotal + frete + vIpi - desconto);

    setTotais({
      totalProdutos: prodTotal,
      baseIcms: baseCalculoIcms,
      valorIcms: vIcms,
      valorIpi: vIpi,
      valorPis: vPis,
      valorCofins: vCofins,
      totalTributosDeducoes: vIcms + vPis + vCofins,
      totalNota: vTotalNota,
      chaveAcesso: chaveFormatada
    });
  }, [qtdStr, valorUnitStr, freteStr, descontoStr, aliqIcmsStr, aliqIpiStr, aliqPisStr, aliqCofinsStr, emitenteCnpj]);

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🧾</span> Simulador de Emissão & Auditoria de NF-e
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Documento Fiscal Eletrônico (Modelo 55), cálculo de tributos e integração com o Diário.
          </p>
        </div>

        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>●</span> SEFAZ/SP: Autorizada para Uso
        </div>
      </div>

      {/* DASHBOARDS RÁPIDOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #0f172a' }}>
          <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Total dos Produtos</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '24px', marginTop: '4px' }}>
            {formatMoeda(totais.totalProdutos)}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>{qtdStr || '0'} unidades faturadas</span>
        </div>

        <div style={{ backgroundColor: '#eff6ff', padding: '18px', borderRadius: '12px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb' }}>
          <span style={{ color: '#1d4ed8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Valor Total da NF-e</span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '24px', marginTop: '4px' }}>
            {formatMoeda(totais.totalNota)}
          </strong>
          <span style={{ fontSize: '11px', color: '#2563eb' }}>Produtos + IPI + Frete - Desc.</span>
        </div>

        <div style={{ backgroundColor: '#fff5f5', padding: '18px', borderRadius: '12px', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444' }}>
          <span style={{ color: '#991b1b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Deduções Tributárias (Venda)</span>
          <strong style={{ display: 'block', color: '#dc2626', fontSize: '24px', marginTop: '4px' }}>
            {formatMoeda(totais.totalTributosDeducoes)}
          </strong>
          <span style={{ fontSize: '11px', color: '#991b1b' }}>ICMS + PIS + COFINS incidentes</span>
        </div>

        <div style={{ backgroundColor: '#f0fdf4', padding: '18px', borderRadius: '12px', border: '1px solid #86efac', borderLeft: '4px solid #16a34a' }}>
          <span style={{ color: '#166534', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Receita Líquida na DRE</span>
          <strong style={{ display: 'block', color: '#15803d', fontSize: '24px', marginTop: '4px' }}>
            {formatMoeda(totais.totalProdutos - totais.totalTributosDeducoes)}
          </strong>
          <span style={{ fontSize: '11px', color: '#166534' }}>Faturamento sem impostos</span>
        </div>
      </div>

      {/* ÁREA DE CONFIGURAÇÃO FISCAL E ESPELHO DANFE */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '25px' }}>
        
        {/* COLUNA ESQUERDA: PARÂMETROS DO ITEM E TRIBUTAÇÃO */}
        <div style={{ flex: '1 1 350px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
            Dados Cadastrais do Faturamento
          </h3>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
            Destinatário / Cliente:
            <input 
              type="text" 
              value={destinatarioNome} 
              onChange={e => setDestinatarioNome(e.target.value)} 
              style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
            />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
            Descrição da Mercadoria:
            <input 
              type="text" 
              value={descricaoItem} 
              onChange={e => setDescricaoItem(e.target.value)} 
              style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
            />
          </label>

          <div style={{ display: 'flex', gap: '10px' }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              NCM (8 Dígitos):
              <input 
                type="text" 
                value={ncmItem} 
                onChange={e => setNcmItem(e.target.value)} 
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
              />
            </label>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              CFOP da Operação:
              <input 
                type="text" 
                value={cfopItem} 
                onChange={e => setCfopItem(e.target.value)} 
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>
              Quantidade:
              <input 
                type="text" 
                value={qtdStr} 
                onChange={e => setQtdStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
              />
            </label>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>
              Valor Unitário (R$):
              <input 
                type="text" 
                value={valorUnitStr} 
                onChange={e => setValorUnitStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Frete Rateado (R$):
              <input 
                type="text" 
                value={freteStr} 
                onChange={e => setFreteStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
              />
            </label>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Desconto Comercial (R$):
              <input 
                type="text" 
                value={descontoStr} 
                onChange={e => setDescontoStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
              />
            </label>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <label style={{ flex: '1 1 70px', display: 'flex', flexDirection: 'column', fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>
              ICMS (%):
              <input 
                type="text" 
                value={aliqIcmsStr} 
                onChange={e => setAliqIcmsStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                style={{ padding: '6px', marginTop: '2px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} 
              />
            </label>
            <label style={{ flex: '1 1 70px', display: 'flex', flexDirection: 'column', fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>
              IPI (%):
              <input 
                type="text" 
                value={aliqIpiStr} 
                onChange={e => setAliqIpiStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                style={{ padding: '6px', marginTop: '2px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} 
              />
            </label>
            <label style={{ flex: '1 1 70px', display: 'flex', flexDirection: 'column', fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>
              PIS (%):
              <input 
                type="text" 
                value={aliqPisStr} 
                onChange={e => setAliqPisStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                style={{ padding: '6px', marginTop: '2px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} 
              />
            </label>
            <label style={{ flex: '1 1 70px', display: 'flex', flexDirection: 'column', fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>
              COFINS (%):
              <input 
                type="text" 
                value={aliqCofinsStr} 
                onChange={e => setAliqCofinsStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                style={{ padding: '6px', marginTop: '2px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }} 
              />
            </label>
          </div>
        </div>

        {/* COLUNA DIREITA: ESPELHO DO DANFE (DOCUMENTO AUXILIAR DA NF-E) */}
        <div style={{ flex: '1 1 420px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #0f172a', padding: '18px', boxShadow: '0 4px 10px rgba(0,0,0,0.04)' }}>
            
            {/* Bloco Superior do DANFE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #0f172a', paddingBottom: '12px', gap: '15px' }}>
              <div style={{ flex: '1 1 200px' }}>
                <strong style={{ display: 'block', fontSize: '14px', color: '#0f172a' }}>{emitenteRazao}</strong>
                <span style={{ fontSize: '11px', color: '#475569', display: 'block' }}>CNPJ: {emitenteCnpj}</span>
                <span style={{ fontSize: '11px', color: '#475569', display: 'block' }}>Inscrição Estadual: 112.445.678.910</span>
                <span style={{ fontSize: '11px', color: '#475569', display: 'block' }}>Natureza: {naturezaOperacao}</span>
              </div>
              <div style={{ textAlign: 'center', borderLeft: '1px solid #cbd5e1', paddingLeft: '15px', minWidth: '120px' }}>
                <span style={{ display: 'block', fontSize: '18px', fontWeight: 'bold', letterSpacing: '2px' }}>DANFE</span>
                <span style={{ fontSize: '10px', color: '#64748b' }}>Documento Auxiliar da Nota Fiscal Eletrônica</span>
                <strong style={{ display: 'block', fontSize: '13px', marginTop: '6px' }}>Nº 000.008.452</strong>
                <span style={{ fontSize: '10px' }}>SÉRIE: 001</span>
              </div>
            </div>

            {/* Chave de Acesso */}
            <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px', margin: '12px 0', border: '1px solid #e2e8f0' }}>
              <span style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Chave de Acesso (44 dígitos)</span>
              <strong style={{ fontSize: '11px', color: '#0f172a', fontFamily: 'monospace', letterSpacing: '0.5px' }}>{totais.chaveAcesso}</strong>
            </div>

            {/* Destinatário */}
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px', marginBottom: '12px', fontSize: '12px' }}>
              <span style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>Destinatário / Remetente</span>
              <div><strong>{destinatarioNome}</strong></div>
              <div style={{ color: '#475569' }}>CNPJ: {destinatarioCnpj} | SP - Brasil</div>
            </div>

            {/* Grade de Itens */}
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '6px', overflow: 'hidden', marginBottom: '12px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                <thead style={{ backgroundColor: '#f1f5f9' }}>
                  <tr>
                    <th style={{ padding: '6px 8px', textAlign: 'left' }}>Item / Descrição</th>
                    <th style={{ padding: '6px', textAlign: 'center' }}>NCM</th>
                    <th style={{ padding: '6px', textAlign: 'center' }}>CFOP</th>
                    <th style={{ padding: '6px', textAlign: 'right' }}>Qtd</th>
                    <th style={{ padding: '6px', textAlign: 'right' }}>Unitário</th>
                    <th style={{ padding: '6px 8px', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px' }}>{descricaoItem}</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{ncmItem}</td>
                    <td style={{ padding: '8px', textAlign: 'center' }}>{cfopItem}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{qtdStr}</td>
                    <td style={{ padding: '8px', textAlign: 'right' }}>{formatMoeda(parseFloat(valorUnitStr) || 0)}</td>
                    <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>{formatMoeda(totais.totalProdutos)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Quadro de Totais da Nota */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '6px', fontSize: '11px', textAlign: 'center' }}>
              <div style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px' }}>
                <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>Base ICMS</span>
                <strong>{formatMoeda(totais.baseIcms)}</strong>
              </div>
              <div style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px' }}>
                <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>Valor ICMS</span>
                <strong style={{ color: '#dc2626' }}>{formatMoeda(totais.valorIcms)}</strong>
              </div>
              <div style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px' }}>
                <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>Valor IPI</span>
                <strong>{formatMoeda(totais.valorIpi)}</strong>
              </div>
              <div style={{ border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px' }}>
                <span style={{ fontSize: '9px', color: '#64748b', display: 'block' }}>Frete</span>
                <strong>{formatMoeda(parseFloat(freteStr) || 0)}</strong>
              </div>
              <div style={{ border: '1px solid #0f172a', backgroundColor: '#0f172a', color: 'white', padding: '6px', borderRadius: '4px' }}>
                <span style={{ fontSize: '9px', color: '#cbd5e1', display: 'block' }}>Total NF-e</span>
                <strong>{formatMoeda(totais.totalNota)}</strong>
              </div>
            </div>

          </div>

          {/* GUIA DE LANÇAMENTOS NO LIVRO DIÁRIO */}
          <div style={{ backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', padding: '18px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🧭</span> Mapa Contábil da Emissão (Faturamento)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontFamily: 'monospace' }}>
              <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '6px' }}>
                <div style={{ color: '#059669', fontWeight: 'bold' }}>1. Pelo Faturamento da Venda (Contas a Receber):</div>
                <div>D: Clientes a Receber (Ativo Circulante) ..... {formatMoeda(totais.totalNota)}</div>
                <div>C: Receita Bruta de Vendas (DRE) ........... {formatMoeda(totais.totalProdutos)}</div>
                {parseFloat(freteStr) > 0 && <div>C: Receitas c/ Fretes Recuperados ............ {formatMoeda(parseFloat(freteStr) || 0)}</div>}
                {totais.valorIpi > 0 && <div>C: IPI a Recolher (Passivo Circulante) ........ {formatMoeda(totais.valorIpi)}</div>}
              </div>

              <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '6px' }}>
                <div style={{ color: '#dc2626', fontWeight: 'bold' }}>2. Pelas Deduções Tributárias Incidentes (DRE):</div>
                <div>D: ICMS sobre Vendas (Redutora DRE) ......... {formatMoeda(totais.valorIcms)}</div>
                <div>C: ICMS a Recolher (Passivo) ............... {formatMoeda(totais.valorIcms)}</div>
                <div style={{ marginTop: '4px' }}>D: PIS e COFINS sobre Vendas (Redutora DRE) .. {formatMoeda(totais.valorPis + totais.valorCofins)}</div>
                <div>C: PIS/COFINS a Recolher (Passivo) .......... {formatMoeda(totais.valorPis + totais.valorCofins)}</div>
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