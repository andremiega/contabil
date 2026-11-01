import React, { useState, useEffect } from 'react';

export default function SimuladorLalur({ mostrarToast, registrarFatoGerador, planoContas = [] }) {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Estados dos Parâmetros da Parte A
  const [lucroContabil, setLucroContabil] = useState(80000);
  const [adicoes, setAdicoes] = useState(12000); // Despesas indedutíveis
  const [exclusoes, setExclusoes] = useState(5000); // Receitas não tributáveis
  const [compensacaoPrejuizo, setCompensacaoPrejuizo] = useState(0); // Limite de 30%

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

  // ==========================================================
  // INTEGRAÇÃO CONTÁBIL: PROVISÃO DE IMPOSTOS (SISTEMA NERVOSO)
  // ==========================================================
  const handleProvisionarImpostos = () => {
    if (typeof registrarFatoGerador !== 'function') return;

    if (totais.totalTributos <= 0) {
      return alert("Não há tributos a recolher. O Lucro Real é igual a zero (ou deu prejuízo).");
    }

    // Busca rápida dos IDs no Plano de Contas
    const idDespesaIRPJ = planoContas.find(c => c.codigo_contabil === '5.2.04.01' || c.nome_conta.toLowerCase().includes('irpj'))?.id;
    const idIrpjPagar = planoContas.find(c => c.codigo_contabil === '2.1.03.01' || c.nome_conta.toLowerCase().includes('tributos a recolher') || c.nome_conta.toLowerCase().includes('irpj a'))?.id;
    
    const idDespesaCSLL = planoContas.find(c => c.codigo_contabil === '5.2.04.02' || c.nome_conta.toLowerCase().includes('csll'))?.id || idDespesaIRPJ;
    const idCsllPagar = planoContas.find(c => c.codigo_contabil === '2.1.03.01' || c.nome_conta.toLowerCase().includes('tributos a recolher') || c.nome_conta.toLowerCase().includes('csll a'))?.id || idIrpjPagar;

    if (totais.irpjTotal > 0) {
      registrarFatoGerador(
        `Provisão de IRPJ s/ Lucro Real (Período Atual)`,
        totais.irpjTotal,
        'Apuração Fiscal (e-Lalur)',
        [idDespesaIRPJ], // Débito (Despesa na DRE)
        [idIrpjPagar]    // Crédito (Passivo Circulante)
      );
    }

    if (totais.csll > 0) {
      registrarFatoGerador(
        `Provisão de CSLL s/ Lucro Real (Período Atual)`,
        totais.csll,
        'Apuração Fiscal (e-Lalur)',
        [idDespesaCSLL], // Débito (Despesa na DRE)
        [idCsllPagar]    // Crédito (Passivo Circulante)
      );
    }

    if (mostrarToast) mostrarToast('Provisões tributárias (IRPJ/CSLL) enviadas para o Livro Diário.', 'sucesso');
  };

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>📑</span> Apuração do Lucro Real (e-LALUR / e-LACS)
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Ajustes fiscais da Parte A (Adições e Exclusões) e apuração do IRPJ e CSLL.
          </p>
        </div>

        <div style={{ backgroundColor: '#f1f5f9', padding: '6px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
          Regime: <span style={{ color: '#0f172a' }}>Lucro Real Trimestral / Mensal</span>
        </div>
      </div>

      {/* DASHBOARD DE TOTAIS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #3b82f6' }}>
          <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Base Fiscal (Lucro Real)</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '24px', marginTop: '4px' }}>{formatMoeda(totais.lucroRealFinal)}</strong>
        </div>

        <div style={{ backgroundColor: '#eff6ff', padding: '18px', borderRadius: '12px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb' }}>
          <span style={{ color: '#1d4ed8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>IRPJ Total (15% + 10%)</span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '24px', marginTop: '4px' }}>{formatMoeda(totais.irpjTotal)}</strong>
          {totais.adicionalIr > 0 && (
            <span style={{ fontSize: '11px', color: '#2563eb' }}>Inclui {formatMoeda(totais.adicionalIr)} de adicional</span>
          )}
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #059669' }}>
          <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>CSLL Apurada (9%)</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '24px', marginTop: '4px' }}>{formatMoeda(totais.csll)}</strong>
        </div>

        <div style={{ backgroundColor: '#fff5f5', padding: '18px', borderRadius: '12px', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444' }}>
          <span style={{ color: '#991b1b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Total a Recolher</span>
          <strong style={{ display: 'block', color: '#dc2626', fontSize: '24px', marginTop: '4px' }}>{formatMoeda(totais.totalTributos)}</strong>
        </div>
      </div>

      {/* CORPO: ENTRADA DE DADOS E GUIA CONTÁBIL */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        
        {/* COLUNA ESQUERDA: PARTE A (AJUSTES) */}
        <div style={{ flex: '1 1 350px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
            Demonstrativo da Parte A
          </h3>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>
            (=) Lucro Líquido Contábil antes do IR/CSLL (R$):
            <input type="number" step="1000" value={lucroContabil} onChange={e => setLucroContabil(e.target.value)} style={{ padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#dc2626' }}>
            (+) Adições Fiscais (Despesas Indedutíveis):
            <input type="number" step="500" value={adicoes} onChange={e => setAdicoes(e.target.value)} style={{ padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #fca5a5', backgroundColor: '#fff5f5', fontSize: '14px' }} />
            <span style={{ fontSize: '11px', color: '#991b1b', marginTop: '3px', fontWeight: 'normal' }}>Ex: Multas, brindes, despesas sem comprovação hábil.</span>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#059669' }}>
            (-) Exclusões Fiscais (Receitas Isentas/Não Trib.):
            <input type="number" step="500" value={exclusoes} onChange={e => setExclusoes(e.target.value)} style={{ padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #a7f3d0', backgroundColor: '#ecfdf5', fontSize: '14px' }} />
            <span style={{ fontSize: '11px', color: '#166534', marginTop: '3px', fontWeight: 'normal' }}>Ex: Dividendos recebidos (não tributáveis).</span>
          </label>

          <label style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
            (-) Compensação de Prejuízos Fiscais (Trava 30%):
            <input type="number" step="500" value={compensacaoPrejuizo} onChange={e => setCompensacaoPrejuizo(e.target.value)} style={{ padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px' }} />
            <span style={{ fontSize: '11px', color: '#64748b', marginTop: '3px', fontWeight: 'normal' }}>Limite máximo: <strong>{formatMoeda(totais.limiteCompensacao30)}</strong></span>
          </label>
        </div>

        {/* COLUNA DIREITA: MAPA DE CONTABILIZAÇÃO E BOTÃO */}
        <div style={{ flex: '1 1 320px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ backgroundColor: '#ecfdf5', borderRadius: '12px', border: '1px solid #a7f3d0', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#065f46', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🧭</span> Provisão de IRPJ e CSLL no Diário
              </h3>
              <p style={{ fontSize: '12px', color: '#047857', margin: '0 0 12px 0' }}>Após fechar a Parte A no LALUR, estes são os lançamentos (pendências) criados:</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', fontFamily: 'monospace' }}>
                <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '6px', borderLeft: '4px solid #059669' }}>
                  <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Provisão para IRPJ (Resultado/DRE)</div>
                  <div style={{ color: '#dc2626', fontWeight: 'bold' }}>C: IRPJ a Recolher (Passivo Circulante)</div>
                  <strong style={{ display: 'block', marginTop: '6px', color: '#0f172a' }}>{formatMoeda(totais.irpjTotal)}</strong>
                </div>

                <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '6px', borderLeft: '4px solid #059669' }}>
                  <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Provisão para CSLL (Resultado/DRE)</div>
                  <div style={{ color: '#dc2626', fontWeight: 'bold' }}>C: CSLL a Recolher (Passivo Circulante)</div>
                  <strong style={{ display: 'block', marginTop: '6px', color: '#0f172a' }}>{formatMoeda(totais.csll)}</strong>
                </div>
              </div>
            </div>

            <button 
              onClick={handleProvisionarImpostos}
              style={{ marginTop: '16px', backgroundColor: '#059669', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(5,150,105,0.2)' }}
            >
              Provisionar Impostos (Contabilizar) ✍️
            </button>
          </div>

          <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#475569', lineHeight: '1.5' }}>
            <strong style={{ color: '#0f172a', display: 'block', marginBottom: '4px' }}>💡 Dica Didática:</strong>
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