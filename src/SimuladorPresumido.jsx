import { useState, useEffect } from 'react';

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

  if (!impostos) {
    return (
      <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
        <h3 style={{ color: '#0f172a', marginTop: 0 }}>Módulo Fiscal Avançado: Lucro Presumido</h3>
        <p style={{ color: '#64748b', fontSize: '14px' }}>Aguardando o registo de receitas de prestação de serviços para apurar os DARFs.</p>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
      <h3 style={{ color: '#0f172a', marginTop: 0 }}>Módulo Fiscal Avançado: Lucro Presumido (Serviços)</h3>
      <p style={{ color: '#16a34a', fontSize: '13px', fontWeight: 'bold' }}>✓ Faturação Lida Automaticamente do Razonete: R$ {parseFloat(faturacaoMes).toFixed(2)}</p>

      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '15px' }}>
        
        {/* Bloco PIS/COFINS */}
        <div style={{ flex: '1 1 200px', backgroundColor: 'white', padding: '15px', borderRadius: '5px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#475569', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px' }}>Impostos s/ Receita</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>PIS (0,65%)</span><strong>R$ {impostos.pis}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>COFINS (3%)</span><strong>R$ {impostos.cofins}</strong>
          </div>
        </div>

        {/* Bloco IRPJ/CSLL */}
        <div style={{ flex: '1 1 200px', backgroundColor: 'white', padding: '15px', borderRadius: '5px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 5px 0', color: '#475569' }}>Impostos s/ Lucro</h4>
          <small style={{ display: 'block', color: '#94a3b8', marginBottom: '10px', borderBottom: '1px solid #e2e8f0', paddingBottom: '5px' }}>Base Presumida (32%): R$ {impostos.basePresuncao}</small>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>IRPJ (15%)</span><strong>R$ {impostos.irpj}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>CSLL (9%)</span><strong>R$ {impostos.csll}</strong>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#eef2ff', borderRadius: '5px', border: '1px solid #c7d2fe', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ display: 'block', fontSize: '13px', color: '#4f46e5' }}>Carga Tributária Efetiva</span>
          <strong style={{ fontSize: '18px', color: '#312e81' }}>{impostos.cargaTributaria}%</strong>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ display: 'block', fontSize: '13px', color: '#4f46e5' }}>Total de DARFs a Pagar</span>
          <strong style={{ fontSize: '20px', color: '#dc2626' }}>R$ {impostos.total}</strong>
        </div>
      </div>
    </div>
  );
}