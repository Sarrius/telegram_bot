// Simple atmosphere enhancer without external dependencies

export interface AtmosphereConfig {
  quietPeriodThresholdMs: number;
  enableAutomaticEngagement: boolean;
  enableRoleAssignment: boolean;
  enablePolls: boolean;
  enableFunFacts: boolean;
  maxEngagementPerHour: number;
  primaryLanguage: 'uk' | 'en';
}

export interface ChatActivity {
  chatId: string;
  lastMessageTime: number;
  messageCount: number;
  activeUsers: Set<string>;
  recentTopics: string[];
  mood: 'positive' | 'negative' | 'neutral' | 'mixed';
  engagementScore: number;
  language: 'uk' | 'en' | 'mixed';
}

export interface UserRole {
  userId: string;
  role: string;
  assignedAt: number;
  messageCount: number;
  characteristics: string[];
}

export interface EngagementAction {
  type: 'joke' | 'fact' | 'poll' | 'praise' | 'tease' | 'game' | 'topic_suggestion';
  content: string;
  pollOptions?: string[];
  targetUserId?: string;
  priority: number;
  language: 'uk' | 'en';
}

export class AtmosphereEnhancer {
  private config: AtmosphereConfig;
  private chatActivities: Map<string, ChatActivity> = new Map();
  private userRoles: Map<string, UserRole> = new Map();
  private lastEngagementTime: Map<string, number> = new Map();
  private engagementCounts: Map<string, number> = new Map();
  // Removed cron jobs for simplicity

  // Ukrainian fun facts
  private readonly ukrainianFunFacts: string[] = [
    "Чи знали ви, що у восьминогів три серця? 🐙 Хто восьминіг цього чату, га?",
    "Група фламінго називається 'флембойянс'! 🦩 Це ж просто епічно, мать його!",
    "Мед ніколи не псується! Деякий мед з єгипетських гробниць має понад 3000 років! 🍯 Оце так, вічний кайф!",
    "Одна хмара може важити більше мільйона фунтів! ☁️ Мозок вибухнув, як граната!",
    "Метелики куштують ногами! 🦋 Уявіть, як жерти піцу пальцями ніг — жесть!",
    "Найдовше слово, яке можна набрати лівою рукою — 'стюардеса'! ⌨️ Хто тут клавіатурний ніндзя?",
    "Можливих ігор у шахи більше, ніж атомів у видимому всесвіті! ♟️ Шах і мат, космосе!",
    "Серце креветки в голові! 🦐 Оце так локація, прямо в центрі тусовки!",
    "Банани — ягоди, а полуниці — ні! 🍌🍓 Природа, ти що, п’яна?",
    "Ви не можете гудіти, тримаючи ніс! 👃 Спробуй, все одно облажаєшся!",
    "Кити співають пісні, які чути за сотні кілометрів! 🐳 Оце вокал, братан!",
    "Слони ніколи не забувають, де припаркували хобот! 🐘 Пам’ять — залізобетон!",
    "Крокодили плачуть, коли жеруть здобич! 🐊 Сльози, але не від жалю, повір!",
    "Черепахи можуть дихати дупою! 🐢 Оце так лайфхак від природи!",
    "У пінгвінів є коліна, але вони ховають їх як бос! 🐧 Стильно і таємниче!",
    "Морські зірки можуть виростити нову руку! ⭐ Супергерої без плащів, мать їх!",
    "Кішки сплять 70% свого життя! 😺 Королі ледачого вайбу!",
    "Ворона розумніша за деяких людей, яких я знаю! 🦜 Без образ, але факт!",
    "Світлячки світяться, щоб тусити вночі! ✨ Натуральний рейв у лісі!",
    "Бджоли танцюють, щоб сказати, де мед! 🐝 Танці з зірками, але краще!",
    "Кенгуру не може стрибати назад! 🦘 Тільки вперед, як справжній бос!",
    "Павуки можуть ткати павутину міцнішу за сталь! 🕷️ Спайдермен відпочиває!",
    "Дельфіни називають один одного по іменах! 🐬 Оце тусовка з іменними бейджами!",
    "Коров’яче молоко може бути різного кольору залежно від трави! 🐄 Хіпі-корови, ви серйозно?",
    "Мурашки можуть піднімати в 50 разів більше за свою вагу! 🐜 Бодібілдери природи!",
    "Коали сплять 22 години на добу! 🐨 Легенди прокрастинації!",
    "Акули відчувають кров у воді за кілометри! 🦈 Детективи океану, мать їх!",
    "Лемури влаштовують вечірки з запахами! 🦝 Ароматний вайб, розумієш?",
    "Кальмари можуть змінювати колір, як хамелеони! 🦑 Майстри камуфляжу!",
    "Жирафи сплять лише 2 години на добу! 🦒 Хто встигає жити так мало?",
    "Кішки можуть робити звуки, які чути за сотні кілометрів! 🐱 Оце вокал, братан!",
    "Слони можуть розпізнавати людей за запахом! 🐘 Пам'ять — залізобетон!",
    "Крокодили плачуть, коли жеруть здобич! 🐊 Сльози, але не від жалю, повір!",
    "Черепахи можуть дихати дупою! 🐢 Оце так лайфхак від природи!",
    "У пінгвінів є коліна, але вони ховають їх як бос! 🐧 Стильно і таємниче!",
    "Морські зірки можуть виростити нову руку! ⭐ Супергерої без плащів, мать їх!",
    "Кішки сплять 70% свого життя! 😺 Королі ледачого вайбу!",
    "Ворона розумніша за деяких людей, яких я знаю! 🦜 Без образ, але факт!",
    "Світлячки світяться, щоб тусити вночі! ✨ Натуральний рейв у лісі!",
    "Бджоли танцюють, щоб сказати, де мед! 🐝 Танці з зірками, але краще!",
    
  ];

