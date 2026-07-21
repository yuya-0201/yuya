# セットアップ手順書(Unity Editorでの作業)

このフォルダには C# スクリプトのみが入っています。`.unity`シーンファイルなど
バイナリ/ID依存のファイルはUnity Editor無しでは正しく作れないため、あえて含めていません。
以下の手順通りにUnity Editor上でシーンを組み立てれば、ビルド可能な状態になります。
所要時間の目安は2〜4時間です。

ゲーム名(仮): **スカイジャンパー**
内容: 2Dアクションジャンプゲーム。コインを集めながら敵を踏んで倒し、
制限時間内にゴールの旗に到達するとクリア。ライフ制(3回)。

---

## 0. 前提

- Unity Hub から新規プロジェクトを作成: テンプレートは **「2D (Core)」** を選択(Built-in Render Pipeline)。
- プロジェクト名は任意(例: SkyJumper)。

## 1. スクリプトの取り込み

1. 作成したUnityプロジェクトの `Assets` フォルダの中に `Scripts` フォルダを作る。
2. このリポジトリの `unity-game/Assets/Scripts/*.cs` を全てコピーして貼り付ける。
3. Unity Editorに戻ると自動的にコンパイルされる。コンソールにエラーが出ないことを確認する。

## 2. タグとレイヤーの準備

`Edit > Project Settings > Tags and Layers` で以下のタグを追加:

- `Player`
- `Enemy`
- `Hazard`
- `DeathZone`

レイヤーは `Ground` を追加(地面判定用)。

## 3. 素材(スプライト)の準備

自作の画像を使うか、Unity標準のプリミティブ(四角のスプライトなど)で代用してもよい。
既存アセットストアの素材を使う場合は、**必ずReadMeに出典を明記すること**(課題の必須条件)。

簡単に済ませる場合:
- `Assets > Create > Sprites > Square` などで単色スプライトを作り、Sprite Rendererの色を変えて
  プレイヤー/敵/コイン/地面を色分けするだけでも動作するゲームとして成立する。

## 4. シーンの構築

### 4-1. 地面・足場(Ground)

1. 空のGameObjectまたはSpriteを配置し、`BoxCollider2D` を付与。
2. レイヤーを `Ground` に設定。
3. 複製してステージの地形・足場を配置する(横に長いステージを想定)。

### 4-2. プレイヤー(Player)

1. 空のGameObjectを作成し `Player` と命名、タグを `Player` に設定。
2. 追加コンポーネント:
   - `Sprite Renderer`(見た目)
   - `Rigidbody2D`(Body Type: Dynamic, Freeze Rotation Z にチェック)
   - `Box Collider2D` または `Capsule Collider2D`
   - `Audio Source`
   - `PlayerController`(スクリプト)
   - `PlayerHealth`(スクリプト)
3. `Player` の子オブジェクトとして空の `GroundCheck` を作成し、プレイヤーの足元に配置。
4. `PlayerController` の Inspector で `Ground Check` に `GroundCheck` をドラッグし、
   `Ground Layer` に `Ground` レイヤーを指定。
5. `PlayerHealth` の `Respawn Point` にプレイヤーの初期位置(空オブジェクトでもよい)を指定。

### 4-3. 敵(Enemy)

1. 空のGameObjectを作成し `Enemy` と命名、タグを `Enemy` に設定。
2. コンポーネント:
   - `Sprite Renderer`
   - `Rigidbody2D`(Body Type: Kinematic を推奨。当たり判定は取れるが物理演算の影響を受けない)
   - `Box Collider2D`(IsTrigger は **オフ**。踏みつけ判定に衝突イベントを使うため)
   - `EnemyPatrol`(スクリプト)
3. シーン上に空オブジェクト `PointA` `PointB` を巡回範囲の両端に配置し、
   `EnemyPatrol` の Inspector にドラッグして登録。
4. 複数配置してステージに散らばせる。

### 4-4. コイン(Coin)

1. 空のGameObjectを作成し `Coin` と命名。
2. `Sprite Renderer` + `Circle Collider2D`(`Is Trigger` にチェック) + `Coin`(スクリプト)。
3. 複製してステージ上に配置。

### 4-5. トゲ・障害物(Hazard)

