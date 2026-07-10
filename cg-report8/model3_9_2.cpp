#pragma region ヘッダ
#include "dx10.h"
#include "help9.h"
#include "model1.h"
//c++ 標準ヘッダ
#include <fstream>//file stream
//c++ コンテナ
#include <string>//文字列
//名前空間
using namespace std;//標準名前空間
#pragma endregion


#pragma region 列挙・構造体
//画像用列挙体
enum GAZOU { G_GAZOU, KNIGHT_GAZOU, GAZOU_MAX };

//オブジェクトタイプ
enum TYPE { G_TYPE, KNIGHT_TYPE, TYPE_MAX };

//ナイト(騎士)キャラの状態
enum KNIGHT_STATE { CHAKUTI_STATE, JUMP_STATE, KNIGHT_STATE_MAX };

//頂点構造体
struct VERTEX
{
	//頂点座標
	float
		x,//頂点のx座標
		y,//頂点のy座標
		z;//頂点のz座標
	unsigned diffuse;//反射光
	float u;//u座標
	float v;//v座標
};

//モデル構造体
struct MODEL
{
	int vn;
	int in;
	VEC vb[VERTEX_NUM];//頂点バッファ
	int ib[VERTEX_NUM * 3];//インデックスバッファ
	float uvb[VERTEX_NUM * 2];//UVバッファ
};

//3Dオブジェクト用構造体
struct OBJ
{
	VEC pos;//位置
	double ang;//回転角度
	double scale;//拡大率
	GAZOU gazou;//画像
	TYPE type;//モデルタイプ
	VEC vb[VERTEX_NUM];//頂点バッファ(移動後）
};
#pragma endregion


#pragma region 3Dオブジェクト静的定義
const char* GAZOU_NAME[GAZOU_MAX] = { "g.png", "knight.jpg" };//画像名
TEX GAZOUS[GAZOU_MAX];//テクスチャ画像
const char* MODEL_NAME[GAZOU_MAX] =
{ "stage2_2.x", "knight.x" };//モデル名
MODEL MODELS[TYPE_MAX];//1118変更
//G平面オブジェクト//位置，回転角度，拡大率，画像，タイプ，頂点バッファ//1111追加
OBJ g_plane = { VEC(), 0, 1, G_GAZOU, G_TYPE, {} };
//ナイト(騎士)オブジェクト//1118追加
OBJ knight = { VEC(0, 0, 45), D3DX_PI, 1, KNIGHT_GAZOU, KNIGHT_TYPE, {} };
VEC knight_vel = VEC(0, 0, 0);//ナイト(騎士)の速度//1125追加
KNIGHT_STATE knight_state = CHAKUTI_STATE;//ナイト(騎士)の状態//1125追加
float camera_ang = 0;//カメラの回転角度//1125追加
const float STAGE_SIZE = 500;//ステージサイズ//1125追加
#pragma endregion


#pragma region 関数宣言
void gazou_load();//画像のロード
void model_load();//モデルのロード
void camera_set();//カメラ行列の設定
void obj_draw(OBJ& obj);//オブジェクトの描画
void obj_update(OBJ& obj);//オブジェクトの更新
void knight_control();//ナイト(騎士)キャラをキーボードで制御
void knight_move();//ナイト(騎士)キャラの移動
void knight_fall();//ナイト(騎士)キャラの落下
void knight_chakuti();//ナイト(騎士)キャラが地面に着地する
#pragma endregion


#pragma region ゲームループ関数定義
//初期化
void initialize()
{
	input_init();//DirectX入力デバイスの初期化
	graphic_init();//DirectXグラフィックデバイスの初期化

	gazou_load();//画像のロード
	model_load();//モデルのロード

	camera_set();//カメラ行列の設定//1111追加

	obj_update(g_plane);//G画像平面モデル更新//1111追加
	obj_update(knight);//ナイト(騎士)画像モデル更新//1118追加
}

