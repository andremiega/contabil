import React, { useState, useMemo } from 'react';

export default function SimuladorContratosLeasing({ mostrarToast, registrarFatoGerador }) {
  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  const formatNum = (v, dec = 2) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });

  // Estado do Simulador de Contratos (CPC 06)
  const [params, setParams] = useState({
    objetoContrato: 'Galpão Logístico e Frota de Caminhões',
    valorParcela: 15000.00, // Parcela mensal
    prazoMeses: 60, // Prazo do contrato em meses (5 anos)
    taxaDesconto: 1.5, // Taxa de juros incremental (Custo de oportunidade % a.m.)
  });

  const [abaAtiva, setAbaAtiva] = useState('parametros');
  const [jaContabilizado, setJaContabilizado] = useState(false);

  // ==========================================
  // MOTOR DE CÁLCULO DE LEASING (VP E AMORTIZAÇÃO)
  // ==========================================
  const calculos = useMemo(() => {
    const pmt = Number(params.valorParcela) || 0;
    const n = Number(params.prazoMeses) || 1;
    const i = (Number(params.taxaDesconto) || 0) / 100;

    let valorPresente = 0;
    
    // Cálculo do Valor Presente de uma Anuidade (Fórmula VP = PMT * ((1 - (1+i)^-n) / i))
    if (i > 0) {
      valorPresente = pmt * ((1 - Math.pow(1 + i, -n)) / i);
    } else {
      valorPresente = pmt * n; // Sem juros, o VP é a soma simples
    }

    const valorTotalContrato = pmt * n;
    const jurosEmbutidos = valorTotalContrato - valorPresente;
    const depreciacaoMensal = valorPresente / n;

    // Tabela de Amortização Financeira (Primeiros 12 meses e último para demonstração)
    const tabelaAmortizacao = [];
    let saldoDevedor = valorPresente;

    for (let mes = 1; mes <= n; mes++) {
      const jurosMes = saldoDevedor * i;
      const amortizacaoMes = pmt - jurosMes;
      saldoDevedor -= amortizacaoMes;
      
      // Guardar apenas o 1º ano e o último mês para não pesar a renderização na tela
      if (mes <= 12 || mes === n) {
        tabelaAmortizacao.push({
          mes,
          pmt,
          juros: jurosMes,
          amortizacao: amortizacaoMes,
          saldoFinal: Math.max(0, saldoDevedor)
        });
      }
    }

    return {
      valorPresente,
      valorTotalContrato,
      jurosEmbutidos,
      depreciacaoMensal,
      tabelaAmortizacao
    };
  }, [params]);

  // ==========================================
  // DISPARO PARA O LIVRO DIÁRIO
  // ==========================================
  const handleContabilizarContrato = () => {
    if (!calculos) return;
    if (jaContabilizado) {
      if (typeof mostrarToast === 'function') mostrarToast('Este contrato já foi capitalizado!', 'aviso');
      return;
    }
    if (typeof registrarFatoGerador !== 'function') {
      if (typeof mostrarToast === 'function') mostrarToast('Erro de integração: Motor Diário ausente.', 'erro');
      return;
    }

    try {
      // Reconhecimento Inicial do Contrato de Arrendamento (CPC 06)
      // Trazemos o contrato a Valor Presente. Ativa-se o Direito de Uso e reconhece o Passivo.
      registrarFatoGerador(
        `Capitalização de Contrato CPC06 - ${params.objetoContrato}`,
        calculos.valorPresente,
        'Compliance/Contratos',
        ['1.2.03.01'], // Débito: Ativo Imobilizado (Direito de Uso)
        ['2.1.04.01']  // Crédito: Passivo (Arrendamentos a Pagar)
      );

      setJaContabilizado(true);
      if (typeof mostrarToast === 'function') mostrarToast('Contrato auditado e capitalizado com sucesso no Livro Diário!', 'sucesso');
    } catch (e) {
      if (typeof mostrarToast === 'function') mostrarToast('Erro ao integrar com o Livro Diário.', 'erro');
    }
  };

  const resetarSimulador = () => {
    setJaContabilizado(false);
    if (typeof mostrarToast === 'function') mostrarToast('Painel limpo para análise de um novo contrato.', 'sucesso');
  };

  // Estilos Padronizados
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', animation: 'fadeIn 0.4s' }}>
      
      {/* CABEÇALHO */}
      <div className="no-print" style={{ backgroundColor: '#0f172a', color: 'white', padding: '24px', borderRadius: '14px 14px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #0d9488' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span style={{ backgroundColor: '#0d9488', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>GESTÃO DE CONTRATOS & COMPLIANCE</span>
            <span style={{ fontSize: '18px', fontWeight: '800' }}>Arrendamentos (Leasing - CPC 06)</span>
          </div>
          <div style={{ fontSize: '13px', color: '#cbd5e1' }}>Avalie contratos longos, calcule o Valor Presente e neutralize riscos de auditoria.</div>
        </div>
        
        {/* NAVEGAÇÃO INTERNA */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setAbaAtiva('parametros')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'parametros' ? '#0d9488' : 'transparent', color: abaAtiva === 'parametros' ? 'white' : '#cbd5e1' }}>⚙️ Setup do Contrato</button>
          <button onClick={() => setAbaAtiva('tabela')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'tabela' ? '#0d9488' : 'transparent', color: abaAtiva === 'tabela' ? 'white' : '#cbd5e1' }}>📉 Tabela de Amortização</button>
          <button onClick={() => setAbaAtiva('memoria')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'memoria' ? '#0d9488' : 'transparent', color: abaAtiva === 'memoria' ? 'white' : '#cbd5e1' }}>🧠 Regras de Compliance</button>
          <button onClick={() => setAbaAtiva('contabilidade')} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === 'contabilidade' ? '#0d9488' : 'transparent', color: abaAtiva === 'contabilidade' ? 'white' : '#cbd5e1' }}>📖 Capitalização (Diário)</button>
        </div>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '0 0 14px 14px', border: '1px solid #e2e8f0', borderTop: 'none', minHeight: '600px' }}>
        
        {/* ========================================================
            ABA 1: PARÂMETROS DO CONTRATO
            ======================================================== */}
        {abaAtiva === 'parametros' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
            
            {/* PAINEL DE INPUTS */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', color: '#0f172a' }}>📄 Detalhes do Acordo Comercial</h3>
                <button onClick={resetarSimulador} style={{ background: 'none', border: 'none', color: '#0d9488', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>🔄 Limpar Dados</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label htmlFor="cObjeto" style={labelStyle}>Objeto do Contrato de Arrendamento:</label>
                  <input id="cObjeto" name="cObjeto" type="text" style={inputStyle} value={params.objetoContrato} onChange={e => {setParams({...params, objetoContrato: e.target.value}); setJaContabilizado(false);}} placeholder="Ex: Aluguel de Sede, Frota de Veículos..." />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label htmlFor="cParcela" style={labelStyle}>Valor da Parcela Mensal (R$):</label>
                    <input id="cParcela" name="cParcela" type="number" style={{...inputStyle, borderColor: '#5eead4', backgroundColor: '#f0fdfa'}} value={params.valorParcela} onChange={e => {setParams({...params, valorParcela: e.target.value}); setJaContabilizado(false);}} />
                  </div>
                  <div>
                    <label htmlFor="cPrazo" style={labelStyle}>Prazo de Duração (Meses):</label>
                    <input id="cPrazo" name="cPrazo" type="number" style={inputStyle} value={params.prazoMeses} onChange={e => {setParams({...params, prazoMeses: e.target.value}); setJaContabilizado(false);}} />
                  </div>
                </div>

                <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', marginTop: '10px' }}>
                  <label htmlFor="cTaxa" style={{ ...labelStyle, color: '#991b1b' }}>Taxa Incremental de Empréstimo (% a.m.):</label>
                  <input id="cTaxa" name="cTaxa" type="number" step="0.1" style={{...inputStyle, borderColor: '#fca5a5'}} value={params.taxaDesconto} onChange={e => {setParams({...params, taxaDesconto: e.target.value}); setJaContabilizado(false);}} />
                  <span style={{ fontSize: '11px', color: '#991b1b', marginTop: '6px', display: 'block' }}>*Se a empresa fosse pegar esse dinheiro emprestado no banco hoje, qual seria a taxa de juros do mês?</span>
                </div>
              </div>
            </div>

            {/* PAINEL DE RESULTADOS (DIAGNOSTICO CPC 06) */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>🔬 Diagnóstico de Conformidade (IFRS 16)</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#475569' }}>
                  <span>Valor Nominal do Contrato:</span>
                  <strong style={{ color: '#0f172a' }}>{formatMoeda(calculos.valorTotalContrato)}</strong>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#dc2626' }}>
                  <span>(-) Juros Embutidos nas Parcelas:</span>
                  <strong>{formatMoeda(calculos.jurosEmbutidos)}</strong>
                </div>

                <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '16px', borderRadius: '8px', marginTop: '10px' }}>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>VALOR PRESENTE (Ativo de Direito de Uso)</div>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: '#2dd4bf' }}>
                    {formatMoeda(calculos.valorPresente)}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f0fdfa', border: '1px solid #ccfbf1', padding: '12px', borderRadius: '8px', marginTop: '10px', borderLeft: '4px solid #0d9488' }}>
                  <strong style={{ fontSize: '12px', color: '#0f766e', display: 'block', marginBottom: '4px' }}>Impacto Operacional Mensal Projetado:</strong>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#115e59', marginTop: '6px' }}>
                    <span>Despesa com Depreciação:</span>
                    <strong>{formatMoeda(calculos.depreciacaoMensal)} / mês</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', color: '#991b1b', marginTop: '6px' }}>
                    <span>Despesa com Juros (Mês 1):</span>
                    <strong>{formatMoeda(calculos.tabelaAmortizacao[0]?.juros)} / mês</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 2: TABELA DE AMORTIZAÇÃO (CRONOGRAMA DO PASSIVO)
            ======================================================== */}
        {abaAtiva === 'tabela' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '22px', color: '#0f172a' }}>📉 Tabela de Amortização do Passivo (PRICE)</h2>
            <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '24px' }}>A cada parcela paga de {formatMoeda(params.valorParcela)}, uma parte é Despesa Financeira (Juros) que vai para a DRE, e a outra parte reduz o Passivo (Amortização). Abaixo, os 12 primeiros meses da operação.</p>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'right', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                    <th style={{ padding: '14px', textAlign: 'center' }}>Mês</th>
                    <th style={{ padding: '14px' }}>Parcela Paga (R$)</th>
                    <th style={{ padding: '14px', color: '#fca5a5' }}>Despesa Juros (DRE)</th>
                    <th style={{ padding: '14px', color: '#6ee7b7' }}>Amortização (Baixa Passivo)</th>
                    <th style={{ padding: '14px' }}>Saldo Devedor (Balanço)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>0</td>
                    <td style={{ padding: '12px' }}>—</td>
                    <td style={{ padding: '12px' }}>—</td>
                    <td style={{ padding: '12px' }}>—</td>
                    <td style={{ padding: '12px', fontWeight: '900', color: '#0f172a' }}>{formatMoeda(calculos.valorPresente)}</td>
                  </tr>
                  {calculos.tabelaAmortizacao.map((p) => (
                    <React.Fragment key={p.mes}>
                      {p.mes === params.prazoMeses && params.prazoMeses > 12 && (
                        <tr style={{ backgroundColor: '#f8fafc' }}><td colSpan="5" style={{ padding: '10px', textAlign: 'center', color: '#94a3b8', fontStyle: 'italic' }}>... salto no tempo (Mês 13 ao Mês {params.prazoMeses - 1}) ...</td></tr>
                      )}
                      <tr style={{ borderBottom: '1px dashed #e2e8f0' }}>
                        <td style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold' }}>{p.mes}</td>
                        <td style={{ padding: '12px', color: '#475569', fontWeight: 'bold' }}>{formatMoeda(p.pmt)}</td>
                        <td style={{ padding: '12px', color: '#dc2626' }}>{formatMoeda(p.juros)}</td>
                        <td style={{ padding: '12px', color: '#16a34a' }}>{formatMoeda(p.amortizacao)}</td>
                        <td style={{ padding: '12px', fontWeight: 'bold', color: '#0f766e' }}>{formatMoeda(p.saldoFinal)}</td>
                      </tr>
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            ABA 3: MEMÓRIA DE CÁLCULO E REGRAS (COMPLIANCE)
            ======================================================== */}
        {abaAtiva === 'memoria' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '22px', color: '#0f172a' }}>🧠 Auditoria de Contratos e a Norma CPC 06 (R2)</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              
              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 12px 0', color: '#0d9488', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}><span>🏢</span> O Fim do "Fora do Balanço"</h4>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#475569', lineHeight: '1.6' }}>
                  No passado, assinar um contrato de aluguel de R$ 1 Milhão por 5 anos não aparecia nas dívidas do Balanço. Apenas a mensalidade pingava na DRE. O IFRS 16 (CPC 06) corrigiu isso: a empresa agora é obrigada a reconhecer o direito de usar o galpão/frota como um <strong>Ativo</strong> e a obrigação de pagar os 5 anos como uma <strong>Dívida (Passivo)</strong>.
                </p>
              </div>

              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 12px 0', color: '#0d9488', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}><span>⏱️</span> O Valor do Dinheiro no Tempo</h4>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#475569', lineHeight: '1.6' }}>
                  Não podemos simplesmente multiplicar R$ {formatNum(params.valorParcela)} por {params.prazoMeses} meses e registrar R$ {formatNum(calculos.valorTotalContrato)} no Balanço. R$ 100 pagos daqui a 5 anos valem menos que R$ 100 hoje.<br/><br/>
                  Por isso, descontamos todo o contrato a uma taxa de {params.taxaDesconto}% a.m., expurgando os <strong>R$ {formatNum(calculos.jurosEmbutidos)}</strong> de juros embutidos, chegando ao Valor Presente (VP) de <strong>R$ {formatNum(calculos.valorPresente)}</strong>.
                </p>
              </div>

              <div style={{ ...cardStyle, borderLeft: '4px solid #0ea5e9', backgroundColor: '#f0f9ff' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#0369a1', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}><span>📊</span> Impacto na DRE (EBITDA)</h4>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#0c4a6e', lineHeight: '1.6' }}>
                  A adoção do CPC 06 melhora artificialmente o EBITDA da empresa. O que antes era uma "Despesa de Aluguel" (operacional) agora é desmembrado em <strong>Depreciação</strong> (amortização do Direito de Uso) e <strong>Despesa Financeira</strong> (Juros). Como ambas as despesas ficam "abaixo" do EBITDA na DRE, o lucro operacional da empresa dispara.
                </p>
              </div>

            </div>
          </div>
        )}

        {/* ========================================================
            ABA 4: CONTABILIZAÇÃO (CAPITALIZAÇÃO DO CONTRATO)
            ======================================================== */}
        {abaAtiva === 'contabilidade' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h2 style={{ margin: '0 0 10px 0', fontSize: '22px', color: '#0f172a' }}>📖 Capitalização e Reconhecimento Inicial</h2>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '24px' }}>
              Para assinar a conformidade deste contrato, precisamos reconhecer o <strong>Ativo de Direito de Uso</strong> e o <strong>Passivo de Arrendamento</strong> no momento da assinatura.
            </p>
            
            <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '12px', color: 'white', border: '1px solid #334155', boxShadow: '0 10px 20px rgba(0,0,0,0.15)' }}>
              <div style={{ fontSize: '13px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '16px', letterSpacing: '1px' }}>
                Lançamento Contábil (Ativação CPC 06)
              </div>
              
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                    <th style={{ padding: '10px 0' }}>Conta Contábil (Plano de Contas)</th>
                    <th style={{ padding: '10px 0', textAlign: 'right' }}>Débito</th>
                    <th style={{ padding: '10px 0', textAlign: 'right' }}>Crédito</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ padding: '14px 0' }}>
                      <span style={{ backgroundColor: '#3b82f6', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', marginRight: '8px' }}>ATIVO IMOB.</span>
                      <strong>1.2.03.01 - Máquinas/Instalações (Direito de Uso)</strong>
                    </td>
                    <td style={{ padding: '14px 0', textAlign: 'right', color: '#4ade80', fontWeight: 'bold', fontSize: '16px' }}>{formatMoeda(calculos.valorPresente)}</td>
                    <td style={{ padding: '14px 0', textAlign: 'right' }}>—</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '14px 0', paddingLeft: '20px' }}>
                      <span style={{ backgroundColor: '#f59e0b', color: '#0f172a', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', marginRight: '8px' }}>PASSIVO</span>
                      <strong>2.1.04.01 - Empréstimos e Arrendamentos a Pagar</strong>
                    </td>
                    <td style={{ padding: '14px 0', textAlign: 'right' }}>—</td>
                    <td style={{ padding: '14px 0', textAlign: 'right', color: '#f87171', fontWeight: 'bold', fontSize: '16px' }}>{formatMoeda(calculos.valorPresente)}</td>
                  </tr>
                </tbody>
              </table>

              <div style={{ marginTop: '20px', borderTop: '2px solid #334155', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '900', fontSize: '16px' }}>Validação do Balanço:</span>
                <span style={{ color: '#38bdf8', fontWeight: '900', fontSize: '15px' }}>Ativo e Passivo alinhados. Impacto zero no Caixa neste momento.</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #16a34a', maxWidth: '600px' }}>
                <strong style={{ fontSize: '14px', color: '#166534', display: 'block', marginBottom: '8px' }}>E as parcelas futuras?</strong>
                <p style={{ margin: 0, fontSize: '13px', color: '#15803d', lineHeight: '1.6' }}>
                  Mês a mês, quando a empresa pagar os {formatMoeda(params.valorParcela)}, uma parte vai baixar a dívida que acabamos de registrar no Passivo, e a outra parte será reconhecida como Despesa com Juros na DRE. O Ativo sofrerá Depreciação normal de {formatMoeda(calculos.depreciacaoMensal)} mensais.
                </p>
              </div>

              <button 
                onClick={handleContabilizarContrato}
                disabled={jaContabilizado}
                style={{ 
                  backgroundColor: jaContabilizado ? '#166534' : '#0d9488', 
                  color: 'white', border: 'none', padding: '16px 24px', borderRadius: '10px', 
                  fontWeight: '900', fontSize: '15px', cursor: jaContabilizado ? 'not-allowed' : 'pointer',
                  boxShadow: jaContabilizado ? 'none' : '0 4px 12px rgba(13, 148, 136, 0.3)',
                  transition: 'all 0.2s'
                }}
              >
                {jaContabilizado ? '✓ Contrato Capitalizado no ERP' : '📝 Assinar Contrato e Capitalizar no Balanço'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}