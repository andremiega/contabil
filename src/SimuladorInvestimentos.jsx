import React, { useState, useMemo } from 'react';

export default function SimuladorInvestimentos({ mostrarToast, registrarFatoGerador, planoContas = [] }) {
  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Modalidade: 'renda_fixa' ou 'renda_variavel'
  const [tipoInvestimento, setTipoInvestimento] = useState('renda_fixa');

  // Identificação do Ativo
  const [nomeAtivo, setNomeAtivo] = useState('CDB Pós-Fixado Liquidez Diária (105% CDI)');
  const [instituicaoCustodiante, setInstituicaoCustodiante] = useState('Banco BTG Pactual S/A');

  // Inputs Renda Fixa (Strings para Backspace seguro)
  const [valorAporteStr, setValorAporteStr] = useState('50000');
  const [taxaRentabilidadeAnualStr, setTaxaRentabilidadeAnualStr] = useState('11.5'); 
  const [prazoDiasStr, setPrazoDiasStr] = useState('360');

  // Inputs Renda Variável 
  const [qtdCotasStr, setQtdCotasStr] = useState('1000');
  const [precoAquisicaoStr, setPrecoAquisicaoStr] = useState('35.00');
  const [cotacaoAtualStr, setCotacaoAtualStr] = useState('42.00');

  // Tabela Regressiva de IR em Renda Fixa
  const getAliqRegressivaIR = (dias) => {
    if (dias <= 180) return 0.225; // 22,5%
    if (dias <= 360) return 0.200; // 20,0%
    if (dias <= 720) return 0.175; // 17,5%
    return 0.150;                  // 15,0%
  };

  // Motor Matemático Anti-Crash (useMemo)
  const totais = useMemo(() => {
    if (tipoInvestimento === 'renda_fixa') {
      const aporte = parseFloat(valorAporteStr) || 0;
      const taxaAnual = (parseFloat(taxaRentabilidadeAnualStr) || 0) / 100;
      const dias = parseInt(prazoDiasStr, 10) || 0;

      if (aporte <= 0 || dias <= 0) {
        return { valorBrutoInvestido: 0, rendimentoBruto: 0, aliquotaIR: 0, impostoRetidoFonte: 0, valorLiquidoResgate: 0, rendimentoMensalEstimado: 0, ganhoPerdaValorJusto: 0, variacaoPercentual: 0 };
      }

      const fatorRendimento = Math.pow(1 + taxaAnual, dias / 360) - 1;
      const rendBruto = aporte * fatorRendimento;
      const aliqIR = getAliqRegressivaIR(dias);
      const vIRRF = rendBruto * aliqIR;
      const liqResgate = aporte + rendBruto - vIRRF;

      const taxaMensalEquivalente = Math.pow(1 + taxaAnual, 1 / 12) - 1;
      const rendMes = aporte * taxaMensalEquivalente;

      return {
        valorBrutoInvestido: aporte, rendimentoBruto: rendBruto, aliquotaIR: aliqIR * 100, impostoRetidoFonte: vIRRF,
        valorLiquidoResgate: liqResgate, rendimentoMensalEstimado: rendMes, ganhoPerdaValorJusto: 0, variacaoPercentual: 0
      };

    } else {
      // Renda Variável
      const qtd = parseFloat(qtdCotasStr) || 0;
      const pAquisicao = parseFloat(precoAquisicaoStr) || 0;
      const pAtual = parseFloat(cotacaoAtualStr) || 0;

      const custoAquisicao = qtd * pAquisicao;
      const vMercado = qtd * pAtual;
      const diferenca = vMercado - custoAquisicao;
      const varPerc = custoAquisicao > 0 ? (diferenca / custoAquisicao) * 100 : 0;
      const irrfVariavel = diferenca > 0 ? diferenca * 0.15 : 0;

      return {
        valorBrutoInvestido: custoAquisicao, rendimentoBruto: diferenca, aliquotaIR: 15, impostoRetidoFonte: irrfVariavel,
        valorLiquidoResgate: vMercado - irrfVariavel, rendimentoMensalEstimado: 0, ganhoPerdaValorJusto: diferenca, variacaoPercentual: varPerc
      };
    }
  }, [tipoInvestimento, valorAporteStr, taxaRentabilidadeAnualStr, prazoDiasStr, qtdCotasStr, precoAquisicaoStr, cotacaoAtualStr]);


  // ==========================================================
  // INTEGRAÇÃO CONTÁBIL (MOTOR DO LIVRO DIÁRIO)
  // ==========================================================
  const handleAplicar = () => {
    if (typeof registrarFatoGerador !== 'function') return;
    if (totais.valorBrutoInvestido <= 0) return alert('Valor de investimento inválido.');

    const cSafe = planoContas || [];
    const idBanco = cSafe.find(c => c.codigo_contabil === '1.1.01.02' || (c.nome_conta || '').toLowerCase().includes('banco'))?.id;
    const idAplicacao = cSafe.find(c => c.codigo_contabil === '1.1.01.03' || (c.nome_conta || '').toLowerCase().includes('aplicações'))?.id || idBanco;

    registrarFatoGerador(`Aplicação em ${nomeAtivo} (${instituicaoCustodiante})`, totais.valorBrutoInvestido, 'Investimentos', [idAplicacao], [idBanco]);
    if (mostrarToast) mostrarToast('Aplicação registrada com sucesso!', 'sucesso');
  };

  const handleApropriar = () => {
    if (typeof registrarFatoGerador !== 'function') return;
    const cSafe = planoContas || [];
    const idAplicacao = cSafe.find(c => c.codigo_contabil === '1.1.01.03' || (c.nome_conta || '').toLowerCase().includes('aplicações'))?.id;
    const idReceitaFin = cSafe.find(c => c.codigo_contabil === '4.1.01.01' || (c.nome_conta || '').toLowerCase().includes('receitas financeiras'))?.id;
    const idDespesaFin = cSafe.find(c => c.codigo_contabil === '5.2.03.01' || (c.nome_conta || '').toLowerCase().includes('despesas financeiras') || (c.nome_conta || '').toLowerCase().includes('perda'))?.id;

    if (tipoInvestimento === 'renda_fixa') {
      if (totais.rendimentoMensalEstimado <= 0) return alert('Sem rendimentos a apropriar.');
      registrarFatoGerador(`Apropriação Rendimento (${nomeAtivo}) - Mês`, totais.rendimentoMensalEstimado, 'Investimentos', [idAplicacao], [idReceitaFin]);
      if (mostrarToast) mostrarToast('Rendimento mensal reconhecido no Diário!', 'sucesso');
    } else {
      // Renda Variável (Marcação a Mercado)
      if (totais.ganhoPerdaValorJusto === 0) return alert('Não há variação de valor justo a registar.');
      if (totais.ganhoPerdaValorJusto > 0) {
        registrarFatoGerador(`Ajuste a Valor Justo - Ganho (${nomeAtivo})`, Math.abs(totais.ganhoPerdaValorJusto), 'Investimentos', [idAplicacao], [idReceitaFin]);
        if (mostrarToast) mostrarToast('Ganho reconhecido no Ativo e DRE!', 'sucesso');
      } else {
        registrarFatoGerador(`Ajuste a Valor Justo - Perda (${nomeAtivo})`, Math.abs(totais.ganhoPerdaValorJusto), 'Investimentos', [idDespesaFin], [idAplicacao]);
        if (mostrarToast) mostrarToast('Perda reconhecida na DRE!', 'aviso');
      }
    }
  };

  const handleResgatar = () => {
    if (typeof registrarFatoGerador !== 'function') return;
    const cSafe = planoContas || [];
    const idBanco = cSafe.find(c => c.codigo_contabil === '1.1.01.02' || (c.nome_conta || '').toLowerCase().includes('banco'))?.id;
    const idAplicacao = cSafe.find(c => c.codigo_contabil === '1.1.01.03' || (c.nome_conta || '').toLowerCase().includes('aplicações'))?.id;
    const idIrrfCompensar = cSafe.find(c => c.codigo_contabil === '1.1.02.04' || (c.nome_conta || '').toLowerCase().includes('irrf a compensar') || (c.nome_conta || '').toLowerCase().includes('impostos a recuperar'))?.id;

    const valorBaixaAtivo = tipoInvestimento === 'renda_fixa' 
      ? (totais.valorBrutoInvestido + totais.rendimentoBruto) 
      : (totais.valorBrutoInvestido + totais.ganhoPerdaValorJusto);

    // Registro Líquido que entra no Banco
    registrarFatoGerador(`Resgate de Aplicação - Valor Líquido (${nomeAtivo})`, totais.valorLiquidoResgate, 'Investimentos', [idBanco], [idAplicacao]);

    // Retenção do Imposto (IRRF a Compensar vs Baixa do restante da aplicação)
    if (totais.impostoRetidoFonte > 0) {
      registrarFatoGerador(`IRRF Retido no Resgate (${nomeAtivo})`, totais.impostoRetidoFonte, 'Investimentos', [idIrrfCompensar], [idAplicacao]);
    }

    if (mostrarToast) mostrarToast('Resgate e Impostos contabilizados!', 'sucesso');
  };


  return (
    <div style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', gap: '15px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>📈</span> Gestão de Investimentos & Aplicações Financeiras
          </h2>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '13px' }}>
            Contabilização (CPC 48 / NBC TG 38), Marcação a Mercado e IRRF Regressivo.
          </p>
        </div>

        <div style={{ display: 'flex', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0', gap: '4px' }}>
          <button 
            onClick={() => { setTipoInvestimento('renda_fixa'); setNomeAtivo('CDB Pós-Fixado Liquidez Diária (105% CDI)'); }}
            style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: tipoInvestimento === 'renda_fixa' ? '#2563eb' : 'transparent', color: tipoInvestimento === 'renda_fixa' ? 'white' : '#64748b' }}
          >
            🏛️ Renda Fixa (Custo Amortizado)
          </button>
          <button 
            onClick={() => { setTipoInvestimento('renda_variavel'); setNomeAtivo('Ações Ordinárias Vale S/A (VALE3)'); }}
            style={{ padding: '8px 14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', transition: 'all 0.2s', backgroundColor: tipoInvestimento === 'renda_variavel' ? '#0f172a' : 'transparent', color: tipoInvestimento === 'renda_variavel' ? 'white' : '#64748b' }}
          >
            📊 Ações / FIIs (Valor Justo)
          </button>
        </div>
      </div>

      {/* DASHBOARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #0f172a' }}>
          <span style={{ color: '#64748b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Custo de Aquisição (Aporte)</span>
          <strong style={{ display: 'block', color: '#0f172a', fontSize: '24px', marginTop: '4px' }}>{formatMoeda(totais.valorBrutoInvestido)}</strong>
        </div>

        <div style={{ backgroundColor: '#f0fdf4', padding: '18px', borderRadius: '12px', border: '1px solid #86efac', borderLeft: '4px solid #16a34a' }}>
          <span style={{ color: '#166534', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {tipoInvestimento === 'renda_fixa' ? 'Rendimento Bruto Acumulado' : 'Ajuste a Valor Justo'}
          </span>
          <strong style={{ display: 'block', color: totais.rendimentoBruto >= 0 || totais.ganhoPerdaValorJusto >= 0 ? '#15803d' : '#dc2626', fontSize: '24px', marginTop: '4px' }}>
            {tipoInvestimento === 'renda_fixa' 
              ? `+${formatMoeda(totais.rendimentoBruto)}` 
              : `${totais.ganhoPerdaValorJusto >= 0 ? '+' : ''}${formatMoeda(totais.ganhoPerdaValorJusto)}`
            }
          </strong>
          <span style={{ fontSize: '11px', color: '#166534' }}>
            {tipoInvestimento === 'renda_fixa' ? 'Receita Financeira' : `Variação: ${totais.variacaoPercentual.toFixed(2)}%`}
          </span>
        </div>

        <div style={{ backgroundColor: '#fff5f5', padding: '18px', borderRadius: '12px', border: '1px solid #fecaca', borderLeft: '4px solid #ef4444' }}>
          <span style={{ color: '#991b1b', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {tipoInvestimento === 'renda_fixa' ? `IRRF Estimado (${totais.aliquotaIR}%)` : 'IR s/ Ganho (15%)'}
          </span>
          <strong style={{ display: 'block', color: '#dc2626', fontSize: '24px', marginTop: '4px' }}>{formatMoeda(totais.impostoRetidoFonte)}</strong>
        </div>

        <div style={{ backgroundColor: '#eff6ff', padding: '18px', borderRadius: '12px', border: '1px solid #bfdbfe', borderLeft: '4px solid #2563eb' }}>
          <span style={{ color: '#1d4ed8', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>Posição Líquida de Resgate</span>
          <strong style={{ display: 'block', color: '#1e40af', fontSize: '24px', marginTop: '4px' }}>{formatMoeda(totais.valorLiquidoResgate)}</strong>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        
        {/* PARÂMETROS COM HTMLFOR E ID EM TODOS OS CAMPOS PARA ACESSIBILIDADE */}
        <div style={{ flex: '1 1 340px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
            Parâmetros do Instrumento
          </h3>

          <label htmlFor="invAtivo" style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
            Descrição do Título / Ativo:
            <input id="invAtivo" name="invAtivo" autoComplete="off" type="text" value={nomeAtivo} onChange={e => setNomeAtivo(e.target.value)} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
          </label>

          <label htmlFor="invCustodiante" style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
            Instituição Financeira / Corretora:
            <input id="invCustodiante" name="invCustodiante" autoComplete="off" type="text" value={instituicaoCustodiante} onChange={e => setInstituicaoCustodiante(e.target.value)} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
          </label>

          {tipoInvestimento === 'renda_fixa' ? (
            <>
              <label htmlFor="invAporte" style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>
                Valor do Aporte Inicial (R$):
                <input id="invAporte" name="invAporte" autoComplete="off" type="text" value={valorAporteStr} onChange={e => setValorAporteStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label htmlFor="invTaxa" style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                  Rentabilidade (% a.a.):
                  <input id="invTaxa" name="invTaxa" autoComplete="off" type="text" value={taxaRentabilidadeAnualStr} onChange={e => setTaxaRentabilidadeAnualStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </label>
                <label htmlFor="invPrazo" style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                  Prazo Projetado (Dias):
                  <input id="invPrazo" name="invPrazo" autoComplete="off" type="text" value={prazoDiasStr} onChange={e => setPrazoDiasStr(e.target.value.replace(/[^0-9]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </label>
              </div>
            </>
          ) : (
            <>
              <label htmlFor="invQtd" style={{ display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#0f172a' }}>
                Quantidade de Ações / Cotas:
                <input id="invQtd" name="invQtd" autoComplete="off" type="text" value={qtdCotasStr} onChange={e => setQtdCotasStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <label htmlFor="invCompra" style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>
                  Preço Compra (R$):
                  <input id="invCompra" name="invCompra" autoComplete="off" type="text" value={precoAquisicaoStr} onChange={e => setPrecoAquisicaoStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                </label>
                <label htmlFor="invAtual" style={{ flex: 1, display: 'flex', flexDirection: 'column', fontSize: '12px', fontWeight: 'bold', color: '#059669' }}>
                  Cotação Atual (R$):
                  <input id="invAtual" name="invAtual" autoComplete="off" type="text" value={cotacaoAtualStr} onChange={e => setCotacaoAtualStr(e.target.value.replace(/[^0-9.]/g, ''))} style={{ padding: '8px 10px', marginTop: '4px', borderRadius: '6px', border: '1px solid #a7f3d0', backgroundColor: '#ecfdf5', fontSize: '13px' }} />
                </label>
              </div>
            </>
          )}
        </div>

        {/* MAPA DE LANÇAMENTOS COM BOTÕES */}
        <div style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <div style={{ backgroundColor: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}><span>🧭</span> 1. Aplicação Inicial de Recursos</h3>
              <div style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                <div style={{ color: '#1d4ed8', fontWeight: 'bold' }}>D: Aplicações Financeiras (Ativo Circulante) .. {formatMoeda(totais.valorBrutoInvestido)}</div>
                <div style={{ color: '#dc2626', fontWeight: 'bold' }}>C: Banco Conta Movimento (Ativo Circulante) ... {formatMoeda(totais.valorBrutoInvestido)}</div>
              </div>
            </div>
            <button onClick={handleAplicar} style={{ marginTop: '10px', backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Aplicar no Diário 📥</button>
          </div>

          <div style={{ backgroundColor: '#f0fdf4', borderRadius: '12px', border: '1px solid #86efac', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🧭</span> {tipoInvestimento === 'renda_fixa' ? '2. Apropriação Mensal' : '2. Marcação a Mercado'}
              </h3>
              <div style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                {tipoInvestimento === 'renda_fixa' ? (
                  <>
                    <div style={{ color: '#166534', fontWeight: 'bold' }}>D: Aplicações Finan. (Atualização) .... {formatMoeda(totais.rendimentoMensalEstimado)}</div>
                    <div style={{ color: '#dc2626', fontWeight: 'bold' }}>C: Receitas Financeiras (DRE) ......... {formatMoeda(totais.rendimentoMensalEstimado)}</div>
                  </>
                ) : (
                  <>
                    <div style={{ color: totais.ganhoPerdaValorJusto >= 0 ? '#166534' : '#dc2626', fontWeight: 'bold' }}>D: {totais.ganhoPerdaValorJusto >= 0 ? 'Investimentos Temporários (Ativo)' : 'Perda Ajuste Valor Justo (DRE)'} .. {formatMoeda(Math.abs(totais.ganhoPerdaValorJusto))}</div>
                    <div style={{ color: totais.ganhoPerdaValorJusto >= 0 ? '#dc2626' : '#166534', fontWeight: 'bold' }}>C: {totais.ganhoPerdaValorJusto >= 0 ? 'Ganho Valor Justo (DRE)' : 'Investimentos Temporários (Ativo)'} .. {formatMoeda(Math.abs(totais.ganhoPerdaValorJusto))}</div>
                  </>
                )}
              </div>
            </div>
            <button onClick={handleApropriar} style={{ marginTop: '10px', backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Reconhecer Resultado 📈</button>
          </div>

          <div style={{ backgroundColor: '#fef2f2', borderRadius: '12px', border: '1px solid #fca5a5', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '6px' }}><span>🧭</span> 3. Resgate com Retenção de IR</h3>
              <div style={{ fontSize: '11px', fontFamily: 'monospace' }}>
                <div style={{ color: '#166534', fontWeight: 'bold' }}>D: Banco Conta Movimento (Líquido) ....... {formatMoeda(totais.valorLiquidoResgate)}</div>
                {totais.impostoRetidoFonte > 0 && <div style={{ color: '#166534', fontWeight: 'bold' }}>D: IRRF a Compensar (Ativo Circulante) ... {formatMoeda(totais.impostoRetidoFonte)}</div>}
                <div style={{ color: '#dc2626', fontWeight: 'bold' }}>C: Aplicações Financeiras (Baixa Total) .. {formatMoeda(totais.valorBrutoInvestido + (tipoInvestimento === 'renda_fixa' ? totais.rendimentoBruto : totais.ganhoPerdaValorJusto))}</div>
              </div>
            </div>
            <button onClick={handleResgatar} style={{ marginTop: '10px', backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Efetuar Resgate 💸</button>
          </div>

        </div>
      </div>
    </div>
  );
}