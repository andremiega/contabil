import { useState, useEffect } from 'react';

export default function SimuladorLucroPresumido({ receitaAcumulada }) {
  const [receita, setReceita] = useState('');
  const [resultado, setResultado] = useState(null);

  useEffect(() => {
    // Sincroniza com a receita vinda do componente pai (App.jsx)
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
    // Mensais
    const pis = receitaBase * 0.0065;   // 0,65%
    const cofins = receitaBase * 0.03;  // 3,00%
    
    // Trimestrais (Presunção de 32% para serviços)
    const baseCalculoIRCSLL = receitaBase * 0.32;
    const irpj = baseCalculoIRCSLL * 0.15; // 15% sobre a presunção
    const csll = baseCalculoIRCSLL * 0.09; // 9% sobre a presunção

    // O Adicional de IRPJ (10% sobre a parcela do lucro presumido que exceder R$ 60.000 no trimestre)
    // Para simplificar o MVP, vamos assumir que a receita informada não ultrapassa o limite de isenção do adicional.
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

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '20px', maxWidth: '600px', margin: '0 auto', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
      <h2 style={{ color: '#0f172a', marginTop: 0 }}>Simulador Fiscal: Lucro Presumido (Serviços)</h2>
      <p style={{ fontSize: '14px', color: '#64748b' }}>Apuramento individual de tributos com margem de presunção de 32%.</p>
      
      <form onSubmit={calcularImpostos} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <label style={{ display: 'flex', flexDirection: 'column', fontWeight: 'bold' }}>
          Faturação do Período (Automático via Diário):
          <input 
            type="number" 
            step="0.01" 
            value={receita} 
            onChange={e => setReceita(e.target.value)} 
            style={{ padding: '8px', marginTop: '5px', backgroundColor: receitaAcumulada > 0 ? '#e2e8f0' : '#ffffff' }} 
            readOnly={receitaAcumulada > 0} 
          />
          {receitaAcumulada > 0 && <small style={{ color: '#16a34a', marginTop: '4px' }}>✓ Lendo saldo da conta 3.1.1.01</small>}
        </label>

        <button type="submit" style={{ backgroundColor: '#2563eb', color: 'white', padding: '12px', border: 'none', borderRadius: '5px', fontWeight: 'bold', cursor: 'pointer' }}>
          Calcular Guias DARF
        </button>
      </form>

      {resultado && (
        <div style={{ marginTop: '20px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          
          {/* OBRIGAÇÕES MENSAIS */}
          <div style={{ flex: '1 1 200px', padding: '15px', backgroundColor: '#e0f2fe', borderRadius: '5px', border: '1px solid #7dd3fc' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#0369a1', borderBottom: '1px solid #bae6fd', paddingBottom: '5px' }}>Impostos Mensais</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>PIS (0,65%):</span> <strong style={{ color: '#0f172a' }}>R$ {resultado.pis}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>COFINS (3%):</span> <strong style={{ color: '#0f172a' }}>R$ {resultado.cofins}</strong>
            </div>
          </div>

          {/* OBRIGAÇÕES TRIMESTRAIS */}
          <div style={{ flex: '1 1 200px', padding: '15px', backgroundColor: '#fef3c7', borderRadius: '5px', border: '1px solid #fcd34d' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#b45309', borderBottom: '1px solid #fde68a', paddingBottom: '5px' }}>Impostos Trimestrais</h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>IRPJ (15%):</span> <strong style={{ color: '#0f172a' }}>R$ {resultado.irpj}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>CSLL (9%):</span> <strong style={{ color: '#0f172a' }}>R$ {resultado.csll}</strong>
            </div>
            <small style={{ display: 'block', marginTop: '10px', color: '#d97706', fontSize: '11px' }}>*Calculado sobre base de 32%.</small>
          </div>

          {/* RESUMO TOTAL */}
          <div style={{ width: '100%', padding: '15px', backgroundColor: '#1e293b', borderRadius: '5px', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Carga Tributária Efetiva:</span>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#34d399' }}>{resultado.efetiva}%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid #334155', paddingTop: '10px' }}>
              <span>Custo Total de Tributos:</span>
              <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#f87171' }}>R$ {resultado.total}</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}