import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function SimuladorCriptoativos({ registrarFatoGerador, mostrarToast }) {
  // ==========================================
  // ESTADOS GERAIS E MERCADO EM TEMPO REAL
  // ==========================================
  const [caixaBrl, setCaixaBrl] = useState(100000); 
  
  // Carteira Multimoedas (Wallet)
  const [wallet, setWallet] = useState({
    BTC: { saldo: 0.15, custoMedio: 280000 }, // Começa com um pouco de BTC para teste
    ETH: { saldo: 0, custoMedio: 0 },
    DREX: { saldo: 5000, custoMedio: 1 } // DREX é pareado ao Real (Stablecoin 1:1)
  });

  // Cotações (Atualizadas dinamicamente)
  const [cotacoes, setCotacoes] = useState({ BTC: 300000, ETH: 15000, DREX: 1 });
  const [historicoBtc, setHistoricoBtc] = useState([]);
  const [carregandoMercado, setCarregandoMercado] = useState(false);

  // Inputs da Mesa de Operações
  const [moedaAtiva, setMoedaAtiva] = useState('BTC');
  const [valorBrlOperacao, setValorBrlOperacao] = useState(10000);

  // ==========================================
  // INTEGRAÇÃO COM API PÚBLICA (MERCADO REAL)
  // ==========================================
  const buscarCotacoesReais = async () => {
    setCarregandoMercado(true);
    try {
      // Usando a API gratuita do Mercado Bitcoin ou CoinGecko para pegar BRL
      const respostaBtc = await fetch('https://api.mercadobitcoin.net/api/v4/tickers?symbols=BTC-BRL');
      const dadosBtc = await respostaBtc.json();
      
      const respostaEth = await fetch('https://api.mercadobitcoin.net/api/v4/tickers?symbols=ETH-BRL');
      const dadosEth = await respostaEth.json();

      const precoBtcReais = Number(dadosBtc[0].last);
      const precoEthReais = Number(dadosEth[0].last);

      setCotacoes({
        BTC: precoBtcReais,
        ETH: precoEthReais,
        DREX: 1 // O DREX (Real Digital) sempre valerá 1 BRL
      });

      // Alimenta o gráfico de histórico
      const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setHistoricoBtc(prev => [...prev.slice(-10), { hora, preco: precoBtcReais }]);
      
      mostrarToast('Mercado Sincronizado! Cotações reais atualizadas.', 'sucesso');
    } catch (erro) {
      console.error(erro);
      // Fallback para simulação caso a API falhe por CORS ou bloqueio
      simularVolatilidadeFallback();
    }
    setCarregandoMercado(false);
  };

  const simularVolatilidadeFallback = () => {
    const varBtc = 1 + ((Math.random() * 10) - 4.5) / 100; // -4.5% a +5.5%
    const varEth = 1 + ((Math.random() * 12) - 5) / 100;   // -5.0% a +7.0%
    
    const novoBtc = Math.round(cotacoes.BTC * varBtc);
    const novoEth = Math.round(cotacoes.ETH * varEth);
    
    setCotacoes({ BTC: novoBtc, ETH: novoEth, DREX: 1 });
    
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setHistoricoBtc(prev => [...prev.slice(-10), { hora, preco: novoBtc }]);
    
    mostrarToast('Simulação de volatilidade aplicada (API Indisponível).', 'aviso');
  };

  // Carrega as cotações ao abrir a tela
  useEffect(() => {
    buscarCotacoesReais();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================
  // MÓDULO DE COMPRA E VENDA (COM MOTOR DIÁRIO)
  // ==========================================
  const comprarMoeda = () => {
    if (valorBrlOperacao <= 0) return mostrarToast('Insira um valor válido.', 'erro');
    if (caixaBrl < valorBrlOperacao) return mostrarToast('Saldo em Conta Corrente (BRL) insuficiente.', 'erro');
    
    const precoAtual = cotacoes[moedaAtiva];
    const qtdComprada = valorBrlOperacao / precoAtual;
    const ativoNaWallet = wallet[moedaAtiva];
    
    // Cálculo do Custo Médio Ponderado (Importante para Contabilidade)
    const valorEstoqueAnterior = ativoNaWallet.saldo * ativoNaWallet.custoMedio;
    const novoEstoqueQtd = ativoNaWallet.saldo + qtdComprada;
    const novoCustoMedio = (valorEstoqueAnterior + valorBrlOperacao) / novoEstoqueQtd;
    
    setCaixaBrl(prev => prev - valorBrlOperacao);
    setWallet({
      ...wallet,
      [moedaAtiva]: { saldo: novoEstoqueQtd, custoMedio: novoCustoMedio }
    });
    
    // Lançamento Contábil
    const contaDebito = moedaAtiva === 'DREX' ? '1.1.1.04' : '1.1.5.02'; // DREX é caixa/moeda, BTC/ETH é ativo financeiro/intangível
    registrarFatoGerador(`Aquisição de ${moedaAtiva} - Cot: R$ ${precoAtual.toLocaleString('pt-BR')}`, valorBrlOperacao, 'Web3', [contaDebito], ['1.1.1.02']);
    mostrarToast(`${moedaAtiva} comprado com sucesso! Lançado no Diário.`, 'sucesso');
  };

  const venderMoeda = () => {
    if (valorBrlOperacao <= 0) return mostrarToast('Insira um valor válido.', 'erro');
    
    const precoAtual = cotacoes[moedaAtiva];
    const qtdAVender = valorBrlOperacao / precoAtual;
    const ativoNaWallet = wallet[moedaAtiva];
    
    if (qtdAVender > ativoNaWallet.saldo) return mostrarToast(`Saldo de ${moedaAtiva} insuficiente para essa venda.`, 'erro');
    
    const custoDaVenda = qtdAVender * ativoNaWallet.custoMedio;
    const lucroObtido = valorBrlOperacao - custoDaVenda;
    
    setCaixaBrl(prev => prev + valorBrlOperacao);
    setWallet({
      ...wallet,
      [moedaAtiva]: { ...ativoNaWallet, saldo: ativoNaWallet.saldo - qtdAVender }
    });

    const contaCreditoAtivo = moedaAtiva === 'DREX' ? '1.1.1.04' : '1.1.5.02';
    
    // Lançamentos Contábeis de Baixa e Ganho/Perda
    registrarFatoGerador(`Entrada de Caixa ref. Venda de ${moedaAtiva}`, valorBrlOperacao, 'Web3', ['1.1.1.02'], [contaCreditoAtivo, '3.1.2.02']); 
    
    if (lucroObtido > 0 && moedaAtiva !== 'DREX') {
      const imposto = lucroObtido * 0.15; // 15% IR Ganho de Capital BR
      registrarFatoGerador(`Ganho de Capital na venda de ${moedaAtiva}`, lucroObtido, 'Web3', [contaCreditoAtivo], ['3.1.2.02']); 
      registrarFatoGerador(`Provisão IR Ganho de Capital (15%)`, imposto, 'Web3', ['4.1.1.03'], ['2.1.1.01']);
      mostrarToast(`Lucro de R$ ${lucroObtido.toFixed(2)}. IR de 15% provisionado.`, 'sucesso');
    } else if (lucroObtido < 0 && moedaAtiva !== 'DREX') {
      registrarFatoGerador(`Perda de Capital na venda de ${moedaAtiva}`, Math.abs(lucroObtido), 'Web3', ['4.1.2.02'], [contaCreditoAtivo]);
      mostrarToast(`Venda com Prejuízo de R$ ${Math.abs(lucroObtido).toFixed(2)}. Sem tributação.`, 'aviso');
    } else {
      mostrarToast('Venda realizada pelo preço de custo.', 'sucesso');
    }
  };

  // ==========================================
  // CÁLCULOS DO PORTFÓLIO (Para os Gráficos)
  // ==========================================
  const valorTotalBtc = wallet.BTC.saldo * cotacoes.BTC;
  const valorTotalEth = wallet.ETH.saldo * cotacoes.ETH;
  const valorTotalDrex = wallet.DREX.saldo * cotacoes.DREX;
  
  const patrimônioTotal = caixaBrl + valorTotalBtc + valorTotalEth + valorTotalDrex;

  const dadosCarteira = [
    { name: 'Banco (BRL)', value: caixaBrl, color: '#10b981' },
    { name: 'Real Digital (DREX)', value: valorTotalDrex, color: '#0ea5e9' },
    { name: 'Bitcoin (BTC)', value: valorTotalBtc, color: '#f59e0b' },
    { name: 'Ethereum (ETH)', value: valorTotalEth, color: '#8b5cf6' }
  ].filter(d => d.value > 0);

  return (
    <div style={{ backgroundColor: '#f1f5f9', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.4s' }}>
      
      {/* HEADER EXECUTIVO */}
      <div style={{ backgroundColor: '#0f172a', padding: '25px', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontSize: '38px' }}>🌐</span>
          <div>
            <h2 style={{ margin: 0, color: 'white', fontSize: 'clamp(20px, 4vw, 24px)' }}>Tesouraria Avançada (Cripto & DREX)</h2>
            <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>Auditoria Multimoedas, Mark-to-Market em Tempo Real e Ganho de Capital.</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '10px 15px', borderRadius: '8px', border: '1px solid #334155', textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>Patrimônio Líquido (BRL)</span>
            <span style={{ fontSize: '20px', fontWeight: '900', color: '#38bdf8' }}>R$ {patrimônioTotal.toLocaleString('pt-BR', {maximumFractionDigits:0})}</span>
          </div>
          <button onClick={buscarCotacoesReais} disabled={carregandoMercado} style={{ backgroundColor: '#f59e0b', color: '#0f172a', padding: '0 20px', borderRadius: '8px', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '14px' }}>
            {carregandoMercado ? '⏳ Sincronizando...' : '🔄 Sincronizar Mercado'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* ==========================================
            MESA DE OPERAÇÕES (EXCHANGE INTERNA)
            ========================================== */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px' }}>Mesa de Operações (OTC)</h3>
          
          <div style={{ display: 'flex', gap: '10px', backgroundColor: '#f8fafc', padding: '5px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <button onClick={() => setMoedaAtiva('BTC')} style={tabStyle(moedaAtiva === 'BTC', '#f59e0b')}>₿ BTC</button>
            <button onClick={() => setMoedaAtiva('ETH')} style={tabStyle(moedaAtiva === 'ETH', '#8b5cf6')}>⧫ ETH</button>
            <button onClick={() => setMoedaAtiva('DREX')} style={tabStyle(moedaAtiva === 'DREX', '#0ea5e9')}>🇧🇷 DREX</button>
          </div>

          <div style={{ backgroundColor: '#0f172a', padding: '20px', borderRadius: '10px', border: '1px solid #334155', textAlign: 'center', color: 'white' }}>
            <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Cotação em Tempo Real (1 {moedaAtiva})</span>
            <div style={{ fontSize: '32px', fontWeight: '900', color: moedaAtiva === 'BTC' ? '#f59e0b' : (moedaAtiva === 'ETH' ? '#8b5cf6' : '#0ea5e9'), margin: '5px 0' }}>
              R$ {cotacoes[moedaAtiva].toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ backgroundColor: '#f0fdf4', padding: '15px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
              <span style={{ display: 'block', fontSize: '11px', color: '#065f46', fontWeight: 'bold' }}>CONTA CORRENTE (BRL)</span>
              <span style={{ fontSize: '16px', fontWeight: '900', color: '#16a34a' }}>R$ {caixaBrl.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
            </div>
            <div style={{ backgroundColor: '#fffbeb', padding: '15px', borderRadius: '8px', border: '1px solid #fde68a' }}>
              <span style={{ display: 'block', fontSize: '11px', color: '#b45309', fontWeight: 'bold' }}>WALLET DE {moedaAtiva}</span>
              <span style={{ fontSize: '16px', fontWeight: '900', color: '#d97706' }}>{wallet[moedaAtiva].saldo.toFixed(4)}</span>
            </div>
          </div>

          <div style={{ marginTop: '10px' }}>
            <label style={lblSty}>Valor a Operar (BRL - R$)</label>
            <input type="number" style={{...inpSty, fontSize: '18px', fontWeight: 'bold', textAlign: 'center'}} value={valorBrlOperacao} onChange={e => setValorBrlOperacao(e.target.value)} />
            <span style={{ display: 'block', textAlign: 'center', fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
              Equivale a: {(valorBrlOperacao / cotacoes[moedaAtiva]).toFixed(6)} {moedaAtiva}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button onClick={comprarMoeda} style={btnStyle('#10b981')}>📥 COMPRAR {moedaAtiva}</button>
            <button onClick={venderMoeda} disabled={wallet[moedaAtiva].saldo <= 0} style={btnStyle(wallet[moedaAtiva].saldo > 0 ? '#ef4444' : '#cbd5e1')}>📤 VENDER {moedaAtiva}</button>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: 'auto', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span style={{ color: '#64748b', fontWeight: 'bold' }}>Preço Médio Contábil:</span>
              <strong>R$ {wallet[moedaAtiva].custoMedio.toLocaleString('pt-BR', {maximumFractionDigits:2})}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#64748b', fontWeight: 'bold' }}>Lucro (Mark-to-Market):</span>
              <strong style={{ color: (wallet[moedaAtiva].saldo * cotacoes[moedaAtiva] - wallet[moedaAtiva].saldo * wallet[moedaAtiva].custoMedio) >= 0 ? '#10b981' : '#ef4444' }}>
                R$ {(wallet[moedaAtiva].saldo * cotacoes[moedaAtiva] - wallet[moedaAtiva].saldo * wallet[moedaAtiva].custoMedio).toLocaleString('pt-BR', {maximumFractionDigits:2})}
              </strong>
            </div>
          </div>
        </div>

        {/* ==========================================
            DASHBOARD VISUAL (PORTFÓLIO E GRÁFICO)
            ========================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ height: '240px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>📈 Volatilidade do Ativo ({moedaAtiva})</h4>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={historicoBtc}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="hora" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => `R$ ${Number(v).toLocaleString('pt-BR')}`} contentStyle={{ borderRadius: '8px' }} />
                <Line type="monotone" dataKey="preco" stroke="#2563eb" strokeWidth={3} dot={false} animationDuration={300} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ height: '240px', backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #cbd5e1', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 150px' }}>
              <h4 style={{ margin: '0 0 15px 0', color: '#0f172a', fontSize: '15px' }}>Alocação de Risco</h4>
              {dadosCarteira.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: '10px', color: '#475569', fontWeight: 'bold' }}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: item.color, borderRadius: '4px' }}></span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>{item.name}</span>
                    <span style={{ color: '#0f172a' }}>R$ {item.value.toLocaleString('pt-BR', {maximumFractionDigits:0})}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ flex: '1 1 150px', height: '100%', minHeight: '150px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosCarteira} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                    {dadosCarteira.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `R$ ${Number(v).toLocaleString('pt-BR', {maximumFractionDigits:0})}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

// Estilos Reusáveis
const tabStyle = (ativo, cor) => ({
  flex: 1, padding: '10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
  backgroundColor: ativo ? cor : 'transparent', color: ativo ? 'white' : '#64748b'
});
const lblSty = { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' };
const inpSty = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px', outline: 'none' };
const btnStyle = (bg) => ({ backgroundColor: bg, color: 'white', padding: '14px 20px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontSize: '14px' });