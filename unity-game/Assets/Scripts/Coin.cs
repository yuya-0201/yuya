using UnityEngine;

public class Coin : MonoBehaviour
{
    [SerializeField] private int scoreValue = 10;
    [SerializeField] private AudioClip collectClip;

    private void OnTriggerEnter2D(Collider2D other)
    {
        if (!other.CompareTag("Player")) return;

        if (GameManager.Instance != null)
        {
            GameManager.Instance.AddScore(scoreValue);
        }

        if (collectClip != null)
        {
            AudioSource.PlayClipAtPoint(collectClip, transform.position);
        }

        Destroy(gameObject);
    }
}
