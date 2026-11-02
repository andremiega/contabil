import React, { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function SimuladorCriptoativos({ registrarFatoGerador, mostrarToast }) {
  // ==========================================
  // ESTADOS GERAIS E MERCADO EM TEMPO REAL
  // ==========================================
  const [caixaBrl, setCaixaBrl] = useState(100000); 
  
  // Carteira Multimoedas (Wallet)
  const [wallet, setWallet] = useState({
    BTC: { saldo: 0.15, custoMedio: 280000 }, 
    ETH: { saldo: 0, custoMedio: 0 },
    DREX: { saldo: 5000, custoMedio: 1 } 
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
      const respostaBtc = await fetch('https://api.mercadobitcoin.net/api/v4/tickers?symbols=BTC-BRL');
      const dadosBtc = await respostaBtc.json();
      
      const respostaEth = await fetch('https://api.mercadobitcoin.net/api/v4/tickers?symbols=ETH-BRL');
      const dadosEth = await respostaEth.json();

      const precoBtcReais = Number(dadosBtc[0].last);
      const precoEthReais = Number(dadosEth[0].last);

      setCotacoes({
        BTC: precoBtcReais,
        ETH: precoEthReais,
        DREX: 1 
      });

      const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setHistoricoBtc(prev => [...prev.slice(-10), { hora, preco: precoBtcReais }]);
      
      if (typeof mostrarToast === 'function') mostrarToast('Mercado Sincronizado! Cotações reais atualizadas.', 'sucesso');
    } catch (erro) {
      console.error(erro);
      simularVolatilidadeFallback();
    }
    setCarregandoMercado(false);
  };

  const simularVolatilidadeFallback = () => {
    const varBtc = 1 + ((Math.random() * 10) - 4.5) / 100; 
    const varEth = 1 + ((Math.random() * 12) - 5) / 100;   
    
    const novoBtc = Math.round(cotacoes.BTC * varBtc);
    const novoEth = Math.round(cotacoes.ETH * varEth);
    
    setCotacoes({ BTC: novoBtc, ETH: novoEth, DREX: 1 });
    
    const hora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setHistoricoBtc(prev => [...prev.slice(-10), { hora, preco: novoBtc }]);
    
    if (typeof mostrarToast === 'function') mostrarToast('Simulação de volatilidade aplicada (API Indisponível).', 'aviso');
  };

  useEffect(() => {
    buscarCotacoesReais();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ==========================================
  // MÓDULO DE COMPRA E VENDA
  // ==========================================
  const comprarMoeda = () => {
    const val = Number(valorBrlOperacao) || 0;
    if (val <= 0) return mostrarToast('Insira um valor válido.', 'erro');
    if (caixaBrl < val) return mostrarToast('Saldo em Conta Corrente (BRL) insuficiente.', 'erro');
    
    const precoAtual = cotacoes[moedaAtiva];
    const qtdComprada = val / precoAtual;
    const ativoNaWallet = wallet[moedaAtiva];
    
    const valorEstoqueAnterior = ativoNaWallet.saldo * ativoNaWallet.custoMedio;
    const novoEstoqueQtd = ativoNaWallet.saldo + qtdComprada;
    const novoCustoMedio = (valorEstoqueAnterior + val) / novoEstoqueQtd;
    
    setCaixaBrl(prev => prev - val);
    setWallet({
      ...wallet,
      [moedaAtiva]: { saldo: novoEstoqueQtd, custoMedio: novoCustoMedio }
    });
    
    const contaDebito = moedaAtiva === 'DREX' ? '1.1.1.04' : '1.1.5.02'; 
    if (typeof registrarFatoGerador === 'function') {
      registrarFatoGerador(`Aquisição de ${moedaAtiva} Cot: R$ ${precoAtual.toLocaleString('pt-BR')}`, val, 'Web3', [contaDebito], ['1.1.01.02']);
    }
    if (typeof mostrarToast === 'function') mostrarToast(`${moedaAtiva} comprado com sucesso! Lançado no Diário.`, 'sucesso');
  };

  const venderMoeda = () => {
    const val = Number(valorBrlOperacao) || 0;
    if (val <= 0) return mostrarToast('Insira um valor válido.', 'erro');
    
    const precoAtual = cotacoes[moedaAtiva];
    const qtdAVender = val / precoAtual;
    const ativoNaWallet = wallet[moedaAtiva];
    
    if (qtdAVender > ativoNaWallet.saldo) return mostrarToast(`Saldo de ${moedaAtiva} insuficiente para essa venda.`, 'erro');
    
    const custoDaVenda = qtdAVender * ativoNaWallet.custoMedio;
    const lucroObtido = val - custoDaVenda;
    
    setCaixaBrl(prev => prev + val);
    setWallet({
      ...wallet,
      [moedaAtiva]: { ...ativoNaWallet, saldo: ativoNaWallet.saldo - qtdAVender }
    });

    const contaCreditoAtivo = moedaAtiva === 'DREX' ? '1.1.1.04' : '1.1.5.02';
    
    if (typeof registrarFatoGerador === 'function') {
      registrarFatoGerador(`Entrada de Caixa ref. Venda de ${moedaAtiva}`, val, 'Web3', ['1.1.01.02'], [contaCreditoAtivo, '3.1.2.02']); 
      
      if (lucroObtido > 0 && moedaAtiva !== 'DREX') {
        const imposto = lucroObtido * 0.15; 
        registrarFatoGerador(`Ganho de Capital na venda de ${moedaAtiva}`, lucroObtido, 'Web3', [contaCreditoAtivo], ['3.1.2.02']); 
        registrarFatoGerador(`Provisão IR Ganho de Capital (15%)`, imposto, 'Web3', ['4.1.1.03'], ['2.1.1.01']);
      } else if (lucroObtido < 0 && moedaAtiva !== 'DREX') {
        registrarFatoGerador(`Perda de Capital na venda de ${moedaAtiva}`, Math.abs(lucroObtido), 'Web3', ['4.1.2.02'], [contaCreditoAtivo]);
      }
    }

    if (lucroObtido > 0 && moedaAtiva !== 'DREX') {
      if (typeof mostrarToast === 'function') mostrarToast(`Lucro de R$ ${lucroObtido.toFixed(2)}. IR de 15% provisionado.`, 'sucesso');
    } else if (lucroObtido < 0 && moedaAtiva !== 'DREX') {
      if (typeof mostrarToast === 'function') mostrarToast(`Venda com Prejuízo de R$ ${Math.abs(lucroObtido).toFixed(2)}. Sem tributação.`, 'aviso');
    } else {
      if (typeof mostrarToast === 'function') mostrarToast('Venda realizada pelo preço de custo.', 'sucesso');
    }
  };

  // ==========================================
  // CÁLCULOS DO PORTFÓLIO
  // ==========================================
  const valorTotalBtc = wallet.BTC.saldo * cotacoes.BTC;
  const valorTotalEth = wallet.ETH.saldo * cotacoes.ETH;
  const valorTotalDrex = wallet.DREX.saldo * cotacoes.DREX;
  
  const patrimônioTotal = caixaBrl + valorTotalBtc + valorTotalEth + valorTotalDrex;

  const dadosCarteira = useMemo(() => [
    { name: 'Banco (BRL)', value: caixaBrl, color: '#10b981' },
    { name: 'Real Digital (DREX)', value: valorTotalDrex, color: '#0ea5e9' },
    { name: 'Bitcoin (BTC)', value: valorTotalBtc, color: '#f59e0b' },
    { name: 'Ethereum (ETH)', value: valorTotalEth, color: '#8b5cf6' }
  ].filter(d => d.value > 0), [caixaBrl, valorTotalDrex, valorTotalBtc, valorTotalEth]);

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', animation: 'fadeIn 0.4s', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      
      {/* HEADER EXECUTIVO */}
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '24px', borderRadius: '20px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', boxSizing: 'border-box', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0, flex: '1 1 260px' }}>
          <span style={{ fontSize: '36px' }}>🌐</span>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ margin: 0, color: 'white', fontSize: '20px', fontWeight: '900', wordBreak: 'break-word' }}>Tesouraria Avançada (Cripto & DREX)</h2>
            <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontSize: '13px' }}>Auditoria Multimoedas, Mark-to-Market em Tempo Real e Ganho de Capital.</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
          <div style={{ backgroundColor: '#1e293b', padding: '10px 16px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'right', boxSizing: 'border-box', minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: '10.5px', color: '#94a3b8', fontWeight: 'bold' }}>Patrimônio Líquido (BRL)</span>
            <span style={{ fontSize: '18px', fontWeight: '900', color: '#38bdf8', wordBreak: 'break-word' }}>R$ {patrimônioTotal.toLocaleString('pt-BR', {maximumFractionDigits:0})}</span>
          </div>
          <button onClick={buscarCotacoesReais} disabled={carregandoMercado} style={{ backgroundColor: '#f59e0b', color: '#0f172a', padding: '0 18px', borderRadius: '12px', border: 'none', fontWeight: '900', cursor: 'pointer', fontSize: '13px', boxSizing: 'border-box' }}>
            {carregandoMercado ? '⏳ Sincronizando...' : '🔄 Sincronizar'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
        
        {/* ==========================================
            MESA DE OPERAÇÕES (EXCHANGE INTERNA)
            ========================================== */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '20px', border: '1px solid #cbd5e1', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box', minWidth: 0 }}>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '17px', wordBreak: 'break-word' }}>Mesa de Operações (OTC)</h3>
          
          <div style={{ display: 'flex', gap: '6px', backgroundColor: '#f8fafc', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0', boxSizing: 'border-box' }}>
            <button onClick={() => setMoedaAtiva('BTC')} style={tabStyle(moedaAtiva === 'BTC', '#f59e0b')}>₿ BTC</button>
            <button onClick={() => setMoedaAtiva('ETH')} style={tabStyle(moedaAtiva === 'ETH', '#8b5cf6')}>⧫ ETH</button>
            <button onClick={() => setMoedaAtiva('DREX')} style={tabStyle(moedaAtiva === 'DREX', '#0ea5e9')}>🇧🇷 DREX</button>
          </div>

          <div style={{ backgroundColor: '#0f172a', padding: '18px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'center', color: 'white', boxSizing: 'border-box' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Cotação em Tempo Real (1 {moedaAtiva})</span>
            <div style={{ fontSize: '26px', fontWeight: '900', color: moedaAtiva === 'BTC' ? '#f59e0b' : (moedaAtiva === 'ETH' ? '#8b5cf6' : '#0ea5e9'), margin: '4px 0', wordBreak: 'break-word' }}>
              R$ {cotacoes[moedaAtiva].toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '12px', boxSizing: 'border-box' }}>
            <div style={{ backgroundColor: '#f0fdf4', padding: '14px', borderRadius: '10px', border: '1px solid #a7f3d0', boxSizing: 'border-box', minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: '10.5px', color: '#065f46', fontWeight: 'bold' }}>CONTA CORRENTE (BRL)</span>
              <span style={{ fontSize: '15px', fontWeight: '900', color: '#16a34a', wordBreak: 'break-word' }}>R$ {caixaBrl.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span>
            </div>
            <div style={{ backgroundColor: '#fffbeb', padding: '14px', borderRadius: '10px', border: '1px solid #fde68a', boxSizing: 'border-box', minWidth: 0 }}>
              <span style={{ display: 'block', fontSize: '10.5px', color: '#b45309', fontWeight: 'bold' }}>WALLET {moedaAtiva}</span>
              <span style={{ fontSize: '15px', fontWeight: '900', color: '#d97706', wordBreak: 'break-word' }}>{wallet[moedaAtiva].saldo.toFixed(4)}</span>
            </div>
          </div>

          <div style={{ marginTop: '4px', boxSizing: 'border-box' }}>
            <label style={lblSty}>Valor a Operar (BRL - R$)</label>
            <input type="number" style={{...inpSty, fontSize: '16px', fontWeight: 'bold', textAlign: 'center'}} value={valorBrlOperacao} onChange={e => setValorBrlOperacao(e.target.value)} />
            <span style={{ display: 'block', textAlign: 'center', fontSize: '11.5px', color: '#64748b', marginTop: '6px', wordBreak: 'break-word' }}>
              Equivale a: {(valorBrlOperacao / cotacoes[moedaAtiva]).toFixed(6)} {moedaAtiva}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
            <button onClick={comprarMoeda} style={btnStyle('#10b981')}>📥 COMPRAR {moedaAtiva}</button>
            <button onClick={venderMoeda} disabled={wallet[moedaAtiva].saldo <= 0} style={btnStyle(wallet[moedaAtiva].saldo > 0 ? '#ef4444' : '#cbd5e1')}>📤 VENDER {moedaAtiva}</button>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '14px', marginTop: 'auto', fontSize: '12px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '4px' }}>
              <span style={{ color: '#64748b', fontWeight: 'bold' }}>Preço Médio Contábil:</span>
              <strong style={{ wordBreak: 'break-word' }}>R$ {wallet[moedaAtiva].custoMedio.toLocaleString('pt-BR', {maximumFractionDigits:2})}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '4px' }}>
              <span style={{ color: '#64748b', fontWeight: 'bold' }}>Lucro (Mark-to-Market):</span>
              <strong style={{ color: (wallet[moedaAtiva].saldo * cotacoes[moedaAtiva] - wallet[moedaAtiva].saldo * wallet[moedaAtiva].custoMedio) >= 0 ? '#10b981' : '#ef4444', wordBreak: 'break-word' }}>
                R$ {(wallet[moedaAtiva].saldo * cotacoes[moedaAtiva] - wallet[moedaAtiva].saldo * wallet[moedaAtiva].custoMedio).toLocaleString('pt-BR', {maximumFractionDigits:2})}
              </strong>
            </div>
          </div>
        </div>

        {/* ==========================================
            DASHBOARD VISUAL (PORTFÓLIO E GRÁFICO)
            ========================================== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0, boxSizing: 'border-box' }}>
          
          <div style={{ height: '230px', backgroundColor: '#ffffff', padding: '20px', borderRadius: '20px', border: '1px solid #cbd5e1', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', boxSizing: 'border-box', minWidth: 0 }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#0f172a', fontSize: '15px', wordBreak: 'break-word' }}>📈 Volatilidade do Ativo ({moedaAtiva})</h4>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={historicoBtc}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="hora" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(v) => `R$${(v/1000).toFixed(0)}k`} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v) => `R$ ${Number(v).toLocaleString('pt-BR')}`} contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="preco" stroke="#2563eb" strokeWidth={3} dot={false} animationDuration={300} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '20px', border: '1px solid #cbd5e1', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxSizing: 'border-box', minWidth: 0 }}>
            <div style={{ flex: '1 1 180px', minWidth: 0 }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#0f172a', fontSize: '15px', wordBreak: 'break-word' }}>Alocação de Risco</h4>
              {dadosCarteira.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', marginBottom: '8px', color: '#475569', fontWeight: 'bold', wordBreak: 'break-word' }}>
                  <span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: item.color, borderRadius: '3px', flexShrink: 0 }}></span>
                  <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                    <span style={{ wordBreak: 'break-word' }}>{item.name}</span>
                    <span style={{ color: '#0f172a', wordBreak: 'break-word' }}>R$ {item.value.toLocaleString('pt-BR', {maximumFractionDigits:0})}</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ flex: '1 1 180px', height: '160px', minWidth: 0, boxSizing: 'border-box' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={dadosCarteira} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                    {dadosCarteira.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `R$ ${Number(v).toLocaleString('pt-BR', {maximumFractionDigits:0})}`} contentStyle={{ fontSize: '12px', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  );
}

// Estilos Reusáveis
const tabStyle = (ativo, cor) => ({
  flex: 1, padding: '8px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
  backgroundColor: ativo ? cor : 'transparent', color: ativo ? 'white' : '#64748b', boxSizing: 'border-box', textAlign: 'center'
});
const lblSty = { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px', wordBreak: 'break-word' };
const inpSty = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '13.5px', outline: 'none', backgroundColor: 'white' };
const btnStyle = (bg) => ({ backgroundColor: bg, color: 'white', padding: '12px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontSize: '13.5px', boxSizing: 'border-box', width: '100%' });