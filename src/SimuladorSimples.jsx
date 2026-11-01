import React, { useState, useEffect, useMemo } from 'react';

export default function SimuladorSimples({ mostrarToast, registrarFatoGerador, planoContas = [], clienteSelecionado = {} }) {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Detecção Automática do Terceiro Setor
  const isTerceiroSetorDetectado = useMemo(() => {
    const nome = (clienteSelecionado?.nome || '').toLowerCase();
    return nome.includes('igreja') || nome.includes('ong') || nome.includes('instituto') || nome.includes('associação') || nome.includes('associacao');
  }, [clienteSelecionado]);

  const [perfilTributario, setPerfilTributario] = useState(isTerceiroSetorDetectado ? 'ong_igreja' : 'empresa');
  const [subAba, setSubAba] = useState('simples');

  useEffect(() => {
    setPerfilTributario(isTerceiroSetorDetectado ? 'ong_igreja' : 'empresa');
  }, [isTerceiroSetorDetectado]);

  // ==========================================
  // ESTADOS DO SIMPLES NACIONAL (REFORMA TRIBUTÁRIA EC 132/23)
  // ==========================================
  const [anexoSimples, setAnexoSimples] = useState('anexo1'); 
  const [rbt12, setRbt12] = useState(180000);
  const [receitaMesSimples, setReceitaMesSimples] = useState(25000);
  
  // Escolha do Regime na Reforma Tributária
  const [modeloReforma, setModeloReforma] = useState('unificado'); // 'unificado' ou 'por_fora'

  const [calculoSimples, setCalculoSimples] = useState({ 
    aliqNominal: 0, 
    aliqEfetiva: 0, 
    valorDasUnificado: 0, 
    valorDasReduzido: 0, 
    valorIbsCbs: 0 
  });

  useEffect(() => {
    let nom = 0.04;
    let ded = 0;
    let percentualTributosConsumo = 0.34; // Média da tabela que representa ICMS/ISS/PIS/COFINS

    if (anexoSimples === 'anexo1') {
      percentualTributosConsumo = 0.45; // No comércio, o ICMS+PIS+COFINS representa aprox 45% do DAS
      if (rbt12 <= 180000) { nom = 0.04; ded = 0; }
      else if (rbt12 <= 360000) { nom = 0.073; ded = 5940; }
      else if (rbt12 <= 720000) { nom = 0.095; ded = 13860; }
      else if (rbt12 <= 1800000) { nom = 0.107; ded = 22500; }
      else if (rbt12 <= 3600000) { nom = 0.143; ded = 87300; }
      else { nom = 0.19; ded = 378000; }
    } else {
      percentualTributosConsumo = 0.40; // Em serviços, ISS+PIS+COFINS representa aprox 40% do DAS
      if (rbt12 <= 180000) { nom = 0.06; ded = 0; }
      else if (rbt12 <= 360000) { nom = 0.112; ded = 9360; }
      else if (rbt12 <= 720000) { nom = 0.135; ded = 17640; }
      else if (rbt12 <= 1800000) { nom = 0.16; ded = 35640; }
      else if (rbt12 <= 3600000) { nom = 0.21; ded = 125640; }
      else { nom = 0.33; ded = 648000; }
    }

    const rbtCalculo = rbt12 > 0 ? rbt12 : 1;
    let efetiva = ((rbtCalculo * nom) - ded) / rbtCalculo;
    if (efetiva < 0.04 && anexoSimples === 'anexo1') efetiva = 0.04;
    if (efetiva < 0.06 && anexoSimples === 'anexo3') efetiva = 0.06;

    const valorDasUnificado = Number(receitaMesSimples) * efetiva;
    
    // Na Reforma, se escolher "por fora", o DAS perde a parcela do consumo (IBS/CBS)
    const valorDasReduzido = valorDasUnificado * (1 - percentualTributosConsumo);
    
    // Alíquota Padrão de IBS/CBS estimada na reforma (aprox. 26.5%)
    const valorIbsCbs = Number(receitaMesSimples) * 0.265; 

    setCalculoSimples({
      aliqNominal: nom * 100,
      aliqEfetiva: efetiva * 100,
      valorDasUnificado,
      valorDasReduzido,
      valorIbsCbs
    });
  }, [anexoSimples, rbt12, receitaMesSimples, modeloReforma]);

  // ==========================================
  // ESTADOS DO MEI (SIMEI NA REFORMA TRIBUTÁRIA)
  // ==========================================
  const [tipoAtividadeMei, setTipoAtividadeMei] = useState('comercio');
  const [faturamentoAnualMei, setFaturamentoAnualMei] = useState(48000);
  const limiteAnualMei = 81000; // Limite padrão

  const inssFixoMei = 70.60;
  // Nova Nomenclatura da EC 132/23
  const cbsFixoMei = (tipoAtividadeMei === 'comercio' || tipoAtividadeMei === 'misto') ? 1.50 : 0;
  const ibsFixoMei = (tipoAtividadeMei === 'servico' || tipoAtividadeMei === 'misto') ? 5.50 : 0;
  const totalGuiaMei = inssFixoMei + cbsFixoMei + ibsFixoMei;
  const percLimiteMei = Math.min((faturamentoAnualMei / limiteAnualMei) * 100, 100);

  // ==========================================================
  // MOTORES DE INTEGRAÇÃO CONTÁBIL
  // ==========================================================
  const handleContabilizarSimples = () => {
    if (typeof registrarFatoGerador !== 'function') return;
    const cSafe = planoContas || [];
    const idDespesaSimples = cSafe.find(c => c.codigo_contabil === '5.2.04.01' || (c.nome_conta || '').toLowerCase().includes('simples'))?.id || cSafe[0]?.id;
    const idPassivoSimples = cSafe.find(c => (c.nome_conta || '').toLowerCase().includes('tributos') || (c.nome_conta || '').toLowerCase().includes('recolher'))?.id || cSafe[0]?.id;
    
    if (modeloReforma === 'unificado') {
      if (calculoSimples.valorDasUnificado <= 0) return alert('Sem valor apurado.');
      registrarFatoGerador(`Provisão DAS Unificado (Receita R$ ${receitaMesSimples.toFixed(2)})`, calculoSimples.valorDasUnificado, 'Tributário', [idDespesaSimples], [idPassivoSimples]);
      if (mostrarToast) mostrarToast('DAS Unificado contabilizado!', 'sucesso');
    } else {
      if (calculoSimples.valorDasReduzido <= 0) return alert('Sem valor apurado.');
      // 1. Lança o DAS reduzido (IRPJ, CSLL, CPP)
      registrarFatoGerador(`Provisão DAS Reduzido s/ Consumo (IRPJ/CSLL/CPP)`, calculoSimples.valorDasReduzido, 'Tributário', [idDespesaSimples], [idPassivoSimples]);
      
      // 2. Lança a CBS e o IBS
      const idDespesaIbs = cSafe.find(c => (c.nome_conta || '').toLowerCase().includes('despesas') || (c.nome_conta || '').toLowerCase().includes('operacionais'))?.id || idDespesaSimples;
      registrarFatoGerador(`Provisão IBS/CBS Por Fora do Simples (26,5%)`, calculoSimples.valorIbsCbs, 'Tributário', [idDespesaIbs], [idPassivoSimples]);
      
      if (mostrarToast) mostrarToast('Guias Separadas (DAS Reduzido + IBS/CBS) contabilizadas!', 'sucesso');
    }
  };

  const handleContabilizarMei = () => {
    if (typeof registrarFatoGerador !== 'function') return;
    const cSafe = planoContas || [];
    const idDespesaMei = cSafe.find(c => (c.nome_conta || '').toLowerCase().includes('despesas') || (c.nome_conta || '').toLowerCase().includes('operacionais'))?.id || cSafe[0]?.id;
    const idCaixaBanco = cSafe.find(c => c.codigo_contabil === '1.1.01.02' || (c.nome_conta || '').toLowerCase().includes('banco'))?.id || cSafe[0]?.id;
    registrarFatoGerador(`Pagamento Guia DAS-MEI Fixo (INSS/CBS/IBS)`, totalGuiaMei, 'Tributário', [idDespesaMei], [idCaixaBanco]);
    if (mostrarToast) mostrarToast('Guia MEI com as novas siglas lançada no Diário!', 'sucesso');
  };

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO COM SELETOR DE PERFIL */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🧾</span> Gestão Tributária & Arrecadação
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Adequado às regras da <strong>Reforma Tributária (EC 132/2023)</strong> para CBS e IBS.
          </p>
        </div>

        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0', gap: '4px' }}>
          <button onClick={() => setPerfilTributario('empresa')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: perfilTributario === 'empresa' ? '#0f172a' : 'transparent', color: perfilTributario === 'empresa' ? 'white' : '#64748b' }}>
            🏢 Empresa (Visando Lucro)
          </button>
          <button onClick={() => setPerfilTributario('ong_igreja')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: perfilTributario === 'ong_igreja' ? '#831843' : 'transparent', color: perfilTributario === 'ong_igreja' ? 'white' : '#64748b' }}>
            🕊️ Terceiro Setor (ONG/Igreja)
          </button>
        </div>
      </div>

      {/* TELA DE TERCEIRO SETOR (IMUNIDADE) */}
      {perfilTributario === 'ong_igreja' && (
        <div style={{ animation: 'fadeIn 0.3s', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ backgroundColor: '#fdf2f8', border: '1px solid #fbcfe8', padding: '24px', borderRadius: '12px', display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
            <span style={{ fontSize: '32px' }}>🛑</span>
            <div>
              <h3 style={{ margin: '0 0 8px 0', color: '#831843', fontSize: '18px' }}>Imunidade e Isenção Tributária (Art. 150 CF/88)</h3>
              <p style={{ margin: '0 0 12px 0', color: '#9d174d', fontSize: '13.5px', lineHeight: '1.6' }}>
                Entidades do Terceiro Setor são proibidas de optar pelo Simples Nacional ou MEI. A Reforma Tributária <strong>manteve a imunidade do IBS e da CBS</strong> para igrejas, partidos políticos e ONGs (assistência social/educação), que continuam dispensadas de pagar impostos sobre o patrimônio e a renda.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TELA DE EMPRESAS (SIMPLES E MEI) */}
      {perfilTributario === 'empresa' && (
        <>
          <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0', gap: '4px', marginBottom: '20px', width: 'fit-content' }}>
            <button onClick={() => setSubAba('simples')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: subAba === 'simples' ? '#2563eb' : 'transparent', color: subAba === 'simples' ? 'white' : '#64748b' }}>
              🏢 Simples Nacional Pós-Reforma
            </button>
            <button onClick={() => setSubAba('mei')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: subAba === 'mei' ? '#2563eb' : 'transparent', color: subAba === 'mei' ? 'white' : '#64748b' }}>
              🏪 MEI (SIMEI Novo)
            </button>
          </div>

          {subAba === 'simples' && (
            <div style={{ animation: 'fadeIn 0.3s' }}>
              
              {/* PAINEL DE ESCOLHA DA REFORMA TRIBUTÁRIA */}
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', padding: '20px', borderRadius: '12px', marginBottom: '25px' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#166534', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🔄</span> Opção de Recolhimento IBS/CBS (EC 132/2023)
                </h3>
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
                  <label style={{ flex: 1, backgroundColor: modeloReforma === 'unificado' ? '#dcfce7' : 'white', border: `2px solid ${modeloReforma === 'unificado' ? '#16a34a' : '#cbd5e1'}`, padding: '15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '10px' }}>
                    <input type="radio" name="modeloReforma" value="unificado" checked={modeloReforma === 'unificado'} onChange={() => setModeloReforma('unificado')} style={{ marginTop: '2px' }} />
                    <div>
                      <strong style={{ display: 'block', color: '#0f172a', fontSize: '13px' }}>1. Manter DAS Unificado</strong>
                      <span style={{ fontSize: '11px', color: '#475569', display: 'block', marginTop: '4px' }}>Paga todos os tributos numa guia só. <br/><strong style={{ color: '#dc2626' }}>Contra:</strong> Seu cliente corporativo recebe pouco crédito de IBS/CBS. Ideal para quem vende pro consumidor final (B2C).</span>
                    </div>
                  </label>

                  <label style={{ flex: 1, backgroundColor: modeloReforma === 'por_fora' ? '#dcfce7' : 'white', border: `2px solid ${modeloReforma === 'por_fora' ? '#16a34a' : '#cbd5e1'}`, padding: '15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', gap: '10px' }}>
                    <input type="radio" name="modeloReforma" value="por_fora" checked={modeloReforma === 'por_fora'} onChange={() => setModeloReforma('por_fora')} style={{ marginTop: '2px' }} />
                    <div>
                      <strong style={{ display: 'block', color: '#0f172a', fontSize: '13px' }}>2. Recolher IBS e CBS "Por Fora"</strong>
                      <span style={{ fontSize: '11px', color: '#475569', display: 'block', marginTop: '4px' }}>O DAS é reduzido. A empresa apura o IBS e CBS separados e permite que o cliente tome <strong style={{ color: '#16a34a' }}>100% de crédito</strong>. Ideal para vendas B2B.</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* TOTAIS DINÂMICOS CONFORME ESCOLHA */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '20px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #64748b' }}>
                  <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Alíquota DAS Nominal</span>
                  <strong style={{ display: 'block', color: '#0f172a', fontSize: '24px', marginTop: '4px' }}>{calculoSimples.aliqNominal.toFixed(2)}%</strong>
                </div>

                {modeloReforma === 'unificado' ? (
                  <div style={{ backgroundColor: '#eff6ff', padding: '18px', borderRadius: '12px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb' }}>
                    <span style={{ color: '#1d4ed8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Guia DAS (Completo)</span>
                    <strong style={{ display: 'block', color: '#1e40af', fontSize: '24px', marginTop: '4px' }}>{formatMoeda(calculoSimples.valorDasUnificado)}</strong>
                    <span style={{ fontSize: '11px', color: '#2563eb' }}>Alíquota Efetiva: {calculoSimples.aliqEfetiva.toFixed(2)}%</span>
                  </div>
                ) : (
                  <>
                    <div style={{ backgroundColor: '#eff6ff', padding: '18px', borderRadius: '12px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb' }}>
                      <span style={{ color: '#1d4ed8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Guia DAS (Reduzido)</span>
                      <strong style={{ display: 'block', color: '#1e40af', fontSize: '24px', marginTop: '4px' }}>{formatMoeda(calculoSimples.valorDasReduzido)}</strong>
                      <span style={{ fontSize: '11px', color: '#2563eb' }}>Apenas IRPJ, CSLL e CPP</span>
                    </div>
                    <div style={{ backgroundColor: '#fef3c7', padding: '18px', borderRadius: '12px', border: '1px solid #fde68a', borderLeft: '4px solid #d97706' }}>
                      <span style={{ color: '#b45309', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Guia IBS / CBS (~26.5%)</span>
                      <strong style={{ display: 'block', color: '#b45309', fontSize: '24px', marginTop: '4px' }}>{formatMoeda(calculoSimples.valorIbsCbs)}</strong>
                      <span style={{ fontSize: '11px', color: '#d97706' }}>Paga "Por Fora" do Simples</span>
                    </div>
                  </>
                )}
              </div>

              {/* INPUTS E INTEGRAÇÃO */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 340px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>Parâmetros de Receita</h3>
                  <label htmlFor="snAnexo" style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                    Atividade Principal:
                    <select id="snAnexo" value={anexoSimples} onChange={e => setAnexoSimples(e.target.value)} style={{ padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
                      <option value="anexo1">Comércio (Anexo I)</option>
                      <option value="anexo3">Serviços (Anexo III)</option>
                    </select>
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <label htmlFor="snRbt12" style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                      RBT12 (Últ. 12m):
                      <input id="snRbt12" type="number" step="1000" value={rbt12} onChange={e => setRbt12(e.target.value)} style={{ padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                    </label>
                    <label htmlFor="snReceita" style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#059669' }}>
                      Receita do Mês:
                      <input id="snReceita" type="number" step="500" value={receitaMesSimples} onChange={e => setReceitaMesSimples(e.target.value)} style={{ padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #a7f3d0', backgroundColor: '#ecfdf5' }} />
                    </label>
                  </div>
                </div>

                <div style={{ flex: '1 1 320px', backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}><span>🧭</span> Diário: {modeloReforma === 'unificado' ? 'DAS Único' : 'DAS + IBS/CBS'}</h3>
                    <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '6px', borderLeft: '4px solid #2563eb', fontSize: '12px', fontFamily: 'monospace' }}>
                      <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Despesa Tributária (DRE)</div>
                      <div style={{ color: '#dc2626', fontWeight: 'bold', marginTop: '4px' }}>C: Tributos a Recolher (Passivo)</div>
                    </div>
                  </div>
                  <button onClick={handleContabilizarSimples} style={{ marginTop: '15px', backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Escriturar Provisão Tributária 🏢
                  </button>
                </div>
              </div>
            </div>
          )}

          {subAba === 'mei' && (
            <div style={{ animation: 'fadeIn 0.3s' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '25px' }}>
                <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #0f172a' }}>
                  <span style={{ color: '#475569', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Guia DAS-MEI (Mensal)</span>
                  <strong style={{ display: 'block', color: '#0f172a', fontSize: '26px', marginTop: '4px' }}>{formatMoeda(totalGuiaMei)}</strong>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>INSS + CBS Fixa + IBS Fixo</span>
                </div>
                <div style={{ backgroundColor: faturamentoAnualMei > limiteAnualMei ? '#fff5f5' : '#f0fdf4', padding: '18px', borderRadius: '12px', border: `1px solid ${faturamentoAnualMei > limiteAnualMei ? '#fecaca' : '#86efac'}`, borderLeft: `4px solid ${faturamentoAnualMei > limiteAnualMei ? '#ef4444' : '#16a34a'}` }}>
                  <span style={{ color: faturamentoAnualMei > limiteAnualMei ? '#991b1b' : '#166534', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Teto Anual Atual (R$ 81.000,00)</span>
                  <strong style={{ display: 'block', color: faturamentoAnualMei > limiteAnualMei ? '#dc2626' : '#15803d', fontSize: '26px', marginTop: '4px' }}>{formatMoeda(faturamentoAnualMei)}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: '1 1 340px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>Parâmetros do MEI</h3>
                  <label htmlFor="meiAtividade" style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                    Setor de Atuação (Reforma Tributária):
                    <select id="meiAtividade" value={tipoAtividadeMei} onChange={e => setTipoAtividadeMei(e.target.value)} style={{ padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: 'white' }}>
                      <option value="comercio">Comércio / Indústria (INSS + CBS)</option>
                      <option value="servico">Prestação de Serviços (INSS + IBS)</option>
                      <option value="misto">Misto (INSS + CBS + IBS)</option>
                    </select>
                  </label>
                  <label htmlFor="meiFatAnual" style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>
                    Faturamento Acumulado no Ano (R$):
                    <input id="meiFatAnual" type="number" step="1000" value={faturamentoAnualMei} onChange={e => setFaturamentoAnualMei(e.target.value)} style={{ padding: '10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                  </label>
                </div>
                
                <div style={{ flex: '1 1 320px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}><span>🧭</span> Lançamento da Guia MEI</h3>
                    <div style={{ padding: '12px', backgroundColor: 'white', borderRadius: '6px', borderLeft: '4px solid #0f172a', fontSize: '12px', fontFamily: 'monospace' }}>
                      <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Despesa c/ Tributos MEI (DRE)</div>
                      <div style={{ color: '#dc2626', fontWeight: 'bold', marginTop: '4px' }}>C: Caixa ou Banco (Ativo)</div>
                      <strong style={{ display: 'block', marginTop: '8px', color: '#0f172a', fontSize: '14px' }}>Valor Fixo: {formatMoeda(totalGuiaMei)}</strong>
                    </div>
                  </div>
                  <button onClick={handleContabilizarMei} style={{ marginTop: '15px', backgroundColor: '#0f172a', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
                    Lançar Pagamento do MEI 💸
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}