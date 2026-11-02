import React, { useState, useEffect } from 'react';

export default function LaboratorioCadeiaProdutiva() {
  // Configurações da Cadeia Produtiva
  const [categoria, setCategoria] = useState('padrao'); 
  const [custoMateriaPrima, setCustoMateriaPrima] = useState(100);
  const [margemIndustria, setMargemIndustria] = useState(150);
  const [margemVarejo, setMargemVarejo] = useState(200);

  // Animação do Split Payment
  const [pagamentoRealizado, setPagamentoRealizado] = useState(false);

  const formatMoeda = (valor) => Number(valor || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Lógica de Alíquotas do Novo Sistema
  let aliqIva = 26.5; 
  let aliqSeletivo = 0;
  if (categoria === 'reduzida') aliqIva = 26.5 * 0.4; 
  if (categoria === 'isenta') aliqIva = 0; 
  if (categoria === 'pecado') { aliqIva = 26.5; aliqSeletivo = 15; } 

  // ==========================================
  // CÁLCULO SISTEMA ANTIGO (Efeito Cascata)
  // ==========================================
  const aliqAntigaPISCOFINSICMS = 27.25; 

  const baseIndAntiga = Number(custoMateriaPrima) + Number(margemIndustria);
  const impostoIndAntiga = baseIndAntiga * (aliqAntigaPISCOFINSICMS / 100);
  const precoIndAntiga = baseIndAntiga + impostoIndAntiga; 

  const baseVarAntiga = precoIndAntiga + Number(margemVarejo);
  const impostoVarAntiga = baseVarAntiga * (aliqAntigaPISCOFINSICMS / 100);
  const precoConsumidorAntigo = baseVarAntiga + impostoVarAntiga;

  // ==========================================
  // CÁLCULO NOVO SISTEMA (IVA Não-Cumulativo)
  // ==========================================
  const seletivoInd = (Number(custoMateriaPrima) + Number(margemIndustria)) * (aliqSeletivo / 100);
  const baseIndNova = Number(custoMateriaPrima) + Number(margemIndustria) + seletivoInd;
  const impostoIndNova = baseIndNova * (aliqIva / 100);
  const precoIndNova = baseIndNova + impostoIndNova; 

  const custoVarNovo = baseIndNova; 
  const baseVarNova = custoVarNovo + Number(margemVarejo);
  const debitoVarNovo = baseVarNova * (aliqIva / 100);
  const impostoVarPago = debitoVarNovo - impostoIndNova; 
  const precoConsumidorNovo = baseVarNova + debitoVarNovo;

  useEffect(() => {
    setPagamentoRealizado(false);
  }, [categoria, custoMateriaPrima, margemIndustria, margemVarejo]);

  const cardStyle = { backgroundColor: 'white', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', position: 'relative', flex: '1 1 min(100%, 220px)', boxSizing: 'border-box', minWidth: 0 };
  const setaStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', color: '#94a3b8', padding: '10px' };

  return (
    <div translate="no" className="notranslate" style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '24px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', fontFamily: 'system-ui, sans-serif', color: '#0f172a', boxSizing: 'border-box', width: '100%', maxWidth: '100%', overflowX: 'hidden', animation: 'fadeIn 0.5s' }}>
      
      {/* HEADER E CONTROLES */}
      <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '20px 24px', borderRadius: '16px', marginBottom: '20px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)', boxSizing: 'border-box' }}>
        <h2 style={{ margin: '0 0 12px 0', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '10px', wordBreak: 'break-word' }}>
          <span>🔬</span> Laboratório Macro-Econômico: A Jornada do Produto
        </h2>
        <p style={{ margin: '0 0 16px 0', color: '#94a3b8', fontSize: '13px', lineHeight: '1.5', wordBreak: 'break-word' }}>
          Ajuste as margens e observe em tempo real como o **Efeito Cascata** inflaciona o preço comparado ao **IVA Não-Cumulativo**, onde o imposto anterior vira crédito.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '14px', backgroundColor: '#1e293b', padding: '16px', borderRadius: '12px', boxSizing: 'border-box' }}>
          <div style={{ minWidth: 0 }}>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '6px', wordBreak: 'break-word' }}>Categoria do Produto:</label>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={{ width: '100%', maxWidth: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white', fontSize: '13px', boxSizing: 'border-box' }}>
              <option value="padrao">Padrão (Roupas, Eletrônicos - 26.5%)</option>
              <option value="reduzida">Saúde / Educação (Redução 60%)</option>
              <option value="isenta">Cesta Básica Nacional (Isento)</option>
              <option value="pecado">Bebidas / Tabaco (Seletivo 15%)</option>
            </select>
          </div>
          <div style={{ minWidth: 0 }}>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '6px', wordBreak: 'break-word' }}>Matéria-Prima: {formatMoeda(custoMateriaPrima)}</label>
            <input type="range" min="10" max="500" value={custoMateriaPrima} onChange={(e) => setCustoMateriaPrima(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', cursor: 'pointer' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '6px', wordBreak: 'break-word' }}>Margem Indústria: {formatMoeda(margemIndustria)}</label>
            <input type="range" min="10" max="500" value={margemIndustria} onChange={(e) => setMargemIndustria(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', cursor: 'pointer' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '6px', wordBreak: 'break-word' }}>Margem Varejo: {formatMoeda(margemVarejo)}</label>
            <input type="range" min="10" max="500" value={margemVarejo} onChange={(e) => setMargemVarejo(e.target.value)} style={{ width: '100%', boxSizing: 'border-box', cursor: 'pointer' }} />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PIPELINE 1: SISTEMA ANTIGO (BOLA DE NEVE)                   */}
      {/* ========================================================= */}
      <h3 style={{ fontSize: '15px', color: '#991b1b', borderBottom: '2px solid #fecaca', paddingBottom: '6px', marginBottom: '14px', wordBreak: 'break-word' }}>
        🔴 Sistema Antigo (Cumulativo / Efeito Cascata)
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px', boxSizing: 'border-box' }}>
        
        {/* Indústria Antiga */}
        <div style={{...cardStyle, borderTop: '4px solid #ef4444'}}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏭</div>
          <strong style={{ fontSize: '13.5px', display: 'block', wordBreak: 'break-word' }}>Indústria Produz</strong>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', lineHeight: '1.5', boxSizing: 'border-word', wordBreak: 'break-word' }}>
            <div>Custo + Margem: {formatMoeda(baseIndAntiga)}</div>
            <div style={{ color: '#ef4444' }}>(+) Tributos (27.25%): {formatMoeda(impostoIndAntiga)}</div>
            <div style={{ borderTop: '1px dashed #cbd5e1', marginTop: '4px', paddingTop: '4px', fontWeight: 'bold', color: '#0f172a' }}>
              Vende por: {formatMoeda(precoIndAntiga)}
            </div>
          </div>
        </div>

        <div style={setaStyle}>▶</div>

        {/* Varejo Antigo */}
        <div style={{...cardStyle, borderTop: '4px solid #ef4444'}}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏪</div>
          <strong style={{ fontSize: '13.5px', display: 'block', wordBreak: 'break-word' }}>Varejo Revende</strong>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', lineHeight: '1.5', boxSizing: 'border-word', wordBreak: 'break-word' }}>
            <div style={{ color: '#991b1b', fontWeight: 'bold' }}>Compra c/ imposto embutido!</div>
            <div>Base p/ Margem: {formatMoeda(precoIndAntiga)}</div>
            <div>(+) Margem: {formatMoeda(margemVarejo)}</div>
            <div style={{ color: '#ef4444' }}>(+) Tributos s/ TUDO: {formatMoeda(impostoVarAntiga)}</div>
          </div>
        </div>

        <div style={setaStyle}>▶</div>

        {/* Consumidor Antigo */}
        <div style={{...cardStyle, backgroundColor: '#fef2f2', border: '2px solid #fecaca'}}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🛒</div>
          <strong style={{ fontSize: '13.5px', color: '#991b1b', display: 'block', wordBreak: 'break-word' }}>Consumidor Paga</strong>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#dc2626', marginTop: '6px', wordBreak: 'break-word' }}>
            {formatMoeda(precoConsumidorAntigo)}
          </div>
          <div style={{ fontSize: '11px', color: '#991b1b', marginTop: '4px', wordBreak: 'break-word' }}>Imposto pago sobre imposto anterior.</div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PIPELINE 2: NOVO SISTEMA (IVA DUAL NÃO CUMULATIVO)         */}
      {/* ========================================================= */}
      <h3 style={{ fontSize: '15px', color: '#16a34a', borderBottom: '2px solid #bbf7d0', paddingBottom: '6px', marginBottom: '14px', wordBreak: 'break-word' }}>
        🟢 Novo Sistema (Reforma Tributária - IVA Dual)
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px', boxSizing: 'border-box' }}>
        
        {/* Indústria Nova */}
        <div style={{...cardStyle, borderTop: '4px solid #22c55e'}}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏭</div>
          <strong style={{ fontSize: '13.5px', display: 'block', wordBreak: 'break-word' }}>Indústria Produz</strong>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', lineHeight: '1.5', boxSizing: 'border-word', wordBreak: 'break-word' }}>
            <div>Custo + Margem: {formatMoeda(Number(custoMateriaPrima) + Number(margemIndustria))}</div>
            {aliqSeletivo > 0 && <div style={{ color: '#d97706' }}>(+) Seletivo ({aliqSeletivo}%): {formatMoeda(seletivoInd)}</div>}
            <div style={{ color: '#3b82f6', fontWeight: 'bold' }}>(+) IVA ({aliqIva}%): {formatMoeda(impostoIndNova)}</div>
            <div style={{ borderTop: '1px dashed #cbd5e1', marginTop: '4px', paddingTop: '4px', fontWeight: 'bold', color: '#0f172a' }}>
              Preço NF: {formatMoeda(precoIndNova)}
            </div>
          </div>
        </div>

        <div style={setaStyle}>▶</div>

        {/* Varejo Novo */}
        <div style={{...cardStyle, borderTop: '4px solid #22c55e'}}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🏪</div>
          <strong style={{ fontSize: '13.5px', display: 'block', wordBreak: 'break-word' }}>Varejo Revende (A Mágica)</strong>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px', lineHeight: '1.5', boxSizing: 'border-word', wordBreak: 'break-word' }}>
            <div style={{ color: '#16a34a', fontWeight: 'bold' }}>(-) Crédito IVA: {formatMoeda(impostoIndNova)}</div>
            <div>Base Real (Sem IVA): {formatMoeda(baseIndNova)}</div>
            <div>(+) Margem Nova: {formatMoeda(margemVarejo)}</div>
            <div style={{ color: '#3b82f6' }}>(+) IVA a Recolher: {formatMoeda(impostoVarPago)}</div>
          </div>
        </div>

        <div style={setaStyle}>▶</div>

        {/* Consumidor Novo */}
        <div style={{...cardStyle, backgroundColor: '#f0fdf4', border: '2px solid #86efac'}}>
          <div style={{ fontSize: '22px', marginBottom: '6px' }}>🛒</div>
          <strong style={{ fontSize: '13.5px', color: '#166534', display: 'block', wordBreak: 'break-word' }}>Consumidor Paga</strong>
          <div style={{ fontSize: '22px', fontWeight: '900', color: '#16a34a', marginTop: '6px', wordBreak: 'break-word' }}>
            {formatMoeda(precoConsumidorNovo)}
          </div>
          <div style={{ fontSize: '11px', color: '#166534', marginTop: '4px', fontWeight: 'bold', wordBreak: 'break-word' }}>
            Economia de {formatMoeda(precoConsumidorAntigo - precoConsumidorNovo)}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SIMULADOR DE CHECKOUT: SPLIT PAYMENT INTERATIVO             */}
      {/* ========================================================= */}
      <div style={{ backgroundColor: '#0f172a', borderRadius: '16px', padding: '20px', border: '1px solid #334155', boxSizing: 'border-box' }}>
        <h3 style={{ color: 'white', margin: '0 0 10px 0', fontSize: '17px', display: 'flex', alignItems: 'center', gap: '8px', wordBreak: 'break-word' }}>
          💳 Simulador de Checkout: O "Split Payment" na prática
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 20px 0', lineHeight: '1.5', wordBreak: 'break-word' }}>
          No momento em que o consumidor passa o cartão ou faz o PIX, a tecnologia bancária divide o dinheiro antes mesmo de chegar à empresa. Clique para simular a compra de <strong>{formatMoeda(precoConsumidorNovo)}</strong>.
        </p>

        {!pagamentoRealizado ? (
          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={() => setPagamentoRealizado(true)}
              style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '14px 28px', borderRadius: '12px', fontSize: '16px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 15px rgba(59,130,246,0.4)', transition: 'transform 0.1s', boxSizing: 'border-box', width: '100%', maxWidth: '340px' }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              🛒 Simular Compra c/ Split Payment
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: '16px', boxSizing: 'border-box' }}>
            
            {/* Cofre da Empresa */}
            <div style={{ backgroundColor: '#1e293b', padding: '18px', borderRadius: '12px', border: '1px solid #475569', textAlign: 'center', boxSizing: 'border-box', minWidth: 0 }}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>🏢</div>
              <div style={{ color: '#cbd5e1', fontSize: '11.5px', fontWeight: 'bold', wordBreak: 'break-word' }}>Conta Corrente da Empresa</div>
              <div style={{ color: '#4ade80', fontSize: '24px', fontWeight: '900', margin: '8px 0', wordBreak: 'break-word' }}>
                {formatMoeda(baseVarNova)}
              </div>
              <div style={{ color: '#64748b', fontSize: '11px', wordBreak: 'break-word' }}>
                A empresa recebe apenas a base limpa, sem reter impostos públicos.
              </div>
            </div>

            {/* Cofre do Governo */}
            <div style={{ backgroundColor: '#1e293b', padding: '18px', borderRadius: '12px', border: '1px solid #475569', textAlign: 'center', boxSizing: 'border-box', minWidth: 0 }}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>🏛️</div>
              <div style={{ color: '#cbd5e1', fontSize: '11.5px', fontWeight: 'bold', wordBreak: 'break-word' }}>Cofres Públicos (Receita/Estado)</div>
              <div style={{ color: '#38bdf8', fontSize: '24px', fontWeight: '900', margin: '8px 0', wordBreak: 'break-word' }}>
                {formatMoeda(debitoVarNovo)}
              </div>
              <div style={{ color: '#64748b', fontSize: '11px', wordBreak: 'break-word' }}>
                O IVA é liquidado na hora pelo banco. Sonegação passa a ser impossível.
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}