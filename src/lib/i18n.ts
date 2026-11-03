export const locales = ['en', 'es', 'pt', 'it'] as const;
export type Locale = (typeof locales)[number];

export const languageNames = {
  en: 'English',
  es: 'Español',
  pt: 'Português',
  it: 'Italiano',
} satisfies Record<Locale, string>;

const en = {
  home: 'Home',
  writing: 'Writing',
  projects: 'Projects',
  about: 'About',
  welcome: 'Welcome to Finnternet',
  hello: 'Hi, I’m Finn.',
  tagline: 'Welcome to my corner of the internet.',
  intro: 'Things I’m building, ideas I’m exploring, and notes along the way.',
  latest: 'Latest writing',
  allWriting: 'All writing',
  writingIntro: 'Notes, experiments, and the occasional rabbit hole.',
  projectsIntro: 'A little collection of things from the workbench.',
  experiment: 'Try an experiment',
  playground: 'Spring playground',
  stiffness: 'Stiffness',
  damping: 'Damping',
  replay: 'Replay',
  demoDescription:
    'A spring pulls a block towards its resting position. Adjust stiffness and damping, then replay the motion.',
  demoHint: 'Try less damping. Watch it overshoot.',
  reducedMotion: 'Motion is paused to respect your system preference.',
  contents: 'On this page',
  by: 'By',
  minRead: 'min read',
  madeBy: 'Made by Finn.',
  back: 'Back to writing',
  skip: 'Skip to content',
  changeTheme: 'Change color theme',
  light: 'Light',
  dark: 'Dark',
  system: 'System',
  language: 'Language',
  browse: 'Open writing',
  openProject: 'Open project',
  aboutTitle: 'A little about this corner',
  aboutIntro:
    'Finnternet is a play on Finn and internet. A personal space to write, build, and follow a little curiosity.',
  aboutBody:
    'Expect programming experiments, interactive explanations, and notes along the way. Some things are better understood by playing with them.',
  aboutLanguages:
    'One corner of the internet, a few different languages: English, Spanish, Portuguese, and Italian.',
  aboutLink: 'Explore the writing',
  example: 'Demo article',
  springProject:
    'A small experiment in motion. Move a slider and find out what makes an interface feel alive.',
  rss: 'RSS feed',
  notFound: 'This file wandered off.',
  notFoundBody:
    'The page you’re looking for isn’t here. Head back to the desktop and try another folder.',
  backHome: 'Back to home',
  experimentLink: 'Read the story behind it',
};

type Dictionary = { [Key in keyof typeof en]: string };

