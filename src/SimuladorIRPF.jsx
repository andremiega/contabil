import React, { useState } from 'react';

export default function SimuladorIRPF({ mostrarToast }) {
  const [fichaAtiva, setFichaAtiva] = useState('identificacao');
  const [modeloEscolhido, setModeloEscolhido] = useState('completo'); // 'completo' ou 'simplificado'
  const [reciboTransmitido, setReciboTransmitido] = useState(null);

  // 1. FICHA: IDENTIFICAÇÃO DO CONTRIBUINTE
  const [contribuinte, setContribuinte] = useState({
    cpf: '412.889.308-12',
    nome: 'Andre Lopes da Silva',
    dataNascimento: '1998-05-14',
    tituloEleitor: '4129 8831 0192',
    ocupacaoPrincipal: '125 - Administrador, Contador ou Auditor',
    naturezaOcupacao: '01 - Empregado de empresa do setor privado',
    cep: '06730-000',
    endereco: 'Rua Ponta Negra, 100 - Parque do Agreste',
    municipio: 'Vargem Grande Paulista',
    uf: 'SP',
    chavePixRestituicao: 'CPF do Contribuinte'
  });

  // 2. FICHA: DEPENDENTES
  const [dependentes, setDependentes] = useState([
    { id: 1, tipo: '21 - Filho(a) ou enteado(a) até 21 anos', nome: 'Lucas Lopes', cpf: '519.220.118-04', dataNasc: '2018-03-10' }
  ]);
  const [novoDep, setNovoDep] = useState({ tipo: '21 - Filho(a) ou enteado(a) até 21 anos', nome: '', cpf: '', dataNasc: '' });

  // 3. FICHA: RENDIMENTOS TRIBUTÁVEIS PJ
  const [rendimentosPJ, setRendimentosPJ] = useState([
    {
      id: 1,
      cnpjFonte: '12.345.678/0001-90',
      nomeFonte: 'INDUSTRIA METALURGICA PAULISTA LTDA',
      rendimentosRecebidos: 84000.00,
      contribuicaoPrevidenciaria: 7850.00,
      impostoRetidoFonte: 6920.00,
      decimoTerceiro: 7000.00,
      irrfDecimoTerceiro: 580.00
    }
  ]);
  const [novoRendPJ, setNovoRendPJ] = useState({ cnpjFonte: '', nomeFonte: '', rendimentosRecebidos: '', contribuicaoPrevidenciaria: '', impostoRetidoFonte: '', decimoTerceiro: '', irrfDecimoTerceiro: '' });

  // 4. FICHA: RENDIMENTOS ISENTOS
  const [rendimentosIsentos] = useState([
    { id: 1, codigo: '09 - Lucros e dividendos recebidos', cnpjFonte: '48.912.345/0001-88', nomeFonte: 'SILVA & LOPES CONSULTORIA LTDA', valor: 18500.00 },
    { id: 2, codigo: '12 - Cadernetas de poupança, LCI e LCA', cnpjFonte: '00.000.000/0001-91', nomeFonte: 'BANCO DO BRASIL SA', valor: 3420.50 }
  ]);

  // 5. FICHA: PAGAMENTOS EFETUADOS
  const [pagamentos, setPagamentos] = useState([
    { id: 1, codigo: '26 - Planos de Saúde no Brasil', cnpjPrestador: '44.555.666/0001-12', nomePrestador: 'AMIL ASSISTENCIA MEDICA INTERNACIONAL', valorPago: 6400.00, parcelaNaoDedutivel: 0 },
    { id: 2, codigo: '01 - Instrução no Brasil', cnpjPrestador: '60.888.999/0001-55', nomePrestador: 'SOCIEDADE EDUCACIONAL ANCHIETA', valorPago: 5200.00, parcelaNaoDedutivel: 0 }
  ]);
  const [novoPagto, setNovoPagto] = useState({ codigo: '10 - Médicos no Brasil', cnpjPrestador: '', nomePrestador: '', valorPago: '' });

  // 6. FICHA: BENS E DIREITOS
  const [bens] = useState([
    { id: 1, grupo: '01 - Bens Imóveis', codigo: '11 - Apartamento', discriminacao: 'Apartamento residencial adquirido mediante financiamento.', situacaoAnoAnterior: 210000.00, situacaoAnoAtual: 235000.00 },
    { id: 2, grupo: '04 - Aplicações', codigo: '02 - Títulos públicos e privados (CDB, RDB)', discriminacao: 'Saldo em CDB Liquidez Diária.', situacaoAnoAnterior: 12000.00, situacaoAnoAtual: 19500.00 }
  ]);

  // =========================================================
  // MOTOR DE CÁLCULO TRIBUTÁRIO DO PGD IRPF (ANUAL)
  // =========================================================
  const DEDUCAO_POR_DEPENDENTE = 2275.08;
  const LIMITE_EDUCACAO_INDIVIDUAL = 3561.50;
  const LIMITE_DESCONTO_SIMPLIFICADO = 16754.34;

  const totalRendimentosTributaveis = rendimentosPJ.reduce((acc, r) => acc + Number(r.rendimentosRecebidos || 0), 0);
  const totalInssOficial = rendimentosPJ.reduce((acc, r) => acc + Number(r.contribuicaoPrevidenciaria || 0), 0);
  const totalIrrfRetido = rendimentosPJ.reduce((acc, r) => acc + Number(r.impostoRetidoFonte || 0), 0);

  const deducaoDependentes = dependentes.length * DEDUCAO_POR_DEPENDENTE;
  
  const totalDespesasMedicas = pagamentos
    .filter(p => p.codigo.startsWith('10') || p.codigo.startsWith('11') || p.codigo.startsWith('21') || p.codigo.startsWith('26'))
    .reduce((acc, p) => acc + Math.max(0, Number(p.valorPago || 0) - Number(p.parcelaNaoDedutivel || 0)), 0);

  const totalDespesasEducacaoBruto = pagamentos
    .filter(p => p.codigo.startsWith('01'))
    .reduce((acc, p) => acc + Number(p.valorPago || 0), 0);
  
  const deducaoEducacaoAceita = pagamentos
    .filter(p => p.codigo.startsWith('01'))
    .reduce((acc, p) => acc + Math.min(Number(p.valorPago || 0), LIMITE_EDUCACAO_INDIVIDUAL), 0);

  const totalDeducoesLegais = totalInssOficial + deducaoDependentes + totalDespesasMedicas + deducaoEducacaoAceita;
  const baseCalculoCompleta = Math.max(0, totalRendimentosTributaveis - totalDeducoesLegais);

  const descontoSimplificadoValor = Math.min(totalRendimentosTributaveis * 0.20, LIMITE_DESCONTO_SIMPLIFICADO);
  const baseCalculoSimplificada = Math.max(0, totalRendimentosTributaveis - descontoSimplificadoValor);

  const calcularImpostoAnual = (base) => {
    if (base <= 26963.20) return { imposto: 0, aliquotaModal: 'Isento (0%)', parcelaDeduzir: 0 };
    if (base <= 33919.80) return { imposto: (base * 0.075) - 2022.24, aliquotaModal: '7,5%', parcelaDeduzir: 2022.24 };
    if (base <= 45012.60) return { imposto: (base * 0.15) - 4566.23, aliquotaModal: '15,0%', parcelaDeduzir: 4566.23 };
    if (base <= 55976.16) return { imposto: (base * 0.225) - 7942.17, aliquotaModal: '22,5%', parcelaDeduzir: 7942.17 };
    return { imposto: (base * 0.275) - 10740.98, aliquotaModal: '27,5%', parcelaDeduzir: 10740.98 };
  };

  const apuracaoCompleta = calcularImpostoAnual(baseCalculoCompleta);
  const apuracaoSimplificada = calcularImpostoAnual(baseCalculoSimplificada);

  const saldoCompleto = apuracaoCompleta.imposto - totalIrrfRetido;
  const saldoSimplificado = apuracaoSimplificada.imposto - totalIrrfRetido;

  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const adicionarRendimentoPJ = (e) => {
    e.preventDefault();
    if (!novoRendPJ.cnpjFonte || !novoRendPJ.nomeFonte) return;
    setRendimentosPJ([...rendimentosPJ, { id: Date.now(), ...novoRendPJ }]);
    setNovoRendPJ({ cnpjFonte: '', nomeFonte: '', rendimentosRecebidos: '', contribuicaoPrevidenciaria: '', impostoRetidoFonte: '', decimoTerceiro: '', irrfDecimoTerceiro: '' });
    if (typeof mostrarToast === 'function') mostrarToast("Fonte Pagadora PJ incluída na ficha!", "sucesso");
  };

  const adicionarPagamento = (e) => {
    e.preventDefault();
    if (!novoPagto.nomePrestador || !novoPagto.valorPago) return;
    setPagamentos([...pagamentos, { id: Date.now(), ...novoPagto, parcelaNaoDedutivel: 0 }]);
    setNovoPagto({ codigo: '10 - Médicos no Brasil', cnpjPrestador: '', nomePrestador: '', valorPago: '' });
    if (typeof mostrarToast === 'function') mostrarToast("Despesa registrada na ficha Pagamentos Efetuados!", "sucesso");
  };

  const inputStyle = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px', color: '#0f172a', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' };
  const labelStyle = { fontWeight: '700', fontSize: '12px', color: '#475569', display: 'block', marginBottom: '6px', wordBreak: 'break-word' };
  const cardStyle = { backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.4s' }}>
      
      {/* CABEÇALHO AZUL E AMARELO CLÁSSICO DO PROGRAMA IRPF */}
      <div style={{ backgroundColor: '#003366', color: 'white', padding: '20px 24px', borderRadius: '16px 16px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '4px solid #eab308', boxSizing: 'border-box', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0, flex: '1 1 250px' }}>
          <div style={{ backgroundColor: '#eab308', color: '#003366', padding: '8px 12px', borderRadius: '8px', fontWeight: '900', fontSize: '17px', flexShrink: 0 }}>
            🦁 IRPF
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: '15px', fontWeight: 'bold', wordBreak: 'break-word' }}>PGD - Declaração de Ajuste Anual (Simulador)</div>
            <div style={{ fontSize: '11.5px', color: '#93c5fd', wordBreak: 'break-word' }}>Secretaria Especial da Receita Federal • Exercício 2026</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <button 
            onClick={() => setFichaAtiva('pendencias')}
            style={{ backgroundColor: '#f59e0b', color: '#0f172a', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', boxSizing: 'border-box' }}
          >
            ✔️ Verificar Pendências
          </button>
          <button 
            onClick={() => {
              setReciboTransmitido({
                numeroRecibo: `${Math.floor(10 + Math.random()*89)}.${Math.floor(10 + Math.random()*89)}.${Math.floor(10 + Math.random()*89)}.${Math.floor(10 + Math.random()*89)}.${Math.floor(10 + Math.random()*89)}-${Math.floor(10 + Math.random()*89)}`,
                dataHora: new Date().toLocaleString('pt-BR'),
                modelo: modeloEscolhido === 'completo' ? 'Por Deduções Legais (Completa)' : 'Por Desconto Simplificado (20%)',
                saldoFinal: modeloEscolhido === 'completo' ? saldoCompleto : saldoSimplificado
              });
              setFichaAtiva('recibo');
              if (typeof mostrarToast === 'function') mostrarToast("Declaração de Ajuste Anual transmitida com sucesso!", "sucesso");
            }}
            style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', boxSizing: 'border-box' }}
          >
            🌐 Entregar Declaração
          </button>
        </div>
      </div>

      {/* CORPO DIVIDIDO: ÁRVORE DE FICHAS ESQUERDA + FICHA ATIVA DIREITA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderTop: 'none', borderRadius: '0 0 16px 16px', boxSizing: 'border-box', width: '100%' }}>
        
        {/* MENU LATERAL: FICHAS DA DECLARAÇÃO */}
        <div style={{ backgroundColor: '#f1f5f9', borderRight: '1px solid #cbd5e1', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxSizing: 'border-box', minWidth: 0 }}>
          <div style={{ boxSizing: 'border-box' }}>
            <div style={{ fontSize: '11.5px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', marginBottom: '10px', paddingLeft: '6px', wordBreak: 'break-word' }}>
              📁 Fichas da Declaração
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', boxSizing: 'border-box' }}>
              {[
                { id: 'identificacao', label: '👤 Identificação' },
                { id: 'dependentes', label: `👨‍👩‍👧 Dependentes (${dependentes.length})` },
                { id: 'rend_pj', label: '🏢 Rendimentos PJ' },
                { id: 'rend_isentos', label: '🛡️ Rend. Isentos' },
                { id: 'pagamentos', label: '🏥 Pagamentos' },
                { id: 'bens', label: `🏠 Bens e Direitos (${bens.length})` },
                { id: 'resumo', label: '📊 Resumo / Apuração' },
                { id: 'pendencias', label: '🔍 Malha Fiscal' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setFichaAtiva(item.id)}
                  style={{
                    textAlign: 'left',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12.5px',
                    fontWeight: fichaAtiva === item.id ? 'bold' : 'normal',
                    backgroundColor: fichaAtiva === item.id ? '#003366' : 'transparent',
                    color: fichaAtiva === item.id ? 'white' : '#1e293b',
                    boxSizing: 'border-box',
                    width: '100%',
                    wordBreak: 'break-word'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* PAINEL INFERIOR: COMPARATIVO EM TEMPO REAL */}
          <div style={{ marginTop: '20px', backgroundColor: '#ffffff', border: '2px solid #003366', borderRadius: '12px', padding: '14px', boxSizing: 'border-box', minWidth: 0 }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#003366', textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', wordBreak: 'break-word' }}>
              ⚖️ Opção Tributária
            </div>

            <label 
              onClick={() => setModeloEscolhido('completo')}
              style={{ display: 'block', padding: '10px', borderRadius: '8px', cursor: 'pointer', marginBottom: '8px', backgroundColor: modeloEscolhido === 'completo' ? '#eff6ff' : '#f8fafc', border: modeloEscolhido === 'completo' ? '1.5px solid #2563eb' : '1px solid #e2e8f0', boxSizing: 'border-box' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold', wordBreak: 'break-word' }}>
                <input type="radio" checked={modeloEscolhido === 'completo'} readOnly style={{ flexShrink: 0 }} />
                <span>Por Deduções Legais</span>
              </div>
              <div style={{ fontSize: '11.5px', marginTop: '4px', fontWeight: 'bold', color: saldoCompleto <= 0 ? '#16a34a' : '#dc2626', textAlign: 'right', wordBreak: 'break-word' }}>
                {saldoCompleto <= 0 ? `Restituir: R$ ${formatMoeda(Math.abs(saldoCompleto))}` : `Pagar: R$ ${formatMoeda(saldoCompleto)}`}
              </div>
            </label>

            <label 
              onClick={() => setModeloEscolhido('simplificado')}
              style={{ display: 'block', padding: '10px', borderRadius: '8px', cursor: 'pointer', backgroundColor: modeloEscolhido === 'simplificado' ? '#eff6ff' : '#f8fafc', border: modeloEscolhido === 'simplificado' ? '1.5px solid #2563eb' : '1px solid #e2e8f0', boxSizing: 'border-box' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold', wordBreak: 'break-word' }}>
                <input type="radio" checked={modeloEscolhido === 'simplificado'} readOnly style={{ flexShrink: 0 }} />
                <span>Por Desconto Simplificado</span>
              </div>
              <div style={{ fontSize: '11.5px', marginTop: '4px', fontWeight: 'bold', color: saldoSimplificado <= 0 ? '#16a34a' : '#dc2626', textAlign: 'right', wordBreak: 'break-word' }}>
                {saldoSimplificado <= 0 ? `Restituir: R$ ${formatMoeda(Math.abs(saldoSimplificado))}` : `Pagar: R$ ${formatMoeda(saldoSimplificado)}`}
              </div>
            </label>
          </div>
        </div>

        {/* ÁREA DE PREENCHIMENTO DA FICHA SELECIONADA */}
        <div style={{ padding: '20px', boxSizing: 'border-box', minWidth: 0, flex: 1 }}>
          
          {/* FICHA 1: IDENTIFICAÇÃO */}
          {fichaAtiva === 'identificacao' && (
            <div style={{ boxSizing: 'border-box' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#003366', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', fontSize: '15px', wordBreak: 'break-word' }}>
                👤 Identificação do Contribuinte - Declaração Original
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '16px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}>
                <div style={{ minWidth: 0 }}>
                  <label style={labelStyle}>CPF do Declarante:</label>
                  <input type="text" value={contribuinte.cpf} onChange={e => setContribuinte({...contribuinte, cpf: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ minWidth: 0, gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Nome Completo:</label>
                  <input type="text" value={contribuinte.nome} onChange={e => setContribuinte({...contribuinte, nome: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label style={labelStyle}>Data de Nascimento:</label>
                  <input type="date" value={contribuinte.dataNascimento} onChange={e => setContribuinte({...contribuinte, dataNascimento: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <label style={labelStyle}>Título de Eleitor:</label>
                  <input type="text" value={contribuinte.tituloEleitor} onChange={e => setContribuinte({...contribuinte, tituloEleitor: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ minWidth: 0, gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Ocupação Principal:</label>
                  <input type="text" value={contribuinte.ocupacaoPrincipal} onChange={e => setContribuinte({...contribuinte, ocupacaoPrincipal: e.target.value})} style={inputStyle} />
                </div>
                <div style={{ minWidth: 0, gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Endereço Completo:</label>
                  <input type="text" value={contribuinte.endereco} onChange={e => setContribuinte({...contribuinte, endereco: e.target.value})} style={inputStyle} />
                </div>
              </div>
            </div>
          )}

          {/* FICHA 2: DEPENDENTES */}
          {fichaAtiva === 'dependentes' && (
            <div style={{ boxSizing: 'border-box' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#003366', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', fontSize: '15px', wordBreak: 'break-word' }}>
                👨‍👩‍👧 Dependentes (Dedução Legal de R$ 2.275,08 por ano)
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!novoDep.nome || !novoDep.cpf) return;
                setDependentes([...dependentes, { id: Date.now(), ...novoDep }]);
                setNovoDep({ tipo: '21 - Filho(a) ou enteado(a) até 21 anos', nome: '', cpf: '', dataNasc: '' });
              }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '10px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', marginBottom: '20px', boxSizing: 'border-box' }}>
                <select value={novoDep.tipo} onChange={e => setNovoDep({...novoDep, tipo: e.target.value})} style={{ ...inputStyle, backgroundColor: 'white' }}>
                  <option value="11 - Companheiro(a) ou Cônjuge">11 - Cônjuge</option>
                  <option value="21 - Filho(a) ou enteado(a) até 21 anos">21 - Filho(a) até 21 anos</option>
                  <option value="22 - Filho(a) cursando ensino superior até 24 anos">22 - Filho(a) universitário</option>
                  <option value="31 - Pais, avós e bisavós">31 - Pais e avós</option>
                </select>
                <input type="text" placeholder="Nome Completo" required value={novoDep.nome} onChange={e => setNovoDep({...novoDep, nome: e.target.value})} style={inputStyle} />
                <input type="text" placeholder="CPF Obrigatório" required value={novoDep.cpf} onChange={e => setNovoDep({...novoDep, cpf: e.target.value})} style={inputStyle} />
                <button type="submit" style={{ backgroundColor: '#003366', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box' }}>+ Incluir</button>
              </form>

              <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', minWidth: '450px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '10px' }}>Relação</th>
                      <th style={{ padding: '10px' }}>Nome</th>
                      <th style={{ padding: '10px' }}>CPF</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Dedução Anual</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dependentes.map(d => (
                      <tr key={d.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '10px', wordBreak: 'break-word' }}>{d.tipo}</td>
                        <td style={{ padding: '10px', fontWeight: 'bold', wordBreak: 'break-word' }}>{d.nome}</td>
                        <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>{d.cpf}</td>
                        <td style={{ padding: '10px', textAlign: 'right', color: '#16a34a', fontWeight: 'bold', whiteSpace: 'nowrap' }}>R$ 2.275,08</td>
                        <td style={{ padding: '10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <button onClick={() => setDependentes(dependentes.filter(x => x.id !== d.id))} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11.5px' }}>Excluir</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FICHA 3: RENDIMENTOS TRIBUTÁVEIS PJ */}
          {fichaAtiva === 'rend_pj' && (
            <div style={{ boxSizing: 'border-box' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#003366', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', fontSize: '15px', wordBreak: 'break-word' }}>
                🏢 Rendimentos Tributáveis de Pessoa Jurídica (Informe)
              </h3>
              <form onSubmit={adicionarRendimentoPJ} style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', marginBottom: '20px', boxSizing: 'border-box' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '12px', marginBottom: '14px', boxSizing: 'border-box' }}>
                  <input type="text" placeholder="CNPJ da Fonte" required value={novoRendPJ.cnpjFonte} onChange={e => setNovoRendPJ({...novoRendPJ, cnpjFonte: e.target.value})} style={inputStyle} />
                  <input type="text" placeholder="Nome da Fonte" required value={novoRendPJ.nomeFonte} onChange={e => setNovoRendPJ({...novoRendPJ, nomeFonte: e.target.value})} style={inputStyle} />
                  <input type="number" step="0.01" placeholder="Rendimentos Brutos (R$)" required value={novoRendPJ.rendimentosRecebidos} onChange={e => setNovoRendPJ({...novoRendPJ, rendimentosRecebidos: e.target.value})} style={inputStyle} />
                  <input type="number" step="0.01" placeholder="INSS Oficial (R$)" value={novoRendPJ.contribuicaoPrevidenciaria} onChange={e => setNovoRendPJ({...novoRendPJ, contribuicaoPrevidenciaria: e.target.value})} style={inputStyle} />
                  <input type="number" step="0.01" placeholder="IRRF Retido (R$)" value={novoRendPJ.impostoRetidoFonte} onChange={e => setNovoRendPJ({...novoRendPJ, impostoRetidoFonte: e.target.value})} style={inputStyle} />
                </div>
                <button type="submit" style={{ backgroundColor: '#003366', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12.5px', boxSizing: 'border-box', width: '100%', maxWidth: '280px' }}>
                  + Lançar Informe de Rendimentos
                </button>
              </form>

              <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', minWidth: '500px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '10px' }}>Fonte Pagadora</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Rendimentos</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>INSS</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>IRRF</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rendimentosPJ.map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '10px', wordBreak: 'break-word' }}><strong style={{ wordBreak: 'break-word' }}>{r.nomeFonte}</strong><br/><span style={{ fontSize: '11px', color: '#64748b' }}>{r.cnpjFonte}</span></td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', whiteSpace: 'nowrap' }}>R$ {formatMoeda(r.rendimentosRecebidos)}</td>
                        <td style={{ padding: '10px', textAlign: 'right', whiteSpace: 'nowrap' }}>R$ {formatMoeda(r.contribuicaoPrevidenciaria)}</td>
                        <td style={{ padding: '10px', textAlign: 'right', color: '#1351b4', fontWeight: 'bold', whiteSpace: 'nowrap' }}>R$ {formatMoeda(r.impostoRetidoFonte)}</td>
                        <td style={{ padding: '10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                          <button onClick={() => setRendimentosPJ(rendimentosPJ.filter(x => x.id !== r.id))} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11.5px' }}>Excluir</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FICHA 4: RENDIMENTOS ISENTOS */}
          {fichaAtiva === 'rend_isentos' && (
            <div style={{ boxSizing: 'border-box' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#003366', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', fontSize: '15px', wordBreak: 'break-word' }}>
                🛡️ Rendimentos Isentos e Não Tributáveis (Lucros, Dividendos, Poupança)
              </h3>
              <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', minWidth: '450px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '10px' }}>Código</th>
                      <th style={{ padding: '10px' }}>Fonte Pagadora</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Valor Isento (R$)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rendimentosIsentos.map(ri => (
                      <tr key={ri.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '10px', fontWeight: 'bold', color: '#003366', wordBreak: 'break-word' }}>{ri.codigo}</td>
                        <td style={{ padding: '10px', wordBreak: 'break-word' }}>{ri.nomeFonte} ({ri.cnpjFonte})</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#16a34a', whiteSpace: 'nowrap' }}>R$ {formatMoeda(ri.valor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FICHA 5: PAGAMENTOS EFETUADOS */}
          {fichaAtiva === 'pagamentos' && (
            <div style={{ boxSizing: 'border-box' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#003366', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', fontSize: '15px', wordBreak: 'break-word' }}>
                🏥 Pagamentos Efetuados (Despesas Médicas e Instrução)
              </h3>
              <form onSubmit={adicionarPagamento} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))', gap: '10px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', marginBottom: '20px', boxSizing: 'border-box' }}>
                <select value={novoPagto.codigo} onChange={e => setNovoPagto({...novoPagto, codigo: e.target.value})} style={{ ...inputStyle, backgroundColor: 'white' }}>
                  <option value="10 - Médicos no Brasil">10 - Médicos (Sem Limite)</option>
                  <option value="11 - Dentistas no Brasil">11 - Dentistas (Sem Limite)</option>
                  <option value="21 - Hospitais e Laboratórios">21 - Hospitais (Sem Limite)</option>
                  <option value="26 - Planos de Saúde">26 - Planos de Saúde (Sem Limite)</option>
                  <option value="01 - Instrução no Brasil">01 - Instrução (Teto R$ 3.561,50)</option>
                </select>
                <input type="text" placeholder="CPF/CNPJ Prestador" required value={novoPagto.cnpjPrestador} onChange={e => setNovoPagto({...novoPagto, cnpjPrestador: e.target.value})} style={inputStyle} />
                <input type="text" placeholder="Nome da Clínica/Escola" required value={novoPagto.nomePrestador} onChange={e => setNovoPagto({...novoPagto, nomePrestador: e.target.value})} style={inputStyle} />
                <input type="number" step="0.01" placeholder="Valor Pago (R$)" required value={novoPagto.valorPago} onChange={e => setNovoPagto({...novoPagto, valorPago: e.target.value})} style={inputStyle} />
                <button type="submit" style={{ backgroundColor: '#003366', color: 'white', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box' }}>+ Lançar</button>
              </form>

              <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', minWidth: '500px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '10px' }}>Código</th>
                      <th style={{ padding: '10px' }}>Prestador</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Valor Pago</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Dedutível Aceito</th>
                      <th style={{ padding: '10px', textAlign: 'center' }}>Ação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagamentos.map(p => {
                      const dedutivel = p.codigo.startsWith('01') ? Math.min(Number(p.valorPago), LIMITE_EDUCACAO_INDIVIDUAL) : Number(p.valorPago);
                      return (
                        <tr key={p.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                          <td style={{ padding: '10px', fontWeight: 'bold', wordBreak: 'break-word' }}>{p.codigo}</td>
                          <td style={{ padding: '10px', wordBreak: 'break-word' }}>{p.nomePrestador}<br/><span style={{ fontSize: '11px', color: '#64748b' }}>{p.cnpjPrestador}</span></td>
                          <td style={{ padding: '10px', textAlign: 'right', whiteSpace: 'nowrap' }}>R$ {formatMoeda(p.valorPago)}</td>
                          <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#16a34a', whiteSpace: 'nowrap' }}>R$ {formatMoeda(dedutivel)}</td>
                          <td style={{ padding: '10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                            <button onClick={() => setPagamentos(pagamentos.filter(x => x.id !== p.id))} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '11.5px' }}>Excluir</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FICHA 6: BENS E DIREITOS */}
          {fichaAtiva === 'bens' && (
            <div style={{ boxSizing: 'border-box' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#003366', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', fontSize: '15px', wordBreak: 'break-word' }}>
                🏠 Declaração de Bens e Direitos (Custo de Aquisição)
              </h3>
              <div style={{ overflowX: 'auto', boxSizing: 'border-box' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', minWidth: '500px' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '10px' }}>Grupo / Código</th>
                      <th style={{ padding: '10px' }}>Discriminação do Bem</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Ano Anterior</th>
                      <th style={{ padding: '10px', textAlign: 'right' }}>Ano Atual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bens.map(b => (
                      <tr key={b.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '10px', fontWeight: 'bold', wordBreak: 'break-word' }}>{b.grupo}<br/><span style={{ fontSize: '11px', color: '#64748b' }}>{b.codigo}</span></td>
                        <td style={{ padding: '10px', wordBreak: 'break-word' }}>{b.discriminacao}</td>
                        <td style={{ padding: '10px', textAlign: 'right', whiteSpace: 'nowrap' }}>R$ {formatMoeda(b.situacaoAnoAnterior)}</td>
                        <td style={{ padding: '10px', textAlign: 'right', fontWeight: 'bold', color: '#003366', whiteSpace: 'nowrap' }}>R$ {formatMoeda(b.situacaoAnoAtual)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* FICHA 7: RESUMO DA DECLARAÇÃO */}
          {fichaAtiva === 'resumo' && (
            <div style={{ boxSizing: 'border-box' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#003366', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', fontSize: '15px', wordBreak: 'break-word' }}>
                📊 Demonstrativo de Apuração do Imposto - Comparativo Oficial
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
                
                {/* Coluna 1: Modelo Completo */}
                <div style={{ border: '2px solid #003366', borderRadius: '16px', padding: '16px', backgroundColor: '#f8fafc', boxSizing: 'border-box', minWidth: 0 }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#003366', fontSize: '14.5px', wordBreak: 'break-word' }}>1. Por Deduções Legais (Completo)</h4>
                  <div style={{ fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '8px', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}><span>Rend. Tributáveis:</span><strong style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(totalRendimentosTributaveis)}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', flexWrap: 'wrap', gap: '4px' }}><span>(-) INSS:</span><span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(totalInssOficial)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', flexWrap: 'wrap', gap: '4px' }}><span>(-) Dependentes:</span><span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(deducaoDependentes)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', flexWrap: 'wrap', gap: '4px' }}><span>(-) Instrução:</span><span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(deducaoEducacaoAceita)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', flexWrap: 'wrap', gap: '4px' }}><span>(-) Despesas Médicas:</span><span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(totalDespesasMedicas)}</span></div>
                    <hr style={{ border: '0.5px solid #cbd5e1', width: '100%' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', flexWrap: 'wrap', gap: '4px' }}><span>(=) Base de Cálculo:</span><span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(baseCalculoCompleta)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}><span>Imposto Devido ({apuracaoCompleta.aliquotaModal}):</span><strong style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(apuracaoCompleta.imposto)}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1351b4', flexWrap: 'wrap', gap: '4px' }}><span>(-) IRRF:</span><span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(totalIrrfRetido)}</span></div>
                    <div style={{ padding: '12px', borderRadius: '10px', marginTop: '6px', backgroundColor: saldoCompleto <= 0 ? '#dcfce7' : '#fee2e2', color: saldoCompleto <= 0 ? '#166534' : '#991b1b', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', boxSizing: 'border-box' }}>
                      <span style={{ wordBreak: 'break-word' }}>{saldoCompleto <= 0 ? 'IMPOSTO A RESTITUIR:' : 'IMPOSTO A PAGAR:'}</span>
                      <span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(Math.abs(saldoCompleto))}</span>
                    </div>
                  </div>
                </div>

                {/* Coluna 2: Modelo Simplificado */}
                <div style={{ border: '2px solid #475569', borderRadius: '16px', padding: '16px', backgroundColor: '#f8fafc', boxSizing: 'border-box', minWidth: 0 }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#334155', fontSize: '14.5px', wordBreak: 'break-word' }}>2. Por Desconto Simplificado (20%)</h4>
                  <div style={{ fontSize: '12.5px', display: 'flex', flexDirection: 'column', gap: '8px', boxSizing: 'border-box' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}><span>Rend. Tributáveis:</span><strong style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(totalRendimentosTributaveis)}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569', flexWrap: 'wrap', gap: '4px' }}><span>(-) Desconto 20% (Teto):</span><span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(descontoSimplificadoValor)}</span></div>
                    <hr style={{ border: '0.5px solid #cbd5e1', width: '100%' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', flexWrap: 'wrap', gap: '4px' }}><span>(=) Base Simplificada:</span><span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(baseCalculoSimplificada)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}><span>Imposto Devido ({apuracaoSimplificada.aliquotaModal}):</span><strong style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(apuracaoSimplificada.imposto)}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1351b4', flexWrap: 'wrap', gap: '4px' }}><span>(-) IRRF:</span><span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(totalIrrfRetido)}</span></div>
                    <div style={{ padding: '12px', borderRadius: '10px', marginTop: '6px', backgroundColor: saldoSimplificado <= 0 ? '#dcfce7' : '#fee2e2', color: saldoSimplificado <= 0 ? '#166534' : '#991b1b', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', boxSizing: 'border-box' }}>
                      <span style={{ wordBreak: 'break-word' }}>{saldoSimplificado <= 0 ? 'IMPOSTO A RESTITUIR:' : 'IMPOSTO A PAGAR:'}</span>
                      <span style={{ wordBreak: 'break-word' }}>R$ {formatMoeda(Math.abs(saldoSimplificado))}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* FICHA 8: VERIFICAR PENDÊNCIAS */}
          {fichaAtiva === 'pendencias' && (
            <div style={{ boxSizing: 'border-box' }}>
              <h3 style={{ margin: '0 0 16px 0', color: '#003366', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px', fontSize: '15px', wordBreak: 'break-word' }}>
                🔍 Verificação de Pendências e Crítica de Malha Fiscal
              </h3>
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '12px', marginBottom: '16px', boxSizing: 'border-box' }}>
                <strong style={{ color: '#166534', display: 'block', marginBottom: '4px', wordBreak: 'break-word' }}>✅ 0 Erros Impeditivos Encontrados</strong>
                <span style={{ fontSize: '13px', color: '#15803d', wordBreak: 'break-word' }}>A declaração está apta para transmissão eletrônica à Receita Federal.</span>
              </div>
              {totalDespesasEducacaoBruto > deducaoEducacaoAceita && (
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '16px', borderRadius: '12px', boxSizing: 'border-box' }}>
                  <strong style={{ color: '#92400e', display: 'block', marginBottom: '4px', wordBreak: 'break-word' }}>⚠️ 1 Aviso Legal (Não impede a transmissão)</strong>
                  <span style={{ fontSize: '13px', color: '#78350f', wordBreak: 'break-word' }}>
                    As despesas com Instrução lançadas (R$ {formatMoeda(totalDespesasEducacaoBruto)}) ultrapassaram o limite individual de R$ 3.561,50. O programa limitou automaticamente para R$ {formatMoeda(deducaoEducacaoAceita)}.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* FICHA 9: RECIBO DE ENTREGA */}
          {fichaAtiva === 'recibo' && reciboTransmitido && (
            <div style={{ border: '2px solid #003366', padding: '20px', borderRadius: '16px', backgroundColor: '#ffffff', boxSizing: 'border-box' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #003366', paddingBottom: '12px', marginBottom: '16px', boxSizing: 'border-box' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', wordBreak: 'break-word' }}>MINISTÉRIO DA FAZENDA • RECEITA FEDERAL DO BRASIL</div>
                <h2 style={{ margin: '6px 0', fontSize: '16px', color: '#003366', wordBreak: 'break-word' }}>RECIBO DE ENTREGA DE IRPF 2026</h2>
                <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '6px', fontSize: '11.5px', fontWeight: 'bold', display: 'inline-block', wordBreak: 'break-word' }}>
                  NÚMERO DO RECIBO: {reciboTransmitido.numeroRecibo}
                </span>
              </div>

              <div style={{ fontSize: '13px', lineHeight: '1.8', marginBottom: '20px', boxSizing: 'border-box', wordBreak: 'break-word' }}>
                <div><strong>Contribuinte:</strong> {contribuinte.nome} (CPF: {contribuinte.cpf})</div>
                <div><strong>Transmissão:</strong> {reciboTransmitido.dataHora}</div>
                <div><strong>Tributação:</strong> {reciboTransmitido.modelo}</div>
                <div>
                  <strong>Resultado:</strong>{' '}
                  <span style={{ fontWeight: 'bold', color: reciboTransmitido.saldoFinal <= 0 ? '#16a34a' : '#dc2626', wordBreak: 'break-word' }}>
                    {reciboTransmitido.saldoFinal <= 0 
                      ? `RESTITUIÇÃO DE R$ ${formatMoeda(Math.abs(reciboTransmitido.saldoFinal))} (Via PIX CPF)`
                      : `IMPOSTO A PAGAR DE R$ ${formatMoeda(reciboTransmitido.saldoFinal)} (DARF 0211)`}
                  </span>
                </div>
              </div>

              <button onClick={() => window.print()} style={{ backgroundColor: '#003366', color: 'white', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxSizing: 'border-box', width: '100%', maxWidth: '280px' }}>
                🖨️ Imprimir Recibo Completo
              </button>
            </div>
          )}

        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}