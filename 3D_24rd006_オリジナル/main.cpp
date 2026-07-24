//
// 3D Jump Action Demo (課題A)
// Direct3D9 + D3DX9 を直接呼び出すサンプル実装（DXライブラリ等のラッパーは未使用）
//
// 実装している内容:
//   - キャラクタは矢印キー(または WASD)で移動し、Space でジャンプする
//   - 地面以外の「台」を2種類用意
//       ・静止台 (灰色) : キャラクタがぶつかるとめり込まずに止まる。上に乗ってジャンプ着地できる
//       ・樽 (茶色, movable) : キャラクタが押すと一緒に動く。上に乗ってジャンプ着地もできる
//   - 衝突解決は AABB (直方体) 同士の軸別分離処理 (X -> Z -> Y の順) で行っている
//
// ビルドについて:
//   このコードは Windows + DirectX SDK (d3d9.h / d3dx9.h, d3d9.lib / d3dx9.lib) が
//   前提です。Linux 環境ではビルド・実行できません。必ず Visual Studio で
//   Bin.Debug フォルダの exe を実行して動作確認してください。
//

#include <windows.h>
#include <d3d9.h>
#include <d3dx9.h>
#include <vector>
#include <cmath>

#pragma comment(lib, "d3d9.lib")
#pragma comment(lib, "d3dx9.lib")
#pragma comment(lib, "winmm.lib")

// ---------------------------------------------------------------------------
// 定数
// ---------------------------------------------------------------------------
static const int   WINDOW_WIDTH    = 800;
static const int   WINDOW_HEIGHT   = 600;
static const float  MOVE_SPEED      = 6.0f;   // 移動速度 [unit/sec]
static const float  JUMP_SPEED      = 9.0f;   // ジャンプ初速 [unit/sec]
static const float  GRAVITY         = -22.0f; // 重力加速度 [unit/sec^2]
static const float  TERMINAL_VEL    = -30.0f; // 落下速度の下限
static const float  GROUND_Y        = 0.0f;   // 地面の高さ

// ---------------------------------------------------------------------------
// グローバル
// ---------------------------------------------------------------------------
LPDIRECT3D9             g_pD3D          = NULL;
LPDIRECT3DDEVICE9       g_pd3dDevice    = NULL;
LPD3DXMESH              g_pPlayerMesh   = NULL;
LPD3DXMESH              g_pGroundMesh   = NULL;
LPD3DXMESH              g_pBoxMesh      = NULL; // 静止台・樽で共有（スケールは表示時に調整）

// ---------------------------------------------------------------------------
// AABB を持つ箱オブジェクト（台・樽・プレイヤー共通）
// ---------------------------------------------------------------------------
struct Box
{
    D3DXVECTOR3 position;    // 中心座標
    D3DXVECTOR3 halfExtents; // 半径（幅/2, 高さ/2, 奥行/2）
    D3DXCOLOR   color;
    bool        movable;     // true: キャラクタが押すと動く「樽」

    Box(const D3DXVECTOR3& pos, const D3DXVECTOR3& half, D3DXCOLOR col, bool mov)
        : position(pos), halfExtents(half), color(col), movable(mov) {}
};

static bool AABBOverlap(const D3DXVECTOR3& posA, const D3DXVECTOR3& extA,
                         const D3DXVECTOR3& posB, const D3DXVECTOR3& extB)
{
    return fabsf(posA.x - posB.x) < (extA.x + extB.x) &&
           fabsf(posA.y - posB.y) < (extA.y + extB.y) &&
           fabsf(posA.z - posB.z) < (extA.z + extB.z);
}

// ---------------------------------------------------------------------------
// プレイヤー
// ---------------------------------------------------------------------------
struct Player
{
    D3DXVECTOR3 position;
    D3DXVECTOR3 velocity;
    D3DXVECTOR3 halfExtents;
    float       facing;   // Y軸回転角（ラジアン）
    bool        grounded;

