import { useState, useMemo, useCallback, useEffect } from "react";

const CARDS = [
  // ブロックチェーン・Web3
  { id: 1, category: "ブロックチェーン・Web3", term: "VC (Verifiable Credentials)", definition: "W3C標準の検証可能な資格情報。改ざん不能・第三者検証可能。MMDの核心技術" },
  { id: 2, category: "ブロックチェーン・Web3", term: "DID (Decentralized Identifier)", definition: "分散型識別子。W3C v1.0正式勧告（2022）。中央管理者不要のID体系" },
  { id: 3, category: "ブロックチェーン・Web3", term: "SBT (Soulbound Token)", definition: "譲渡不可能なNFT。BLOCKSMITH&Co.でのインターン研究対象" },
  { id: 4, category: "ブロックチェーン・Web3", term: "Cardano", definition: "POSブロックチェーン。形式検証・低コストVC発行に強み。MMDが採用" },
  { id: 5, category: "ブロックチェーン・Web3", term: "Identus (旧PRISM)", definition: "IOGが開発したCardano上のVC/DIDインフラ（Cloud Agent）" },
  { id: 6, category: "ブロックチェーン・Web3", term: "Project Catalyst", definition: "Cardanoの分散型イノベーションファンド。非希薄化R&D資金調達手段" },
  { id: 7, category: "ブロックチェーン・Web3", term: "オフチェーンDAO", definition: "ブロックチェーン外で運営されるDAO的組織。地域コミュニティに適用可" },
  { id: 8, category: "ブロックチェーン・Web3", term: "eIDAS 2.0", definition: "EU電子ID規制。2026年施行。VC/DID普及の政策的追い風" },
  { id: 9, category: "ブロックチェーン・Web3", term: "W3C VC Data Model v2.0", definition: "2024年確定したVC標準仕様" },
  { id: 10, category: "ブロックチェーン・Web3", term: "NFT住民票", definition: "山古志・西川町（13.4倍応募）などの自治体事例。ウォレット問題あり" },
  { id: 11, category: "ブロックチェーン・Web3", term: "ERC-721 / ERC-1155", definition: "Ethereum NFT標準規格。VC(W3C)との対比で登場" },
  { id: 12, category: "ブロックチェーン・Web3", term: "ガス代", definition: "ブロックチェーントランザクション手数料。Cardanoは数円/件と低コスト" },

  // スタートアップ・ファイナンス
  { id: 13, category: "スタートアップ・ファイナンス", term: "J-KISS", definition: "日本版KISS。転換社債型の簡易投資契約。MMDはJ-KISS ¥3,000〜5,000万円を申請中" },
  { id: 14, category: "スタートアップ・ファイナンス", term: "メザニンローン", definition: "株式と債券の中間的な資金調達。J-KISSとの比較で登場" },
  { id: 15, category: "スタートアップ・ファイナンス", term: "バリュエーションキャップ (post-money cap)", definition: "転換時の上限評価額。MMDは¥3億円" },
  { id: 16, category: "スタートアップ・ファイナンス", term: "PMF (Product-Market Fit)", definition: "プロダクトが市場に適合した状態" },
  { id: 17, category: "スタートアップ・ファイナンス", term: "ARR (Annual Recurring Revenue)", definition: "年間経常収益。SaaSの主要KPI" },
  { id: 18, category: "スタートアップ・ファイナンス", term: "MRR (Monthly Recurring Revenue)", definition: "月次経常収益" },
  { id: 19, category: "スタートアップ・ファイナンス", term: "CAC (Customer Acquisition Cost)", definition: "顧客獲得コスト" },
  { id: 20, category: "スタートアップ・ファイナンス", term: "LTV (Life Time Value)", definition: "顧客生涯価値。コミュニティOSの核心指標" },
  { id: 21, category: "スタートアップ・ファイナンス", term: "チャーン率 (Churn Rate)", definition: "顧客離脱率。VC蓄積後に低下する想定" },
  { id: 22, category: "スタートアップ・ファイナンス", term: "SOM (Serviceable Obtainable Market)", definition: "実際に獲得可能な市場規模" },
  { id: 23, category: "スタートアップ・ファイナンス", term: "SAM (Serviceable Addressable Market)", definition: "到達可能な市場規模" },
  { id: 24, category: "スタートアップ・ファイナンス", term: "TAM (Total Addressable Market)", definition: "全体的な潜在市場規模" },
  { id: 25, category: "スタートアップ・ファイナンス", term: "ANRI VORTEX", definition: "ANRIが運営するシード期スタートアップ向け投資プログラム" },
  { id: 26, category: "スタートアップ・ファイナンス", term: "東大IPC 1stRound", definition: "東大発スタートアップ向け非エクイティ支援。最大1,000万円" },
  { id: 27, category: "スタートアップ・ファイナンス", term: "デューデリジェンス (DD)", definition: "投資前の詳細調査" },
  { id: 28, category: "スタートアップ・ファイナンス", term: "キャップテーブル", definition: "株主構成表" },
  { id: 29, category: "スタートアップ・ファイナンス", term: "ICTスタートアップリーグ", definition: "総務省の若手向け支援制度。MMDが検討" },

  // 地方創生・行政
  { id: 30, category: "地方創生・行政", term: "担い手活動", definition: "ボランティア・副業・地域自治会参加など、地域への実質的関与" },
  { id: 31, category: "地方創生・行政", term: "二地域居住促進法", definition: "2024年11月施行。「特定居住支援法人」を制度化" },
  { id: 32, category: "地方創生・行政", term: "特定居住支援法人", definition: "二地域居住促進法が新設した認定カテゴリ（NPO・DMO・不動産会社等）" },
  { id: 33, category: "地方創生・行政", term: "EBPM (Evidence-Based Policy Making)", definition: "証拠に基づく政策立案。VC発行数が定量的根拠に" },
  { id: 34, category: "地方創生・行政", term: "DMO (Destination Management Organization)", definition: "登録制度あり329組織。観光DX需要" },
  { id: 35, category: "地方創生・行政", term: "地方創生2.0", definition: "石破政権の地方政策。VC/DID活用を明文化" },
  { id: 36, category: "地方創生・行政", term: "デジタル田園都市国家構想交付金", definition: "DX型交付金。MMD採用自治体に加点4点" },
  { id: 37, category: "地方創生・行政", term: "地域DAO", definition: "ブロックチェーンの手法で地域コミュニティを運営するDAO型組織" },
  { id: 38, category: "地方創生・行政", term: "アンテナショップ", definition: "都道府県が首都圏等に設ける地域産品販売店。約300店舗" },
  { id: 39, category: "地方創生・行政", term: "関係人口VC", definition: "地域への継続的関与をVC形式で証明。富山アンテナショップモデル" },
  { id: 40, category: "地方創生・行政", term: "マイナンバーカード", definition: "プレミアム登録で本人確認必須。国のデジタルID基盤" },
  { id: 41, category: "地方創生・行政", term: "令和8年度", definition: "2026年度。ふるさと住民登録アプリのリリース目標" },

  // AI・機械学習
  { id: 42, category: "AI・機械学習", term: "Human-in-the-Loop (HITL)", definition: "機械学習パイプラインに人間の判断を組み込む設計手法" },
  { id: 43, category: "AI・機械学習", term: "LLM (Large Language Model)", definition: "大規模言語モデル。ChatGPT・Claude等の基盤技術" },
  { id: 44, category: "AI・機械学習", term: "RAG (Retrieval-Augmented Generation)", definition: "検索拡張生成。最新情報をLLMに注入" },
  { id: 45, category: "AI・機械学習", term: "チャーン予測", definition: "離脱ユーザーを事前に予測するML手法。VC蓄積後にMMDが活用予定" },
  { id: 46, category: "AI・機械学習", term: "VCグラフ × AIマッチング", definition: "検証済み行動履歴に基づくマッチング。Year 3の本番機能" },
  { id: 47, category: "AI・機械学習", term: "物体検知 (Object Detection)", definition: "YOLO等の画像内物体認識手法" },
  { id: 48, category: "AI・機械学習", term: "低Reynolds数 (低Re)", definition: "Re数が小さい（1000以下）流体領域。ドローン翼型設計の核心" },
  { id: 49, category: "AI・機械学習", term: "生成モデル (Generative Model)", definition: "データ分布を学習し新サンプルを生成するAIモデル" },
  { id: 50, category: "AI・機械学習", term: "Latent Diffusion Model", definition: "潜在空間上で動作する拡散生成モデル。翼型設計への応用" },
  { id: 51, category: "AI・機械学習", term: "AIペアプログラミング", definition: "Claude Codeなどを使った開発効率化。実質2〜3倍速" },
  { id: 52, category: "AI・機械学習", term: "Codex (OpenAI)", definition: "コードを生成・実行できるAIエージェント" },
  { id: 53, category: "AI・機械学習", term: "Deep Research", definition: "ChatGPTの長時間ウェブ調査モード" },
  { id: 54, category: "AI・機械学習", term: "embedding (埋め込み)", definition: "テキスト・行動をベクトル表現に変換する技術" },

  // 航空・ドローン工学
  { id: 55, category: "航空・ドローン工学", term: "Reynolds数 (Re)", definition: "流体の慣性力と粘性力の比。Re = ρUL/μ" },
  { id: 56, category: "航空・ドローン工学", term: "翼型 (Airfoil)", definition: "断面形状が揚力を生む翼断面。低Re域で設計が困難" },
  { id: 57, category: "航空・ドローン工学", term: "揚力係数 (CL)", definition: "揚力の無次元化指数" },
  { id: 58, category: "航空・ドローン工学", term: "抗力係数 (CD)", definition: "抗力の無次元化指数" },
  { id: 59, category: "航空・ドローン工学", term: "失速 (Stall)", definition: "迎え角が大きくなりすぎて揚力が急減する現象" },
  { id: 60, category: "航空・ドローン工学", term: "層流剥離 (Laminar Separation)", definition: "低Re特有の流れの現象。揚力低下の原因" },
  { id: 61, category: "航空・ドローン工学", term: "ロータ (Rotor)", definition: "回転翼。ドローンの推力源" },
  { id: 62, category: "航空・ドローン工学", term: "KV値", definition: "モータの電圧あたりの回転数（rpm/V）。ドローンの推力設計で重要なパラメータ" },
  { id: 63, category: "航空・ドローン工学", term: "ラミナ分離バブル", definition: "低Re流れで発生する層流剥離の気泡。翼型失速を引き起こす" },
  { id: 64, category: "航空・ドローン工学", term: "揚抗比 (L/D ratio)", definition: "揚力と抗力の比。空力性能の主要指標" },
  { id: 65, category: "航空・ドローン工学", term: "波状翼 (Wavy airfoil)", definition: "鯨のヒレを模した生物模倣翼型。揚力が大幅改善される事例あり" },
  { id: 66, category: "航空・ドローン工学", term: "BEMT (ブレード要素運動量理論)", definition: "2D翼型データからプロペラ・ロータの3D性能を計算する標準的な設計理論" },
  { id: 67, category: "航空・ドローン工学", term: "CST (Class Shape Transformation)", definition: "Kulfan提案の翼型形状パラメータ化手法。少パラメータで多様な翼型を表現可能" },
  { id: 68, category: "航空・ドローン工学", term: "Physics-informed loss", definition: "物理法則（PDE残差・境界条件等）をNNの損失関数に組み込む手法" },
  { id: 69, category: "航空・ドローン工学", term: "Neural Operator", definition: "関数から関数への写像を学習するNN（FNO等）。メッシュ非依存で物理シミュレーションを置き換える" },
  { id: 70, category: "航空・ドローン工学", term: "FEM (有限要素法)", definition: "偏微分方程式を数値的に解く計算力学の標準手法。計算コストが高い" },
  { id: 71, category: "航空・ドローン工学", term: "CFD (数値流体力学)", definition: "コンピュータで流体の流れを数値的にシミュレーションする手法" },

  // 電気機械・ロータ工学
  { id: 72, category: "電気機械・ロータ工学", term: "ブラシレスDCモータ (BLDC)", definition: "永久磁石を使った整流子レスモータ。高効率・長寿命でドローンや電動工具に多用" },
  { id: 73, category: "電気機械・ロータ工学", term: "アウターロータ型", definition: "ロータが外側を囲むモータ構造。大慣性で安定した回転特性。ドローンのプロペラ直結に最適" },
  { id: 74, category: "電気機械・ロータ工学", term: "インナーロータ型", definition: "ロータが内側にある標準的な構造。高回転・低トルク特性で高精度位置決めに適する" },
  { id: 75, category: "電気機械・ロータ工学", term: "ステッピングモーター", definition: "パルス信号で固定角度ずつ回転するモータ。エンコーダなしでオープンループ制御が可能" },
  { id: 76, category: "電気機械・ロータ工学", term: "サーボモーター", definition: "エンコーダをフィードバックしクローズドループで制御するモータ。精密位置決め用" },
  { id: 77, category: "電気機械・ロータ工学", term: "極数 (Pole count)", definition: "モータのN/S磁極の数。極数が多いほど低回転・高トルク、少ないほど高回転向き" },
  { id: 78, category: "電気機械・ロータ工学", term: "PWM制御 (Pulse Width Modulation)", definition: "デューティ比でモータへの平均電圧を制御する手法。ESCの基本原理" },

  // 経済学・マクロ
  { id: 79, category: "経済学・マクロ", term: "メザニンローン (Mezzanine Loan)", definition: "劣後ローンと株式の中間リスク商品。返済優先度が低い分、高利率が設定される" },
  { id: 80, category: "経済学・マクロ", term: "石油価格上限制度 (Price Cap)", definition: "G7・EUが導入したロシア産原油の価格上限規制（$60/バレル）。制裁の一環" },
  { id: 81, category: "経済学・マクロ", term: "シャドーフリート", definition: "制裁回避のため西側の保険・物流を使わずロシア石油を輸送する非登録タンカー群" },
  { id: 82, category: "経済学・マクロ", term: "デカップリング", definition: "経済・サプライチェーンの政治的切り離し。ロシア・中国との経済分離を指すことが多い" },
  { id: 83, category: "経済学・マクロ", term: "量的緩和 (QE)", definition: "中央銀行が国債等を市場から購入しマネーサプライを拡大する非伝統的金融政策" },
  { id: 84, category: "経済学・マクロ", term: "インフレターゲット", definition: "中央銀行が設定する目標インフレ率（通常2%）。金融政策の基準点" },
  { id: 85, category: "経済学・マクロ", term: "スタグフレーション", definition: "不況（停滞）とインフレが同時進行する状態。エネルギー危機時に顕在化しやすい" },
  { id: 86, category: "経済学・マクロ", term: "WTI (West Texas Intermediate)", definition: "米国産原油の先物価格指標。世界の原油市場のベンチマーク" },

  // コミュニティ・プロダクト設計
  { id: 87, category: "コミュニティ・プロダクト設計", term: "LINE Harness OSS", definition: "Shudesu/line-harness-ossのOSS。LINE × Cloudflare Workers設計" },
  { id: 88, category: "コミュニティ・プロダクト設計", term: "Webhook", definition: "サーバー間のリアルタイム通知仕組み。イベント駆動設計の基本" },
  { id: 89, category: "コミュニティ・プロダクト設計", term: "OpenAPI Spec", definition: "REST APIの仕様記述標準（Swagger）" },
  { id: 90, category: "コミュニティ・プロダクト設計", term: "GraphQL", definition: "APIクエリ言語。柔軟なデータ取得。REST APIと対比" },
  { id: 91, category: "コミュニティ・プロダクト設計", term: "オンボーディング", definition: "新規ユーザーへのプロダクト導入プロセス" },
  { id: 92, category: "コミュニティ・プロダクト設計", term: "コホート分析", definition: "同条件ユーザーグループの時系列行動分析" },
  { id: 93, category: "コミュニティ・プロダクト設計", term: "スイッチングコスト", definition: "他サービスへの移行コスト。API統合後に急上昇" },
  { id: 94, category: "コミュニティ・プロダクト設計", term: "ポイント経済圏", definition: "コミュニティ内で流通するポイントシステム。6ヶ月〜でロックイン" },
  { id: 95, category: "コミュニティ・プロダクト設計", term: "クエスト (Quest)", definition: "ゲーミフィケーション的な課題。完了でポイント・VC付与" },
  { id: 96, category: "コミュニティ・プロダクト設計", term: "Passkey / NextAuth", definition: "パスワードレス認証技術" },
  { id: 97, category: "コミュニティ・プロダクト設計", term: "マイグレーション", definition: "DBのスキーマ変更管理。慎重に扱う必要がある" },

  // 哲学・思想
  { id: 98, category: "哲学・思想", term: "vita activa", definition: "アーレントの「活動的生」。労働(labor)・仕事(work)・活動(action)の3区分" },
  { id: 99, category: "哲学・思想", term: "公的空間 (public realm)", definition: "アーレントの概念。行動(action)が現れる他者との共有空間" },
  { id: 100, category: "哲学・思想", term: "活動 (action / Arendt)", definition: "他者との間でのみ成立する人間行為。コミュニティの本質" },
  { id: 101, category: "哲学・思想", term: "polymath", definition: "多分野に精通した博識者。ChatGPTのカスタムGPT名でもある" },
  { id: 102, category: "哲学・思想", term: "BasicIncomeGPT", definition: "ベーシックインカムを議論・設計するGPT。社会設計への関心" },

  // エネルギー・インフラ
  { id: 103, category: "エネルギー・インフラ", term: "日本の電源構成", definition: "発電源ミックス（火力・原子力・再生可能エネルギーの割合）" },
  { id: 104, category: "エネルギー・インフラ", term: "NEDO (新エネルギー・産業技術総合開発機構)", definition: "経産省傘下の研究開発支援機関" },

  // ビジネス・営業
  { id: 105, category: "ビジネス・営業", term: "minerva", definition: "営業資料作成に使っているツール/グループ" },
  { id: 106, category: "ビジネス・営業", term: "インキュベーション施設", definition: "スタートアップ向け入居・支援施設。営業対象" },
  { id: 107, category: "ビジネス・営業", term: "Openclaw", definition: "法律・契約系のプロジェクト名" },

  // AI・機械学習（追加語彙）
  { id: 108, category: "AI・機械学習（追加）", term: "エージェント型AI", definition: "目標を与えられると自律的にツール呼び出し・計画立案・実行を行うAIシステム" },
  { id: 109, category: "AI・機械学習（追加）", term: "コンテキストウィンドウ", definition: "LLMが一度に処理できるテキストの最大長（トークン数）。長文書処理の制約" },
  { id: 110, category: "AI・機械学習（追加）", term: "ファインチューニング", definition: "事前学習済みモデルを特定タスクのデータで再訓練する手法。ドメイン特化に有効" },
  { id: 111, category: "AI・機械学習（追加）", term: "ゼロショット推論", definition: "学習データなしに指示だけでタスクを実行するLLMの能力。汎化性能の指標" },
  { id: 112, category: "AI・機械学習（追加）", term: "Agentic Loop", definition: "エージェントがツール実行→結果確認→次のアクション決定を繰り返す自律動作サイクル" },
  { id: 113, category: "AI・機械学習（追加）", term: "LoRA (Low-Rank Adaptation)", definition: "低ランク行列で大規模モデルを効率的に微調整する手法。GPU1枚でも学習可能" },
  { id: 114, category: "AI・機械学習（追加）", term: "QLoRA", definition: "LoRAに量子化を組み合わせた超軽量微調整手法。ベースモデルをINT4圧縮しつつ学習" },
  { id: 115, category: "AI・機械学習（追加）", term: "量子化 (Quantization)", definition: "モデル重みの精度を下げてメモリ・速度を改善する技術（FP32→FP16→INT8→INT4）" },
  { id: 116, category: "AI・機械学習（追加）", term: "KVキャッシュ", definition: "Transformerの過去トークンのKey/Valueを保存し推論を高速化する手法" },
  { id: 117, category: "AI・機械学習（追加）", term: "vLLM", definition: "PagedAttentionによるメモリ効率化を特徴とするOSSのLLM推論エンジン" },
  { id: 118, category: "AI・機械学習（追加）", term: "PRD (Product Requirements Document)", definition: "プロダクト要求仕様書。機能・目的・制約を定義する文書" },

  // 電気機械・ロータ工学（追加）
  { id: 119, category: "電気機械・ロータ工学（追加）", term: "かご形ロータ (Squirrel-cage rotor)", definition: "誘導電動機で最も一般的なロータ。導体バーとリングで構成、安価で堅牢" },
  { id: 120, category: "電気機械・ロータ工学（追加）", term: "永久磁石ロータ (PM rotor)", definition: "磁石内蔵のロータ。BLDC・サーボモータで高効率・高応答を実現" },
  { id: 121, category: "電気機械・ロータ工学（追加）", term: "SynRM (Synchronous Reluctance Motor)", definition: "同期リラクタンスモータ。磁石レスで省資源な産業機械向け" },
  { id: 122, category: "電気機械・ロータ工学（追加）", term: "外転型モータ (Outrunner)", definition: "ロータが外側で回転する構造。ドローン用途でトルクを発揮" },

  // 生物学・進化論
  { id: 123, category: "生物学・進化論", term: "性的二形 (Sexual dimorphism)", definition: "同一種のオスとメスで体の大きさ・色・構造などが異なる現象。進化生物学の基本概念" },
  { id: 124, category: "生物学・進化論", term: "性選択 (Sexual selection)", definition: "ダーウィンが提唱した、異性に選ばれるための形質が進化する理論。自然選択と並ぶ淘汰メカニズム" },
  { id: 125, category: "生物学・進化論", term: "ヒューマンジー (Humanzee)", definition: "人間とチンパンジーのハイブリッド概念。種の境界や人権の定義を問う思考実験" },

  // 医学・発達
  { id: 126, category: "医学・発達", term: "タナー段階 (Tanner stage)", definition: "思春期の二次性徴の進行を5段階で評価する医学的指標。外見的な身体変化で判定" },

  // ビジネス・商社
  { id: 127, category: "ビジネス・商社", term: "総合商社 (Sogo Shosha)", definition: "多業種を横断し投資・事業開発・物流を一体で行う日本独自の企業形態。世界に7社程度" },
  { id: 128, category: "ビジネス・商社", term: "専門商社 (Senmon Shosha)", definition: "特定分野（鉄鋼・食品・医療機器など）に特化した商社。総合商社との対比で使われる" },

  // カバラ・神秘主義
  { id: 129, category: "カバラ・神秘主義", term: "カバラ (Kabbalah)", definition: "ユダヤ教の神秘主義的伝統。宇宙・神・人間の構造を体系化した思想体系" },
  { id: 130, category: "カバラ・神秘主義", term: "セフィロト (Sefirot)", definition: "カバラの生命の樹における10の神的属性・顕れ方。宇宙創造の10段階とも" },
  { id: 131, category: "カバラ・神秘主義", term: "生命の樹 (Etz Chaim)", definition: "カバラの中心概念。神の創造プロセスと人間の内的構造を1枚の図に示す" },

  // 独自概念・造語
  { id: 132, category: "独自概念・造語", term: "iステップ", definition: "InstagramのDM・ステップ配信に特化したマーケ自動化SaaS。LステップのInstagram版" },
  { id: 133, category: "独自概念・造語", term: "Instagram Harness", definition: "Instagram公式APIを土台にしたAIネイティブな自動化基盤（著者提案概念）" },
  { id: 134, category: "独自概念・造語", term: "Social Harness", definition: "LINE・Instagram・Web・メールを同一人物IDで束ねる統合オーケストレーション基盤" },
  { id: 135, category: "独自概念・造語", term: "AIネイティブ", definition: "AI処理を設計の中心・前提に据えたシステムやサービス。後付けAIとの対比概念" },

  // 香り・フレグランス
  { id: 136, category: "香り・フレグランス", term: "トップノート", definition: "香水をつけてすぐ立ち上がる最初の香り。柑橘・ハーブ系が多く、5〜30分持続" },
  { id: 137, category: "香り・フレグランス", term: "ミドルノート", definition: "香水の本体となる中心的な香り。「その香水らしさ」を表し、30分〜数時間持続" },
  { id: 138, category: "香り・フレグランス", term: "ラストノート", definition: "香水の残り香。ムスク・ウッディ・アンバー系が多く、数時間持続する" },
  { id: 139, category: "香り・フレグランス", term: "パルファム", definition: "香料濃度が最も高い香水タイプ（約20〜30%）。少量で長時間持続" },
  { id: 140, category: "香り・フレグランス", term: "オードパルファム（EDP）", definition: "バランスよく日常使いしやすい中高濃度の香水タイプ" },
  { id: 141, category: "香り・フレグランス", term: "フゼア (Fougere)", definition: "ラベンダー・オークモス系のクラシックな香り系統。メンズ香水に多い" },
  { id: 142, category: "香り・フレグランス", term: "グルマン", definition: "バニラ・チョコ・砂糖のような食べ物系の甘い香り系統（香水分類）" },
  { id: 143, category: "香り・フレグランス", term: "光毒性 (Phototoxicity)", definition: "柑橘系精油が紫外線と反応して皮膚にダメージを引き起こす性質" },
  { id: 144, category: "香り・フレグランス", term: "薬機法", definition: "医薬品・化粧品・医療機器の製造・販売を規制する日本の法律。手作り香水の商品化に関係" },
];