1. 空のGameObjectを作成し、タグを `Hazard` に設定。
2. `Sprite Renderer` + `Box Collider2D`(`Is Trigger` にチェック) + `Hazard`(スクリプト)。
3. 落下用の穴を作る場合は、ステージ下部に大きな`Box Collider2D`(`Is Trigger`)を置き、
   タグを `DeathZone` に設定(スクリプト不要、`PlayerHealth`が直接検知する)。

### 4-6. ゴール(Goal Flag)

1. 空のGameObjectを作成しステージ終端に配置。
2. `Sprite Renderer` + `Box Collider2D`(`Is Trigger`) + `GoalFlag`(スクリプト)。

### 4-7. カメラ

1. `Main Camera` に `CameraFollow`(スクリプト)を追加。
2. `Target` にプレイヤーをドラッグ。

## 5. UIの構築

1. `GameObject > UI > Canvas` を作成(Render Mode: Screen Space - Overlay)。
2. 以下のText(`GameObject > UI > Text`)をCanvas内に配置:
   - `ScoreText`(左上)
   - `LivesText`(左上、Scoreの下)
   - `TimerText`(右上)
3. ゲームオーバー用パネル `GameOverPanel`(`GameObject > UI > Panel`)を作成し、
   中に「GAME OVER」の見出しText、スコア表示Text、`Restart`ボタンを配置。
4. クリア用パネル `ClearPanel` も同様に作成し、「STAGE CLEAR」の見出し、スコア表示Text、
   `Restart`ボタンを配置。
5. どちらのパネルも最初は非アクティブ(チェックを外す)にしておく。

## 6. マネージャーオブジェクトの配置

1. 空のGameObject `GameManager` を作成し、`GameManager`(スクリプト)を追加。
2. 空のGameObject `UIManager` を作成し、`UIManager`(スクリプト)を追加。
   Inspectorで手順5のText/Panel類をそれぞれドラッグして登録する。
3. 各パネル内の `Restart` ボタンの `OnClick()` に `UIManager` オブジェクトをドラッグし、
   関数として `UIManager.OnClickRestart` を選択する。

## 7. サウンド(任意)

- `PlayerController` の `Jump Clip`、`Coin` の `Collect Clip` に任意の効果音(.wav/.mp3)を
  ドラッグして登録すると効果音が鳴る。BGMを鳴らす場合はMain CameraなどにAudio Sourceを追加し、
  `Play On Awake` と `Loop` を有効にしてBGMクリップを設定する。
- フリー素材を使う場合は出典をReadMeに明記すること。

## 8. 動作確認

- Playボタンで実際に動かし、以下を確認する:
  - 矢印キー/AD で移動、スペースキーでジャンプ
  - 敵を踏むと倒せる、横から触れるとダメージ
  - コインを取るとスコア加算
  - トゲ/穴でダメージ、ライフ0でゲームオーバー画面
  - 時間切れでゲームオーバー画面
  - ゴールでクリア画面
  - Restartボタンでシーンが再読み込みされる

## 9. ビルド(提出用ファイルの作成)

1. `File > Build Settings` を開き、`Add Open Scenes` で現在のシーンを追加。
2. `Edit > Project Settings > Player` で `Company Name` / `Product Name` を設定
   (学籍番号や名前を入れておくとよい)。
3. プラットフォームを選択してビルド:
   - **Windows**: `Windows` を選択し `Build`。出力フォルダの中に `.exe` と
     `_Data` フォルダなどが生成される。**このフォルダの中身すべて**が提出物になる
     (`.exe`単体では動かない)。
   - **Mac**: `macOS` を選択し `Build`。`.app` パッケージが生成される。
4. 出力フォルダに、Word/PDFで作成した `ReadMe` ファイルを追加する。
5. フォルダ全体(Windowsの場合)または `.app` + `ReadMe`(Macの場合)を
   ZIP圧縮し、ファイル名を `学籍番号.zip` にする。
6. **重要**: 提出前に、ビルドしたファイルだけを別フォルダにコピーし、
   Unity Editorを使わずに実際に起動できるか必ず確認すること。

## 10. 参考: 操作方法(ReadMeにもそのまま転記可)

- 左右移動: ← → キー または A / D キー
- ジャンプ: スペースキー
- 敵は上から踏むと倒せる、横から当たるとダメージ
- コインを集めるとスコア加算
- 制限時間内にゴールの旗に到達するとステージクリア