    Player()
        : position(0.0f, 1.0f, -6.0f)
        , velocity(0.0f, 0.0f, 0.0f)
        , halfExtents(0.5f, 1.0f, 0.5f)
        , facing(0.0f)
        , grounded(false)
    {}

    void Update(float dt, std::vector<Box>& platforms)
    {
        // --- 入力 ---
        float inputX = 0.0f, inputZ = 0.0f;
        if (GetAsyncKeyState(VK_LEFT)  & 0x8000) inputX -= 1.0f;
        if (GetAsyncKeyState(VK_RIGHT) & 0x8000) inputX += 1.0f;
        if (GetAsyncKeyState(VK_UP)    & 0x8000) inputZ += 1.0f;
        if (GetAsyncKeyState(VK_DOWN)  & 0x8000) inputZ -= 1.0f;
        // WASD も許可
        if (GetAsyncKeyState('A') & 0x8000) inputX -= 1.0f;
        if (GetAsyncKeyState('D') & 0x8000) inputX += 1.0f;
        if (GetAsyncKeyState('W') & 0x8000) inputZ += 1.0f;
        if (GetAsyncKeyState('S') & 0x8000) inputZ -= 1.0f;

        D3DXVECTOR3 moveDir(inputX, 0.0f, inputZ);
        float lenSq = moveDir.x * moveDir.x + moveDir.z * moveDir.z;
        if (lenSq > 0.0001f)
        {
            D3DXVec3Normalize(&moveDir, &moveDir);
            facing = atan2f(moveDir.x, moveDir.z);
        }
        velocity.x = moveDir.x * MOVE_SPEED;
        velocity.z = moveDir.z * MOVE_SPEED;

        // ジャンプ（立ち上がりエッジ検出）
        static bool spaceWasDown = false;
        bool spaceIsDown = (GetAsyncKeyState(VK_SPACE) & 0x8000) != 0;
        if (spaceIsDown && !spaceWasDown && grounded)
        {
            velocity.y = JUMP_SPEED;
            grounded = false;
        }
        spaceWasDown = spaceIsDown;

        // 重力
        velocity.y += GRAVITY * dt;
        if (velocity.y < TERMINAL_VEL) velocity.y = TERMINAL_VEL;

        // --- X軸移動と衝突解決 ---
        position.x += velocity.x * dt;
        for (size_t i = 0; i < platforms.size(); ++i)
        {
            Box& p = platforms[i];
            if (AABBOverlap(position, halfExtents, p.position, p.halfExtents))
            {
                if (p.movable)
                {
                    p.position.x += velocity.x * dt; // 樽を押す
                }
                else
                {
                    float overlapLeft  = (position.x + halfExtents.x) - (p.position.x - p.halfExtents.x);
                    float overlapRight = (p.position.x + p.halfExtents.x) - (position.x - halfExtents.x);
                    if (overlapLeft < overlapRight)
                        position.x -= overlapLeft;
                    else
                        position.x += overlapRight;
                }
            }
        }

        // --- Z軸移動と衝突解決 ---
        position.z += velocity.z * dt;
        for (size_t i = 0; i < platforms.size(); ++i)
        {
            Box& p = platforms[i];
            if (AABBOverlap(position, halfExtents, p.position, p.halfExtents))
            {
                if (p.movable)
                {
                    p.position.z += velocity.z * dt; // 樽を押す
                }
                else
                {
                    float overlapNear = (position.z + halfExtents.z) - (p.position.z - p.halfExtents.z);
                    float overlapFar  = (p.position.z + p.halfExtents.z) - (position.z - halfExtents.z);
                    if (overlapNear < overlapFar)
                        position.z -= overlapNear;
                    else
                        position.z += overlapFar;
                }
            }
        }

        // --- Y軸移動（重力・ジャンプ・着地） ---
        position.y += velocity.y * dt;
        grounded = false;

        // 地面
        if (position.y - halfExtents.y <= GROUND_Y)
        {
            position.y = GROUND_Y + halfExtents.y;
            velocity.y = 0.0f;
            grounded = true;
        }

        // 台・樽の上下面
        for (size_t i = 0; i < platforms.size(); ++i)
        {
            Box& p = platforms[i];
            if (AABBOverlap(position, halfExtents, p.position, p.halfExtents))
            {
                if (velocity.y <= 0.0f)
                {
                    // 上から着地
                    position.y = p.position.y + p.halfExtents.y + halfExtents.y;
                    velocity.y = 0.0f;
                    grounded = true;
                }
                else
                {
                    // 下から頭をぶつける
                    position.y = p.position.y - p.halfExtents.y - halfExtents.y;
                    velocity.y = 0.0f;
                }
            }
        }
    }
};

