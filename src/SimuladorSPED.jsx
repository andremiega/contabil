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
        if (mostrarToast) mostrarToast("SPED Fiscal validado com sucesso pelo PVA! Sem erros impeditivos.", "sucesso");
      } else {
        setValidoPva(false);
        if (mostrarToast) mostrarToast("Encontradas inconsistências no PVA do SPED.", "erro");
      }
    } else {
      const diferencaBalanço = spedContabil.ativoTotal - (spedContabil.passivoTotal + spedContabil.patrimonioLiquido);
      if (Math.abs(diferencaBalanço) > 0.01) {
        alertas.push({ tipo: 'Erro', msg: `Bloco J: Balanço Patrimonial não fecha! Ativo (R$ ${formatMoeda(spedContabil.ativoTotal)}) diverge do Passivo + PL (R$ ${formatMoeda(spedContabil.passivoTotal + spedContabil.patrimonioLiquido)}).` });
        setValidoPva(false);
      } else {
        setValidoPva(true);
        if (mostrarToast) mostrarToast("SPED Contábil (ECD) validado sem divergências patrimoniais!", "sucesso");
      }
    }
    setErrosValidacao(alertas);
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b' }}>
      
      {/* CABEÇALHO DO SPED */}
      <div style={{ backgroundColor: '#071d41', color: 'white', padding: '14px 22px', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', borderBottom: '4px solid #f59e0b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#f59e0b', color: '#071d41', padding: '8px 12px', borderRadius: '8px', fontWeight: '900', fontSize: '18px' }}>
            📊 SPED Digital
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 'bold' }}>Sistema Público de Escrituração Digital (PVA & Transmissão)</div>
            <div style={{ fontSize: '11px', color: '#93c5fd' }}>Escrituração Fiscal Digital (EFD ICMS/IPI) e Escrituração Contábil Digital (ECD)</div>
          </div>
        </div>

        {/* SELETOR DE TIPO E ABAS */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button onClick={() => { setTipoSped('fiscal'); setAbaSped('blocos'); setValidoPva(false); }} style={{ padding: '7px 10px', backgroundColor: tipoSped === 'fiscal' ? '#f59e0b' : '#1e3a8a', color: tipoSped === 'fiscal' ? '#071d41' : 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer' }}>
            🧾 SPED Fiscal (EFD)
          </button>
          <button onClick={() => { setTipoSped('contabil'); setAbaSped('blocos'); setValidoPva(false); }} style={{ padding: '7px 10px', backgroundColor: tipoSped === 'contabil' ? '#f59e0b' : '#1e3a8a', color: tipoSped === 'contabil' ? '#071d41' : 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '11.5px', cursor: 'pointer' }}>
            📚 SPED Contábil (ECD)
          </button>
        </div>
      </div>

      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '0 0 12px 12px', border: '1px solid #cbd5e1' }}>
        
        {/* SUB-ABAS DO SPED */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>
          <button onClick={() => setAbaSped('blocos')} style={{ padding: '8px 14px', backgroundColor: abaSped === 'blocos' ? '#071d41' : '#f1f5f9', color: abaSped === 'blocos' ? 'white' : '#1e293b', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12.5px', cursor: 'pointer' }}>
            1. Estrutura de Blocos & Dados
          </button>
          <button onClick={() => setAbaSped('validacao')} style={{ padding: '8px 14px', backgroundColor: abaSped === 'validacao' ? '#071d41' : '#f1f5f9', color: abaSped === 'validacao' ? 'white' : '#1e293b', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12.5px', cursor: 'pointer' }}>
            2. Validação PVA (Erros e Avisos)
          </button>
          <button onClick={() => setAbaSped('txt')} style={{ padding: '8px 14px', backgroundColor: abaSped === 'txt' ? '#071d41' : '#f1f5f9', color: abaSped === 'txt' ? 'white' : '#1e293b', border: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '12.5px', cursor: 'pointer' }}>
            3. Visualização Layout TXT & Transmissão
          </button>
        </div>

        {/* 1. ABA DE BLOCOS E DADOS */}
        {abaSped === 'blocos' && (
          <div>
            {tipoSped === 'fiscal' ? (
              <div>
                <h3 style={{ margin: '0 0 15px 0', color: '#071d41', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
                  EFD ICMS/IPI - Bloco 0 (Cadastros), Bloco C (Notas Fiscais) e Bloco E (Apuração)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', backgroundColor: '#f8fafc', padding: '18px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Período Inicial / Final</label>
                    <input type="text" value={`${spedFiscal.periodoInicial} a ${spedFiscal.periodoFinal}`} onChange={e => setSpedFiscal({...spedFiscal, periodoInicial: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Total Notas de Saída (R$)</label>
                    <input type="text" value={spedFiscal.totalNotasSaida} onChange={e => setSpedFiscal({...spedFiscal, totalNotasSaida: e.target.value} )} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Total Notas de Entrada (R$)</label>
                    <input type="text" value={spedFiscal.totalNotasEntrada} onChange={e => setSpedFiscal({...spedFiscal, totalNotasEntrada: e.target.value} )} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>ICMS Apurado a Recolher (R$)</label>
                    <input type="text" value={spedFiscal.icmsRecolher} onChange={e => setSpedFiscal({...spedFiscal, icmsRecolher: e.target.value} )} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', fontWeight: 'bold', color: '#16a34a', boxSizing: 'border-box' }} />
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h3 style={{ margin: '0 0 15px 0', color: '#071d41', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
                  SPED Contábil (ECD) - Bloco I (Lançamentos) e Bloco J (Balanço e DRE)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', backgroundColor: '#f8fafc', padding: '18px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Ativo Total (R$)</label>
                    <input type="text" value={spedContabil.ativoTotal} onChange={e => setSpedContabil({...spedContabil, ativoTotal: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Passivo Total (R$)</label>
                    <input type="text" value={spedContabil.passivoTotal} onChange={e => setSpedContabil({...spedContabil, passivoTotal: e.target.value} )} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Patrimônio Líquido (R$)</label>
                    <input type="text" value={spedContabil.patrimonioLiquido} onChange={e => setSpedContabil({...spedContabil, patrimonioLiquido: e.target.value} )} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Lucro Líquido do Exercício (R$)</label>
                    <input type="text" value={spedContabil.lucroLiquidoExercicio} onChange={e => setSpedContabil({...spedContabil, lucroLiquidoExercicio: e.target.value} )} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', fontWeight: 'bold', color: '#16a34a', boxSizing: 'border-box' }} />
                  </div>
                </div>
              </div>
            )}
            <button onClick={() => setAbaSped('validacao')} style={{ backgroundColor: '#071d41', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Executar Validação PVA →
            </button>
          </div>
        )}

        {/* 2. ABA DE VALIDAÇÃO PVA */}
        {abaSped === 'validacao' && (
          <div>
            <h3 style={{ margin: '0 0 15px 0', color: '#071d41', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
              Validação Oficial do Programa Validador e Assinador (PVA)
            </h3>
            
            <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <button onClick={executarValidacaoPva} style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                ▶️ Processar Validação do Arquivo SPED
              </button>
            </div>

            {errosValidacao.length > 0 && (
              <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fecaca', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                <strong style={{ color: '#991b1b', display: 'block', marginBottom: '8px' }}>⚠️ Erros Impeditivos Encontrados pelo PVA:</strong>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#7f1d1d', fontSize: '13px' }}>
                  {errosValidacao.map((err, i) => <li key={i}>{err.msg}</li>)}
                </ul>
              </div>
            )}

            {validoPva && (
              <div style={{ backgroundColor: '#dcfce7', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
                <strong style={{ color: '#166534', display: 'block', marginBottom: '4px' }}>✅ Validação Concluída com Sucesso!</strong>
                <span style={{ fontSize: '13px', color: '#15803d' }}>O arquivo SPED está perfeitamente estruturado e pronto para assinatura com certificado digital e transmissão.</span>
                <div style={{ marginTop: '12px' }}>
                  <button onClick={() => setAbaSped('txt')} style={{ backgroundColor: '#071d41', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}>
                    Avançar para Visualização TXT e Transmissão →
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 3. ABA DE VISUALIZAÇÃO TXT E TRANSMISSÃO */}
        {abaSped === 'txt' && (
          <div>
            <h3 style={{ margin: '0 0 15px 0', color: '#071d41', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
              Layout Oficial do Arquivo SPED (Formato Texto Ato COTEPE)
            </h3>
            
            <div style={{ backgroundColor: '#0f172a', color: '#38bdf8', padding: '16px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '12px', height: '220px', overflowY: 'auto', marginBottom: '20px', border: '1px solid #334155' }}>
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
                  <div>|J100|{spedContabil. dataInicio}|{spedContabil.dataFim}|1|ATIVO TOTAL|{spedContabil.ativoTotal.toFixed(2)}|</div>
                  <div>|J100|{spedContabil.dataInicio}|{spedContabil.dataFim}|2|PASSIVO + PL|{(spedContabil.passivoTotal + spedContabil.patrimonioLiquido).toFixed(2)}|</div>
                  <div>|9001|0|</div>
                  <div>|9999|8|</div>
                </>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => window.print()} style={{ backgroundColor: '#071d41', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                🖨️ Imprimir / Guardar Arquivo SPED (.txt)
              </button>
              <button onClick={() => { if (mostrarToast) mostrarToast("SPED transmitido com sucesso à Receita Federal com Assinatura Digital e-CPF/e-CNPJ!", "sucesso"); }} style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                🔐 Assinar e Transmitir SPED Oficial →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}