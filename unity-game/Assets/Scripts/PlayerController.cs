using UnityEngine;

[RequireComponent(typeof(Rigidbody2D))]
public class PlayerController : MonoBehaviour
{
    [Header("移動設定")]
    [SerializeField] private float moveSpeed = 5f;
    [SerializeField] private float jumpForce = 12f;

    [Header("接地判定")]
    [SerializeField] private Transform groundCheck;
    [SerializeField] private float groundCheckRadius = 0.15f;
    [SerializeField] private LayerMask groundLayer;

    [Header("サウンド")]
    [SerializeField] private AudioClip jumpClip;

    private Rigidbody2D rb;
    private SpriteRenderer sr;
    private AudioSource audioSource;
    private bool isGrounded;
    private float moveInput;

    private void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
        sr = GetComponent<SpriteRenderer>();
        audioSource = GetComponent<AudioSource>();
    }

    private void Update()
    {
        // ゲームがプレイ中でなければ操作を受け付けない
        if (GameManager.Instance != null && GameManager.Instance.CurrentState != GameState.Playing)
        {
            moveInput = 0f;
            return;
        }

        moveInput = Input.GetAxisRaw("Horizontal");

        if (sr != null)
        {
            if (moveInput > 0f) sr.flipX = false;
            else if (moveInput < 0f) sr.flipX = true;
        }

        isGrounded = groundCheck != null &&
            Physics2D.OverlapCircle(groundCheck.position, groundCheckRadius, groundLayer);

        if (Input.GetButtonDown("Jump") && isGrounded)
        {
#if UNITY_6000_0_OR_NEWER
            rb.linearVelocity = new Vector2(rb.linearVelocity.x, jumpForce);
#else
            rb.velocity = new Vector2(rb.velocity.x, jumpForce);
#endif
            if (audioSource != null && jumpClip != null)
            {
                audioSource.PlayOneShot(jumpClip);
            }
        }
    }

    private void FixedUpdate()
    {
#if UNITY_6000_0_OR_NEWER
        rb.linearVelocity = new Vector2(moveInput * moveSpeed, rb.linearVelocity.y);
#else
        rb.velocity = new Vector2(moveInput * moveSpeed, rb.velocity.y);
#endif
    }

    private void OnDrawGizmosSelected()
    {
        if (groundCheck == null) return;
        Gizmos.color = Color.red;
        Gizmos.DrawWireSphere(groundCheck.position, groundCheckRadius);
    }
}
