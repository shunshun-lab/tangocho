export const CATEGORIES = {
  ADJECTIVE: '形容詞（感情・性格）',
  VERB: '動詞（日常動作）',
  NOUN: '名詞（ビジネス）',
  CONJUNCTION: '接続詞・副詞',
};

export const words = [
  // 形容詞（感情・性格）
  { id: 1, category: CATEGORIES.ADJECTIVE, word: 'eloquent', meaning: '雄弁な・流暢な', example: 'She gave an eloquent speech.' },
  { id: 2, category: CATEGORIES.ADJECTIVE, word: 'resilient', meaning: '回復力がある・しなやかな', example: 'He is resilient in the face of adversity.' },
  { id: 3, category: CATEGORIES.ADJECTIVE, word: 'empathetic', meaning: '共感力がある・思いやりのある', example: 'A good leader is empathetic.' },
  { id: 4, category: CATEGORIES.ADJECTIVE, word: 'anxious', meaning: '不安な・心配している', example: 'She felt anxious before the interview.' },
  { id: 5, category: CATEGORIES.ADJECTIVE, word: 'diligent', meaning: '勤勉な・努力家の', example: 'He is a diligent student.' },
  { id: 6, category: CATEGORIES.ADJECTIVE, word: 'optimistic', meaning: '楽観的な', example: 'Try to stay optimistic.' },
  { id: 7, category: CATEGORIES.ADJECTIVE, word: 'melancholy', meaning: '憂鬱な・もの悲しい', example: 'He felt melancholy after the loss.' },
  { id: 8, category: CATEGORIES.ADJECTIVE, word: 'stubborn', meaning: '頑固な', example: 'She is too stubborn to change her mind.' },
  { id: 9, category: CATEGORIES.ADJECTIVE, word: 'charismatic', meaning: '魅力的な・カリスマ的な', example: 'The charismatic leader inspired everyone.' },
  { id: 10, category: CATEGORIES.ADJECTIVE, word: 'sincere', meaning: '誠実な・真摯な', example: 'Please accept my sincere apology.' },
  { id: 11, category: CATEGORIES.ADJECTIVE, word: 'timid', meaning: '臆病な・内気な', example: 'The timid child hid behind his mother.' },
  { id: 12, category: CATEGORIES.ADJECTIVE, word: 'grateful', meaning: '感謝している', example: 'I am grateful for your support.' },

  // 動詞（日常動作）
  { id: 13, category: CATEGORIES.VERB, word: 'negotiate', meaning: '交渉する', example: 'We need to negotiate the contract.' },
  { id: 14, category: CATEGORIES.VERB, word: 'collaborate', meaning: '協力する・共同作業する', example: 'Let\'s collaborate on this project.' },
  { id: 15, category: CATEGORIES.VERB, word: 'procrastinate', meaning: '先延ばしにする', example: 'Stop procrastinating and start now.' },
  { id: 16, category: CATEGORIES.VERB, word: 'commute', meaning: '通勤する', example: 'He commutes by train every day.' },
  { id: 17, category: CATEGORIES.VERB, word: 'meditate', meaning: '瞑想する', example: 'She meditates every morning.' },
  { id: 18, category: CATEGORIES.VERB, word: 'organize', meaning: '整理する・まとめる', example: 'Please organize your files.' },
  { id: 19, category: CATEGORIES.VERB, word: 'accomplish', meaning: '達成する・成し遂げる', example: 'We accomplished our goal.' },
  { id: 20, category: CATEGORIES.VERB, word: 'hesitate', meaning: '躊躇する・迷う', example: 'Don\'t hesitate to ask for help.' },
  { id: 21, category: CATEGORIES.VERB, word: 'prioritize', meaning: '優先する・優先順位をつける', example: 'Learn to prioritize your tasks.' },
  { id: 22, category: CATEGORIES.VERB, word: 'evaluate', meaning: '評価する', example: 'We need to evaluate the results.' },
  { id: 23, category: CATEGORIES.VERB, word: 'adapt', meaning: '適応する・順応する', example: 'We must adapt to change.' },
  { id: 24, category: CATEGORIES.VERB, word: 'allocate', meaning: '割り当てる・配分する', example: 'Allocate time wisely.' },

  // 名詞（ビジネス）
  { id: 25, category: CATEGORIES.NOUN, word: 'agenda', meaning: '議題・予定表', example: 'What\'s on the agenda today?' },
  { id: 26, category: CATEGORIES.NOUN, word: 'deadline', meaning: '締め切り・期限', example: 'The deadline is next Friday.' },
  { id: 27, category: CATEGORIES.NOUN, word: 'stakeholder', meaning: '利害関係者', example: 'We must consider all stakeholders.' },
  { id: 28, category: CATEGORIES.NOUN, word: 'revenue', meaning: '収益・売上', example: 'Revenue increased by 10%.' },
  { id: 29, category: CATEGORIES.NOUN, word: 'milestone', meaning: '重要な節目・マイルストーン', example: 'This is a major milestone for us.' },
  { id: 30, category: CATEGORIES.NOUN, word: 'leverage', meaning: '影響力・てこの作用', example: 'Use your network as leverage.' },
  { id: 31, category: CATEGORIES.NOUN, word: 'bandwidth', meaning: '処理能力・余裕（比喩的）', example: 'I don\'t have the bandwidth for that.' },
  { id: 32, category: CATEGORIES.NOUN, word: 'paradigm', meaning: 'パラダイム・思考の枠組み', example: 'A paradigm shift in the industry.' },
  { id: 33, category: CATEGORIES.NOUN, word: 'synergy', meaning: '相乗効果', example: 'There is great synergy between teams.' },
  { id: 34, category: CATEGORIES.NOUN, word: 'initiative', meaning: '主導権・取り組み', example: 'She took the initiative.' },
  { id: 35, category: CATEGORIES.NOUN, word: 'benchmark', meaning: '基準・指標', example: 'Set a benchmark for performance.' },
  { id: 36, category: CATEGORIES.NOUN, word: 'bottleneck', meaning: 'ボトルネック・障害', example: 'Identify the bottleneck in the process.' },
  { id: 37, category: CATEGORIES.NOUN, word: 'transparency', meaning: '透明性', example: 'Transparency builds trust.' },

  // 接続詞・副詞
  { id: 38, category: CATEGORIES.CONJUNCTION, word: 'furthermore', meaning: 'さらに・その上', example: 'Furthermore, we need to consider costs.' },
  { id: 39, category: CATEGORIES.CONJUNCTION, word: 'nevertheless', meaning: 'それにもかかわらず', example: 'It was hard; nevertheless, we succeeded.' },
  { id: 40, category: CATEGORIES.CONJUNCTION, word: 'consequently', meaning: 'その結果・したがって', example: 'Consequently, we changed our plan.' },
  { id: 41, category: CATEGORIES.CONJUNCTION, word: 'albeit', meaning: 'たとえ〜でも・〜ではあるが', example: 'It was a small, albeit significant change.' },
  { id: 42, category: CATEGORIES.CONJUNCTION, word: 'whereas', meaning: '一方・〜に対して', example: 'He is outgoing, whereas she is shy.' },
  { id: 43, category: CATEGORIES.CONJUNCTION, word: 'nonetheless', meaning: 'それでもやはり', example: 'It was difficult; nonetheless, I tried.' },
  { id: 44, category: CATEGORIES.CONJUNCTION, word: 'meanwhile', meaning: 'その間・一方で', example: 'Meanwhile, the team prepared the report.' },
  { id: 45, category: CATEGORIES.CONJUNCTION, word: 'conversely', meaning: '逆に・反対に', example: 'Conversely, the opposite may be true.' },
  { id: 46, category: CATEGORIES.CONJUNCTION, word: 'presumably', meaning: 'おそらく・推測では', example: 'Presumably, he already knows.' },
  { id: 47, category: CATEGORIES.CONJUNCTION, word: 'subsequently', meaning: 'その後・続いて', example: 'Subsequently, a new policy was created.' },
  { id: 48, category: CATEGORIES.CONJUNCTION, word: 'thereby', meaning: 'それによって', example: 'He worked hard, thereby earning respect.' },
  { id: 49, category: CATEGORIES.CONJUNCTION, word: 'notwithstanding', meaning: '〜にもかかわらず', example: 'Notwithstanding the risks, we proceeded.' },
];

export const STATUS = {
  NONE: 'none',
  KNOWN: 'known',
  UNKNOWN: 'unknown',
  SKIP: 'skip',
};
