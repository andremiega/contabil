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
    if (precoProduto <= 0) return mostrarToast('O valor do produto deve ser maior que zero.', 'erro');

    const valorTaxa = precoProduto * (percPlataforma / 100);
    const valorAfiliado = precoProduto * (percAfiliado / 100);
    const valorImposto = precoProduto * (percImposto / 100);
    
    // O Líquido que cai na plataforma NÃO desconta o imposto (pois o imposto é pago via DAS pelo caixa da empresa depois)
    const liquidoPlataforma = precoProduto - valorTaxa - valorAfiliado;
    // O Lucro Real da Operação desconta o imposto
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
    // 1. Venda Bruta
    registrarFatoGerador(`Venda Infoproduto (Receita Bruta)`, precoProduto, 'Infoprodutos', ['1.1.2.01'], ['3.1.1.01']);
    // 2. Taxa da Plataforma
    registrarFatoGerador(`Taxa Plataforma (${percPlataforma}%)`, valorTaxa, 'Infoprodutos', ['4.1.2.01'], ['1.1.2.01']);
    // 3. Comissão Afiliado
    registrarFatoGerador(`Comissão Afiliado (${percAfiliado}%)`, valorAfiliado, 'Infoprodutos', ['4.1.1.02'], ['1.1.2.01']);
    // 4. Provisão do Imposto (Simples Nacional)
    registrarFatoGerador(`Provisão de Imposto s/ Venda (${percImposto}%)`, valorImposto, 'Infoprodutos', ['4.1.1.03'], ['2.1.1.01']);
    
    mostrarToast('Venda realizada! Split e Impostos contabilizados no Diário.', 'sucesso');
  };

  const sacarParaBanco = () => {
    if (saldoPlataforma <= 0) return mostrarToast('Saldo insuficiente na plataforma.', 'erro');
    registrarFatoGerador(`Saque Plataforma para Conta Corrente`, saldoPlataforma, 'Infoprodutos', ['1.1.1.02'], ['1.1.2.01']);
    setSaldoPlataforma(0);
    mostrarToast('Saque efetuado para a Conta Corrente.', 'sucesso');
  };

  const pagarImposto = () => {
    if (impostoAcumulado <= 0) return mostrarToast('Nenhum imposto a recolher no momento.', 'aviso');
    registrarFatoGerador(`Pagamento de Guia DAS (Impostos)`, impostoAcumulado, 'Infoprodutos', ['2.1.1.01'], ['1.1.1.02']);
    setImpostoAcumulado(0);
    mostrarToast('Guia de Imposto paga! Passivo baixado.', 'sucesso');
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
    <div style={{ backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.4s' }}>
      <div style={{ backgroundColor: '#0f172a', padding: '25px', borderRadius: '12px', color: 'white', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '38px' }}>🛒</span>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '900' }}>Contabilidade de Infoprodutos & Plataformas</h2>
          <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '14px' }}>Auditoria de Split de Pagamentos, Afiliados e Tributação.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        
        {/* PARÂMETROS E COMANDOS */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>⚙️ Configurar Produto e Vender</h3>
          
          <form onSubmit={simularVenda} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={lblSty}>Preço do Curso/Produto (R$)</label>
              <input type="number" step="0.01" style={inpSty} value={precoProduto} onChange={e => setPrecoProduto(e.target.value)} required />
            </div>
            <div>
              <label style={lblSty}>Taxa Plataforma (%)</label>
              <input type="number" style={inpSty} value={percPlataforma} onChange={e => setPercPlataforma(e.target.value)} required />
            </div>
            <div>
              <label style={lblSty}>Comissão Afiliado (%)</label>
              <input type="number" style={inpSty} value={percAfiliado} onChange={e => setPercAfiliado(e.target.value)} required />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label style={{...lblSty, color: '#ef4444'}}>Carga Tributária / Simples Nacional (%)</label>
              <input type="number" style={{...inpSty, border: '1px solid #fca5a5'}} value={percImposto} onChange={e => setPercImposto(e.target.value)} required />
            </div>
            <button type="submit" style={{ ...btnStyle('#2563eb'), gridColumn: 'span 2', marginTop: '10px' }}>💰 Processar Nova Venda</button>
          </form>

          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#ecfdf5', padding: '15px', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#065f46', fontWeight: 'bold', textTransform: 'uppercase' }}>Saldo na Plataforma</span>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#047857' }}>R$ {saldoPlataforma.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
              </div>
              <button onClick={sacarParaBanco} disabled={saldoPlataforma <= 0} style={btnStyle(saldoPlataforma > 0 ? '#10b981' : '#cbd5e1')}>🏦 Sacar</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fef2f2', padding: '15px', borderRadius: '8px', border: '1px solid #fecaca' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#991b1b', fontWeight: 'bold', textTransform: 'uppercase' }}>Impostos a Pagar (Passivo)</span>
                <div style={{ fontSize: '20px', fontWeight: '900', color: '#b91c1c' }}>R$ {impostoAcumulado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</div>
              </div>
              <button onClick={pagarImposto} disabled={impostoAcumulado <= 0} style={btnStyle(impostoAcumulado > 0 ? '#ef4444' : '#cbd5e1')}>🧾 Pagar Guia</button>
            </div>
          </div>
        </div>

        {/* GRÁFICO WATERFALL */}
        <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#0f172a' }}>📊 Waterfall de Receita e Deduções</h3>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px' }}>Entenda como a Receita Bruta é corroída até chegar ao Lucro da empresa.</p>
          <div style={{ width: '100%', height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGrafico} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="nome" tick={{ fontSize: 11, fill: '#475569', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '8px', fontWeight: 'bold' }} formatter={(val) => `R$ ${val.toLocaleString('pt-BR')}`} />
                <ReferenceLine y={0} stroke="#94a3b8" />
                <Bar dataKey="valor" radius={[4, 4, 4, 4]} barSize={45}>
                  <LabelList dataKey="valor" position="top" formatter={(v) => v !== 0 ? `R$ ${Math.abs(v).toLocaleString('pt-BR')}` : ''} style={{ fontSize: '11px', fill: '#0f172a', fontWeight: 'bold' }} />
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

const lblSty = { display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '6px' };
const inpSty = { width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px', outline: 'none' };
const btnStyle = (bg) => ({ backgroundColor: bg, color: 'white', padding: '10px 15px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', fontSize: '13px' });