//更新
void update()
{
	key_read();

	if (key_on(DIK_ESCAPE))
	{
		finish = true;
	}

	//ナイト(騎士)更新
	knight_move();
	knight_fall();
	knight_chakuti();
	obj_update(knight);
	camera_set();
	
	//ナイト(騎士)の状態処理
	switch (knight_state)
	{
	case CHAKUTI_STATE:
		knight_control();
		break;
	case JUMP_STATE:
		break;
	}
}

//描画
void draw()
{
	//画面とZバッファを黒でクリア
	GRAPHIC_DEV->Clear(0, NULL, D3DCLEAR_TARGET, D3DCOLOR_XRGB(0, 0, 0), 1.0f, 0);
	GRAPHIC_DEV->Clear(0, NULL, D3DCLEAR_ZBUFFER, D3DCOLOR_XRGB(0, 0, 0), 1.0f, 0);

	//頂点バッファリングでバックバッファに描画
	GRAPHIC_DEV->BeginScene();
	obj_draw(g_plane);
	obj_draw(knight);//1118追加
	GRAPHIC_DEV->EndScene();

	//バックバッファを転送して描画
	GRAPHIC_DEV->Present(NULL, NULL, NULL, NULL);
}

//片づけ
void clear()
{
	//画像の片づけ
	for (int i = 0; i < GAZOU_MAX; i++)
	{
		GAZOUS[i]->Release();
		GAZOUS[i] = NULL;
	}

	INPUT_DEV->Release();
	GRAPHIC_DEV->Release();

	INPUT_DEV = NULL;
	GRAPHIC_DEV = NULL;
}
#pragma endregion


#pragma region ロード関数定義
//画像のロード
void gazou_load()
{
	HRESULT hr;
	for (int i = 0; i < GAZOU_MAX; i++)
	{
		hr = D3DXCreateTextureFromFile(GRAPHIC_DEV, GAZOU_NAME[i], &GAZOUS[i]);
		break_point_false(SUCCEEDED(hr));
	}
}

//モデルのロード
void model_load()
{
	for (int i = 0; i < TYPE_MAX; i++)
	{
		//モデルデータを文字列として読む
		char data[100000];
		string str;
		int str_size = 0;
		int size = 0;

		ifstream ifs(MODEL_NAME[i]);
		while (ifs && getline(ifs, str))
		{
			str_size = str.size();
			if (!str_size) continue;
			memcpy(&data[size], &str[0], str_size);
			size += str_size;
		}

		//モデル
		MODEL& model = MODELS[i];
		int& vn = model.vn;
		VEC* vb = model.vb;
		//文字列データのポインタ
		char* p = data;

		//頂点バッファのロード
		// "//VB"から，頂点バッファが始まる
		next((char*&)p, (char*)"//VB");
		next_kazu((char*&)p, (char*)";", vn);
		for (int i = 0; i < vn; i++)
		{
			next_kazu((char*&)p, (char*)";", (*vb).x);
			next_kazu((char*&)p, (char*)";", (*vb).y);
			next_kazu((char*&)p, (char*)";", (*vb).z);
			vb++;
			if (i < vn - 1) next((char*&)p, (char*)",");
		}

		//インデックスバッファのロード
		// "//IB"から，頂点バッファが始まる
		int& in = model.in;
		int* ib = model.ib;
		int type;
		int in2;
		next((char*&)p, (char*)"//IB");
		next_kazu((char*&)p, (char*)";", in2);
		in = in2;
		for (int i = 0; i < in2; i++)
		{
			next_kazu((char*&)p, (char*)";", type);
			next_kazu((char*&)p, (char*)",", *ib); ib++;
			next_kazu((char*&)p, (char*)",", *ib); ib++;
			if (type == 3)
			{
				next_kazu((char*&)p, (char*)";", *ib); ib++;
			}
			else if (type == 4)
			{
				next_kazu((char*&)p, (char*)",", *ib); ib++;
				*ib = *(ib - 3); ib++;
				*ib = *(ib - 2); ib++;
				next_kazu((char*&)p, (char*)";", *ib); ib++;
				in++;
			}
			else { break_point_true(true); }

			if (i < in2 - 1) next((char*&)p, (char*)",");
		}

		//UVバッファのロード
		// "//UV"から，頂点バッファが始まる
		int uvn;
		float* uvb = model.uvb;
		next((char*&)p, (char*)"//UVB");
		next_kazu((char*&)p, (char*)";", uvn);
		break_point_false(vn == uvn);
		for (int i = 0; i < uvn; i++)
		{
			next_kazu((char*&)p, (char*)";", *uvb); uvb++;
			next_kazu((char*&)p, (char*)";", *uvb); uvb++;
			if (i < uvn - 1)  next((char*&)p, (char*)",");
		}
	}
}
#pragma endregion


