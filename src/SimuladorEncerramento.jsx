import React, { useState, useMemo } from 'react';

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
      const isReceita = (conta.grupo || '').includes('Receita') || (conta.nome_conta || '').toLowerCase().includes('receita');
      const isDespesa = (conta.grupo || '').includes('Despesa') || (conta.grupo || '').includes('Custos') || (conta.nome_conta || '').toLowerCase().includes('custo');

      if (isReceita || isDespesa) {
        const debitos = historico.filter(l => l.debito === conta.codigo_contabil).reduce((acc, l) => acc + l.valor, 0);
        const creditos = historico.filter(l => l.credito === conta.codigo_contabil).reduce((acc, l) => acc + l.valor, 0);
        const saldoAbsoluto = Math.abs(creditos - debitos);

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
      const idARE = planoContas.find(c => c.nome_conta.toLowerCase().includes('apuração') || c.nome_conta.toLowerCase().includes('are'))?.id || planoContas.find(c => c.grupo.includes('Patrimônio'))?.id;
      const idLucros = planoContas.find(c => c.nome_conta.toLowerCase().includes('lucros') || c.nome_conta.toLowerCase().includes('prejuízos'))?.id;

      // 1. Zera Receitas
      for (const contaRec of apuracao.contasParaZerar.receitas) {
        await registrarFatoGerador(
          `Zeramento de Receitas p/ Apuração do Resultado (ARE) - ${contaRec.nome_conta}`,
          contaRec.saldo,
          'Encerramento (ARE)',
          [contaRec.id], 
          [idARE]        
        );
      }

      // 2. Zera Despesas/Custos
      for (const contaDesp of apuracao.contasParaZerar.despesas) {
        await registrarFatoGerador(
          `Zeramento de Despesas/Custos p/ Apuração (ARE) - ${contaDesp.nome_conta}`,
          contaDesp.saldo,
          'Encerramento (ARE)',
          [idARE],         
          [contaDesp.id]   
        );
      }

      // 3. Transfere Resultado da ARE para Lucros/Prejuízos Acumulados no PL
      const absResultado = Math.abs(apuracao.resultadoLiquido);
      if (absResultado > 0) {
        if (apuracao.resultadoLiquido > 0) {
          await registrarFatoGerador(
            'Transferência do Lucro Líquido do Exercício para o PL',
            absResultado,
            'Encerramento (ARE)',
            [idARE],   
            [idLucros] 
          );
        } else {
          await registrarFatoGerador(
            'Transferência do Prejuízo Líquido do Exercício para o PL',
            absResultado,
            'Encerramento (ARE)',
            [idLucros], 
            [idARE]     
          );
        }
      }

      if (typeof mostrarToast === 'function') mostrarToast('Exercício encerrado com sucesso! Contas de resultado zeradas e Balanço atualizado.', 'sucesso');
    }
    setProcessando(false);
  };

  const isZerado = apuracao.totalReceitas === 0 && apuracao.totalDespesas === 0;

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', gap: '15px', boxSizing: 'border-box' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', wordBreak: 'break-word' }}>
            <span style={{ fontSize: '24px' }}>🏁</span> Encerramento do Exercício (Zeramento)
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px', wordBreak: 'break-word' }}>
            Apuração do Resultado do Exercício (ARE). As contas de DRE serão zeradas e transferidas ao PL.
          </p>
        </div>
        <div style={{ backgroundColor: isZerado ? '#f0fdf4' : '#fff5f5', color: isZerado ? '#166534' : '#991b1b', padding: '8px 14px', borderRadius: '10px', border: `1px solid ${isZerado ? '#86efac' : '#fecaca'}`, fontWeight: 'bold', fontSize: '12px', boxSizing: 'border-box' }}>
          Status: {isZerado ? '✅ Exercício Já Encerrado' : '⏳ Aguardando Zeramento'}
        </div>
      </div>

      {/* DASHBOARDS DE RESULTADO ATUAL */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', marginBottom: '20px', boxSizing: 'border-box' }}>
        
        <div style={{ backgroundColor: '#f0fdf4', padding: '16px', borderRadius: '16px', border: '1px solid #86efac', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#166534', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Total de Receitas (A Zerar)</span>
          <strong style={{ display: 'block', color: '#15803d', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {formatMoeda(apuracao.totalReceitas)}
          </strong>
        </div>

        <div style={{ backgroundColor: '#fef2f2', padding: '16px', borderRadius: '16px', border: '1px solid #fca5a5', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: '#991b1b', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Total de Despesas/Custos</span>
          <strong style={{ display: 'block', color: '#dc2626', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {formatMoeda(apuracao.totalDespesas)}
          </strong>
        </div>

        <div style={{ backgroundColor: apuracao.resultadoLiquido >= 0 ? '#eff6ff' : '#fffbeb', padding: '16px', borderRadius: '16px', border: `1px solid ${apuracao.resultadoLiquido >= 0 ? '#bfdbfe' : '#fde68a'}`, boxShadow: '0 4px 10px rgba(0,0,0,0.03)', boxSizing: 'border-box', minWidth: 0 }}>
          <span style={{ color: apuracao.resultadoLiquido >= 0 ? '#1d4ed8' : '#92400e', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {apuracao.resultadoLiquido >= 0 ? 'Lucro Líquido Apurado' : 'Prejuízo Líquido Apurado'}
          </span>
          <strong style={{ display: 'block', color: apuracao.resultadoLiquido >= 0 ? '#1e40af' : '#b45309', fontSize: '22px', marginTop: '4px', wordBreak: 'break-word' }}>
            {formatMoeda(apuracao.resultadoLiquido)}
          </strong>
          <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginTop: '2px', wordBreak: 'break-word' }}>Transferido para o PL</span>
        </div>
      </div>

      {/* DETALHAMENTO DAS CONTAS A ZERAR */}
      {!isZerado && (
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', marginBottom: '20px', boxSizing: 'border-box' }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #e2e8f0', paddingBottom: '8px', wordBreak: 'break-word' }}>
            Visualização das Partidas de Zeramento
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
            <div style={{ minWidth: 0, boxSizing: 'border-box' }}>
              <strong style={{ display: 'block', color: '#16a34a', fontSize: '11.5px', marginBottom: '8px', wordBreak: 'break-word' }}>▼ Contas de Receita (Débito p/ Zerar)</strong>
              {apuracao.contasParaZerar.receitas.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px', borderBottom: '1px dashed #cbd5e1', flexWrap: 'wrap', gap: '4px', boxSizing: 'border-box' }}>
                  <span style={{ wordBreak: 'break-word', minWidth: 0, flex: 1 }}>{c.nome_conta}</span>
                  <strong style={{ color: '#16a34a', wordBreak: 'break-word' }}>{formatMoeda(c.saldo)}</strong>
                </div>
              ))}
            </div>

            <div style={{ minWidth: 0, boxSizing: 'border-box' }}>
              <strong style={{ display: 'block', color: '#dc2626', fontSize: '11.5px', marginBottom: '8px', wordBreak: 'break-word' }}>▼ Contas de Despesa/Custo (Crédito p/ Zerar)</strong>
              {apuracao.contasParaZerar.despesas.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px', borderBottom: '1px dashed #cbd5e1', flexWrap: 'wrap', gap: '4px', boxSizing: 'border-box' }}>
                  <span style={{ wordBreak: 'break-word', minWidth: 0, flex: 1 }}>{c.nome_conta}</span>
                  <strong style={{ color: '#dc2626', wordBreak: 'break-word' }}>{formatMoeda(c.saldo)}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BOTÃO DE AÇÃO */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px', boxSizing: 'border-box' }}>
        <button 
          onClick={handleEncerrarExercicio}
          disabled={isZerado || processando}
          style={{ 
            backgroundColor: isZerado ? '#94a3b8' : '#0f172a', color: 'white', border: 'none', padding: '14px 24px', 
            borderRadius: '10px', fontSize: '13.5px', fontWeight: '900', cursor: isZerado || processando ? 'not-allowed' : 'pointer', 
            boxShadow: isZerado ? 'none' : '0 4px 15px rgba(15,23,42,0.3)', transition: 'transform 0.1s', boxSizing: 'border-box', width: '100%', maxWidth: '360px' 
          }}
          onMouseDown={e => { if(!isZerado) e.currentTarget.style.transform = 'scale(0.96)'; }}
          onMouseUp={e => { if(!isZerado) e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {processando ? 'Apurando Resultados...' : isZerado ? 'Exercício Finalizado' : 'Processar Zeramento e Encerrar 🏁'}
        </button>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}