import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine, LabelList } from 'recharts';

export default function SimuladorInfoprodutos({ registrarFatoGerador, mostrarToast }) {
  // Estados Dinâmicos (Inputs do Usuário)
  const [precoProduto, setPrecoProduto] = useState(1000);
  const [percPlataforma, setPercPlataforma] = useState(10);
  const [percAfiliado, setPercAfiliado] = useState(20);
  const [percImposto, setPercImposto] = useState(6); // Ex: Simples Nacional Anexo III

  // Estado da Plataforma e Histórico
  const [saldoPlataforma, setSaldoPlataforma] = useState(0);
  const [impostoAcumulado, setImpostoAcumulado] = useState(0);
  const [historicoVendas, setHistoricoVendas] = useState([]);
  
  const simularVenda = (e) => {
    e.preventDefault();
    if (precoProduto <= 0) return mostrarToast ? mostrarToast('O valor do produto deve ser maior que zero.', 'erro') : alert('O valor do produto deve ser maior que zero.');

    const valorTaxa = precoProduto * (percPlataforma / 100);
    const valorAfiliado = precoProduto * (percAfiliado / 100);
    const valorImposto = precoProduto * (percImposto / 100);
    
    const liquidoPlataforma = precoProduto - valorTaxa - valorAfiliado;
    const lucroReal = liquidoPlataforma - valorImposto;
    
    setSaldoPlataforma(prev => prev + liquidoPlataforma);
    setImpostoAcumulado(prev => prev + valorImposto);
    
    const novaVenda = {
      id: Date.now(),
      bruto: precoProduto,
      taxa: valorTaxa,
      afiliado: valorAfiliado,
      imposto: valorImposto,
      lucro: lucroReal
    };
    
    setHistoricoVendas([...historicoVendas, novaVenda]);
    
    // ====================================================
    // MOTOR DIÁRIO: CONTABILIZAÇÃO COMPLETA
    // ====================================================
    if (typeof registrarFatoGerador === 'function') {
      registrarFatoGerador(`Venda Infoproduto (Receita Bruta)`, precoProduto, 'Infoprodutos', ['1.1.2.01'], ['3.1.1.01']);
      registrarFatoGerador(`Taxa Plataforma (${percPlataforma}%)`, valorTaxa, 'Infoprodutos', ['4.1.2.01'], ['1.1.2.01']);
      registrarFatoGerador(`Comissão Afiliado (${percAfiliado}%)`, valorAfiliado, 'Infoprodutos', ['4.1.1.02'], ['1.1.2.01']);
      registrarFatoGerador(`Provisão de Imposto s/ Venda (${percImposto}%)`, valorImposto, 'Infoprodutos', ['4.1.1.03'], ['2.1.1.01']);
    }
    
    if (typeof mostrarToast === 'function') mostrarToast('Venda realizada! Split e Impostos contabilizados no Diário.', 'sucesso');
  };

  const sacarParaBanco = () => {
    if (saldoPlataforma <= 0) return mostrarToast ? mostrarToast('Saldo insuficiente na plataforma.', 'erro') : alert('Saldo insuficiente na plataforma.');
    if (typeof registrarFatoGerador === 'function') {
      registrarFatoGerador(`Saque Plataforma para Conta Corrente`, saldoPlataforma, 'Infoprodutos', ['1.1.1.02'], ['1.1.2.01']);
    }
    setSaldoPlataforma(0);
    if (typeof mostrarToast === 'function') mostrarToast('Saque efetuado para a Conta Corrente.', 'sucesso');
  };

  const pagarImposto = () => {
    if (impostoAcumulado <= 0) return mostrarToast ? mostrarToast('Nenhum imposto a recolher no momento.', 'aviso') : alert('Nenhum imposto a recolher no momento.');
    if (typeof registrarFatoGerador === 'function') {
      registrarFatoGerador(`Pagamento de Guia DAS (Impostos)`, impostoAcumulado, 'Infoprodutos', ['2.1.1.01'], ['1.1.1.02']);
    }
    setImpostoAcumulado(0);
    if (typeof mostrarToast === 'function') mostrarToast('Guia de Imposto paga! Passivo baixado.', 'sucesso');
  };

  // Dados Gráfico Waterfall
  const tBruto = historicoVendas.reduce((a, b) => a + b.bruto, 0);
  const tTaxas = historicoVendas.reduce((a, b) => a + b.taxa, 0);
  const tAfil = historicoVendas.reduce((a, b) => a + b.afiliado, 0);
  const tImp = historicoVendas.reduce((a, b) => a + b.imposto, 0);
  const tLucro = historicoVendas.reduce((a, b) => a + b.lucro, 0);

  const dadosGrafico = [
    { nome: 'Venda Bruta', valor: tBruto, cor: '#3b82f6' },
    { nome: 'Plataforma', valor: -tTaxas, cor: '#f59e0b' },
    { nome: 'Afiliados', valor: -tAfil, cor: '#f97316' },
    { nome: 'Impostos', valor: -tImp, cor: '#ef4444' },
    { nome: 'Lucro Líquido', valor: tLucro, cor: '#10b981' }
  ];

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.4s', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden' }}>
      
      <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', padding: '24px', borderRadius: '20px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', boxSizing: 'border-box' }}>
        <span style={{ fontSize: '38px' }}>🛒</span>
        <div style={{ minWidth: 0, flex: '1 1 250px' }}>
          <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900', wordBreak: 'break-word' }}>Contabilidade de Infoprodutos & Plataformas</h2>
          <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '13.5px', wordBreak: 'break-word' }}>Auditoria de Split de Pagamentos, Afiliados e Tributação.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', boxSizing: 'border-box' }}>
        
        {/* PARÂMETROS E COMANDOS */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: '16px', boxSizing: 'border-box', minWidth: 0 }}>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '15px', wordBreak: 'break-word' }}>⚙️ Configurar Produto e Vender</h3>
          
          <form onSubmit={simularVenda} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 130px), 1fr))', gap: '10px', boxSizing: 'border-box' }}>
            <div style={{ gridColumn: '1 / -1', minWidth: 0 }}>
              <label style={lblSty}>Preço do Curso/Produto (R$)</label>
              <input type="number" step="0.01" style={inpSty} value={precoProduto} onChange={e => setPrecoProduto(e.target.value)} required />
            </div>
            <div style={{ minWidth: 0 }}>
              <label style={lblSty}>Taxa Plataforma (%)</label>
              <input type="number" style={inpSty} value={percPlataforma} onChange={e => setPercPlataforma(e.target.value)} required />
            </div>
            <div style={{ minWidth: 0 }}>
              <label style={lblSty}>Comissão Afiliado (%)</label>
              <input type="number" style={inpSty} value={percAfiliado} onChange={e => setPercAfiliado(e.target.value)} required />
            </div>
            <div style={{ gridColumn: '1 / -1', minWidth: 0 }}>
              <label style={{...lblSty, color: '#ef4444'}}>Carga Tributária / Simples Nacional (%)</label>
              <input type="number" style={{...inpSty, border: '1px solid #fca5a5', backgroundColor: '#fef2f2'}} value={percImposto} onChange={e => setPercImposto(e.target.value)} required />
            </div>
            <button type="submit" style={{ ...btnStyle('#2563eb'), gridColumn: '1 / -1', marginTop: '6px', width: '100%', boxSizing: 'border-box' }}>💰 Processar Nova Venda</button>
          </form>

          <div style={{ display: 'flex', gap: '12px', flexDirection: 'column', borderTop: '1px solid #e2e8f0', paddingTop: '16px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ecfdf5', padding: '14px', borderRadius: '12px', border: '1px solid #a7f3d0', flexWrap: 'wrap', gap: '8px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontSize: '11px', color: '#065f46', fontWeight: 'bold', textTransform: 'uppercase' }}>Saldo na Plataforma</span>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#047857', wordBreak: 'break-word', marginTop: '2px' }}>R$ {saldoPlataforma.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
              </div>
              <button onClick={sacarParaBanco} disabled={saldoPlataforma <= 0} style={btnStyle(saldoPlataforma > 0 ? '#10b981' : '#cbd5e1')}>🏦 Sacar</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fef2f2', padding: '14px', borderRadius: '12px', border: '1px solid #fecaca', flexWrap: 'wrap', gap: '8px', boxSizing: 'border-box' }}>
              <div style={{ minWidth: 0 }}>
                <span style={{ fontSize: '11px', color: '#991b1b', fontWeight: 'bold', textTransform: 'uppercase' }}>Impostos a Pagar (Passivo)</span>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#b91c1c', wordBreak: 'break-word', marginTop: '2px' }}>R$ {impostoAcumulado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
              </div>
              <button onClick={pagarImposto} disabled={impostoAcumulado <= 0} style={btnStyle(impostoAcumulado > 0 ? '#ef4444' : '#cbd5e1')}>🧾 Pagar Guia</button>
            </div>
          </div>
        </div>

        {/* GRÁFICO WATERFALL */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', boxSizing: 'border-box', minWidth: 0 }}>
          <h3 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '15px', wordBreak: 'break-word' }}>📊 Waterfall de Receita e Deduções</h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px', wordBreak: 'break-word' }}>Entenda como a Receita Bruta é corroída até chegar ao Lucro da empresa.</p>
          <div style={{ width: '100%', height: '320px', boxSizing: 'border-box', minWidth: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGrafico} margin={{ top: 20, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="nome" tick={{ fontSize: 10, fill: '#475569', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', fontWeight: 'bold', fontSize: '12px' }} formatter={(val) => `R$ ${val.toLocaleString('pt-BR')}`} />
                <ReferenceLine y={0} stroke="#94a3b8" />
                <Bar dataKey="valor" radius={[4, 4, 4, 4]} barSize={35}>
                  <LabelList dataKey="valor" position="top" formatter={(v) => v !== 0 ? `R$ ${Math.abs(v).toLocaleString('pt-BR')}` : ''} style={{ fontSize: '10px', fill: '#0f172a', fontWeight: 'bold' }} />
                  {dadosGrafico.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.cor} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

const lblSty = { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px', wordBreak: 'break-word' };
const inpSty = { width: '100%', maxWidth: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '13.5px', outline: 'none', backgroundColor: 'white' };
const btnStyle = (bg) => ({ backgroundColor: bg, color: 'white', padding: '10px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px', boxSizing: 'border-box' });