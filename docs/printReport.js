// printReport.js
// Gerador completo e cuidadoso do HTML do relatório para envio/geração de PDF.
// Mantém todas as estruturas, blocos (Instagram, E-commerce, Perguntas extras que aumentam conversão),
// escapa conteúdo, injeta CSS inline crítico, aplica class="pdf-root" no <body> e calcula maxPoints conforme solicitado.

(function (global) {
  'use strict';

  const idMap = {
    'q-1': 'q1','q-2': 'q2','q-3': 'q3',
    'q-4': 'q4','q-5': 'q5','q-6': 'q6','q-7': 'q7','q-8': 'q8',
    'q-9': 'q9','q-10': 'q10','q-11': 'q11',
    'q-12': 'q12','q-13': 'q13','q-14': 'q14','q-15': 'q15',
    'q-16': 'q16','q-17': 'q17','q-18': 'q18','q-19': 'q19'
  };

  // Coleta respostas do DOM (mantém ids originais)
  function coletarRespostas() {
    const rows = Array.from(document.querySelectorAll('.q-row'));
    return rows.map(row => {
      const input = row.querySelector('.range-control');
      return {
        id: row.id,
        score: input ? Number(input.value) : 0
      };
    });
  }

  // Determina rótulo visual por score
  function nivelPorScore(score) {
    if (score <= 3) return { label: 'Precisa melhorar', cls: 'low' };
    if (score <= 6) return { label: 'Está no caminho', cls: 'mid' };
    return { label: 'OK', cls: 'ok' };
  }

  // Escapa texto para colocar no HTML do relatório
  function escapeHtml(text) {
    if (text == null) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Gera HTML para um item (pergunta)
  function gerarItemHtml(item, guidance) {
    const g = guidance || {};
    const level = nivelPorScore(item.score);
    return `
      <div class="item">
        <div class="item-header">
          <div class="q-title">${escapeHtml(g.title || item.id)}</div>
          <div class="meta-right">
            <div class="pill ${level.cls}">${escapeHtml(level.label)}</div>
            <div class="score-badge">${Number(item.score)}</div>
          </div>
        </div>
        <div class="item-desc">
          <div class="row">
            <div class="label">Por que é importante</div>
            <div class="value">${escapeHtml(g.why || '')}</div>
          </div>
          <div class="row">
            <div class="label">Como isso ajuda</div>
            <div class="value">${escapeHtml(g.suggestion || '')}</div>
          </div>
          ${g.sources ? `<div class="row"><div class="label">Fonte</div><div class="value">${escapeHtml(g.sources)}</div></div>` : ''}
        </div>
      </div>
    `;
  }

  // Cria HTML dos itens para um conjunto de ids (mantendo ordem)
  function gerarBlocoPorIds(respostas, ids) {
    return ids.map(id => {
      const found = respostas.find(r => r.id === id) || { id, score: 0 };
      const key = idMap[found.id] || found.id;
      const g = (window.GuidanceTexts && window.GuidanceTexts[key]) || {};
      return gerarItemHtml(found, g);
    }).join('\n');
  }

  // Renderiza bloco de seção com título + conteúdo HTML
  function renderBlock(title, innerHtml) {
    return `
      <div class="pdf-section section-cluster">
        <div class="pdf-section-title">${escapeHtml(title)}</div>
        <div class="pdf-section-divider"></div>
        ${innerHtml}
      </div>
    `;
  }

  // CSS inline crítico para garantir aparência consistente no renderer de PDF
  function inlinePdfCss() {
    return `
:root{ --accent:#0b63d6; --muted:#6b7785; --card-bg:#ffffff; --page-bg:#f7f9fb; --label-bg:#f1f6fb; --pill-ok:#e6f4ea; --pill-mid:#fff5ea; --pill-low:#fdecea; }
html,body{margin:0;padding:0;background:var(--page-bg);font-family:Inter, "Helvetica Neue", Arial, sans-serif;color:#091216;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
@page{size:A4;margin:12mm;}
.pdf-wrap{width:794px;max-width:100%;margin:16px auto;padding:16px 18px 28px;box-sizing:border-box;}
.report-header{margin-bottom:12px;}
.report-title{font-size:20px;font-weight:800;color:#091216;margin-bottom:4px;}
.report-sub{font-size:12px;color:var(--muted);margin-bottom:10px;}
.report-summary{margin-bottom:10px;font-size:13px;color:var(--muted);display:flex;gap:12px;flex-wrap:wrap;}
.items{display:block;}
.item{background:var(--card-bg);border-radius:10px;padding:10px;box-shadow:0 4px 14px rgba(10,20,30,0.04);margin-bottom:8px;page-break-inside:avoid;border:1px solid rgba(10,20,30,0.04);}
.item-header{display:flex;align-items:flex-start;gap:12px;margin-bottom:8px;}
.q-title{flex:1 1 auto;font-weight:700;font-size:15px;line-height:1.18;color:#000 !important;}
.meta-right{display:flex;align-items:center;gap:8px;}
.pill{font-size:12px;padding:6px 8px;border-radius:999px;font-weight:600;min-width:86px;text-align:center;}
.pill.low{background:var(--pill-low);color:#8a2b1b;}
.pill.mid{background:var(--pill-mid);color:#8a5a1b;}
.pill.ok{background:var(--pill-ok);color:#21693a;}
.score-badge{font-weight:800;background:#fff;border-radius:6px;padding:6px 10px;font-size:13px;border:1px solid rgba(0,0,0,0.04);}
.item-desc{font-size:13px;line-height:1.36;}
.item-desc .row{display:flex;gap:12px;align-items:flex-start;margin-bottom:8px;}
.item-desc .label{flex:0 0 140px;background:var(--label-bg);padding:6px 8px;border-radius:6px;font-weight:700;color:var(--accent);font-size:13px;}
.item-desc .value{flex:1 1 auto;color:#122;font-size:13px;}
.pdf-section-title{font-size:22px;font-weight:800;color:var(--accent);text-transform:uppercase;letter-spacing:0.5px;margin:32px 0 12px;border-left:6px solid var(--accent);padding-left:10px;}
.pdf-section-divider{border-top:2px solid rgba(0,0,0,0.08);margin:8px 0 20px;}

  /* Footer fixado e sem quebra */
        .report-footer {
          margin-top: 12px;
          border-top: 1px solid rgba(6,18,28,0.06);
          padding-top: 8px;
          color: var(--muted);
          font-size: 12px;
          text-align: right;
          page-break-inside: avoid;
          break-inside: avoid;
        }

        .footer-cluster { page-break-inside: avoid; break-inside: avoid; }

        /* Pequenos ajustes para não gerar página extra */
        .items > .pdf-section:last-child { margin-bottom: 6px; }

        @media print {
          .pdf-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .pdf-section-title {
            break-after: avoid;
            page-break-after: avoid;
          }
          .report-footer {
            page-break-before: avoid;
            break-before: avoid;
            page-break-after: avoid;
            break-after: avoid;
          }
        }

`;
  }

  // Gera o HTML completo pronto para envio ao endpoint que gera PDF
function extrairHtmlParaEnvio(opts) {
  opts = opts || {};
  const user = (document.getElementById('user-name') && document.getElementById('user-name').value.trim()) || 'Usuário';
  const project = opts.project || 'Pesquisa Diagnóstico';
  const respostas = coletarRespostas();

  // Agrupamentos críticos conforme solicitado (mapeamento razoável das 19 perguntas)
  const instagramIds = ['q-1','q-2','q-3','q-4','q-5','q-6'];
  const ecommerceIds  = ['q-12','q-13','q-14','q-15'];
  const extrasIds     = ['q-16','q-17','q-18','q-19'];

  const instagramHtml = gerarBlocoPorIds(respostas, instagramIds);
  const ecommerceHtml  = gerarBlocoPorIds(respostas, ecommerceIds);
  const extrasHtml     = gerarBlocoPorIds(respostas, extrasIds);

  const itensHtml = `
    ${renderBlock('O QUE: Produto ou Serviço', instagramHtml)}
    ${renderBlock('PRA QUEM: Persona e Público-Alvo', ecommerceHtml)}
    ${renderBlock('POR QUE: Propósito e Motivação', extrasHtml)}
  `;

  const totalPoints = respostas.reduce((acc, it) => acc + (Number(it.score) || 0), 0);
  const maxPoints = respostas.length * 4;
  const percent = maxPoints ? Math.round((totalPoints / maxPoints) * 100) : 0;

  const css = inlinePdfCss();

  let html = `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>Relatório — ${escapeHtml(project)}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>${css}</style>
</head>
<body class="pdf-root">
  <div class="pdf-wrap">
    <div class="report-header">
      <div class="report-title">Diagnóstico Visual — ${escapeHtml(project)}</div>
      <div class="report-sub">Relatório gerado por ${escapeHtml(user)}</div>
    </div>

    <div class="report-summary">
      <strong>Total de pontos:</strong> ${totalPoints} / ${maxPoints} — <strong>Percentual:</strong> ${percent}%
    </div>

    <div class="items">
      ${itensHtml}
      ${renderAnswersBlock()}
      <div class="footer-cluster">
        <div class="report-footer">Relatório Gerado Automaticamente por Mentor Jack Ullmann | Todos os direitos reservados.</div>
      </div>
    </div>
  </div>
</body>
</html>`;

  return html;
}

// Exporta API
if (!global.PrintReport) global.PrintReport = {};
global.PrintReport.coletarRespostas = coletarRespostas;
global.PrintReport.extrairHtmlParaEnvio = extrairHtmlParaEnvio;
})(window);

// Bloco adicional com respostas por pergunta
function renderAnswersBlock() {
  const answers = window.getUserAnswers ? window.getUserAnswers() : [];
  if (!answers.length) return '<p>Nenhuma resposta encontrada.</p>';

  const html = answers.map(a => {
    const row = document.getElementById(a.id);
    const label = row?.querySelector('.q-text')?.textContent?.trim() || a.id;
    return `<div class="report-row" style="margin-bottom:8px;">
      <div><strong>${label}</strong></div>
      <div>Nota: <span style="font-weight:bold;color:#21693a;">${a.score}</span></div>
    </div>`;
  }).join('');

  return `<section class="report-answers" style="margin-top:24px;">
    <h2 style="font-size:18px;color:#0b63d6;">Respostas da Pesquisa</h2>
    ${html}
  </section>`;
}