// ---------------------------------------------------------------------------
// シーン内オブジェクト
// ---------------------------------------------------------------------------
Player g_player;
std::vector<Box> g_platforms;

void InitScene()
{
    // 静止台：ぶつかるとめり込まずに止まる／上に乗ってジャンプ着地できる
    g_platforms.push_back(Box(D3DXVECTOR3(0.0f, 1.0f, 0.0f),
                               D3DXVECTOR3(2.0f, 1.0f, 2.0f),
                               D3DXCOLOR(0.55f, 0.55f, 0.6f, 1.0f), false));

    // 樽：押すと動く／上に乗ってジャンプ着地できる
    g_platforms.push_back(Box(D3DXVECTOR3(4.5f, 0.5f, 2.0f),
                               D3DXVECTOR3(0.6f, 0.5f, 0.6f),
                               D3DXCOLOR(0.55f, 0.35f, 0.15f, 1.0f), true));
}

// ---------------------------------------------------------------------------
// カメラ（プレイヤーの後方・上方から追従）
// ---------------------------------------------------------------------------
void UpdateCameraAndProjection()
{
    D3DXVECTOR3 forward(sinf(g_player.facing), 0.0f, cosf(g_player.facing));
    D3DXVECTOR3 eye = g_player.position - forward * 8.0f + D3DXVECTOR3(0.0f, 4.0f, 0.0f);
    D3DXVECTOR3 at  = g_player.position + D3DXVECTOR3(0.0f, 1.0f, 0.0f);
    D3DXVECTOR3 up(0.0f, 1.0f, 0.0f);

    D3DXMATRIX matView;
    D3DXMatrixLookAtLH(&matView, &eye, &at, &up);
    g_pd3dDevice->SetTransform(D3DTS_VIEW, &matView);

    D3DXMATRIX matProj;
    D3DXMatrixPerspectiveFovLH(&matProj, D3DX_PI / 4, (float)WINDOW_WIDTH / WINDOW_HEIGHT, 0.5f, 200.0f);
    g_pd3dDevice->SetTransform(D3DTS_PROJECTION, &matProj);
}

