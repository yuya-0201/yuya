using UnityEngine;

[RequireComponent(typeof(Rigidbody2D))]
public class EnemyPatrol : MonoBehaviour
{
    [Header("巡回設定")]
    [SerializeField] private Transform pointA;
    [SerializeField] private Transform pointB;
    [SerializeField] private float speed = 2f;

    [Header("スコア")]
    [SerializeField] private int scoreOnDefeat = 20;

    private Vector3 target;
    private SpriteRenderer sr;
    private Rigidbody2D rb;

    private void Awake()
    {
        sr = GetComponent<SpriteRenderer>();
        rb = GetComponent<Rigidbody2D>();
    }

    private void Start()
    {
        target = pointB != null ? pointB.position : transform.position;
    }

    private void Update()
    {
        if (pointA == null || pointB == null) return;

        transform.position = Vector3.MoveTowards(transform.position, target, speed * Time.deltaTime);

        if (sr != null)
        {
            sr.flipX = target.x < transform.position.x;
        }

        if (Vector3.Distance(transform.position, target) < 0.05f)
        {
            target = target == pointA.position ? pointB.position : pointA.position;
        }
    }

    private void OnCollisionEnter2D(Collision2D collision)
    {
        if (!collision.collider.CompareTag("Player")) return;

        // プレイヤーが上から踏みつけた場合は敵を倒す
        if (collision.contacts.Length > 0 && collision.contacts[0].normal.y < -0.5f)
        {
            if (GameManager.Instance != null)
            {
                GameManager.Instance.AddScore(scoreOnDefeat);
            }

            Rigidbody2D playerRb = collision.collider.GetComponent<Rigidbody2D>();
            if (playerRb != null)
            {
#if UNITY_6000_0_OR_NEWER
                playerRb.linearVelocity = new Vector2(playerRb.linearVelocity.x, 8f);
#else
                playerRb.velocity = new Vector2(playerRb.velocity.x, 8f);
#endif
            }

            Destroy(gameObject);
        }
        else
        {
            PlayerHealth health = collision.collider.GetComponent<PlayerHealth>();
            if (health != null)
            {
                health.TakeDamage();
            }
        }
    }
}