#pragma region 描画関数定義
//カメラ用行列設定関数
void camera_set(void)
{
	MAT view_mat;//ビュー(View)行列
	MAT proj_mat;//射影行列
	MAT world_mat;//ワールド座標行列

	//ナイト(騎士)キャラにカメラ追従//1125追加
	VEC pos = knight.pos;
	VEC dir = VEC(0, 0, 1);
	ang2dir(camera_ang, dir);
	VEC eye = pos;
	eye += dir * 6;
	eye.y += 4;
	VEC target = pos;
	target += dir*(-8);

    //ワールド座標の回転：  回転角度
	D3DXMatrixRotationY(&world_mat, 0);
	GRAPHIC_DEV->SetTransform(D3DTS_WORLD, &world_mat);

	//ビュー(View)行列の設定：  視点，対称点，頭上の向き
	VEC up = VEC(0, 1, 0);
	D3DXMatrixLookAtLH(&view_mat, &eye, &target, &up);//VEC(0, 4, 50) VEC(0, 0, 42)
	GRAPHIC_DEV->SetTransform(D3DTS_VIEW, &view_mat);

	//左手座標系パースペクティブ射影行列作成　視野角　横縦比　近接平面　遠方平面
	D3DXMatrixPerspectiveFovLH(&proj_mat, D3DX_PI / 3, WIN_W / WIN_H, 1, 1000);
	GRAPHIC_DEV->SetTransform(D3DTS_PROJECTION, &proj_mat);
}

//obj3D描画関数(DirectXでobj3D描画)
void obj_draw(OBJ& obj)
{
	//モデル
	MODEL& model = MODELS[obj.type];//オブジェクトのモデル

	//テクスチャ(画像)設定
	GRAPHIC_DEV->SetTexture(0, GAZOUS[obj.gazou]);

	//INDEX数 = 三角形数//1118変更 三角形数*3=>三角形数
	int in = model.in;//モデルのインデックス数

	VEC* vb = obj.vb;//オブジェクトの頂点バッファ
	int* ib = model.ib;//インデックスバッファ
	float* uvb = model.uvb;//UVバッファ

	//頂点バッファをロックする
	VERTEX* v;
	VB->Lock(0, 0, (void**)&v, 0);

	for (int i = 0; i < in * 3; i++)//1118変更 in=>in*3
	{
		//頂点バッファの座標
		v[i].x = vb[ib[i]].x;
		v[i].y = vb[ib[i]].y;
		v[i].z = vb[ib[i]].z;

		//頂点バッファの反射光は白
		v[i].diffuse = 0xffffffff;

		//uvバッファの座標
		v[i].u = uvb[2 * ib[i]];
		v[i].v = uvb[1 + 2 * ib[i]];
	}

	//頂点バッファをアンロックする
	VB->Unlock();

	//ストリームデータの設定
	GRAPHIC_DEV->SetStreamSource(0, VB, 0, sizeof(VERTEX));//頂点構造体のサイズ

	//レンダリング描画：三角形の描画，三角形の個数
	GRAPHIC_DEV->DrawPrimitive(D3DPT_TRIANGLELIST, 0, in);
}
#pragma endregion


