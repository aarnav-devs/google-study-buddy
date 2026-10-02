import { Language, LearningStyle, Subject } from './types';

export interface LocaleContent {
  appTitle: string;
  onboarding: {
    greeting: string;
    tagline: string;
    nameLabel: string;
    namePlaceholder: string;
    languageLabel: string;
    styleLabel: string;
    startButton: string;
    styleDescriptions: {
      visual: string;
      story: string;
      step_by_step: string;
    };
  };
  home: {
    greetingPrefix: string;
    subtitle: string;
    subjectSectionTitle: string;
    subjects: Record<Subject, { name: string; desc: string; iconBg: string; sampleTopic: string }>;
    askBarPlaceholder: string;
    askButton: string;
    quickPromptsTitle: string;
    quickPrompts: { text: string; subject: Subject }[];
    miniCheckBannerTitle: string;
    miniCheckBannerDesc: string;
    miniCheckBannerBtn: string;
  };
  chat: {
    headerTitle: string;
    switchTopic: string;
    learningStyleTag: string;
    actionButtons: {
      hint: string;
      example: string;
      anotherWay: string;
      gotIt: string;
    };
    inputPlaceholder: string;
    micTooltip: string;
    micListening: string;
    sendTooltip: string;
    textSizeTooltip: string;
    ttsTooltip: string;
    buddyThinking: string;
    takeMiniCheckPrompt: string;
    startMiniCheckBtn: string;
    emptyChatPrompt: string;
  };
  miniCheck: {
    title: string;
    questionOf: (current: number, total: number) => string;
    checkAnswer: string;
    nextQuestion: string;
    finishQuiz: string;
    retryQuiz: string;
    backToChat: string;
    adaptiveTag: string;
    congratsTitle: string;
    congratsSubtitle: string;
    scoreText: (score: number, total: number) => string;
  };
  languages: Record<Language, string>;
  styles: Record<LearningStyle, { title: string; subtitle: string; icon: string }>;
}

