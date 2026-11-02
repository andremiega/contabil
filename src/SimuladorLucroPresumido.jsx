import React, { useState, useEffect } from 'react';

export default function SimuladorLucroPresumido({ receitaAcumulada }) {
  const [receita, setReceita] = useState('');
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    if (receitaAcumulada !== undefined) {
      setReceita(receitaAcumulada.toString());
    }
  }, [receitaAcumulada]);

  const calcularImpostos = (e) => {
    e.preventDefault();
    const receitaBase = parseFloat(receita);

    if (isNaN(receitaBase) || receitaBase <= 0) {
      alert("A receita deve ser maior que zero para calcular impostos.");
      return;
    }

    // --- ALÍQUOTAS DO LUCRO PRESUMIDO (Serviços) ---
    const pis = receitaBase * 0.0065;   // 0,65%
    const cofins = receitaBase * 0.03;  // 3,00%
    
    const baseCalculoIRCSLL = receitaBase * 0.32;
    const irpj = baseCalculoIRCSLL * 0.15; // 15% sobre a presunção
    const csll = baseCalculoIRCSLL * 0.09; // 9% sobre a presunção

    const adicionalIRPJ = 0; 

    const totalImpostos = pis + cofins + irpj + csll + adicionalIRPJ;
    const aliquotaEfetiva = (totalImpostos / receitaBase) * 100;

    setResultado({
      pis: pis.toFixed(2),
      cofins: cofins.toFixed(2),
      irpj: irpj.toFixed(2),
      csll: csll.toFixed(2),
      total: totalImpostos.toFixed(2),
      efetiva: aliquotaEfetiva.toFixed(2)
    });
  };

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.5s' }}>
      
      <div style={{ marginBottom: '20px', boxSizing: 'border-box' }}>
        <h2 style={{ color: '#0f172a', marginTop: 0, fontSize: '20px', wordBreak: 'break-word' }}>Simulador Fiscal: Lucro Presumido (Serviços)</h2>
        <p style={{ fontSize: '13px', color: '#64748b', wordBreak: 'break-word' }}>Apuramento individual de tributos com margem de presunção de 32%.</p>
      </div>
      
      <form onSubmit={calcularImpostos} style={{ display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
        <div style={{ minWidth: 0, boxSizing: 'border-box' }}>
          <label style={labelStyle}>
            Faturação do Período (Automático via Diário):
          </label>
          <input 
            type="number" 
            step="0.01" 
            value={receita} 
            onChange={e => setReceita(e.target.value)} 
            style={{ ...inputStyle, backgroundColor: receitaAcumulada > 0 ? '#e2e8f0' : '#f8fafc' }} 
            readOnly={receitaAcumulada > 0} 
          />
          {receitaAcumulada > 0 && <small style={{ color: '#16a34a', marginTop: '4px', display: 'block', wordBreak: 'break-word' }}>✓ Lendo saldo da conta de receitas</small>}
        </div>

        <button type="submit" style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13.5px', boxSizing: 'border-box', width: '100%', maxWidth: '260px' }}>
          Calcular Guias DARF
        </button>
      </form>

      {resultado && (
        <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '16px', boxSizing: 'border-box' }}>
          
          {/* OBRIGAÇÕES MENSAIS */}
          <div style={{ backgroundColor: '#e0f2fe', padding: '18px', borderRadius: '16px', border: '1px solid #7dd3fc', boxSizing: 'border-box', minWidth: 0 }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#0369a1', borderBottom: '1px solid #bae6fd', paddingBottom: '6px', fontSize: '14px', wordBreak: 'break-word' }}>Impostos Mensais</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '4px', fontSize: '13px' }}>
              <span>PIS (0,65%):</span> <strong style={{ color: '#0f172a', wordBreak: 'break-word' }}>R$ {resultado.pis}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px', fontSize: '13px' }}>
              <span>COFINS (3%):</span> <strong style={{ color: '#0f172a', wordBreak: 'break-word' }}>R$ {resultado.cofins}</strong>
            </div>
          </div>

          {/* OBRIGAÇÕES TRIMESTRAIS */}
          <div style={{ backgroundColor: '#fef3c7', padding: '18px', borderRadius: '16px', border: '1px solid #fcd34d', boxSizing: 'border-box', minWidth: 0 }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#b45309', borderBottom: '1px solid #fde68a', paddingBottom: '6px', fontSize: '14px', wordBreak: 'break-word' }}>Impostos Trimestrais</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '4px', fontSize: '13px' }}>
              <span>IRPJ (15%):</span> <strong style={{ color: '#0f172a', wordBreak: 'break-word' }}>R$ {resultado.irpj}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px', fontSize: '13px' }}>
              <span>CSLL (9%):</span> <strong style={{ color: '#0f172a', wordBreak: 'break-word' }}>R$ {resultado.csll}</strong>
            </div>
            <small style={{ display: 'block', marginTop: '8px', color: '#d97706', fontSize: '11px', wordBreak: 'break-word' }}>*Calculado sobre base de 32%.</small>
          </div>

          {/* RESUMO TOTAL */}
          <div style={{ gridColumn: '1 / -1', backgroundColor: '#1e293b', padding: '18px', borderRadius: '16px', color: 'white', boxSizing: 'border-box', minWidth: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', boxSizing: 'border-box' }}>
              <span style={{ wordBreak: 'break-word' }}>Carga Tributária Efetiva:</span>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#34d399', wordBreak: 'break-word' }}>{resultado.efetiva}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid #334155', paddingTop: '12px', flexWrap: 'wrap', gap: '8px', boxSizing: 'border-box' }}>
              <span style={{ wordBreak: 'break-word' }}>Custo Total de Tributos:</span>
              <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#f87171', wordBreak: 'break-word' }}>R$ {resultado.total}</span>
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