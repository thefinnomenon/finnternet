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
  navigation: 'Navigation',
  writing: 'Writing',
  work: 'Work',
  workIntro: 'Professional experience.',
  allWork: 'View work',
  whistleDescription:
    'A live sports prediction game where fans answer questions while watching.',
  founder: 'Founder',
  seniorSoftwareEngineer: 'Senior Software Engineer',
  fullStackEngineer: 'Full Stack Engineer',
  firefighter: 'Firefighter',
  cyberResearcher: 'Cyber Researcher',
  cyberAssessmentIntern: 'Cyber System Assessment Research Intern',
  undergraduateInstructorsAssistant: "Undergraduate Instructor's Assistant",
  undergraduateResearchAssistant: 'Undergraduate Research Assistant',
  undergraduateInstructingAssistant: 'Undergraduate Instructing Assistant',
  remoteLocation: 'Remote',
  greaterBostonLocation: 'Greater Boston',
  saugusLocation: 'Saugus, MA',
  lexingtonLocation: 'Lexington, MA',
  amherstLocation: 'Amherst, MA',
  paragraphWorkDescription:
    'Built rich text editing, Stripe subscriptions, account management, and email features, incorporating customer feedback.',
  freelanceWorkDescription:
    'Delivered full-stack web and mobile applications, from architecture and product design through deployment and maintenance.',
  lincolnWorkDescription:
    'Analyzed NFC, Android security, secure elements, and the Google Wallet application.',
  engineeringLabWorkDescription:
    'Supported ENGIN112 labs, ordered components, and helped students complete lab assignments.',
  nfcResearchWorkDescription:
    'Researched NFC technology and wrote C code to read and transmit tag IDs using a development board and microcontroller.',
  introEngineeringWorkDescription:
    'Assisted engineering labs covering circuits, lab instruments, Verilog, and CPLD programming.',
  graphqlAlgoliaDescription:
    'Add search indexing to an AWS Amplify GraphQL API with one directive.',
  creatorKitchenDescription:
    'Write, preview, and publish content on your own website.',
  projects: 'Projects',
  about: 'About',
  welcome: 'Welcome to Finnternet',
  hello: 'Hi, I’m Chris Finn.',
  tagline: 'Welcome to my corner of the internet.',
  intro: 'Things I’m building, ideas I’m exploring, and notes along the way.',
  latest: 'Latest writing',
  allWriting: 'All writing',
  writingIntro: 'Notes, experiments, and the occasional rabbit hole.',
  projectsIntro: 'A little collection of things from the workbench.',
  contents: 'On this page',
  by: 'By',
  minRead: 'min read',
  madeBy: 'Made by Chris Finn.',
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
  instamosaicDescription:
    'Turn your Instagram photos into a mosaic of an image you choose.',
  faceReelDescription:
    'Turn photos of the same face from Instagram into a reel.',
  guestographyDescription:
    'Collect guests’ photos and videos in one shared event gallery.',
  rss: 'RSS feed',
  notFound: 'This file wandered off.',
  notFoundBody:
    'The page you’re looking for isn’t here. Head back to the desktop and try another folder.',
  backHome: 'Back to home',
};

type Dictionary = { [Key in keyof typeof en]: string };

