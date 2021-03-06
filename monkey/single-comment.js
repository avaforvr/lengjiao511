// ==UserScript==
// @name         生成单条评论文案
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  根据微博帖子带的tag填写相应的评论文案
// @author       努力修行的棱角
// @match        https://m.weibo.cn/status/*
// @include      /^https:\/\/weibo\.com\/\d{10}\/[0-9a-zA-Z]{9}/
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // 配置项
    // --------------------------------------------------------------------------------
    // 评论前缀
    var PREFIX = '沪哲|';// 置顶| 来hui| 勿hui| 沪哲|

    // 微博名，改成你自己的名字，用于判断当前显示的是不是自己发的博
    var MY_NAME = '努力修行的棱角';

    // 一个帖子目标是多少条评论，攒积分30即可，刷超话经验值无上限
    var TARGET = 30;

    // 为了避免文案重复，每次生成文案前面加一个随机字符组合，待选字符越长，重复率越低
    var RANDOM_LETTERS = '世界和平国泰民安风调雨顺ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    // 随机字符组合的长度，数值越大，重复率越低
    var RANDOM_LENGTH = 3;
    // 随机字符与文案间的分隔符
    var RANDOM_SEPERATE = '|';

    // 自动捞评最长持续几分钟，超出这个时间停止自动填写
    var AUTO_CONTINUATION = 3;

    // 配置浮动元素背景色，按照自己的喜好定制颜色
    var COLORS = {
        todo: '#007bff', //未完成或未达成
        done: '#28a745', //已完成
        hint: '#ffc107', //提示或警告
        default: '#333', //默认颜色
    };

    // 配置词条对应的文案列表
    var BRAND_TEXT_LIST = [
        {
            brand: '每日一善',
            key: '每日一善',
            list: [
                '不要在小人身上浪费时间，将军有剑，不斩苍蝇。',
                '月色与雪色之间，你是第三种绝色。——余光中',
                '如果有一天：你不再寻找爱情，只是去爱；你不再渴望成功，只是去做；你不再追求空泛的成长，只是开始修养自己的性情；你的人生一切，才真正开始。——纪伯伦',
                '写你的名字可真难，倒不是笔画繁琐，只是写你名字时得蘸上四分春风，三分月色，两分微醺，还有一分你的眉目才好。——李长风',
                '向日葵莱莱总是显得无精打采的，大家都不知道为什么，只好劝他，白天要努力的进行光合作用哦。可是莱莱有着自己的小秘密，每天晚上它会独自看着月亮，用谁都听不见的声音说：“可我就是喜欢你呀。”',
                '这里荒芜寸草不生，后来你来这走了一遭，奇迹般万物生长，这里是我的心。——《沙漠》',
                '我从没被谁知道，所以也没被谁忘记。在别人的回忆中生活，并不是我的目的。',
                '命运不是风，来回吹，命运是大地，走到哪你都在命运中。——《英儿》',
                '小朋友才会仰天大哭，成年人会把哭调成静音连崩溃也很懂事。',
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
            ],
        },
        {
            brand: '可口可乐',
            key: '#和张哲瀚吃饭喝可口可乐#',
            list: [
                '炎炎夏日[太阳]，渴望冰爽🧊@可口可乐 携 张哲瀚@张哲瀚疯子 一起给你带来夏日最佳状态[可乐]恭喜张哲瀚成为可口可乐品牌大使！',
                '精彩刹那，活力一夏。美味在手，无线享受！哲一夏天，可口相伴！还等什么？无需犹豫！跟张哲瀚@张哲瀚疯子 一起，走进@可口可乐 的世界，迎接活力夏天，恭喜张哲瀚成为可口可乐品牌大使！',
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
                '和张哲瀚@张哲瀚疯子 一起吃美食，配冰可口可乐@可口可乐，畅享美味，快乐加倍！恭喜张哲瀚成为可口可乐品牌大使！',
                '恭喜青年演员张哲瀚@张哲瀚疯子 成为可口可乐品牌大使！炎炎夏日一起来杯冰爽可口吧！@可口可乐',
                '欢迎可口可乐品牌大使@张哲瀚疯子 加入饭局，以后一起快乐干饭美味加倍吧@可口可乐 ⛽️恭喜张哲瀚成为可口可乐品牌大使！',
            ],
        },
        {
            brand: '吕',
            key: '#吕御发代言人张哲瀚#',
            list: [
                '温和0添加，安心养护发@吕Ryo ,让你随时保持轻盈秀发，清爽一夏，和张哲瀚@张哲瀚疯子 一起养护洗发，秀出光彩，唤醒发丝活力',
                '不“屑”烦恼，焕“发”生机，洗护专家【吕】携手新晋御发代言人张哲瀚，“哲”个夏天，让我们秀发重现柔顺飘逸，做个光彩精致“吕”孩！张哲瀚@张哲瀚疯子',
                '生活总难免「秃」如其来的挑战，有【吕】防脱系列为你摆「脱」烦恼。携手御发代言人张哲瀚@张哲瀚疯子 ，为你开启秀发奢护之旅。精彩人生，与「吕」同游！',
                '水润无硅油，轻盈净秀发；修复受损，柔顺飘逸，与@张哲瀚疯子 一起，探索@吕Ryo 的护发秘籍，参入滋养，欢洗一夏！',
                '给你的秀发轻盈灵动每一天！【哲】为你倾心，有【吕】爱不停💛御发代言人张哲瀚甄选吕Ryo防脱强韧洗发水，要你的秀发丰盈柔顺！✨@张哲瀚疯子',
                '秀发轻盈灵动每一天，【哲】为你倾心！张哲瀚@张哲瀚疯子',
                '温和0添加，安心养护发！张哲瀚@张哲瀚疯子',
                '水润无硅油，轻盈净秀发，参入滋养，欢洗一夏！张哲瀚@张哲瀚疯子',
                '修复受损，柔顺飘逸，与@张哲瀚疯子 一起，探索@吕Ryo 的护发秘籍',
            ],
        },
        {
            brand: '百力滋',
            key: '#张哲瀚喊你吃夜宵百力滋# ',
            list: [
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
            ],
        },
        {
            brand: '梦幻新诛仙',
            key: '#张哲瀚梦幻新诛仙#',
            list: [
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
            ],
        },
        {
            brand: '美宝莲',
            key: '#张哲瀚美宝莲纽约品牌代言人#',
            list: [
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
            ],
        },
        {
            brand: 'TASAKI',
            key: '#张哲瀚TASAKI塔思琦品牌大使#',
            list: [
                '钻石的璀璨突出锋芒的一面，珍珠的温润则突出内敛的气质。恭喜张哲瀚@张哲瀚疯子 成为 @TASAKI塔思琦 品牌形象大使。',
                '珍珠与钻石的多元风格与张哲瀚的百变盲盒无限契合。恭喜张哲瀚@张哲瀚疯子 成为 @TASAKI塔思琦 品牌形象大使。',
                '最是那滴鲛人泪，晶莹凝重，圆润多彩，高雅纯洁，就如心中那颗星，清醒疯狂，热烈克制，熠熠生辉。恭喜张哲瀚@张哲瀚疯子 成为 @TASAKI塔思琦 品牌形象大使。',
                '当圆润邂逅锋芒，因温柔愈显强大。和@TASAKI塔思琦 全球首位品牌大使张哲瀚@张哲瀚疯子 一起，演绎璀璨灵魂，追求充盈人生。',
                '在无尽的想象世界中探索自我，演绎来自TASAKI珠宝中珍珠与钻石的多元风格与无限魅力。恭喜张哲瀚@张哲瀚疯子 成为 @TASAKI塔思琦 品牌形象大使。',
                '美如珍珠，真我闪耀，@TASAKI塔思琦 &  张哲瀚@张哲瀚疯子 解锁精致之美。恭喜张哲瀚成为TASAKI品牌大使！',
                '润泽，丝滑，温柔，娇贵。生活是一种态度，美有多种风度，挚爱张哲瀚@张哲瀚疯子 与@TASAKI塔思琦 的美！恭喜张哲瀚成为TASAKI品牌大使。',
                '你的珠宝，都是你的诉说。@TASAKI塔思琦 携手全球首位品牌大使张哲瀚@张哲瀚疯子 ，以颠覆态度演绎独家美学，将率性灵魂绽放至臻璀璨。',
                '雕琢一颗星，让光芒流转，无需万千语言，也能紧锁一生浪漫，与@TASAKI塔思琦 首位品牌大使张哲瀚@张哲瀚疯子 相遇，举手投足间，皆由你演绎。',
                '莹润于内，光华于外。是时间的凝结造就出的光芒璀璨，正如@张哲瀚疯子 耐心蛰伏，莹莹有光！恭喜张哲瀚成为@TASAKI塔思琦 首位品牌大使。',
                'TA是百变男神从不拘泥，SA气恣意自由生长，KI丽多姿崭露锋芒。@TASAKI塔思琦 和@张哲瀚疯子 从外表到内涵完美契合天造地设，美丽无须多言，只需静静赏看！',
                'TASAKI珠宝在顾盼流连间唯美尽现，每一个瞬间都蕴藏着无限精彩，携手@TASAKI塔思琦 首位品牌大使张哲瀚@张哲瀚疯子 一同漫步盛夏，笑看红尘。',
                '无上品质，显露溢彩华美，极致匠心，彰显高雅品味。@TASAKI塔思琦 携手全球首位品牌大使张哲瀚@张哲瀚疯子 邀你共赴一场不羁浪漫之旅，你的珠宝，唯你珍宝。',
                '光阴沉淀，砥砺明珠璀璨温润斑斓，亦有宝钻锋铦灿焕绮绚；光莹潋滟，传递匠心浪漫魅力无限，亦见工艺凝湛品质超然。@TASAKI塔思琦 首位品牌大使张哲瀚@张哲瀚疯子 邀你共赏至臻经典华彩盛宴。',
                '彗星如坠恒星绘，化作数颗珍珠泪，佳人襟前袖间垂，温润相映熠生辉。工艺精粹，创意凝汇，琦瑰璀玮，瀚动心扉，与@TASAKI塔思琦 首位品牌大使张哲瀚@张哲瀚疯子 共赏珠宝的尊魅华贵。',
                '旖旎珠光，斑斓成章：一腔倔强聚锋芒，十分闪亮恣张扬，百变魅力哲思享，万千精彩尽瀚畅。@TASAKI塔思琦 首位品牌大使张哲瀚@张哲瀚疯子 邀你共赏。',
                '魂牵梦萦，瑰思琦行，珠光宝气四方映。巧夺天工，匠心独运，斑斓如虹，剔透玲珑，张哲瀚@张哲瀚疯子 邀你共赏@TASAKI塔思琦 的魅力雍容，恭喜张哲瀚成为TASAKI塔思琦首位品牌大使！',
                '珠光钻采，佳质优材，琦思珍爱，别出心裁； 锋芒自在，千里快哉，哲般澎湃，浩瀚成海。 张哲瀚@张哲瀚疯子 邀你共赏@TASAKI塔思琦 的奢雅至臻魅力绝代，恭喜张哲瀚成为TASAKI塔思琦首位品牌大使！',
                '最是珠彩斑斓，钻辉璀璨，琦思绚焕，哲般震瀚，张哲瀚@张哲瀚疯子 邀你共赏@TASAKI塔思琦 的奢华灿烂优雅浪漫，匠心不凡魅力无限，恭喜张哲瀚成为TASAKI塔思琦首位品牌大使！',
                '千淘万漉，方得一斛琦丽明珠。与张哲瀚@张哲瀚疯子 一同领略@TASAKI塔思琦 品质臻著光彩夺目，惊艳哲服震瀚无数，恭喜张哲瀚成为TASAKI塔思琦首位品牌大使！',
                '牡丹「瀚」露真珠颗，美人「哲」向庭前过。张扬自我哲思烁，灯塔琦丽星河阔。张哲瀚@张哲瀚疯子 邀你一同领略@TASAKI塔思琦 的优雅华奢、摩登魅惑，恭喜张哲瀚成为TASAKI塔思琦首位品牌大使！',
                '明眸善睐哲思怀，珍宝琦特匠心裁，“塔”浪拾贝瑶珠戴，张灯结彩星辰摘。与张哲瀚@张哲瀚疯子 共赏@TASAKI塔思琦 的至臻风采，恭喜张哲瀚成为TASAKI塔思琦首位品牌大使！',
            ],
        },
    ];

    // 没有匹配词条时使用的默认文案
    var DEFAULT_TEXT_LIST = [
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

    // 数据
    // --------------------------------------------------------------------------------
    var isMSinglePage = window.location.host === 'm.weibo.cn'; //m.开头的单条帖子页面

    // 全局数据
    var state = {
        qty: 0, // 当前评论总数
        uniqueQty: 0,
        status: '待评', //当前状态 待评|已评|自己
        text: '', //新文案
        textList: null
    };

    // 根据博文词条匹配评论文案列表
    function getTextList (str) {
        for (var i = 0; i < BRAND_TEXT_LIST.length; i ++) {
            var item = BRAND_TEXT_LIST[i];
            if (str.indexOf(item.key) !== - 1 && item.list.length > 0) {
                return item.list;
            }
        }
        return DEFAULT_TEXT_LIST;
    }

    // 获取随机评论文案
    function getText () {
        var textList = state.textList;
        var randomText = textList[Math.floor(Math.random() * textList.length)];

        var randowLetters = '';
        var len = RANDOM_LETTERS.length;
        for (var i = 0; i < RANDOM_LENGTH; i ++) {
            randowLetters += RANDOM_LETTERS.charAt(Math.floor(Math.random() * len));
        }

        return PREFIX + randowLetters + RANDOM_SEPERATE + randomText;
    }

    // 页面 DOM
    // --------------------------------------------------------------------------------
    // 获取页面 DOM 元素
    var pageElemsQuery = {
        pageWrap: function () {
            //微博正文容器
            return document.querySelector('.lite-page-wrap');
        },
        blogger: function () {
            // 博主
            return isMSinglePage
                ? document.querySelector('.weibo-top .m-text-cut')
                : document.querySelector('.head_name_24eEB>span');
        },
        weiboText: function () {
            //微博正文容器
            return isMSinglePage
                ? document.querySelector('.weibo-main .weibo-text')
                : document.querySelector('.detail_wbtext_4CRf9');
        },
        qtyBar: function () {
            //显示点赞评的工具栏
            return isMSinglePage
                ? document.querySelector('.lite-page-tab')
                : document.querySelector('.toolbar_main_3Mxwo');
        },
        list: function () {
            //评论列表
            return document.querySelector('.comment-content');
        },
        listLoading: function () {
            //评论列表中的loading元素
            return document.querySelector('.comment-content .m-tips');
        },
        formTrigger: function () {
            //评论表单显示前显示的元素
            return document.querySelector('.m-text-cut.focus');
        },
        input: function () {
            //填写评论的文本域
            return document.querySelector('.composer-mini-wrap textarea');
        },
        submitBtn: function () {
            //提交评论的按钮
            return document.querySelector('.composer-mini-wrap .btn-send');
        },
    }

    // 页面 DOM 元素，初始全部赋值null
    var pageElems = (function () {
        var obj = {};
        for (var key in pageElemsQuery) {
            obj[key] = null;
        }
        return obj;
    })();

    // 获取数据
    function getState () {
        var comments = pageElems.list.children;
        // 评论总数
        state.qty = comments.length - 1;

        if (pageElems.blogger.innerText.trim() === MY_NAME) {
            // 判断是不是自己的帖子
            state.status = '自己';
        } else {
            // 判断是不是已经评论过
            for (var i = 0; i < comments.length; i ++) {
                var nameElem = comments[i].querySelector('.m-text-cut');
                if (nameElem && nameElem.innerText.trim() === MY_NAME) {
                    state.status = '已评';
                    break;
                }
            }
        }

        var reviewers = [];
        for (var i = 0; i < comments.length; i ++) {
            var nameElem = comments[i].querySelector('.m-text-cut');
            if (nameElem) {
                reviewers.push(nameElem.innerText.trim());
            }
        }
        state.uniqueQty = Array.from(new Set(reviewers)).length;

        // 生成评论文案
        state.textList = getTextList(pageElems.weiboText.innerText);
        state.text = getText();
    }

    // 浮层 DOm
    // --------------------------------------------------------------------------------
    // 浮层 DOM 元素
    var floatElems = {
        wrap: null, // 最外层容器
        qty: null, // 评论总数
        status: null, // 状态
        autoBtn: null, //自动捞评
        copyInput: null, //隐藏的待复制文本域
        copyBtn: null, // 复制按钮
        commentBtn: null, // 评论按钮
        loading: null, //加载中
    };

    // 复制
    function copy () {
        floatElems.copyInput.select();
        document.execCommand('copy');
        floatElems.copyBtn.innerHTML = '&radic;';
        setTimeout(function () {
            floatElems.copyBtn.innerText = '复制';
            state.text = getText();
            updateFloat();
        }, 300);
    }

    function fillAndSubmit (input) {
        input.value = state.text;
        var evt = new InputEvent('input', {
            inputType: 'insertText',
            data: 'trigger',
            dataTransfer: null,
            isComposing: false,
        });
        input.dispatchEvent(evt);

        setTimeout(function () {
            pageElemsQuery.submitBtn().click();
        }, 200);
    }

    // 评论
    function comment () {
        var input = pageElemsQuery.input();
        if (input) {
            fillAndSubmit(input);
        } else {
            pageElems.formTrigger.click();
            setTimeout(function () {
                var input = pageElemsQuery.input();
                fillAndSubmit(input);
            }, 200);
        }
    }

    // 获取浮动元素的样式
    function getFloatItemStyle (bgColor) {
        return 'background: ' + bgColor + ';color: #fff;width: 100%;margin-bottom: 20px;line-height: 50px;font-size: 24px;border-radius: 3px;';
    }

    // 插入Loading元素
    function appendFloatLoading () {
        floatElems.wrap = document.createElement('div');
        floatElems.wrap.style = 'position: fixed;z-index: 9999;bottom: 100px;right: 30px;width: 80px;text-align: center;';

        floatElems.loading = document.createElement('div');
        floatElems.loading.style = 'background: #333;color: #fff;line-height: 50px;font-size: 16px;border-radius: 3px;';
        floatElems.loading.innerText = '加载中';
        floatElems.wrap.appendChild(floatElems.loading);

        document.body.appendChild(floatElems.wrap);
    }

    // 插入提示和按钮元素
    function appendFloatMain () {
        floatElems.loading.remove();

        floatElems.qty = document.createElement('div');
        floatElems.qty.style = getFloatItemStyle(COLORS.default);
        floatElems.qty.innerText = '0';
        floatElems.wrap.appendChild(floatElems.qty);

        floatElems.status = document.createElement('div');
        floatElems.status.style = getFloatItemStyle(COLORS.default);
        floatElems.status.innerText = '待评';
        floatElems.wrap.appendChild(floatElems.status);

        floatElems.autoBtn = document.createElement('button');
        floatElems.autoBtn.style = getFloatItemStyle(COLORS.default) + 'border: none;cursor: pointer;';
        floatElems.autoBtn.innerText = '自动';
        floatElems.autoBtn.onclick = switchAuto;
        floatElems.wrap.appendChild(floatElems.autoBtn);

        floatElems.copyInput = document.createElement('textarea');
        floatElems.copyInput.style = 'position:absolute;top: -2000px;z-index: -1;height: 0;border: none;opacity: 0;';
        floatElems.copyInput.value = '尚未生成文案';
        floatElems.wrap.appendChild(floatElems.copyInput);

        floatElems.copyBtn = document.createElement('button');
        floatElems.copyBtn.style = getFloatItemStyle(COLORS.todo) + 'border: none;cursor: pointer;';
        floatElems.copyBtn.innerText = '复制';
        floatElems.copyBtn.onclick = copy;
        floatElems.wrap.appendChild(floatElems.copyBtn);

        floatElems.commentBtn = document.createElement('button');
        floatElems.commentBtn.style = getFloatItemStyle(COLORS.todo) + 'border: none;cursor: pointer;';
        floatElems.commentBtn.innerText = '评论';
        floatElems.commentBtn.onclick = comment;
        floatElems.wrap.appendChild(floatElems.commentBtn);
    }

    // 更新浮层
    function updateFloat () {
        floatElems.qty.innerText = state.qty + '|' + state.uniqueQty;
        floatElems.status.innerText = state.status;
        floatElems.copyInput.value = state.text;
        floatElems.copyBtn.title = state.text;
        floatElems.commentBtn.title = state.text;

        if (state.qty >= TARGET) {
            floatElems.qty.style.background = COLORS.done;
        }
        if (state.status === '自己') {
            floatElems.status.style.background = COLORS.hint;
            floatElems.commentBtn.style.display = 'none'; //自己的帖子隐藏评论按钮
        } else if (state.status === '已评') {
            floatElems.status.style.background = COLORS.done;
        }
    }

    // 更新浮动按钮背景色
    function updateFloatAuto (isAuto) {
        floatElems.autoBtn.style.background = isAuto ? COLORS.done : COLORS.default;
    }

    // 评论完成后更新数据
    function afterComment () {
        state.qty = state.qty + 1;
        state.status = '已评';
        state.text = getText();
        updateFloat();
    }

    // 数据存取
    // --------------------------------------------------------------------------------
    var storageKey = 'autoTime';

    function getNowTime () {
        return new Date().getTime();
    }

    function isAutoComment () {
        var autoTime = localStorage.getItem(storageKey);
        if (autoTime) {
            return getNowTime() - parseInt(autoTime) < AUTO_CONTINUATION * 60 * 1000;
        }
        return false;
    }

    function switchAuto () {
        if (isAutoComment()) {
            localStorage.removeItem(storageKey);
            updateFloatAuto(false);
        } else {
            localStorage.setItem(storageKey, getNowTime());
            updateFloatAuto(true);
        }
    }

    // 交互
    // --------------------------------------------------------------------------------
    // 等待页面加载完成
    function waitLoad (count) {
        // 加载时间超出20秒，提示刷新页面
        if (count > 100) {
            floatElems.loading.innerHTML = '失败';
        }

        setTimeout(function () {
            // 等待必需 Dom 元素加载完成
            var requiredElems = ['pageWrap', 'blogger', 'weiboText', 'qtyBar', 'list', 'listLoading', 'formTrigger'];
            var i, key;
            for (i = 0; i < requiredElems.length; i ++) {
                key = requiredElems[i];
                pageElems[key] = pageElems[key] || pageElemsQuery[key]();
                if (!pageElems[key]) {
                    waitLoad(count + 1);
                    return;
                }
            }
            if (isMSinglePage) {
                if (pageElems.listLoading.style.display !== 'none') {
                    waitLoad(count + 1);
                } else {
                    // 滚动到页面底部，加载所有评论
                    window.scrollTo(0, pageElems.pageWrap.offsetHeight);
                    setTimeout(function () {
                        if (pageElems.listLoading.style.display !== 'none') {
                            waitLoad(count + 1);
                        } else {
                            // 数据加载完成，页面滚回顶部
                            window.scrollTo(0, 0);
                            afterLoad();
                        }
                    }, 200);
                }
            }
        }, 200);
    }

    function afterLoad () {
        appendFloatMain();
        getState();
        updateFloat();

        // 检查是否是自动评论模式
        var isAuto = isAutoComment();
        updateFloatAuto(isAuto);

        if (state.status === '待评') {
            // 自动评论（连续捞评）模式下，打开页面自动填写评论并提交
            if (isAuto) {
                comment();
            }

            // 监测评论列表变更
            var observerOptions = { childList: true };
            var observer = new MutationObserver(afterComment);
            observer.observe(pageElems.list, observerOptions);
        }
    }

    // 开始执行
    // --------------------------------------------------------------------------------
    // 插入Loading元素
    appendFloatLoading();

    // 等待页面加载完成
    waitLoad(1);
})();