  private readonly funFacts: string[] = [
    "Did you know octopuses have three hearts? 🐙 Who's the octopus of this chat?",
    "A group of flamingos is called a 'flamboyance'! 🦩 How fabulous is that?",
    "Honey never spoils! Some honey found in Egyptian tombs is over 3000 years old! 🍯",
    "A single cloud can weigh more than a million pounds! ☁️ Mind = blown!",
    "Butterflies taste with their feet! 🦋 Imagine tasting pizza with your toes!",
    "The longest word you can type with just your left hand is 'stewardesses'! ⌨️",
    "There are more possible games of chess than atoms in the observable universe! ♟️",
    "A shrimp's heart is in its head! 🦐 Location, location, location!",
    "Bananas are berries, but strawberries aren't! 🍌🍓 Nature's weird like that!",
    "You can't hum while holding your nose! 👃 Don't try it... okay, you tried it!"
  ];

  // Ukrainian jokes
  private readonly ukrainianJokes: string[] = [
    
      "Чому вчені не довіряють атомам? Бо вони все вигадують! ⚛️ Оце так підстава, братан!",
      "Я сказав дружині, що вона малює брови занадто високо. Вона здивувалась! 😮 Епічний фейл, як у маршрутці!",
      "Чому опудало виграло нагороду? Воно видатно стояло у своєму полі! 🌾 Король городу, мать його!",
      "Що найкраще у Швейцарії? Не знаю, але прапор — великий плюс! 🇨🇭 Ха, влучив, як борщ у тарілку!",
      "Чому яйця не розповідають жарти? Вони б розкололи один одного! 🥚 Тріснули б від ржаки!",
      "Як називається ведмідь без зубів? Желейний ведмідь! 🐻 Солодкий пацан, як твій сусід!",
      "Чому книга з математики виглядала сумною? У неї було забагато проблем! 📚 Життя — суцільний прикол!",
      "Що помаранчеве і звучить як папуга? Морква! 🥕 Оце поворот, як у серіалі!",
      "Чому скелети не б'ються один з одним? У них немає сміливості! 💀 Без яєць, без бою, братишка!",
      "Як називається динозавр, що розбив машину? Тираннозавр Рекс! 🦕 Водила-невдаха, як я в пробці!",
      "Чому комп пішов у відпустку? Бо він перегрівся від твого кодингу! 💻 Пора на шашлики!",
      "Чому борщ такий крутий? Бо без нього життя — не життя! 🥄 Сметана врятує світ!",
      "Чому сало не ходить у спортзал? Воно і так ідеальне, мать його! 🥓 Фітнес для лохів!",
      "Чому маршрутка завжди повна? Бо вона магніт для тусовки! 🚌 Хаос на колесах, як у мене в голові!",
      "Чому кіт сидить на клавіатурі? Бо він хакер, а ти — ні! 😺 Лапки кодять, братишка!",
      "Чому кава завжди втомлена? Її весь час мелють, як мої нерви! ☕ Життя — суцільна турка!",
      "Чому вареники не співають? Бо вони зайняті смакотою! 🥟 Жри і мовчи, кайф же!",
      "Чому пінгвін пішов у бар? Щоб бути найкрутішим на тусі! 🐧 Льодовий король!",
      "Чому Wi-Fi такий слабкий? Бо він боїться стін, як я босса! 📶 Сигнал, де ти, блін?",
      "Чому кіт не любить воду? Бо він не риба, а цар, мать його! 😿 Сухий вайб forever!",
      "Чому телефон завжди зайнятий? Бо він тусить у Вайбері! 📱 Король чатів, як я!",
      "Чому павук такий крутий? Бо він плете мережу краще, ніж твій провайдер! 🕸️ Інтернет-бос!",
      "Чому корова не співає? Бо вона дає молоко, а не ноти! 🐄 Музичний фейл, як мій спів!",
      "Чому дельфін такий розумний? Бо він плаває з мозком, а ти в пробці! 🐬 Океанський геній!",
      "Чому яєчня не жартує? Бо вона смажиться від сорому! 🍳 Гарячий фейл, як мої плани!",
      "Чому картопля фрі така крута? Бо вона хрустить, як мої нерви на дедлайні! 🍟 Королева смаку!",
      "Чому місяць світить? Бо хоче бути зіркою, як я в караоке! 🌙 Космічний вайб!",
      "Чому голубці такі складні? Бо їх крутити — це як код без багів! 🥬 Кухонний квест!",
      "Чому сусід свердлить о 7 ранку? Бо він хоче, щоб я встав раніше! 🔧 Сусідський тролінг!",
      "Чому борщ без сметани? Це як тусовка без музики! 🥄 Життя без кайфу!",
      "Чому кодер не пішов на вечірку? Бо він дебагав свою самооцінку! 💻 Любовний баг!",
      "Чому огірок такий холодний? Бо він тільки з холодильника, як твій бос! 🥒 Кул вайб!",
      "Чому трактор не співає? Бо він оре, а не тусить! 🚜 Польовий бос!",
      "Чому котлета така смачна? Бо вона знає, як підкупити твій шлунок! 🍔 Кухонний маг!",
      "Чому маршрутка гальмує? Бо вона хоче, щоб ти оцінив пейзаж! 🚌 Життя — пригода!",
      "Чому борода в моді? Бо вона робить тебе босом без слів! 🧔 Стиль на максимум!",
      "Чому кабачок не танцює? Бо він зайнятий ролями в рагу! 🥒 Кухонний актор!",
      "Чому пиріг такий гарячий? Бо він щойно з тусовки в духовці! 🥧 Пекельний вайб!",
      "Чому шашлик такий крутий? Бо він смажиться з пафосом! 🍖 Король мангалу!",
      "Чому телевізор не спить? Бо він дивиться серіали замість тебе! 📺 Нічний тусовщик!",
      "Чому деруни такі смачні? Бо вони хрустять, як мої мрії! 🥔 Кайф на тарілці!",
      "Чому комп глючить? Бо він хоче, щоб ти пішов на пиво! 💻 Технічний бунт!",
      "Чому кіт дивиться в холодильник? Бо він шукає сало, як справжній українець! 😺 Жри, братишка!",
      "Чому борщ такий червоний? Бо він знає, як бути зіркою на столі! 🥄 Кухонний король!",
      "Чому маршрутка скрипить? Бо вона співає гімн свободі! 🚌 Вайб на колесах!",
      "Чому огірок не співає? Бо він хрустить краще, ніж ти в караоке! 🥒 Хрусткий талант!",
      "Чому пельмені не жартують? Бо вони зайняті плаванням у каструлі! 🥟 Водний вайб!",
      "Чому бабуся така крута? Бо вона готує, як шеф на п’яти зірках! 👵 Кухонна богиня!",
      "Чому пінгвін не літає? Бо він тусить на льоду, як бос! 🐧 Сніговий король!",
      "Чому кіт спить цілий день? Бо він готується до нічної тусовки! 😺 Король дивану!",
      "Чому пиво таке холодне? Бо воно знає, як врятувати твій день! 🍺 Пінний герой!",
      "Чому холодильник гудить? Бо він співає гімн продуктам! 🧊 Кухонний ді-джей!",
      "Чому котлета не втікає? Бо вона знає, що її з’їдять з любов’ю! 🍔 Смачний фатал!",
      "Чому автобус запізнюється? Бо він тусить у пробці, як я на роботі! 🚌 Життя — тусня!",
      "Чому картопля не боїться? Бо вона знає, що стане фрі! 🍟 Безстрашна королева!",
      "Чому кіт краде сосиски? Бо він бос, а ти лише кухар! 😺 М’ясний гангстер!",
      "Чому борщ гарячий? Бо він кипить від пристрасті! 🥄 Любов на тарілці!",
      "Чому телефон глючить? Бо він хоче, щоб ти пішов у реал! 📱 Цифровий бунтар!",
      "Чому голубці не танцюють? Бо вони зайняті смакотою! 🥬 Кухонні королі!",
      "Чому сусід співає о 2 ночі? Бо він думає, що він зірка! 🎤 Караоке-невдаха!",
      "Чому кава не спить? Бо вона тусить у твоїй чашці! ☕ Нічний вайб!",
      "Чому павутина міцна? Бо павук — інженер, а не кодер, як ти! 🕸️ Будівельний геній!",
      "Чому трактор гудить? Бо він хоче, щоб ти оцінив його пафос! 🚜 Польовий король!",
      "Чому котлета кругла? Бо вона не хоче бути квадратною, як твій код! 🍔 Стильна смакота!",
      "Чому маршрутка пахне? Бо вона везе весь вайб України! 🚌 Аромат пригод!",
      "Чому сало таке смачне? Бо воно — душа української тусовки! 🥓 Кайф на хлібі!",
      "Чому комп’ютер завис? Бо він побачив твій код і впав у кому! 💻 Технічна драма!",
      "Чому борщ із пампушками? Бо без них — це просто суп, а не життя! 🥄 Сметанний вайб!",
      "Чому кіт дивиться в очі? Бо він знає, що ти даси йому їжу! 😺 Гіпноз лапками!",
      "Чому огірок хрустить? Бо він тренувався в холодильнику! 🥒 Хрусткий фітнес!",
      "Чому пиріг пухкий? Бо він знає, як бути зіркою столу! 🥧 Пекарський бос!",
      "Чому телевізор глючить? Бо він хоче, щоб ти пішов на пиво! 📺 Технічний страйк!",
      "Чому вареники з сиром? Бо вони знають, як розбити твоє серце! 🥟 Смачний роман!",
      "Чому маршрутка гальмує різко? Бо водій — король драми! 🚌 Життя — театр!",
      "Чому сало не тане? Бо воно міцніше за твої нерви! 🥓 Український діамант!",
      "Чому кодер п’є каву? Бо без неї код — це просто букви! ☕ Програмний допінг!",
      "Чому котлета шипить? Бо вона готується до слави на сковорідці! 🍔 Гарячий вайб!",
      "Чому холодильник повний? Бо він знає, що ти любиш тусити з їжею! 🧊 Кухонна тусня!",
      "Чому борщ булькає? Бо він співає гімн смаку! 🥄 Кухонний рок-н-рол!",
      "Чому кіт краде рибу? Бо він гангстер кухні, а ти — лох! 😺 М’ясний бос!",
      "Чому маршрутка торохтить? Бо вона везе весь вайб на базар! 🚌 Польовий рейв!",
      "Чому пиво піниться? Бо воно хоче бути зіркою вечірки! 🍺 Пінний король!",
      "Чому голубці пахнуть? Бо вони готуються до кулінарного Оскара! 🥬 Смачний блокбастер!",
      "Чому комп’ютер співає? Бо він глючить у ритмі техно! 💻 Цифровий ді-джей!",
      "Чому сало на хлібі? Бо це комбо для справжніх босів! 🥓 Хлібний вайб!",
      "Чому кіт спить на ноуті? Бо він гріє твій код, як справжній бро! 😺 Технічний кайф!",
      "Чому борщ із буряком? Бо без нього — це не борщ, а фейл! 🥄 Червоний король!",
      "Чому маршрутка гудить? Бо вона хоче, щоб ти оцінив її стиль! 🚌 Дорожній пафос!",
      "Чому котлета гаряча? Бо вона щойно з тусовки на сковорідці! 🍔 Пекельна зірка!",
      "Чому комп глючить у п’ятницю? Бо він знає, що пора на пиво! 💻 Тиждень закрито!",
      "Чому сало не боїться холоду? Бо воно — український супергерой! 🥓 Зимовий вайб!",
      "Чому борщ із часником? Бо він знає, як додати перцю в життя! 🥄 Пряний король!",
      "Чому кіт дивиться в стелю? Бо він бачить тусовку в іншій галактиці! 😺 Космічний вайб!",
      "Чому маршрутка летить? Бо водій думає, що він у Форсажі! 🚌 Дорожній Він Дізель!",
      "Чому пиріг із вишнями? Бо він знає, як бути солодким босом! 🥧 Фруктовий вайб!",
      "Чому комп’ютер гріється? Бо він тусить на повну, як ти в п’ятницю! 💻 Техно-рейв!",
      "Чому сало — це любов? Бо воно гріє душу краще за обійми! 🥓 Український роман!",
      "Чому борщ із пампушками? Бо це комбо для справжніх козаків! 🥄 Сметанний пафос!",
      "Чому пиріг не співає? Бо він зайнятий хрустом, як твій план на п’ятницю! 🥧 Смачний вайб!",
  "Чому кіт сидить на телевізорі? Бо він хоче бути зіркою екрану! 😺 Котячий Оскар!",
  "Чому борщ такий гарячий? Бо він кипить від слави! 🥄 Король кухні, мать його!",
  "Чому маршрутка гальмує? Бо водій тусить у стилі Форсаж! 🚌 Дорожній пафос!",
  "Чому сало не худне? Бо воно і так ідеал, блін! 🥓 Український діамант!",
  "Чому кодер не спить? Бо він дебагує свої мрії! 💻 Нічний багхантер!",
  "Чому котлета така кругла? Бо вона крутиться на сковорідці, як ти на тусі! 🍔 Гарячий вайб!",
  "Чому комп глючить? Бо він хоче, щоб ти пішов на шашлики! 💻 Технічний страйк!",
  "Чому вареники плавають? Бо вони королі каструлі! 🥟 Водний тусовщик!",
  "Чому кіт краде ковбасу? Бо він гангстер кухні, а ти — просто кухар! 😺 М’ясний бос!",
  "Чому борщ із буряком? Бо без нього — це просто вода з капустою! 🥄 Червоний король!",
  "Чому маршрутка торохтить? Бо вона співає гімн свободі! 🚌 Вайб на колесах!",
  "Чому огірок хрустить? Бо він тренувався в холодильнику! 🥒 Хрусткий чемпіон!",
  "Чому пиво піниться? Бо воно хоче бути зіркою вечірки! 🍺 Пінний король!",
  "Чому голубці пахнуть? Бо вони готуються до кулінарного Оскара! 🥬 Смачний блокбастер!",
  "Чому комп’ютер співає? Бо він глючить у ритмі техно! 💻 Цифровий ді-джей!",
  "Чому сало на хлібі? Бо це комбо для справжніх босів! 🥓 Хлібний вайб!",
  "Чому кіт спить на ноуті? Бо він гріє твій код, як справжній бро! 😺 Технічний кайф!",
  "Чому борщ із пампушками? Бо це комбо для справжніх козаків! 🥄 Сметанний пафос!",
  "Чому маршрутка летить? Бо водій думає, що він у Голлівуді! 🚌 Дорожній Він Дізель!",
  "Чому пиріг із вишнями? Бо він знає, як бути солодким босом! 🥧 Фруктовий вайб!",
  "Чому комп’ютер гріється? Бо він тусить на повну, як ти в п’ятницю! 💻 Техно-рейв!",
  "Чому сало — це любов? Бо воно гріє душу краще за обійми! 🥓 Український роман!",
  "Чому кіт дивиться в стелю? Бо він бачить тусовку в іншій галактиці! 😺 Космічний вайб!",
  "Чому котлета шипить? Бо вона готується до слави на сковорідці! 🍔 Пекельна зірка!",
  "Чому комп глючить у п’ятницю? Бо він знає, що пора на пиво! 💻 Тиждень закрито!",
  "Чому сало не боїться холоду? Бо воно — український супергерой! 🥓 Зимовий вайб!",
  "Чому борщ із часником? Бо він знає, як додати перцю в життя! 🥄 Пряний король!",
  "Чому кіт краде рибу? Бо він гангстер кухні, а ти — лох! 😺 М’ясний бос!",
  "Чому маршрутка пахне? Бо вона везе весь вайб України! 🚌 Аромат пригод!",
  "Чому огірок не співає? Бо він хрустить краще, ніж ти в караоке! 🥒 Хрусткий талант!",
  "Чому пельмені не жартують? Бо вони зайняті плаванням у каструлі! 🥟 Водний вайб!",
  "Чому бабуся така крута? Бо вона готує, як шеф на п’яти зірках! 👵 Кухонна богиня!",
  "Чому пінгвін не літає? Бо він тусить на льоду, як бос! 🐧 Сніговий король!",
  "Чому кіт спить цілий день? Бо він готується до нічної тусовки! 😺 Король дивану!",
  "Чому пиво таке холодне? Бо воно знає, як врятувати твій день! 🍺 Пінний герой!",
  "Чому холодильник гудить? Бо він співає гімн продуктам! 🧊 Кухонний ді-джей!",
  "Чому котлета не втікає? Бо вона знає, що її з’їдять з любов’ю! 🍔 Смачний фатал!",
  "Чому автобус запізнюється? Бо він тусить у пробці, як я на роботі! 🚌 Життя — тусня!",
  "Чому картопля не боїться? Бо вона знає, що стане фрі! 🍟 Безстрашна королева!",
  "Чому кіт краде сосиски? Бо він бос, а ти лише кухар! 😺 М’ясний гангстер!",
  "Чому борщ гарячий? Бо він кипить від пристрасті! 🥄 Любов на тарілці!",
  "Чому телефон глючить? Бо він хоче, щоб ти пішов у реал! 📱 Цифровий бунтар!",
  "Чому голубці не танцюють? Бо вони зайняті смакотою! 🥬 Кухонні королі!",
  "Чому сусід співає о 2 ночі? Бо він думає, що він зірка! 🎤 Караоке-невдаха!",
  "Чому кава не спить? Бо вона тусить у твоїй чашці! ☕ Нічний вайб!",
  "Чому павутина міцна? Бо павук — інженер, а не кодер, як ти! 🕸️ Будівельний геній!",
  "Чому трактор гудить? Бо він хоче, щоб ти оцінив його пафос! 🚜 Польовий король!",
  "Чому котлета кругла? Бо вона не хоче бути квадратною, як твій код! 🍔 Стильна смакота!",
  "Чому сало не тане? Бо воно міцніше за твої нерви! 🥓 Український діамант!",
  "Чому комп’ютер завис? Бо він побачив твій код і впав у кому! 💻 Технічна драма!",
  "Чому борщ без сметани? Це як тусовка без музики! 🥄 Життя без кайфу!",
  "Чому кіт дивиться в очі? Бо він знає, що ти даси йому їжу! 😺 Гіпноз лапками!",
  "Чому огірок хрустить? Бо він тренувався в холодильнику! 🥒 Хрусткий фітнес!",
  "Чому пиріг пухкий? Бо він знає, як бути зіркою столу! 🥧 Пекарський бос!",
  "Чому телевізор глючить? Бо він хоче, щоб ти пішов на пиво! 📺 Технічний страйк!",
  "Чому вареники з сиром? Бо вони знають, як розбити твоє серце! 🥟 Смачний роман!",
  "Чому маршрутка гальмує різко? Бо водій — король драми! 🚌 Життя — театр!",
  "Чому кодер п’є каву? Бо без неї код — це просто букви! ☕ Програмний допінг!",
  "Чому котлета шипить? Бо вона готується до слави на сковорідці! 🍔 Пекельна зірка!",
  "Чому холодильник повний? Бо він знає, що ти любиш тусити з їжею! 🧊 Кухонна тусня!",
  "Чому борщ булькає? Бо він співає гімн смаку! 🥄 Кухонний рок-н-рол!",
  "Чому кіт краде рибу? Бо він гангстер кухні, а ти — лох! 😺 М’ясний бос!",
  "Чому маршрутка торохтить? Бо вона везе весь вайб на базар! 🚌 Польовий рейв!",
  "Чому пиво піниться? Бо воно хоче бути зіркою вечірки! 🍺 Пінний король!",
  "Чому голубці пахнуть? Бо вони готуються до кулінарного Оскара! 🥬 Смачний блокбастер!",
  "Чому комп’ютер співає? Бо він глючить у ритмі техно! 💻 Цифровий ді-джей!",
  "Чому сало на хлібі? Бо це комбо для справжніх босів! 🥓 Хлібний вайб!",
  "Чому кіт спить на ноуті? Бо він гріє твій код, як справжній бро! 😺 Технічний кайф!",
  "Чому борщ із пампушками? Бо це комбо для справжніх козаків! 🥄 Сметанний пафос!",
  "Чому маршрутка летить? Бо водій думає, що він у Форсажі! 🚌 Дорожній Він Дізель!",
  "Чому пиріг із вишнями? Бо він знає, як бути солодким босом! 🥧 Фруктовий вайб!",
  "Чому комп’ютер гріється? Бо він тусить на повну, як ти в п’ятницю! 💻 Техно-рейв!",
  "Чому сало — це любов? Бо воно гріє душу краще за обійми! 🥓 Український роман!",
  "Чому кіт дивиться в стелю? Бо він бачить тусовку в іншій галактиці! 😺 Космічний вайб!",
  "Чому котлета шипить? Бо вона готується до слави на сковорідці! 🍔 Пекельна зірка!",
  "Чому комп глючить у п’ятницю? Бо він знає, що пора на пиво! 💻 Тиждень закрито!",
  "Чому сало не боїться холоду? Бо воно — український супергерой! 🥓 Зимовий вайб!",
  "Чому борщ із часником? Бо він знає, як додати перцю в життя! 🥄 Пряний король!",
  "Чому кіт краде рибу? Бо він гангстер кухні, а ти — лох! 😺 М’ясний бос!",
  "Чому маршрутка пахне? Бо вона везе весь вайб України! 🚌 Аромат пригод!",
  "Чому огірок не співає? Бо він хрустить краще, ніж ти в караоке! 🥒 Хрусткий талант!",
  "Чому пельмені не жартують? Бо вони зайняті плаванням у каструлі! 🥟 Водний вайб!",
  "Чому бабуся така крута? Бо вона готує, як шеф на п’яти зірках! 👵 Кухонна богиня!",
  "Чому пінгвін не літає? Бо він тусить на льоду, як бос! 🐧 Сніговий король!",
  "Чому кіт спить цілий день? Бо він готується до нічної тусовки! 😺 Король дивану!",
  "Чому пиво таке холодне? Бо воно знає, як врятувати твій день! 🍺 Пінний герой!",
  "Чому холодильник гудить? Бо він співає гімн продуктам! 🧊 Кухонний ді-джей!",
  "Чому котлета не втікає? Бо вона знає, що її з’їдять з любов’ю! 🍔 Смачний фатал!",
  "Чому автобус запізнюється? Бо він тусить у пробці, як я на роботі! 🚌 Життя — тусня!",
  "Чому картопля не боїться? Бо вона знає, що стане фрі! 🍟 Безстрашна королева!",
  "Чому кіт краде сосиски? Бо він бос, а ти лише кухар! 😺 М’ясний гангстер!",
  "Чому борщ гарячий? Бо він кипить від пристрасті! 🥄 Любов на тарілці!",
  "Чому телефон глючить? Бо він хоче, щоб ти пішов у реал! 📱 Цифровий бунтар!",
  "Чому голубці не танцюють? Бо вони зайняті смакотою! 🥬 Кухонні королі!",
  "Чому сусід співає о 2 ночі? Бо він думає, що він зірка! 🎤 Караоке-невдаха!",
  "Чому кава не спить? Бо вона тусить у твоїй чашці! ☕ Нічний вайб!",
  "Чому павутина міцна? Бо павук — інженер, а не кодер, як ти! 🕸️ Будівельний геній!",
  "Чому трактор гудить? Бо він хоче, щоб ти оцінив його пафос! 🚜 Польовий король!",
  "Чому котлета кругла? Бо вона не хоче бути квадратною, як твій код! 🍔 Стильна смакота!",
    
  ];

