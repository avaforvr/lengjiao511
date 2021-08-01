// ==UserScript==
// @name         生成评论文案
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  根据帖子带的tag生成相应的评论文案
// @author       Ava
// @match        https://m.weibo.cn/*
// @include      /^https:\/\/weibo\.com\/\d{10}\/[0-9a-zA-Z]{9}/
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 评论前缀
    var PREFIX = '';// [置顶][来hui][勿hui][沪哲]

    var MY_NAME = '努力修行的棱角';

    // 为了避免文案重复，每次生成文案前面加一个随机汉字组合，文案越长，重复率越低
    var RANDOM_LETTERS = '张哲瀚和家人朋友们健康快乐事业顺利祝我抢到前排演唱会门票早日实现财务自由';
    // 汉字组合的长度，数值越大，重复率越低
    var RANDOM_LENGTH = 3;
    var RANDOM_SEPERATE = '，';

    // 可口可乐
    var cola = [
        '炎炎夏日[太阳]，渴望冰爽🧊@可口可乐 携 张哲瀚@张哲瀚疯子 一起给你带来夏日最佳状态[可乐]恭喜张哲瀚成为可口可乐品牌大使！',
        '精彩刹那，活力一夏。美味在手，无线享受！哲一夏天，可口相伴！还等什么？无需犹豫！跟张哲瀚@张哲瀚疯子 一起，走进@可口可乐 的世界，迎接活力夏天，恭喜张哲瀚成为可口可乐品牌大使！ ​​​',
        '火辣夏天[太阳]少不了麻辣烧烤小龙虾🦞当然还要来一杯@可口可乐[可乐]和朋友畅爽开怀！张哲瀚@张哲瀚疯子 让你冰凉一夏',
        '恭喜张哲瀚@张哲瀚疯子，成为可口可乐品牌大使🥳',
        '恭喜张哲瀚成为可口可乐品牌大使！可口不只是可乐[可乐]，哲瀚不单是演员。畅饮一夏，全线皆有！欢快谱曲，盼君高歌！这个夏日，拧开@可口可乐 期待@张哲瀚疯子 带来的无限精彩!',
        '冰爽一刻不停，夏日无惧负担🧊 夏日炎炎，气泡和快乐咕噜作响[可乐]张哲瀚@张哲瀚疯子 携手@可口可乐，【哲】一夏与你开启狂欢旅程！恭喜张哲瀚成为可口可乐品牌大使！',
        '一杯@可口可乐，一口活力满满！和张哲瀚@张哲瀚疯子 一起可口可乐[可乐]呼朋引伴、畅饮不停，万般可能、未来无限。让你畅快挡不住！恭喜张哲瀚成为可口可乐品牌大使！',
        '炎炎夏日[太阳]，渴望冰爽🧊@可口可乐 携张哲瀚@张哲瀚疯子 一起给你带来夏日最佳状态[可乐]恭喜张哲瀚成为可口可乐品牌大使！',
        '火辣夏天[太阳]少不了麻辣烧烤小龙虾🦞当然还要来一杯@可口可乐[可乐]和朋友畅爽开怀！张哲瀚@张哲瀚疯子 让你冰凉一夏，恭喜张哲瀚成为可口可乐品牌大使！',
        '炎炎夏日[太阳]，渴望冰爽🧊@可口可乐 携张哲瀚@张哲瀚疯子 一起给你带来夏日最佳状态[可乐]恭喜张哲瀚成为可口可乐品牌大使！',
        '一杯@可口可乐，一口活力满满！和张哲瀚@张哲瀚疯子 一起可口可乐[可乐]呼朋引伴、畅饮不停，万般可能、未来无限。让你畅快挡不住！恭喜张哲瀚成为可口可乐品牌大使！',
        '夏天是一张色彩斑斓的相片, 🏀路边的篮球场, 🧊冰镇的@可口可乐,还有阳光下的你!!🌞让我们和张哲瀚@张哲瀚疯子 一起干了这杯可口可乐, 🥤活力四射,畅爽酷暑～恭喜张哲瀚成为可口可乐品牌大使❤️张哲瀚@张哲瀚疯子！',
        '一杯@可口可乐，一口活力满满！和张哲瀚@张哲瀚疯子 一起可口可乐[可乐]呼朋引伴、畅饮不停，万般可能、未来无限。让你畅快挡不住！恭喜张哲瀚成为可口可乐品牌大使！',
        '夏天怎样才带劲?🤔@可口可乐 [可乐]给你即刻畅爽体验🧊满满气泡炸开💥畅饮可口欢乐和张哲瀚@张哲瀚疯子 一起迎接冰凉夏日吧🏄‍♂️！恭喜张哲瀚成为可口可乐品牌大使！',
        '当然要来一口冰凉美味的可口可乐啦！@可口可乐 ，劲爽一夏。张哲瀚@张哲瀚疯子',
        '一口活力满满！和张哲瀚@张哲瀚疯子 一起可口可乐[可乐]@可口可乐 ,呼朋引伴、畅饮不停，万般可能、未来无限。让你畅快挡不住！恭喜张哲瀚成为可口可乐品牌大使！',
        '呲～拧开的不是可乐，是这个夏天的快乐。 咕咚～喝下的不是碳酸，是这个夏天的凉爽！哲一夏，瀚永爱，带上可口可乐一起，与张哲瀚@张哲瀚疯子 共饮[牛轰轰拥抱]@可口可乐',
        '和张哲瀚@张哲瀚疯子 一起吃美食，配冰可口可乐@可口可乐，畅享美味，快乐加倍！恭喜张哲瀚成为可口可乐品牌大使！ ​​​',
        '恭喜青年演员张哲瀚@张哲瀚疯子 成为可口可乐品牌大使！炎炎夏日一起来杯冰爽可口吧！@可口可乐',
        '欢迎可口可乐品牌大使@张哲瀚疯子 加入饭局，以后一起快乐干饭美味加倍吧@可口可乐 ⛽️恭喜张哲瀚成为可口可乐品牌大使！'
    ];

    // 吕
    var ryo = [
        '温和0添加，安心养护发@吕Ryo ,让你随时保持轻盈秀发，清爽一夏，和张哲瀚@张哲瀚疯子 一起养护洗发，秀出光彩，唤醒发丝活力',
        '不“屑”烦恼，焕“发”生机，洗护专家【吕】携手新晋御发代言人张哲瀚，“哲”个夏天，让我们秀发重现柔顺飘逸，做个光彩精致“吕”孩！张哲瀚@张哲瀚疯子',
        '生活总难免「秃」如其来的挑战，有【吕】防脱系列为你摆「脱」烦恼。携手御发代言人张哲瀚@张哲瀚疯子 ，为你开启秀发奢护之旅。精彩人生，与「吕」同游！',
        '水润无硅油，轻盈净秀发；修复受损，柔顺飘逸，与@张哲瀚疯子 一起，探索@吕Ryo 的护发秘籍，参入滋养，欢洗一夏！',
        '给你的秀发轻盈灵动每一天！【哲】为你倾心，有【吕】爱不停💛御发代言人张哲瀚甄选吕Ryo防脱强韧洗发水，要你的秀发丰盈柔顺！✨@张哲瀚疯子',
        '秀发轻盈灵动每一天，【哲】为你倾心！张哲瀚@张哲瀚疯子',
        '温和0添加，安心养护发！张哲瀚@张哲瀚疯子',
        '水润无硅油，轻盈净秀发，参入滋养，欢洗一夏！张哲瀚@张哲瀚疯子',
        '修复受损，柔顺飘逸，与@张哲瀚疯子 一起，探索@吕Ryo 的护发秘籍',
    ];

    // 百力滋
    var bailizi = [
        '每个嘴馋的夜晚，怎能没有夜宵相伴？咸香透辣，嘎嘣脆响，“山珍”与“海味”，张哲瀚@张哲瀚疯子 与你共享！快来一起尝尝百力滋新品吧！@格力高中国',
        '咔嚓咔嚓～快乐出发！咔嚓咔嚓～美味抵达！咔嚓咔嚓~张哲瀚@张哲瀚疯子 邀你畅享百力滋@格力高中国 美味燃情共相赴！ ​​​​',
        '欢迎我们的百力滋@格力高中国 代言人@张哲瀚疯子 ！夜晚享受音乐的同时也要享受夜宵，脑洞大开，让灵感来的恰到好处。',
        '一根好回味，double更尽兴。百力滋@格力高中国 代言人张哲瀚@张哲瀚疯子 邀您一起，咔滋一“夏”，味蕾生花。',
        '伴哲同吃百力滋，和百力滋@格力高中国 代言人张哲瀚@张哲瀚疯子 一起咔滋一“夏”！',
        '零食食小，开心事大，和百力滋@格力高中国 代言人张哲瀚@张哲瀚疯子 一起咔滋一“夏”！',
        '开心小零食，生活大智慧，和百力滋@格力高中国 代言人张哲瀚@张哲瀚疯子 一起咔滋一“夏”！',
        '健康美味，欢乐必备，休闲生活，自然美味，和百力滋@格力高中国 代言人张哲瀚@张哲瀚疯子 一起咔滋一“夏”！',
        '不只是美味，更是长久回味，和百力滋@格力高中国 代言人张哲瀚@张哲瀚疯子 一起咔滋一“夏”！',
        '走进新时代，精彩好“食”光，和百力滋@格力高中国 代言人张哲瀚@张哲瀚疯子 一起咔滋一“夏”！',
        '奇妙，味无穷；趣味，挡不住，和百力滋@格力高中国 代言人张哲瀚@张哲瀚疯子 一起咔滋一“夏”！',
        '美食美客带您感受美味的世界，和百力滋@格力高中国 代言人张哲瀚@张哲瀚疯子 一起咔滋一“夏”！',
        '爱生活爱食尚，享受美味时刻，和百力滋@格力高中国 代言人张哲瀚@张哲瀚疯子 一起咔滋一“夏”！',
        '吃一次，便忘不掉你，和百力滋@格力高中国 代言人张哲瀚@张哲瀚疯子 一起咔滋一“夏”！',
        '喜欢张哲瀚@张哲瀚疯子的笑容，喜欢百力滋@格力高中国 的味道！',
        '一次品尝，做舌尖上永远的朋友，和百力滋@格力高中国 代言人张哲瀚@张哲瀚疯子 一起咔滋一“夏”！',
        '淘零食，寻美味，和百力滋@格力高中国 代言人张哲瀚@张哲瀚疯子 一起咔滋一“夏”！',
        '美食美刻，哲样人生，乐享生活，和百力滋@格力高中国 代言人张哲瀚@张哲瀚疯子 一起咔滋一“夏”！',
        '好味不能错过，别样的味道，和百力滋@格力高中国 代言人张哲瀚@张哲瀚疯子 一起咔滋一“夏”！',
        '让味觉随心掌握，让味道客随主便，和百力滋@格力高中国 代言人张哲瀚@张哲瀚疯子 一起咔滋一“夏”！',
    ];

    // 梦幻新诛仙
    var zhuxian = [
        '恭喜 张哲瀚@张哲瀚疯子 成为梦幻新诛仙手游代言人[打call] 谁愿意孤苦一生？谁愿意孤单度日？若不是情到深处难自禁，又怎会柔肠百转冷如霜。—《诛仙》',
        '恭喜 张哲瀚@张哲瀚疯子 成为梦幻新诛仙手游代言人[打call] 苍茫大地一剑尽挽破，何处繁华笙歌落。斜倚云端千壶掩寂寞，纵使他人空笑我。—《诛仙》',
        '恭喜 张哲瀚@张哲瀚疯子 成为梦幻新诛仙手游代言人[打call] 红颜远，相思苦，几番意，难相付。十年情思百年渡，不斩相思不忍顾。—《诛仙》',
        '恭喜 张哲瀚@张哲瀚疯子 成为梦幻新诛仙手游代言人[打call] 大师看我沉沦魔道,我却笑大师心中痴迷,这世间万道,皆在道理,难道你的岸方是岸,我的岸便是海吗?—《诛仙》',
        '恭喜 张哲瀚@张哲瀚疯子 成为梦幻新诛仙手游代言人[打call] 若不是情到深处难自禁，又怎会柔肠百转冷如霜—《诛仙》',
        '恭喜 张哲瀚@张哲瀚疯子 成为梦幻新诛仙手游代言人[打call] 天地不仁，以万物为刍狗; 日月无情，转千世屠枭雄。—《诛仙》',
        '恭喜 张哲瀚@张哲瀚疯子 成为梦幻新诛仙手游代言人[打call] 十年情思百年渡，不斩相思不忍顾。—《诛仙》',
        '恭喜 张哲瀚@张哲瀚疯子 成为梦幻新诛仙手游代言人[打call] 一个人感觉最孤独的时候是什么 ？ 是不是独自面对着整个世界的冷漠,是不是独自面对着所有的耻笑？—《诛仙》',
        '恭喜 张哲瀚@张哲瀚疯子 成为梦幻新诛仙手游代言人[打call] 月魄霜魂塑倾城，而今只愿莫相逢。竹林暗夜风雨恶，寂寞悬崖冰雪横。对擂已知心有属，抗命何惧违师承。天琊三尺龙吟下，君在地府第几层？—《诛仙》',
        '恭喜 张哲瀚@张哲瀚疯子 成为梦幻新诛仙手游代言人[打call] 悠悠晨钟，沉沉暮鼓，须弥山沐浴在缥缈云气之中，从初升的旭日到傍晚的残霞，天际风云变幻，白云苍狗滚滚而过，时光终究不曾为任何人而停留。—《诛仙》',
        '恭喜 张哲瀚@张哲瀚疯子 成为梦幻新诛仙手游代言人[打call] 痴情咒：九幽阴灵，诸天神魔， ­以我血躯，奉为牺牲。 ­三生七世，永堕阎罗， ­只为情故，虽死不悔­。—《诛仙》',
        '恭喜 张哲瀚@张哲瀚疯子 成为梦幻新诛仙手游代言人[打call] 时光如长河中的水滔滔向前，从不曾停留半分，最初的感动，最初的记忆，那无数曾深深镂刻心间的丝丝缕缕，原来，终究还是要被人遗忘。—《诛仙》',
        '恭喜 张哲瀚@张哲瀚疯子 成为梦幻新诛仙手游代言人[打call] 天高海阔八万丈，芸芸众生尽匍匐。—《诛仙》',
        '恭喜 张哲瀚@张哲瀚疯子 成为梦幻新诛仙手游代言人[打call] 也许，真的拥抱了你，世界从此就不一样了吧！—《诛仙》',
        '恭喜 张哲瀚@张哲瀚疯子 成为梦幻新诛仙手游代言人[打call] 芳心苦，忍回顾，悔不及，难相处。金铃清脆噬血误，一生总被痴情诉。铃铛咽，百花调，人影渐瘦鬓如霜。深情苦，一生苦，痴情只为无情苦。—《诛仙》',
        '恭喜 张哲瀚@张哲瀚疯子 成为梦幻新诛仙手游代言人[打call] 多少年后，你回首往事，还记得当年，曾有人对你，低声诉说心语吗？那因为年轻带著天真有些狂热的话语，你可还记得吗？就像深深镂刻在心间、不死不弃的誓言！你有没有张开双臂，将那心爱的人，拥抱在怀里？—《诛仙》',
        '恭喜 张哲瀚@张哲瀚疯子 成为梦幻新诛仙手游代言人[打call] 三生七世，永堕阎罗，只为情故，虽死不悔。—《诛仙》',
        '恭喜 张哲瀚@张哲瀚疯子 成为梦幻新诛仙手游代言人[打call] 是不是应该，永远站在这个黑暗的角落，静静地看着别人幸福，品尝着自己的痛苦！—《诛仙》',
        '恭喜 张哲瀚@张哲瀚疯子 成为梦幻新诛仙手游代言人[打call] 我们其实都是，光阴中喘息奔跑的人儿，却终究追不过时光，渐渐老去，消失在那片阴影之中……—《诛仙》',
        '恭喜 张哲瀚@张哲瀚疯子 成为梦幻新诛仙手游代言人[打call] 世事沧桑，却怎比得上我心瞬间，那顷刻的微光。—《诛仙》',
    ];

    // 美宝莲
    var meibaolian = [
        '美来自内心，守心自暖，世界皆美；美来自美宝莲，无可取代，与众不同。美宝莲纽约品牌代言人张哲瀚@张哲瀚疯子 携手@Maybelline美宝莲纽约 守护您的光彩，绽放无限风采！',
        '天生一双璀璨明眸，魅惑高冷随心切换，多情眉眼，纯净笑颜，张哲瀚@张哲瀚疯子 携手美宝莲@Maybelline美宝莲纽约 ，让无暇容颜在聚光灯下尽情展现',
        '解锁全新身份，就要出色敢「红」，恭喜张哲瀚@张哲瀚疯子 成为美宝莲品牌代言人，手持美宝莲小红线，牵起万千心动时分，浓郁显色，一眼难忘，今夏一起做果敢女孩！',
        '你上扬的嘴角，像鹊桥的甜蜜，披上唇间华服，晕染梦幻轻颜，美宝莲小红线，由美宝莲品牌代言人张哲瀚@张哲瀚疯子 来为你展现别样风情。',
        '点一簇胭脂红，似水一笑月朦胧，美宝莲小红线💄自带柔光的梦幻感觉，瞬间唤起少女心🎈这个七夕张哲瀚@张哲瀚疯子 和你一起唇唇诱人。',
        '「哲」般美色，是谁又在我的心里鲨疯了？原来是美宝莲品牌代言人张哲瀚@张哲瀚疯子 带着全新美宝莲小红线新品，又来狙击我的心脏了！听说涂上这抹诱人新红，连路过的蚂蚁也要停下来问一问色号！',
        '一根红线相约，哲个七夕♥️一抹绝美唇色，撩拨心弦，美宝莲推出新品「小红线」为你盛放此刻心动，携手品牌代言人张哲瀚一起共赴一场浪漫约会！@张哲瀚疯子',
        '永远潮流，永远先锋，口红就是你的绝佳上场武器，恭喜张哲瀚@张哲瀚疯子 成为美宝莲全新品牌代言人，一抹动人唇色，悸动整个夏天。',
        '一抹红线，撩人心魄，自信张扬，惊艳四座，这个夏天美宝莲纽约品牌代言人@张哲瀚疯子 陪你火辣一夏。',
        '危险危险危险❗最新唇色❗️情报来袭，今夏最诱人的一抹红，皆系于美宝莲小红线之上，跟美宝莲全新品牌代言人张哲瀚@张哲瀚疯子 一起，当「红」不让，就要出彩！',
        '一抹极致之红，让谁唇唇欲动？美宝莲全新品牌代言人张哲瀚@张哲瀚疯子 出色登场，重磅新品美宝莲小红线今日揭幕，魅惑于唇，系上心弦，为爱勇敢，永不止步。',
        '一弯柳眉描凤眼，一抹朱砂点绛唇。黛青色的锋利眉眼，搭配赤朱色的烈焰红唇，美丽就是要色彩明亮。和@张哲瀚疯子 一起用@Maybelline美宝莲纽约 将你的美丽点亮！',
    ];

    // 每日一善
    var daily = [
        '不要在小人身上浪费时间，将军有剑，不斩苍蝇。',
        '月色与雪色之间，你是第三种绝色。——余光中',
        '如果有一天：你不再寻找爱情，只是去爱；你不再渴望成功，只是去做；你不再追求空泛的成长，只是开始修养自己的性情；你的人生一切，才真正开始。——纪伯伦',
        '写你的名字可真难，倒不是笔画繁琐，只是写你名字时得蘸上四分春风，三分月色，两分微醺，还有一分你的眉目才好。——李长风',
        '向日葵莱莱总是显得无精打采的，大家都不知道为什么，只好劝他，白天要努力的进行光合作用哦。可是莱莱有着自己的小秘密，每天晚上它会独自看着月亮，用谁都听不见的声音说：“可我就是喜欢你呀。”',
        '这里荒芜寸草不生，后来你来这走了一遭，奇迹般万物生长，这里是我的心。——《沙漠》',
        '我从没被谁知道，所以也没被谁忘记。在别人的回忆中生活，并不是我的目的。',
        '命运不是风，来回吹，命运是大地，走到哪你都在命运中。——《英儿》',
        '小朋友才会仰天大哭，成年人会把哭调成静音连崩溃也很懂事 ​​​。',
        '我们要有朴素的生活，与最遥远的梦想。即使明日天寒地冻，路远马亡。——七堇年《被窝是青春的坟墓》',
        '我们听过无数的道理，却仍旧过不好这一生。——韩寒《后会无期》',
        '你可以阴郁，可以懒散，可以不适时地计较，过分敏感，可以有些不知足、暴躁、嫉妒、小气，但要记得拷问自我，必须追求善良，尽力坦荡，永远正直。',
        '太宰治说：“我本来想这个冬天就死去的，可是最近拿到一套鼠灰色细条纹的麻质和服，是适合夏天穿的，所以我還是先活到夏天吧。”人生不如意十之八九，但是那一二分的甜，才是我们日复一日的意义。',
        '我喜欢那种经历了大风大浪，却还平静地像只是下雨时踩湿了裤脚一样的人。那样的人性格里有一种荒腔走板的力量，也温柔，也不慌不忙。——北倾',
        '死亡不是失去生命，而是走出了时间。——余华《在细雨中呼喊》',
        'There are some people who think love is sex and marriage and six o’clock-kisses and children, and perhaps it is, Miss Lester. But do you know what I think? I think love is a touch and yet not a touch.”——塞林格《破碎故事之心》',
        '他想也许女孩子第一次有男朋友的心境也像白水冲了红酒，说不上爱情，只是一种温淡的兴奋。——钱钟书《围城》',
        '不一定要你爱我，但是我爱你，这是我的命运。',
        '我要自我完善起来，为了你我要成为完人。',
        '祝你今天愉快，你明天的愉快留着我明天再祝。',
        '你真好，我真爱你。可惜我不是诗人，说不出更动听的话了。',
        '别怕美好的一切消失，咱们先来让它存在。',
        '我原准备到处哈哈大笑，连自己在内，笑到寿终正寝之时。可是我现在想认真了，因为你是个认真的人。',
        '且熬过三冬四夏，暂受些痛苦，雪尽后再来看梅花。',
        '我们一路奋斗，不是为了改变世界，而是为了不被世界改变。',
        '机场比婚礼的殿堂见证了更多真诚的吻，医院的墙比教堂听到了更多的祈祷。',
    ];

    // 默认文案
    var defaultList = [
        '身体的天赋是源于造物者的礼物。',
        '一位个头不高的的篮球爱好者可以通过努力、科学的训练让自己多跳高十厘米来弥补身高的不足。可以每天加练两个小时的运球来弥补手掌大小的不足。一位天赋不高的演员也可以从最基础的声台形表训练做起，之后循序渐进。老话说的好：笨鸟先飞。',
        '虽然我们像大多数人一样没有得到特殊的“礼物”在认知到自己的不足后加倍努力，你会发现自己的得到了更珍贵的品质，专注与坚持。',
        '热爱才是一切的原动力！——张哲瀚@张哲瀚疯子',
        '每个人都有一念善心，只要被启发，爱心就能被点燃。——张哲瀚@张哲瀚疯子',
        '这世界上所有的事情都会有两面性，当你去从不同的角度看待它的时候，你就会找到答案，这世上有很多不同的角度，你要学会去用不同的角度看待这个问题，你就会找到答案。——张哲瀚@张哲瀚疯子',
        '我尽力完成我的工作，坚持我热爱的东西，在我精力旺盛的岁月里留下了一些痕迹，我在我生命的每个阶段都尽力了。——张哲瀚@张哲瀚疯子',
        '张哲瀚，请大步往前走，海哲们会帮你记着你走过的每一个精彩瞬间。@张哲瀚疯子',
        '适合自己心大小的世界，才是刚刚好的世界。——张哲瀚@张哲瀚疯子',
        '我觉得作为一个明星或者作为一个偶像，我觉得最重要的是成为就是说有很好的正能量去给他们很多正能量，哪怕看到我他们上班有动力，看到我他们学习有动力，我觉得这都是对我来说很有动力的事情。——张哲瀚@张哲瀚疯子',
        '生活当中会有很多遗憾，但你要去接受它，遗憾也是一种美，去感受它。——张哲瀚@张哲瀚疯子',
        '人生就是一些经历，你需要把你的一些经历赋予到你的角色里去。——张哲瀚@张哲瀚疯子',
        '因为追这个人，你拥有了很多志同道合趣味相投的伙伴们，你们可能会有相同的兴趣爱好、相同的志向，或者是在迷茫的时候需要相互打气，可以互相陪伴成长，互相成为好的朋友。——张哲瀚@张哲瀚疯子',
        '每一次作品，每一个角色都是我在演绎道路上的积累，它都是帮助我成为现在张哲瀚的一个过程。——张哲瀚@张哲瀚疯子',
        '努力不一定能够到达你想要到达的目标，但是不努力你一定到达不了，三分天注定，七分靠打拼嘛。——张哲瀚@张哲瀚疯子',
        '也会经常有犯错误的时候，可能就是以前自己确实没有好好学习，好好读书，正是因为这样大家指出来了，我才觉得我应该更加去好好努力学习。——张哲瀚@张哲瀚疯子',
        '很多人都是因为犯错误，所以变得谨慎嘛，如果你不犯这个错误，你怎么知道自己这个字在你的脑海里就是错误的呢？——张哲瀚@张哲瀚疯子',
        '可能我们聊天的时候，你不一定会指出来，但是可能我作为一个公公众人物，公众活动的时候，人家会给我指出来，所以这就是一个很好的纠正自己的错误的过程。——张哲瀚@张哲瀚疯子',
        '我是个演员，所有的一切我都是为我的角色服务。——张哲瀚@张哲瀚疯子',
        '人总归是要相信缘分和接受现实，既然命运给了我这样的安排，那我就去把它做好。——张哲瀚@张哲瀚疯子',
        '让所有的爱都团结在一起，让所有的爱都相互分担，因为所有的爱都集中在一个人身上，那就会显得特别的沉重。让我们一起分担爱吧，让我们一起去感受爱吧。——张哲瀚@张哲瀚疯子',
        '你知道什么叫爬墙吗？爬墙，我知道铁打的偶像流水的粉嘛。——张哲瀚@张哲瀚疯子',
        '人生就是来来去去，来来回回有的人可能只能陪你走一段时间，有的人可以陪你走很长时间，所以我很相信缘分这个词。——张哲瀚@张哲瀚疯子',
        '很感谢每一个阶段都能够陪着我走的粉丝，我觉得是他们的支持和认可，让我一步步的走到了今天。——张哲瀚@张哲瀚疯子',
        '他们（粉丝）去喜欢另外的人或者什么东西，其实都很正常，都是一个再平常不过的事情了，他们去选择他们自己喜欢的，我觉得就是一个很好的事情。你人生在每个阶段可能喜欢的事物不一样，我也是一样。——张哲瀚@张哲瀚疯子',
    ];

    // 配置词条对应的文案列表映射
    var tagMap = [
        {key: '每日一善', list: daily},
        {key: '#和张哲瀚吃饭喝可口可乐#', list: cola},
        {key: '#吕御发代言人张哲瀚#', list: ryo},
        {key: '#张哲瀚喊你吃夜宵百力滋# ', list: bailizi},
        {key: '#张哲瀚梦幻新诛仙#', list: zhuxian},
        {key: '#张哲瀚美宝莲纽约品牌代言人#', list: meibaolian},
    ];

    // 根据评论正文关键字获取备选文案列表
    function getTextList(text) {
        for (var i = 0; i < tagMap.length; i++) {
            var item = tagMap[i];
            if (text.indexOf(item.key) !== -1 && item.list.length > 0) {
                return item.list;
            }
        }
        return defaultList;
    }

    var textList, // 备选文案列表
        wrapElem, // 最外层容器
        statusElem, // 当前状态元素
        textElem, // 待复制文案文本域
        buttonElem, //按钮元素
        curTotal = 0; //当前评论总数

    // 刷新页面
    function refresh() {
        window.location.refresh();
    }

    // 复制文案
    function copyText() {
        textElem.select();
        document.execCommand('copy');
        buttonElem.innerText = '已复制';
        setTimeout(function () {
            textElem.value = getText();
            buttonElem.innerText = '复制文案';
        }, 300);
    }

    function showStatus(statusText, canCopy) {
        statusElem.innerText = statusText;
        if (canCopy) {
            textElem.style.display = 'block';
            buttonElem.style.display = 'block';
        } else {
            textElem.style.display = 'none';
            buttonElem.style.display = 'none';
        }
    }

    // 插入dom元素
    function appendDomElems() {
        wrapElem = document.createElement('div');
        wrapElem.style = 'position: fixed; z-index: 9999; top: 30%; left: 50%; width: 720px; margin-left: -375px; text-align: center; background: rgba(0, 0, 0, 0.8); color: #fff; padding: 25px 20px; border-radius: 3px; ';

        statusElem = document.createElement('div');
        statusElem.style = 'font-size: 24px; color: #ff0;';
        statusElem.innerText = '数据加载中';

        textElem = document.createElement('textarea');
        textElem.style = 'display: none; margin-top:  24px; width: 100%; box-sizing: border-box; background: #fff; border: none; color: #000; padding: 20px 15px; border-radius: 3px 3px 0 0; font-size: 14px; line-height: 20px;';

        buttonElem = document.createElement('button');
        buttonElem.type = 'button';
        buttonElem.style = 'display: none; background: #56a4d6; border: none; color: #fff; padding: 20px 15px; border-radius: 0 0 3px 3px; font-size: 24px; cursor: pointer; width: 100%; box-sizing: border-box; ';
        buttonElem.innerText = '复制文案';
        buttonElem.onclick = copyText;

        wrapElem.appendChild(statusElem);
        wrapElem.appendChild(textElem);
        wrapElem.appendChild(buttonElem);

        document.body.appendChild(wrapElem);
    }

    // 获取随机评论文案
    function getText() {
        var randomText = textList[Math.floor(Math.random() * textList.length)];

        var randowLetters = '';
        var len = RANDOM_LETTERS.length;
        for (var i = 0; i < RANDOM_LENGTH; i++) {
            randowLetters += RANDOM_LETTERS.charAt(Math.floor(Math.random() * len));
        }

        return PREFIX + randowLetters + RANDOM_SEPERATE + randomText;
    }

    // 检查是否已经评论过
    function checkDone() {
        var comments = document.querySelectorAll('.comment-content>div');
        for (var i = 0; i < comments.length; i++) {
            var nameElem = comments[i].querySelector('.m-text-cut');
            if (nameElem && nameElem.innerText.trim() === MY_NAME) {
                return true;
            }
        }
        return false;
    }

    // 检查是不是自己的帖子
    function checkSelf() {
        return document.querySelector('.weibo-top .m-text-cut').innerText.trim() === MY_NAME;
    }

    function afterSubmit() {
        curTotal = curTotal + 1;
        var arr = [curTotal >= 30 ? '评论数已满30' : ('当前评论数：' + curTotal)];
        if (checkDone()) {
            arr.push('已评');
            showStatus(arr.join('，'), false);
        }
    }

    // 初始化
    function init(commentTextElem, qtyTab) {
        var commentText = commentTextElem.innerText.trim();

        textList = getTextList(commentText);

        curTotal = parseInt(qtyTab.children[1].children[1].innerText.trim());
        var isSelf = checkSelf();
        var hasDone = checkDone();

        var arr = [curTotal >= 30 ? '评论数已满30' : ('当前评论数：' + curTotal)];
        if (hasDone) {
            arr.push('已评');
        }
        if (isSelf) {
            arr.push('自己的帖子');
        }

        if (!hasDone && !isSelf) {
            showStatus(arr.join('，'), true);
            textElem.value = getText();

            // 监测评论列表
            var targetNode = document.querySelector('.comment-content');
            var observerOptions = {childList: true};
            var observer = new MutationObserver(afterSubmit);
            observer.observe(targetNode, observerOptions);

        } else {
            showStatus(arr.join('，'), false);
        }
    }

    // 检测文档是否加载完成
    function checkLoad(count) {
        // 超时刷新页面
        if (count > 20) {
            statusElem.innerText = '数据加载错误，请刷新页面';
            buttonElem.onclick = refresh;
        }
        var commentTextElem = document.querySelector('.weibo-main .weibo-text');
        var qtyTab = document.querySelector('.lite-page-tab');
        var loading = document.querySelector('.comment-content .m-tips');
        if (commentTextElem && qtyTab && loading && loading.style.display === 'none') {
            // 元素加载完成
            init(commentTextElem, qtyTab);
        } else {
            // 等待加载
            setTimeout(function () {
                checkLoad(count + 1)
            }, 200);
        }
    }

    appendDomElems();
    checkLoad();

})();