import React, { useState } from 'react';

export default function SimuladorSPED({ mostrarToast }) {
  const [tipoSped, setTipoSped] = useState('fiscal'); // 'fiscal' (EFD ICMS/IPI) ou 'contabil' (ECD)
  const [abaSped, setAbaSped] = useState('blocos'); // 'blocos', 'validacao', 'txt'

  // Dados do SPED Fiscal (EFD ICMS/IPI)
  const [spedFiscal, setSpedFiscal] = useState({
    periodoInicial: '01/02/2026',
    periodoFinal: '28/02/2026',
    nomeEmpresa: 'SILVA & LOPES CONSULTORIA EMPRESARIAL LTDA',
    cnpj: '48.912.345/0001-88',
    ie: '110.982.341.112',
    contadorNome: 'Andre Lopes da Silva',
    contadorCrc: 'SP-198293/O-4',
    totalNotasSaida: 125000.00,
    totalNotasEntrada: 45000.00,
    icmsApuradoDebito: 22500.00,
    icmsApuradoCredito: 8100.00,
    icmsRecolher: 14400.00
  });

  // Dados do SPED Contábil (ECD)
  const [spedContabil, setSpedContabil] = useState({
    dataInicio: '01/01/2025',
    dataFim: '31/12/2025',
    ativoTotal: 350000.00,
    passivoTotal: 150000.00,
    patrimonioLiquido: 200000.00,
    receitaBrutaAnual: 480000.00,
    lucroLiquidoExercicio: 95000.00
  });

  const [errosValidacao, setErrosValidacao] = useState([]);
  const [validoPva, setValidoPva] = useState(false);

  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const executarValidacaoPva = () => {
    let alertas = [];
    if (tipoSped === 'fiscal') {
      if (spedFiscal.icmsApuradoDebito < 0) alertas.push({ tipo: 'Erro', msg: 'Bloco E: O débito de ICMS não pode ser negativo.' });
      if (!spedFiscal.contadorCrc) alertas.push({ tipo: 'Aviso', msg: 'Bloco 0: CRC do contabilista responsável não preenchido corretamente.' });
      if (alertas.length === 0) {
        setValidoPva(true);
        if (typeof mostrarToast === 'function') mostrarToast("SPED Fiscal validado com sucesso pelo PVA! Sem erros impeditivos.", "sucesso");
      } else {
        setValidoPva(false);
        if (typeof mostrarToast === 'function') mostrarToast("Encontradas inconsistências no PVA do SPED.", "erro");
      }
    } else {
      const diferencaBalanço = spedContabil.ativoTotal - (spedContabil.passivoTotal + spedContabil.patrimonioLiquido);
      if (Math.abs(diferencaBalanço) > 0.01) {
        alertas.push({ tipo: 'Erro', msg: `Bloco J: Balanço Patrimonial não fecha! Ativo (R$ ${formatMoeda(spedContabil.ativoTotal)}) diverge do Passivo + PL (R$ ${formatMoeda(spedContabil.passivoTotal + spedContabil.patrimonioLiquido)}).` });
        setValidoPva(false);
      } else {
        setValidoPva(true);
        if (typeof mostrarToast === 'function') mostrarToast("SPED Contábil (ECD) validado sem divergências patrimoniais!", "sucesso");
      }
    }
    setErrosValidacao(alertas);
  };

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.4s' }}>
      
      {/* CABEÇALHO DO SPED */}
      <div style={{ backgroundColor: '#071d41', color: 'white', padding: '20px 24px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #f59e0b', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: '1 1 250px' }}>
          <div style={{ backgroundColor: '#f59e0b', color: '#071d41', padding: '8px 12px', borderRadius: '8px', fontWeight: '900', fontSize: '17px', flexShrink: 0 }}>
            📊 SPED
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: 'bold', wordBreak: 'break-word' }}>Sistema Público de Escrituração Digital (PVA)</div>
            <div style={{ fontSize: '11.5px', color: '#93c5fd', wordBreak: 'break-word' }}>EFD ICMS/IPI e Escrituração Contábil Digital (ECD)</div>
          </div>
        </div>

        {/* SELETOR DE TIPO E ABAS */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <button onClick={() => { setTipoSped('fiscal'); setAbaSped('blocos'); setValidoPva(false); }} style={{ padding: '8px 12px', backgroundColor: tipoSped === 'fiscal' ? '#f59e0b' : '#1e3a8a', color: tipoSped === 'fiscal' ? '#071d41' : 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer' }}>
            🧾 SPED Fiscal (EFD)
          </button>
          <button onClick={() => { setTipoSped('contabil'); setAbaSped('blocos'); setValidoPva(false); }} style={{ padding: '8px 12px', backgroundColor: tipoSped === 'contabil' ? '#f59e0b' : '#1e3a8a', color: tipoSped === 'contabil' ? '#071d41' : 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer' }}>
            📚 SPED Contábil (ECD)
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '0 0 16px 16px', border: '1px solid #e2e8f0', borderTop: 'none', minHeight: '500px', boxSizing: 'border-box', width: '100%' }}>
        
        {/* SUB-ABAS DO SPED */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #cbd5e1', paddingBottom: '12px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <button onClick={() => setAbaSped('blocos')} style={{ padding: '8px 14px', backgroundColor: abaSped === 'blocos' ? '#071d41' : 'white', color: abaSped === 'blocos' ? 'white' : '#1e293b', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
            1. Estrutura de Blocos & Dados
          </button>
          <button onClick={() => setAbaSped('validacao')} style={{ padding: '8px 14px', backgroundColor: abaSped === 'validacao' ? '#071d41' : 'white', color: abaSped === 'validacao' ? 'white' : '#1e293b', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
            2. Validação PVA (Erros)
          </button>
          <button onClick={() => setAbaSped('txt')} style={{ padding: '8px 14px', backgroundColor: abaSped === 'txt' ? '#071d41' : 'white', color: abaSped === 'txt' ? 'white' : '#1e293b', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
            3. Layout TXT & Transmissão
          </button>
        </div>

        {/* 1. ABA DE BLOCOS E DADOS */}
        {abaSped === 'blocos' && (
          <div style={{ boxSizing: 'border-box' }}>
            {tipoSped === 'fiscal' ? (
              <div style={{ boxSizing: 'border-box' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#071d41', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', fontSize: '15px', wordBreak: 'break-word' }}>
                  EFD ICMS/IPI - Bloco 0 (Cadastros), Bloco C (Notas) e Bloco E (Apuração)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px', backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', marginBottom: '20px', boxSizing: 'border-box' }}>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Período Inicial / Final</label>
                    <input type="text" value={`${spedFiscal.periodoInicial} a ${spedFiscal.periodoFinal}`} onChange={e => setSpedFiscal({...spedFiscal, periodoInicial: e.target.value})} style={inputStyle} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Total Notas de Saída (R$)</label>
                    <input type="text" value={spedFiscal.totalNotasSaida} onChange={e => setSpedFiscal({...spedFiscal, totalNotasSaida: e.target.value} )} style={inputStyle} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Total Notas de Entrada (R$)</label>
                    <input type="text" value={spedFiscal.totalNotasEntrada} onChange={e => setSpedFiscal({...spedFiscal, totalNotasEntrada: e.target.value} )} style={inputStyle} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>ICMS Apurado a Recolher (R$)</label>
                    <input type="text" value={spedFiscal.icmsRecolher} onChange={e => setSpedFiscal({...spedFiscal, icmsRecolher: e.target.value} )} style={{ ...inputStyle, fontWeight: 'bold', color: '#16a34a', borderColor: '#86efac', backgroundColor: '#f0fdf4' }} />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ boxSizing: 'border-box' }}>
                <h3 style={{ margin: '0 0 16px 0', color: '#071d41', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', fontSize: '15px', wordBreak: 'break-word' }}>
                  SPED Contábil (ECD) - Bloco I (Lançamentos) e Bloco J (Balanço e DRE)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '16px', backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', marginBottom: '20px', boxSizing: 'border-box' }}>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Ativo Total (R$)</label>
                    <input type="text" value={spedContabil.ativoTotal} onChange={e => setSpedContabil({...spedContabil, ativoTotal: e.target.value})} style={inputStyle} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Passivo Total (R$)</label>
                    <input type="text" value={spedContabil.passivoTotal} onChange={e => setSpedContabil({...spedContabil, passivoTotal: e.target.value} )} style={inputStyle} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Patrimônio Líquido (R$)</label>
                    <input type="text" value={spedContabil.patrimonioLiquido} onChange={e => setSpedContabil({...spedContabil, patrimonioLiquido: e.target.value} )} style={inputStyle} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <label style={labelStyle}>Lucro Líquido do Exercício (R$)</label>
                    <input type="text" value={spedContabil.lucroLiquidoExercicio} onChange={e => setSpedContabil({...spedContabil, lucroLiquidoExercicio: e.target.value} )} style={{ ...inputStyle, fontWeight: 'bold', color: '#16a34a', borderColor: '#86efac', backgroundColor: '#f0fdf4' }} />
                  </div>
                </div>
              </div>
            )}
            <button onClick={() => setAbaSped('validacao')} style={{ backgroundColor: '#071d41', color: 'white', border: 'none', padding: '12px 22px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box', width: '100%', maxWidth: '280px' }}>
              Executar Validação PVA →
            </button>
          </div>
        )}

        {/* 2. ABA DE VALIDAÇÃO PVA */}
        {abaSped === 'validacao' && (
          <div style={{ boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#071d41', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', fontSize: '15px', wordBreak: 'break-word' }}>
              Validação Oficial do Programa Validador e Assinador (PVA)
            </h3>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
              <button onClick={executarValidacaoPva} style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box', width: '100%', maxWidth: '280px' }}>
                ▶️ Processar Validação do Arquivo
              </button>
            </div>

            {errosValidacao.length > 0 && (
              <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', padding: '16px', borderRadius: '12px', marginBottom: '20px', boxSizing: 'border-box' }}>
                <strong style={{ color: '#991b1b', display: 'block', marginBottom: '8px', wordBreak: 'break-word' }}>⚠️ Erros Impeditivos Encontrados pelo PVA:</strong>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#7f1d1d', fontSize: '13px', wordBreak: 'break-word' }}>
                  {errosValidacao.map((err, i) => <li key={i}>{err.msg}</li>)}
                </ul>
              </div>
            )}

            {validoPva && (
              <div style={{ backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '12px', marginBottom: '20px', boxSizing: 'border-box' }}>
                <strong style={{ color: '#166534', display: 'block', marginBottom: '4px', wordBreak: 'break-word' }}>✅ Validação Concluída com Sucesso!</strong>
                <span style={{ fontSize: '13px', color: '#15803d', wordBreak: 'break-word' }}>O arquivo SPED está perfeitamente estruturado e pronto para assinatura com certificado digital e transmissão.</span>
                <div style={{ marginTop: '12px', boxSizing: 'border-box' }}>
                  <button onClick={() => setAbaSped('txt')} style={{ backgroundColor: '#071d41', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', boxSizing: 'border-box', width: '100%', maxWidth: '280px' }}>
                    Avançar para Visualização TXT →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. ABA DE VISUALIZAÇÃO TXT E TRANSMISSÃO */}
        {abaSped === 'txt' && (
          <div style={{ boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#071d41', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', fontSize: '15px', wordBreak: 'break-word' }}>
              Layout Oficial do Arquivo SPED (Formato Texto Ato COTEPE)
            </h3>
            
            <div style={{ backgroundColor: '#0f172a', color: '#38bdf8', padding: '16px', borderRadius: '12px', fontFamily: 'monospace', fontSize: '11.5px', height: '220px', overflowY: 'auto', marginBottom: '20px', border: '1px solid #334155', boxSizing: 'border-box', wordBreak: 'break-all' }}>
              {tipoSped === 'fiscal' ? (
                <>
                  <div>|0000|0|{spedFiscal.periodoInicial.replace(/\//g,'')}|{spedFiscal.periodoFinal.replace(/\//g,'')}|{spedFiscal.nomeEmpresa}|{spedFiscal.cnpj}|{spedFiscal.ie||''}|SP|3550308|||A|1|</div>
                  <div>|0001|0|</div>
                  <div>|0100|{spedFiscal.contadorNome}|{spedFiscal.contadorCrc}|48912345000188||06730000|Rua Ponta Negra|100||Parque do Agreste|Vargem Grande Paulista|1199887766|</div>
                  <div>|0990|4|</div>
                  <div>|C001|0|</div>
                  <div>|C990|2|</div>
                  <div>|E001|0|</div>
                  <div>|E100|{spedFiscal.periodoInicial.replace(/\//g,'')}|{spedFiscal.periodoFinal.replace(/\//g,'')}|</div>
                  <div>|E110|{formatMoeda(spedFiscal.icmsApuradoDebito).replace('.','')}|0.00|0.00|{formatMoeda(spedFiscal.icmsApuradoCredito).replace('.','')}|0.00|{formatMoeda(spedFiscal.icmsRecolher).replace('.','')}|</div>
                  <div>|E990|5|</div>
                  <div>|9001|0|</div>
                  <div>|9900|10|</div>
                  <div>|9990|12|</div>
                  <div>|9999|15|</div>
                </>
              ) : (
                <>
                  <div>|0000|{spedContabil.dataInicio.replace(/\//g,'')}|{spedContabil.dataFim.replace(/\//g,'')}|{spedContabil.nomeEmpresa}|{spedContabil.cnpj}|SP||</div>
                  <div>|0007|SP|JUCESP|35299847121|</div>
                  <div>|I001|0|</div>
                  <div>|I010|N|A|</div>
                  <div>|J001|0|</div>
                  <div>|J100|{spedContabil.dataInicio}|{spedContabil.dataFim}|1|ATIVO TOTAL|{Number(spedContabil.ativoTotal || 0).toFixed(2)}|</div>
                  <div>|J100|{spedContabil.dataInicio}|{spedContabil.dataFim}|2|PASSIVO + PL|{(Number(spedContabil.passivoTotal || 0) + Number(spedContabil.patrimonioLiquido || 0)).toFixed(2)}|</div>
                  <div>|9001|0|</div>
                  <div>|9999|8|</div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
              <button onClick={() => window.print()} style={{ backgroundColor: '#071d41', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box', width: '100%', maxWidth: '280px' }}>
                🖨️ Guardar Arquivo SPED (.txt)
              </button>
              <button onClick={() => { if (typeof mostrarToast === 'function') mostrarToast("SPED transmitido com sucesso à Receita Federal com Assinatura Digital e-CPF/e-CNPJ!", "sucesso"); }} style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box', width: '100%', maxWidth: '300px' }}>
                🔐 Assinar e Transmitir SPED Oficial →
              </button>
            </div>
          </div>
        )}

      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}