export const translations = {
  en,
  es: {
    home: 'Inicio',
    writing: 'Artículos',
    projects: 'Proyectos',
    about: 'Sobre mí',
    welcome: 'Bienvenido a Finnternet',
    hello: 'Hola, soy Finn.',
    tagline: 'Bienvenido a mi rincón de internet.',
    intro: 'Cosas que construyo, ideas que exploro y notas por el camino.',
    latest: 'Últimos artículos',
    allWriting: 'Todos los artículos',
    writingIntro: 'Notas, experimentos y alguna que otra curiosidad.',
    projectsIntro: 'Una pequeña colección de cosas del taller.',
    experiment: 'Prueba un experimento',
    playground: 'Laboratorio de muelles',
    stiffness: 'Rigidez',
    damping: 'Amortiguación',
    replay: 'Repetir',
    demoDescription:
      'Un muelle lleva un bloque a su posición de reposo. Ajusta la rigidez y la amortiguación y repite el movimiento.',
    demoHint: 'Prueba menos amortiguación. Mira cómo se pasa.',
    reducedMotion:
      'La animación está pausada según tus preferencias del sistema.',
    contents: 'En esta página',
    by: 'Por',
    minRead: 'min de lectura',
    madeBy: 'Hecho por Finn.',
    back: 'Volver a los artículos',
    skip: 'Saltar al contenido',
    changeTheme: 'Cambiar el tema',
    light: 'Claro',
    dark: 'Oscuro',
    system: 'Sistema',
    language: 'Idioma',
    browse: 'Ver artículos',
    openProject: 'Abrir proyecto',
    aboutTitle: 'Un poco sobre este rincón',
    aboutIntro:
      'Finnternet es un juego con Finn e internet. Un espacio personal para escribir, construir y seguir la curiosidad.',
    aboutBody:
      'Aquí encontrarás experimentos de programación, explicaciones interactivas y notas por el camino. Algunas cosas se entienden mejor jugando con ellas.',
    aboutLanguages:
      'Un rincón de internet en varios idiomas: inglés, español, portugués e italiano.',
    aboutLink: 'Explorar los artículos',
    example: 'Artículo de ejemplo',
    springProject:
      'Un pequeño experimento de movimiento. Mueve un control y descubre qué hace que una interfaz cobre vida.',
    rss: 'Canal RSS',
    notFound: 'Este archivo se ha perdido.',
    notFoundBody:
      'La página que buscas no está aquí. Vuelve al escritorio y prueba otra carpeta.',
    backHome: 'Volver al inicio',
    experimentLink: 'Lee la historia del experimento',
  },
  pt: {
    home: 'Início',
    writing: 'Artigos',
    projects: 'Projetos',
    about: 'Sobre mim',
    welcome: 'Bem-vindo ao Finnternet',
    hello: 'Oi, eu sou Finn.',
    tagline: 'Bem-vindo ao meu cantinho da internet.',
    intro:
      'Coisas que estou criando, ideias que estou explorando e notas pelo caminho.',
    latest: 'Últimos artigos',
    allWriting: 'Todos os artigos',
    writingIntro: 'Notas, experimentos e uma curiosidade aqui e ali.',
    projectsIntro: 'Uma pequena coleção de coisas da bancada.',
    experiment: 'Teste um experimento',
    playground: 'Laboratório de molas',
    stiffness: 'Rigidez',
    damping: 'Amortecimento',
    replay: 'Repetir',
    demoDescription:
      'Uma mola puxa um bloco para a posição de repouso. Ajuste a rigidez e o amortecimento e repita o movimento.',
    demoHint: 'Tente menos amortecimento. Veja como ele passa do ponto.',
    reducedMotion:
      'A animação está pausada para respeitar a preferência do seu sistema.',
    contents: 'Nesta página',
    by: 'Por',
    minRead: 'min de leitura',
    madeBy: 'Feito por Finn.',
    back: 'Voltar aos artigos',
    skip: 'Pular para o conteúdo',
    changeTheme: 'Mudar o tema',
    light: 'Claro',
    dark: 'Escuro',
    system: 'Sistema',
    language: 'Idioma',
    browse: 'Ver artigos',
    openProject: 'Abrir projeto',
    aboutTitle: 'Um pouco sobre este cantinho',
    aboutIntro:
      'Finnternet é uma brincadeira com Finn e internet. Um espaço pessoal para escrever, criar e seguir a curiosidade.',
    aboutBody:
      'Por aqui, experimentos de programação, explicações interativas e notas pelo caminho. Algumas coisas ficam mais claras quando a gente pode brincar com elas.',
    aboutLanguages:
      'Um cantinho da internet em alguns idiomas: inglês, espanhol, português e italiano.',
    aboutLink: 'Explorar os artigos',
    example: 'Artigo de exemplo',
    springProject:
      'Um pequeno experimento de movimento. Mexa nos controles e descubra o que dá vida a uma interface.',
    rss: 'Feed RSS',
    notFound: 'Este arquivo se perdeu.',
    notFoundBody:
      'A página que você procura não está aqui. Volte à área de trabalho e tente outra pasta.',
    backHome: 'Voltar ao início',
    experimentLink: 'Leia a história do experimento',
  },
  it: {
    home: 'Home',
    writing: 'Articoli',
    projects: 'Progetti',
    about: 'Chi sono',
    welcome: 'Benvenuto su Finnternet',
    hello: 'Ciao, sono Finn.',
    tagline: 'Benvenuto nel mio angolo di internet.',
    intro: 'Cose che costruisco, idee che esploro e appunti lungo il percorso.',
    latest: 'Ultimi articoli',
    allWriting: 'Tutti gli articoli',
    writingIntro: 'Appunti, esperimenti e qualche piccola curiosità.',
    projectsIntro: 'Una piccola raccolta di cose dal laboratorio.',
    experiment: 'Prova un esperimento',
    playground: 'Laboratorio di molle',
    stiffness: 'Rigidità',
    damping: 'Smorzamento',
    replay: 'Ripeti',
    demoDescription:
      'Una molla tira un blocco verso la posizione di riposo. Regola rigidità e smorzamento e ripeti il movimento.',
    demoHint: 'Prova meno smorzamento. Guarda come supera il punto di riposo.',
    reducedMotion:
      'L’animazione è in pausa per rispettare le preferenze del sistema.',
    contents: 'In questa pagina',
    by: 'Di',
    minRead: 'min di lettura',
    madeBy: 'Fatto da Finn.',
    back: 'Torna agli articoli',
    skip: 'Vai al contenuto',
    changeTheme: 'Cambia tema',
    light: 'Chiaro',
    dark: 'Scuro',
    system: 'Sistema',
    language: 'Lingua',
    browse: 'Leggi gli articoli',
    openProject: 'Apri progetto',
    aboutTitle: 'Qualcosa su questo angolo',
    aboutIntro:
      'Finnternet è un gioco tra Finn e internet. Uno spazio personale per scrivere, costruire e seguire la curiosità.',
    aboutBody:
      'Qui trovi esperimenti di programmazione, spiegazioni interattive e appunti lungo il percorso. Alcune cose si capiscono meglio giocandoci.',
    aboutLanguages:
      'Un angolo di internet in più lingue: inglese, spagnolo, portoghese e italiano.',
    aboutLink: 'Esplora gli articoli',
    example: 'Articolo dimostrativo',
    springProject:
      'Un piccolo esperimento sul movimento. Muovi un cursore e scopri cosa rende viva un’interfaccia.',
    rss: 'Feed RSS',
    notFound: 'Questo file si è perso.',
    notFoundBody:
      'La pagina che cerchi non è qui. Torna alla scrivania e prova un’altra cartella.',
    backHome: 'Torna alla home',
    experimentLink: 'Leggi la storia dell’esperimento',
  },
} satisfies Record<Locale, Dictionary>;

export function localePath(locale: Locale, path = ''): string {
  const clean = path.replace(/^\/+|\/+$/g, '');
  const prefix = locale === 'en' ? '' : `/${locale}`;
  return `${prefix}/${clean}${clean ? '/' : ''}`;
}

export function htmlLanguage(locale: Locale): string {
  return locale === 'pt' ? 'pt-BR' : locale;
}