  private readonly jokes: string[] = [
    "Why don't scientists trust atoms? Because they make up everything! ⚛️",
    "I told my wife she was drawing her eyebrows too high. She looked surprised! 😮",
    "Why did the scarecrow win an award? He was outstanding in his field! 🌾",
    "What's the best thing about Switzerland? I don't know, but the flag is a big plus! 🇨🇭",
    "Why don't eggs tell jokes? They'd crack each other up! 🥚",
    "What do you call a bear with no teeth? A gummy bear! 🐻",
    "Why did the math book look so sad? Because it had too many problems! 📚",
    "What's orange and sounds like a parrot? A carrot! 🥕",
    "Why don't skeletons fight each other? They don't have the guts! 💀",
    "What do you call a dinosaur that crashes his car? Tyrannosaurus Wrecks! 🦕"
  ];

  // Ukrainian user roles
  private readonly ukrainianUserRoleTypes: { [key: string]: string[] } = {
    "Мем Лорд": ["постить смішний контент", "піднімає настрій", "майстер гумору"],
    "Чат Мудрець": ["дає мудрі поради", "філософські думки", "голос розуму"],
    "Енерджайзер": ["приносить високу енергію", "мотивує інших", "позитивні вібрації"],
    "Тихий Ніндзя": ["спостерігає тихо", "вдаряє в ідеальний момент", "загадкова присутність"],
    "Стартер Тем": ["ініціює дискусії", "задає гарні питання", "каталізатор розмов"],
    "Емодзі Майстер": ["ідеальне використання емодзі", "візуальний комунікатор", "символьний савант"],
    "Оповідач": ["ділиться цікавими історіями", "захоплюючі розповіді", "розважальник"],
    "Тех Гуру": ["знає всі крутці штуки", "вирішує проблеми", "цифрова мудрість"],
    "Фуді Дослідник": ["завжди говорить про їжу", "кулінарні пригоди", "експерт смаку"],
    "Нічна Сова": ["активний пізно вночі", "чемпіон нічної зміни", "приятель безсонних"]
  };

