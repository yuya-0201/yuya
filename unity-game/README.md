# スカイジャンパー(Unity 期末レポート課題)

「ゲームプログラミング I」期末レポート用の2Dアクションジャンプゲームの素材一式です。
Unity Editor が無いこの開発環境では実際のビルドはできないため、
**C#スクリプト・組み立て手順書・提出用ReadMeのたたき台** を用意しています。

## フォルダ構成

```
unity-game/
├── Assets/Scripts/   ... Unityプロジェクトの Assets/Scripts にそのままコピーするC#スクリプト
├── SETUP_GUIDE.md    ... Unity Editorでシーンを組み立ててビルドするまでの詳細手順(日本語)
└── docs/
    └── ReadMe_template.docx ... 提出用ReadMeのたたき台(Word形式)。スクリーンショット等を追記して完成させる
```

## 進め方

1. `SETUP_GUIDE.md` の手順に従って、Unity Editor上でシーンを組み立てる。
2. Windows/Mac向けにビルドする。
3. `docs/ReadMe_template.docx` を開き、学籍番号・氏名・使用アセットの出典・
   スクリーンショットなどを埋めて完成させ、`ReadMe.docx`(または PDF)として保存する。
4. ビルド成果物一式 + ReadMe をZIP圧縮し、`学籍番号.zip` として提出する。

このリポジトリ自体は Next.js アプリのプロジェクトであり、Unityゲームとは別物です。
`unity-game/` フォルダの中身だけを、別途作成したUnityプロジェクトにコピーして使ってください。
