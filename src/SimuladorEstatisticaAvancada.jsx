import React, { useState, useMemo } from 'react';

export default function SimuladorEstatisticaAvancada({ mostrarToast }) {
  const formatNum = (v, dec = 2) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // CATÁLOGO DE CENÁRIOS EMPRESARIAIS
  const cenariosPreDefinidos = [
    {
      id: 'treinamento',
      setor: '🎓 Educação & RH',
      titulo: 'Avaliação de Desempenho Técnico',
      problema: 'Investimento de R$ 50.000 em treinamento. Precisamos que a média seja de no mínimo 70 pontos para evitar multas fiscais.',
      variavel: 'Nota na Avaliação',
      unidade: 'pontos',
      amostraPadrao: [49.0, 51.3, 54.9, 55.1, 58.2, 59.8, 61.1, 64.8, 65.3, 65.5, 66.4, 66.4, 67.0, 68.5, 69.2, 69.2, 69.3, 70.3, 72.8, 73.3, 74.9, 75.8, 76.5, 78.0, 78.5, 79.8, 81.2, 89.6, 90.3, 91.0],
      metaReferencia: 70.0,
      fatorImpactoFinanceiro: 320.00
    },
    {
      id: 'sla_suporte',
      setor: '🎧 Atendimento & TI',
      titulo: 'Tempo de Resolução de Chamados',
      problema: 'O SLA exige resolução em no máximo 30 minutos. Precisamos verificar se a equipe cumpre a meta para evitar multas contratuais.',
      variavel: 'Tempo de Resolução',
      unidade: 'minutos',
      amostraPadrao: [14.2, 16.5, 18.0, 19.4, 21.0, 22.5, 23.1, 24.0, 25.5, 26.0, 27.2, 28.0, 28.5, 29.0, 30.2, 31.0, 32.4, 33.0, 34.5, 36.0, 37.8, 39.0, 41.2, 43.0, 45.5, 48.0, 51.2, 54.0, 58.5, 62.0],
      metaReferencia: 30.0,
      fatorImpactoFinanceiro: 120.00
    },
    {
      id: 'industria_qualidade',
      setor: '⚙️ Produção & Qualidade',
      titulo: 'Peso Líquido de Embalagens',
      problema: 'A máquina de envase deve colocar 1000g. Abaixo disso gera multas do Procon; acima, desperdício de matéria-prima.',
      variavel: 'Peso Líquido',
      unidade: 'gramas',
      amostraPadrao: [982, 986, 988, 990, 992, 994, 995, 996, 997, 998, 999, 1000, 1000, 1001, 1001, 1002, 1002, 1003, 1004, 1005, 1006, 1007, 1008, 1010, 1012, 1014, 1015, 1018, 1020, 1025],
      metaReferencia: 1000.0,
      fatorImpactoFinanceiro: 450.00
    }
  ];

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
    if (typeof mostrarToast === 'function') mostrarToast(`Cenário alterado para: ${caso.titulo}`, 'sucesso');
  };

  const ativarModoCustomizado = () => {
    setIsCustom(true);
    const casoVazio = {
      id: 'custom',
      setor: '🛠️ Personalizado',
      titulo: 'Meu Problema de Negócio',
      problema: 'Descreva a dor que você quer resolver.',
      variavel: 'Minha Variável',
      unidade: 'un.',
      metaReferencia: 100,
      fatorImpactoFinanceiro: 50.00
    };
    setCasoAtivo(casoVazio);
    setTextoAmostra('80, 90, 100, 110, 120'); 
    setMediaHipotetica(100);
    if (typeof mostrarToast === 'function') mostrarToast(`Modo Personalizado Ativado! Configure seu problema.`, 'sucesso');
  };

  // PARSING E PROCESSAMENTO MATEMÁTICO
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

  const zScore = nivelConfianca === 90 ? 1.645 : nivelConfianca === 99 ? 2.576 : 1.96;
  const tCritico = zScore; 
  
  const erroPadraoAmostral = N > 0 ? desvioPadraoReal / Math.sqrt(N) : 0;
  const margemErro = zScore * erroPadraoAmostral;
  const icInferior = mediaAmostralReal - margemErro;
  const icSuperior = mediaAmostralReal + margemErro;

  const tCalculado = erroPadraoAmostral > 0 ? (mediaAmostralReal - mediaHipotetica) / erroPadraoAmostral : 0;
  const rejeitaH0 = Math.abs(tCalculado) > tCritico;

  const diferencaMeta = mediaAmostralReal - casoAtivo.metaReferencia;
  const impactoFinanceiroCalc = Math.abs(diferencaMeta) * casoAtivo.fatorImpactoFinanceiro * N;

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.5s' }}>
      
      {/* CABEÇALHO SUPERIOR */}
      <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px 24px', borderRadius: '16px 16px 0 0', borderBottom: '4px solid #3b82f6', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px', boxSizing: 'border-box' }}>
          <div style={{ minWidth: 0, flex: '1 1 250px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span style={{ backgroundColor: '#2563eb', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '900', wordBreak: 'break-word' }}>DATA SCIENCE</span>
              <span style={{ fontSize: '17px', fontWeight: 'bold', wordBreak: 'break-word' }}>Estatística para Tomada de Decisão</span>
            </div>
            <div style={{ fontSize: '12.5px', color: '#94a3b8', wordBreak: 'break-word' }}>Da Coleta de Dados ao Impacto Financeiro (Descritiva & Inferencial).</div>
          </div>
        </div>

        {/* SELEÇÃO DOS CENÁRIOS */}
        <div style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', wordBreak: 'break-word' }}>Qual problema de negócio vamos analisar?</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '8px', boxSizing: 'border-box' }}>
          {cenariosPreDefinidos.map(c => {
            const ativo = !isCustom && casoAtivo.id === c.id;
            return (
              <button key={c.id} type="button" onClick={() => selecionarCasoEmpresarial(c)}
                style={{ padding: '12px', borderRadius: '10px', border: ativo ? '2px solid #38bdf8' : '1px solid #334155', backgroundColor: ativo ? '#1e3a8a' : '#1e293b', color: 'white', fontSize: '12px', fontWeight: ativo ? 'bold' : 'normal', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', boxSizing: 'border-box', width: '100%', minWidth: 0 }}
              >
                <span style={{ color: '#94a3b8', fontSize: '10px', marginBottom: '4px', wordBreak: 'break-word' }}>{c.setor}</span>
                <span style={{ textAlign: 'left', lineHeight: '1.2', wordBreak: 'break-word' }}>{c.titulo}</span>
              </button>
            );
          })}
          
          <button type="button" onClick={ativarModoCustomizado}
            style={{ padding: '12px', borderRadius: '10px', border: isCustom ? '2px solid #10b981' : '1px dashed #cbd5e1', backgroundColor: isCustom ? '#064e3b' : 'transparent', color: isCustom ? 'white' : '#cbd5e1', fontSize: '12px', fontWeight: isCustom ? 'bold' : 'normal', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', boxSizing: 'border-box', width: '100%', minWidth: 0 }}
          >
            <span style={{ color: isCustom ? '#6ee7b7' : '#94a3b8', fontSize: '10px', marginBottom: '4px', wordBreak: 'break-word' }}>🛠️ Customizado</span>
            <span style={{ textAlign: 'left', lineHeight: '1.2', wordBreak: 'break-word' }}>+ Criar Meu Próprio Problema</span>
          </button>
        </div>

        {/* TABS NAVEGAÇÃO DOS CÁLCULOS */}
        <div style={{ marginTop: '16px', display: 'flex', gap: '6px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          {[
            { id: 'coleta', label: '📥 1. Amostra' },
            { id: 'tdf', label: '📋 2. TDF' },
            { id: 'descritiva', label: '📊 3. Médias/Dispersão' },
            { id: 'confianca', label: '🎯 4. Confiança' },
            { id: 'hipoteses', label: '⚖️ 5. Hipóteses' },
            { id: 'cenarios', label: '🏢 6. Decisão' }
          ].map(aba => (
            <button key={aba.id} type="button" onClick={() => setAbaAtiva(aba.id)}
              style={{ flex: '1 1 110px', padding: '10px 8px', borderRadius: '8px', border: abaAtiva === aba.id ? '2px solid #60a5fa' : '1px solid #334155', fontWeight: abaAtiva === aba.id ? 'bold' : '600', fontSize: '11.5px', cursor: 'pointer', backgroundColor: abaAtiva === aba.id ? '#2563eb' : '#1e293b', color: 'white', boxSizing: 'border-box' }}
            >
              {aba.label}
            </button>
          ))}
        </div>
      </div>

      {/* CORPO PRINCIPAL */}
      <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '0 0 16px 16px', border: '1px solid #cbd5e1', borderTop: 'none', width: '100%', boxSizing: 'border-box' }}>
        
        {/* PASSO 1: COLETA */}
        {abaAtiva === 'coleta' && (
          <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '17px', color: '#0f172a', wordBreak: 'break-word' }}>Passo 1: Entendimento do Problema & Amostra (Rol)</h3>
            
            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #3b82f6', marginBottom: '20px', boxSizing: 'border-box' }}>
              <strong style={{ fontSize: '13.5px', color: '#1e3a8a', display: 'block', marginBottom: '6px', wordBreak: 'break-word' }}>Contexto do Negócio: Por que estamos calculando isso?</strong>
              {isCustom ? (
                <textarea id="textoContextoNegocio" name="textoContextoNegocio" rows="3" style={inputStyle} value={casoAtivo.problema} onChange={e => setCasoAtivo({...casoAtivo, problema: e.target.value})} placeholder="Descreva o problema..." />
              ) : (
                <p style={{ margin: 0, fontSize: '13px', color: '#1e40af', lineHeight: '1.5', wordBreak: 'border-box' }}>{casoAtivo.problema}</p>
              )}
            </div>

            {isCustom && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '14px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px dashed #94a3b8', marginBottom: '20px', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0, gridColumn: '1 / -1' }}><label style={labelStyle}>Título do Projeto:</label><input style={inputStyle} value={casoAtivo.titulo} onChange={e => setCasoAtivo({...casoAtivo, titulo: e.target.value})} /></div>
                <div style={{ minWidth: 0 }}><label style={labelStyle}>Variável:</label><input style={inputStyle} value={casoAtivo.variavel} onChange={e => setCasoAtivo({...casoAtivo, variavel: e.target.value})} /></div>
                <div style={{ minWidth: 0 }}><label style={labelStyle}>Unidade:</label><input style={inputStyle} value={casoAtivo.unidade} onChange={e => setCasoAtivo({...casoAtivo, unidade: e.target.value})} /></div>
                <div style={{ minWidth: 0 }}><label style={{...labelStyle, color: '#16a34a'}}>Meta (μ):</label><input type="number" style={inputStyle} value={casoAtivo.metaReferencia} onChange={e => { setCasoAtivo({...casoAtivo, metaReferencia: e.target.value}); setMediaHipotetica(e.target.value); }} /></div>
                <div style={{ minWidth: 0 }}><label style={{...labelStyle, color: '#dc2626'}}>Custo por Erro (R$):</label><input type="number" style={inputStyle} value={casoAtivo.fatorImpactoFinanceiro} onChange={e => setCasoAtivo({...casoAtivo, fatorImpactoFinanceiro: e.target.value})} /></div>
              </div>
            )}

            <label style={labelStyle}>
              Base de Dados Coletada (Valores separados por vírgula):
            </label>
            <textarea rows={4} value={textoAmostra} onChange={e => setTextoAmostra(e.target.value)} style={{ width: '100%', maxWidth: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #cbd5e1', fontFamily: 'monospace', fontSize: '13.5px', boxSizing: 'border-box', marginBottom: '16px' }} />

            <div style={{ backgroundColor: '#f8fafc', padding: '18px', borderRadius: '16px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
              <div style={{ fontWeight: '900', fontSize: '14.5px', color: '#0f172a', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
                <span>🔢</span> Rol Ordenado (Crescente N = {N}):
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', boxSizing: 'border-box' }}>
                {amostraProcessada.map((v, i) => (
                  <span key={i} style={{ backgroundColor: 'white', border: '1px solid #cbd5e1', padding: '6px 10px', borderRadius: '8px', fontSize: '15px', fontFamily: 'monospace', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', boxSizing: 'border-box' }}>
                    <span style={{ color: '#94a3b8', fontSize: '11px', marginRight: '6px', fontWeight: 'bold' }}>{i + 1}º</span> 
                    <strong style={{ color: '#0f172a' }}>{formatNum(v, 2)}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PASSO 2: TDF */}
        {abaAtiva === 'tdf' && (
          <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '17px', color: '#0f172a', wordBreak: 'break-word' }}>Passo 2: Tabela de Distribuição de Frequências (TDF)</h3>
            
            <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #ef4444', marginBottom: '20px', boxSizing: 'border-box' }}>
              <strong style={{ fontSize: '13.5px', color: '#991b1b', display: 'block', marginBottom: '6px', wordBreak: 'break-word' }}>Memória de Cálculo:</strong>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12.5px', color: '#7f1d1d', lineHeight: '1.6', boxSizing: 'border-box', wordBreak: 'break-word' }}>
                <li><strong>Amplitude Total (At):</strong> {formatNum(Xmax)} - {formatNum(Xmin)} = <strong>{formatNum(amplitudeTotal)}</strong></li>
                <li><strong>Número de Classes (k):</strong> Sturges <code>1 + 3,322 * log10({N})</code> = <strong>{k_sturges} classes</strong>.</li>
                <li><strong>Amplitude da Classe (h):</strong> <code>At / k</code> = <strong>{formatNum(h_amplitude)}</strong>.</li>
              </ul>
            </div>

            <div style={{ overflowX: 'auto', border: '1px solid #cbd5e1', borderRadius: '16px', boxSizing: 'border-box' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left', minWidth: '500px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#0f172a', color: 'white' }}>
                    <th style={{ padding: '10px 12px' }}>Classe (i)</th>
                    <th style={{ padding: '10px 12px' }}>Intervalo [Li ⊢ Ls)</th>
                    <th style={{ padding: '10px 12px' }}>Ponto Médio (xi)</th>
                    <th style={{ padding: '10px 12px' }}>Freq. (fi)</th>
                    <th style={{ padding: '10px 12px' }}>Freq. (fr %)</th>
                  </tr>
                </thead>
                <tbody>
                  {tdfClasses.map(c => (
                    <tr key={c.classe} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Classe {c.classe}</td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{formatNum(c.limInf)} ⊢ {formatNum(c.limSup)}</td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{formatNum(c.pontoMedio)}</td>
                      <td style={{ padding: '10px 12px', fontWeight: 'bold', color: '#2563eb', whiteSpace: 'nowrap' }}>{c.fi}</td>
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>{formatNum(c.fr, 1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PASSO 3: DESCRITIVA */}
        {abaAtiva === 'descritiva' && (
          <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '17px', color: '#0f172a', wordBreak: 'break-word' }}>Passo 3: Medidas Descritivas (Posição e Dispersão)</h3>
            
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #16a34a', marginBottom: '20px', fontSize: '12.5px', color: '#166534', lineHeight: '1.6', boxSizing: 'border-box', wordBreak: 'break-word' }}>
              <strong style={{ display: 'block', fontSize: '13.5px', marginBottom: '6px', wordBreak: 'break-word' }}>Fórmulas Aplicadas:</strong>
              • <strong>Média (X̄):</strong> Soma total ({formatNum(somaAmostral)}) / {N}.<br/>
              • <strong>Variância (S²):</strong> Somatório dos desvios ao quadrado / (N - 1) = {formatNum(varianciaAmostral)}.<br/>
              • <strong>Desvio Padrão (S):</strong> Raiz da Variância = {formatNum(desvioPadraoReal)}.<br/>
              • <strong>Coeficiente de Variação (CV):</strong> (Desvio / Média) * 100.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', boxSizing: 'border-box' }}>
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', borderTop: '4px solid #3b82f6', boxSizing: 'border-box', minWidth: 0 }}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Média Amostral (X̄)</span>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', marginTop: '4px', wordBreak: 'break-word' }}>{formatNum(mediaAmostralReal)} {casoAtivo.unidade}</div>
                <span style={{ fontSize: '11.5px', color: '#2563eb', fontWeight: 'bold', wordBreak: 'break-word' }}>vs Meta: {formatNum(casoAtivo.metaReferencia)}</span>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', boxSizing: 'border-box', minWidth: 0 }}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Mediana (Md)</span>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#0f172a', marginTop: '4px', wordBreak: 'break-word' }}>{formatNum(medianaReal)} {casoAtivo.unidade}</div>
                <span style={{ fontSize: '11.5px', color: '#64748b', wordBreak: 'break-word' }}>Centro exato da amostra</span>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', borderTop: '4px solid #ef4444', boxSizing: 'border-box', minWidth: 0 }}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Desvio Padrão (S)</span>
                <div style={{ fontSize: '22px', fontWeight: '900', color: '#dc2626', marginTop: '4px', wordBreak: 'break-word' }}>{formatNum(desvioPadraoReal)}</div>
                <span style={{ fontSize: '11.5px', color: '#64748b', wordBreak: 'break-word' }}>Dispersão dos dados</span>
              </div>
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', borderTop: `4px solid ${coeficienteVariacao > 25 ? '#ef4444' : '#10b981'}`, boxSizing: 'border-box', minWidth: 0 }}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Coef. Variação (CV)</span>
                <div style={{ fontSize: '22px', fontWeight: '900', color: coeficienteVariacao > 25 ? '#dc2626' : '#16a34a', marginTop: '4px', wordBreak: 'break-word' }}>{formatNum(coeficienteVariacao, 1)}%</div>
                <span style={{ fontSize: '11.5px', color: '#64748b', wordBreak: 'break-word' }}>{coeficienteVariacao > 25 ? '⚠️ Dispersos (>25%)' : '✅ Homogênea (<25%)'}</span>
              </div>
            </div>
          </div>
        )}

        {/* PASSO 4: CONFIANÇA */}
        {abaAtiva === 'confianca' && (
          <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '17px', color: '#0f172a', wordBreak: 'break-word' }}>Passo 4: Intervalo de Confiança (Inferência)</h3>
            <p style={{ fontSize: '13px', color: '#475569', marginBottom: '14px', wordBreak: 'break-word' }}>
              Estimativa do parâmetro populacional a partir da amostra de {N} elementos.
            </p>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
              <span style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#334155', wordBreak: 'break-word' }}>Nível de Certeza:</span>
              {[90, 95, 99].map(n => (
                <button key={n} type="button" onClick={() => setNivelConfianca(n)}
                  style={{ padding: '8px 14px', borderRadius: '8px', border: nivelConfianca === n ? 'none' : '1px solid #cbd5e1', backgroundColor: nivelConfianca === n ? '#0f172a' : 'white', color: nivelConfianca === n ? 'white' : '#334155', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px', boxSizing: 'border-box' }}
                >
                  {n}%
                </button>
              ))}
            </div>

            <div style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', padding: '18px', borderRadius: '16px', marginBottom: '16px', boxSizing: 'border-box' }}>
              <div style={{ fontSize: '12px', color: '#1e40af', marginBottom: '10px', fontFamily: 'monospace', backgroundColor: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #93c5fd', wordBreak: 'break-all', boxSizing: 'border-box' }}>
                IC = {formatNum(mediaAmostralReal)} ± ({formatNum(zScore, 3)} * ({formatNum(desvioPadraoReal)} / √{N})) = <strong>{formatNum(mediaAmostralReal)} ± {formatNum(margemErro)}</strong>
              </div>
              <div style={{ fontSize: '14px', color: '#1e3a8a', fontWeight: 'bold', marginBottom: '6px', wordBreak: 'break-word' }}>
                Intervalo com {nivelConfianca}% de certeza:
              </div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#1d4ed8', wordBreak: 'break-word' }}>
                [ {formatNum(icInferior)} até {formatNum(icSuperior)} ] {casoAtivo.unidade}
              </div>
            </div>

            <div style={{ backgroundColor: '#fffbeb', borderLeft: '4px solid #f59e0b', padding: '16px', borderRadius: '12px', boxSizing: 'border-box' }}>
              <strong style={{ display: 'block', color: '#b45309', fontSize: '13.5px', marginBottom: '4px', wordBreak: 'break-word' }}>Análise do Resultado:</strong>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#92400e', lineHeight: '1.5', wordBreak: 'break-word' }}>
                A meta é <strong>{formatNum(casoAtivo.metaReferencia)} {casoAtivo.unidade}</strong>. 
                {casoAtivo.metaReferencia >= icInferior && casoAtivo.metaReferencia <= icSuperior ? ' A meta caiu DENTRO do intervalo de confiança. Operação dentro do esperado.' : ' A meta caiu FORA do intervalo de confiança. Evidência matemática de desvio estrutural!'}
              </p>
            </div>
          </div>
        )}

        {/* PASSO 5: HIPÓTESES */}
        {abaAtiva === 'hipoteses' && (
          <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 12px 0', fontSize: '17px', color: '#0f172a', wordBreak: 'break-word' }}>Passo 5: Teste de Hipóteses (Z-Calculado)</h3>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', marginBottom: '16px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
              <label htmlFor="inputHipoteseNula" style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', margin: 0, wordBreak: 'break-word' }}>Meta Padrão (H0):</label>
              <input id="inputHipoteseNula" name="inputHipoteseNula" type="number" step="0.1" value={mediaHipotetica} onChange={e => setMediaHipotetica(parseFloat(e.target.value) || 0)} style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #94a3b8', fontSize: '15px', fontWeight: '900', color: '#2563eb', width: '110px', textAlign: 'center', boxSizing: 'border-box' }} />
              <span style={{ fontSize: '13px', color: '#64748b', wordBreak: 'break-word' }}>{casoAtivo.unidade}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', marginBottom: '16px', boxSizing: 'border-box' }}>
              <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '16px', borderLeft: '4px solid #7e22ce', boxSizing: 'border-box', minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Z-CALCULADO</span>
                <span style={{ display: 'block', fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '4px', wordBreak: 'break-word' }}>{formatNum(tCalculado)}</span>
              </div>
              <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', padding: '16px', borderRadius: '16px', borderLeft: '4px solid #0f172a', boxSizing: 'border-box', minWidth: 0 }}>
                <span style={{ display: 'block', fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Z-CRÍTICO (95%)</span>
                <span style={{ display: 'block', fontSize: '24px', fontWeight: '900', color: '#0f172a', marginTop: '4px', wordBreak: 'break-word' }}>±{formatNum(tCritico)}</span>
              </div>
            </div>

            <div style={{ backgroundColor: rejeitaH0 ? '#fef2f2' : '#f0fdf4', padding: '18px', borderRadius: '16px', borderLeft: `6px solid ${rejeitaH0 ? '#dc2626' : '#16a34a'}`, boxShadow: '0 4px 6px rgba(0,0,0,0.05)', boxSizing: 'border-box' }}>
              <div style={{ fontWeight: '900', fontSize: '15px', color: rejeitaH0 ? '#991b1b' : '#166534', marginBottom: '8px', wordBreak: 'break-word' }}>
                {rejeitaH0 ? '🚨 REJEITA-SE H0 (A META NÃO FOI CUMPRIDA)' : '✅ NÃO SE REJEITA H0 (DENTRO DA META)'}
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.5', wordBreak: 'break-word' }}>
                O valor calculado ({formatNum(tCalculado)}) <strong>{rejeitaH0 ? 'rompeu' : 'caiu dentro'}</strong> dos limites críticos (±{formatNum(tCritico)}). O desvio {rejeitaH0 ? 'não é' : 'é'} obra do acaso.
              </p>
            </div>
          </div>
        )}

        {/* PASSO 6: DECISÃO E CUSTO */}
        {abaAtiva === 'cenarios' && (
          <div style={{ animation: 'fadeIn 0.3s', boxSizing: 'border-box' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '18px', color: '#0f172a', wordBreak: 'break-word' }}>Passo 6: Relatório do Controller e Decisão Executiva</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box' }}>
              <div style={{ backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', padding: '18px', borderRadius: '16px', boxSizing: 'border-box' }}>
                <strong style={{ color: '#0f172a', fontSize: '14px', display: 'block', marginBottom: '6px', wordBreak: 'break-word' }}>Dor Analisada ({casoAtivo.setor}):</strong>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#334155', lineHeight: '1.5', wordBreak: 'break-word' }}>{casoAtivo.problema}</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px', boxSizing: 'border-box' }}>
                
                <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderTop: '4px solid #ef4444', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 }}>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Prejuízo Projetado</span>
                  <div style={{ fontSize: '28px', fontWeight: '900', color: '#dc2626', margin: '6px 0', wordBreak: 'break-word' }}>
                    {formatMoeda(impactoFinanceiroCalc)}
                  </div>
                  <div style={{ fontSize: '11.5px', color: '#475569', backgroundColor: '#f1f5f9', padding: '10px', borderRadius: '10px', lineHeight: '1.4', wordBreak: 'break-word' }}>
                    <strong>Memória:</strong> |{formatNum(diferencaMeta)}| × {formatMoeda(casoAtivo.fatorImpactoFinanceiro)} × {N}
                  </div>
                </div>

                <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '16px', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', boxShadow: '0 10px 15px -3px rgba(15, 23, 42, 0.4)', boxSizing: 'border-box', minWidth: 0 }}>
                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: '8px', wordBreak: 'break-word' }}>Veredito do CFO</span>
                  
                  {rejeitaH0 ? (
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '15.5px', fontWeight: 'bold', color: '#f87171', marginBottom: '8px', lineHeight: '1.4', wordBreak: 'break-word' }}>
                        "Provisão imediata de {formatMoeda(impactoFinanceiroCalc)} no DRE para cobrir os desvios."
                      </div>
                      <span style={{ fontSize: '12px', color: '#cbd5e1', wordBreak: 'break-word' }}><strong>Ação:</strong> Aplicar plano corretivo urgente.</span>
                    </div>
                  ) : (
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '15.5px', fontWeight: 'bold', color: '#4ade80', marginBottom: '8px', lineHeight: '1.4', wordBreak: 'break-word' }}>
                        "Operação dentro da normalidade estatística. A flutuação ({formatNum(mediaAmostralReal)}) é padrão."
                      </div>
                      <span style={{ fontSize: '12px', color: '#cbd5e1', wordBreak: 'word' }}><strong>Ação:</strong> Manter status quo. Nenhuma provisão extra necessária.</span>
                    </div>
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