  private readonly userRoleTypes: { [key: string]: string[] } = {
    "Meme Lord": ["posts funny content", "lightens the mood", "master of humor"],
    "Chat Sage": ["gives wise advice", "philosophical thoughts", "voice of reason"],
    "Energy Booster": ["brings high energy", "motivates others", "positive vibes"],
    "Silent Ninja": ["observes quietly", "strikes with perfect timing", "mysterious presence"],
    "Topic Starter": ["initiates discussions", "asks great questions", "conversation catalyst"],
    "Emoji Master": ["perfect emoji usage", "visual communicator", "symbol savant"],
    "Story Teller": ["shares interesting stories", "captivating narratives", "entertainer"],
    "Tech Guru": ["knows all the cool stuff", "solves problems", "digital wisdom"],
    "Foodie Explorer": ["always talking about food", "culinary adventures", "taste expert"],
    "Late Night Owl": ["active during late hours", "night shift champion", "insomniac buddy"]
  };

  constructor(config: Partial<AtmosphereConfig> = {}) {
    this.config = {
      quietPeriodThresholdMs: 10 * 60 * 1000, // 10 minutes
      enableAutomaticEngagement: true,
      enableRoleAssignment: true,
      enablePolls: true,
      enableFunFacts: true,
      maxEngagementPerHour: 3,
      primaryLanguage: 'uk', // Default to Ukrainian
      ...config
    };

    console.log('🇺🇦 Ukrainian Atmosphere Enhancer initialized');
  }

