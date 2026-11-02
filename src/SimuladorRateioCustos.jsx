import React, { useState, useEffect } from 'react';

export default function SimuladorRateioCustos() {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Critério de Rateio Selecionado: 'hmod', 'hmaq', 'primario', 'unidades'
  const [criterioRateio, setCriterioRateio] = useState('hmod');

  // CIF Global a ser Distribuído
  const [aluguelFabricaStr, setAluguelFabricaStr] = useState('18000.00');
  const [energiaFabricaStr, setEnergiaFabricaStr] = useState('14000.00');
  const [depreciacaoMaquinasStr, setDepreciacaoMaquinasStr] = useState('10000.00');
  const [supervisaoManutencaoStr, setSupervisaoManutencaoStr] = useState('8000.00');

  // Parâmetros dos 3 Produtos Fabricados
  const [produtos, setProdutos] = useState([
    {
      id: 'prodA',
      nome: 'Linha Standard (Mesa Executiva)',
      qtdProduzidaStr: '600',
      mpUnitStr: '70.00',
      modUnitStr: '30.00',
      hmodUnitStr: '2.0',
      hmaqUnitStr: '1.5'
    },
    {
      id: 'prodB',
      nome: 'Linha Premium (Estação Ergonômica)',
      qtdProduzidaStr: '300',
      mpUnitStr: '130.00',
      modUnitStr: '55.00',
      hmodUnitStr: '3.5',
      hmaqUnitStr: '3.0'
    },
    {
      id: 'prodC',
      nome: 'Linha Luxo (Móvel sob Medida)',
      qtdProduzidaStr: '100',
      mpUnitStr: '260.00',
      modUnitStr: '110.00',
      hmodUnitStr: '6.0',
      hmaqUnitStr: '5.0'
    }
  ]);

  // Totais e Matriz de Apropriação Calculada
  const [cifTotal, setCifTotal] = useState(0);
  const [relatorioRateio, setRelatorioRateio] = useState([]);
  const [totaisGerais, setTotaisGerais] = useState({
    baseTotal: 0,
    custoDiretoTotal: 0,
    cifDistribuidoTotal: 0,
    custoProducaoTotal: 0
  });

  const atualizarCampoProduto = (id, campo, valor) => {
    setProdutos(produtos.map(p => {
      if (p.id === id) {
        return { ...p, [campo]: valor.replace(/[^0-9.]/g, '') };
      }
      return p;
    }));
  };

  useEffect(() => {
    const aluguel = parseFloat(aluguelFabricaStr) || 0;
    const energia = parseFloat(energiaFabricaStr) || 0;
    const deprec = parseFloat(depreciacaoMaquinasStr) || 0;
    const supervisao = parseFloat(supervisaoManutencaoStr) || 0;
    const cifGeral = aluguel + energia + deprec + supervisao;
    setCifTotal(cifGeral);

    const linhasProcessadas = produtos.map(p => {
      const qtd = parseFloat(p.qtdProduzidaStr) || 0;
      const mpUnit = parseFloat(p.mpUnitStr) || 0;
      const modUnit = parseFloat(p.modUnitStr) || 0;
      const hmodUnit = parseFloat(p.hmodUnitStr) || 0;
      const hmaqUnit = parseFloat(p.hmaqUnitStr) || 0;

      const mpTotal = qtd * mpUnit;
      const modTotal = qtd * modUnit;
      const cDiretoTotal = mpTotal + modTotal;

      const hmodTotal = qtd * hmodUnit;
      const hmaqTotal = qtd * hmaqUnit;

      let baseItem = 0;
      if (criterioRateio === 'hmod') baseItem = hmodTotal;
      else if (criterioRateio === 'hmaq') baseItem = hmaqTotal;
      else if (criterioRateio === 'primario') baseItem = cDiretoTotal;
      else if (criterioRateio === 'unidades') baseItem = qtd;

      return {
        ...p,
        qtd,
        mpUnit,
        modUnit,
        mpTotal,
        modTotal,
        cDiretoTotal,
        hmodTotal,
        hmaqTotal,
        baseItem
      };
    });

    const baseGeral = linhasProcessadas.reduce((acc, cur) => acc + cur.baseItem, 0);

    let somaCif = 0;
    let somaDireto = 0;

    const rateioFinal = linhasProcessadas.map(item => {
      const percParticipacao = baseGeral > 0 ? (item.baseItem / baseGeral) : 0;
      const cifAlocado = cifGeral * percParticipacao;
      const custoTotalProduto = item.cDiretoTotal + cifAlocado;
      const custoUnitarioFinal = item.qtd > 0 ? (custoTotalProduto / item.qtd) : 0;
      const cifUnitario = item.qtd > 0 ? (cifAlocado / item.qtd) : 0;

      somaCif += cifAlocado;
      somaDireto += item.cDiretoTotal;

      return {
        ...item,
        percParticipacao: percParticipacao * 100,
        cifAlocado,
        cifUnitario,
        custoTotalProduto,
        custoUnitarioFinal
      };
    });

    setRelatorioRateio(rateioFinal);
    setTotaisGerais({
      baseTotal: baseGeral,
      custoDiretoTotal: somaDireto,
      cifDistribuidoTotal: somaCif,
      custoProducaoTotal: somaDireto + somaCif
    });

  }, [criterioRateio, aluguelFabricaStr, energiaFabricaStr, depreciacaoMaquinasStr, supervisaoManutencaoStr, produtos]);

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px', boxSizing: 'border-box' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', wordBreak: 'break-word' }}>
            <span style={{ fontSize: '24px' }}>⚙️</span> Simulador de Rateio de Custos Indiretos (CIF)
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px', wordBreak: 'break-word' }}>
            Apropriação contábil de custos comuns da fábrica por hMOD, Horas-Máquina, Custo Primário e Volume.
          </p>
        </div>

        {/* SELETOR DE CRITÉRIO DE RATEIO */}
        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '4px', boxSizing: 'border-box' }}>
          <button 
            onClick={() => setCriterioRateio('hmod')}
            style={{ 
              padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: criterioRateio === 'hmod' ? '#2563eb' : 'transparent', 
              color: criterioRateio === 'hmod' ? 'white' : '#64748b'
            }}
          >
            ⏱️ Horas MOD
          </button>
          <button 
            onClick={() => setCriterioRateio('hmaq')}
            style={{ 
              padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: criterioRateio === 'hmaq' ? '#2563eb' : 'transparent', 
              color: criterioRateio === 'hmaq' ? 'white' : '#64748b'
            }}
          >
            🏭 Horas-Máq.
          </button>
          <button 
            onClick={() => setCriterioRateio('primario')}
            style={{ 
              padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: criterioRateio === 'primario' ? '#0f172a' : 'transparent', 
              color: criterioRateio === 'primario' ? 'white' : '#64748b'
            }}
          >
            💰 Custo Primário
          </button>
          <button 
            onClick={() => setCriterioRateio('unidades')}
            style={{ 
              padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: criterioRateio === 'unidades' ? '#0f172a' : 'transparent', 
              color: criterioRateio === 'unidades' ? 'white' : '#64748b'
            }}
          >
            📦 Unidades
          </button>
        </div>
      </div>

      {/* DASHBOARDS RESUMO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', marginBottom: '20px', boxSizing: 'border-box' }}>
        <div style={{ backgroundColor: '#fff5f5', padding: '16px', borderRadius: '16px', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#991b1b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>CIF Total a Ratear</span>
          <strong style={{ display: 'block', color: '#dc2626', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {formatMoeda(cifTotal)}
          </strong>
          <span style={{ fontSize: '11px', color: '#991b1b', wordBreak: 'break-word' }}>Aluguel, Energia, Deprec.</span>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #64748b', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Custos Diretos (MP + MOD)</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {formatMoeda(totaisGerais.custoDiretoTotal)}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>Identificação direta</span>
        </div>

        <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '16px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#1d4ed8', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Custo Total de Produção (CPP)</span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {formatMoeda(totaisGerais.custoProducaoTotal)}
          </strong>
          <span style={{ fontSize: '11px', color: '#2563eb', wordBreak: 'break-word' }}>Diretos + CIF Absorvido</span>
        </div>

        <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '16px', border: '1px solid #86efac', borderLeft: '4px solid #16a34a', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#166534', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Critério Vigente</span>
          <strong style={{ display: 'block', color: '#15803d', fontSize: '18px', marginTop: '4px', wordBreak: 'break-word' }}>
            {criterioRateio === 'hmod' ? 'Horas MOD' : criterioRateio === 'hmaq' ? 'Horas-Máquina' : criterioRateio === 'primario' ? 'Custo Primário' : 'Unidades'}
          </strong>
          <span style={{ fontSize: '11px', color: '#166534', wordBreak: 'break-word' }}>
            Base: {totaisGerais.baseTotal.toLocaleString('pt-BR')} {criterioRateio === 'primario' ? 'R$' : ''}
          </span>
        </div>
      </div>

      {/* ÁREA DE CONFIGURAÇÃO DOS GASTOS INDIRETOS E PRODUTOS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', marginBottom: '20px', boxSizing: 'border-box' }}>
        
        {/* COLUNA ESQUERDA: CUSTOS INDIRETOS DA FÁBRICA */}
        <div style={cardStyle}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', wordBreak: 'break-word' }}>
            Composição do CIF (Fábrica)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px', boxSizing: 'border-box' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Aluguel do Galpão (R$):</label>
                <input type="text" value={aluguelFabricaStr} onChange={e => setAluguelFabricaStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
              </div>

              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Energia Elétrica (R$):</label>
                <input type="text" value={energiaFabricaStr} onChange={e => setEnergiaFabricaStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Depreciação Máq. (R$):</label>
                <input type="text" value={depreciacaoMaquinasStr} onChange={e => setDepreciacaoMaquinasStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
              </div>

              <div style={{ minWidth: 0 }}>
                <label style={labelStyle}>Supervisão / Manut. (R$):</label>
                <input type="text" value={supervisaoManutencaoStr} onChange={e => setSupervisaoManutencaoStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11.5px', color: '#64748b', lineHeight: '1.4', boxSizing: 'border-box', wordBreak: 'break-word' }}>
              💡 <strong>Conceito Contábil:</strong> Os custos indiretos não podem ser identificados diretamente a uma unidade específica de produto, exigindo um direcionador racional.
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA: EDIÇÃO DOS PRODUTOS E DRIVERS */}
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '14px 18px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', boxSizing: 'border-box' }}>
            <h3 style={{ margin: 0, fontSize: '15px', wordBreak: 'break-word' }}>Parâmetros das Linhas de Produção</h3>
            <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>3 produtos configurados</span>
          </div>

          <div style={{ border: '1px solid #cbd5e1', borderTop: 'none', borderRadius: '0 0 16px 16px', overflowX: 'auto', backgroundColor: 'white', boxSizing: 'border-box' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'center', minWidth: '450px' }}>
              <thead style={{ backgroundColor: '#f8fafc', color: '#475569' }}>
                <tr>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Produto / Linha</th>
                  <th style={{ padding: '10px 12px' }}>Qtd</th>
                  <th style={{ padding: '10px 12px' }}>MP (R$)</th>
                  <th style={{ padding: '10px 12px' }}>MOD (R$)</th>
                  <th style={{ padding: '10px 12px' }}>hMOD</th>
                  <th style={{ padding: '10px 12px' }}>hMÁQ</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 'bold', color: '#0f172a', wordBreak: 'break-word' }}>
                      {p.nome}
                    </td>
                    <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>
                      <input type="text" value={p.qtdProduzidaStr} onChange={e => atualizarCampoProduto(p.id, 'qtdProduzidaStr', e.target.value)} style={{ width: '50px', padding: '4px', textAlign: 'center', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                    </td>
                    <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>
                      <input type="text" value={p.mpUnitStr} onChange={e => atualizarCampoProduto(p.id, 'mpUnitStr', e.target.value)} style={{ width: '60px', padding: '4px', textAlign: 'center', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                    </td>
                    <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>
                      <input type="text" value={p.modUnitStr} onChange={e => atualizarCampoProduto(p.id, 'modUnitStr', e.target.value)} style={{ width: '60px', padding: '4px', textAlign: 'center', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                    </td>
                    <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>
                      <input type="text" value={p.hmodUnitStr} onChange={e => atualizarCampoProduto(p.id, 'hmodUnitStr', e.target.value)} style={{ width: '45px', padding: '4px', textAlign: 'center', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                    </td>
                    <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>
                      <input type="text" value={p.hmaqUnitStr} onChange={e => atualizarCampoProduto(p.id, 'hmaqUnitStr', e.target.value)} style={{ width: '45px', padding: '4px', textAlign: 'center', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* PLANILHA DE RESULTADO DO RATEIO (MATRIZ DE ABSORÇÃO) */}
      <div style={{ border: '1px solid #cbd5e1', borderRadius: '16px', overflow: 'hidden', marginBottom: '20px', backgroundColor: 'white', boxSizing: 'border-box' }}>
        <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', boxSizing: 'border-box' }}>
          <h3 style={{ margin: 0, fontSize: '15px', wordBreak: 'break-word' }}>Matriz de Apropriação do Custo Total de Produção</h3>
          <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>Critério: {criterioRateio.toUpperCase()}</span>
        </div>

        <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'right', minWidth: '700px' }}>
            <thead style={{ backgroundColor: '#f8fafc', color: '#475569' }}>
              <tr>
                <th style={{ padding: '10px 14px', textAlign: 'left' }}>Produto</th>
                <th style={{ padding: '10px 14px' }}>Qtd</th>
                <th style={{ padding: '10px 14px' }}>Diretos (MP+MOD)</th>
                <th style={{ padding: '10px 14px' }}>Base</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>% Partic.</th>
                <th style={{ padding: '10px 14px', color: '#dc2626' }}>CIF Alocado</th>
                <th style={{ padding: '10px 14px', color: '#16a34a' }}>Custo Total</th>
                <th style={{ padding: '10px 14px', color: '#2563eb' }}>Custo Unit.</th>
              </tr>
            </thead>
            <tbody>
              {relatorioRateio.map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: 'white' }}>
                  <td style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 'bold', color: '#0f172a', wordBreak: 'break-word' }}>
                    {row.nome}
                  </td>
                  <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>{row.qtd} un.</td>
                  <td style={{ padding: '10px 14px', color: '#475569', whiteSpace: 'nowrap' }}>{formatMoeda(row.cDiretoTotal)}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    {row.baseItem.toLocaleString('pt-BR')} {criterioRateio === 'primario' ? 'R$' : ''}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 'bold', color: '#2563eb', whiteSpace: 'nowrap' }}>
                    {row.percParticipacao.toFixed(2)}%
                  </td>
                  <td style={{ padding: '10px 14px', color: '#dc2626', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    {formatMoeda(row.cifAlocado)}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#16a34a', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    {formatMoeda(row.custoTotalProduto)}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#1e40af', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                    {formatMoeda(row.custoUnitarioFinal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot style={{ backgroundColor: '#f8fafc', fontWeight: 'bold', borderTop: '2px solid #cbd5e1' }}>
              <tr>
                <td style={{ padding: '12px 14px', textAlign: 'left', whiteSpace: 'nowrap' }}>Totais Fabris</td>
                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>{relatorioRateio.reduce((acc, c) => acc + c.qtd, 0)} un.</td>
                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>{formatMoeda(totaisGerais.custoDiretoTotal)}</td>
                <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>{totaisGerais.baseTotal.toLocaleString('pt-BR')}</td>
                <td style={{ padding: '12px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>100.00%</td>
                <td style={{ padding: '12px 14px', color: '#dc2626', whiteSpace: 'nowrap' }}>{formatMoeda(totaisGerais.cifDistribuidoTotal)}</td>
                <td style={{ padding: '12px 14px', color: '#16a34a', whiteSpace: 'nowrap' }}>{formatMoeda(totaisGerais.custoProducaoTotal)}</td>
                <td style={{ padding: '12px 14px', color: '#1e40af', whiteSpace: 'nowrap' }}>-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* GUIA DE LANÇAMENTOS NO LIVRO DIÁRIO */}
      <div style={{ backgroundColor: '#eff6ff', borderRadius: '16px', border: '1px solid #bfdbfe', padding: '20px', boxSizing: 'border-box' }}>
        <h3 style={{ margin: '0 0 14px 0', fontSize: '14.5px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
          <span>🧭</span> Mapa de Partidas Dobradas: Absorção dos Custos Indiretos
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', fontSize: '11.5px', fontFamily: 'monospace', boxSizing: 'border-box' }}>
          
          <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #ef4444', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', minWidth: 0 }}>
            <div>
              <span style={{ fontWeight: 'bold', color: '#dc2626', display: 'block', marginBottom: '8px' }}>1. Registro Inicial dos Custos Indiretos:</span>
              <div style={{ color: '#059669', fontWeight: 'bold', wordBreak: 'break-word' }}>D: Aluguel da Fábrica a Apropriar ... {formatMoeda(parseFloat(aluguelFabricaStr) || 0)}</div>
              <div style={{ color: '#059669', fontWeight: 'bold', wordBreak: 'break-word' }}>D: Energia Elétrica Industrial ....... {formatMoeda(parseFloat(energiaFabricaStr) || 0)}</div>
              <div style={{ color: '#059669', fontWeight: 'bold', wordBreak: 'break-word' }}>D: Depreciação de Máquinas ......... {formatMoeda(parseFloat(depreciacaoMaquinasStr) || 0)}</div>
              <div style={{ color: '#dc2626', fontWeight: 'bold', marginTop: '4px', wordBreak: 'break-word' }}>C: Contas a Pagar / Fornecedores ..... {formatMoeda(cifTotal)}</div>
            </div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '14px', borderRadius: '12px', borderLeft: '4px solid #16a34a', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', minWidth: 0 }}>
            <div>
              <span style={{ fontWeight: 'bold', color: '#166534', display: 'block', marginBottom: '8px' }}>2. Transferência do CIF para os Estoques:</span>
              <div style={{ color: '#059669', fontWeight: 'bold', wordBreak: 'break-word' }}>D: Produtos em Elaboração - Linha A .. {formatMoeda(relatorioRateio[0]?.cifAlocado || 0)}</div>
              <div style={{ color: '#059669', fontWeight: 'bold', wordBreak: 'break-word' }}>D: Produtos em Elaboração - Linha B .. {formatMoeda(relatorioRateio[1]?.cifAlocado || 0)}</div>
              <div style={{ color: '#059669', fontWeight: 'bold', wordBreak: 'break-word' }}>D: Produtos em Elaboração - Linha C .. {formatMoeda(relatorioRateio[2]?.cifAlocado || 0)}</div>
              <div style={{ color: '#dc2626', fontWeight: 'bold', marginTop: '4px', wordBreak: 'break-word' }}>C: CIF Aplicados ..................... {formatMoeda(cifTotal)}</div>
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