// ---------------------------------------------------------------------------
// D3D 初期化
// ---------------------------------------------------------------------------
HRESULT InitD3D(HWND hWnd)
{
    g_pD3D = Direct3DCreate9(D3D_SDK_VERSION);
    if (g_pD3D == NULL) return E_FAIL;

    D3DPRESENT_PARAMETERS d3dpp;
    ZeroMemory(&d3dpp, sizeof(d3dpp));
    d3dpp.Windowed               = TRUE;
    d3dpp.SwapEffect              = D3DSWAPEFFECT_DISCARD;
    d3dpp.BackBufferFormat        = D3DFMT_UNKNOWN;
    d3dpp.EnableAutoDepthStencil  = TRUE;
    d3dpp.AutoDepthStencilFormat  = D3DFMT_D24S8;
    d3dpp.PresentationInterval    = D3DPRESENT_INTERVAL_DEFAULT;

    HRESULT hr = g_pD3D->CreateDevice(D3DADAPTER_DEFAULT, D3DDEVTYPE_HAL, hWnd,
        D3DCREATE_HARDWARE_VERTEXPROCESSING, &d3dpp, &g_pd3dDevice);

    if (FAILED(hr))
    {
        hr = g_pD3D->CreateDevice(D3DADAPTER_DEFAULT, D3DDEVTYPE_HAL, hWnd,
            D3DCREATE_SOFTWARE_VERTEXPROCESSING, &d3dpp, &g_pd3dDevice);
    }
    if (FAILED(hr)) return hr;

    g_pd3dDevice->SetRenderState(D3DRS_ZENABLE, TRUE);
    g_pd3dDevice->SetRenderState(D3DRS_LIGHTING, TRUE);
    g_pd3dDevice->SetRenderState(D3DRS_AMBIENT, D3DCOLOR_XRGB(90, 90, 90));
    g_pd3dDevice->SetRenderState(D3DRS_NORMALIZENORMALS, TRUE);

    D3DLIGHT9 light;
    ZeroMemory(&light, sizeof(D3DLIGHT9));
    light.Type      = D3DLIGHT_DIRECTIONAL;
    light.Diffuse.r = 1.0f; light.Diffuse.g = 1.0f; light.Diffuse.b = 1.0f; light.Diffuse.a = 1.0f;
    D3DXVECTOR3 dir(-0.4f, -1.0f, 0.3f);
    D3DXVec3Normalize((D3DXVECTOR3*)&light.Direction, &dir);
    g_pd3dDevice->SetLight(0, &light);
    g_pd3dDevice->LightEnable(0, TRUE);

    D3DXCreateBox(g_pd3dDevice, 1.0f, 1.0f, 1.0f, &g_pBoxMesh, NULL);
    D3DXCreateBox(g_pd3dDevice, 1.0f, 2.0f, 1.0f, &g_pPlayerMesh, NULL);
    D3DXCreateBox(g_pd3dDevice, 100.0f, 0.2f, 100.0f, &g_pGroundMesh, NULL);

    return S_OK;
}

void Cleanup()
{
    if (g_pPlayerMesh) g_pPlayerMesh->Release();
    if (g_pGroundMesh) g_pGroundMesh->Release();
    if (g_pBoxMesh)    g_pBoxMesh->Release();
    if (g_pd3dDevice)  g_pd3dDevice->Release();
    if (g_pD3D)        g_pD3D->Release();
}

void DrawBox(LPD3DXMESH mesh, const D3DXVECTOR3& pos, float rotY, const D3DXCOLOR& color)
{
    D3DXMATRIX matRot, matTrans, matWorld;
    D3DXMatrixRotationY(&matRot, rotY);
    D3DXMatrixTranslation(&matTrans, pos.x, pos.y, pos.z);
    matWorld = matRot * matTrans;
    g_pd3dDevice->SetTransform(D3DTS_WORLD, &matWorld);

    D3DMATERIAL9 mat;
    ZeroMemory(&mat, sizeof(mat));
    mat.Diffuse = color;
    mat.Ambient = color;
    g_pd3dDevice->SetMaterial(&mat);

    mesh->DrawSubset(0);
}

void Update(float dt)
{
    g_player.Update(dt, g_platforms);
}

