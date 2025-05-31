"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MemeGenerator = void 0;
const axios_1 = __importDefault(require("axios"));
class MemeGenerator {
    constructor() {
        // Ukrainian text-based meme templates
        this.ukrainianTextMemes = {
            programming: [
                "Коли твій код працює з першого разу:\n{text}",
                "Я пояснюю свій код гумовій качечці:\n{text}",
                "Коли хтось просить полагодити їх комп'ютер:\n{text}",
                "Коли дебаггер показує, що змінна дорівнює null:\n{text}",
                "Пишу код о 3-й ночі:\n{text}",
                "Коли бачу коментар 'TODO: fix later':\n{text}",
                "Після 5 годин дебагінгу:\n{text}",
                "Коли клієнт просить 'зробити швидко':\n{text}",
                "Побачив код без відступів:\n{text}",
                "Коли npm install ламається:\n{text}",
                "Пишу код на JavaScript:\nЯ: {text}\nTypeScript: А ти впевнений?",
                "Коли забув поставити крапку з комою:\n{text}",
                "Коли Stack Overflow рятує твій день:\n{text}",
                "Побачив змінну на 100500 рядків:\n{text}",
                "Коли твій код проходить код-рев'ю:\n{text}",
                "Пишу regex:\nЯ через 5 хвилин: {text}",
                "Коли твій бекенд не синхронізується з фронтендом:\n{text}",
                "Коли клієнт просить 'додати ще одну кнопку':\n{text}",
                "Побачив 'it works on my machine':\n{text}",
                "Коли твій код не працює, але ти його пушнув:\n{text}",
                "Коли пишеш документацію до коду:\n{text}",
                "Коли твій unit test покриває 0.01% коду:\n{text}",
                "Побачив баг у продакшені:\n{text}",
                "Коли твій код рефакторить сеньйор:\n{text}",
                "Пишу код на Python:\nЯ: {text}\nІнтерпретатор: IndentationError",
                "Коли твій API повертає 500:\n{text}",
                "Коли твій merge request має 100500 коментарів:\n{text}",
                "Пишу SQL запит:\nЯ: {text}\nБаза даних: Syntax error",
                "Коли твій код виглядає як суп із букв:\n{text}",
                "Коли забув закомітити зміни:\n{text}",
            ],
            life: [
                "Понеділок вранці такий:\n{text}",
                "Коли хтось каже 'просто будь собою':\n{text}",
                "Я намагаюся бути дорослим:\n{text}",
                "Коли будильник дзвонить о 7 ранку:\n{text}",
                "Я, коли бачу повідомлення 'батарея 1%':\n{text}",
                "Коли мама питає, чи я поїв:\n{text}",
                "Коли забув, де припаркував машину:\n{text}",
                "Я, коли намагаюся економити гроші:\n{text}",
                "Коли бачу повідомлення 'Інтернет відключено':\n{text}",
                "Коли хтось зайняв моє місце в автобусі:\n{text}",
                "Я, коли намагаюся прокинутися без кави:\n{text}",
                "Коли бачу дощ, а парасольки немає:\n{text}",
                "Я, коли намагаюся виглядати серйозно:\n{text}",
                "Коли хтось питає, як справи:\nЯ: {text}\nРеальність: Хаос",
                "Коли забув пароль від Wi-Fi:\n{text}",
                "Коли бачу, що кава закінчилася:\n{text}",
                "Я, коли намагаюся не спізнитися:\n{text}",
                "Коли хтось питає, чому я не сплю:\n{text}",
                "Коли бачу знижки в магазині:\n{text}",
                "Я, коли намагаюся скласти графік на тиждень:\n{text}",
                "Коли випадково відповів 'Ти тоже' на 'Дякую':\n{text}",
                "Коли бачу, що хтось їсть мої чіпси:\n{text}",
                "Я, коли намагаюся бути в тренді:\n{text}",
                "Коли хтось кличе на пробіжку:\n{text}",
                "Коли бачу павука вдома:\n{text}",
                "Я, коли намагаюся не їсти після 18:00:\n{text}",
                "Коли забув, що мав зробити:\n{text}",
                "Коли бачу, що хтось лайкнув мій пост із 2015 року:\n{text}",
                "Я, коли намагаюся виглядати круто в Instagram:\n{text}",
                "Коли будильник не спрацював:\n{text}",
            ],
            food: [
                "Коли хтось питає що на вечерю:\n{text}",
                "Я бачу піцу:\n{text}",
                "Намагаюся харчуватися здорово:\n{text}",
                "Коли бачу свіжоспечений хліб:\n{text}",
                "Коли хтось пропонує поділитися їжею:\n{text}",
                "Я, коли бачу борщ із пампушками:\n{text}",
                "Коли намагаюся відкрити банку огірків:\n{text}",
                "Коли хтось їсть мою шоколадку:\n{text}",
                "Я, коли готую щось нове:\n{text}",
                "Коли бачу, що холодильник порожній:\n{text}",
                "Коли мама готує голубці:\n{text}",
                "Я, коли намагаюся різати цибулю без сліз:\n{text}",
                "Коли бачу суші зі знижкою:\n{text}",
                "Коли хтось каже, що не любить вареники:\n{text}",
                "Я, коли пробую новий рецепт:\n{text}",
                "Коли бачу, що хтось їсть мої котлети:\n{text}",
                "Коли намагаюся зробити ідеальний омлет:\n{text}",
                "Я, коли бачу торт у холодильнику:\n{text}",
                "Коли хтось питає, чи я на дієті:\n{text}",
                "Коли бачу, що хтось з’їв мою порцію морозива:\n{text}",
                "Я, коли намагаюся готувати як шеф-кухар:\n{text}",
                "Коли бачу свіжу випічку в пекарні:\n{text}",
                "Коли хтось пропонує піти в МакДональдз:\n{text}",
                "Я, коли намагаюся їсти салат виделкою:\n{text}",
                "Коли бачу, що картопля фрі закінчилася:\n{text}",
                "Коли хтось питає, чи я вмію готувати:\n{text}",
                "Я, коли бачу домашні пельмені:\n{text}",
                "Коли намагаюся пити гарячу каву:\n{text}",
                "Коли бачу, що хтось залишив крихти на столі:\n{text}",
                "Я, коли пробую гострий соус:\n{text}",
            ],
            work: [
                "Коли нарешті п'ятниця:\n{text}",
                "Я на нарадах:\n{text}",
                "Коли дедлайн завтра:\n{text}",
                "Коли бос питає, чому я запізнився:\n{text}",
                "Я, коли бачу 50 нових листів у пошті:\n{text}",
                "Коли хтось каже 'це займе 5 хвилин':\n{text}",
                "Коли бачу, що принтер знову не працює:\n{text}",
                "Я, коли намагаюся виглядати зайнятим:\n{text}",
                "Коли клієнт змінює вимоги в останній момент:\n{text}",
                "Коли бачу, що кава в офісі закінчилася:\n{text}",
                "Я, коли намагаюся пояснити свою роботу:\n{text}",
                "Коли бос просить зробити презентацію за годину:\n{text}",
                "Коли хтось краде мій обід із холодильника:\n{text}",
                "Я, коли чую 'ми обговоримо це на нараді':\n{text}",
                "Коли бачу, що робочий чат вибухнув повідомленнями:\n{text}",
                "Я, коли намагаюся встигнути до дедлайну:\n{text}",
                "Коли хтось просить 'швидко глянути' на їх роботу:\n{text}",
                "Коли бачу, що Wi-Fi в офісі впав:\n{text}",
                "Я, коли отримую похвалу від боса:\n{text}",
                "Коли хтось питає, чи я закінчив звіт:\n{text}",
                "Я, коли намагаюся не спати на нараді:\n{text}",
                "Коли бачу, що хтось зайняв мою парковку:\n{text}",
                "Я, коли чую 'давай переробимо це ще раз':\n{text}",
                "Коли бачу, що робочий день закінчився:\n{text}",
                "Я, коли намагаюся виглядати продуктивним:\n{text}",
                "Коли хтось питає, чому я ще в офісі:\n{text}",
                "Я, коли бачу новий проєкт у Jira:\n{text}",
                "Коли хтось просить пояснити Excel:\n{text}",
                "Я, коли намагаюся не відповідати на листи після 18:00:\n{text}",
                "Коли бачу, що бос іде до мого столу:\n{text}",
            ],
            general: [
                "Всі: {text}\nЯ: Ну, насправді...",
                "Ніхто:\nАбсолютно ніхто:\nЯ: {text}",
                "Завдання виконано невдало:\n{text}",
                "Коли хтось каже 'ти що, не знаєш?':\n{text}",
                "Я, коли бачу повідомлення 'Терміново':\n{text}",
                "Коли хтось питає, чому я сміюся:\n{text}",
                "Я, коли намагаюся бути ввічливим:\n{text}",
                "Коли бачу, що хтось лайкнув мій твіт:\n{text}",
                "Я, коли чую свою улюблену пісню:\n{text}",
                "Коли хтось просить позичити телефон:\n{text}",
                "Я, коли бачу мем про котів:\n{text}",
                "Коли хтось каже 'це не складно':\n{text}",
                "Я, коли намагаюся виглядати розумним:\n{text}",
                "Коли бачу, що хтось робить селфі:\n{text}",
                "Я, коли чую 'давай по-швидкому':\n{text}",
                "Коли хтось питає, чому я запізнився:\n{text}",
                "Я, коли бачу повідомлення в груповому чаті:\n{text}",
                "Коли хтось просить поділитися мемом:\n{text}",
                "Я, коли намагаюся не реагувати на спойлери:\n{text}",
                "Коли бачу, що хтось поставив лайк моїй історії:\n{text}",
                "Я, коли чую 'ти це бачив?':\n{text}",
                "Коли хтось просить пояснити мем:\n{text}",
                "Я, коли бачу повідомлення від бота:\n{text}",
                "Коли хтось каже 'ти занадто багато думаєш':\n{text}",
                "Я, коли намагаюся не лайкати власний пост:\n{text}",
                "Коли бачу, що хтось репостнув мій мем:\n{text}",
                "Я, коли чую 'давай без жартів':\n{text}",
                "Коли хтось просить скинути фотку:\n{text}",
                "Я, коли бачу новий тренд у TikTok:\n{text}",
                "Коли хтось питає, чому я не в настрої:\n{text}",
            ],
            ukrainian: [
                "Коли готуєш борщ:\n{text}",
                "Бачиш українську прапор:\n{text} 🇺🇦",
                "Пояснюєш іноземцям про Україну:\n{text}",
                "Коли хтось плутає Україну з Росією:\n{text}",
                "Коли чуєш 'Слава Україні!':\n{text}",
                "Я, коли бачу вишиванку:\n{text}",
                "Коли готую вареники з картоплею:\n{text}",
                "Коли хтось питає, що таке сало:\n{text}",
                "Я, коли чую 'Ой у лузі червона калина':\n{text}",
                "Коли бачу кота в українському стилі:\n{text}",
                "Коли хтось не знає, хто такий Шевченко:\n{text}",
                "Я, коли п’ю узвар на Різдво:\n{text}",
                "Коли бачу українські пейзажі:\n{text}",
                "Коли хтось питає, чи я з Києва:\n{text}",
                "Я, коли танцюю гопак:\n{text}",
                "Коли бачу, що хтось їсть борщ ложкою:\n{text}",
                "Коли хтось каже, що не любить голубці:\n{text}",
                "Я, коли чую український гімн:\n{text}",
                "Коли бачу, що хтось погано вимовляє 'паляниця':\n{text}",
                "Коли хтось питає, що таке кутя:\n{text}",
                "Я, коли бачу український гумор:\n{text}",
                "Коли хтось не знає, що таке 'Запорізька Січ':\n{text}",
                "Я, коли готую деруни:\n{text}",
                "Коли бачу український орнамент:\n{text}",
                "Коли хтось питає, чому я люблю сало:\n{text}",
                "Я, коли чую український акцент:\n{text}",
                "Коли бачу, що хтось плутає борщ із супом:\n{text}",
                "Коли хтось питає, чи я знаю Зеленського:\n{text}",
                "Я, коли бачу український мем:\n{text}",
                "Коли хтось не розуміє, що таке 'День Незалежності':\n{text}",
            ]
        };
        this.textMemeTemplates = {
            programming: [
                "When your code works on the first try:\n{text}",
                "Me explaining my code to rubber duck:\n{text}",
                "When someone asks me to fix their computer:\n{text}",
                "When the debugger says the variable is undefined:\n{text}",
                "Coding at 3 AM:\n{text}",
                "When I see a 'TODO: fix later' comment:\n{text}",
                "After 5 hours of debugging:\n{text}",
                "When the client says 'make it quick':\n{text}",
                "Seeing code without proper indentation:\n{text}",
                "When npm install breaks everything:\n{text}",
                "Writing JavaScript:\nMe: {text}\nTypeScript: Are you sure?",
                "When I forget a semicolon:\n{text}",
                "When Stack Overflow saves my day:\n{text}",
                "Seeing a 100500-line variable name:\n{text}",
                "When my code passes code review:\n{text}",
                "Writing regex:\nMe after 5 minutes: {text}",
                "When my backend doesn't sync with the frontend:\n{text}",
                "When the client asks to 'add one more button':\n{text}",
                "Seeing 'it works on my machine':\n{text}",
                "When I push code that doesn't work:\n{text}",
                "Writing documentation for my code:\n{text}",
                "When my unit test covers 0.01% of the code:\n{text}",
                "Finding a bug in production:\n{text}",
                "When a senior dev refactors my code:\n{text}",
                "Writing Python code:\nMe: {text}\nInterpreter: IndentationError",
                "When my API returns 500:\n{text}",
                "When my merge request has 100500 comments:\n{text}",
                "Writing SQL query:\nMe: {text}\nDatabase: Syntax error",
                "When my code looks like alphabet soup:\n{text}",
                "When I forget to commit my changes:\n{text}",
            ],
            life: [
                "Monday morning be like:\n{text}",
                "When someone says 'just be yourself':\n{text}",
                "Me trying to adult:\n{text}",
                "When my alarm goes off at 7 AM:\n{text}",
                "Me seeing 'battery 1%':\n{text}",
                "When mom asks if I ate:\n{text}",
                "When I forget where I parked my car:\n{text}",
                "Me trying to save money:\n{text}",
                "When I see 'No Internet Connection':\n{text}",
                "When someone takes my seat on the bus:\n{text}",
                "Me trying to wake up without coffee:\n{text}",
                "When it starts raining and I forgot my umbrella:\n{text}",
                "Me trying to look serious:\n{text}",
                "When someone asks how I'm doing:\nMe: {text}\nReality: Chaos",
                "When I forget my Wi-Fi password:\n{text}",
                "When I see the coffee is gone:\n{text}",
                "Me trying not to be late:\n{text}",
                "When someone asks why I'm up so late:\n{text}",
                "Seeing discounts at the store:\n{text}",
                "Me trying to plan my week:\n{text}",
                "When I accidentally reply 'You too' to 'Thank you':\n{text}",
                "When someone eats my chips:\n{text}",
                "Me trying to be trendy:\n{text}",
                "When someone invites me for a run:\n{text}",
                "Seeing a spider in my house:\n{text}",
                "Me trying not to eat after 6 PM:\n{text}",
                "When I forget what I was supposed to do:\n{text}",
                "When someone likes my post from 2015:\n{text}",
                "Me trying to look cool on Instagram:\n{text}",
                "When my alarm doesn't go off:\n{text}",
            ],
            food: [
                "When someone asks what's for dinner:\n{text}",
                "Me seeing pizza:\n{text}",
                "Trying to eat healthy:\n{text}",
                "When I smell fresh-baked bread:\n{text}",
                "When someone asks to share my food:\n{text}",
                "Me seeing a perfectly cooked steak:\n{text}",
                "Trying to open a jar of pickles:\n{text}",
                "When someone eats my chocolate:\n{text}",
                "Me trying a new recipe:\n{text}",
                "When the fridge is empty:\n{text}",
                "When mom makes her signature dish:\n{text}",
                "Me trying to cut onions without crying:\n{text}",
                "Seeing sushi on sale:\n{text}",
                "When someone says they don’t like tacos:\n{text}",
                "Me attempting to cook gourmet:\n{text}",
                "When someone eats my leftovers:\n{text}",
                "Trying to make the perfect omelette:\n{text}",
                "Me seeing cake in the fridge:\n{text}",
                "When someone asks if I’m on a diet:\n{text}",
                "When someone eats my ice cream:\n{text}",
                "Me trying to cook like a chef:\n{text}",
                "Seeing fresh pastries at the bakery:\n{text}",
                "When someone suggests fast food:\n{text}",
                "Me trying to eat salad with a fork:\n{text}",
                "When the fries are gone:\n{text}",
                "When someone asks if I can cook:\n{text}",
                "Me seeing homemade cookies:\n{text}",
                "Trying to drink hot coffee:\n{text}",
                "When someone leaves crumbs on the table:\n{text}",
                "Me trying spicy food:\n{text}",
            ],
            work: [
                "When Friday finally arrives:\n{text}",
                "Me in meetings:\n{text}",
                "When the deadline is tomorrow:\n{text}",
                "When the boss asks why I’m late:\n{text}",
                "Seeing 50 new emails in my inbox:\n{text}",
                "When someone says 'it’ll take 5 minutes':\n{text}",
                "When the printer breaks again:\n{text}",
                "Me trying to look busy:\n{text}",
                "When the client changes requirements last minute:\n{text}",
                "When the office coffee runs out:\n{text}",
                "Me trying to explain my job:\n{text}",
                "When the boss asks for a presentation in an hour:\n{text}",
                "When someone steals my lunch from the fridge:\n{text}",
                "Hearing 'we’ll discuss this in the meeting':\n{text}",
                "When the work chat explodes with notifications:\n{text}",
                "Me trying to meet a deadline:\n{text}",
                "When someone asks me to 'quickly check' their work:\n{text}",
                "When the office Wi-Fi goes down:\n{text}",
                "Me getting praise from the boss:\n{text}",
                "When someone asks if I finished the report:\n{text}",
                "Me trying not to fall asleep in a meeting:\n{text}",
                "When someone takes my parking spot:\n{text}",
                "Hearing 'let’s redo it one more time':\n{text}",
                "When the workday finally ends:\n{text}",
                "Me trying to look productive:\n{text}",
                "When someone asks why I’m still at the office:\n{text}",
                "Seeing a new project in Jira:\n{text}",
                "When someone asks me to explain Excel:\n{text}",
                "Me trying not to reply to emails after 6 PM:\n{text}",
                "When the boss walks toward my desk:\n{text}",
            ],
            general: [
                "Everyone: {text}\nMe: Well, actually...",
                "Nobody:\nAbsolutely nobody:\nMe: {text}",
                "Task failed successfully:\n{text}",
                "When someone says 'you don’t know?':\n{text}",
                "Seeing a 'urgent' message:\n{text}",
                "When someone asks why I’m laughing:\n{text}",
                "Me trying to be polite:\n{text}",
                "When someone likes my tweet:\n{text}",
                "Hearing my favorite song:\n{text}",
                "When someone asks to borrow my phone:\n{text}",
                "Me seeing a cat meme:\n{text}",
                "When someone says 'it’s not hard':\n{text}",
                "Me trying to look smart:\n{text}",
                "When I see someone taking a selfie:\n{text}",
                "Hearing 'let’s do it quick':\n{text}",
                "When someone asks why I’m late:\n{text}",
                "Me seeing a group chat notification:\n{text}",
                "When someone asks to share a meme:\n{text}",
                "Me trying not to react to spoilers:\n{text}",
                "When someone likes my story:\n{text}",
                "Hearing 'have you seen this?':\n{text}",
                "When someone asks me to explain a meme:\n{text}",
                "Me seeing a message from a bot:\n{text}",
                "When someone says 'you think too much':\n{text}",
                "Me trying not to like my own post:\n{text}",
                "When someone reposts my meme:\n{text}",
                "Hearing 'no jokes, please':\n{text}",
                "When someone asks to send a pic:\n{text}",
                "Me seeing a new TikTok trend:\n{text}",
                "When someone asks why I’m in a bad mood:\n{text}",
            ]
        };
        // Ukrainian meme suggestions
        this.ukrainianMemeSuggestions = {
            'код': { topText: "Коли код працює", bottomText: "Але ти не знаєш чому", language: 'uk' },
            'кава': { topText: "Я до кави", bottomText: "Я після кави", language: 'uk' },
            'понеділок': { topText: "П'ятниця вечором", bottomText: "Понеділок ранком", language: 'uk' },
            'робота': { topText: "Моя робота", bottomText: "Також моя робота о 3 ночі", language: 'uk' },
            'їжа': { topText: "Коли приходить їжа", bottomText: "Мир ніколи не був варіантом", language: 'uk' },
            'україна': { topText: "Показую прапор України", bottomText: "Всім навколо", language: 'uk' },
            'борщ': { topText: "Готую борщ", bottomText: "Це тепер мій дім", language: 'uk' },
            'вареники': { topText: "Коли бачу вареники", bottomText: "Сметана, я йду!", language: 'uk' },
            'дедлайн': { topText: "Дедлайн через годину", bottomText: "Починаю працювати", language: 'uk' },
            'сало': { topText: "Хтось: Сало — це жир", bottomText: "Я: Це культура", language: 'uk' },
            'вишиванка': { topText: "Одягнув вишиванку", bottomText: "Відчуваю силу предків", language: 'uk' },
            'гумова_качечка': { topText: "Пояснюю код", bottomText: "Гумовій качечці", language: 'uk' },
            'паляниця': { topText: "Скажи 'паляниця'", bottomText: "Розпізнаю своїх", language: 'uk' },
            'інтернет': { topText: "Коли Wi-Fi пропав", bottomText: "Повернення в 90-ті", language: 'uk' },
            'зима': { topText: "Зима в Україні", bottomText: "Де мої три шуби?", language: 'uk' },
            'трамвай': { topText: "Зайшов у трамвай", bottomText: "Вийшов у Нарнії", language: 'uk' },
            'кіт': { topText: "Український кіт", bottomText: "Цар усього дому", language: 'uk' },
            'бабуся': { topText: "Бабуся питає", bottomText: "Чому ти ще не поїв?", language: 'uk' },
            'деруни': { topText: "Смажу деруни", bottomText: "Сусіди вже в гості", language: 'uk' },
            'гопак': { topText: "Танцюю гопак", bottomText: "Фітнес по-українськи", language: 'uk' },
            'похід': { topText: "Похід в Карпати", bottomText: "Де моя бринза?", language: 'uk' },
            'квас': { topText: "П’ю квас", bottomText: "Літо офіційно почалося", language: 'uk' },
            'традиції': { topText: "Святкую Купала", bottomText: "Стрибаю через вогнище", language: 'uk' },
            'хліб': { topText: "Побачив свіжий хліб", bottomText: "Життя вдалося", language: 'uk' },
            'погода': { topText: "Погода в Україні", bottomText: "Чотири пори року за день", language: 'uk' },
            'маршрутка': { topText: "Сів у маршрутку", bottomText: "Тримаюсь за мрії", language: 'uk' },
            'голубці': { topText: "Готую голубці", bottomText: "Це займе вічність", language: 'uk' },
            'сусід': { topText: "Сусід свердлить", bottomText: "О 7 ранку в неділю", language: 'uk' },
            'гімн': { topText: "Чую гімн України", bottomText: "Сльози самі течуть", language: 'uk' },
            'швидкість': { topText: "Інтернет в селі", bottomText: "Пошта голубами швидше", language: 'uk' },
            'пампушки': { topText: "Борщ без пампушок", bottomText: "Це не борщ", language: 'uk' },
            'козаки': { topText: "Коли згадую козаків", bottomText: "Готуюся до бою", language: 'uk' },
            'кутя': { topText: "Готую кутю", bottomText: "Різдво вже близько", language: 'uk' },
            'святкування': { topText: "Святкую День Незалежності", bottomText: "Синьо-жовтий вайб", language: 'uk' },
            'жарти': { topText: "Розказую український жарт", bottomText: "Ніхто не зрозумів", language: 'uk' },
            'базар': { topText: "Пішов на базар", bottomText: "Повернувся з трьома кілограмами картоплі", language: 'uk' },
        };
        this.memeSuggestions = {
            'code': { topText: "When code works", bottomText: "But you don't know why", language: 'en' },
            'coffee': { topText: "Me before coffee", bottomText: "Me after coffee", language: 'en' },
            'monday': { topText: "Friday evening", bottomText: "Monday morning", language: 'en' },
            'work': { topText: "My code", bottomText: "Also my code at 3am", language: 'en' },
            'food': { topText: "When food arrives", bottomText: "Peace was never an option", language: 'en' },
            'debugging': { topText: "When I start debugging", bottomText: "Five hours later", language: 'en' },
            'pizza': { topText: "When I see pizza", bottomText: "My diet is cancelled", language: 'en' },
            'deadline': { topText: "Deadline in one hour", bottomText: "Time to start working", language: 'en' },
            'meetings': { topText: "Going into a meeting", bottomText: "Could’ve been an email", language: 'en' },
            'internet': { topText: "When Wi-Fi goes down", bottomText: "Back to the Stone Age", language: 'en' },
            'sleep': { topText: "Me trying to sleep", bottomText: "My brain at 2am", language: 'en' },
            'cat': { topText: "When I see a cat", bottomText: "Must pet immediately", language: 'en' },
            'traffic': { topText: "Stuck in traffic", bottomText: "I live here now", language: 'en' },
            'phone': { topText: "Battery at 1%", bottomText: "Panic mode activated", language: 'en' },
            'fridge': { topText: "Looking in the fridge", bottomText: "Hoping food appears", language: 'en' },
            'email': { topText: "Checking my inbox", bottomText: "50 new emails", language: 'en' },
            'rain': { topText: "When it starts raining", bottomText: "Forgot my umbrella", language: 'en' },
            'gym': { topText: "Me at the gym", bottomText: "Thinking about snacks", language: 'en' },
            'coding': { topText: "Writing clean code", bottomText: "Copy-pasting from Stack Overflow", language: 'en' },
            'weekend': { topText: "Friday at 5 PM", bottomText: "Monday at 8 AM", language: 'en' },
            'alarm': { topText: "When my alarm goes off", bottomText: "Five more minutes", language: 'en' },
            'lunch': { topText: "When lunch is free", bottomText: "I brought stretchy pants", language: 'en' },
            'social_media': { topText: "Checking social media", bottomText: "Two hours later", language: 'en' },
            'printer': { topText: "When the printer jams", bottomText: "My will to live is gone", language: 'en' },
            'traffic_light': { topText: "Waiting at a red light", bottomText: "Feels like eternity", language: 'en' },
            'wifi': { topText: "When Wi-Fi reconnects", bottomText: "Life has meaning again", language: 'en' },
            'shopping': { topText: "Going for one thing", bottomText: "Leaving with a full cart", language: 'en' },
            'group_chat': { topText: "Group chat notifications", bottomText: "My phone is vibrating to Narnia", language: 'en' },
            'spider': { topText: "Seeing a spider at home", bottomText: "Burn the house down", language: 'en' },
            'chores': { topText: "Doing chores", bottomText: "Why is this my life now?", language: 'en' },
            'password': { topText: "Forgetting my password", bottomText: "Time to reset it again", language: 'en' },
            'traffic_jam': { topText: "In a traffic jam", bottomText: "I’m now a philosopher", language: 'en' },
            'delivery': { topText: "Waiting for delivery", bottomText: "Staring out the window", language: 'en' },
            'meme': { topText: "When I see a good meme", bottomText: "Must share with everyone", language: 'en' },
            'weather': { topText: "Checking the weather", bottomText: "It’s wrong anyway", language: 'en' },
        };
        console.log('🎭 Ukrainian Meme Generator initialized');
    }
    async generateMeme(request) {
        try {
            const language = request.language || 'uk';
            // Try Imgflip API for image memes if available
            const imgflipResult = await this.tryImgflipGeneration(request);
            if (imgflipResult.success) {
                return { ...imgflipResult, language };
            }
            // Fallback to text-based memes
            return await this.generateTextMeme('general', request.topText, language);
        }
        catch (error) {
            console.error('Error generating meme:', error);
            return {
                success: false,
                errorMessage: 'Failed to generate meme',
                language: request.language || 'uk'
            };
        }
    }
    async generateTextMeme(topic, text, language = 'uk') {
        try {
            const templates = language === 'uk'
                ? (this.ukrainianTextMemes[topic] || this.ukrainianTextMemes.general)
                : (this.textMemeTemplates[topic] || this.textMemeTemplates.general);
            const template = templates[Math.floor(Math.random() * templates.length)];
            const memeText = template.replace('{text}', text);
            return {
                success: true,
                text: memeText,
                attribution: language === 'uk' ? 'Згенеровано українським мем-генератором' : 'Generated with Ukrainian meme engine',
                language
            };
        }
        catch (error) {
            console.error('Error generating text meme:', error);
            return {
                success: false,
                errorMessage: 'Failed to generate text meme',
                language
            };
        }
    }
    suggestMemeForMessage(message, language = 'uk') {
        const lowerMessage = message.toLowerCase();
        const suggestions = language === 'uk' ? this.ukrainianMemeSuggestions : this.memeSuggestions;
        // Check for Ukrainian-specific keywords first
        if (language === 'uk') {
            // Enhanced Ukrainian keyword matching with flexible patterns
            if (lowerMessage.includes('робот') || lowerMessage.includes('роботі')) {
                return this.ukrainianMemeSuggestions['робота'];
            }
            if (lowerMessage.includes('їж') || lowerMessage.includes('хочу їжу')) {
                return this.ukrainianMemeSuggestions['їжа'];
            }
            if (lowerMessage.includes('україн') || lowerMessage.includes('слава україні')) {
                return this.ukrainianMemeSuggestions['україна'];
            }
            if (lowerMessage.includes('кав')) {
                return this.ukrainianMemeSuggestions['кава'];
            }
            if (lowerMessage.includes('понеділ')) {
                return this.ukrainianMemeSuggestions['понеділок'];
            }
            // Exact keyword matches as fallback
            for (const [keyword, meme] of Object.entries(suggestions)) {
                if (lowerMessage.includes(keyword)) {
                    return meme;
                }
            }
            // Ukrainian-specific patterns
            if (lowerMessage.includes('борщ') || lowerMessage.includes('вареники')) {
                return { topText: "Коли готуєш українську їжу", bottomText: "Душа співає", language: 'uk' };
            }
            if (lowerMessage.includes('україна') || lowerMessage.includes('🇺🇦')) {
                return { topText: "Серце радіє", bottomText: "Коли згадують Україну", language: 'uk' };
            }
        }
        else {
            for (const [keyword, meme] of Object.entries(suggestions)) {
                if (lowerMessage.includes(keyword)) {
                    return meme;
                }
            }
        }
        // General patterns for both languages
        if (lowerMessage.includes('confused') || lowerMessage.includes('плутаний')) {
            return {
                topText: language === 'uk' ? "Намагаюся зрозуміти" : "Me trying to understand",
                bottomText: message.substring(0, 30) + (message.length > 30 ? '...' : ''),
                language
            };
        }
        return null;
    }
    async tryImgflipGeneration(request) {
        // Try to use Imgflip API if credentials are available
        const username = process.env.IMGFLIP_USERNAME;
        const password = process.env.IMGFLIP_PASSWORD;
        if (!username || !password) {
            return { success: false, language: request.language || 'uk' };
        }
        try {
            const response = await axios_1.default.post('https://api.imgflip.com/caption_image', {
                template_id: request.templateId || '181913649', // Drake meme
                username,
                password,
                text0: request.topText,
                text1: request.bottomText || '',
            }, { timeout: 5000 });
            if (response.data.success) {
                return {
                    success: true,
                    imageUrl: response.data.data.url,
                    attribution: 'Created with Imgflip API',
                    language: request.language || 'uk'
                };
            }
        }
        catch (error) {
            console.log('Imgflip API not available, using text memes');
        }
        return { success: false, language: request.language || 'uk' };
    }
    // Ukrainian trending memes
    async generateUkrainianTrendingMeme(topic) {
        const ukrainianTrendingTemplates = {
            'cat': { top: 'Коли хтось згадує котів', bottom: 'Я викликаний' },
            'coffee': { top: 'Я до кави', bottom: 'Я після кави' },
            'weekend': { top: "П'ятниця вечором", bottom: 'Понеділок ранком' },
            'coding': { top: 'Мій код', bottom: 'Також мій код о 3 ранку' },
            'food': { top: 'Коли приходить їжа', bottom: 'Мир не варіант' },
            'ukraine': { top: 'Коли бачу українську символіку', bottom: 'Гордість переповнює' }
        };
        const template = ukrainianTrendingTemplates[topic] ||
            { top: `Коли згадується ${topic}`, bottom: 'Всім це подобається' };
        return await this.generateMeme({
            topText: template.top,
            bottomText: template.bottom,
            language: 'uk'
        });
    }
    // Quick meme generation with Ukrainian support
    async generateQuickMeme(text, language = 'uk') {
        const shortText = text.length > 50 ? text.substring(0, 47) + '...' : text;
        const memeText = language === 'uk'
            ? `Всі: ${shortText}\nЯ: Ну, насправді... мем момент`
            : `Everyone: ${shortText}\nMe: Well, actually... meme moment`;
        return {
            success: true,
            text: memeText,
            attribution: language === 'uk' ? 'Згенеровано українським мем-генератором' : 'Generated with Ukrainian meme engine',
            language
        };
    }
    // Get meme statistics
    getStats() {
        return {
            availableUkrainianTemplates: Object.keys(this.ukrainianTextMemes).length,
            availableEnglishTemplates: Object.keys(this.textMemeTemplates).length,
            totalSuggestions: Object.keys(this.ukrainianMemeSuggestions).length + Object.keys(this.memeSuggestions).length
        };
    }
    // Language detection for memes
    detectLanguage(text) {
        const ukrainianChars = /[іїєґ]/g;
        const ukrainianWords = ['що', 'як', 'коли', 'де', 'чому'];
        const hasUkrainianChars = ukrainianChars.test(text.toLowerCase());
        const ukrainianWordCount = ukrainianWords.filter(word => text.toLowerCase().includes(word)).length;
        return (hasUkrainianChars || ukrainianWordCount >= 1) ? 'uk' : 'en';
    }
    // Public method to get available templates by language
    getAvailableTemplates(language = 'uk') {
        return Object.keys(language === 'uk' ? this.ukrainianTextMemes : this.textMemeTemplates);
    }
}
exports.MemeGenerator = MemeGenerator;