const CATEGORY_COLORS = {
  "ブロックチェーン・Web3": { bg: "#EFF6FF", border: "#3B82F6", tag: "#2563EB" },
  "スタートアップ・ファイナンス": { bg: "#FEF3C7", border: "#F59E0B", tag: "#D97706" },
  "地方創生・行政": { bg: "#ECFDF5", border: "#10B981", tag: "#059669" },
  "AI・機械学習": { bg: "#F5F3FF", border: "#8B5CF6", tag: "#7C3AED" },
  "航空・ドローン工学": { bg: "#FFF1F2", border: "#F43F5E", tag: "#E11D48" },
  "電気機械・ロータ工学": { bg: "#FFF7ED", border: "#F97316", tag: "#EA580C" },
  "経済学・マクロ": { bg: "#F0FDF4", border: "#22C55E", tag: "#16A34A" },
  "コミュニティ・プロダクト設計": { bg: "#EFF6FF", border: "#0EA5E9", tag: "#0284C7" },
  "哲学・思想": { bg: "#FAF5FF", border: "#A855F7", tag: "#9333EA" },
  "エネルギー・インフラ": { bg: "#FEFCE8", border: "#EAB308", tag: "#CA8A04" },
  "ビジネス・営業": { bg: "#F1F5F9", border: "#64748B", tag: "#475569" },
  "AI・機械学習（追加）": { bg: "#F5F3FF", border: "#8B5CF6", tag: "#7C3AED" },
  "電気機械・ロータ工学（追加）": { bg: "#FFF7ED", border: "#F97316", tag: "#EA580C" },
  "生物学・進化論": { bg: "#FDF2F8", border: "#EC4899", tag: "#DB2777" },
  "医学・発達": { bg: "#F0FDFA", border: "#14B8A6", tag: "#0D9488" },
  "ビジネス・商社": { bg: "#F1F5F9", border: "#64748B", tag: "#475569" },
  "カバラ・神秘主義": { bg: "#FFFBEB", border: "#D97706", tag: "#B45309" },
  "独自概念・造語": { bg: "#F0F9FF", border: "#38BDF8", tag: "#0284C7" },
  "香り・フレグランス": { bg: "#FDF4FF", border: "#D946EF", tag: "#C026D3" },
};

