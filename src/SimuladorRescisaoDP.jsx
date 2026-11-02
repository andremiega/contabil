import React, { useState, useMemo } from 'react';

export default function SimuladorRescisaoDP({ mostrarToast, registrarFatoGerador }) {
  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Estado do Simulador
  const [params, setParams] = useState({
    nomeFuncionario: 'Carlos Eduardo Souza',
    salarioBase: 3500.00,
    dataAdmissao: '2022-03-10',
    dataDemissao: '2026-08-25',
    motivo: 'sem_justa_causa',
    avisoPrevio: 'indenizado',
    feriasVencidas: 1,
    saldoFGTSSimulado: 14500.00
  });

  const [abaAtiva, setAbaAtiva] = useState('calculadora');
  const [jaContabilizado, setJaContabilizado] = useState(false);

  // ==========================================
  // MOTOR DE CÁLCULO TRABALHISTA (TRCT)
  // ==========================================
  const calculos = useMemo(() => {
    const adm = new Date(params.dataAdmissao);
    const dem = new Date(params.dataDemissao);
    
    if (isNaN(adm) || isNaN(dem) || dem < adm) return null;

    const anosTrabalhados = Math.floor((dem - adm) / (1000 * 60 * 60 * 24 * 365.25));
    const diasAvisoPrevio = params.motivo === 'sem_justa_causa' ? Math.min(90, 30 + (anosTrabalhados * 3)) : 0;
    
    const dataProjetada = new Date(dem);
    if (params.avisoPrevio === 'indenizado' && params.motivo === 'sem_justa_causa') {
      dataProjetada.setDate(dataProjetada.getDate() + diasAvisoPrevio);
    }

    const diasTrabalhadosMes = dem.getDate();
    const saldoSalario = (params.salarioBase / 30) * diasTrabalhadosMes;

    const mesProjetado = dataProjetada.getMonth();
    const diaProjetado = dataProjetada.getDate();
    let avos13 = mesProjetado + (diaProjetado >= 15 ? 1 : 0);
    if (params.motivo === 'justa_causa') avos13 = 0;
    const decimoTerceiro = (params.salarioBase / 12) * avos13;

    let mesesDesdeAniversario = dataProjetada.getMonth() - adm.getMonth();
    if (mesesDesdeAniversario < 0) mesesDesdeAniversario += 12;
    if (dataProjetada.getDate() >= adm.getDate() + 15 || (dataProjetada.getDate() >= 15 && mesesDesdeAniversario === 0)) {
      mesesDesdeAniversario += 1;
    }
    let avosFerias = mesesDesdeAniversario % 12;
    if (params.motivo === 'justa_causa') avosFerias = 0; 

    const feriasVencidasReais = (params.salarioBase * params.feriasVencidas);
    const feriasProporcionais = (params.salarioBase / 12) * avosFerias;
    const tercoConstitucional = (feriasVencidasReais + feriasProporcionais) / 3;

    const valorAvisoIndenizado = (params.avisoPrevio === 'indenizado' && params.motivo === 'sem_justa_causa') 
      ? (params.salarioBase / 30) * diasAvisoPrevio 
      : 0;

    const multaFGTS = params.motivo === 'sem_justa_causa' ? (params.saldoFGTSSimulado * 0.4) : 0;
    
    const baseInss = saldoSalario + decimoTerceiro;
    const inss = params.motivo === 'justa_causa' ? 0 : baseInss * 0.09;
    const irrf = params.motivo === 'justa_causa' ? 0 : baseInss * 0.075;
    
    const proventos = saldoSalario + decimoTerceiro + feriasVencidasReais + feriasProporcionais + tercoConstitucional + valorAvisoIndenizado;
    const descontos = inss + irrf;
    const liquido = proventos - descontos;
    const custoTotalEmpresa = proventos + multaFGTS;

    return {
      anosTrabalhados, diasAvisoPrevio, dataProjetada, diasTrabalhadosMes, avos13, avosFerias,
      saldoSalario, decimoTerceiro, feriasVencidasReais, feriasProporcionais, tercoConstitucional,
      valorAvisoIndenizado, multaFGTS, proventos, descontos, inss, irrf, liquido, custoTotalEmpresa
    };
  }, [params]);

  // ==========================================
  // DISPARO PARA O LIVRO DIÁRIO
  // ==========================================
  const handleContabilizarRescisao = () => {
    if (!calculos) return;
    if (jaContabilizado) {
      if (typeof mostrarToast === 'function') mostrarToast('Esta rescisão já foi contabilizada!', 'aviso');
      return;
    }
    if (typeof registrarFatoGerador !== 'function') {
      if (typeof mostrarToast === 'function') mostrarToast('Erro de integração: Motor Diário ausente.', 'erro');
      return;
    }

    try {
      registrarFatoGerador(
        `TRCT (Líquido) - ${params.nomeFuncionario}`,
        calculos.liquido,
        'DP/Rescisão',
        ['5.2.01.01'], 
        ['1.1.01.02']  
      );

      if (calculos.descontos > 0) {
        registrarFatoGerador(
          `Retenções INSS/IRRF (TRCT) - ${params.nomeFuncionario}`,
          calculos.descontos,
          'DP/Rescisão',
          ['5.2.01.01'], 
          ['2.1.03.01']  
        );
      }

      if (calculos.multaFGTS > 0) {
        registrarFatoGerador(
          `Pagamento GRRF (Multa 40%) - ${params.nomeFuncionario}`,
          calculos.multaFGTS,
          'DP/Rescisão',
          ['5.2.01.02'], 
          ['1.1.01.02']  
        );
      }

      setJaContabilizado(true);
      if (typeof mostrarToast === 'function') mostrarToast('Rescisão escriturada com sucesso no Livro Diário!', 'sucesso');
    } catch (e) {
      if (typeof mostrarToast === 'function') mostrarToast('Erro ao integrar com o Livro Diário.', 'erro');
    }
  };

  const resetarSimulador = () => {
    setJaContabilizado(false);
    if (typeof mostrarToast === 'function') mostrarToast('Simulador resetado para novo cálculo.', 'sucesso');
  };

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.4s' }}>
      
      <div className="no-print" style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px 24px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #f59e0b', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: '#f59e0b', color: '#0f172a', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', letterSpacing: '0.5px' }}>LABORATÓRIO DE D.P.</span>
            <span style={{ fontSize: '17px', fontWeight: '800', wordBreak: 'break-word' }}>Cálculo de Rescisão (TRCT)</span>
          </div>
          <div style={{ fontSize: '13px', color: '#cbd5e1', wordBreak: 'break-word' }}>Simule desligamentos, calcule provisões e integre com o Diário.</div>
        </div>
        
        <div style={{ display: 'flex', gap: '6px', backgroundColor: 'rgba(255,255,255,0.1)', padding: '6px', borderRadius: '10px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <button onClick={() => setAbaAtiva('calculadora')} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'calculadora' ? '#f59e0b' : 'transparent', color: abaAtiva === 'calculadora' ? '#0f172a' : '#cbd5e1' }}>⚙️ Calculadora</button>
          <button onClick={() => setAbaAtiva('memoria')} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'memoria' ? '#f59e0b' : 'transparent', color: abaAtiva === 'memoria' ? '#0f172a' : '#cbd5e1' }}>🧠 Memória</button>
          <button onClick={() => setAbaAtiva('contabilidade')} style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === 'contabilidade' ? '#f59e0b' : 'transparent', color: abaAtiva === 'contabilidade' ? '#0f172a' : '#cbd5e1' }}>📖 Contabilização</button>
        </div>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '0 0 16px 16px', border: '1px solid #e2e8f0', borderTop: 'none', minHeight: '500px', boxSizing: 'border-box', width: '100%' }}>
        
        {abaAtiva === 'calculadora' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h3 style={{ margin: 0, fontSize: '15px', color: '#0f172a', wordBreak: 'break-word' }}>📋 Dados do Contrato de Trabalho</h3>
                <button onClick={resetarSimulador} style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>🔄 Resetar</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0 }}>
                  <label htmlFor="dpNome" style={labelStyle}>Nome do Colaborador:</label>
                  <input id="dpNome" name="dpNome" style={inputStyle} value={params.nomeFuncionario} onChange={e => {setParams({...params, nomeFuncionario: e.target.value}); setJaContabilizado(false);}} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="dpSalario" style={labelStyle}>Salário Base (R$):</label>
                    <input id="dpSalario" name="dpSalario" type="number" style={inputStyle} value={params.salarioBase} onChange={e => {setParams({...params, salarioBase: e.target.value}); setJaContabilizado(false);}} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="dpFeriasVenc" style={labelStyle}>Férias Vencidas (Qtd):</label>
                    <input id="dpFeriasVenc" name="dpFeriasVenc" type="number" min="0" max="2" style={inputStyle} value={params.feriasVencidas} onChange={e => {setParams({...params, feriasVencidas: e.target.value}); setJaContabilizado(false);}} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="dpAdm" style={labelStyle}>Data de Admissão:</label>
                    <input id="dpAdm" name="dpAdm" type="date" style={inputStyle} value={params.dataAdmissao} onChange={e => {setParams({...params, dataAdmissao: e.target.value}); setJaContabilizado(false);}} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label htmlFor="dpDem" style={{ ...labelStyle, color: '#dc2626' }}>Data de Demissão:</label>
                    <input id="dpDem" name="dpDem" type="date" style={{ ...inputStyle, borderColor: '#fca5a5', backgroundColor: '#fef2f2' }} value={params.dataDemissao} onChange={e => {setParams({...params, dataDemissao: e.target.value}); setJaContabilizado(false);}} />
                  </div>
                </div>

                <div style={{ padding: '14px', backgroundColor: '#f1f5f9', borderRadius: '10px', border: '1px solid #cbd5e1', boxSizing: 'border-box', minWidth: 0 }}>
                  <label htmlFor="dpMotivo" style={labelStyle}>Motivo do Desligamento:</label>
                  <select id="dpMotivo" name="dpMotivo" style={{ ...inputStyle, marginBottom: '12px', backgroundColor: 'white' }} value={params.motivo} onChange={e => {setParams({...params, motivo: e.target.value}); setJaContabilizado(false);}}>
                    <option value="sem_justa_causa">Demissão Sem Justa Causa</option>
                    <option value="pedido_demissao">Pedido de Demissão</option>
                    <option value="justa_causa">Demissão Com Justa Causa</option>
                  </select>

                  <label htmlFor="dpAviso" style={labelStyle}>Tipo de Aviso Prévio:</label>
                  <select id="dpAviso" name="dpAviso" style={{ ...inputStyle, backgroundColor: 'white' }} value={params.avisoPrevio} onChange={e => {setParams({...params, avisoPrevio: e.target.value}); setJaContabilizado(false);}} disabled={params.motivo === 'justa_causa'}>
                    <option value="indenizado">Aviso Prévio Indenizado</option>
                    <option value="trabalhado">Aviso Prévio Trabalhado</option>
                  </select>
                </div>

                <div style={{ minWidth: 0 }}>
                  <label htmlFor="dpFgts" style={{ ...labelStyle, color: '#0d9488' }}>Saldo Estimado de FGTS (R$):</label>
                  <input id="dpFgts" name="dpFgts" type="number" style={inputStyle} value={params.saldoFGTSSimulado} onChange={e => {setParams({...params, saldoFGTSSimulado: e.target.value}); setJaContabilizado(false);}} />
                  <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block', wordBreak: 'break-word' }}>*Usado para calcular a multa de 40% (se aplicável).</span>
                </div>
              </div>
            </div>

            {/* PAINEL DE RESULTADOS (TRCT) */}
            <div style={cardStyle}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '15px', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', wordBreak: 'break-word' }}>🧾 Recibo de Rescisão (TRCT)</h3>
              
              {!calculos ? (
                <div style={{ color: '#dc2626', fontWeight: 'bold', wordBreak: 'break-word' }}>⚠️ Datas inválidas. A admissão deve ser anterior à demissão.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', boxSizing: 'border-box' }}>
                  
                  <div style={{ fontWeight: '800', color: '#166534', fontSize: '11.5px', borderBottom: '1px solid #bbf7d0', paddingBottom: '4px', marginBottom: '2px' }}>PROVENTOS (A RECEBER)</div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#334155', flexWrap: 'wrap', gap: '6px' }}>
                    <span>Saldo de Salário ({calculos.diasTrabalhadosMes} dias)</span>
                    <strong style={{ wordBreak: 'break-word' }}>{formatMoeda(calculos.saldoSalario)}</strong>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: params.motivo === 'justa_causa' ? '#94a3b8' : '#334155', flexWrap: 'wrap', gap: '6px' }}>
                    <span>13º Salário Proporcional ({calculos.avos13}/12 avos)</span>
                    <strong style={{ wordBreak: 'break-word' }}>{formatMoeda(calculos.decimoTerceiro)}</strong>
                  </div>
                  
                  {params.feriasVencidas > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#334155', flexWrap: 'wrap', gap: '6px' }}>
                      <span>Férias Vencidas ({params.feriasVencidas} período)</span>
                      <strong style={{ wordBreak: 'break-word' }}>{formatMoeda(calculos.feriasVencidasReais)}</strong>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: params.motivo === 'justa_causa' ? '#94a3b8' : '#334155', flexWrap: 'wrap', gap: '6px' }}>
                    <span>Férias Proporcionais ({calculos.avosFerias}/12 avos)</span>
                    <strong style={{ wordBreak: 'break-word' }}>{formatMoeda(calculos.feriasProporcionais)}</strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: params.motivo === 'justa_causa' ? '#94a3b8' : '#334155', flexWrap: 'wrap', gap: '6px' }}>
                    <span>1/3 Constitucional s/ Férias</span>
                    <strong style={{ wordBreak: 'break-word' }}>{formatMoeda(calculos.tercoConstitucional)}</strong>
                  </div>

                  {calculos.valorAvisoIndenizado > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#1e40af', backgroundColor: '#eff6ff', padding: '6px 8px', borderRadius: '6px', flexWrap: 'wrap', gap: '6px', boxSizing: 'border-box' }}>
                      <span>Aviso Prévio Indenizado ({calculos.diasAvisoPrevio} dias)</span>
                      <strong style={{ wordBreak: 'break-word' }}>{formatMoeda(calculos.valorAvisoIndenizado)}</strong>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#16a34a', fontWeight: '900', marginTop: '6px', borderTop: '1px dashed #cbd5e1', paddingTop: '6px', flexWrap: 'wrap', gap: '6px' }}>
                    <span>TOTAL BRUTO</span>
                    <span style={{ wordBreak: 'break-word' }}>{formatMoeda(calculos.proventos)}</span>
                  </div>

                  <div style={{ fontWeight: '800', color: '#991b1b', fontSize: '11.5px', borderBottom: '1px solid #fecaca', paddingBottom: '4px', margin: '14px 0 2px 0' }}>DESCONTOS (RETENÇÕES)</div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#dc2626', flexWrap: 'wrap', gap: '6px' }}>
                    <span>INSS Retido</span>
                    <span style={{ wordBreak: 'break-word' }}>- {formatMoeda(calculos.inss)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#dc2626', flexWrap: 'wrap', gap: '6px' }}>
                    <span>IRRF Retido</span>
                    <span style={{ wordBreak: 'break-word' }}>- {formatMoeda(calculos.irrf)}</span>
                  </div>

                  <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '16px', borderRadius: '10px', marginTop: '16px', boxSizing: 'border-box' }}>
                    <div style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '4px' }}>LÍQUIDO A DEPOSITAR AO FUNCIONÁRIO</div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: '#4ade80', wordBreak: 'break-word' }}>
                      {formatMoeda(calculos.liquido)}
                    </div>
                  </div>

                  {calculos.multaFGTS > 0 && (
                    <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '14px', borderRadius: '10px', marginTop: '14px', borderLeft: '4px solid #f59e0b', boxSizing: 'border-box' }}>
                      <strong style={{ fontSize: '12.5px', color: '#b45309', display: 'block', marginBottom: '4px', wordBreak: 'break-word' }}>Multa Rescisória de 40% (Guia GRRF):</strong>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: '#d97706', wordBreak: 'break-word' }}>{formatMoeda(calculos.multaFGTS)}</div>
                      <span style={{ fontSize: '11px', color: '#92400e', wordBreak: 'break-word', marginTop: '4px', display: 'block' }}>Custo adicional suportado pela empresa (vai para a conta FGTS).</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {abaAtiva === 'memoria' && calculos && (
          <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px', color: '#0f172a', wordBreak: 'break-word' }}>🧠 Como o TRCT foi calculado?</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 10px 0', color: '#1e40af', fontSize: '15px', wordBreak: 'break-word' }}>1. Aviso Prévio (Lei 12.506/11)</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.6', wordBreak: 'break-word' }}>
                  A lei garante 30 dias de aviso + 3 dias por cada ano completo trabalhado.<br/>
                  • Anos completos: <strong>{calculos.anosTrabalhados} anos</strong>.<br/>
                  • Fórmula: 30 + ({calculos.anosTrabalhados} × 3) = <strong>{calculos.diasAvisoPrevio} dias</strong>.<br/>
                  • O aviso foi <strong>{params.avisoPrevio}</strong>. Sendo indenizado, a data final projetada foi empurrada para: <strong>{calculos.dataProjetada.toLocaleDateString('pt-BR')}</strong>.
                </p>
              </div>
              <div style={cardStyle}>
                <h4 style={{ margin: '0 0 10px 0', color: '#1e40af', fontSize: '15px', wordBreak: 'break-word' }}>2. O Conceito de "Avos" (Fração 1/12)</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: '1.6', wordBreak: 'break-word' }}>
                  Trabalhou 15 dias ou mais no mês, ganha 1 avo inteiro.<br/>
                  • No 13º Salário, o ano "zera" em janeiro. Ele obteve <strong>{calculos.avos13}/12 avos</strong>.<br/>
                  • Nas Férias, conta-se desde a admissão. Ele obteve <strong>{calculos.avosFerias}/12 avos</strong> proporcionais.
                </p>
              </div>
              <div style={{ ...cardStyle, borderLeft: '4px solid #ef4444', backgroundColor: '#fef2f2' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#991b1b', fontSize: '15px', wordBreak: 'break-word' }}>3. O Peso da Justa Causa (Art. 482 CLT)</h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#7f1d1d', lineHeight: '1.6', wordBreak: 'break-word' }}>
                  Se você alterar para Demissão Com Justa Causa, o funcionário perde o direito a aviso prévio, 13º proporcional, férias proporcionais + 1/3 e a multa de 40% do FGTS. Recebe apenas saldo de salário e férias vencidas.
                </p>
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'contabilidade' && calculos && (
          <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '20px', color: '#0f172a', wordBreak: 'break-word' }}>📖 Impacto no Balanço e na DRE</h2>
            <p style={{ fontSize: '13.5px', color: '#475569', marginBottom: '20px', wordBreak: 'break-word' }}>
              Uma rescisão gera um impacto violento no fluxo de caixa e no resultado da empresa. Veja a tradução da folha para o Livro Diário.
            </p>
            
            <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', color: 'white', border: '1px solid #334155', boxShadow: '0 10px 20px rgba(0,0,0,0.15)', boxSizing: 'border-box', overflowX: 'hidden' }}>
              <div style={{ fontSize: '12px', color: '#cbd5e1', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: '14px', letterSpacing: '0.5px' }}>
                Lançamento Contábil Múltiplo (Lote de Rescisão)
              </div>
              
              <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left', minWidth: '450px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                      <th style={{ padding: '8px 0' }}>Conta Contábil (Plano de Contas)</th>
                      <th style={{ padding: '8px 0', textAlign: 'right' }}>Débito</th>
                      <th style={{ padding: '8px 0', textAlign: 'right' }}>Crédito</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '12px 0', wordBreak: 'break-word' }}>
                        <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', marginRight: '6px' }}>DRE</span>
                        <strong>5.2.01.01 - Despesas com Rescisões (Proventos)</strong>
                      </td>
                      <td style={{ padding: '12px 0', textAlign: 'right', color: '#4ade80', fontWeight: 'bold' }}>{formatMoeda(calculos.proventos)}</td>
                      <td style={{ padding: '12px 0', textAlign: 'right' }}>—</td>
                    </tr>
                    {calculos.multaFGTS > 0 && (
                      <tr>
                        <td style={{ padding: '12px 0', wordBreak: 'break-word' }}>
                          <span style={{ backgroundColor: '#ef4444', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', marginRight: '6px' }}>DRE</span>
                          <strong>5.2.01.02 - Despesa Multa Rescisória (40% FGTS)</strong>
                        </td>
                        <td style={{ padding: '12px 0', textAlign: 'right', color: '#4ade80', fontWeight: 'bold' }}>{formatMoeda(calculos.multaFGTS)}</td>
                        <td style={{ padding: '12px 0', textAlign: 'right' }}>—</td>
                      </tr>
                    )}
                    <tr>
                      <td style={{ padding: '12px 0', paddingLeft: '16px', wordBreak: 'break-word' }}>
                        <span style={{ backgroundColor: '#f59e0b', color: '#0f172a', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', marginRight: '6px' }}>PASSIVO</span>
                        <strong>2.1.03.01 - INSS e IRRF a Recolher</strong>
                      </td>
                      <td style={{ padding: '12px 0', textAlign: 'right' }}>—</td>
                      <td style={{ padding: '12px 0', textAlign: 'right', color: '#f87171', fontWeight: 'bold' }}>{formatMoeda(calculos.descontos)}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '12px 0', paddingLeft: '16px', wordBreak: 'break-word' }}>
                        <span style={{ backgroundColor: '#3b82f6', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', marginRight: '6px' }}>ATIVO</span>
                        <strong>1.1.01.02 - Banco (Pagamento TRCT)</strong>
                      </td>
                      <td style={{ padding: '12px 0', textAlign: 'right' }}>—</td>
                      <td style={{ padding: '12px 0', textAlign: 'right', color: '#f87171', fontWeight: 'bold' }}>{formatMoeda(calculos.liquido)}</td>
                    </tr>
                    {calculos.multaFGTS > 0 && (
                      <tr>
                        <td style={{ padding: '12px 0', paddingLeft: '16px', wordBreak: 'break-word' }}>
                          <span style={{ backgroundColor: '#3b82f6', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '10.5px', marginRight: '6px' }}>ATIVO</span>
                          <strong>1.1.01.02 - Banco (Pagamento GRRF)</strong>
                        </td>
                        <td style={{ padding: '12px 0', textAlign: 'right' }}>—</td>
                        <td style={{ padding: '12px 0', textAlign: 'right', color: '#f87171', fontWeight: 'bold' }}>{formatMoeda(calculos.multaFGTS)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: '16px', borderTop: '2px solid #334155', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontWeight: '900', fontSize: '14.5px' }}>Total Partidas Dobradas:</span>
                <span style={{ color: '#4ade80', fontWeight: '900', fontSize: '14px', wordBreak: 'break-word' }}>R$ {formatMoeda(calculos.custoTotalEmpresa)} = R$ {formatMoeda(calculos.custoTotalEmpresa)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', flexWrap: 'wrap', gap: '16px', boxSizing: 'border-box' }}>
              <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '14px', borderRadius: '10px', borderLeft: '4px solid #f59e0b', flex: '1 1 300px', boxSizing: 'border-box' }}>
                <strong style={{ fontSize: '13.5px', color: '#b45309', display: 'block', marginBottom: '6px', wordBreak: 'break-word' }}>Visão do Controller (Custo Total Absorvido)</strong>
                <p style={{ margin: 0, fontSize: '12.5px', color: '#92400e', lineHeight: '1.5', wordBreak: 'break-word' }}>
                  Para demitir, a empresa não gasta apenas o valor líquido ({formatMoeda(calculos.liquido)}). O "rombo" real no fluxo de caixa será de <strong>{formatMoeda(calculos.custoTotalEmpresa)}</strong>.
                </p>
              </div>

              <button 
                onClick={handleContabilizarRescisao}
                disabled={jaContabilizado}
                style={{ 
                  backgroundColor: jaContabilizado ? '#166534' : '#2563eb', 
                  color: 'white', border: 'none', padding: '14px 22px', borderRadius: '10px', 
                  fontWeight: '900', fontSize: '14px', cursor: jaContabilizado ? 'not-allowed' : 'pointer',
                  boxShadow: jaContabilizado ? 'none' : '0 4px 12px rgba(37,99,235,0.3)',
                  transition: 'all 0.2s', width: '100%', maxWidth: '340px', boxSizing: 'border-box'
                }}
              >
                {jaContabilizado ? '✓ Lançamento Executado no Diário' : '💸 Efetivar Lançamento no Diário'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}