void Render()
{
    g_pd3dDevice->Clear(0, NULL, D3DCLEAR_TARGET | D3DCLEAR_ZBUFFER,
        D3DCOLOR_XRGB(120, 170, 220), 1.0f, 0);

    g_pd3dDevice->BeginScene();

    UpdateCameraAndProjection();

    // 地面（原点中心、上面が y=0 になるよう半分だけ沈める）
    DrawBox(g_pGroundMesh, D3DXVECTOR3(0.0f, -0.1f, 0.0f), 0.0f, D3DXCOLOR(0.3f, 0.6f, 0.3f, 1.0f));

    // 台・樽
    for (size_t i = 0; i < g_platforms.size(); ++i)
    {
        const Box& p = g_platforms[i];
        D3DXMATRIX matScale, matTrans, matWorld;
        D3DXMatrixScaling(&matScale, p.halfExtents.x * 2.0f, p.halfExtents.y * 2.0f, p.halfExtents.z * 2.0f);
        D3DXMatrixTranslation(&matTrans, p.position.x, p.position.y, p.position.z);
        matWorld = matScale * matTrans;
        g_pd3dDevice->SetTransform(D3DTS_WORLD, &matWorld);

        D3DMATERIAL9 mat;
        ZeroMemory(&mat, sizeof(mat));
        mat.Diffuse = p.color;
        mat.Ambient = p.color;
        g_pd3dDevice->SetMaterial(&mat);
        g_pBoxMesh->DrawSubset(0);
    }

    // プレイヤー
    DrawBox(g_pPlayerMesh, g_player.position, g_player.facing, D3DXCOLOR(0.2f, 0.4f, 0.9f, 1.0f));

    g_pd3dDevice->EndScene();
    g_pd3dDevice->Present(NULL, NULL, NULL, NULL);
}

// ---------------------------------------------------------------------------
// ウィンドウプロシージャ
// ---------------------------------------------------------------------------
LRESULT CALLBACK WndProc(HWND hWnd, UINT msg, WPARAM wParam, LPARAM lParam)
{
    switch (msg)
    {
    case WM_DESTROY:
        PostQuitMessage(0);
        return 0;
    case WM_KEYDOWN:
        if (wParam == VK_ESCAPE) PostQuitMessage(0);
        return 0;
    }
    return DefWindowProc(hWnd, msg, wParam, lParam);
}

int WINAPI WinMain(HINSTANCE hInstance, HINSTANCE, LPSTR, int)
{
    WNDCLASSEX wc;
    ZeroMemory(&wc, sizeof(wc));
    wc.cbSize        = sizeof(WNDCLASSEX);
    wc.style         = CS_HREDRAW | CS_VREDRAW;
    wc.lpfnWndProc   = WndProc;
    wc.hInstance     = hInstance;
    wc.hCursor       = LoadCursor(NULL, IDC_ARROW);
    wc.lpszClassName = "GameAWindowClass";
    RegisterClassEx(&wc);

    RECT rect = { 0, 0, WINDOW_WIDTH, WINDOW_HEIGHT };
    AdjustWindowRect(&rect, WS_OVERLAPPEDWINDOW, FALSE);

    HWND hWnd = CreateWindow("GameAWindowClass",
        "3D Jump Action Demo - 矢印/WASD:移動  Space:ジャンプ  Esc:終了",
        WS_OVERLAPPEDWINDOW,
        CW_USEDEFAULT, CW_USEDEFAULT,
        rect.right - rect.left, rect.bottom - rect.top,
        NULL, NULL, hInstance, NULL);

    if (FAILED(InitD3D(hWnd)))
    {
        MessageBox(hWnd, "Direct3D の初期化に失敗しました。", "Error", MB_OK);
        return 0;
    }

    InitScene();

    ShowWindow(hWnd, SW_SHOWDEFAULT);
    UpdateWindow(hWnd);

    LARGE_INTEGER freq, prevTime, currTime;
    QueryPerformanceFrequency(&freq);
    QueryPerformanceCounter(&prevTime);

    MSG msg;
    ZeroMemory(&msg, sizeof(msg));
    while (msg.message != WM_QUIT)
    {
        if (PeekMessage(&msg, NULL, 0U, 0U, PM_REMOVE))
        {
            TranslateMessage(&msg);
            DispatchMessage(&msg);
        }
        else
        {
            QueryPerformanceCounter(&currTime);
            float dt = (float)(currTime.QuadPart - prevTime.QuadPart) / (float)freq.QuadPart;
            prevTime = currTime;
            if (dt > 0.1f) dt = 0.1f; // ブレークポイント等で止まった後の飛び対策

            Update(dt);
            Render();
        }
    }

    Cleanup();
    UnregisterClass("GameAWindowClass", hInstance);
    return (int)msg.wParam;
}