const DEFAULT_COLOR = { bg: "#F8FAFC", border: "#94A3B8", tag: "#64748B" };

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardApp() {
  const categories = useMemo(() => [...new Set(CARDS.map(c => c.category))], []);
  const [selectedCats, setSelectedCats] = useState(new Set(categories));
  const [flipped, setFlipped] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [deck, setDeck] = useState(() => shuffle(CARDS));
  const [known, setKnown] = useState(new Set());
  const [showMenu, setShowMenu] = useState(false);
  const [studyMode, setStudyMode] = useState("all"); // "all" | "unknown"

  const filteredDeck = useMemo(() => {
    let d = deck.filter(c => selectedCats.has(c.category));
    if (studyMode === "unknown") d = d.filter(c => !known.has(c.id));
    return d;
  }, [deck, selectedCats, studyMode, known]);

  const card = filteredDeck[currentIdx] || null;
  const colors = card ? (CATEGORY_COLORS[card.category] || DEFAULT_COLOR) : DEFAULT_COLOR;

  const resetDeck = useCallback(() => {
    setDeck(shuffle(CARDS));
    setCurrentIdx(0);
    setFlipped(false);
  }, []);

  useEffect(() => {
    setCurrentIdx(0);
    setFlipped(false);
  }, [selectedCats, studyMode]);

  const next = () => { setCurrentIdx(i => Math.min(i + 1, filteredDeck.length - 1)); setFlipped(false); };
  const prev = () => { setCurrentIdx(i => Math.max(i - 1, 0)); setFlipped(false); };
  const toggleKnown = (id) => setKnown(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === " " || e.key === "Enter") { e.preventDefault(); setFlipped(f => !f); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });

  const progress = filteredDeck.length > 0 ? ((currentIdx + 1) / filteredDeck.length) * 100 : 0;
  const knownInDeck = filteredDeck.filter(c => known.has(c.id)).length;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)", fontFamily: "'Helvetica Neue', Arial, 'Hiragino Kaku Gothic ProN', sans-serif", color: "#E2E8F0", padding: "20px", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#F8FAFC" }}>MMD DAO 単語帳</h1>
        <p style={{ fontSize: 13, color: "#94A3B8", margin: "4px 0 0" }}>ChatGPT全履歴より自動抽出 — {CARDS.length}語</p>
      </div>

      {/* Stats bar */}
      <div style={{ maxWidth: 720, margin: "0 auto 12px", display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
        <span style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, padding: "6px 14px", fontSize: 13 }}>
          {currentIdx + 1} / {filteredDeck.length}
        </span>
        <span style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 8, padding: "6px 14px", fontSize: 13, color: "#4ADE80" }}>
          覚えた: {knownInDeck} / {filteredDeck.length}
        </span>
        <button onClick={() => setShowMenu(m => !m)} style={{ background: "#334155", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, color: "#E2E8F0", cursor: "pointer" }}>
          {showMenu ? "閉じる" : "設定"}
        </button>
        <button onClick={resetDeck} style={{ background: "#334155", border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 13, color: "#E2E8F0", cursor: "pointer" }}>
          シャッフル
        </button>
      </div>

      {/* Progress bar */}
      <div style={{ maxWidth: 720, margin: "0 auto 16px", background: "#1E293B", borderRadius: 4, height: 4, overflow: "hidden" }}>
        <div style={{ width: `${progress}%`, height: "100%", background: "linear-gradient(90deg, #3B82F6, #8B5CF6)", transition: "width 0.3s ease" }} />
      </div>

      {/* Settings panel */}
      {showMenu && (
        <div style={{ maxWidth: 720, margin: "0 auto 16px", background: "#1E293B", border: "1px solid #334155", borderRadius: 12, padding: 16 }}>
          <div style={{ marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8" }}>モード：</span>
            <button onClick={() => setStudyMode("all")} style={{ marginLeft: 8, background: studyMode === "all" ? "#3B82F6" : "#475569", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: 12, color: "#fff", cursor: "pointer" }}>全カード</button>
            <button onClick={() => setStudyMode("unknown")} style={{ marginLeft: 6, background: studyMode === "unknown" ? "#3B82F6" : "#475569", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: 12, color: "#fff", cursor: "pointer" }}>未習得のみ</button>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#94A3B8", marginBottom: 8 }}>カテゴリ選択：</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <button onClick={() => setSelectedCats(new Set(categories))} style={{ background: "#475569", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#fff", cursor: "pointer" }}>全選択</button>
            <button onClick={() => setSelectedCats(new Set())} style={{ background: "#475569", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, color: "#fff", cursor: "pointer" }}>全解除</button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
            {categories.map(cat => {
              const c = CATEGORY_COLORS[cat] || DEFAULT_COLOR;
              const on = selectedCats.has(cat);
              return (
                <button key={cat} onClick={() => {
                  const s = new Set(selectedCats);
                  on ? s.delete(cat) : s.add(cat);
                  setSelectedCats(s);
                }} style={{
                  background: on ? c.tag : "#334155",
                  border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11,
                  color: "#fff", cursor: "pointer", opacity: on ? 1 : 0.5, transition: "all 0.2s"
                }}>
                  {cat} ({CARDS.filter(x => x.category === cat).length})
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Card */}
      {card ? (
        <div style={{ maxWidth: 720, margin: "0 auto 20px", perspective: 1000 }}>
          <div
            onClick={() => setFlipped(f => !f)}
            style={{
              minHeight: 280,
              cursor: "pointer",
              borderRadius: 16,
              background: flipped ? colors.bg : "#1E293B",
              border: `2px solid ${colors.border}`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "32px 24px",
              transition: "all 0.35s ease",
              position: "relative",
              boxShadow: `0 4px 24px ${colors.border}33`,
            }}
          >
            {/* Category tag */}
            <span style={{
              position: "absolute", top: 16, left: 16,
              background: colors.tag, color: "#fff",
              fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20,
            }}>{card.category}</span>

            {/* Known badge */}
            <button onClick={(e) => { e.stopPropagation(); toggleKnown(card.id); }} style={{
              position: "absolute", top: 14, right: 16,
              background: known.has(card.id) ? "#4ADE80" : "#475569",
              border: "none", borderRadius: 20, padding: "3px 10px",
              fontSize: 11, color: "#fff", cursor: "pointer", transition: "all 0.2s"
            }}>
              {known.has(card.id) ? "覚えた" : "未習得"}
            </button>

            {/* Content */}
            {!flipped ? (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: "#F8FAFC", lineHeight: 1.3, marginBottom: 12 }}>{card.term}</div>
                <div style={{ fontSize: 13, color: "#64748B" }}>タップで答えを見る</div>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 16, fontWeight: 600, color: colors.tag, marginBottom: 12 }}>{card.term}</div>
                <div style={{ fontSize: 20, fontWeight: 500, color: "#1E293B", lineHeight: 1.6 }}>{card.definition}</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", padding: 40, color: "#94A3B8" }}>
          <p style={{ fontSize: 18 }}>該当するカードがありません</p>
          <p style={{ fontSize: 14 }}>設定からカテゴリを選択するか、モードを変更してください</p>
        </div>
      )}

      {/* Navigation */}
      {card && (
        <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", justifyContent: "center", gap: 12 }}>
          <button onClick={prev} disabled={currentIdx === 0} style={{
            background: currentIdx === 0 ? "#1E293B" : "#334155",
            border: "1px solid #475569", borderRadius: 10, padding: "10px 28px",
            fontSize: 15, color: currentIdx === 0 ? "#475569" : "#E2E8F0", cursor: currentIdx === 0 ? "default" : "pointer"
          }}>← 前</button>
          <button onClick={() => setFlipped(f => !f)} style={{
            background: "#3B82F6", border: "none", borderRadius: 10, padding: "10px 28px",
            fontSize: 15, color: "#fff", cursor: "pointer"
          }}>{flipped ? "問題に戻る" : "答えを見る"}</button>
          <button onClick={next} disabled={currentIdx >= filteredDeck.length - 1} style={{
            background: currentIdx >= filteredDeck.length - 1 ? "#1E293B" : "#334155",
            border: "1px solid #475569", borderRadius: 10, padding: "10px 28px",
            fontSize: 15, color: currentIdx >= filteredDeck.length - 1 ? "#475569" : "#E2E8F0",
            cursor: currentIdx >= filteredDeck.length - 1 ? "default" : "pointer"
          }}>次 →</button>
        </div>
      )}

      {/* Keyboard hint */}
      <div style={{ maxWidth: 720, margin: "16px auto 0", textAlign: "center", fontSize: 11, color: "#475569" }}>
        キーボード: ← → で移動 / Space で反転
      </div>
    </div>
  );
}