export const LOCALES: Record<Language, LocaleContent> = {
  en: {
    appTitle: 'Google Study Buddy',
    onboarding: {
      greeting: "Hi! I'm Study Buddy.",
      tagline: 'Your friendly guide to learning Maths, Science, English & Social Studies your way.',
      nameLabel: "What's your name?",
      namePlaceholder: 'Enter your name (e.g. Maya, Leo)',
      languageLabel: 'Pick your language',
      styleLabel: 'How do you learn best?',
      startButton: "Let's start",
      styleDescriptions: {
        visual: 'See it with visual pictures, diagrams, and shapes',
        story: 'Learn with stories, fun analogies, and adventures',
        step_by_step: 'Break every problem into clear, bite-sized steps',
      },
    },
    home: {
      greetingPrefix: 'Hi',
      subtitle: 'What exciting topic are we discovering today?',
      subjectSectionTitle: 'Explore by Subject',
      subjects: {
        Maths: {
          name: 'Maths',
          desc: 'Fractions, shapes, numbers & logic',
          iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
          sampleTopic: 'Fractions with Pizza Slices',
        },
        Science: {
          name: 'Science',
          desc: 'Plants, planets, energy & experiments',
          iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
          sampleTopic: 'How Plants Make Food (Photosynthesis)',
        },
        English: {
          name: 'English',
          desc: 'Stories, grammar, words & creative writing',
          iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
          sampleTopic: 'Similes vs Metaphors',
        },
        'Social Studies': {
          name: 'Social Studies',
          desc: 'Maps, world history, civilizations & communities',
          iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
          sampleTopic: 'Why Ancient Civilizations Settled Near Rivers',
        },
      },
      askBarPlaceholder: 'Ask me anything about your homework or lessons...',
      askButton: 'Ask Buddy',
      quickPromptsTitle: 'Try asking:',
      quickPrompts: [
        { text: 'How do I add two fractions with different bottoms?', subject: 'Maths' },
        { text: 'Why is the ocean blue if water is clear?', subject: 'Science' },
        { text: 'What is the difference between their, there, and they’re?', subject: 'English' },
        { text: 'Why did the Indus Valley people build brick cities?', subject: 'Social Studies' },
      ],
      miniCheckBannerTitle: 'Ready for a quick 2-minute brain check?',
      miniCheckBannerDesc: 'Interactive adaptive quizzes that reinforce whatever you learned!',
      miniCheckBannerBtn: 'Try a Mini Check',
    },
    chat: {
      headerTitle: 'Study Buddy',
      switchTopic: 'Change Subject',
      learningStyleTag: 'Style',
      actionButtons: {
        hint: '💡 Hint',
        example: '🔍 Show an example',
        anotherWay: '🔄 Try another way',
        gotIt: '🎉 I got it!',
      },
      inputPlaceholder: 'Type your question or thought here...',
      micTooltip: 'Tap to speak',
      micListening: 'Listening... speak clearly',
      sendTooltip: 'Send question',
      textSizeTooltip: 'Adjust text size',
      ttsTooltip: 'Listen to Study Buddy read aloud',
      buddyThinking: 'Study Buddy is thinking of the best hint...',
      takeMiniCheckPrompt: 'You understood this concept! Ready for a quick Mini Check?',
      startMiniCheckBtn: 'Start 2-Question Mini Check ✨',
      emptyChatPrompt: "Ask any question! Remember, I won't just spoil the answer—I'll guide you step-by-step so you master it yourself!",
    },
    miniCheck: {
      title: 'Topic Mini Check',
      questionOf: (current, total) => `Question ${current} of ${total}`,
      checkAnswer: 'Check Answer',
      nextQuestion: 'Next Question →',
      finishQuiz: 'See Results 🏆',
      retryQuiz: 'Practice Again',
      backToChat: 'Back to Chat',
      adaptiveTag: 'Adapts to your speed',
      congratsTitle: 'Superstar learning!',
      congratsSubtitle: 'You showed awesome curiosity and critical thinking.',
      scoreText: (score, total) => `You solved ${score} out of ${total} correctly!`,
    },
    languages: {
      en: 'English',
      hi: 'हिन्दी',
      es: 'Español',
      fr: 'Français',
    },
    styles: {
      visual: {
        title: 'See it',
        subtitle: 'Visual sketches & mental pictures',
        icon: '🎨',
      },
      story: {
        title: 'Story',
        subtitle: 'Real-life adventures & analogies',
        icon: '📖',
      },
      step_by_step: {
        title: 'Step by step',
        subtitle: 'Clear, bite-sized checkpoints',
        icon: '🔢',
      },
    },
  },
  hi: {
    appTitle: 'गूगल स्टडी बडी (Google Study Buddy)',
    onboarding: {
      greeting: "नमस्ते! मैं हूँ स्टडी बडी।",
      tagline: 'गणित, विज्ञान, अंग्रेज़ी और सामाजिक अध्ययन को अपनी पसंद के तरीके से सीखने का प्यारा साथी।',
      nameLabel: 'आपका नाम क्या है?',
      namePlaceholder: 'अपना नाम दर्ज करें (जैसे: आरव, रिया)',
      languageLabel: 'अपनी भाषा चुनें',
      styleLabel: 'आप कैसे सबसे अच्छा सीखते हैं?',
      startButton: "चलो शुरू करें",
      styleDescriptions: {
        visual: 'चित्रों, आरेखों और आकृतियों से देखकर समझें',
        story: 'कहानियों और मजेदार उदाहरणों से सीखें',
        step_by_step: 'हर सवाल को आसान छोटे-छोटे कदमों में हल करें',
      },
    },
    home: {
      greetingPrefix: 'नमस्ते',
      subtitle: 'आज हम कौन सा नया और दिलचस्प विषय सीखने वाले हैं?',
      subjectSectionTitle: 'विषय चुनें',
      subjects: {
        Maths: {
          name: 'गणित (Maths)',
          desc: 'भिन्न, आकृतियां, संख्याएं और तर्क',
          iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
          sampleTopic: 'पिज़्ज़ा के टुकड़ों से भिन्न समझें',
        },
        Science: {
          name: 'विज्ञान (Science)',
          desc: 'पौधे, ग्रह, ऊर्जा और प्रयोग',
          iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
          sampleTopic: 'पौधे अपना भोजन कैसे बनाते हैं?',
        },
        English: {
          name: 'अंग्रेज़ी (English)',
          desc: 'कहानियां, व्याकरण, शब्द और लेखन',
          iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
          sampleTopic: 'उपमा (Simile) और रूपक (Metaphor)',
        },
        'Social Studies': {
          name: 'सामाजिक अध्ययन',
          desc: 'मानचित्र, इतिहास, सभ्यताएं और समाज',
          iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
          sampleTopic: 'प्राचीन सभ्यताएं नदियों के किनारे क्यों बसीं?',
        },
      },
      askBarPlaceholder: 'अपने होमवर्क या पाठ के बारे में कुछ भी पूछें...',
      askButton: 'पूछें',
      quickPromptsTitle: 'यह पूछकर देखें:',
      quickPrompts: [
        { text: 'अलग-अलग हर (Denominator) वाले भिन्नों को कैसे जोड़ते हैं?', subject: 'Maths' },
        { text: 'पानी साफ़ होता है तो समुद्र नीला क्यों दिखता है?', subject: 'Science' },
        { text: 'Active voice और Passive voice में क्या फर्क है?', subject: 'English' },
        { text: 'सिंधु घाटी के लोगों ने पक्की ईंटों के नगर कैसे बनाए?', subject: 'Social Studies' },
      ],
      miniCheckBannerTitle: 'क्या आप 2 मिनट के मिनी चेक के लिए तैयार हैं?',
      miniCheckBannerDesc: 'छोटे और मजेदार प्रश्न जो आपके कॉन्सेप्ट को एकदम पक्का बना देंगे!',
      miniCheckBannerBtn: 'मिनी चेक शुरू करें',
    },
    chat: {
      headerTitle: 'स्टडी बडी',
      switchTopic: 'विषय बदलें',
      learningStyleTag: 'सीखने का तरीका',
      actionButtons: {
        hint: '💡 संकेत (Hint)',
        example: '🔍 उदाहरण दिखाएं',
        anotherWay: '🔄 दूसरे तरीके से बताएं',
        gotIt: '🎉 समझ आ गया!',
      },
      inputPlaceholder: 'यहाँ अपना प्रश्न या विचार लिखें...',
      micTooltip: 'बोलकर पूछें',
      micListening: 'सुन रहा हूँ... बोलिए',
      sendTooltip: 'भेजें',
      textSizeTooltip: 'अक्षरों का आकार बदलें',
      ttsTooltip: 'स्टडी बडी की आवाज़ सुनें',
      buddyThinking: 'स्टडी बडी आपके लिए सबसे अच्छा संकेत सोच रहा है...',
      takeMiniCheckPrompt: 'वाह! आपने यह बात समझ ली। क्या 2 प्रश्नों का मिनी टेस्ट दें?',
      startMiniCheckBtn: '2-प्रश्नों का मिनी चेक शुरू करें ✨',
      emptyChatPrompt: 'कोई भी प्रश्न पूछें! मैं केवल सीधा उत्तर नहीं दूँगा, बल्कि आपको कदम-दर-कदम समझाऊँगा ताकि आप खुद मास्टर बन सकें!',
    },
    miniCheck: {
      title: 'टॉपिक मिनी चेक',
      questionOf: (current, total) => `प्रश्न ${current} / ${total}`,
      checkAnswer: 'उत्तर जांचें',
      nextQuestion: 'अगला प्रश्न →',
      finishQuiz: 'परिणाम देखें 🏆',
      retryQuiz: 'दोबारा अभ्यास करें',
      backToChat: 'चैट पर वापस जाएं',
      adaptiveTag: 'आपकी गति के अनुसार',
      congratsTitle: 'शानदार प्रदर्शन!',
      congratsSubtitle: 'आपने बहुत लगन और समझदारी से सवालों को हल किया।',
      scoreText: (score, total) => `आपने ${total} में से ${score} सही उत्तर दिए!`,
    },
    languages: {
      en: 'English',
      hi: 'हिन्दी',
      es: 'Español',
      fr: 'Français',
    },
    styles: {
      visual: {
        title: 'See it (देखें)',
        subtitle: 'चित्र और मानसिक आरेख',
        icon: '🎨',
      },
      story: {
        title: 'Story (कहानी)',
        subtitle: 'रोचक कहानियां और उदाहरण',
        icon: '📖',
      },
      step_by_step: {
        title: 'Step by step (कदम-दर-कदम)',
        subtitle: 'छोटे और सरल चरण',
        icon: '🔢',
      },
    },
  },
  es: {
    appTitle: 'Google Study Buddy',
    onboarding: {
      greeting: '¡Hola! Soy Study Buddy.',
      tagline: 'Tu compañero ideal para aprender Matemáticas, Ciencias, Inglés y Estudios Sociales a tu manera.',
      nameLabel: '¿Cómo te llamas?',
      namePlaceholder: 'Escribe tu nombre (ej. Sofía, Mateo)',
      languageLabel: 'Elige tu idioma',
      styleLabel: '¿Cómo aprendes mejor?',
      startButton: 'Empecemos',
      styleDescriptions: {
        visual: 'Visualízalo con dibujos, diagramas y figuras',
        story: 'Aprende con historias y aventuras divertidas',
        step_by_step: 'Descompón cada problema paso a paso',
      },
    },
    home: {
      greetingPrefix: '¡Hola',
      subtitle: '¿Qué tema interesante descubriremos hoy?',
      subjectSectionTitle: 'Explorar por materia',
      subjects: {
        Maths: {
          name: 'Matemáticas',
          desc: 'Fracciones, figuras, números y lógica',
          iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
          sampleTopic: 'Fracciones con rebanadas de pizza',
        },
        Science: {
          name: 'Ciencias',
          desc: 'Plantas, planetas, energía y experimentos',
          iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
          sampleTopic: 'Cómo las plantas hacen su alimento',
        },
        English: {
          name: 'Inglés',
          desc: 'Historias, gramática, vocabulario y redacción',
          iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
          sampleTopic: 'Comparaciones y metáforas',
        },
        'Social Studies': {
          name: 'Estudios Sociales',
          desc: 'Mapas, historia, civilizaciones y comunidades',
          iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
          sampleTopic: 'Por qué las civilizaciones nacieron junto a ríos',
        },
      },
      askBarPlaceholder: 'Pregúntame cualquier duda de tus tareas...',
      askButton: 'Preguntar',
      quickPromptsTitle: 'Preguntas sugeridas:',
      quickPrompts: [
        { text: '¿Cómo sumo dos fracciones con distinto denominador?', subject: 'Maths' },
        { text: '¿Por qué el mar es azul si el agua es transparente?', subject: 'Science' },
        { text: '¿Cuál es la diferencia entre un adjetivo y un adverbio?', subject: 'English' },
        { text: '¿Por qué las pirámides de Egipto están alineadas?', subject: 'Social Studies' },
      ],
      miniCheckBannerTitle: '¿Listo para un chequeo rápido de 2 minutos?',
      miniCheckBannerDesc: '¡Preguntas breves y adaptables para fijar lo que aprendiste!',
      miniCheckBannerBtn: 'Probar Mini Check',
    },
    chat: {
      headerTitle: 'Study Buddy',
      switchTopic: 'Cambiar materia',
      learningStyleTag: 'Estilo',
      actionButtons: {
        hint: '💡 Pista',
        example: '🔍 Ver un ejemplo',
        anotherWay: '🔄 Explicar de otra forma',
        gotIt: '🎉 ¡Ya lo entendí!',
      },
      inputPlaceholder: 'Escribe tu pregunta o duda aquí...',
      micTooltip: 'Presiona para hablar',
      micListening: 'Escuchando... habla claramente',
      sendTooltip: 'Enviar pregunta',
      textSizeTooltip: 'Tamaño de letra',
      ttsTooltip: 'Escuchar la voz de Study Buddy',
      buddyThinking: 'Study Buddy está pensando la mejor pista...',
      takeMiniCheckPrompt: '¡Excelente! Lo comprendiste. ¿Probamos un Mini Check de 2 preguntas?',
      startMiniCheckBtn: 'Hacer Mini Check ✨',
      emptyChatPrompt: '¡Haz cualquier pregunta! No te daré la respuesta directa de inmediato; te guiaré paso a paso para que la descubras.',
    },
    miniCheck: {
      title: 'Mini Check del Tema',
      questionOf: (current, total) => `Pregunta ${current} de ${total}`,
      checkAnswer: 'Comprobar respuesta',
      nextQuestion: 'Siguiente pregunta →',
      finishQuiz: 'Ver resultados 🏆',
      retryQuiz: 'Practicar otra vez',
      backToChat: 'Volver al Chat',
      adaptiveTag: 'Se adapta a tu ritmo',
      congratsTitle: '¡Gran trabajo!',
      congratsSubtitle: 'Demostraste curiosidad y excelente razonamiento.',
      scoreText: (score, total) => `¡Acertaste ${score} de ${total} preguntas!`,
    },
    languages: {
      en: 'English',
      hi: 'हिन्दी',
      es: 'Español',
      fr: 'Français',
    },
    styles: {
      visual: {
        title: 'See it (Visual)',
        subtitle: 'Dibujos e imágenes mentales',
        icon: '🎨',
      },
      story: {
        title: 'Story (Historia)',
        subtitle: 'Aventuras y analogías reales',
        icon: '📖',
      },
      step_by_step: {
        title: 'Step by step (Paso a paso)',
        subtitle: 'Etapas claras y ordenadas',
        icon: '🔢',
      },
    },
  },
  fr: {
    appTitle: 'Google Study Buddy',
    onboarding: {
      greeting: "Salut ! Je suis Study Buddy.",
      tagline: 'Ton compagnon d’apprentissage personnalisé pour les Maths, les Sciences, l’Anglais et l’Histoire-Géo.',
      nameLabel: 'Comment tu t’appelles ?',
      namePlaceholder: 'Écris ton prénom (ex. Camille, Lucas)',
      languageLabel: 'Choisis ta langue',
      styleLabel: 'Comment apprends-tu le mieux ?',
      startButton: 'Commençons',
      styleDescriptions: {
        visual: 'Visualise avec des schémas, des images et des formes',
        story: 'Apprends avec des histoires et des aventures passionnantes',
        step_by_step: 'Décompose chaque problème étape par étape',
      },
    },
    home: {
      greetingPrefix: 'Bonjour',
      subtitle: 'Quel sujet passionnant découvrons-nous aujourd’hui ?',
      subjectSectionTitle: 'Explorer par matière',
      subjects: {
        Maths: {
          name: 'Maths',
          desc: 'Fractions, géométrie, nombres et logique',
          iconBg: 'bg-blue-50 text-blue-600 border-blue-200',
          sampleTopic: 'Les fractions avec des parts de pizza',
        },
        Science: {
          name: 'Sciences',
          desc: 'Plantes, planètes, énergie et expériences',
          iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-200',
          sampleTopic: 'Comment les plantes fabriquent leur nourriture',
        },
        English: {
          name: 'Anglais',
          desc: 'Histoires, grammaire, vocabulaire et expression',
          iconBg: 'bg-amber-50 text-amber-600 border-amber-200',
          sampleTopic: 'Métaphores et comparaisons',
        },
        'Social Studies': {
          name: 'Histoire-Géo',
          desc: 'Cartes, civilisations anciennes et citoyenneté',
          iconBg: 'bg-rose-50 text-rose-600 border-rose-200',
          sampleTopic: 'Pourquoi les cités antiques sont nées près des fleuves',
        },
      },
      askBarPlaceholder: 'Pose n’importe quelle question sur tes devoirs...',
      askButton: 'Demander',
      quickPromptsTitle: 'Essaie de poser :',
      quickPrompts: [
        { text: 'Comment additionner deux fractions de dénominateurs différents ?', subject: 'Maths' },
        { text: 'Pourquoi la mer est-elle bleue alors que l’eau est transparente ?', subject: 'Science' },
        { text: 'Quelle est la différence entre un adverbe et un adjectif ?', subject: 'English' },
        { text: 'Pourquoi les Égyptiens construisaient-ils des pyramides ?', subject: 'Social Studies' },
      ],
      miniCheckBannerTitle: 'Prêt pour un petit quiz de 2 minutes ?',
      miniCheckBannerDesc: 'Des questions rapides et bienveillantes pour valider tes connaissances !',
      miniCheckBannerBtn: 'Faire un Mini Check',
    },
    chat: {
      headerTitle: 'Study Buddy',
      switchTopic: 'Changer de matière',
      learningStyleTag: 'Style',
      actionButtons: {
        hint: '💡 Indice',
        example: '🔍 Voir un exemple',
        anotherWay: '🔄 Expliquer autrement',
        gotIt: '🎉 J’ai compris !',
      },
      inputPlaceholder: 'Écris ta question ou ton idée ici...',
      micTooltip: 'Parler au micro',
      micListening: 'Écoute en cours... parle distinctement',
      sendTooltip: 'Envoyer la question',
      textSizeTooltip: 'Taille du texte',
      ttsTooltip: 'Écouter la voix de Study Buddy',
      buddyThinking: 'Study Buddy prépare le meilleur indice pour toi...',
      takeMiniCheckPrompt: 'Super travail ! Tu as tout compris. Envie d’un petit Mini Check en 2 questions ?',
      startMiniCheckBtn: 'Lancer le Mini Check ✨',
      emptyChatPrompt: 'Pose ta question ! Je ne donnerai pas la réponse toute cuite : je vais te guider pas à pas pour que tu réussisses par toi-même !',
    },
    miniCheck: {
      title: 'Mini Check du Sujet',
      questionOf: (current, total) => `Question ${current} sur ${total}`,
      checkAnswer: 'Vérifier la réponse',
      nextQuestion: 'Question suivante →',
      finishQuiz: 'Voir mes résultats 🏆',
      retryQuiz: 'Refaire un essai',
      backToChat: 'Retour au Chat',
      adaptiveTag: 'S’adapte à ton rythme',
      congratsTitle: 'Bravo champion !',
      congratsSubtitle: 'Tu as fait preuve d’une excellente réflexion.',
      scoreText: (score, total) => `Tu as réussi ${score} question(s) sur ${total} !`,
    },
    languages: {
      en: 'English',
      hi: 'हिन्दी',
      es: 'Español',
      fr: 'Français',
    },
    styles: {
      visual: {
        title: 'See it (Visuel)',
        subtitle: 'Schémas et images mentales',
        icon: '🎨',
      },
      story: {
        title: 'Story (Histoire)',
        subtitle: 'Aventures et métaphores réelles',
        icon: '📖',
      },
      step_by_step: {
        title: 'Step by step (Pas à pas)',
        subtitle: 'Étapes simples et ordonnées',
        icon: '🔢',
      },
    },
  },
};