  public updateChatActivity(
    chatId: string,
    userId: string,
    userName: string,
    message: string,
    sentiment: 'positive' | 'negative' | 'neutral'
  ): void {
    const now = Date.now();
    let activity = this.chatActivities.get(chatId);

    if (!activity) {
      activity = {
        chatId,
        lastMessageTime: now,
        messageCount: 0,
        activeUsers: new Set(),
        recentTopics: [],
        mood: 'neutral',
        engagementScore: 0,
        language: this.detectLanguage(message)
      };
      this.chatActivities.set(chatId, activity);
    }

    // Update activity
    activity.lastMessageTime = now;
    activity.messageCount++;
    activity.activeUsers.add(userId);
    activity.language = this.detectLanguage(message);

    // Extract topics from message
    const topics = this.extractTopics(message, activity.language);
    activity.recentTopics = [...activity.recentTopics, ...topics].slice(-10);

    // Update mood
    this.updateChatMood(activity, sentiment);

    // Update user role based on activity
    if (this.config.enableRoleAssignment) {
      this.updateUserRole(userId, userName, message, sentiment, activity.language);
    }

    // Calculate engagement score
    activity.engagementScore = this.calculateEngagementScore(activity);
  }

  private detectLanguage(text: string): 'uk' | 'en' | 'mixed' {
    const lowerText = text.toLowerCase();
    
    // Check for Ukrainian specific characters
    const ukrainianChars = /[іїєґ]/g;
    const ukrainianWords = ['що', 'як', 'коли', 'де', 'чому', 'і', 'в', 'на', 'з'];
    
    const hasUkrainianChars = ukrainianChars.test(lowerText);
    const ukrainianWordCount = ukrainianWords.filter(word => lowerText.includes(word)).length;
    
    if (hasUkrainianChars || ukrainianWordCount >= 1) {
      return 'uk';
    }
    
    // Check for English indicators
    const englishWords = ['the', 'and', 'you', 'are', 'that', 'this', 'with', 'have', 'for', 'not'];
    const englishWordCount = englishWords.filter(word => lowerText.includes(word)).length;
    
    if (englishWordCount >= 1) {
      return 'en';
    }
    
    // Fallback to primary language from config
    return this.config.primaryLanguage;
  }

