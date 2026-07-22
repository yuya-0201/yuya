using UnityEngine;
using TMPro;

public class StopWatch : MonoBehaviour
{
    public Transform secondHand;
    public Transform minuteHand;
    public Transform foudroyanteHand;
    public TMP_Text timeText;

    private enum ClockState { Stopped, Running, Paused }

    private ClockState state = ClockState.Stopped;
    private float elapsedTime = 0f;

    void Start()
    {
        elapsedTime = 0f;
        state = ClockState.Stopped;
        UpdateHands();
        UpdateText();
    }

    void Update()
    {
        if (state == ClockState.Running)
        {
            elapsedTime += Time.deltaTime;
            UpdateHands();
            UpdateText();
        }
    }

    public void OnStartButtonClicked()
    {
        if (state == ClockState.Stopped || state == ClockState.Paused)
        {
            state = ClockState.Running;
        }
    }

    public void OnStopButtonClicked()
    {
        if (state == ClockState.Running)
        {
            state = ClockState.Paused;
        }
    }

    public void OnResetButtonClicked()
    {
        if (state == ClockState.Paused)
        {
            elapsedTime = 0f;
            state = ClockState.Stopped;
            UpdateHands();
            UpdateText();
        }
    }

    private void UpdateHands()
    {
        float secondAngle = (elapsedTime % 60f) / 60f * 360f;
        float minuteAngle = (elapsedTime % 3600f) / 3600f * 360f;
        float foudroyanteAngle = (elapsedTime % 1f) / 1f * 360f;

        secondHand.rotation = Quaternion.Euler(0f, 0f, -secondAngle);
        minuteHand.rotation = Quaternion.Euler(0f, 0f, -minuteAngle);
        foudroyanteHand.rotation = Quaternion.Euler(0f, 0f, -foudroyanteAngle);
    }

    private void UpdateText()
    {
        int minutes = (int)(elapsedTime / 60f);
        int seconds = (int)(elapsedTime % 60f);
        int hundredths = (int)((elapsedTime * 100f) % 100f);

        timeText.text = $"{minutes}:{seconds:D2}:{hundredths:D2}";
    }
}
