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
    naturezaOcupacao: '01 - Empregado de empresa do setor privado, exceto de instituições financeiras',
    cep: '06730-000',
    endereco: 'Rua Ponta Negra, 100 - Parque do Agreste',
    municipio: 'Vargem Grande Paulista',
    uf: 'SP',
    chavePixRestituicao: 'CPF do Contribuinte'
  });

  // 2. FICHA: DEPENDENTES (Dedução legal: R$ 2.275,08 por dependente/ano)
  const [dependentes, setDependentes] = useState([
    { id: 1, tipo: '21 - Filho(a) ou enteado(a) até 21 anos', nome: 'Lucas Lopes', cpf: '519.220.118-04', dataNasc: '2018-03-10' }
  ]);
  const [novoDep, setNovoDep] = useState({ tipo: '21 - Filho(a) ou enteado(a) até 21 anos', nome: '', cpf: '', dataNasc: '' });

  // 3. FICHA: RENDIMENTOS TRIBUTÁVEIS RECEBIDOS DE PESSOA JURÍDICA
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

  // 4. FICHA: RENDIMENTOS ISENTOS E NÃO TRIBUTÁVEIS
  const [rendimentosIsentos, setRendimentosIsentos] = useState([
    { id: 1, codigo: '09 - Lucros e dividendos recebidos', cnpjFonte: '48.912.345/0001-88', nomeFonte: 'SILVA & LOPES CONSULTORIA LTDA', valor: 18500.00 },
    { id: 2, codigo: '12 - Rendimentos de cadernetas de poupança, letras hipotecárias, LCI e LCA', cnpjFonte: '00.000.000/0001-91', nomeFonte: 'BANCO DO BRASIL SA', valor: 3420.50 }
  ]);

  // 5. FICHA: PAGAMENTOS EFETUADOS (SAÚDE E EDUCAÇÃO)
  // Regra RFB: Despesas médicas (cód 10/21/26) têm dedução integral (sem limite). Instrução (cód 01) tem teto anual de R$ 3.561,50 por pessoa.
  const [pagamentos, setPagamentos] = useState([
    { id: 1, codigo: '26 - Planos de Saúde no Brasil', cnpjPrestador: '44.555.666/0001-12', nomePrestador: 'AMIL ASSISTENCIA MEDICA INTERNACIONAL', valorPago: 6400.00, parcelaNaoDedutivel: 0 },
    { id: 2, codigo: '01 - Instrução no Brasil', cnpjPrestador: '60.888.999/0001-55', nomePrestador: 'SOCIEDADE EDUCACIONAL ANCHIETA / CRUZEIRO DO SUL', valorPago: 5200.00, parcelaNaoDedutivel: 0 }
  ]);
  const [novoPagto, setNovoPagto] = useState({ codigo: '10 - Médicos no Brasil', cnpjPrestador: '', nomePrestador: '', valorPago: '' });

  // 6. FICHA: BENS E DIREITOS
  const [bens, setBens] = useState([
    { id: 1, grupo: '01 - Bens Imóveis', codigo: '11 - Apartamento', discriminacao: 'Apartamento residencial adquirido mediante financiamento imobiliário.', situacaoAnoAnterior: 210000.00, situacaoAnoAtual: 235000.00 },
    { id: 2, grupo: '04 - Aplicações e Investimentos', codigo: '02 - Títulos públicos e privados sujeitos à tributação (Tesouro Direto, CDB, RDB)', discriminacao: 'Saldo em CDB Liquidez Diária - Instituição Financeira.', situacaoAnoAnterior: 12000.00, situacaoAnoAtual: 19500.00 }
  ]);
  const [novoBem, setNovoBem] = useState({ grupo: '01 - Bens Imóveis', codigo: '12 - Casa', discriminacao: '', situacaoAnoAnterior: '', situacaoAnoAtual: '' });

  // =========================================================
  // MOTOR DE CÁLCULO TRIBUTÁRIO DO PGD IRPF (ANUAL)
  // =========================================================
  const DEDUCAO_POR_DEPENDENTE = 2275.08;
  const LIMITE_EDUCACAO_INDIVIDUAL = 3561.50;
  const LIMITE_DESCONTO_SIMPLIFICADO = 16754.34;

  // Soma de Rendimentos Tributáveis e Retenções
  const totalRendimentosTributaveis = rendimentosPJ.reduce((acc, r) => acc + Number(r.rendimentosRecebidos || 0), 0);
  const totalInssOficial = rendimentosPJ.reduce((acc, r) => acc + Number(r.contribuicaoPrevidenciaria || 0), 0);
  const totalIrrfRetido = rendimentosPJ.reduce((acc, r) => acc + Number(r.impostoRetidoFonte || 0), 0);

  // Cálculo de Deduções Legais (Modelo Completo)
  const deducaoDependentes = dependentes.length * DEDUCAO_POR_DEPENDENTE;
  
  const totalDespesasMedicas = pagamentos
    .filter(p => p.codigo.startsWith('10') || p.codigo.startsWith('11') || p.codigo.startsWith('21') || p.codigo.startsWith('26'))
    .reduce((acc, p) => acc + Math.max(0, Number(p.valorPago || 0) - Number(p.parcelaNaoDedutivel || 0)), 0);

  const totalDespesasEducacaoBruto = pagamentos
    .filter(p => p.codigo.startsWith('01'))
    .reduce((acc, p) => acc + Number(p.valorPago || 0), 0);
  
  // Aplica o teto legal de educação (R$ 3.561,50 por lançamento/indivíduo)
  const deducaoEducacaoAceita = pagamentos
    .filter(p => p.codigo.startsWith('01'))
    .reduce((acc, p) => acc + Math.min(Number(p.valorPago || 0), LIMITE_EDUCACAO_INDIVIDUAL), 0);

  const totalDeducoesLegais = totalInssOficial + deducaoDependentes + totalDespesasMedicas + deducaoEducacaoAceita;
  const baseCalculoCompleta = Math.max(0, totalRendimentosTributaveis - totalDeducoesLegais);

  // Cálculo pelo Desconto Simplificado (20% dos rendimentos tributáveis, limitado a R$ 16.754,34)
  const descontoSimplificadoValor = Math.min(totalRendimentosTributaveis * 0.20, LIMITE_DESCONTO_SIMPLIFICADO);
  const baseCalculoSimplificada = Math.max(0, totalRendimentosTributaveis - descontoSimplificadoValor);

  // Função da Tabela Progressiva Anual do IRPF
  const calcularImpostoAnual = (base) => {
    if (base <= 26963.20) return { imposto: 0, aliquotaModal: 'Isento (0%)', parcelaDeduzir: 0 };
    if (base <= 33919.80) return { imposto: (base * 0.075) - 2022.24, aliquotaModal: '7,5%', parcelaDeduzir: 2022.24 };
    if (base <= 45012.60) return { imposto: (base * 0.15) - 4566.23, aliquotaModal: '15,0%', parcelaDeduzir: 4566.23 };
    if (base <= 55976.16) return { imposto: (base * 0.225) - 7942.17, aliquotaModal: '22,5%', parcelaDeduzir: 7942.17 };
    return { imposto: (base * 0.275) - 10740.98, aliquotaModal: '27,5%', parcelaDeduzir: 10740.98 };
  };

  const apuracaoCompleta = calcularImpostoAnual(baseCalculoCompleta);
  const apuracaoSimplificada = calcularImpostoAnual(baseCalculoSimplificada);

  // Saldo Final: Negativo = Imposto a Restituir | Positivo = Imposto a Pagar
  const saldoCompleto = apuracaoCompleta.imposto - totalIrrfRetido;
  const saldoSimplificado = apuracaoSimplificada.imposto - totalIrrfRetido;

  const formatMoeda = (v) => Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Funções de Adição
  const adicionarRendimentoPJ = (e) => {
    e.preventDefault();
    if (!novoRendPJ.cnpjFonte || !novoRendPJ.nomeFonte) return;
    setRendimentosPJ([...rendimentosPJ, { id: Date.now(), ...novoRendPJ }]);
    setNovoRendPJ({ cnpjFonte: '', nomeFonte: '', rendimentosRecebidos: '', contribuicaoPrevidenciaria: '', impostoRetidoFonte: '', decimoTerceiro: '', irrfDecimoTerceiro: '' });
    if (mostrarToast) mostrarToast("Fonte Pagadora PJ incluída na ficha!", "sucesso");
  };

  const adicionarPagamento = (e) => {
    e.preventDefault();
    if (!novoPagto.nomePrestador || !novoPagto.valorPago) return;
    setPagamentos([...pagamentos, { id: Date.now(), ...novoPagto, parcelaNaoDedutivel: 0 }]);
    setNovoPagto({ codigo: '10 - Médicos no Brasil', cnpjPrestador: '', nomePrestador: '', valorPago: '' });
    if (mostrarToast) mostrarToast("Despesa registrada na ficha Pagamentos Efetuados!", "sucesso");
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', color: '#1e293b' }}>
      
      {/* CABEÇALHO AZUL E AMARELO CLÁSSICO DO PROGRAMA IRPF */}
      <div style={{ backgroundColor: '#003366', color: 'white', padding: '14px 22px', borderRadius: '12px 12px 0 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', borderBottom: '4px solid #eab308' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#eab308', color: '#003366', padding: '8px 12px', borderRadius: '8px', fontWeight: '900', fontSize: '18px' }}>
            🦁 IRPF 2026
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 'bold' }}>PGD - Programa Gerador da Declaração de Ajuste Anual (Simulador Académico)</div>
            <div style={{ fontSize: '11px', color: '#93c5fd' }}>Secretaria Especial da Receita Federal do Brasil • Exercício 2026 / Ano-Calendário 2025</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => setFichaAtiva('pendencias')}
            style={{ backgroundColor: '#f59e0b', color: '#0f172a', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
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
              if (mostrarToast) mostrarToast("Declaração de Ajuste Anual transmitida com sucesso!", "sucesso");
            }}
            style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
          >
            🌐 Entregar Declaração
          </button>
        </div>
      </div>

      {/* CORPO DIVIDIDO: ÁRVORE DE FICHAS ESQUERDA + FICHA ATIVA DIREITA */}
      <div style={{ display: 'flex', flexWrap: 'wrap', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', minHeight: '520px' }}>
        
        {/* MENU LATERAL: FICHAS DA DECLARAÇÃO */}
        <div style={{ flex: '1 1 240px', maxWidth: '270px', backgroundColor: '#f1f5f9', borderRight: '1px solid #cbd5e1', padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '6px' }}>
              📁 Fichas da Declaração
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { id: 'identificacao', label: '👤 Identificação do Contribuinte' },
                { id: 'dependentes', label: `👨‍👩‍👧 Dependentes (${dependentes.length})` },
                { id: 'rend_pj', label: '🏢 Rend. Trib. Recebidos de PJ' },
                { id: 'rend_isentos', label: '🛡️ Rend. Isentos e Não Tributáveis' },
                { id: 'pagamentos', label: '🏥 Pagamentos Efetuados' },
                { id: 'bens', label: `🏠 Bens e Direitos (${bens.length})` },
                { id: 'resumo', label: '📊 Resumo da Declaração / Cálculo' },
                { id: 'pendencias', label: '🔍 Verificar Pendências (Malha)' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setFichaAtiva(item.id)}
                  style={{
                    textAlign: 'left',
                    padding: '9px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '12.5px',
                    fontWeight: fichaAtiva === item.id ? 'bold' : 'normal',
                    backgroundColor: fichaAtiva === item.id ? '#003366' : 'transparent',
                    color: fichaAtiva === item.id ? 'white' : '#1e293b'
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* PAINEL INFERIOR CLÁSSICO: COMPARATIVO COMPLETO VS SIMPLIFICADO EM TEMPO REAL */}
          <div style={{ marginTop: '20px', backgroundColor: '#ffffff', border: '2px solid #003366', borderRadius: '8px', padding: '12px', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#003366', textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px' }}>
              ⚖️ Opção pela Tributação
            </div>

            {/* Opção 1: Deduções Legais */}
            <label 
              onClick={() => setModeloEscolhido('completo')}
              style={{ display: 'block', padding: '8px', borderRadius: '6px', cursor: 'pointer', marginBottom: '8px', backgroundColor: modeloEscolhido === 'completo' ? '#eff6ff' : '#f8fafc', border: modeloEscolhido === 'completo' ? '1.5px solid #2563eb' : '1px solid #e2e8f0' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                <input type="radio" checked={modeloEscolhido === 'completo'} readOnly />
                <span>Por Deduções Legais</span>
              </div>
              <div style={{ fontSize: '12px', marginTop: '4px', fontWeight: 'bold', color: saldoCompleto <= 0 ? '#16a34a' : '#dc2626', textAlign: 'right' }}>
                {saldoCompleto <= 0 ? `A Restituir: R$ ${formatMoeda(Math.abs(saldoCompleto))}` : `Imposto a Pagar: R$ ${formatMoeda(saldoCompleto)}`}
              </div>
            </label>

            {/* Opção 2: Simplificado */}
            <label 
              onClick={() => setModeloEscolhido('simplificado')}
              style={{ display: 'block', padding: '8px', borderRadius: '6px', cursor: 'pointer', backgroundColor: modeloEscolhido === 'simplificado' ? '#eff6ff' : '#f8fafc', border: modeloEscolhido === 'simplificado' ? '1.5px solid #2563eb' : '1px solid #e2e8f0' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold' }}>
                <input type="radio" checked={modeloEscolhido === 'simplificado'} readOnly />
                <span>Por Desconto Simplificado</span>
              </div>
              <div style={{ fontSize: '12px', marginTop: '4px', fontWeight: 'bold', color: saldoSimplificado <= 0 ? '#16a34a' : '#dc2626', textAlign: 'right' }}>
                {saldoSimplificado <= 0 ? `A Restituir: R$ ${formatMoeda(Math.abs(saldoSimplificado))}` : `Imposto a Pagar: R$ ${formatMoeda(saldoSimplificado)}`}
              </div>
            </label>
          </div>
        </div>

        {/* ÁREA DE PREENCHIMENTO DA FICHA SELECIONADA */}
        <div style={{ flex: '3 1 550px', padding: '24px' }}>
          
          {/* FICHA 1: IDENTIFICAÇÃO */}
          {fichaAtiva === 'identificacao' && (
            <div>
              <h3 style={{ margin: '0 0 15px 0', color: '#003366', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
                👤 Identificação do Contribuinte - Declaração de Ajuste Anual Original
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>CPF do Declarante:</label>
                  <input type="text" value={contribuinte.cpf} onChange={e => setContribuinte({...contribuinte, cpf: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Nome Completo:</label>
                  <input type="text" value={contribuinte.nome} onChange={e => setContribuinte({...contribuinte, nome: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Data de Nascimento:</label>
                  <input type="date" value={contribuinte.dataNascimento} onChange={e => setContribuinte({...contribuinte, dataNascimento: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Título de Eleitor:</label>
                  <input type="text" value={contribuinte.tituloEleitor} onChange={e => setContribuinte({...contribuinte, tituloEleitor: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Ocupação Principal:</label>
                  <input type="text" value={contribuinte.ocupacaoPrincipal} onChange={e => setContribuinte({...contribuinte, ocupacaoPrincipal: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>Endereço Completo:</label>
                  <input type="text" value={contribuinte.endereco} onChange={e => setContribuinte({...contribuinte, endereco: e.target.value})} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8', boxSizing: 'border-box' }} />
                </div>
              </div>
            </div>
          )}

          {/* FICHA 2: DEPENDENTES */}
          {fichaAtiva === 'dependentes' && (
            <div>
              <h3 style={{ margin: '0 0 10px 0', color: '#003366', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
                👨‍👩‍👧 Dependentes (Dedução Legal de R$ 2.275,08 por Dependente)
              </h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                if (!novoDep.nome || !novoDep.cpf) return;
                setDependentes([...dependentes, { id: Date.now(), ...novoDep }]);
                setNovoDep({ tipo: '21 - Filho(a) ou enteado(a) até 21 anos', nome: '', cpf: '', dataNasc: '' });
              }} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                <select value={novoDep.tipo} onChange={e => setNovoDep({...novoDep, tipo: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8' }}>
                  <option value="11 - Companheiro(a) ou Cônjuge">11 - Companheiro(a) ou Cônjuge</option>
                  <option value="21 - Filho(a) ou enteado(a) até 21 anos">21 - Filho(a) ou enteado(a) até 21 anos</option>
                  <option value="22 - Filho(a) cursando ensino superior até 24 anos">22 - Filho(a) universitário até 24 anos</option>
                  <option value="31 - Pais, avós e bisavós">31 - Pais, avós e bisavós</option>
                </select>
                <input type="text" placeholder="Nome Completo do Dependente" required value={novoDep.nome} onChange={e => setNovoDep({...novoDep, nome: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8' }} />
                <input type="text" placeholder="CPF Obrigatório" required value={novoDep.cpf} onChange={e => setNovoDep({...novoDep, cpf: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8' }} />
                <button type="submit" style={{ backgroundColor: '#003366', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>+ Incluir Dependente</button>
              </form>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>Código / Relação</th>
                    <th style={{ padding: '8px' }}>Nome</th>
                    <th style={{ padding: '8px' }}>CPF</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Dedução Anual</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {dependentes.map(d => (
                    <tr key={d.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '8px' }}>{d.tipo}</td>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>{d.nome}</td>
                      <td style={{ padding: '8px' }}>{d.cpf}</td>
                      <td style={{ padding: '8px', textAlign: 'right', color: '#16a34a', fontWeight: 'bold' }}>R$ 2.275,08</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <button onClick={() => setDependentes(dependentes.filter(x => x.id !== d.id))} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* FICHA 3: RENDIMENTOS TRIBUTÁVEIS DE PESSOA JURÍDICA */}
          {fichaAtiva === 'rend_pj' && (
            <div>
              <h3 style={{ margin: '0 0 10px 0', color: '#003366', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
                🏢 Rendimentos Tributáveis Recebidos de Pessoa Jurídica pelo Titular (Informe de Rendimentos)
              </h3>
              <form onSubmit={adicionarRendimentoPJ} style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                  <input type="text" placeholder="CNPJ da Fonte Pagadora" required value={novoRendPJ.cnpjFonte} onChange={e => setNovoRendPJ({...novoRendPJ, cnpjFonte: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8' }} />
                  <input type="text" placeholder="Nome Empresarial da Fonte" required value={novoRendPJ.nomeFonte} onChange={e => setNovoRendPJ({...novoRendPJ, nomeFonte: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8' }} />
                  <input type="number" step="0.01" placeholder="Rendimentos Brutos (R$)" required value={novoRendPJ.rendimentosRecebidos} onChange={e => setNovoRendPJ({...novoRendPJ, rendimentosRecebidos: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8' }} />
                  <input type="number" step="0.01" placeholder="Contrib. Previdenciária INSS (R$)" value={novoRendPJ.contribuicaoPrevidenciaria} onChange={e => setNovoRendPJ({...novoRendPJ, contribuicaoPrevidenciaria: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8' }} />
                  <input type="number" step="0.01" placeholder="Imposto Retido na Fonte IRRF (R$)" value={novoRendPJ.impostoRetidoFonte} onChange={e => setNovoRendPJ({...novoRendPJ, impostoRetidoFonte: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8' }} />
                </div>
                <button type="submit" style={{ backgroundColor: '#003366', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12.5px' }}>
                  + Lançar Informe de Rendimentos PJ
                </button>
              </form>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>CNPJ / Fonte Pagadora</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Rendimentos</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>INSS Oficial</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>IRRF Retido</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {rendimentosPJ.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '8px' }}><strong>{r.nomeFonte}</strong><br/><span style={{ fontSize: '11px', color: '#64748b' }}>{r.cnpjFonte}</span></td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold' }}>R$ {formatMoeda(r.rendimentosRecebidos)}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>R$ {formatMoeda(r.contribuicaoPrevidenciaria)}</td>
                      <td style={{ padding: '8px', textAlign: 'right', color: '#1351b4', fontWeight: 'bold' }}>R$ {formatMoeda(r.impostoRetidoFonte)}</td>
                      <td style={{ padding: '8px', textAlign: 'center' }}>
                        <button onClick={() => setRendimentosPJ(rendimentosPJ.filter(x => x.id !== r.id))} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Excluir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* FICHA 4: RENDIMENTOS ISENTOS */}
          {fichaAtiva === 'rend_isentos' && (
            <div>
              <h3 style={{ margin: '0 0 10px 0', color: '#003366', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
                🛡️ Rendimentos Isentos e Não Tributáveis (Lucros, Dividendos, Poupança, FGTS)
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>Código da Receita</th>
                    <th style={{ padding: '8px' }}>Fonte Pagadora</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Valor Isento (R$)</th>
                  </tr>
                </thead>
                <tbody>
                  {rendimentosIsentos.map(ri => (
                    <tr key={ri.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold', color: '#003366' }}>{ri.codigo}</td>
                      <td style={{ padding: '8px' }}>{ri.nomeFonte} ({ri.cnpjFonte})</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#16a34a' }}>R$ {formatMoeda(ri.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* FICHA 5: PAGAMENTOS EFETUADOS */}
          {fichaAtiva === 'pagamentos' && (
            <div>
              <h3 style={{ margin: '0 0 10px 0', color: '#003366', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
                🏥 Pagamentos Efetuados (Despesas Médicas Integralmente Dedutíveis e Instrução com Teto Legal)
              </h3>
              <form onSubmit={adicionarPagamento} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
                <select value={novoPagto.codigo} onChange={e => setNovoPagto({...novoPagto, codigo: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8' }}>
                  <option value="10 - Médicos no Brasil">10 - Médicos no Brasil (Sem Limite)</option>
                  <option value="11 - Dentistas no Brasil">11 - Dentistas no Brasil (Sem Limite)</option>
                  <option value="21 - Hospitais, Clínicas e Laboratórios">21 - Hospitais e Laboratórios (Sem Limite)</option>
                  <option value="26 - Planos de Saúde no Brasil">26 - Planos de Saúde no Brasil (Sem Limite)</option>
                  <option value="01 - Instrução no Brasil">01 - Instrução / Faculdade (Teto R$ 3.561,50)</option>
                </select>
                <input type="text" placeholder="CPF/CNPJ do Prestador" required value={novoPagto.cnpjPrestador} onChange={e => setNovoPagto({...novoPagto, cnpjPrestador: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8' }} />
                <input type="text" placeholder="Nome da Clínica / Faculdade" required value={novoPagto.nomePrestador} onChange={e => setNovoPagto({...novoPagto, nomePrestador: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8' }} />
                <input type="number" step="0.01" placeholder="Valor Pago (R$)" required value={novoPagto.valorPago} onChange={e => setNovoPagto({...novoPagto, valorPago: e.target.value})} style={{ padding: '8px', borderRadius: '6px', border: '1px solid #94a3b8' }} />
                <button type="submit" style={{ backgroundColor: '#003366', color: 'white', border: 'none', padding: '8px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>+ Lançar Pagamento</button>
              </form>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>Código</th>
                    <th style={{ padding: '8px' }}>Prestador</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Valor Pago</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Valor Dedutível Aceito</th>
                    <th style={{ padding: '8px', textAlign: 'center' }}>Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {pagamentos.map(p => {
                    const dedutivel = p.codigo.startsWith('01') ? Math.min(Number(p.valorPago), LIMITE_EDUCACAO_INDIVIDUAL) : Number(p.valorPago);
                    return (
                      <tr key={p.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                        <td style={{ padding: '8px', fontWeight: 'bold' }}>{p.codigo}</td>
                        <td style={{ padding: '8px' }}>{p.nomePrestador}<br/><span style={{ fontSize: '11px', color: '#64748b' }}>{p.cnpjPrestador}</span></td>
                        <td style={{ padding: '8px', textAlign: 'right' }}>R$ {formatMoeda(p.valorPago)}</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#16a34a' }}>R$ {formatMoeda(dedutivel)}</td>
                        <td style={{ padding: '8px', textAlign: 'center' }}>
                          <button onClick={() => setPagamentos(pagamentos.filter(x => x.id !== p.id))} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Excluir</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* FICHA 6: BENS E DIREITOS */}
          {fichaAtiva === 'bens' && (
            <div>
              <h3 style={{ margin: '0 0 10px 0', color: '#003366', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
                🏠 Declaração de Bens e Direitos (Evolução Patrimonial pelo Custo de Aquisição)
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#e2e8f0', textAlign: 'left' }}>
                    <th style={{ padding: '8px' }}>Grupo / Código</th>
                    <th style={{ padding: '8px' }}>Discriminação do Bem</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Situação em 31/12/2024</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Situação em 31/12/2025</th>
                  </tr>
                </thead>
                <tbody>
                  {bens.map(b => (
                    <tr key={b.id} style={{ borderBottom: '1px solid #cbd5e1' }}>
                      <td style={{ padding: '8px', fontWeight: 'bold' }}>{b.grupo}<br/><span style={{ fontSize: '11px', color: '#64748b' }}>{b.codigo}</span></td>
                      <td style={{ padding: '8px' }}>{b.discriminacao}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>R$ {formatMoeda(b.situacaoAnoAnterior)}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 'bold', color: '#003366' }}>R$ {formatMoeda(b.situacaoAnoAtual)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* FICHA 7: RESUMO DA DECLARAÇÃO E CÁLCULO DE IMPOSTO */}
          {fichaAtiva === 'resumo' && (
            <div>
              <h3 style={{ margin: '0 0 15px 0', color: '#003366', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
                📊 Demonstrativo de Apuração do Imposto - Comparativo Oficial
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                
                {/* Coluna 1: Modelo Completo */}
                <div style={{ border: '2px solid #003366', borderRadius: '8px', padding: '16px', backgroundColor: '#f8fafc' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#003366' }}>1. Modelo Por Deduções Legais (Completo)</h4>
                  <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total de Rendimentos Tributáveis:</span><strong>R$ {formatMoeda(totalRendimentosTributaveis)}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}><span>(-) Contribuição Previdenciária (INSS):</span><span>R$ {formatMoeda(totalInssOficial)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}><span>(-) Dependentes ({dependentes.length}):</span><span>R$ {formatMoeda(deducaoDependentes)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}><span>(-) Despesas com Instrução (Com Teto):</span><span>R$ {formatMoeda(deducaoEducacaoAceita)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}><span>(-) Despesas Médicas (Sem Limite):</span><span>R$ {formatMoeda(totalDespesasMedicas)}</span></div>
                    <hr style={{ border: '0.5px solid #cbd5e1', width: '100%' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}><span>(=) Base de Cálculo do Imposto:</span><span>R$ {formatMoeda(baseCalculoCompleta)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Imposto Devido ({apuracaoCompleta.aliquotaModal}):</span><strong>R$ {formatMoeda(apuracaoCompleta.imposto)}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1351b4' }}><span>(-) Imposto Retido na Fonte (IRRF):</span><span>R$ {formatMoeda(totalIrrfRetido)}</span></div>
                    <div style={{ padding: '10px', borderRadius: '6px', marginTop: '6px', backgroundColor: saldoCompleto <= 0 ? '#dcfce7' : '#fee2e2', color: saldoCompleto <= 0 ? '#166534' : '#991b1b', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{saldoCompleto <= 0 ? 'IMPOSTO A RESTITUIR:' : 'SALDO DE IMPOSTO A PAGAR:'}</span>
                      <span>R$ {formatMoeda(Math.abs(saldoCompleto))}</span>
                    </div>
                  </div>
                </div>

                {/* Coluna 2: Modelo Simplificado */}
                <div style={{ border: '2px solid #475569', borderRadius: '8px', padding: '16px', backgroundColor: '#f8fafc' }}>
                  <h4 style={{ margin: '0 0 12px 0', color: '#334155' }}>2. Modelo Por Desconto Simplificado (20%)</h4>
                  <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Total de Rendimentos Tributáveis:</span><strong>R$ {formatMoeda(totalRendimentosTributaveis)}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#475569' }}><span>(-) Desconto Simplificado de 20% (Teto R$ 16.754,34):</span><span>R$ {formatMoeda(descontoSimplificadoValor)}</span></div>
                    <hr style={{ border: '0.5px solid #cbd5e1', width: '100%' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}><span>(=) Base de Cálculo Simplificada:</span><span>R$ {formatMoeda(baseCalculoSimplificada)}</span></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Imposto Devido ({apuracaoSimplificada.aliquotaModal}):</span><strong>R$ {formatMoeda(apuracaoSimplificada.imposto)}</strong></div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1351b4' }}><span>(-) Imposto Retido na Fonte (IRRF):</span><span>R$ {formatMoeda(totalIrrfRetido)}</span></div>
                    <div style={{ padding: '10px', borderRadius: '6px', marginTop: '6px', backgroundColor: saldoSimplificado <= 0 ? '#dcfce7' : '#fee2e2', color: saldoSimplificado <= 0 ? '#166534' : '#991b1b', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{saldoSimplificado <= 0 ? 'IMPOSTO A RESTITUIR:' : 'SALDO DE IMPOSTO A PAGAR:'}</span>
                      <span>R$ {formatMoeda(Math.abs(saldoSimplificado))}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* FICHA 8: VERIFICAR PENDÊNCIAS */}
          {fichaAtiva === 'pendencias' && (
            <div>
              <h3 style={{ margin: '0 0 15px 0', color: '#003366', borderBottom: '2px solid #cbd5e1', paddingBottom: '8px' }}>
                🔍 Verificação de Pendências e Crítica de Malha Fiscal
              </h3>
              <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '16px', borderRadius: '8px', marginBottom: '15px' }}>
                <strong style={{ color: '#166534', display: 'block', marginBottom: '4px' }}>✅ 0 Erros Impeditivos Encontrados</strong>
                <span style={{ fontSize: '13px', color: '#15803d' }}>A declaração está apta para transmissão eletrônica à Receita Federal.</span>
              </div>
              {totalDespesasEducacaoBruto > deducaoEducacaoAceita && (
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', padding: '16px', borderRadius: '8px' }}>
                  <strong style={{ color: '#92400e', display: 'block', marginBottom: '4px' }}>⚠️ 1 Aviso Legal (Não impede a transmissão)</strong>
                  <span style={{ fontSize: '13px', color: '#78350f' }}>
                    As despesas com Instrução lançadas (R$ {formatMoeda(totalDespesasEducacaoBruto)}) ultrapassaram o limite individual de R$ 3.561,50. O programa limitou automaticamente a parcela dedutível para R$ {formatMoeda(deducaoEducacaoAceita)}.
                  </span>
                </div>
              )}
            </div>
          )}

          {/* FICHA 9: RECIBO DE ENTREGA E DARF 0211 */}
          {fichaAtiva === 'recibo' && reciboTransmitido && (
            <div style={{ border: '2px solid #003366', padding: '24px', borderRadius: '8px', backgroundColor: '#ffffff' }}>
              <div style={{ textAlign: 'center', borderBottom: '2px solid #003366', paddingBottom: '12px', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>MINISTÉRIO DA FAZENDA • SECRETARIA ESPECIAL DA RECEITA FEDERAL DO BRASIL</div>
                <h2 style={{ margin: '6px 0', fontSize: '18px', color: '#003366' }}>RECIBO DE ENTREGA DE DECLARAÇÃO DE AJUSTE ANUAL - IRPF 2026</h2>
                <span style={{ backgroundColor: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                  NÚMERO DO RECIBO: {reciboTransmitido.numeroRecibo}
                </span>
              </div>

              <div style={{ fontSize: '13.5px', lineHeight: '1.8', marginBottom: '20px' }}>
                <div><strong>Contribuinte:</strong> {contribuinte.nome} (CPF: {contribuinte.cpf})</div>
                <div><strong>Data e Hora de Transmissão:</strong> {reciboTransmitido.dataHora}</div>
                <div><strong>Forma de Tributação Escolhida:</strong> {reciboTransmitido.modelo}</div>
                <div>
                  <strong>Resultado Apurado:</strong>{' '}
                  <span style={{ fontWeight: 'bold', color: reciboTransmitido.saldoFinal <= 0 ? '#16a34a' : '#dc2626' }}>
                    {reciboTransmitido.saldoFinal <= 0 
                      ? `IMPOSTO A RESTITUIR DE R$ ${formatMoeda(Math.abs(reciboTransmitido.saldoFinal))} (Crédito via PIX Chave CPF)`
                      : `IMPOSTO A PAGAR DE R$ ${formatMoeda(reciboTransmitido.saldoFinal)} (DARF Código 0211)`}
                  </span>
                </div>
              </div>

              <button onClick={() => window.print()} style={{ backgroundColor: '#003366', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                🖨️ Imprimir Recibo e Declaração Completa
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}