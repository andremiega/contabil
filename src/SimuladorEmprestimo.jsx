import React, { useState, useEffect, useMemo } from 'react';

export default function SimuladorEmprestimo({ mostrarToast, registrarFatoGerador, planoContas = [] }) {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Inputs em String para não travar o zero no Backspace
  const [bancoNome, setBancoNome] = useState('Banco Itaú Unibanco S/A');
  const [valorLiberadoStr, setValorLiberadoStr] = useState('100000'); 
  const [taxaJurosMensalStr, setTaxaJurosMensalStr] = useState('2.0'); 
  const [prazoMesesStr, setPrazoMesesStr] = useState('24'); 
  const [sistemaAmortizacao, setSistemaAmortizacao] = useState('price'); 

  // Motor Matemático Anti-Crash (useMemo)
  const { totais, cronograma } = useMemo(() => {
    const C = parseFloat(valorLiberadoStr) || 0;
    const i = (parseFloat(taxaJurosMensalStr) || 0) / 100;
    let n = parseInt(prazoMesesStr, 10) || 0;

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

  const handleContratarEmprestimo = () => {
    if (typeof registrarFatoGerador !== 'function') return;
    const C = parseFloat(valorLiberadoStr) || 0;
    if (C <= 0) return alert('O valor do empréstimo deve ser maior que zero.');

    const contasSafe = planoContas || [];
    const idBanco = contasSafe.find(c => c.codigo_contabil === '1.1.01.02' || (c.nome_conta || '').toLowerCase().includes('banco'))?.id;
    const idEmprestimoCP = contasSafe.find(c => c.codigo_contabil === '2.1.04.01' || ((c.nome_conta || '').toLowerCase().includes('empréstimos') && (c.grupo || '').includes('Circulante')))?.id;
    const idEmprestimoLP = contasSafe.find(c => c.codigo_contabil === '2.2.01.01' || ((c.nome_conta || '').toLowerCase().includes('financiamentos') && (c.grupo || '').includes('Não Circulante')))?.id || idEmprestimoCP;
    const idJurosTranscorrerCP = contasSafe.find(c => (c.nome_conta || '').toLowerCase().includes('juros a transcorrer') && (c.grupo || '').includes('Circulante'))?.id || idEmprestimoCP;

    registrarFatoGerador(`Liberação de Empréstimo (${bancoNome}) - CP`, totais.curtoPrazoPrincipal + totais.curtoPrazoJuros, 'Financiamentos', [idBanco], [idEmprestimoCP]);

    if (totais.curtoPrazoJuros > 0) {
      registrarFatoGerador(`Juros a Transcorrer (CP) - ${bancoNome}`, totais.curtoPrazoJuros, 'Financiamentos', [idJurosTranscorrerCP], [idBanco]);
    }

    if (totais.longoPrazoPrincipal > 0) {
      registrarFatoGerador(`Apropriação de Empréstimo (${bancoNome}) - LP`, totais.longoPrazoPrincipal, 'Financiamentos', [idBanco], [idEmprestimoLP]);
    }

    if (typeof mostrarToast === 'function') mostrarToast('Contrato formalizado no Livro Diário!', 'sucesso');
  };

  const handlePagarParcela = () => {
    if (typeof registrarFatoGerador !== 'function') return;
    if (totais.parcelaInicial <= 0) return alert('Calcule as parcelas primeiro.');

    const contasSafe = planoContas || [];
    const idBanco = contasSafe.find(c => c.codigo_contabil === '1.1.01.02' || (c.nome_conta || '').toLowerCase().includes('banco'))?.id;
    const idEmprestimoCP = contasSafe.find(c => c.codigo_contabil === '2.1.04.01' || ((c.nome_conta || '').toLowerCase().includes('empréstimos') && (c.grupo || '').includes('Circulante')))?.id;
    const idDespesaJuros = contasSafe.find(c => c.codigo_contabil === '5.2.03.01' || (c.nome_conta || '').toLowerCase().includes('despesas financeiras'))?.id;
    const idJurosTranscorrerCP = contasSafe.find(c => (c.nome_conta || '').toLowerCase().includes('juros a transcorrer') && (c.grupo || '').includes('Circulante'))?.id || idEmprestimoCP;

    registrarFatoGerador(`Pagamento de Parcela (${bancoNome}) - Amortização`, totais.primeiroMesAmortizacao, 'Financiamentos', [idEmprestimoCP], [idBanco]);

    if (totais.primeiroMesJuros > 0) {
      registrarFatoGerador(`Despesa Financeira Juros (${bancoNome})`, totais.primeiroMesJuros, 'Financiamentos', [idDespesaJuros], [idJurosTranscorrerCP]);
    }

    if (typeof mostrarToast === 'function') mostrarToast('Pagamento e Juros contabilizados no Diário!', 'sucesso');
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
            <span style={{ fontSize: '24px' }}>🏦</span> Simulador de Empréstimos & Financiamentos Bancários
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px', wordBreak: 'break-word' }}>
            Captação de recursos, juros a transcorrer e segregação entre Curto Prazo (PC) e Longo Prazo (PNC).
          </p>
        </div>

        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '4px', boxSizing: 'border-box' }}>
          <button 
            onClick={() => setSistemaAmortizacao('price')}
            style={{ 
              padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: sistemaAmortizacao === 'price' ? '#2563eb' : 'transparent', 
              color: sistemaAmortizacao === 'price' ? 'white' : '#64748b'
            }}
          >
            Tabela Price
          </button>
          <button 
            onClick={() => setSistemaAmortizacao('sac')}
            style={{ 
              padding: '8px 12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', transition: 'all 0.2s',
              backgroundColor: sistemaAmortizacao === 'sac' ? '#2563eb' : 'transparent', 
              color: sistemaAmortizacao === 'sac' ? 'white' : '#64748b'
            }}
          >
            Tabela SAC
          </button>
        </div>
      </div>

      {/* DASHBOARDS DE SEGREGAÇÃO CONTÁBIL */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', marginBottom: '20px', boxSizing: 'border-box' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #16a34a', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#166534', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Recurso Liberado (Banco)</span>
          <strong style={{ display: 'block', color: '#15803d', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {formatMoeda(parseFloat(valorLiberadoStr) || 0)}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>Entrada no Ativo Circulante</span>
        </div>

        <div style={{ backgroundColor: '#eff6ff', padding: '16px', borderRadius: '16px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#1d4ed8', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Passivo Circulante (&lt;= 12m)</span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {formatMoeda(totais.curtoPrazoPrincipal + totais.curtoPrazoJuros)}
          </strong>
          <span style={{ fontSize: '11px', color: '#2563eb', wordBreak: 'break-word' }}>
            Principal: {formatMoeda(totais.curtoPrazoPrincipal)}
          </span>
        </div>

        <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0', borderLeft: '4px solid #64748b', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#475569', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Não Circulante (&gt; 12m)</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {formatMoeda(totais.longoPrazoPrincipal + totais.longoPrazoJuros)}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-word' }}>
            {parseInt(prazoMesesStr, 10) > 12 ? 'Longo Prazo' : 'Inexistente'}
          </span>
        </div>

        <div style={{ backgroundColor: '#fff5f5', padding: '16px', borderRadius: '16px', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#991b1b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Juros a Transcorrer (Redutora)</span>
          <strong style={{ display: 'block', color: '#dc2626', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {formatMoeda(totais.totalJuros)}
          </strong>
          <span style={{ fontSize: '11px', color: '#991b1b', wordBreak: 'break-word' }}>Encargos a vencer</span>
        </div>
      </div>

      {/* ÁREA DE CONFIGURAÇÃO E MAPA CONTÁBIL */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', marginBottom: '20px', boxSizing: 'border-box' }}>
        
        {/* PARÂMETROS DO CONTRATO */}
        <div style={cardStyle}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', wordBreak: 'break-word' }}>
            Condições da Operação
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px', boxSizing: 'border-box' }}>
            <div style={{ minWidth: 0 }}>
              <label htmlFor="bancoNome" style={labelStyle}>Instituição Financeira Concedente:</label>
              <input id="bancoNome" name="bancoNome" autoComplete="off" type="text" value={bancoNome} onChange={e => setBancoNome(e.target.value)} style={inputStyle} />
            </div>

            <div style={{ minWidth: 0 }}>
              <label htmlFor="valorLiberado" style={labelStyle}>Valor Liberado em Conta (R$):</label>
              <input id="valorLiberado" name="valorLiberado" autoComplete="off" type="text" value={valorLiberadoStr} onChange={e => setValorLiberadoStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <label htmlFor="taxaJuros" style={labelStyle}>Taxa de Juros (% a.m.):</label>
                <input id="taxaJuros" name="taxaJuros" autoComplete="off" type="text" value={taxaJurosMensalStr} onChange={e => setTaxaJurosMensalStr(e.target.value.replace(/[^0-9.]/g, ''))} style={inputStyle} />
              </div>
              <div style={{ minWidth: 0 }}>
                <label htmlFor="prazoMeses" style={labelStyle}>Prazo (Meses):</label>
                <input id="prazoMeses" name="prazoMeses" autoComplete="off" type="text" value={prazoMesesStr} onChange={e => setPrazoMesesStr(e.target.value.replace(/[^0-9]/g, ''))} style={inputStyle} />
              </div>
            </div>

            <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11.5px', color: '#64748b', lineHeight: '1.4', boxSizing: 'border-box', wordBreak: 'break-word' }}>
              📌 <strong>Regra Contábil da Segregação:</strong> Parcelas que vencem em até 12 meses vão para o <strong>Passivo Circulante</strong>. As posteriores vão para o <strong>Passivo Não Circulante</strong>.
            </div>
          </div>
        </div>

        {/* MAPA DE LANÇAMENTOS NO LIVRO DIÁRIO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, boxSizing: 'border-box' }}>
          
          <div style={{ backgroundColor: '#eff6ff', borderRadius: '16px', border: '1px solid #bfdbfe', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', minWidth: 0 }}>
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '13.5px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px', wordBreak: 'break-word' }}>
                <span>🧭</span> 1. Registro Inicial da Captação
              </h3>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', boxSizing: 'border-box', wordBreak: 'break-word' }}>
                <div style={{ color: '#059669', fontWeight: 'bold', wordBreak: 'break-word' }}>D: Banco Conta Movimento (Ativo) ... {formatMoeda(parseFloat(valorLiberadoStr) || 0)}</div>
                <div style={{ color: '#059669', fontWeight: 'bold', wordBreak: 'break-word' }}>D: Juros a Transcorrer - CP (Redutora) . {formatMoeda(totais.curtoPrazoJuros)}</div>
                {totais.longoPrazoJuros > 0 && <div style={{ color: '#059669', fontWeight: 'bold', wordBreak: 'break-word' }}>D: Juros a Transcorrer - LP (Redutora) . {formatMoeda(totais.longoPrazoJuros)}</div>}
                <div style={{ color: '#dc2626', fontWeight: 'bold', marginTop: '4px', wordBreak: 'break-word' }}>C: Empréstimos a Pagar - CP ......... {formatMoeda(totais.curtoPrazoPrincipal + totais.curtoPrazoJuros)}</div>
                {totais.longoPrazoPrincipal > 0 && <div style={{ color: '#dc2626', fontWeight: 'bold', wordBreak: 'break-word' }}>C: Empréstimos a Pagar - LP ......... {formatMoeda(totais.longoPrazoPrincipal + totais.longoPrazoJuros)}</div>}
              </div>
            </div>
            <button onClick={handleContratarEmprestimo} style={{ marginTop: '12px', backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box', width: '100%', fontSize: '12.5px' }}>
              Contratar e Escriturar Captação 📥
            </button>
          </div>

          <div style={{ backgroundColor: '#f0fdf4', borderRadius: '16px', border: '1px solid #86efac', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', minWidth: 0 }}>
            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: '13.5px', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px', wordBreak: 'break-word' }}>
                <span>🧭</span> 2. Pagamento e Apropriação da 1ª Parcela
              </h3>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', boxSizing: 'border-box', wordBreak: 'break-word' }}>
                <div style={{ color: '#166534', fontWeight: 'bold', wordBreak: 'break-word' }}>D: Empréstimos a Pagar (Amortização) .. {formatMoeda(totais.primeiroMesAmortizacao)}</div>
                <div style={{ color: '#166534', fontWeight: 'bold', wordBreak: 'break-word' }}>D: Desp. c/ Juros Passivos (DRE) ...... {formatMoeda(totais.primeiroMesJuros)}</div>
                <div style={{ color: '#dc2626', fontWeight: 'bold', marginTop: '4px', wordBreak: 'break-word' }}>C: Banco Conta Movimento (Parcela) .... {formatMoeda(totais.parcelaInicial)}</div>
                <div style={{ color: '#dc2626', fontWeight: 'bold', wordBreak: 'break-word' }}>C: Juros a Transcorrer - CP (Baixa) ... {formatMoeda(totais.primeiroMesJuros)}</div>
              </div>
            </div>
            <button onClick={handlePagarParcela} style={{ marginTop: '12px', backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box', width: '100%', fontSize: '12.5px' }}>
              Pagar e Apropriar Juros (DRE) 📉
            </button>
          </div>

        </div>

      </div>

      {/* TABELA DE CRONOGRAMA DE VENCIMENTOS */}
      <div style={{ border: '1px solid #cbd5e1', borderRadius: '16px', overflow: 'hidden', backgroundColor: 'white', boxSizing: 'border-box' }}>
        <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px', boxSizing: 'border-box' }}>
          <h3 style={{ margin: 0, fontSize: '15px', wordBreak: 'break-word' }}>Cronograma de Amortização & Classificação Contábil</h3>
          <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>{cronograma.length} parcelas</span>
        </div>

        <div style={{ overflowX: 'auto', maxHeight: '350px', boxSizing: 'border-box' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'right', minWidth: '600px' }}>
            <thead style={{ backgroundColor: '#f8fafc', color: '#475569', position: 'sticky', top: 0 }}>
              <tr>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Mês</th>
                <th style={{ padding: '10px 14px', textAlign: 'center' }}>Classificação</th>
                <th style={{ padding: '10px 14px' }}>Parcela Total</th>
                <th style={{ padding: '10px 14px', color: '#166534' }}>Amortização</th>
                <th style={{ padding: '10px 14px', color: '#dc2626' }}>Juros (DRE)</th>
                <th style={{ padding: '10px 14px', color: '#1e40af' }}>Saldo Devedor</th>
              </tr>
            </thead>
            <tbody>
              {cronograma.map(row => (
                <tr key={row.mes} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: row.mes <= 12 ? 'white' : '#f8fafc' }}>
                  <td style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{row.mes}º</td>
                  <td style={{ padding: '10px 14px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <span style={{ 
                      fontSize: '10.5px', 
                      fontWeight: 'bold', 
                      padding: '3px 8px', 
                      borderRadius: '12px',
                      backgroundColor: row.mes <= 12 ? '#eff6ff' : '#f1f5f9',
                      color: row.mes <= 12 ? '#1d4ed8' : '#475569',
                      border: `1px solid ${row.mes <= 12 ? '#bfdbfe' : '#cbd5e1'}`
                    }}>
                      {row.classificacao}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>{formatMoeda(row.parcela)}</td>
                  <td style={{ padding: '10px 14px', color: '#166534', whiteSpace: 'nowrap' }}>{formatMoeda(row.amortizacao)}</td>
                  <td style={{ padding: '10px 14px', color: '#dc2626', whiteSpace: 'nowrap' }}>{formatMoeda(row.juros)}</td>
                  <td style={{ padding: '10px 14px', fontWeight: 'bold', color: '#1e40af', whiteSpace: 'nowrap' }}>{formatMoeda(row.saldoDevedor)}</td>
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