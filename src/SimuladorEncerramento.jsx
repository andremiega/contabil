import React, { useState, useEffect, useMemo } from 'react';

export default function SimuladorEncerramento({ historico = [], planoContas = [], registrarFatoGerador, mostrarToast }) {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const [processando, setProcessando] = useState(false);

  // ==========================================================
  // MOTOR DE APURAÇÃO (Varre o Diário e calcula os saldos)
  // ==========================================================
  const apuracao = useMemo(() => {
    let totalReceitas = 0;
    let totalDespesas = 0;
    const contasParaZerar = { receitas: [], despesas: [] };

    planoContas.forEach(conta => {
      // Identifica se a conta é de Resultado (DRE)
      const isReceita = (conta.grupo || '').includes('Receita') || (conta.nome_conta || '').toLowerCase().includes('receita');
      const isDespesa = (conta.grupo || '').includes('Despesa') || (conta.grupo || '').includes('Custos') || (conta.nome_conta || '').toLowerCase().includes('custo');

      if (isReceita || isDespesa) {
        // Soma débitos e créditos desta conta no histórico
        const debitos = historico.filter(l => l.debito === conta.codigo_contabil).reduce((acc, l) => acc + l.valor, 0);
        const creditos = historico.filter(l => l.credito === conta.codigo_contabil).reduce((acc, l) => acc + l.valor, 0);
        const saldoAbsoluto = Math.abs(creditos - debitos);

        // Só nos interessam as contas que ainda têm saldo (não foram zeradas)
        if (saldoAbsoluto > 0) {
          if (isReceita) {
            totalReceitas += saldoAbsoluto;
            contasParaZerar.receitas.push({ ...conta, saldo: saldoAbsoluto, naturezaOriginal: 'credora' });
          } else if (isDespesa) {
            totalDespesas += saldoAbsoluto;
            contasParaZerar.despesas.push({ ...conta, saldo: saldoAbsoluto, naturezaOriginal: 'devedora' });
          }
        }
      }
    });

    const resultadoLiquido = totalReceitas - totalDespesas;

    return { totalReceitas, totalDespesas, resultadoLiquido, contasParaZerar };
  }, [historico, planoContas]);

  // ==========================================================
  // AÇÃO: PROCESSAR ZERAMENTO (GERAR FATOS CONTÁBEIS)
  // ==========================================================
  const handleEncerrarExercicio = async () => {
    if (apuracao.totalReceitas === 0 && apuracao.totalDespesas === 0) {
      return alert('Não há saldos nas contas de resultado para encerrar. O exercício já está zerado ou não teve movimento.');
    }

    if (!window.confirm('Atenção: Esta ação vai zerar as contas de DRE e transferir o saldo para o Patrimônio Líquido. Deseja continuar?')) return;

    setProcessando(true);

    if (typeof registrarFatoGerador === 'function') {
      // Localiza contas transitórias e de PL
      const idARE = planoContas.find(c => c.nome_conta.toLowerCase().includes('apuração') || c.nome_conta.toLowerCase().includes('are'))?.id || planoContas.find(c => c.grupo.includes('Patrimônio'))?.id;
      const idLucros = planoContas.find(c => c.nome_conta.toLowerCase().includes('lucros') || c.nome_conta.toLowerCase().includes('prejuízos'))?.id;

      // 1. Zera Receitas (Débito nas Receitas, Crédito em ARE)
      for (const contaRec of apuracao.contasParaZerar.receitas) {
        await registrarFatoGerador(
          `Zeramento de Receitas p/ Apuração do Resultado (ARE) - ${contaRec.nome_conta}`,
          contaRec.saldo,
          'Encerramento (ARE)',
          [contaRec.id], // Débito (zera a conta credora)
          [idARE]        // Crédito (transfere p/ ARE)
        );
      }

      // 2. Zera Despesas/Custos (Débito em ARE, Crédito nas Despesas)
      for (const contaDesp of apuracao.contasParaZerar.despesas) {
        await registrarFatoGerador(
          `Zeramento de Despesas/Custos p/ Apuração (ARE) - ${contaDesp.nome_conta}`,
          contaDesp.saldo,
          'Encerramento (ARE)',
          [idARE],         // Débito (despesa diminui ARE)
          [contaDesp.id]   // Crédito (zera a conta devedora)
        );
      }

      // 3. Transfere Resultado da ARE para Lucros/Prejuízos Acumulados no PL
      const absResultado = Math.abs(apuracao.resultadoLiquido);
      if (absResultado > 0) {
        if (apuracao.resultadoLiquido > 0) {
          // Deu Lucro
          await registrarFatoGerador(
            'Transferência do Lucro Líquido do Exercício para o Patrimônio Líquido',
            absResultado,
            'Encerramento (ARE)',
            [idARE],    // Débito na ARE (zera)
            [idLucros]  // Crédito em Lucros Acumulados (aumenta o PL)
          );
        } else {
          // Deu Prejuízo
          await registrarFatoGerador(
            'Transferência do Prejuízo Líquido do Exercício para o Patrimônio Líquido',
            absResultado,
            'Encerramento (ARE)',
            [idLucros], // Débito em Prejuízos Acumulados (diminui o PL)
            [idARE]     // Crédito na ARE (zera)
          );
        }
      }

      if (mostrarToast) mostrarToast('Exercício encerrado com sucesso! Contas de resultado zeradas e Balanço atualizado.', 'sucesso');
    }
    setProcessando(false);
  };

  const isZerado = apuracao.totalReceitas === 0 && apuracao.totalDespesas === 0;

  return (
    <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🏁</span> Encerramento do Exercício (Zeramento)
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Apuração do Resultado do Exercício (ARE). As contas do grupo DRE serão zeradas e o saldo transferido ao Patrimônio Líquido.
          </p>
        </div>
        <div style={{ backgroundColor: isZerado ? '#f0fdf4' : '#fff5f5', color: isZerado ? '#166534' : '#991b1b', padding: '8px 16px', borderRadius: '8px', border: `1px solid ${isZerado ? '#86efac' : '#fecaca'}`, fontWeight: 'bold', fontSize: '12px' }}>
          Status: {isZerado ? '✅ Exercício Já Encerrado' : '⏳ Aguardando Zeramento'}
        </div>
      </div>

      {/* DASHBOARDS DE RESULTADO ATUAL */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        
        <div style={{ backgroundColor: '#f0fdf4', padding: '20px', borderRadius: '12px', border: '1px solid #86efac' }}>
          <span style={{ color: '#166534', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Total de Receitas (A Zerar)</span>
          <strong style={{ display: 'block', color: '#15803d', fontSize: '28px', marginTop: '4px' }}>
            {formatMoeda(apuracao.totalReceitas)}
          </strong>
        </div>

        <div style={{ backgroundColor: '#fef2f2', padding: '20px', borderRadius: '12px', border: '1px solid #fca5a5' }}>
          <span style={{ color: '#991b1b', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>Total de Despesas/Custos</span>
          <strong style={{ display: 'block', color: '#dc2626', fontSize: '28px', marginTop: '4px' }}>
            {formatMoeda(apuracao.totalDespesas)}
          </strong>
        </div>

        <div style={{ backgroundColor: apuracao.resultadoLiquido >= 0 ? '#eff6ff' : '#fffbeb', padding: '20px', borderRadius: '12px', border: `1px solid ${apuracao.resultadoLiquido >= 0 ? '#bfdbfe' : '#fde68a'}`, boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
          <span style={{ color: apuracao.resultadoLiquido >= 0 ? '#1d4ed8' : '#92400e', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {apuracao.resultadoLiquido >= 0 ? 'Lucro Líquido Apurado' : 'Prejuízo Líquido Apurado'}
          </span>
          <strong style={{ display: 'block', color: apuracao.resultadoLiquido >= 0 ? '#1e40af' : '#b45309', fontSize: '28px', marginTop: '4px' }}>
            {formatMoeda(apuracao.resultadoLiquido)}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '4px' }}>A ser transferido para o PL</span>
        </div>
      </div>

      {/* DETALHAMENTO DAS CONTAS A ZERAR */}
      {!isZerado && (
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '25px' }}>
          <h3 style={{ margin: '0 0 15px 0', fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px' }}>
            Visualização das Partidas de Zeramento
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Lado das Receitas */}
            <div>
              <strong style={{ display: 'block', color: '#16a34a', fontSize: '12px', marginBottom: '10px' }}>▼ Contas de Receita (Débito p/ Zerar)</strong>
              {apuracao.contasParaZerar.receitas.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px', borderBottom: '1px dashed #cbd5e1' }}>
                  <span>{c.nome_conta}</span>
                  <strong style={{ color: '#16a34a' }}>{formatMoeda(c.saldo)}</strong>
                </div>
              ))}
            </div>

            {/* Lado das Despesas */}
            <div>
              <strong style={{ display: 'block', color: '#dc2626', fontSize: '12px', marginBottom: '10px' }}>▼ Contas de Despesa/Custo (Crédito p/ Zerar)</strong>
              {apuracao.contasParaZerar.despesas.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px', borderBottom: '1px dashed #cbd5e1' }}>
                  <span>{c.nome_conta}</span>
                  <strong style={{ color: '#dc2626' }}>{formatMoeda(c.saldo)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BOTÃO DE AÇÃO */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
        <button 
          onClick={handleEncerrarExercicio}
          disabled={isZerado || processando}
          style={{ 
            backgroundColor: isZerado ? '#94a3b8' : '#0f172a', color: 'white', border: 'none', padding: '14px 28px', 
            borderRadius: '8px', fontSize: '14px', fontWeight: '900', cursor: isZerado || processando ? 'not-allowed' : 'pointer', 
            boxShadow: isZerado ? 'none' : '0 4px 15px rgba(15,23,42,0.3)', transition: 'transform 0.1s' 
          }}
          onMouseDown={e => { if(!isZerado) e.currentTarget.style.transform = 'scale(0.96)'; }}
          onMouseUp={e => { if(!isZerado) e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {processando ? 'Apurando Resultados...' : isZerado ? 'Exercício Finalizado' : 'Processar Zeramento e Encerrar Exercício 🏁'}
        </button>
      </div>

    </div>
  );
}