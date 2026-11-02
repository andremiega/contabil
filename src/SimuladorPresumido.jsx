import React, { useState, useEffect } from 'react';

export default function SimuladorPresumido({ faturacaoAutomatica }) {
  const [faturacaoMes, setFaturacaoMes] = useState('');
  const [impostos, setImpostos] = useState(null);

  // Lê automaticamente as receitas da empresa
  useEffect(() => {
    if (faturacaoAutomatica !== undefined && faturacaoAutomatica > 0) {
      setFaturacaoMes(faturacaoAutomatica.toString());
      calcularImpostos(faturacaoAutomatica);
    } else {
      setImpostos(null);
    }
  }, [faturacaoAutomatica]);

  const calcularImpostos = (receita) => {
    if (receita <= 0) return;

    // 1. Apuração PIS e COFINS (Cumulativo) -> Direto sobre a receita
    const pis = receita * 0.0065;   // 0,65%
    const cofins = receita * 0.03;  // 3%

    // 2. Apuração IRPJ e CSLL -> Requer a Base de Presunção (Serviços = 32%)
    const basePresuncao = receita * 0.32;
    
    const irpj = basePresuncao * 0.15; // 15% sobre a presunção
    const csll = basePresuncao * 0.09; // 9% sobre a presunção

    setImpostos({
      basePresuncao: basePresuncao.toFixed(2),
      pis: pis.toFixed(2),
      cofins: cofins.toFixed(2),
      irpj: irpj.toFixed(2),
      csll: csll.toFixed(2),
      total: (pis + cofins + irpj + csll).toFixed(2),
      cargaTributaria: (((pis + cofins + irpj + csll) / receita) * 100).toFixed(2)
    });
  };

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const cardStyle = { backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  if (!impostos) {
    return (
      <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
        <h3 style={{ color: '#0f172a', marginTop: 0, fontSize: '18px', wordBreak: 'break-word' }}>Módulo Fiscal Avançado: Lucro Presumido</h3>
        <p style={{ color: '#64748b', fontSize: '13.5px', wordBreak: 'break-word' }}>Aguardando o registo de receitas de prestação de serviços para apurar os DARFs.</p>
      </div>
    );
  }

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, sans-serif', color: '#1e293b', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.4s' }}>
      <h3 style={{ color: '#0f172a', marginTop: 0, fontSize: '18px', wordBreak: 'break-word' }}>Módulo Fiscal Avançado: Lucro Presumido (Serviços)</h3>
      <p style={{ color: '#16a34a', fontSize: '13px', fontWeight: 'bold', wordBreak: 'break-word' }}>✓ Faturação Lida Automática do Razonete: R$ {Number(faturacaoMes || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px', marginTop: '16px', boxSizing: 'border-box' }}>
        
        {/* Bloco PIS/COFINS */}
        <div style={cardStyle}>
          <h4 style={{ margin: '0 0 10px 0', color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', fontSize: '14px', wordBreak: 'break-word' }}>Impostos s/ Receita</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '4px', fontSize: '13px' }}>
            <span>PIS (0,65%)</span><strong style={{ wordBreak: 'break-word' }}>R$ {Number(impostos.pis || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px', fontSize: '13px' }}>
            <span>COFINS (3%)</span><strong style={{ wordBreak: 'break-word' }}>R$ {Number(impostos.cofins || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>

        {/* Bloco IRPJ/CSLL */}
        <div style={cardStyle}>
          <h4 style={{ margin: '0 0 4px 0', color: '#475569', fontSize: '14px', wordBreak: 'break-word' }}>Impostos s/ Lucro</h4>
          <small style={{ display: 'block', color: '#94a3b8', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px', wordBreak: 'break-word' }}>Base Presumida (32%): R$ {Number(impostos.basePresuncao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</small>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '4px', fontSize: '13px' }}>
            <span>IRPJ (15%)</span><strong style={{ wordBreak: 'break-word' }}>R$ {Number(impostos.irpj || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px', fontSize: '13px' }}>
            <span>CSLL (9%)</span><strong style={{ wordBreak: 'break-word' }}>R$ {Number(impostos.csll || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '16px', padding: '16px', backgroundColor: '#eef2ff', borderRadius: '16px', border: '1px solid #c7d2fe', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', boxSizing: 'border-box' }}>
        <div style={{ minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: '12px', color: '#4f46e5', fontWeight: 'bold' }}>Carga Tributária Efetiva</span>
          <strong style={{ fontSize: '18px', color: '#312e81', wordBreak: 'break-word' }}>{impostos.cargaTributaria}%</strong>
        </div>
        <div style={{ textAlign: 'right', minWidth: 0 }}>
          <span style={{ display: 'block', fontSize: '12px', color: '#4f46e5', fontWeight: 'bold' }}>Total de DARFs a Pagar</span>
          <strong style={{ fontSize: '20px', color: '#dc2626', wordBreak: 'break-word' }}>R$ {Number(impostos.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}