import React, { useState, useMemo } from 'react';

export default function SimuladorEstatisticaAvancada({ mostrarToast }) {
  const formatNum = (v, dec = 2) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // 1. CATÁLOGO DE CENÁRIOS EMPRESARIAIS (COM CONTEXTO DO PROBLEMA)
  const cenariosPreDefinidos = [
    {
      id: 'treinamento',
      setor: '🎓 Educação & RH',
      titulo: 'Avaliação de Desempenho Técnico (Treinamento)',
      problema: 'A diretoria investiu R$ 50.000 num novo treinamento contábil. A dor é: "Será que a equipe realmente aprendeu e vai evitar multas fiscais?". Precisamos que a média da turma seja de no mínimo 70 pontos. O impacto reflete o custo de retreinamento por ponto abaixo da meta.',
      variavel: 'Nota na Avaliação',
      unidade: 'pontos',
      amostraPadrao: [49.0, 51.3, 54.9, 55.1, 58.2, 59.8, 61.1, 64.8, 65.3, 65.5, 66.4, 66.4, 67.0, 68.5, 69.2, 69.2, 69.3, 70.3, 72.8, 73.3, 74.9, 75.8, 76.5, 78.0, 78.5, 79.8, 81.2, 89.6, 90.3, 91.0],
      metaReferencia: 70.0,
      fatorImpactoFinanceiro: 320.00
    },
    {
      id: 'sla_suporte',
      setor: '🎧 Atendimento & TI',
      titulo: 'Tempo de Resolução de Chamados (SLA)',
      problema: 'Clientes estão cancelando contratos alegando lentidão. O contrato exige que o suporte resolva problemas em no máximo 30 minutos (SLA). Precisamos provar estatisticamente se a equipe está cumprindo a meta ou se precisaremos pagar multas contratuais (Impacto).',
      variavel: 'Tempo de Resolução',
      unidade: 'minutos',
      amostraPadrao: [14.2, 16.5, 18.0, 19.4, 21.0, 22.5, 23.1, 24.0, 25.5, 26.0, 27.2, 28.0, 28.5, 29.0, 30.2, 31.0, 32.4, 33.0, 34.5, 36.0, 37.8, 39.0, 41.2, 43.0, 45.5, 48.0, 51.2, 54.0, 58.5, 62.0],
      metaReferencia: 30.0,
      fatorImpactoFinanceiro: 120.00
    },
    {
      id: 'industria_qualidade',
      setor: '⚙️ Produção & Qualidade',
      titulo: 'Peso Líquido de Embalagens Automatizadas',
      problema: 'Risco de processo: Se a máquina de envase colocar menos de 1000g, sofremos multas do Procon. Se colocar muito a mais, temos desperdício de matéria-prima. Queremos verificar se a média real do maquinário está desregulada em relação à meta.',
      variavel: 'Peso Líquido',
      unidade: 'gramas',
      amostraPadrao: [982, 986, 988, 990, 992, 994, 995, 996, 997, 998, 999, 1000, 1000, 1001, 1001, 1002, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1010, 1012, 1014, 1015, 1018, 1020, 1025],
      metaReferencia: 1000.0,
      fatorImpactoFinanceiro: 450.00
    }
  ];

  // Estado Padrão Inicial
  const [casoAtivo, setCasoAtivo] = useState(cenariosPreDefinidos[0]);
  const [textoAmostra, setTextoAmostra] = useState(cenariosPreDefinidos[0].amostraPadrao.join(', '));
  const [abaAtiva, setAbaAtiva] = useState('coleta');
  const [nivelConfianca, setNivelConfianca] = useState(95);
  const [mediaHipotetica, setMediaHipotetica] = useState(cenariosPreDefinidos[0].metaReferencia);
  const [isCustom, setIsCustom] = useState(false);

  const selecionarCasoEmpresarial = (caso) => {
    setIsCustom(false);
    setCasoAtivo(caso);
    setTextoAmostra(caso.amostraPadrao.join(', '));
    setMediaHipotetica(caso.metaReferencia);
    if (mostrarToast) mostrarToast(`Cenário alterado para: ${caso.titulo}`, 'sucesso');
  };

  const ativarModoCustomizado = () => {
    setIsCustom(true);
    const casoVazio = {
      id: 'custom',
      setor: '🛠️ Personalizado',
      titulo: 'Meu Problema de Negócio',
      problema: 'Descreva a dor que você quer resolver. Qual é o problema real?',
      variavel: 'Minha Variável',
      unidade: 'un.',
      metaReferencia: 100,
      fatorImpactoFinanceiro: 50.00
    };
    setCasoAtivo(casoVazio);
    setTextoAmostra('80, 90, 100, 110, 120'); 
    setMediaHipotetica(100);
    if (mostrarToast) mostrarToast(`Modo Personalizado Ativado! Configure seu problema.`, 'sucesso');
  };

  // 2. PARSING E PROCESSAMENTO MATEMÁTICO (ROL)
  const amostraProcessada = useMemo(() => {
    return textoAmostra
      .split(',')
      .map(v => parseFloat(v.trim().replace(',', '.')))
      .filter(v => !isNaN(v))
      .sort((a, b) => a - b);
  }, [textoAmostra]);

  const N = amostraProcessada.length;
  const Xmin = N > 0 ? amostraProcessada[0] : 0;
  const Xmax = N > 0 ? amostraProcessada[N - 1] : 0;
  const amplitudeTotal = Xmax - Xmin;

  // 3. ESTATÍSTICA DESCRITIVA BÁSICA
  const somaAmostral = useMemo(() => amostraProcessada.reduce((acc, v) => acc + v, 0), [amostraProcessada]);
  const mediaAmostralReal = N > 0 ? somaAmostral / N : 0;

  const medianaReal = useMemo(() => {
    if (N === 0) return 0;
    const meio = Math.floor(N / 2);
    return N % 2 !== 0 ? amostraProcessada[meio] : (amostraProcessada[meio - 1] + amostraProcessada[meio]) / 2;
  }, [amostraProcessada, N]);

  const { varianciaAmostral, desvioPadraoReal, coeficienteVariacao } = useMemo(() => {
    if (N <= 1) return { varianciaAmostral: 0, desvioPadraoReal: 0, coeficienteVariacao: 0 };
    const somaQuadrados = amostraProcessada.reduce((acc, v) => acc + Math.pow(v - mediaAmostralReal, 2), 0);
    const variancia = somaQuadrados / (N - 1);
    const desvio = Math.sqrt(variancia);
    const cv = mediaAmostralReal > 0 ? (desvio / mediaAmostralReal) * 100 : 0;
    return { varianciaAmostral: variancia, desvioPadraoReal: desvio, coeficienteVariacao: cv };
  }, [amostraProcessada, N, mediaAmostralReal]);

  // 4. TABELA DE DISTRIBUIÇÃO DE FREQUÊNCIAS (TDF)
  const k_sturges = N > 0 ? Math.max(4, Math.round(1 + 3.322 * Math.log10(N))) : 0;
  const h_amplitude = k_sturges > 0 ? (amplitudeTotal / k_sturges) * 1.02 : 0;

  const tdfClasses = useMemo(() => {
    if (N < 4) return [];
    const classes = [];
    let limInf = Xmin;
    let somaFiAcum = 0;
    for (let i = 0; i < k_sturges; i++) {
      const limSup = limInf + h_amplitude;
      const pontoMedio = (limInf + limSup) / 2;
      const elementos = amostraProcessada.filter(v => (i === k_sturges - 1 ? v >= limInf && v <= limSup : v >= limInf && v < limSup));
      const fi = elementos.length;
      somaFiAcum += fi;
      const fr = (fi / N) * 100;
      classes.push({ classe: i + 1, limInf, limSup, pontoMedio, fi, fiAcum: somaFiAcum, fr });
      limInf = limSup;
    }
    return classes;
  }, [amostraProcessada, N, Xmin, k_sturges, h_amplitude]);

  // 5. INTERVALO DE CONFIANÇA E HIPÓTESES
  const zScore = nivelConfianca === 90 ? 1.645 : nivelConfianca === 99 ? 2.576 : 1.96;
  
  // A VARIÁVEL T-CRÍTICO RESTAURADA PARA O TESTE
  const tCritico = zScore; 
  
  const erroPadraoAmostral = N > 0 ? desvioPadraoReal / Math.sqrt(N) : 0;
  const margemErro = zScore * erroPadraoAmostral;
  const icInferior = mediaAmostralReal - margemErro;
  const icSuperior = mediaAmostralReal + margemErro;

  const tCalculado = erroPadraoAmostral > 0 ? (mediaAmostralReal - mediaHipotetica) / erroPadraoAmostral : 0;
  const rejeitaH0 = Math.abs(tCalculado) > tCritico;

  // 6. IMPACTO FINANCEIRO
  const diferencaMeta = mediaAmostralReal - casoAtivo.metaReferencia;
  const impactoFinanceiroCalc = Math.abs(diferencaMeta) * casoAtivo.fatorImpactoFinanceiro * N;

  const inputStyle = { width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' };

  return (
    <div style={{ width: '100%', maxWidth: '100%', margin: 0, padding: 0, boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      
      {/* CABEÇALHO SUPERIOR */}
      <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px', borderRadius: '12px 12px 0 0', borderBottom: '4px solid #3b82f6', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ backgroundColor: '#2563eb', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '900' }}>DATA SCIENCE APLICADO</span>
              <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Estatística para Tomada de Decisão</span>
            </div>
            <div style={{ fontSize: '13px', color: '#94a3b8' }}>Da Coleta de Dados ao Impacto Financeiro (Estatística Descritiva & Inferencial).</div>
          </div>
        </div>

        {/* SELEÇÃO DOS CENÁRIOS */}
        <div style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px' }}>1. Qual problema de negócio vamos analisar?</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
          {cenariosPreDefinidos.map(c => {
            const ativo = !isCustom && casoAtivo.id === c.id;
            return (
              <button key={c.id} type="button" onClick={() => selecionarCasoEmpresarial(c)}
                style={{ padding: '10px', borderRadius: '8px', border: ativo ? '2px solid #38bdf8' : '1px solid #334155', backgroundColor: ativo ? '#1e3a8a' : '#1e293b', color: 'white', fontSize: '12px', fontWeight: ativo ? 'bold' : 'normal', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
              >
                <span style={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px' }}>{c.setor}</span>
                <span style={{ textAlign: 'left', lineHeight: '1.2' }}>{c.titulo}</span>
              </button>
            );
          })}
          {/* BOTAO CENARIO CUSTOMIZADO */}
          <button type="button" onClick={ativarModoCustomizado}
            style={{ padding: '10px', borderRadius: '8px', border: isCustom ? '2px solid #10b981' : '1px dashed #cbd5e1', backgroundColor: isCustom ? '#064e3b' : 'transparent', color: isCustom ? 'white' : '#cbd5e1', fontSize: '12px', fontWeight: isCustom ? 'bold' : 'normal', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}
          >
            <span style={{ color: isCustom ? '#6ee7b7' : '#94a3b8', fontSize: '10px', marginBottom: '4px' }}>🛠️ Customizado</span>
            <span style={{ textAlign: 'left', lineHeight: '1.2' }}>+ Criar Meu Próprio Problema</span>
          </button>
        </div>

        {/* TABS NAVEGAÇÃO DOS CÁLCULOS */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[
            { id: 'coleta', label: '📥 1. Problema & Amostra' },
            { id: 'tdf', label: '📋 2. Distribuição TDF' },
            { id: 'descritiva', label: '📊 3. Médias e Dispersão' },
            { id: 'confianca', label: '🎯 4. Nível de Confiança' },
            { id: 'hipoteses', label: '⚖️ 5. Teste Hipóteses' },
            { id: 'cenarios', label: '🏢 6. Decisão e Custo Final' }
          ].map(aba => (
            <button key={aba.id} type="button" onClick={() => setAbaAtiva(aba.id)}
              style={{ flex: '1 1 auto', padding: '10px 8px', borderRadius: '8px', border: abaAtiva === aba.id ? '2px solid #60a5fa' : '1px solid #334155', fontWeight: abaAtiva === aba.id ? 'bold' : '600', fontSize: '12px', cursor: 'pointer', backgroundColor: abaAtiva === aba.id ? '#2563eb' : '#1e293b', color: 'white' }}
            >
              {aba.label}
            </button>
          ))}
        </div>
      </div>

      {/* ÁREA BRANCA - CORPO PRINCIPAL */}
      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '0 0 12px 12px', border: '1px solid #cbd5e1', borderTop: 'none', width: '100%', boxSizing: 'border-box' }}>
        
        {/* ========================================================
            PASSO 1: COLETA (COM FORMULÁRIO SE FOR CUSTOMIZADO E ROL COM FONTE GIGANTE)
            ======================================================== */}
        {abaAtiva === 'coleta' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>Passo 1: Entendimento do Problema e Inserção da Amostra (Rol)</h3>
            
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #3b82f6', marginBottom: '20px' }}>
              <strong style={{ fontSize: '14px', color: '#1e3a8a', display: 'block', marginBottom: '6px' }}>Contexto do Negócio: Por que estamos calculando isso?</strong>
              {isCustom ? (
                <textarea id="textoContextoNegocio" name="textoContextoNegocio" rows="3" style={inputStyle} value={casoAtivo.problema} onChange={e => setCasoAtivo({...casoAtivo, problema: e.target.value})} placeholder="Ex: Precisamos saber se a perda de estoque passou da meta..." />
              ) : (
                <p style={{ margin: 0, fontSize: '13px', color: '#1e40af', lineHeight: '1.5' }}>{casoAtivo.problema}</p>
              )}
            </div>

            {isCustom && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px dashed #94a3b8', marginBottom: '20px' }}>
                <div style={{ gridColumn: '1 / -1' }}><label htmlFor="inputTituloProjeto" style={{ fontSize: '12px', fontWeight: 'bold' }}>Título do Projeto Estatístico:</label><input id="inputTituloProjeto" name="inputTituloProjeto" style={inputStyle} value={casoAtivo.titulo} onChange={e => setCasoAtivo({...casoAtivo, titulo: e.target.value})} /></div>
                <div><label htmlFor="inputNomeVariavel" style={{ fontSize: '12px', fontWeight: 'bold' }}>Nome da Variável:</label><input id="inputNomeVariavel" name="inputNomeVariavel" style={inputStyle} value={casoAtivo.variavel} onChange={e => setCasoAtivo({...casoAtivo, variavel: e.target.value})} /></div>
                <div><label htmlFor="inputUnidade" style={{ fontSize: '12px', fontWeight: 'bold' }}>Unidade de Medida:</label><input id="inputUnidade" name="inputUnidade" style={inputStyle} value={casoAtivo.unidade} onChange={e => setCasoAtivo({...casoAtivo, unidade: e.target.value})} /></div>
                <div><label htmlFor="inputMetaHipotetica" style={{ fontSize: '12px', fontWeight: 'bold', color: '#16a34a' }}>Meta a Atingir (μ):</label><input id="inputMetaHipotetica" name="inputMetaHipotetica" type="number" style={inputStyle} value={casoAtivo.metaReferencia} onChange={e => { setCasoAtivo({...casoAtivo, metaReferencia: e.target.value}); setMediaHipotetica(e.target.value); }} /></div>
                <div><label htmlFor="inputFatorImpacto" style={{ fontSize: '12px', fontWeight: 'bold', color: '#dc2626' }}>Custo por Unid. Errada (R$):</label><input id="inputFatorImpacto" name="inputFatorImpacto" type="number" style={inputStyle} value={casoAtivo.fatorImpactoFinanceiro} onChange={e => setCasoAtivo({...casoAtivo, fatorImpactoFinanceiro: e.target.value})} /></div>
              </div>
            )}

            <label htmlFor="textareaAmostraBruta" style={{ fontWeight: 'bold', fontSize: '13px', color: '#334155', display: 'block', marginBottom: '6px' }}>
              Base de Dados Coletada (Valores separados por vírgula):
            </label>
            <textarea id="textareaAmostraBruta" name="textareaAmostraBruta" rows={4} value={textoAmostra} onChange={e => setTextoAmostra(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: '14px', boxSizing: 'border-box', marginBottom: '14px' }} />

            <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
              <div style={{ fontWeight: '900', fontSize: '15px', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>🔢</span> Rol Ordenado Automaticamente (Crescente N = {N}):
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {amostraProcessada.map((v, i) => (
                  <span key={i} style={{ backgroundColor: 'white', border: '1px solid #cbd5e1', padding: '8px 12px', borderRadius: '8px', fontSize: '18px', fontFamily: 'monospace', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: '#94a3b8', fontSize: '12px', marginRight: '8px', fontWeight: 'bold' }}>{i + 1}º</span> 
                    <strong style={{ color: '#0f172a' }}>{formatNum(v, 2)}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PASSO 2: TABELA TDF E CÁLCULOS */}
        {abaAtiva === 'tdf' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>Passo 2: Tabela de Distribuição de Frequências (TDF)</h3>
            
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #ef4444', marginBottom: '20px' }}>
              <strong style={{ fontSize: '14px', color: '#991b1b', display: 'block', marginBottom: '8px' }}>Memória de Cálculo (Como montamos a tabela?):</strong>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#7f1d1d', lineHeight: '1.6' }}>
                <li><strong>Amplitude Total (At):</strong> Máximo - Mínimo = {formatNum(Xmax)} - {formatNum(Xmin)} = <strong>{formatNum(amplitudeTotal)}</strong></li>
                <li><strong>Número de Classes (k):</strong> Regra de Sturges: <code>k = 1 + 3,322 * log10({N})</code> = <strong>{k_sturges} classes</strong>.</li>
                <li><strong>Amplitude da Classe (h):</strong> <code>h = At / k</code> = {formatNum(amplitudeTotal)} / {k_sturges} = <strong>{formatNum(h_amplitude)}</strong> (ajustado com folga de 2%).</li>
              </ul>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                    <th style={{ padding: '12px' }}>Classe (i)</th>
                    <th style={{ padding: '12px' }}>Intervalo [Li ⊢ Ls)</th>
                    <th style={{ padding: '12px' }}>Ponto Médio (xi)</th>
                    <th style={{ padding: '12px' }}>Freq. Absoluta (fi)</th>
                    <th style={{ padding: '12px' }}>Freq. Relativa (fr %)</th>
                  </tr>
                </thead>
                <tbody>
                  {tdfClasses.map(c => (
                    <tr key={c.classe} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', fontWeight: 'bold' }}>Classe {c.classe}</td>
                      <td style={{ padding: '12px' }}>{formatNum(c.limInf)} ⊢ {formatNum(c.limSup)}</td>
                      <td style={{ padding: '12px' }}>{formatNum(c.pontoMedio)}</td>
                      <td style={{ padding: '12px', fontWeight: 'bold', color: '#2563eb' }}>{c.fi}</td>
                      <td style={{ padding: '12px' }}>{formatNum(c.fr, 1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PASSOS 3: MEDIDAS DESCRITIVAS */}
        {abaAtiva === 'descritiva' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>Passo 3: Medidas Descritivas (Posição e Dispersão)</h3>
            
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #16a34a', marginBottom: '20px', fontSize: '13px', color: '#166534', lineHeight: '1.6' }}>
              <strong style={{ display: 'block', fontSize: '14px', marginBottom: '6px' }}>Entendendo as Fórmulas Matemáticas aplicadas:</strong>
              • <strong>Média (X̄):</strong> Soma de todos os {N} valores ({formatNum(somaAmostral)}) dividida por {N}.<br/>
              • <strong>Variância (S²):</strong> Somatório dos quadrados das diferenças entre cada valor e a média, dividido por (N - 1). Resultou em {formatNum(varianciaAmostral)}.<br/>
              • <strong>Desvio Padrão (S):</strong> A raiz quadrada da Variância (√{formatNum(varianciaAmostral)}). Mostra o erro médio real.<br/>
              • <strong>Coeficiente de Variação (CV):</strong> (Desvio Padrão / Média) * 100.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', borderTop: '4px solid #3b82f6' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Média Amostral Real (X̄)</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{formatNum(mediaAmostralReal)} {casoAtivo.unidade}</div>
                <span style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold' }}>vs Meta: {formatNum(casoAtivo.metaReferencia)} {casoAtivo.unidade}</span>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Mediana (Md)</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '4px' }}>{formatNum(medianaReal)} {casoAtivo.unidade}</div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>Centro exato da amostra ordenada</span>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', borderTop: '4px solid #ef4444' }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Desvio Padrão (S)</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: '#dc2626', marginTop: '4px' }}>{formatNum(desvioPadraoReal)}</div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>O quanto os dados fogem da média</span>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', borderTop: `4px solid ${coeficienteVariacao > 25 ? '#ef4444' : '#10b981'}` }}>
                <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Coef. Variação (CV)</span>
                <div style={{ fontSize: '24px', fontWeight: '900', color: coeficienteVariacao > 25 ? '#dc2626' : '#16a34a', marginTop: '4px' }}>{formatNum(coeficienteVariacao, 1)}%</div>
                <span style={{ fontSize: '12px', color: '#64748b' }}>{coeficienteVariacao > 25 ? '⚠️ Dados muito dispersos (>25%)' : '✅ Amostra Homogênea (<25%)'}</span>
              </div>
            </div>
          </div>
        )}

        {/* PASSO 4: INTERVALO DE CONFIANÇA */}
        {abaAtiva === 'confianca' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>Passo 4: Intervalo de Confiança (Inferência na População)</h3>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '14px' }}>
              Testamos apenas a amostra de {N} elementos. Usamos o IC para descobrir onde está a verdadeira média de TODA a empresa.
            </p>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>Nível de Certeza (Tabela Z):</span>
              {[90, 95, 99].map(n => (
                <button key={n} type="button" onClick={() => setNivelConfianca(n)}
                  style={{ padding: '8px 16px', borderRadius: '8px', border: nivelConfianca === n ? 'none' : '1px solid #cbd5e1', backgroundColor: nivelConfianca === n ? '#0f172a' : 'white', color: nivelConfianca === n ? 'white' : '#334155', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {n}%
                </button>
              ))}
            </div>

            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
              <div style={{ fontSize: '13px', color: '#1e40af', marginBottom: '12px', fontFamily: 'monospace', backgroundColor: 'white', padding: '10px', borderRadius: '6px', border: '1px solid #93c5fd' }}>
                <strong>Fórmula Aplicada:</strong> IC = X̄ ± (Z * (S / √N))<br/>
                IC = {formatNum(mediaAmostralReal)} ± ({formatNum(zScore, 3)} * ({formatNum(desvioPadraoReal)} / √{N}))<br/>
                IC = {formatNum(mediaAmostralReal)} ± {formatNum(margemErro)}
              </div>
              <div style={{ fontSize: '15px', color: '#1e3a8a', fontWeight: 'bold', marginBottom: '8px' }}>
                Com {nivelConfianca}% de certeza, a verdadeira média da empresa está no intervalo:
              </div>
              <div style={{ fontSize: '28px', fontWeight: '900', color: '#1d4ed8' }}>
                [ {formatNum(icInferior)} até {formatNum(icSuperior)} ] {casoAtivo.unidade}
              </div>
            </div>

            <div style={{ backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '16px', borderRadius: '8px' }}>
              <strong style={{ display: 'block', color: '#b45309', fontSize: '14px', marginBottom: '6px' }}>Como ler isso para o problema "{casoAtivo.titulo}"?</strong>
              <p style={{ margin: 0, fontSize: '13px', color: '#92400e', lineHeight: '1.5' }}>
                A meta que precisamos atingir é de <strong>{formatNum(casoAtivo.metaReferencia)} {casoAtivo.unidade}</strong>. 
                Ao aplicar a estatística inferencial, a faixa projetada vai de {formatNum(icInferior)} até {formatNum(icSuperior)}. 
                <br/><br/>
                <strong>Tradução:</strong> {casoAtivo.metaReferencia >= icInferior && casoAtivo.metaReferencia <= icSuperior ? 'A nossa Meta (μ) caiu DENTRO do intervalo de confiança calculado. Portanto, a empresa está rodando dentro do esperado.' : 'A nossa Meta (μ) ficou FORA do intervalo de confiança da realidade atual. Isso prova matematicamente que existe um problema estrutural no negócio!'}
              </p>
            </div>
          </div>
        )}

        {/* PASSO 5: HIPÓTESES */}
        {abaAtiva === 'hipoteses' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0f172a' }}>Passo 5: Teste de Hipóteses (Prova Matemática do Erro)</h3>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '14px' }}>Comparação da Média Real (Amostra) com a Média Hipotética (Meta).</p>
            
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '16px' }}>
              <label htmlFor="inputHipoteseNula" style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155', margin: 0 }}>Meta Padrão (Hipótese Nula - H0):</label>
              <input id="inputHipoteseNula" name="inputHipoteseNula" type="number" step="0.1" value={mediaHipotetica} onChange={e => setMediaHipotetica(parseFloat(e.target.value) || 0)} style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #94a3b8', fontSize: '16px', fontWeight: '900', color: '#2563eb', width: '100px', textAlign: 'center' }} />
              <span style={{ fontSize: '14px', color: '#64748b' }}>{casoAtivo.unidade}</span>
            </div>

            <div style={{ backgroundColor: '#f3e8ff', border: '1px solid #d8b4fe', padding: '16px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', color: '#6b21a8' }}>
              <strong>Fórmula do Teste Estatístico (Z-calculado):</strong><br/>
              <code>Zc = (Média Amostral - Meta Hipotética) / Erro Padrão da Média</code><br/>
              <code>Zc = ({formatNum(mediaAmostralReal)} - {formatNum(mediaHipotetica)}) / {formatNum(erroPadraoAmostral)} = <strong>{formatNum(tCalculado)}</strong></code>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #7e22ce' }}>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>T-CALCULADO (A REALIDADE)</span>
                <span style={{ display: 'block', fontSize: '28px', fontWeight: '900', color: '#0f172a' }}>{formatNum(tCalculado)}</span>
              </div>
              <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #0f172a' }}>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748b', fontWeight: 'bold' }}>T-CRÍTICO (LIMITE DA LEI)</span>
                <span style={{ display: 'block', fontSize: '28px', fontWeight: '900', color: '#0f172a' }}>±{formatNum(tCritico)}</span>
              </div>
            </div>

            <div style={{ backgroundColor: rejeitaH0 ? '#fef2f2' : '#f0fdf4', padding: '20px', borderRadius: '8px', borderLeft: `6px solid ${rejeitaH0 ? '#dc2626' : '#16a34a'}`, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <div style={{ fontWeight: '900', fontSize: '16px', color: rejeitaH0 ? '#991b1b' : '#166534', marginBottom: '8px' }}>
                {rejeitaH0 ? '🚨 REJEITA-SE A HIPÓTESE (H0) - A META NÃO ESTÁ SENDO CUMPRIDA.' : '✅ NÃO SE REJEITA A HIPÓTESE (H0) - DENTRO DA META.'}
              </div>
              <p style={{ margin: 0, fontSize: '13.5px', color: '#334155', lineHeight: '1.5' }}>
                Como a estatística calculada ({formatNum(tCalculado)}) <strong>{rejeitaH0 ? 'ultrapassou e rompeu os limites de' : 'caiu seguramente dentro dos limites de'}</strong> tolerância crítica (±{formatNum(tCritico)}), podemos provar que o desvio <strong>{rejeitaH0 ? 'NÃO' : ''}</strong> é obra do acaso. O processo {rejeitaH0 ? 'sofreu uma alteração estrutural' : 'está sob controle estatístico'}.
              </p>
            </div>
          </div>
        )}

        {/* PASSO 6: DECISÃO E CUSTO FINANCEIRO */}
        {abaAtiva === 'cenarios' && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '22px', color: '#0f172a' }}>Passo 6: Relatório do Controller e Decisão Executiva</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '20px', borderRadius: '12px' }}>
                <strong style={{ color: '#0f172a', fontSize: '15px', display: 'block', marginBottom: '8px' }}>Revisão da Dor do Negócio ({casoAtivo.setor}):</strong>
                <p style={{ margin: 0, fontSize: '14px', color: '#334155', lineHeight: '1.6' }}>{casoAtivo.problema}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                
                <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderTop: '4px solid #ef4444', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Perda Financeira Projetada (Impacto)</span>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: '#dc2626', margin: '8px 0' }}>
                    {formatMoeda(impactoFinanceiroCalc)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '8px', lineHeight: '1.5' }}>
                    <strong>Memória de Cálculo do Prejuízo:</strong><br/>
                    Diferença da Meta: |{formatNum(mediaAmostralReal)} - {formatNum(casoAtivo.metaReferencia)}| = {formatNum(Math.abs(diferencaMeta))} {casoAtivo.unidade}<br/>
                    Custo Unitário Padrão: {formatMoeda(casoAtivo.fatorImpactoFinanceiro)}<br/>
                    Volume de Ocorrências (Amostra): {N}<br/>
                    <em>Conta: ({formatNum(Math.abs(diferencaMeta))} × {formatMoeda(casoAtivo.fatorImpactoFinanceiro).replace('R$','')} × {N})</em>
                  </div>
                </div>

                <div style={{ backgroundColor: '#0f172a', padding: '24px', borderRadius: '12px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.4)' }}>
                  <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '10px' }}>Veredito do Diretor Executivo (CFO)</span>
                  
                  {rejeitaH0 ? (
                    <>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f87171', marginBottom: '12px', lineHeight: '1.4' }}>
                        "Os dados provam estatisticamente que o processo falhou. Teremos que provisionar imediatamente {formatMoeda(impactoFinanceiroCalc)} no DRE para cobrir esses desvios operacionais."
                      </div>
                      <span style={{ fontSize: '13px', color: '#cbd5e1' }}><strong>Ação Obrigatória:</strong> Aprovar plano de contingência. Aplicar medidas corretivas ou acionar o seguro antes que o prejuízo escale.</span>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#4ade80', marginBottom: '12px', lineHeight: '1.4' }}>
                        "A estatística validou nossa operação. A flutuação da média ({formatNum(mediaAmostralReal)}) é um desvio normal esperado e não quebra nossa meta estratégica."
                      </div>
                      <span style={{ fontSize: '13px', color: '#cbd5e1' }}><strong>Ação:</strong> Manter a estratégia atual (status quo). Nenhuma provisão de contingência extra será necessária.</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}