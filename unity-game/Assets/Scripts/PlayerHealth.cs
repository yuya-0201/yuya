using System.Collections;
using UnityEngine;

public class PlayerHealth : MonoBehaviour
{
    [Header("ライフ設定")]
    [SerializeField] private int maxLives = 3;
    [SerializeField] private float invincibleDuration = 1.2f;

    [Header("復帰位置")]
    [SerializeField] private Transform respawnPoint;

    private int currentLives;
    private bool isInvincible;
    private SpriteRenderer sr;
    private Rigidbody2D rb;

    private void Awake()
    {
        sr = GetComponent<SpriteRenderer>();
        rb = GetComponent<Rigidbody2D>();
    }

    private void Start()
    {
        currentLives = maxLives;
        if (UIManager.Instance != null)
        {
            UIManager.Instance.UpdateLives(currentLives);
        }
    }

    private void OnTriggerEnter2D(Collider2D other)
    {
        if (other.CompareTag("Enemy") || other.CompareTag("Hazard"))
        {
            TakeDamage();
        }
        else if (other.CompareTag("DeathZone"))
        {
            // 穴に落ちた場合は即座にライフを1失う
            TakeDamage();
        }
    }

    public void TakeDamage()
    {
        if (isInvincible) return;
        if (GameManager.Instance != null && GameManager.Instance.CurrentState != GameState.Playing) return;

        currentLives--;
        if (UIManager.Instance != null)
        {
            UIManager.Instance.UpdateLives(currentLives);
        }

        if (currentLives <= 0)
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.GameOver();
            }
        }
        else
        {
            StartCoroutine(InvincibleAndRespawn());
        }
    }

    private IEnumerator InvincibleAndRespawn()
    {
        isInvincible = true;

        if (respawnPoint != null && rb != null)
        {
#if UNITY_6000_0_OR_NEWER
            rb.linearVelocity = Vector2.zero;
#else
            rb.velocity = Vector2.zero;
#endif
            transform.position = respawnPoint.position;
        }

        float elapsed = 0f;
        while (elapsed < invincibleDuration)
        {
            if (sr != null) sr.enabled = !sr.enabled;
            yield return new WaitForSeconds(0.1f);
            elapsed += 0.1f;
        }

        if (sr != null) sr.enabled = true;
        isInvincible = false;
    }
}
