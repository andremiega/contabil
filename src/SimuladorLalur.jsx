import React, { useState, useEffect } from 'react';

export default function SimuladorLalur({ mostrarToast, registrarFatoGerador, planoContas = [] }) {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Estados dos Parâmetros da Parte A
  const [lucroContabil, setLucroContabil] = useState(80000);
  const [adicoes, setAdicoes] = useState(12000); 
  const [exclusoes, setExclusoes] = useState(5000); 
  const [compensacaoPrejuizo, setCompensacaoPrejuizo] = useState(0); 

  // Totais Calculados
  const [totais, setTotais] = useState({
    lucroRealAntesCompensacao: 0,
    limiteCompensacao30: 0,
    lucroRealFinal: 0,
    irpjBasico: 0,
    adicionalIr: 0,
    irpjTotal: 0,
    csll: 0,
    totalTributos: 0
  });

  useEffect(() => {
    const lContabil = Number(lucroContabil) || 0;
    const vAdicoes = Number(adicoes) || 0;
    const vExclusoes = Number(exclusoes) || 0;

    const lRealBase = Math.max(0, lContabil + vAdicoes - vExclusoes);
    const limite30 = lRealBase * 0.30;
    const compensacaoEfetiva = Math.min(Number(compensacaoPrejuizo) || 0, limite30);
    const lRealFinal = Math.max(0, lRealBase - compensacaoEfetiva);

    const irpjBasico = lRealFinal * 0.15;
    const adicional = lRealFinal > 20000 ? (lRealFinal - 20000) * 0.10 : 0;
    const irpjTotal = irpjBasico + adicional;

    const csll = lRealFinal * 0.09;

    setTotais({
      lucroRealAntesCompensacao: lRealBase,
      limiteCompensacao30: limite30,
      lucroRealFinal: lRealFinal,
      irpjBasico,
      adicionalIr: adicional,
      irpjTotal,
      csll,
      totalTributos: irpjTotal + csll
    });
  }, [lucroContabil, adicoes, exclusoes, compensacaoPrejuizo]);

  const handleProvisionarImpostos = () => {
    if (typeof registrarFatoGerador !== 'function') return;

    if (totais.totalTributos <= 0) {
      return alert("Não há tributos a recolher. O Lucro Real é igual a zero (ou deu prejuízo).");
    }

    const contasSafe = planoContas || [];
    const idDespesaIRPJ = contasSafe.find(c => c.codigo_contabil === '5.2.04.01' || (c.nome_conta || '').toLowerCase().includes('irpj'))?.id;
    const idIrpjPagar = contasSafe.find(c => c.codigo_contabil === '2.1.03.01' || (c.nome_conta || '').toLowerCase().includes('tributos a recolher') || (c.nome_conta || '').toLowerCase().includes('irpj a'))?.id;
    
    const idDespesaCSLL = contasSafe.find(c => c.codigo_contabil === '5.2.04.02' || (c.nome_conta || '').toLowerCase().includes('csll'))?.id || idDespesaIRPJ;
    const idCsllPagar = contasSafe.find(c => c.codigo_contabil === '2.1.03.01' || (c.nome_conta || '').toLowerCase().includes('tributos a recolher') || (c.nome_conta || '').toLowerCase().includes('csll a'))?.id || idIrpjPagar;

    if (totais.irpjTotal > 0) {
      registrarFatoGerador(
        `Provisão de IRPJ s/ Lucro Real (Período Atual)`,
        totais.irpjTotal,
        'Apuração Fiscal (e-Lalur)',
        [idDespesaIRPJ], 
        [idIrpjPagar]    
      );
    }

    if (totais.csll > 0) {
      registrarFatoGerador(
        `Provisão de CSLL s/ Lucro Real (Período Atual)`,
        totais.csll,
        'Apuração Fiscal (e-Lalur)',
        [idDespesaCSLL], 
        [idCsllPagar]    
      );
    }

    if (typeof mostrarToast === 'function') mostrarToast('Provisões tributárias (IRPJ/CSLL) enviadas para o Livro Diário.', 'sucesso');
  };

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px', boxSizing: 'border-box' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', wordBreak: 'break-word' }}>
            <span style={{ fontSize: '24px' }}>📑</span> Apuração do Lucro Real (e-LALUR / e-LACS)
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px', wordBreak: 'break-word' }}>
            Ajustes fiscais da Parte A (Adições e Exclusões) e apuração do IRPJ e CSLL.
          </p>
        </div>

        <div style={{ backgroundColor: '#f1f5f9', padding: '8px 14px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold', color: '#475569', boxSizing: 'border-box' }}>
          Regime: <span style={{ color: '#0f172a', wordBreak: 'break-word' }}>Lucro Real Trimestral / Mensal</span>
        </div>
      </div>

      {/* DASHBOARD DE TOTAIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', marginBottom: '20px', boxSizing: 'border-box' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Base Fiscal (Lucro Real)</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>{formatMoeda(totais.lucroRealFinal)}</strong>
        </div>

        <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '16px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#1d4ed8', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>IRPJ Total (15% + 10%)</span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>{formatMoeda(totais.irpjTotal)}</strong>
          {totais.adicionalIr > 0 && (
            <span style={{ fontSize: '11px', color: '#2563eb', wordBreak: 'break-word' }}>Inclui {formatMoeda(totais.adicionalIr)} adicional</span>
          )}
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #059669', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>CSLL Apurada (9%)</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>{formatMoeda(totais.csll)}</strong>
        </div>

        <div style={{ backgroundColor: '#fff5f5', padding: '16px', borderRadius: '16px', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#991b1b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Total a Recolher</span>
          <strong style={{ display: 'block', color: '#dc2626', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>{formatMoeda(totais.totalTributos)}</strong>
        </div>
      </div>

      {/* CORPO: ENTRADA DE DADOS E GUIA CONTÁBIL */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
        
        {/* COLUNA ESQUERDA: PARTE A (AJUSTES) */}
        <div style={cardStyle}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', wordBreak: 'break-word' }}>
            Demonstrativo da Parte A
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px', boxSizing: 'border-box' }}>
            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>(=) Lucro Líquido Contábil antes do IR/CSLL (R$):</label>
              <input type="number" step="1000" value={lucroContabil} onChange={e => setLucroContabil(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ backgroundColor: '#fff5f5', padding: '12px', borderRadius: '10px', border: '1px solid #fca5a5', boxSizing: 'border-box', minWidth: 0 }}>
              <label style={{ ...labelStyle, color: '#dc2626' }}>(+) Adições Fiscais (Despesas Indedutíveis):</label>
              <input type="number" step="500" value={adicoes} onChange={e => setAdicoes(e.target.value)} style={{ ...inputStyle, backgroundColor: 'white' }} />
              <span style={{ fontSize: '10.5px', color: '#991b1b', marginTop: '4px', display: 'block', wordBreak: 'break-word' }}>Ex: Multas, brindes, despesas sem comprovação.</span>
            </div>

            <div style={{ backgroundColor: '#ecfdf5', padding: '12px', borderRadius: '10px', border: '1px solid #a7f3d0', boxSizing: 'border-box', minWidth: 0 }}>
              <label style={{ ...labelStyle, color: '#059669' }}>(-) Exclusões Fiscais (Receitas Isentas):</label>
              <input type="number" step="500" value={exclusoes} onChange={e => setExclusoes(e.target.value)} style={{ ...inputStyle, backgroundColor: 'white' }} />
              <span style={{ fontSize: '10.5px', color: '#166534', marginTop: '4px', display: 'block', wordBreak: 'break-word' }}>Ex: Dividendos recebidos (não tributáveis).</span>
            </div>

            <div style={{ minWidth: 0 }}>
              <label style={labelStyle}>(-) Compensação de Prejuízos Fiscais (Trava 30%):</label>
              <input type="number" step="500" value={compensacaoPrejuizo} onChange={e => setCompensacaoPrejuizo(e.target.value)} style={inputStyle} />
              <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block', wordBreak: 'break-word' }}>Limite máximo: <strong>{formatMoeda(totais.limiteCompensacao30)}</strong></span>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: MAPA DE CONTABILIZAÇÃO E BOTÃO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, boxSizing: 'border-box' }}>
          
          <div style={{ backgroundColor: '#ecfdf5', borderRadius: '16px', border: '1px solid #a7f3d0', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', minWidth: 0 }}>
            <div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '14.5px', color: '#065f46', display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
                <span>🧭</span> Provisão de IRPJ e CSLL no Diário
              </h3>
              <p style={{ fontSize: '12px', color: '#047857', margin: '0 0 14px 0', wordBreak: 'break-word' }}>Após fechar a Parte A no LALUR, estes são os lançamentos criados:</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '11.5px', fontFamily: 'monospace', boxSizing: 'border-box' }}>
                <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '10px', borderLeft: '4px solid #059669', boxSizing: 'border-box', minWidth: 0 }}>
                  <div style={{ color: '#059669', fontWeight: 'bold', wordBreak: 'break-word' }}>D: Provisão para IRPJ (Resultado/DRE)</div>
                  <div style={{ color: '#dc2626', fontWeight: 'bold', wordBreak: 'break-word' }}>C: IRPJ a Recolher (Passivo Circ.)</div>
                  <strong style={{ display: 'block', marginTop: '6px', color: '#0f172a', wordBreak: 'break-word' }}>{formatMoeda(totais.irpjTotal)}</strong>
                </div>

                <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '10px', borderLeft: '4px solid #059669', boxSizing: 'border-box', minWidth: 0 }}>
                  <div style={{ color: '#059669', fontWeight: 'bold', wordBreak: 'break-word' }}>D: Provisão para CSLL (Resultado/DRE)</div>
                  <div style={{ color: '#dc2626', fontWeight: 'bold', wordBreak: 'break-word' }}>C: CSLL a Recolher (Passivo Circ.)</div>
                  <strong style={{ display: 'block', marginTop: '6px', color: '#0f172a', wordBreak: 'break-word' }}>{formatMoeda(totais.csll)}</strong>
                </div>
              </div>
            </div>

            <button 
              onClick={handleProvisionarImpostos}
              style={{ marginTop: '16px', backgroundColor: '#059669', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontSize: '13.5px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(5,150,105,0.2)', boxSizing: 'border-box', width: '100%' }}
            >
              Provisionar Impostos (Contabilizar) ✍️
            </button>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', fontSize: '11.5px', color: '#475569', lineHeight: '1.5', boxSizing: 'border-box', wordBreak: 'break-word' }}>
            <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px', wordBreak: 'break-word' }}>💡 Dica Didática:</strong>
            O LALUR não gera lançamentos contábeis diretos para Adições e Exclusões (Livro Extracontábil). Apenas a obrigação final do imposto é registada no Diário.
          </div>
        </div>

      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}