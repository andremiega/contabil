import React, { useState, useMemo } from 'react';

export default function SimuladorEmprestimo({ mostrarToast, registrarFatoGerador, planoContas = [] }) {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Inputs em String para não travar o zero no Backspace
  const [bancoNome, setBancoNome] = useState('Banco Itaú Unibanco S/A');
  const [valorLiberadoStr, setValorLiberadoStr] = useState('100000'); 
  const [taxaJurosMensalStr, setTaxaJurosMensalStr] = useState('2.0'); 
  const [prazoMesesStr, setPrazoMesesStr] = useState('24'); 
  const [sistemaAmortizacao, setSistemaAmortizacao] = useState('price'); 

  // Motor Matemático Anti-Crash (useMemo recalcula apenas quando os inputs mudam e evita loops)
  const { totais, cronograma } = useMemo(() => {
    const C = parseFloat(valorLiberadoStr) || 0;
    const i = (parseFloat(taxaJurosMensalStr) || 0) / 100;
    let n = parseInt(prazoMesesStr, 10) || 0;

    // Trava de segurança contra tela branca (máximo 40 anos para não estourar a memória)
    if (n > 480) n = 480;

    const fallback = {
      totais: { valorBrutoTotal: 0, totalJuros: 0, parcelaInicial: 0, curtoPrazoPrincipal: 0, curtoPrazoJuros: 0, longoPrazoPrincipal: 0, longoPrazoJuros: 0, primeiroMesJuros: 0, primeiroMesAmortizacao: 0 },
      cronograma: []
    };

    if (C <= 0 || n <= 0) return fallback;

    let saldo = C;
    let tabela = [];
    let somaJurosTotal = 0, somaCurtoPrincipal = 0, somaCurtoJuros = 0, somaLongoPrincipal = 0, somaLongoJuros = 0;

    if (sistemaAmortizacao === 'price') {
      const denominador = Math.pow(1 + i, n) - 1;
      const pmt = (i > 0 && denominador > 0) ? (C * (i * Math.pow(1 + i, n))) / denominador : (C / n);

      for (let mes = 1; mes <= n; mes++) {
        const jurosMes = saldo * i;
        const amortizacaoMes = pmt - jurosMes;
        saldo = Math.max(0, saldo - amortizacaoMes);
        somaJurosTotal += jurosMes;

        if (mes <= 12) {
          somaCurtoPrincipal += amortizacaoMes;
          somaCurtoJuros += jurosMes;
        } else {
          somaLongoPrincipal += amortizacaoMes;
          somaLongoJuros += jurosMes;
        }

        tabela.push({ mes, parcela: pmt, amortizacao: amortizacaoMes, juros: jurosMes, saldoDevedor: saldo, classificacao: mes <= 12 ? 'Circulante (CP)' : 'Não Circulante (LP)' });
      }

      const primMes = tabela[0] || { juros: 0, amortizacao: 0 };
      return {
        totais: { valorBrutoTotal: C + somaJurosTotal, totalJuros: somaJurosTotal, parcelaInicial: pmt, curtoPrazoPrincipal: somaCurtoPrincipal, curtoPrazoJuros: somaCurtoJuros, longoPrazoPrincipal: somaLongoPrincipal, longoPrazoJuros: somaLongoJuros, primeiroMesJuros: primMes.juros, primeiroMesAmortizacao: primMes.amortizacao },
        cronograma: tabela
      };

    } else {
      // SAC
      const amortConstante = C / n;

      for (let mes = 1; mes <= n; mes++) {
        const jurosMes = saldo * i;
        const pmt = amortConstante + jurosMes;
        saldo = Math.max(0, saldo - amortConstante);
        somaJurosTotal += jurosMes;

        if (mes <= 12) {
          somaCurtoPrincipal += amortConstante;
          somaCurtoJuros += jurosMes;
        } else {
          somaLongoPrincipal += amortConstante;
          somaLongoJuros += jurosMes;
        }

        tabela.push({ mes, parcela: pmt, amortizacao: amortConstante, juros: jurosMes, saldoDevedor: saldo, classificacao: mes <= 12 ? 'Circulante (CP)' : 'Não Circulante (LP)' });
      }

      const primMes = tabela[0] || { parcela: 0, juros: 0, amortizacao: 0 };
      return {
        totais: { valorBrutoTotal: C + somaJurosTotal, totalJuros: somaJurosTotal, parcelaInicial: primMes.parcela, curtoPrazoPrincipal: somaCurtoPrincipal, curtoPrazoJuros: somaCurtoJuros, longoPrazoPrincipal: somaLongoPrincipal, longoPrazoJuros: somaLongoJuros, primeiroMesJuros: primMes.juros, primeiroMesAmortizacao: primMes.amortizacao },
        cronograma: tabela
      };
    }
  }, [valorLiberadoStr, taxaJurosMensalStr, prazoMesesStr, sistemaAmortizacao]);

  // ==========================================================
  // INTEGRAÇÃO CONTÁBIL (MOTOR DO DIÁRIO)
  // ==========================================================
  const handleContratarEmprestimo = () => {
    if (typeof registrarFatoGerador !== 'function') return;
    const C = parseFloat(valorLiberadoStr) || 0;
    if (C <= 0) return alert('O valor do empréstimo deve ser maior que zero.');

    const contasSafe = planoContas || [];
    const idBanco = contasSafe.find(c => c.codigo_contabil === '1.1.01.02' || (c.nome_conta || '').toLowerCase().includes('banco'))?.id;
    const idEmprestimoCP = contasSafe.find(c => c.codigo_contabil === '2.1.04.01' || ((c.nome_conta || '').toLowerCase().includes('empréstimos') && (c.grupo || '').includes('Circulante')))?.id;
    const idEmprestimoLP = contasSafe.find(c => c.codigo_contabil === '2.2.01.01' || ((c.nome_conta || '').toLowerCase().includes('financiamentos') && (c.grupo || '').includes('Não Circulante')))?.id || idEmprestimoCP;
    const idJurosTranscorrerCP = contasSafe.find(c => (c.nome_conta || '').toLowerCase().includes('juros a transcorrer') && (c.grupo || '').includes('Circulante'))?.id || idEmprestimoCP;

    // Lançamento 1: Entrada do principal no Banco vs Empréstimo a Pagar CP
    registrarFatoGerador(`Liberação de Empréstimo (${bancoNome}) - CP`, totais.curtoPrazoPrincipal + totais.curtoPrazoJuros, 'Financiamentos', [idBanco], [idEmprestimoCP]);

    // Lançamento 2: Redutora de Juros CP
    if (totais.curtoPrazoJuros > 0) {
      registrarFatoGerador(`Juros a Transcorrer (CP) - ${bancoNome}`, totais.curtoPrazoJuros, 'Financiamentos', [idJurosTranscorrerCP], [idBanco]);
    }

    // Lançamento 3: Longo Prazo
    if (totais.longoPrazoPrincipal > 0) {
      registrarFatoGerador(`Apropriação de Empréstimo (${bancoNome}) - LP`, totais.longoPrazoPrincipal, 'Financiamentos', [idBanco], [idEmprestimoLP]);
    }

    if (mostrarToast) mostrarToast('Contrato formalizado no Livro Diário!', 'sucesso');
  };

  const handlePagarParcela = () => {
    if (typeof registrarFatoGerador !== 'function') return;
    if (totais.parcelaInicial <= 0) return alert('Calcule as parcelas primeiro.');

    const contasSafe = planoContas || [];
    const idBanco = contasSafe.find(c => c.codigo_contabil === '1.1.01.02' || (c.nome_conta || '').toLowerCase().includes('banco'))?.id;
    const idEmprestimoCP = contasSafe.find(c => c.codigo_contabil === '2.1.04.01' || ((c.nome_conta || '').toLowerCase().includes('empréstimos') && (c.grupo || '').includes('Circulante')))?.id;
    const idDespesaJuros = contasSafe.find(c => c.codigo_contabil === '5.2.03.01' || (c.nome_conta || '').toLowerCase().includes('despesas financeiras'))?.id;
    const idJurosTranscorrerCP = contasSafe.find(c => (c.nome_conta || '').toLowerCase().includes('juros a transcorrer') && (c.grupo || '').includes('Circulante'))?.id || idEmprestimoCP;

    // Amortização
    registrarFatoGerador(`Pagamento de Parcela (${bancoNome}) - Amortização`, totais.primeiroMesAmortizacao, 'Financiamentos', [idEmprestimoCP], [idBanco]);

    // Apropriação da Despesa Financeira
    if (totais.primeiroMesJuros > 0) {
      registrarFatoGerador(`Despesa Financeira Juros (${bancoNome})`, totais.primeiroMesJuros, 'Financiamentos', [idDespesaJuros], [idJurosTranscorrerCP]);
    }

    if (mostrarToast) mostrarToast('Pagamento e Juros contabilizados no Diário!', 'sucesso');
  };

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🏦</span> Simulador de Empréstimos & Financiamentos Bancários
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Captação de recursos, juros a transcorrer e segregação entre Curto Prazo (PC) e Longo Prazo (PNC).
          </p>
        </div>

        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0', gap: '4px' }}>
          <button 
            onClick={() => setSistemaAmortizacao('price')}
            style={{ 
              padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: sistemaAmortizacao === 'price' ? '#2563eb' : 'transparent', 
              color: sistemaAmortizacao === 'price' ? 'white' : '#64748b'
            }}
          >
            Tabela Price (Parcelas Fixas)
          </button>
          <button 
            onClick={() => setSistemaAmortizacao('sac')}
            style={{ 
              padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: sistemaAmortizacao === 'sac' ? '#2563eb' : 'transparent', 
              color: sistemaAmortizacao === 'sac' ? 'white' : '#64748b'
            }}
          >
            Tabela SAC (Amortização Constante)
          </button>
        </div>
      </div>

      {/* DASHBOARDS DE SEGREGAÇÃO CONTÁBIL */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #16a34a' }}>
          <span style={{ color: '#166534', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Recurso Liberado (Banco)</span>
          <strong style={{ display: 'block', color: '#15803d', fontSize: '24px', marginTop: '4px' }}>
            {formatMoeda(parseFloat(valorLiberadoStr) || 0)}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Entrada no Ativo Circulante</span>
        </div>

        <div style={{ backgroundColor: '#eff6ff', padding: '18px', borderRadius: '12px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb' }}>
          <span style={{ color: '#1d4ed8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Passivo Circulante (Até 12 meses)</span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '24px', marginTop: '4px' }}>
            {formatMoeda(totais.curtoPrazoPrincipal + totais.curtoPrazoJuros)}
          </strong>
          <span style={{ fontSize: '11px', color: '#2563eb' }}>
            Principal: {formatMoeda(totais.curtoPrazoPrincipal)}
          </span>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #64748b' }}>
          <span style={{ color: '#475569', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Não Circulante (Após 12 meses)</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '24px', marginTop: '4px' }}>
            {formatMoeda(totais.longoPrazoPrincipal + totais.longoPrazoJuros)}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            {parseInt(prazoMesesStr, 10) > 12 ? 'Obrigações de Longo Prazo' : 'Inexistente (Prazo <= 12m)'}
          </span>
        </div>

        <div style={{ backgroundColor: '#fff5f5', padding: '18px', borderRadius: '12px', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444' }}>
          <span style={{ color: '#991b1b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Juros a Transcorrer (Redutora)</span>
          <strong style={{ display: 'block', color: '#dc2626', fontSize: '24px', marginTop: '4px' }}>
            {formatMoeda(totais.totalJuros)}
          </strong>
          <span style={{ fontSize: '11px', color: '#991b1b' }}>Encargos a vencer</span>
        </div>
      </div>

      {/* ÁREA DE CONFIGURAÇÃO E MAPA CONTÁBIL */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '25px' }}>
        
        {/* PARÂMETROS DO CONTRATO (COM ID, NAME, HTMLFOR - SEM AVISOS) */}
        <div style={{ flex: '1 1 340px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
            Condições da Operação
          </h3>

          <label htmlFor="bancoNome" style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
            Instituição Financeira Concedente:
            <input 
              id="bancoNome" name="bancoNome" autoComplete="off"
              type="text" 
              value={bancoNome} 
              onChange={e => setBancoNome(e.target.value)} 
              style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
            />
          </label>

          <label htmlFor="valorLiberado" style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>
            Valor Liberado em Conta Corrente (R$):
            <input 
              id="valorLiberado" name="valorLiberado" autoComplete="off"
              type="text" 
              value={valorLiberadoStr} 
              onChange={e => setValorLiberadoStr(e.target.value.replace(/[^0-9.]/g, ''))} 
              style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
            />
          </label>

          <div style={{ display: 'flex', gap: '10px' }}>
            <label htmlFor="taxaJuros" style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Taxa de Juros (% a.m.):
              <input 
                id="taxaJuros" name="taxaJuros" autoComplete="off"
                type="text" 
                value={taxaJurosMensalStr} 
                onChange={e => setTaxaJurosMensalStr(e.target.value.replace(/[^0-9.]/g, ''))} 
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
              />
            </label>

            <label htmlFor="prazoMeses" style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
              Prazo Total (Meses):
              <input 
                id="prazoMeses" name="prazoMeses" autoComplete="off"
                type="text" 
                value={prazoMesesStr} 
                onChange={e => setPrazoMesesStr(e.target.value.replace(/[^0-9]/g, ''))} 
                style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
              />
            </label>
          </div>

          <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', color: '#64748b' }}>
            📌 <strong>Regra Contábil da Segregação:</strong> As parcelas que vencem até o término do exercício social seguinte (ou até 12 meses da data do balanço) são alocadas no <strong>Passivo Circulante</strong>. As parcelas posteriores a 12 meses são registradas no <strong>Passivo Não Circulante</strong>.
          </div>
        </div>

        {/* MAPA DE LANÇAMENTOS NO LIVRO DIÁRIO (INTEGRADOS) */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🧭</span> 1. Registro Inicial da Captação
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontFamily: 'monospace' }}>
                <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '6px', borderLeft: '4px solid #2563eb' }}>
                  <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Banco Conta Movimento (Ativo Circulante) ..... {formatMoeda(parseFloat(valorLiberadoStr) || 0)}</div>
                  <div style={{ color: '#059669', fontWeight: 'bold', marginTop: '4px' }}>D: Juros a Transcorrer - CP (Passivo Redutora) .. {formatMoeda(totais.curtoPrazoJuros)}</div>
                  {totais.longoPrazoJuros > 0 && (
                    <div style={{ color: '#059669', fontWeight: 'bold' }}>D: Juros a Transcorrer - LP (Passivo Redutora) .. {formatMoeda(totais.longoPrazoJuros)}</div>
                  )}
                  <div style={{ color: '#dc2626', fontWeight: 'bold', marginTop: '6px' }}>C: Empréstimos a Pagar - CP (Passivo Circulante) {formatMoeda(totais.curtoPrazoPrincipal + totais.curtoPrazoJuros)}</div>
                  {totais.longoPrazoPrincipal > 0 && (
                    <div style={{ color: '#dc2626', fontWeight: 'bold' }}>C: Empréstimos a Pagar - LP (Passivo Não Circ.) {formatMoeda(totais.longoPrazoPrincipal + totais.longoPrazoJuros)}</div>
                  )}
                </div>
              </div>
            </div>
            
            <button onClick={handleContratarEmprestimo} style={{ marginTop: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Contratar e Escriturar Captação 📥
            </button>
          </div>

          <div style={{ backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #86efac', padding: '18px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#166534', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🧭</span> 2. Pagamento e Apropriação da 1ª Parcela
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '11px', fontFamily: 'monospace' }}>
                <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '6px', borderLeft: '3px solid #16a34a' }}>
                  <span style={{ fontWeight: 'bold', color: '#166534', display: 'block' }}>Amortização / Baixa da Parcela:</span>
                  <div>D: Empréstimos a Pagar (Passivo Circulante) .. {formatMoeda(totais.primeiroMesAmortizacao)}</div>
                  <div>C: Banco Conta Movimento (Ativo Circulante) ... {formatMoeda(totais.parcelaInicial)}</div>
                </div>
                <div style={{ padding: '8px', backgroundColor: 'white', borderRadius: '6px', borderLeft: '3px solid #16a34a' }}>
                  <span style={{ fontWeight: 'bold', color: '#166534', display: 'block' }}>Reconhecimento da Despesa Financeira:</span>
                  <div>D: Despesas c/ Juros Passivos (DRE) ........... {formatMoeda(totais.primeiroMesJuros)}</div>
                  <div>C: Juros a Transcorrer - CP (Passivo Redutora) {formatMoeda(totais.primeiroMesJuros)}</div>
                </div>
              </div>
            </div>

            <button onClick={handlePagarParcela} style={{ marginTop: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Pagar e Apropriar Juros (DRE) 📉
            </button>
          </div>

        </div>

      </div>

      {/* TABELA DE CRONOGRAMA DE VENCIMENTOS */}
      <div style={{ border: '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '14px' }}>Cronograma de Amortização & Classificação Contábil</h3>
          <span style={{ fontSize: '11px', color: '#94a3b8' }}>{cronograma.length} parcelas</span>
        </div>

        <div style={{ overflowX: 'auto', maxHeight: '350px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'right' }}>
            <thead style={{ backgroundColor: '#f8fafc', color: '#475569', position: 'sticky', top: 0 }}>
              <tr>
                <th style={{ padding: '10px', textAlign: 'center' }}>Mês</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Classificação</th>
                <th style={{ padding: '10px' }}>Parcela Total</th>
                <th style={{ padding: '10px', color: '#166534' }}>Amortização (Principal)</th>
                <th style={{ padding: '10px', color: '#dc2626' }}>Juros (Despesa)</th>
                <th style={{ padding: '10px', color: '#1e40af' }}>Saldo Devedor</th>
              </tr>
            </thead>
            <tbody>
              {cronograma.map(row => (
                <tr key={row.mes} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: row.mes <= 12 ? 'white' : '#f8fafc' }}>
                  <td style={{ padding: '8px 10px', textAlign: 'center', fontWeight: 'bold' }}>{row.mes}º</td>
                  <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                    <span style={{ 
                      fontSize: '10px', 
                      fontWeight: 'bold', 
                      padding: '2px 8px', 
                      borderRadius: '12px',
                      backgroundColor: row.mes <= 12 ? '#eff6ff' : '#f1f5f9',
                      color: row.mes <= 12 ? '#1d4ed8' : '#475569',
                      border: `1px solid ${row.mes <= 12 ? '#bfdbfe' : '#cbd5e1'}`
                    }}>
                      {row.classificacao}
                    </span>
                  </td>
                  <td style={{ padding: '8px 10px', fontWeight: 'bold' }}>{formatMoeda(row.parcela)}</td>
                  <td style={{ padding: '8px 10px', color: '#166534' }}>{formatMoeda(row.amortizacao)}</td>
                  <td style={{ padding: '8px 10px', color: '#dc2626' }}>{formatMoeda(row.juros)}</td>
                  <td style={{ padding: '8px 10px', fontWeight: 'bold', color: '#1e40af' }}>{formatMoeda(row.saldoDevedor)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}