import React, { useState, useEffect } from 'react';

export default function SimuladorRateioCustos() {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Critério de Rateio Selecionado: 'hmod', 'hmaq', 'primario', 'unidades'
  const [criterioRateio, setCriterioRateio] = useState('hmod');

  // CIF Global a ser Distribuído (Inputs em String para não travar no zero com Backspace)
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

    // 1. Cálculo das Bases de Rateio de cada Produto
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

    // 2. Apropriação do CIF Proporcional
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

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>⚙️</span> Simulador de Rateio de Custos Indiretos (CIF)
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Apropriação contábil de custos comuns da fábrica por hMOD, Horas-Máquina, Custo Primário e Volume.
          </p>
        </div>

        {/* SELETOR DE CRITÉRIO DE RATEIO */}
        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '4px' }}>
          <button 
            onClick={() => setCriterioRateio('hmod')}
            style={{ 
              padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: criterioRateio === 'hmod' ? '#2563eb' : 'transparent', 
              color: criterioRateio === 'hmod' ? 'white' : '#64748b'
            }}
          >
            ⏱️ Horas MOD (hMOD)
          </button>
          <button 
            onClick={() => setCriterioRateio('hmaq')}
            style={{ 
              padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: criterioRateio === 'hmaq' ? '#2563eb' : 'transparent', 
              color: criterioRateio === 'hmaq' ? 'white' : '#64748b'
            }}
          >
            🏭 Horas-Máquina
          </button>
          <button 
            onClick={() => setCriterioRateio('primario')}
            style={{ 
              padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: criterioRateio === 'primario' ? '#0f172a' : 'transparent', 
              color: criterioRateio === 'primario' ? 'white' : '#64748b'
            }}
          >
            💰 Custo Primário (MP+MOD)
          </button>
          <button 
            onClick={() => setCriterioRateio('unidades')}
            style={{ 
              padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: criterioRateio === 'unidades' ? '#0f172a' : 'transparent', 
              color: criterioRateio === 'unidades' ? 'white' : '#64748b'
            }}
          >
            📦 Unidades Produzidas
          </button>
        </div>
      </div>

      {/* DASHBOARDS RESUMO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div style={{ backgroundColor: '#fff5f5', padding: '18px', borderRadius: '12px', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444' }}>
          <span style={{ color: '#991b1b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>CIF Total a Ratear</span>
          <strong style={{ display: 'block', color: '#dc2626', fontSize: '24px', marginTop: '4px' }}>
            {formatMoeda(cifTotal)}
          </strong>
          <span style={{ fontSize: '11px', color: '#991b1b' }}>Aluguel, Energia, Depreciação e Supervisão</span>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #64748b' }}>
          <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Custos Diretos (MP + MOD)</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '24px', marginTop: '4px' }}>
            {formatMoeda(totaisGerais.custoDiretoTotal)}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Identificação direta nos produtos</span>
        </div>

        <div style={{ backgroundColor: '#eff6ff', padding: '18px', borderRadius: '12px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb' }}>
          <span style={{ color: '#1d4ed8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Custo Total de Produção (CPP)</span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '24px', marginTop: '4px' }}>
            {formatMoeda(totaisGerais.custoProducaoTotal)}
          </strong>
          <span style={{ fontSize: '11px', color: '#2563eb' }}>Diretos + CIF Totalmente Absorvido</span>
        </div>

        <div style={{ backgroundColor: '#f0fdf4', padding: '18px', borderRadius: '12px', border: '1px solid #86efac', borderLeft: '4px solid #16a34a' }}>
          <span style={{ color: '#166534', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Critério Vigente</span>
          <strong style={{ display: 'block', color: '#15803d', fontSize: '20px', marginTop: '4px' }}>
            {criterioRateio === 'hmod' ? 'Horas de MOD' : criterioRateio === 'hmaq' ? 'Horas-Máquina' : criterioRateio === 'primario' ? 'Custo Primário' : 'Unidades'}
          </strong>
          <span style={{ fontSize: '11px', color: '#166534' }}>
            Base Total: {totaisGerais.baseTotal.toLocaleString('pt-BR')} {criterioRateio === 'primario' ? 'R$' : ''}
          </span>
        </div>
      </div>

      {/* ÁREA DE CONFIGURAÇÃO DOS GASTOS INDIRETOS E PRODUTOS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '25px' }}>
        
        {/* COLUNA ESQUERDA: CUSTOS INDIRETOS DA FÁBRICA */}
        <div style={{ flex: '1 1 320px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
            Composição do CIF (Fábrica)
          </h3>

          <div style={{ display: 'flex', gap: '10px' }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Aluguel do Galpão (R$):
              <input 
                type="text" 
                value={aluguelFabricaStr} 
                onChange={e => setAluguelFabricaStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
              />
            </label>

            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Energia Elétrica Fabril (R$):
              <input 
                type="text" 
                value={energiaFabricaStr} 
                onChange={e => setEnergiaFabricaStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
              />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Depreciação Maquinário (R$):
              <input 
                type="text" 
                value={depreciacaoMaquinasStr} 
                onChange={e => setDepreciacaoMaquinasStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
              />
            </label>

            <label style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Supervisão e Manutenção (R$):
              <input 
                type="text" 
                value={supervisaoManutencaoStr} 
                onChange={e => setSupervisaoManutencaoStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
              />
            </label>
          </div>

          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px', color: '#64748b', lineHeight: '1.4' }}>
            💡 <strong>Conceito Contábil:</strong> Os custos indiretos não podem ser identificados diretamente a uma unidade específica de produto. O método de absorção exige a escolha de um direcionador racional para alocá-los ao custo do estoque.
          </div>
        </div>

        {/* COLUNA DIREITA: EDIÇÃO DOS PRODUTOS E DRIVERS */}
        <div style={{ flex: '1 1 450px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '12px 16px', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: '14px' }}>Parâmetros das Linhas de Produção</h3>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>3 produtos configurados</span>
          </div>

          <div style={{ border: '1px solid #cbd5e1', borderTop: 'none', borderRadius: '0 0 12px 12px', overflowX: 'auto', backgroundColor: 'white' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'center' }}>
              <thead style={{ backgroundColor: '#f8fafc', color: '#475569' }}>
                <tr>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Produto / Linha</th>
                  <th style={{ padding: '10px' }}>Qtd Prod.</th>
                  <th style={{ padding: '10px' }}>MP Unit (R$)</th>
                  <th style={{ padding: '10px' }}>MOD Unit (R$)</th>
                  <th style={{ padding: '10px' }}>hMOD / un</th>
                  <th style={{ padding: '10px' }}>hMÁQ / un</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', textAlign: 'left', fontWeight: 'bold', color: '#0f172a' }}>
                      {p.nome}
                    </td>
                    <td style={{ padding: '6px' }}>
                      <input 
                        type="text" 
                        value={p.qtdProduzidaStr} 
                        onChange={e => atualizarCampoProduto(p.id, 'qtdProduzidaStr', e.target.value)} 
                        style={{ width: '60px', padding: '4px', textAlign: 'center', borderRadius: '4px', border: '1px solid #cbd5e1' }} 
                      />
                    </td>
                    <td style={{ padding: '6px' }}>
                      <input 
                        type="text" 
                        value={p.mpUnitStr} 
                        onChange={e => atualizarCampoProduto(p.id, 'mpUnitStr', e.target.value)} 
                        style={{ width: '65px', padding: '4px', textAlign: 'center', borderRadius: '4px', border: '1px solid #cbd5e1' }} 
                      />
                    </td>
                    <td style={{ padding: '6px' }}>
                      <input 
                        type="text" 
                        value={p.modUnitStr} 
                        onChange={e => atualizarCampoProduto(p.id, 'modUnitStr', e.target.value)} 
                        style={{ width: '65px', padding: '4px', textAlign: 'center', borderRadius: '4px', border: '1px solid #cbd5e1' }} 
                      />
                    </td>
                    <td style={{ padding: '6px' }}>
                      <input 
                        type="text" 
                        value={p.hmodUnitStr} 
                        onChange={e => atualizarCampoProduto(p.id, 'hmodUnitStr', e.target.value)} 
                        style={{ width: '50px', padding: '4px', textAlign: 'center', borderRadius: '4px', border: '1px solid #cbd5e1' }} 
                      />
                    </td>
                    <td style={{ padding: '6px' }}>
                      <input 
                        type="text" 
                        value={p.hmaqUnitStr} 
                        onChange={e => atualizarCampoProduto(p.id, 'hmaqUnitStr', e.target.value)} 
                        style={{ width: '50px', padding: '4px', textAlign: 'center', borderRadius: '4px', border: '1px solid #cbd5e1' }} 
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* PLANILHA DE RESULTADO DO RATEIO (MATRIZ DE ABSORÇÃO) */}
      <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden', marginBottom: '25px' }}>
        <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '12px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '14px' }}>Matriz de Apropriação do Custo Total de Produção</h3>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>Critério: {criterioRateio.toUpperCase()}</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'right' }}>
            <thead style={{ backgroundColor: '#f8fafc', color: '#475569' }}>
              <tr>
                <th style={{ padding: '10px 14px', textAlign: 'left' }}>Produto</th>
                <th style={{ padding: '10px 14px' }}>Qtd Prod.</th>
                <th style={{ padding: '10px 14px' }}>Custos Diretos (MP+MOD)</th>
                <th style={{ padding: '10px 14px' }}>Base Rateio</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>% Partic.</th>
                <th style={{ padding: '10px 14px', color: '#dc2626' }}>CIF Alocado</th>
                <th style={{ padding: '10px 14px', color: '#dc2626' }}>CIF / un.</th>
                <th style={{ padding: '10px 14px', color: '#16a34a' }}>Custo Total Prod.</th>
                <th style={{ padding: '10px 14px', color: '#2563eb' }}>Custo Unit. Final</th>
              </tr>
            </thead>
            <tbody>
              {relatorioRateio.map(row => (
                <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: 'white' }}>
                  <td style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 'bold', color: '#0f172a' }}>
                    {row.nome}
                  </td>
                  <td style={{ padding: '10px 14px' }}>{row.qtd} un.</td>
                  <td style={{ padding: '10px 14px', color: '#475569' }}>{formatMoeda(row.cDiretoTotal)}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 'bold' }}>
                    {row.baseItem.toLocaleString('pt-BR')} {criterioRateio === 'primario' ? 'R$' : ''}
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 'bold', color: '#2563eb' }}>
                    {row.percParticipacao.toFixed(2)}%
                  </td>
                  <td style={{ padding: '10px 14px', color: '#dc2626', fontWeight: 'bold' }}>
                    {formatMoeda(row.cifAlocado)}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#dc2626' }}>
                    {formatMoeda(row.cifUnitario)}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#16a34a', fontWeight: 'bold' }}>
                    {formatMoeda(row.custoTotalProduto)}
                  </td>
                  <td style={{ padding: '10px 14px', color: '#1e40af', fontWeight: 'bold', fontSize: '13px' }}>
                    {formatMoeda(row.custoUnitarioFinal)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot style={{ backgroundColor: '#f8fafc', fontWeight: 'bold', borderTop: '2px solid #cbd5e1' }}>
              <tr>
                <td style={{ padding: '12px 14px', textAlign: 'left' }}>Totais Fabris</td>
                <td style={{ padding: '12px 14px' }}>
                  {relatorioRateio.reduce((acc, c) => acc + c.qtd, 0)} un.
                </td>
                <td style={{ padding: '12px 14px' }}>{formatMoeda(totaisGerais.custoDiretoTotal)}</td>
                <td style={{ padding: '12px 14px' }}>{totaisGerais.baseTotal.toLocaleString('pt-BR')}</td>
                <td style={{ padding: '12px 14px', textAlign: 'center' }}>100.00%</td>
                <td style={{ padding: '12px 14px', color: '#dc2626' }}>{formatMoeda(totaisGerais.cifDistribuidoTotal)}</td>
                <td style={{ padding: '12px 14px' }}>-</td>
                <td style={{ padding: '12px 14px', color: '#16a34a' }}>{formatMoeda(totaisGerais.custoProducaoTotal)}</td>
                <td style={{ padding: '12px 14px', color: '#1e40af' }}>-</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* GUIA DE LANÇAMENTOS NO LIVRO DIÁRIO */}
      <div style={{ backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', padding: '18px' }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🧭</span> Mapa de Partidas Dobradas: Absorção dos Custos Indiretos
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '15px', fontSize: '11px', fontFamily: 'monospace' }}>
          
          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #ef4444' }}>
            <span style={{ fontWeight: 'bold', color: '#dc2626', display: 'block', marginBottom: '4px' }}>1. Registro Inicial dos Custos Indiretos (Contas Transitórias):</span>
            <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Aluguéis da Fábrica a Apropriar ........... {formatMoeda(parseFloat(aluguelFabricaStr) || 0)}</div>
            <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Energia Elétrica Industrial a Apropriar ... {formatMoeda(parseFloat(energiaFabricaStr) || 0)}</div>
            <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Depreciação de Máquinas - Fábrica ......... {formatMoeda(parseFloat(depreciacaoMaquinasStr) || 0)}</div>
            <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Manutenção e Supervisão Industrial ....... {formatMoeda(parseFloat(supervisaoManutencaoStr) || 0)}</div>
            <div style={{ color: '#dc2626', fontWeight: 'bold', marginTop: '4px' }}>C: Contas a Pagar / Fornecedores / Deprec. ... {formatMoeda(cifTotal)}</div>
          </div>

          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #16a34a' }}>
            <span style={{ fontWeight: 'bold', color: '#166534', display: 'block', marginBottom: '4px' }}>2. Transferência do CIF para os Estoques em Processo:</span>
            <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Produtos em Elaboração - Linha Standard ... {formatMoeda(relatorioRateio[0]?.cifAlocado || 0)}</div>
            <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Produtos em Elaboração - Linha Premium .... {formatMoeda(relatorioRateio[1]?.cifAlocado || 0)}</div>
            <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Produtos em Elaboração - Linha Luxo ....... {formatMoeda(relatorioRateio[2]?.cifAlocado || 0)}</div>
            <div style={{ color: '#dc2626', fontWeight: 'bold', marginTop: '4px' }}>C: Custos Indiretos de Fabricação Aplicados .. {formatMoeda(cifTotal)}</div>
            <span style={{ color: '#64748b', display: 'block', marginTop: '4px' }}>
              (Zera as contas transitórias de CIF e ativa o custo no Ativo Circulante)
            </span>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}