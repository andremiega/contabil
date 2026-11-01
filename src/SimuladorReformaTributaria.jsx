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
  let aliqIva = 26.5; // Padrão
  let aliqSeletivo = 0;
  if (categoria === 'reduzida') aliqIva = 26.5 * 0.4; // 60% desconto (Saúde/Edu)
  if (categoria === 'isenta') aliqIva = 0; // Cesta Básica
  if (categoria === 'pecado') { aliqIva = 26.5; aliqSeletivo = 15; } // Tabaco/Bebidas

  // ==========================================
  // CÁLCULO SISTEMA ANTIGO (Efeito Cascata)
  // Simplificado para ilustrar Imposto sobre Imposto
  // ==========================================
  const aliqAntigaPISCOFINSICMS = 27.25; 

  // Etapa 1: Indústria Antiga
  const baseIndAntiga = custoMateriaPrima + margemIndustria;
  const impostoIndAntiga = baseIndAntiga * (aliqAntigaPISCOFINSICMS / 100);
  const precoIndAntiga = baseIndAntiga + impostoIndAntiga; // Vende com imposto embutido

  // Etapa 2: Varejo Antigo (Compra com imposto e joga margem em cima de tudo)
  const baseVarAntiga = precoIndAntiga + margemVarejo;
  const impostoVarAntiga = baseVarAntiga * (aliqAntigaPISCOFINSICMS / 100);
  const precoConsumidorAntigo = baseVarAntiga + impostoVarAntiga;

  // ==========================================
  // CÁLCULO NOVO SISTEMA (IVA Não-Cumulativo)
  // Imposto apenas sobre o Valor Agregado (Margem)
  // ==========================================
  
  // Etapa 1: Indústria Nova
  const seletivoInd = (custoMateriaPrima + margemIndustria) * (aliqSeletivo / 100);
  const baseIndNova = custoMateriaPrima + margemIndustria + seletivoInd;
  const impostoIndNova = baseIndNova * (aliqIva / 100);
  const precoIndNova = baseIndNova + impostoIndNova; 

  // Etapa 2: Varejo Novo (Abate o imposto da Indústria)
  const custoVarNovo = baseIndNova; // Varejo só assume o custo base, o imposto vira crédito
  const baseVarNova = custoVarNovo + margemVarejo;
  const debitoVarNovo = baseVarNova * (aliqIva / 100);
  const impostoVarPago = debitoVarNovo - impostoIndNova; // A Mágica do IVA (Paga só sobre a margem)
  const precoConsumidorNovo = baseVarNova + debitoVarNovo;

  // Reseta a animação ao mudar valores
  useEffect(() => {
    setPagamentoRealizado(false);
  }, [categoria, custoMateriaPrima, margemIndustria, margemVarejo]);

  // Estilos Base
  const cardStyle = { backgroundColor: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', position: 'relative', flex: 1, minWidth: '220px' };
  const setaStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#94a3b8', padding: '10px' };

  return (
    <div style={{ backgroundColor: '#f8fafc', padding: '24px', borderRadius: '16px', fontFamily: 'system-ui, sans-serif', color: '#0f172a' }}>
      
      {/* HEADER E CONTROLES */}
      <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '24px', borderRadius: '12px', marginBottom: '24px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.2)' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '22px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>🔬</span> Laboratório Macro-Econômico: A Jornada do Produto
        </h2>
        <p style={{ margin: '0 0 20px 0', color: '#94a3b8', fontSize: '14px' }}>
          Ajuste as margens de lucro e observe em tempo real como o **Efeito Cascata** (Sistema Antigo) inflaciona o preço em comparação com o **IVA Não-Cumulativo** (Novo Sistema), onde o imposto da etapa anterior vira crédito.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', backgroundColor: '#1e293b', padding: '16px', borderRadius: '10px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '6px' }}>Categoria do Produto:</label>
            <select value={categoria} onChange={(e) => setCategoria(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #475569', backgroundColor: '#0f172a', color: 'white' }}>
              <option value="padrao">Padrão (Roupas, Eletrônicos - IVA 26.5%)</option>
              <option value="reduzida">Saúde / Educação / Agro (Redução de 60%)</option>
              <option value="isenta">Cesta Básica Nacional (Alíquota Zero)</option>
              <option value="pecado">Bebidas / Tabaco (IVA 26.5% + Seletivo 15%)</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '6px' }}>Custo Matéria-Prima: {formatMoeda(custoMateriaPrima)}</label>
            <input type="range" min="10" max="500" value={custoMateriaPrima} onChange={(e) => setCustoMateriaPrima(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '6px' }}>Margem da Indústria: {formatMoeda(margemIndustria)}</label>
            <input type="range" min="10" max="500" value={margemIndustria} onChange={(e) => setMargemIndustria(e.target.value)} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#cbd5e1', marginBottom: '6px' }}>Margem do Varejo: {formatMoeda(margemVarejo)}</label>
            <input type="range" min="10" max="500" value={margemVarejo} onChange={(e) => setMargemVarejo(e.target.value)} style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* PIPELINE 1: SISTEMA ANTIGO (BOLA DE NEVE)                 */}
      {/* ========================================================= */}
      <h3 style={{ fontSize: '16px', color: '#991b1b', borderBottom: '2px solid #fecaca', paddingBottom: '8px', marginBottom: '16px' }}>
        🔴 Sistema Antigo (Cumulativo / Efeito Cascata)
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '32px' }}>
        
        {/* Indústria Antiga */}
        <div style={{...cardStyle, borderTop: '4px solid #ef4444'}}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏭</div>
          <strong style={{ fontSize: '14px', display: 'block' }}>Indústria Produz</strong>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', lineHeight: '1.6' }}>
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
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏪</div>
          <strong style={{ fontSize: '14px', display: 'block' }}>Varejo Revende</strong>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', lineHeight: '1.6' }}>
            <div style={{ color: '#991b1b', fontWeight: 'bold' }}>Compra com imposto embutido!</div>
            <div>Base p/ Margem: {formatMoeda(precoIndAntiga)}</div>
            <div>(+) Margem: {formatMoeda(margemVarejo)}</div>
            <div style={{ color: '#ef4444' }}>(+) Tributos sobre TUDO: {formatMoeda(impostoVarAntiga)}</div>
          </div>
        </div>

        <div style={setaStyle}>▶</div>

        {/* Consumidor Antigo */}
        <div style={{...cardStyle, backgroundColor: '#fef2f2', border: '2px solid #fecaca'}}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🛒</div>
          <strong style={{ fontSize: '14px', color: '#991b1b', display: 'block' }}>Consumidor Paga</strong>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#dc2626', marginTop: '8px' }}>
            {formatMoeda(precoConsumidorAntigo)}
          </div>
          <div style={{ fontSize: '11px', color: '#991b1b', marginTop: '4px' }}>Imposto pago sobre imposto anterior.</div>
        </div>
      </div>


      {/* ========================================================= */}
      {/* PIPELINE 2: NOVO SISTEMA (IVA DUAL NÃO CUMULATIVO)        */}
      {/* ========================================================= */}
      <h3 style={{ fontSize: '16px', color: '#16a34a', borderBottom: '2px solid #bbf7d0', paddingBottom: '8px', marginBottom: '16px' }}>
        🟢 Novo Sistema (Reforma Tributária - IVA Dual)
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: '32px' }}>
        
        {/* Indústria Nova */}
        <div style={{...cardStyle, borderTop: '4px solid #22c55e'}}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏭</div>
          <strong style={{ fontSize: '14px', display: 'block' }}>Indústria Produz</strong>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', lineHeight: '1.6' }}>
            <div>Custo + Margem: {formatMoeda(custoMateriaPrima + margemIndustria)}</div>
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
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🏪</div>
          <strong style={{ fontSize: '14px', display: 'block' }}>Varejo Revende (A Mágica)</strong>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px', lineHeight: '1.6' }}>
            <div style={{ color: '#16a34a', fontWeight: 'bold' }}>(-) Crédito IVA Recebido: {formatMoeda(impostoIndNova)}</div>
            <div>Base Real (Sem IVA): {formatMoeda(baseIndNova)}</div>
            <div>(+) Margem Nova: {formatMoeda(margemVarejo)}</div>
            <div style={{ color: '#3b82f6' }}>(+) IVA a Recolher: {formatMoeda(impostoVarPago)}</div>
            <div style={{ fontSize: '10px', marginTop: '2px' }}>(IVA pago APENAS sobre a margem)</div>
          </div>
        </div>

        <div style={setaStyle}>▶</div>

        {/* Consumidor Novo */}
        <div style={{...cardStyle, backgroundColor: '#f0fdf4', border: '2px solid #86efac'}}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🛒</div>
          <strong style={{ fontSize: '14px', color: '#166534', display: 'block' }}>Consumidor Paga</strong>
          <div style={{ fontSize: '24px', fontWeight: '900', color: '#16a34a', marginTop: '8px' }}>
            {formatMoeda(precoConsumidorNovo)}
          </div>
          <div style={{ fontSize: '11px', color: '#166534', marginTop: '4px', fontWeight: 'bold' }}>
            Economia de {formatMoeda(precoConsumidorAntigo - precoConsumidorNovo)}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SIMULADOR DE CHECKOUT: SPLIT PAYMENT INTERATIVO           */}
      {/* ========================================================= */}
      <div style={{ backgroundColor: '#0f172a', borderRadius: '16px', padding: '24px', border: '1px solid #334155' }}>
        <h3 style={{ color: 'white', margin: '0 0 16px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          💳 Simulador de Checkout: O "Split Payment" na prática
        </h3>
        <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 24px 0' }}>
          No momento em que o consumidor passa o cartão ou faz o PIX, a tecnologia bancária divide o dinheiro antes mesmo de chegar à empresa. Clique no botão abaixo para simular a compra final de <strong>{formatMoeda(precoConsumidorNovo)}</strong>.
        </p>

        {!pagamentoRealizado ? (
          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={() => setPagamentoRealizado(true)}
              style={{ backgroundColor: '#3b82f6', color: 'white', border: 'none', padding: '16px 32px', borderRadius: '12px', fontSize: '18px', fontWeight: '900', cursor: 'pointer', boxShadow: '0 4px 15px rgba(59,130,246,0.4)', transition: 'transform 0.1s' }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              🛒 Simular Compra c/ Split Payment
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', animation: 'fadeIn 0.5s ease-out' }}>
            
            {/* Animação do Dinheiro Voando (Visual Only) */}
            <div style={{ flex: '1 1 100%', textAlign: 'center', fontSize: '32px', margin: '10px 0', animation: 'bounce 1s' }}>
              💸
            </div>

            {/* Cofre da Empresa */}
            <div style={{ flex: 1, backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #475569', textAlign: 'center', animation: 'slideRight 0.6s ease-out' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏢</div>
              <div style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: 'bold' }}>Conta Corrente da Empresa</div>
              <div style={{ color: '#4ade80', fontSize: '28px', fontWeight: '900', margin: '10px 0' }}>
                {formatMoeda(baseVarNova)}
              </div>
              <div style={{ color: '#64748b', fontSize: '11px' }}>
                A empresa recebe apenas a sua base limpa, sem reter dinheiro do governo.
              </div>
            </div>

            {/* Cofre do Governo */}
            <div style={{ flex: 1, backgroundColor: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #475569', textAlign: 'center', animation: 'slideLeft 0.6s ease-out' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏛️</div>
              <div style={{ color: '#cbd5e1', fontSize: '12px', fontWeight: 'bold' }}>Cofres Públicos (Receita/Estado)</div>
              <div style={{ color: '#38bdf8', fontSize: '28px', fontWeight: '900', margin: '10px 0' }}>
                {formatMoeda(debitoVarNovo)}
              </div>
              <div style={{ color: '#64748b', fontSize: '11px' }}>
                O IVA é liquidado na hora pelo banco. Sonegação passa a ser matematicamente impossível.
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }
        @keyframes slideRight { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideLeft { from { opacity: 0; transform: translateX(50px); } to { opacity: 1; transform: translateX(0); } }
      `}</style>
    </div>
  );
}