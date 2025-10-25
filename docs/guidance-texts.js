// guidance-texts.js
// Textos de orientação exatamente conforme a pesquisa original fornecida.

(function (global) {
  'use strict';

  const GuidanceTexts = {
    // O QUE — Produto ou Serviço
   q1: {
  title: 'O quanto você sabe sobre os benefícios que seu produto ou serviço entrega ao cliente?',
  why: 'Conhecer os benefícios é entender o valor que o cliente recebe. Exemplo: um sabonete artesanal não só limpa, mas hidrata, relaxa com aromas naturais e evita alergias.',
  suggestion: 'Ajuda a criar descrições mais envolventes, destacar vantagens reais em anúncios e desenvolver ofertas que resolvem problemas específicos.'
},
q2: {
  title: 'O quanto você conhece os diferenciais do seu produto ou serviço frente aos concorrentes?',
  why: 'Diferenciais mostram por que o cliente deve escolher você. Exemplo: entrega rápida, personalização, uso de materiais sustentáveis ou atendimento exclusivo.',
  suggestion: 'Fortalece sua marca, justifica preços, melhora a comunicação e facilita parcerias estratégicas.'
},
q3: {
  title: 'O quanto você entende o problema ou necessidade que seu produto ou serviço resolve?',
  why: 'Entender a dor do cliente permite criar soluções certeiras. Exemplo: marmitas saudáveis resolvem a falta de tempo e preocupação com alimentação.',
  suggestion: 'Direciona melhorias no produto, cria mensagens mais eficazes e aumenta a conexão com o público.'
},
q4: {
  title: 'O quanto você conhece o perfil do seu cliente ideal (idade, interesses, hábitos)?',
  why: 'Saber o perfil evita esforços com quem não vai comprar. Exemplo: roupas fitness atraem pessoas que praticam atividade física e valorizam conforto.',
  suggestion: 'Facilita a escolha de linguagem, estilo visual, canais de comunicação e até o tipo de embalagem.'
},
q5: {
  title: 'O quanto você sabe onde seu cliente costuma estar (redes sociais, feiras, lojas)?',
  why: 'Saber onde o cliente está é como montar a loja no ponto certo. Exemplo: produtos artesanais vendem bem em feiras locais e no Instagram.',
  suggestion: 'Foca os investimentos em divulgação, define os melhores canais de venda e aumenta o alcance.'
},
q6: {
  title: 'O quanto você conhece os desejos e dores do seu público?',
  why: 'Desejos e dores são gatilhos de compra. Exemplo: uma consultoria de imagem atende o desejo de autoestima e a dor da insegurança.',
  suggestion: 'Permite criar produtos que encantam, campanhas que emocionam e experiências que fidelizam.'
},
q7: {
  title: 'O quanto seu produto cria conexão emocional com o cliente?',
  why: 'Conexão emocional transforma clientes em fãs. Exemplo: um presente personalizado com história gera afeto e lembrança.',
  suggestion: 'Aumenta o valor percebido, gera indicações espontâneas e permite cobrar mais por experiências únicas.'
},
q8: {
  title: 'Você já validou seu público com vendas, conversas ou testes?',
  why: 'Validar evita achismos. Exemplo: testar um novo sabor de bolo com clientes fiéis antes de lançar oficialmente.',
  suggestion: 'Ajusta produto, preço e canais com base em dados reais, reduz riscos e aumenta a assertividade.'
},
q9: {
  title: 'O quanto você entende por que escolheu esse produto ou serviço para empreender?',
  why: 'Seu motivo é sua raiz. Exemplo: transformar um hobby em renda traz mais propósito e persistência.',
  suggestion: 'Ajuda a manter o foco, contar uma história inspiradora e conectar com clientes que valorizam autenticidade.'
},
q10: {
  title: 'O quanto você sabe o propósito do seu negócio (o que quer transformar)?',
  why: 'Propósito guia decisões além do lucro. Exemplo: uma marca que quer promover inclusão e autoestima com moda acessível.',
  suggestion: 'Atrai clientes e parceiros com valores semelhantes, fortalece a cultura da empresa e guia decisões estratégicas.'
},
q11: {
  title: 'O quanto você se sente motivado para trabalhar nesse negócio hoje?',
  why: 'Motivação é combustível. Exemplo: um empreendedor motivado posta com frequência, atende com entusiasmo e busca inovação.',
  suggestion: 'Ajuda a identificar sinais de esgotamento, necessidade de apoio ou de renovar o propósito.'
},
q12: {
  title: 'O quanto você domina o processo de produção ou execução do seu produto/serviço?',
  why: 'Domínio técnico evita retrabalho. Exemplo: um designer que domina ferramentas entrega com mais agilidade e qualidade.',
  suggestion: 'Facilita treinamentos, padronização e crescimento com consistência.'
},
q13: {
  title: 'O quanto você controla o custo de produção e sabe quanto precisa para obter lucro?',
  why: 'Sem controle, o lucro vira ilusão. Exemplo: vender por R$50 sem saber que o custo é R$45 pode gerar prejuízo.',
  suggestion: 'Permite precificar com segurança, planejar promoções e garantir sustentabilidade financeira.'
},
q14: {
  title: 'O quanto sua logística de entrega e embalagem é eficiente e confiável?',
  why: 'Entrega ruim mancha a reputação. Exemplo: um produto quebrado por embalagem frágil gera reclamações e devoluções.',
  suggestion: 'Reduz custos com trocas, melhora a experiência do cliente e amplia o alcance geográfico.'
},
q15: {
  title: 'O quanto você oferece atendimento claro e positivo ao cliente antes e depois da venda?',
  why: 'Atendimento é parte do produto. Exemplo: responder dúvidas com empatia e rapidez aumenta a chance de fidelização.',
  suggestion: 'Gera avaliações positivas, aumenta a taxa de recompra e fortalece a reputação da marca.'
},
q16: {
  title: 'O quanto você entende como precificar seu produto ou serviço de forma justa e competitiva?',
  why: 'Preço certo é equilíbrio entre valor e mercado. Exemplo: cobrar R$80 por uma peça exclusiva pode ser justo se o cliente entende o valor.',
  suggestion: 'Ajuda a planejar metas de faturamento, criar promoções estratégicas e evitar prejuízos.'
},
q17: {
  title: 'O quanto você sabe comunicar o valor do seu produto em posts, anúncios ou vendas?',
  why: 'Valor percebido é o que vende. Exemplo: mostrar que uma bolsa é feita à mão e dura anos justifica o preço.',
  suggestion: 'Torna seus conteúdos mais persuasivos, aumenta conversões e diferencia sua marca no mercado.'
},
q18: {
  title: 'O quanto você já usa estratégias de divulgação (posts, parcerias, feiras, marketplaces)?',
  why: 'Divulgação é ponte entre você e o cliente. Exemplo: uma parceria com influenciadores locais pode gerar vendas imediatas.',
  suggestion: 'Ajuda a planejar calendário de ações, testar canais e medir o que realmente funciona.'
},
q19: {
  title: 'O quanto você entende sobre fidelização de clientes (como fazer o cliente voltar)?',
  why: 'Fidelizar é vender com menos esforço. Exemplo: oferecer desconto na próxima compra ou criar um clube de vantagens.',
  suggestion: 'Aumenta receita recorrente, reduz custo de aquisição e transforma clientes em promotores da marca.'
}

  };

  global.GuidanceTexts = GuidanceTexts;
})(window);