  public async generateEngagementAction(chatId: string): Promise<EngagementAction | null> {
    const activity = this.chatActivities.get(chatId);
    if (!activity) return null;

    const now = Date.now();
    const timeSinceLastMessage = now - activity.lastMessageTime;
    const lastEngagement = this.lastEngagementTime.get(chatId) || 0;
    const timeSinceLastEngagement = now - lastEngagement;
    const hourlyCount = this.engagementCounts.get(chatId) || 0;

    // Check if we should engage
    if (!this.shouldEngage(timeSinceLastMessage, timeSinceLastEngagement, hourlyCount)) {
      return null;
    }

    // Choose engagement type based on context
    const action = this.selectEngagementAction(activity);
    
    if (action) {
      this.lastEngagementTime.set(chatId, now);
      this.engagementCounts.set(chatId, hourlyCount + 1);
    }

    return action;
  }

  private shouldEngage(
    timeSinceLastMessage: number,
    timeSinceLastEngagement: number,
    hourlyCount: number
  ): boolean {
    if (timeSinceLastMessage < this.config.quietPeriodThresholdMs) {
      return false;
    }

    if (hourlyCount >= this.config.maxEngagementPerHour) {
      return false;
    }

    if (timeSinceLastEngagement < 30 * 60 * 1000) { // 30 minutes
      return false;
    }

    return this.config.enableAutomaticEngagement;
  }

