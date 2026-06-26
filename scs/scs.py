import sys

def shortest_common_supersequence(s: str, t: str) -> str:
    m, n = len(s), len(t)

    # LCS DP
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            dp[i][j] = (dp[i-1][j-1] + 1 if s[i-1] == t[j-1]
                        else max(dp[i-1][j], dp[i][j-1]))

    # SCS 復元
    res = []
    i, j = m, n
    while i > 0 and j > 0:
        if s[i-1] == t[j-1]:
            res.append(s[i-1]); i -= 1; j -= 1
        elif dp[i-1][j] > dp[i][j-1]:
            res.append(s[i-1]); i -= 1
        else:
            res.append(t[j-1]); j -= 1
    res.extend(reversed(s[:i]))
    res.extend(reversed(t[:j]))
    return "".join(reversed(res))


def main():
    # 再帰制限を緩和 (長い文字列でも安全)
    sys.setrecursionlimit(10**7)
    s = input("文字列1を入力: ")
    t = input("文字列2を入力: ")
    scs = shortest_common_supersequence(s, t)
    print(f"最短共通包含列: {scs}")
    print(f"長さ: {len(scs)}")

if __name__ == "__main__":
    main()