export const translations = {
  en,
  es: {
    home: 'Inicio',
    navigation: 'Navegación',
    writing: 'Artículos',
    work: 'Trabajo',
    workIntro: 'Experiencia profesional.',
    allWork: 'Ver trabajo',
    whistleDescription:
      'Un juego de predicciones deportivas en directo para responder mientras ves el partido.',
    founder: 'Fundador',
    seniorSoftwareEngineer: 'Ingeniero de software sénior',
    fullStackEngineer: 'Ingeniero full stack',
    firefighter: 'Bombero',
    cyberResearcher: 'Investigador de ciberseguridad',
    cyberAssessmentIntern:
      'Becario de investigación en evaluación de cibersistemas',
    undergraduateInstructorsAssistant: 'Ayudante de docencia de grado',
    undergraduateResearchAssistant: 'Ayudante de investigación de grado',
    undergraduateInstructingAssistant: 'Ayudante de docencia de grado',
    remoteLocation: 'Remoto',
    greaterBostonLocation: 'Área metropolitana de Boston',
    saugusLocation: 'Saugus, MA',
    lexingtonLocation: 'Lexington, MA',
    amherstLocation: 'Amherst, MA',
    paragraphWorkDescription:
      'Desarrollé edición de texto enriquecido, suscripciones de Stripe, gestión de cuentas y funciones de correo, incorporando comentarios de clientes.',
    freelanceWorkDescription:
      'Desarrollé aplicaciones web y móviles full stack, desde la arquitectura y el diseño hasta el despliegue y el mantenimiento.',
    lincolnWorkDescription:
      'Analicé NFC, la seguridad de Android, elementos seguros y la aplicación Google Wallet.',
    engineeringLabWorkDescription:
      'Apoyé los laboratorios ENGIN112, pedí componentes y ayudé a los estudiantes con sus prácticas.',
    nfcResearchWorkDescription:
      'Investigué la tecnología NFC y programé en C la lectura y transmisión de identificadores con una placa de desarrollo y un microcontrolador.',
    introEngineeringWorkDescription:
      'Colaboré en laboratorios de circuitos, instrumentos, Verilog y programación de CPLD.',
    graphqlAlgoliaDescription:
      'Añade búsquedas a una API GraphQL de AWS Amplify con una directiva.',
    creatorKitchenDescription:
      'Escribe, previsualiza y publica contenido en tu propio sitio web.',
    projects: 'Proyectos',
    about: 'Sobre mí',
    welcome: 'Bienvenido a Finnternet',
    hello: 'Hola, soy Chris Finn.',
    tagline: 'Bienvenido a mi rincón de internet.',
    intro: 'Cosas que construyo, ideas que exploro y notas por el camino.',
    latest: 'Últimos artículos',
    allWriting: 'Todos los artículos',
    writingIntro: 'Notas, experimentos y alguna que otra curiosidad.',
    projectsIntro: 'Una pequeña colección de cosas del taller.',
    contents: 'En esta página',
    by: 'Por',
    minRead: 'min de lectura',
    madeBy: 'Hecho por Chris Finn.',
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
    instamosaicDescription:
      'Convierte tus fotos de Instagram en un mosaico de la imagen que elijas.',
    faceReelDescription:
      'Convierte las fotos de una misma persona en Instagram en un reel.',
    guestographyDescription:
      'Reúne las fotos y los vídeos de tus invitados en una galería del evento.',
    rss: 'Canal RSS',
    notFound: 'Este archivo se ha perdido.',
    notFoundBody:
      'La página que buscas no está aquí. Vuelve al escritorio y prueba otra carpeta.',
    backHome: 'Volver al inicio',
  },
  pt: {
    home: 'Início',
    navigation: 'Navegação',
    writing: 'Artigos',
    work: 'Trabalho',
    workIntro: 'Experiência profissional.',
    allWork: 'Ver trabalho',
    whistleDescription:
      'Um jogo de palpites esportivos ao vivo para responder enquanto você assiste.',
    founder: 'Fundador',
    seniorSoftwareEngineer: 'Engenheiro de software sênior',
    fullStackEngineer: 'Engenheiro full stack',
    firefighter: 'Bombeiro',
    cyberResearcher: 'Pesquisador de cibersegurança',
    cyberAssessmentIntern:
      'Estagiário de pesquisa em avaliação de sistemas cibernéticos',
    undergraduateInstructorsAssistant: 'Monitor de ensino de graduação',
    undergraduateResearchAssistant: 'Assistente de pesquisa de graduação',
    undergraduateInstructingAssistant: 'Monitor de ensino de graduação',
    remoteLocation: 'Remoto',
    greaterBostonLocation: 'Região metropolitana de Boston',
    saugusLocation: 'Saugus, MA',
    lexingtonLocation: 'Lexington, MA',
    amherstLocation: 'Amherst, MA',
    paragraphWorkDescription:
      'Desenvolvi edição de texto, assinaturas com Stripe, gestão de contas e recursos de e-mail, incorporando feedback dos clientes.',
    freelanceWorkDescription:
      'Desenvolvi aplicações web e móveis full stack, da arquitetura e do design à implantação e manutenção.',
    lincolnWorkDescription:
      'Analisei NFC, segurança do Android, elementos seguros e o aplicativo Google Wallet.',
    engineeringLabWorkDescription:
      'Apoiei os laboratórios ENGIN112, encomendei componentes e ajudei os alunos com as atividades.',
    nfcResearchWorkDescription:
      'Pesquisei a tecnologia NFC e programei em C a leitura e transmissão de identificadores com uma placa de desenvolvimento e um microcontrolador.',
    introEngineeringWorkDescription:
      'Auxiliei em laboratórios de circuitos, instrumentos, Verilog e programação de CPLD.',
    graphqlAlgoliaDescription:
      'Adicione busca a uma API GraphQL do AWS Amplify com uma diretiva.',
    creatorKitchenDescription:
      'Escreva, visualize e publique conteúdo no seu próprio site.',
    projects: 'Projetos',
    about: 'Sobre mim',
    welcome: 'Bem-vindo ao Finnternet',
    hello: 'Oi, eu sou Chris Finn.',
    tagline: 'Bem-vindo ao meu cantinho da internet.',
    intro:
      'Coisas que estou criando, ideias que estou explorando e notas pelo caminho.',
    latest: 'Últimos artigos',
    allWriting: 'Todos os artigos',
    writingIntro: 'Notas, experimentos e uma curiosidade aqui e ali.',
    projectsIntro: 'Uma pequena coleção de coisas da bancada.',
    contents: 'Nesta página',
    by: 'Por',
    minRead: 'min de leitura',
    madeBy: 'Feito por Chris Finn.',
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
    instamosaicDescription:
      'Transforme suas fotos do Instagram em um mosaico da imagem que você escolher.',
    faceReelDescription:
      'Transforme fotos do mesmo rosto no Instagram em um reel.',
    guestographyDescription:
      'Reúna as fotos e os vídeos dos convidados em uma galeria do evento.',
    rss: 'Feed RSS',
    notFound: 'Este arquivo se perdeu.',
    notFoundBody:
      'A página que você procura não está aqui. Volte à área de trabalho e tente outra pasta.',
    backHome: 'Voltar ao início',
  },
  it: {
    home: 'Home',
    navigation: 'Navigazione',
    writing: 'Articoli',
    work: 'Lavoro',
    workIntro: 'Esperienza professionale.',
    allWork: 'Vedi il lavoro',
    whistleDescription:
      'Un gioco di pronostici sportivi in diretta a cui partecipare mentre guardi la partita.',
    founder: 'Fondatore',
    seniorSoftwareEngineer: 'Ingegnere software senior',
    fullStackEngineer: 'Ingegnere full stack',
    firefighter: 'Vigile del fuoco',
    cyberResearcher: 'Ricercatore di cybersicurezza',
    cyberAssessmentIntern:
      'Tirocinante di ricerca nella valutazione dei sistemi informatici',
    undergraduateInstructorsAssistant:
      'Assistente alla didattica universitario',
    undergraduateResearchAssistant: 'Assistente di ricerca universitario',
    undergraduateInstructingAssistant:
      'Assistente alla didattica universitario',
    remoteLocation: 'Da remoto',
    greaterBostonLocation: 'Area metropolitana di Boston',
    saugusLocation: 'Saugus, MA',
    lexingtonLocation: 'Lexington, MA',
    amherstLocation: 'Amherst, MA',
    paragraphWorkDescription:
      'Ho sviluppato modifica del testo, abbonamenti Stripe, gestione degli account e funzioni email, integrando il feedback dei clienti.',
    freelanceWorkDescription:
      'Ho realizzato applicazioni web e mobili full stack, dall’architettura e dal design alla distribuzione e manutenzione.',
    lincolnWorkDescription:
      'Ho analizzato NFC, sicurezza di Android, elementi sicuri e l’applicazione Google Wallet.',
    engineeringLabWorkDescription:
      'Ho supportato i laboratori ENGIN112, ordinato componenti e assistito gli studenti nelle esercitazioni.',
    nfcResearchWorkDescription:
      'Ho studiato la tecnologia NFC e scritto codice C per leggere e trasmettere identificatori con una scheda di sviluppo e un microcontrollore.',
    introEngineeringWorkDescription:
      'Ho assistito nei laboratori di circuiti, strumenti, Verilog e programmazione CPLD.',
    graphqlAlgoliaDescription:
      'Aggiungi la ricerca a un’API GraphQL di AWS Amplify con una direttiva.',
    creatorKitchenDescription:
      'Scrivi, visualizza in anteprima e pubblica contenuti sul tuo sito.',
    projects: 'Progetti',
    about: 'Chi sono',
    welcome: 'Benvenuto su Finnternet',
    hello: 'Ciao, sono Chris Finn.',
    tagline: 'Benvenuto nel mio angolo di internet.',
    intro: 'Cose che costruisco, idee che esploro e appunti lungo il percorso.',
    latest: 'Ultimi articoli',
    allWriting: 'Tutti gli articoli',
    writingIntro: 'Appunti, esperimenti e qualche piccola curiosità.',
    projectsIntro: 'Una piccola raccolta di cose dal laboratorio.',
    contents: 'In questa pagina',
    by: 'Di',
    minRead: 'min di lettura',
    madeBy: 'Fatto da Chris Finn.',
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
    instamosaicDescription:
      'Trasforma le tue foto di Instagram in un mosaico di un’immagine a tua scelta.',
    faceReelDescription:
      'Trasforma le foto dello stesso volto su Instagram in un reel.',
    guestographyDescription:
      'Raccogli le foto e i video degli invitati in una galleria dell’evento.',
    rss: 'Feed RSS',
    notFound: 'Questo file si è perso.',
    notFoundBody:
      'La pagina che cerchi non è qui. Torna alla scrivania e prova un’altra cartella.',
    backHome: 'Torna alla home',
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
