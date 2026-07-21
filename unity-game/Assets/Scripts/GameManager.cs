using UnityEngine;
using UnityEngine.SceneManagement;

public enum GameState
{
    Playing,
    GameOver,
    Clear
}

public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    [Header("ゲーム設定")]
    [SerializeField] private float timeLimit = 120f;

    public int Score { get; private set; }
    public float TimeRemaining { get; private set; }
    public GameState CurrentState { get; private set; } = GameState.Playing;

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;
    }

    private void Start()
    {
        Score = 0;
        TimeRemaining = timeLimit;
        CurrentState = GameState.Playing;
        Time.timeScale = 1f;

        if (UIManager.Instance != null)
        {
            UIManager.Instance.UpdateScore(Score);
            UIManager.Instance.UpdateTimer(TimeRemaining);
            UIManager.Instance.HideAllPanels();
        }
    }

    private void Update()
    {
        if (CurrentState != GameState.Playing) return;

        TimeRemaining -= Time.deltaTime;
        if (TimeRemaining <= 0f)
        {
            TimeRemaining = 0f;
            GameOver();
        }

        if (UIManager.Instance != null)
        {
            UIManager.Instance.UpdateTimer(TimeRemaining);
        }
    }

    public void AddScore(int amount)
    {
        if (CurrentState != GameState.Playing) return;

        Score += amount;
        if (UIManager.Instance != null)
        {
            UIManager.Instance.UpdateScore(Score);
        }
    }

    public void GameOver()
    {
        if (CurrentState != GameState.Playing) return;

        CurrentState = GameState.GameOver;
        Time.timeScale = 0f;

        if (UIManager.Instance != null)
        {
            UIManager.Instance.ShowGameOver(Score);
        }
    }

    public void ClearStage()
    {
        if (CurrentState != GameState.Playing) return;

        CurrentState = GameState.Clear;
        Time.timeScale = 0f;

        if (UIManager.Instance != null)
        {
            UIManager.Instance.ShowClear(Score);
        }
    }

    public void RestartGame()
    {
        Time.timeScale = 1f;
        Scene current = SceneManager.GetActiveScene();
        SceneManager.LoadScene(current.name);
    }
}
