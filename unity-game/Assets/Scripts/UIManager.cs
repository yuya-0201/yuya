using UnityEngine;
using UnityEngine.UI;

public class UIManager : MonoBehaviour
{
    public static UIManager Instance { get; private set; }

    [Header("プレイ中HUD")]
    [SerializeField] private Text scoreText;
    [SerializeField] private Text livesText;
    [SerializeField] private Text timerText;

    [Header("ゲームオーバー画面")]
    [SerializeField] private GameObject gameOverPanel;
    [SerializeField] private Text gameOverScoreText;

    [Header("クリア画面")]
    [SerializeField] private GameObject clearPanel;
    [SerializeField] private Text clearScoreText;

    private void Awake()
    {
        Instance = this;
    }

    public void HideAllPanels()
    {
        if (gameOverPanel != null) gameOverPanel.SetActive(false);
        if (clearPanel != null) clearPanel.SetActive(false);
    }

    public void UpdateScore(int score)
    {
        if (scoreText != null) scoreText.text = "スコア: " + score;
    }

    public void UpdateLives(int lives)
    {
        if (livesText != null) livesText.text = "ライフ: " + lives;
    }

    public void UpdateTimer(float time)
    {
        if (timerText != null)
        {
            int seconds = Mathf.CeilToInt(time);
            timerText.text = "残り時間: " + seconds;
        }
    }

    public void ShowGameOver(int finalScore)
    {
        if (gameOverPanel != null) gameOverPanel.SetActive(true);
        if (gameOverScoreText != null) gameOverScoreText.text = "スコア: " + finalScore;
    }

    public void ShowClear(int finalScore)
    {
        if (clearPanel != null) clearPanel.SetActive(true);
        if (clearScoreText != null) clearScoreText.text = "スコア: " + finalScore;
    }

    // Restartボタンのオブジェクトから呼び出す
    public void OnClickRestart()
    {
        if (GameManager.Instance != null)
        {
            GameManager.Instance.RestartGame();
        }
    }
}