#pragma region 更新関数定義
//オブジェクトの更新関数
void obj_update(OBJ& obj)
{
	//ワールド座標変換行列
	MAT trans_mat, rot_mat, scale_mat, world_mat;

	//ワールド座標変換行列の計算
	D3DXMatrixTranslation(&trans_mat, obj.pos.x, obj.pos.y, obj.pos.z);
	//D3DXMatrixRotationY(&rot_mat, obj.ang);
	//D3DXMatrixScaling(&scale_mat, obj.scale, obj.scale, obj.scale);
	//world_mat = scale_mat*rot_mat*trans_mat;
	world_mat = trans_mat;
	//break_point_false(world_mat._41==0);

	//モデル
	MODEL& model = MODELS[obj.type];//オブジェクトのモデル
	int vn = model.vn;//モデルの頂点数
	VEC* vb = model.vb;//モデルの頂点配列
	VEC* obj_vb = obj.vb;//オブジェクトの頂点配列

	for (int i = 0; i < vn; i++)
	{
		//ワールド座標変換行列のベクトルと掛け算
		D3DXVec3TransformCoord(&obj_vb[i], &vb[i], &world_mat);//頂点バッファ
	}
}

//ナイト(騎士)キャラをキーボードで制御//1125追加
void knight_control()
{
	bool
		mae = key_on(DIK_UP),
		usiro = key_on(DIK_DOWN),
		camera = key_on(DIK_C),
		migi = key_on(DIK_RIGHT),
		hidari = key_on(DIK_LEFT),
		jump = key_touch(DIK_J),
		knight_migi = migi & !camera,
		knight_hidari = hidari & !camera,
		camera_migi = migi & camera,
		camera_hidari = hidari & camera;

	knight_vel.x = 0;
	knight_vel.z = 0;

	if (!(mae | usiro | migi | hidari | jump)) return;

	if (knight_migi) 
		knight.ang += 0.05; 
	else if (knight_hidari) knight.ang -= 0.05;
	if (camera_migi) camera_ang += 0.05; 
	else if (camera_hidari) camera_ang -= 0.05;

	VEC vel = VEC(0, 0, -1);
	ang2dir(knight.ang, vel);
	knight_vel = VEC(0, 0, 0);
	if (mae) knight_vel = vel; 
	else if (usiro) knight_vel = -vel;

	if (jump)
	{
		knight_vel.y = 5;
		knight_state = JUMP_STATE;
	}
}

//ナイト(騎士)キャラの移動//1125追加
void knight_move()
{
	VEC& pos = knight.pos;
	pos += knight_vel;
	bound(pos.x, -STAGE_SIZE + 10, STAGE_SIZE - 10);
	bound(pos.z, -STAGE_SIZE + 10, STAGE_SIZE - 10);
}

//ナイト(騎士)キャラの落下//1125追加
void knight_fall()
{
	knight_vel.y += -0.1;
	bound(knight_vel.y, -5, 5);
}

//ナイト(騎士)キャラが地面に着地する//1125追加
void knight_chakuti()
{
	VEC& pos = knight.pos;
	VEC dir = VEC(0, 1, 0);
	VEC* vb = g_plane.vb;
	float u, v, dist;
	int in = MODELS[g_plane.type].in;
	int* ib = MODELS[g_plane.type].ib;
	int index = 0;
	for (int i = 0; i < in; i++)
	{
		if (D3DXIntersectTri(&vb[ib[0]], &vb[ib[1]], &vb[ib[2]], 
			&pos, &dir, &u, &v, &dist) && (dist > 0.0001))
		{
			pos += dir*dist;
			knight_vel.y = 0;
			knight_state = CHAKUTI_STATE;
			return;
		}
		ib += 3;
	}
}
#pragma endregion