  private selectEngagementAction(activity: ChatActivity): EngagementAction | null {
    const actions: EngagementAction[] = [];
    const language = activity.language === 'mixed' ? 'uk' : activity.language;

    // Add different types of actions based on chat state
    if (activity.engagementScore < 0.3) {
      // Low engagement - need energy boost
      actions.push(
        { type: 'joke', content: this.getRandomJoke(language), priority: 8, language },
        { type: 'fact', content: this.getRandomFunFact(language), priority: 7, language },
        { 
          type: 'game', 
          content: language === 'uk' 
            ? "Хтось готовий до швидкої гри? Вгадайте емодзі: 🏠🔑! Перший, хто вгадає, отримає право хвалитися! 🏆"
            : "Anyone up for a quick game? Guess the emoji: 🏠🔑! First to guess wins bragging rights! 🏆", 
          priority: 6, 
          language 
        }
      );
    }

    if (activity.mood === 'negative') {
      // Negative mood - provide support and positivity
      actions.push(
        { 
          type: 'fact', 
          content: language === 'uk' 
            ? "Ось щось для піднесення настрою: " + this.getRandomFunFact(language)
            : "Here's something to brighten your day: " + this.getRandomFunFact(language), 
          priority: 9, 
          language 
        },
        { 
          type: 'topic_suggestion', 
          content: language === 'uk'
            ? "Давайте поговоримо про щось крутe! Що найкраще сталося з вами цього тижня? ✨"
            : "Let's talk about something awesome! What's the best thing that happened to you this week? ✨", 
          priority: 8, 
          language 
        }
      );
    }

    // Random engagement if nothing specific
    if (actions.length === 0) {
      actions.push(
        { type: 'fact', content: this.getRandomFunFact(language), priority: 5, language },
        { type: 'joke', content: this.getRandomJoke(language), priority: 5, language }
      );
    }

    // Sort by priority and return highest priority action
    actions.sort((a, b) => b.priority - a.priority);
    return actions[0] || null;
  }

  private extractTopics(message: string, language: 'uk' | 'en' | 'mixed'): string[] {
    const lowerMessage = message.toLowerCase();
    const topics: string[] = [];

    const ukrainianTopicKeywords = {
      food: ['їжа', 'їжу', 'їсти', 'голодний', 'ресторан', 'готувати', 'рецепт', 'смачно', 'піца', 'бургер'],
      music: ['музика', 'музику', 'пісня', 'слухати', 'гурт', 'альбом', 'концерт', 'співати'],
      movies: ['фільм', 'кіно', 'дивитися', 'кінотеатр', 'нетфлікс', 'серіал', 'шоу'],
      sports: ['гра', 'грати', 'команда', 'виграти', 'рахунок', 'матч', 'футбол', 'баскетбол'],
      weather: ['погода', 'дощ', 'сонячно', 'холодно', 'жарко', 'сніг', 'хмарно'],
      work: ['робота', 'праця', 'офіс', 'бос', 'зустріч', 'проект', 'дедлайн'],
      travel: ['подорож', 'поїздка', 'відпустка', 'рейс', 'готель', 'відвідати', 'країна']
    };

    const topicKeywords = {
      food: ['eat', 'food', 'hungry', 'restaurant', 'cook', 'recipe', 'delicious', 'pizza', 'burger'],
      music: ['music', 'song', 'listen', 'band', 'album', 'concert', 'singing'],
      movies: ['movie', 'film', 'watch', 'cinema', 'netflix', 'series', 'show'],
      sports: ['game', 'play', 'team', 'win', 'score', 'match', 'football', 'basketball'],
      weather: ['weather', 'rain', 'sunny', 'cold', 'hot', 'snow', 'cloudy'],
      work: ['work', 'job', 'office', 'boss', 'meeting', 'project', 'deadline'],
      travel: ['travel', 'trip', 'vacation', 'flight', 'hotel', 'visit', 'country']
    };

    const keywords = language === 'uk' ? ukrainianTopicKeywords : topicKeywords;

    for (const [topic, words] of Object.entries(keywords)) {
      if (words.some(word => lowerMessage.includes(word))) {
        topics.push(topic);
      }
    }

    return topics;
  }

