// app.js
// Versão completa e cuidadosamente ajustada para enviar JSON ao endpoint /api/gerar-pdf,
// preservar toda a lógica original (barra de progresso, debounce, rascunho, cancelamento),
// e exibir diagnóstico detalhado quando ocorrerem falhas.

(function () {
  'use strict';

  const PDF_ENDPOINT = 'https://teste-insta.vercel.app/api/gerar-pdf';

  const HTML_SIZE_LIMIT_BYTES = 1024 * 1024; // 1 MB
  const SUBMIT_DEBOUNCE_MS = 3000;
  const STORAGE_KEY = 'diag_survey_v1';

  let lastSubmitAt = 0;
  let currentXhr = null;

  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }

  // UI helpers
  // utilitário curto para query selector (mantém seu padrão qs se usar)
function qs(selector, root = document) {
  return root.querySelector(selector);
}

/* controla visibilidade dos wrappers (NUNCA usa display:none) */
function setProgressVisible(visible) {
  const downloadWrap = qs('#download-progress');
  const pdfWrap = qs('#pdf-progress-container');

  if (downloadWrap) downloadWrap.classList.toggle('visible', !!visible);
  if (pdfWrap) pdfWrap.classList.toggle('visible', !!visible);

  if (!visible) {
    const downloadBar = qs('#download-progress-bar');
    if (downloadBar) downloadBar.style.width = '0%';
    const pdfBar = qs('#pdf-progress-bar');
    if (pdfBar) pdfBar.style.width = '0%';
    const msg = qs('#download-message');
    if (msg) msg.textContent = '';
  }
}

/* atualiza largura das barras (sincroniza ambas) */
function setProgress(percent) {
  const value = Math.min(100, Math.max(0, Number(percent) || 0)) + '%';
  const downloadBar = qs('#download-progress-bar');
  const pdfBar = qs('#pdf-progress-bar');
  if (downloadBar) downloadBar.style.width = value;
  if (pdfBar) pdfBar.style.width = value;
}

/* atualiza mensagem de status */
function setMessage(text) {
  const msg = qs('#download-message');
  if (!msg) return;
  msg.textContent = text || '';
}

/* define estado de loading dos botões */
function setButtonLoading(btn, loadingText) {
  if (!btn) return;
  btn.disabled = !!loadingText;
  if (loadingText) {
    if (!btn.dataset.orig) btn.dataset.orig = btn.textContent;
    btn.textContent = loadingText;
  } else {
    btn.textContent = btn.dataset.orig || btn.textContent;
    delete btn.dataset.orig;
  }
}


  // Ranges
  function enhanceAllRanges() {
    qsa('.q-row').forEach(row => {
      const input = row.querySelector('.range-control');
      const valueBox = row.querySelector('.range-value');
      const labels = row.querySelectorAll('.range-labels span');
      if (!input) return;
      function update() {
        const v = Number(input.value);
        if (valueBox) valueBox.textContent = v;
        labels.forEach((el, i) => el.classList.toggle('active', i === v));
      }
      input.addEventListener('input', update);
      update();
    });
  }

  // Collect answers
  function getUserAnswers() {
    return qsa('.q-row').map(row => {
      const id = row.id;
      const input = row.querySelector('.range-control');
      const score = input ? Number(input.value) : 0;
      return { id, score };
    });
  }

  function calculateTotals() {
  const answers = getUserAnswers ? getUserAnswers() : [];
  const total = answers.reduce((s, a) => s + (Number(a.score) || 0), 0);
  const max = answers.length * 9;
  const percent = max ? Math.round((total / max) * 100) : 0;

  // Principais elementos que já usou
  const scoreBox = qs('#score-box');      // antiga versão: mostrava total ou percent
  const tierText = qs('#tier-text');
  const summaryText = qs('#summary-text');

  // IDs do card de relatório/padrão PDF que você também usa
  const totalEl = document.getElementById('total-score');
  const maxEl = document.getElementById('max-score');
  const percentEl = document.getElementById('percent-score');
  const scoreBadge = document.getElementById('score-box'); // pode ser same as scoreBox

  // Atualiza os elementos antigos / alternativos
  if (scoreBox) {
    // deixar compatível: exibir total (como seu código antigo fazia)
    scoreBox.textContent = String(total);
    scoreBox.classList.remove('good','mid','poor');
    if (percent >= 75) scoreBox.classList.add('good');
    else if (percent >= 40) scoreBox.classList.add('mid');
    else scoreBox.classList.add('poor');
  }

  // Atualiza os elementos do relatório (total / max / percent)
  if (totalEl) totalEl.textContent = String(total);
  if (maxEl) maxEl.textContent = String(max);
  if (percentEl) percentEl.textContent = String(percent);

  // Se houver badge que deve mostrar % (algumas versões usam score-box para percent)
  if (scoreBadge && scoreBadge.id === 'score-box' && percentEl) {
    // se preferir exibir %, use:
    // scoreBadge.textContent = percent + '%';
    // Mas para compatibilidade com seu código original que mostrava total, mantemos total.
    // Ajuste aqui se quiser percent no badge.
  }

  // Atualiza resumo textual redundante se existir
  if (summaryText) summaryText.textContent = `Total de pontos: ${total} / ${max} — Percentual: ${percent}%`;
  if (tierText) {
    const tier = percent >= 75 ? 'Ótimo' : percent >= 40 ? 'Intermediário' : 'Precisa melhorar';
    tierText.textContent = tier;
  }

  // atualiza interpretação no card (sua função)
  if (typeof renderInterpretation === 'function') {
    try { renderInterpretation(percent, total, max); } catch(e){ console.error(e); }
  }

  return { total, max, percent, answers };
}


//INSERIDO AGORA
//INSERIDO AGORA
//INSERIDO AGORA

  // renderInterpretation: monta o conteúdo do bloco #interpretation com base em percent/total/max
function renderInterpretation(percent, total, max) {
  let header = '';
  let actions = [];
  let incentive = '';

  if (percent >= 90) {
    header = 'Excelente — seu negócio está bem estruturado.';
    actions = [
      'Você domina produto, público, propósito, processos e comunicação; isso facilita convencer clientes e repetir vendas.',
      'Documente em 1 página: benefícios-chave (Grupo A), cliente ideal (B), processo básico (D) e uma oferta para fidelizar (E).'
    ];
    incentive = 'Ótimo trabalho — mantenha o hábito de registrar aprendizados e escalar o que já funciona.';
  } else if (percent >= 80) {
    header = 'Muito bom — leve ajuste e escala.';
    actions = [
      'Fundamentos sólidos: produto claro e público definido; falta sistematizar testes e retenção.',
      'Escolha 1 hipótese (ex.: qual benefício vende mais) e teste duas mensagens por 2 semanas; registre qual público responde (B, E).'
    ];
    incentive = 'Pequenas melhorias consistentes costumam gerar ganhos rápidos.';
  } else if (percent >= 60) {
    header = 'Bom — base com espaço para padronizar.';
    actions = [
      'Você conhece partes do negócio (provavelmente O QUE e COMO), mas precisa validar público e organizar processos.',
      'Faça 3 entrevistas rápidas com clientes (por que compraram, onde te acharam) e ajuste a descrição do produto com esses motivos (A, B).'
    ];
    incentive = 'Organize processos simples e comece a medir resultados semanalmente.';
  } else if (percent >= 40) {
    header = 'Regular — prioridades pouco claras.';
    actions = [
      'Existem acertos isolados, mas falta ligar benefício do produto ao cliente certo e rotinas confiáveis.',
      'Escolha 3 produtos/serviços prioritários e, para cada um, escreva 1 frase com o benefício principal e para quem é (A + B).'
    ];
    incentive = 'Faça 1–2 melhorias por semana; comece por deixar a mensagem clara e o atendimento confiável.';
  } else if (percent >= 20) {
    header = 'Começando — foco e rotina essenciais.';
    actions = [
      'Há intenção, mas falta foco: defina claramente o que você vende, para quem e como cobrar.',
      'Em uma folha, responda: 1) qual problema resolve (A), 2) quem é o cliente (B), 3) custo mínimo e preço sugerido (D + E).'
    ];
    incentive = 'Pequenas ações repetidas constroem confiança; comece por público e preço corretos.';
  } else {
    header = 'Recomeço nos fundamentos.';
    actions = [
      'É necessário voltar ao básico: entender benefício real do produto e provar para algumas pessoas antes de escalar.',
      'Valide com 5 pessoas: mostre o produto, explique o benefício (A) e pergunte se comprariam e por quanto; ajuste preço e mensagem conforme respostas (E, B).'
    ];
    incentive = 'Comece esta semana com um teste rápido: benefício claro, preço justo e feedback real.';
  }


  const actionsHtml = actions.map(a => `<li>${a}</li>`).join('');
  const html = `
    <div class="item">
      <div class="item-header"><div class="item-title">Diagnóstico</div></div>
      <div class="item-desc">${header}</div>
    </div>

    <div class="item">
      <div class="item-header"><div class="item-title">Ações recomendadas</div></div>
      <div class="item-desc"><ul>${actionsHtml}</ul></div>
    </div>

    <div class="item">
      <div class="item-header"><div class="item-title">Incentivo</div></div>
      <div class="item-desc"><em>${incentive}</em></div>
    </div>
  `;

  const el = document.getElementById('interpretation');
  if (el) el.innerHTML = html;

  // opcional: atualiza textos resumidos do card se existirem
  const tierText = document.getElementById('tier-text');
  if (tierText) {
    const tier = percent >= 75 ? 'Ótimo' : percent >= 40 ? 'Intermediário' : 'Precisa melhorar';
    tierText.textContent = tier;
  }
  const summaryText = document.getElementById('summary-text');
  if (summaryText) {
    summaryText.textContent = `Total de pontos: ${total} / ${max} — Percentual: ${percent}%`;
  }
}
//INSERIDO AGORA
//INSERIDO AGORA
//INSERIDO AGORA

  // Reset / draft
  function resetAll() {
    qsa('.range-control').forEach(r => r.value = 0);
    qsa('.range-value').forEach(v => v.textContent = '0');
    enhanceAllRanges();
    calculateTotals();
    const nameEl = qs('#user-name');
    if (nameEl) nameEl.value = '';
    saveDraft();
  }

  function saveDraft() {
    try {
      const payload = { name: qs('#user-name')?.value || '', answers: getUserAnswers() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) { /* silencioso */ }
  }

  function loadDraft() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.name) qs('#user-name').value = data.name;
      if (Array.isArray(data.answers)) {
        data.answers.forEach(a => {
          const row = qs(`#${a.id}`);
          if (!row) return;
          const input = row.querySelector('.range-control');
          if (input) input.value = Number(a.score) || 0;
        });
      }
    } catch (e) { /* silencioso */ }
  }

  // Sanitização simples
  function sanitizeHtml(html) {
    html = html || '';
    html = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
    html = html.replace(/\s(on[a-z]+)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
    html = html.replace(/(href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi, '$1=$2#$2');
    return html;
  }

  // Build HTML via PrintReport with robust checks
  function buildReportHtml() {
    try {
      if (typeof window.PrintReport === 'undefined') {
        console.error('PrintReport não está definido em window');
        setMessage('Erro: gerador de relatório não carregado. Verifique console.');
        return null;
      }
      if (typeof window.PrintReport.extrairHtmlParaEnvio !== 'function') {
        console.error('PrintReport.extrairHtmlParaEnvio não é função', window.PrintReport.extrairHtmlParaEnvio);
        setMessage('Erro: função de extração de HTML não disponível. Verifique console.');
        return null;
      }
      const html = window.PrintReport.extrairHtmlParaEnvio({ project: 'Pesquisa Diagnóstico' });
      if (!html || typeof html !== 'string') {
        console.error('PrintReport.extrairHtmlParaEnvio retornou vazio ou não-string', html);
        setMessage('Erro ao gerar HTML do relatório (resultado inválido). Verifique console.');
        return null;
      }
      return html;
    } catch (err) {
      console.error('Exceção ao gerar HTML com PrintReport.extrairHtmlParaEnvio', err);
      setMessage('Erro ao gerar o conteúdo do relatório. Veja console.');
      return null;
    }
  }

  // Copy JSON
  function copyJson() {
    const payload = { name: qs('#user-name')?.value || '', answers: getUserAnswers() };
    const text = JSON.stringify(payload, null, 2);
    navigator.clipboard?.writeText(text).then(() => {
      setMessage('Respostas copiadas para a área de transferência');
      setTimeout(() => setMessage(''), 2200);
    }).catch(() => {
      try { prompt('Copie as respostas JSON abaixo:', text); } catch (e) { /* silencioso */ }
    });
  }

  // Send PDF (envia JSON, mantém barra de progresso, diagnóstico de erro)
 function enviarPdf() {
  const now = Date.now();
  if (now - lastSubmitAt < SUBMIT_DEBOUNCE_MS) {
    setMessage('Aguarde um momento antes de enviar novamente.');
    return;
  }
  lastSubmitAt = now;

  const nameEl = qs('#user-name');
  const name = (nameEl && nameEl.value || '').trim();
  if (!name || name.length < 2) {
    setMessage('Por favor informe seu nome (mínimo 2 caracteres).');
    nameEl && nameEl.focus();
    return;
  }

  let rawHtml = buildReportHtml();
  if (!rawHtml) {
    setMessage('HTML não fornecido.');
    return;
  }

  // Remoção silenciosa de placeholder indesejado (sem console.warn)
  rawHtml = rawHtml.split('Nenhuma resposta encontrada').join('');

  const sanitized = sanitizeHtml(rawHtml);
  const sizeBytes = new Blob([sanitized]).size;
  if (sizeBytes > HTML_SIZE_LIMIT_BYTES) {
    setMessage('O relatório ficou grande demais. Reduza o conteúdo antes de enviar.');
    return;
  }

  const btn = qs('#pdf-btn');
  setButtonLoading(btn, 'Preparando...');
  setProgressVisible(true);
  setProgress(6);
  setMessage('Preparando envio...');

  if (currentXhr) {
    try { currentXhr.abort(); } catch (e) { /* silencioso */ }
    currentXhr = null;
  }

  const payload = {
    html: sanitized,
    filename: `${name}.pdf`,
    meta: { generatedBy: 'Pesquisa Diagnóstico', author: name }
  };

  const xhr = new XMLHttpRequest();
  currentXhr = xhr;

  xhr.open('POST', PDF_ENDPOINT, true);
  xhr.responseType = 'blob';
  xhr.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');

  xhr.upload && xhr.upload.addEventListener('progress', e => {
    if (!e.lengthComputable) return;
    const pct = Math.round((e.loaded / e.total) * 50);
    setProgress(pct);
    setMessage(`Enviando... ${pct}%`);
  });

  xhr.addEventListener('error', () => {
    setMessage('Falha na requisição. Tente novamente.');
    setProgressVisible(false);
    setButtonLoading(btn, null);
    currentXhr = null;
  });

  xhr.addEventListener('abort', () => {
    setMessage('Envio cancelado.');
    setProgressVisible(false);
    setButtonLoading(btn, null);
    currentXhr = null;
  });

  xhr.addEventListener('load', () => {
    if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
      setProgress(92);
      setMessage('Recebendo PDF...');

      // NÃO ler Content-Disposition; usar fallback do payload.filename
      let filename = payload.filename || `${name}.pdf`;

      // tentativa segura de extrair filename do responseURL se existir (não manda erro)
      try {
        const respUrl = xhr.responseURL || '';
        if (respUrl) {
          const last = respUrl.split('/').pop();
          if (last && last.toLowerCase().endsWith('.pdf')) filename = decodeURIComponent(last);
        }
      } catch (e) { /* ignorar */ }

      const contentType = xhr.getResponseHeader && xhr.getResponseHeader('Content-Type') || 'application/pdf';
      const blob = xhr.response instanceof Blob ? xhr.response : new Blob([xhr.response], { type: contentType });

      // forçar download sem abrir nova aba
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      a.rel = 'noopener';
      document.body.appendChild(a);

      let clickWorked = true;
      try {
        a.click();
      } catch (e) {
        clickWorked = false;
      }

      if (!clickWorked) {
        setMessage('Clique no link abaixo para baixar o PDF:');
        const msg = qs('#download-message');
        if (msg) msg.innerHTML = `<a href="${url}" download="${filename}" target="_blank" rel="noopener">Baixar PDF</a>`;
      }

      // revogar e limpar UI
      setTimeout(() => {
        try { a.remove(); } catch (e) { /* silencioso */ }
        try { URL.revokeObjectURL(url); } catch (e) { /* silencioso */ }
        const msg = qs('#download-message');
        if (msg) msg.innerHTML = '';
      }, 3000);

      setProgress(100);
      setMessage('PDF gerado com sucesso');
      setTimeout(() => { setProgressVisible(false); setMessage(''); }, 1800);

      currentXhr = null;
      setButtonLoading(btn, null);
      saveDraft();
      return;
    }

    // tratamento de erro (mantido)
    const status = xhr.status;
    setProgressVisible(false);
    setButtonLoading(btn, null);

    function handleErrorText(text) {
      const msg = `Erro do servidor: ${status} — ${text || ''}`;
      console.error(msg);
      setMessage(msg);
      const dm = qs('#download-message');
      if (dm) dm.textContent = msg;
    }

    try {
      const ct = (xhr.getResponseHeader && xhr.getResponseHeader('Content-Type') || '').toLowerCase();
      if (xhr.response && xhr.response instanceof Blob) {
        const reader = new FileReader();
        reader.onload = function () {
          const txt = String(reader.result || '').trim();
          try {
            const json = JSON.parse(txt);
            handleErrorText(JSON.stringify(json, null, 2));
          } catch (e) {
            handleErrorText(txt);
          }
        };
        reader.onerror = function () {
          handleErrorText(`Resposta inválida; status ${status}`);
        };
        reader.readAsText(xhr.response);
      } else if (xhr.responseText) {
        try {
          const json = JSON.parse(xhr.responseText);
          handleErrorText(JSON.stringify(json, null, 2));
        } catch (e) {
          handleErrorText(xhr.responseText);
        }
      } else {
        handleErrorText(`Status ${status} sem corpo de resposta.`);
      }
    } catch (err) {
      console.error('Erro lendo corpo da resposta', err);
      setMessage(`Erro do servidor: ${status}. Ver console para detalhes.`);
    }

    currentXhr = null;
  });

  try {
    xhr.send(JSON.stringify(payload));
    setMessage('Enviando...');
  } catch (err) {
    setMessage('Erro ao enviar pedido. Ver console.');
    console.error(err);
    setButtonLoading(btn, null);
    setProgressVisible(false);
  }
}


  // Init
  document.addEventListener('DOMContentLoaded', () => {
    enhanceAllRanges();
    calculateTotals();

    qsa('.range-control').forEach(r => r.addEventListener('input', () => {
      calculateTotals();
      clearTimeout(r._saveTimer);
      r._saveTimer = setTimeout(saveDraft, 700);
    }));

    const nameEl = qs('#user-name');
    if (nameEl) {
      nameEl.addEventListener('input', () => {
        clearTimeout(nameEl._saveTimer);
        nameEl._saveTimer = setTimeout(saveDraft, 700);
      });
    }

    const resetBtn = qs('#reset-btn');
    const pdfBtn = qs('#pdf-btn');
    const copyBtn = qs('#copy-json');
    resetBtn && resetBtn.addEventListener('click', (e) => { e.preventDefault(); if (confirm && !confirm('Tem certeza que deseja resetar todas as respostas?')) return; resetAll(); });
    pdfBtn && pdfBtn.addEventListener('click', (e) => { e.preventDefault(); enviarPdf(); });
    copyBtn && copyBtn.addEventListener('click', (e) => { e.preventDefault(); copyJson(); });

    loadDraft();

    nameEl && nameEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); enviarPdf(); }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && currentXhr) {
        try { currentXhr.abort(); } catch (err) { /* silencioso */ }
      }
    });

    window.addEventListener('beforeunload', saveDraft);
  });

  window.App = {
    getUserAnswers,
    calculateTotals,
    resetAll,
    enviarPdf,
    saveDraft,
    loadDraft
  };

})();