  private updateChatMood(activity: ChatActivity, sentiment: 'positive' | 'negative' | 'neutral'): void {
    // Simple mood calculation based on recent messages
    if (sentiment === 'positive') {
      activity.mood = 'positive';
    } else if (sentiment === 'negative') {
      activity.mood = 'negative';
    } else {
      activity.mood = 'neutral';
    }
  }

  private updateUserRole(userId: string, userName: string, message: string, sentiment: 'positive' | 'negative' | 'neutral', language: 'uk' | 'en' | 'mixed'): void {
    let userRole = this.userRoles.get(userId);

    if (!userRole) {
      const role = this.assignInitialRole(message, sentiment, language);
      userRole = {
        userId,
        role: role,
        assignedAt: Date.now(),
        messageCount: 1,
        characteristics: this.getUserRoleCharacteristics(role, language)
      };
      this.userRoles.set(userId, userRole);
    } else {
      userRole.messageCount++;
    }
  }

  private getUserRoleCharacteristics(role: string, language: 'uk' | 'en' | 'mixed'): string[] {
    const roleTypes = language === 'uk' ? this.ukrainianUserRoleTypes : this.userRoleTypes;
    return roleTypes[role] || [];
  }

  private assignInitialRole(message: string, sentiment: 'positive' | 'negative' | 'neutral', language: 'uk' | 'en' | 'mixed'): string {
    const lowerMessage = message.toLowerCase();
    const roleAssignments = Object.keys(language === 'uk' ? this.ukrainianUserRoleTypes : this.userRoleTypes);

    // Simple heuristics for initial role assignment
    if (language === 'uk') {
      if (lowerMessage.includes('😂') || lowerMessage.includes('лол') || lowerMessage.includes('смішно')) {
        return "Мем Лорд";
      }
      if (sentiment === 'positive' && (lowerMessage.includes('!') || lowerMessage.includes('круто'))) {
        return "Енерджайзер";
      }
      if (lowerMessage.includes('?') && (lowerMessage.includes('думаєте') || lowerMessage.includes('питання') || lowerMessage.length > 15)) {
        return "Стартер Тем";
      }
      if (lowerMessage.includes('їжа') || lowerMessage.includes('їжу') || lowerMessage.includes('їсти')) {
        return "Фуді Дослідник";
      }
    } else {
      if (lowerMessage.includes('😂') || lowerMessage.includes('lol') || lowerMessage.includes('funny')) {
        return "Meme Lord";
      }
      if (sentiment === 'positive' && (lowerMessage.includes('!') || lowerMessage.includes('awesome'))) {
        return "Energy Booster";
      }
      if (lowerMessage.includes('?') && lowerMessage.length > 20) {
        return "Topic Starter";
      }
      if (lowerMessage.includes('food') || lowerMessage.includes('eat')) {
        return "Foodie Explorer";
      }
    }

    // Random assignment if no clear indicators
    return roleAssignments[Math.floor(Math.random() * roleAssignments.length)];
  }

  private calculateEngagementScore(activity: ChatActivity): number {
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);
    
    let score = 0;
    
    // Active users contribution (0-0.4)
    score += Math.min(activity.activeUsers.size * 0.1, 0.4);
    
    // Recent activity contribution (0-0.3)
    if (activity.lastMessageTime > hourAgo) {
      score += 0.3;
    }
    
    // Mood contribution (0-0.3)
    if (activity.mood === 'positive') {
      score += 0.3;
    } else if (activity.mood === 'neutral') {
      score += 0.15;
    }

    return Math.min(score, 1.0);
  }

  private getRandomJoke(language: 'uk' | 'en'): string {
    const jokes = language === 'uk' ? this.ukrainianJokes : this.jokes;
    return jokes[Math.floor(Math.random() * jokes.length)];
  }

  private getRandomFunFact(language: 'uk' | 'en'): string {
    const facts = language === 'uk' ? this.ukrainianFunFacts : this.funFacts;
    return facts[Math.floor(Math.random() * facts.length)];
  }

  // Periodic cleanup can be handled externally if needed

  // Public methods
  public getChatStats(chatId: string): ChatActivity | null {
    return this.chatActivities.get(chatId) || null;
  }

  public getUserRole(userId: string): UserRole | null {
    return this.userRoles.get(userId) || null;
  }

  public getAllUserRoles(): UserRole[] {
    return Array.from(this.userRoles.values());
  }

  public updateConfig(newConfig: Partial<AtmosphereConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): AtmosphereConfig {
    return { ...this.config };
  }

  public dispose(): void {
    // Simple cleanup without cron
    this.chatActivities.clear();
    this.userRoles.clear();
    this.lastEngagementTime.clear();
    this.engagementCounts.clear();
  }
} 