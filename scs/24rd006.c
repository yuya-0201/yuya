#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* 動的に1行読み込む (改行は除去) */
char *readline_dynamic(void) {
    size_t cap = 256, len = 0;
    char *buf = malloc(cap);
    if (!buf) exit(1);
    int c;
    while ((c = getchar()) != EOF && c != '\n') {
        if (len + 1 >= cap) { cap *= 2; buf = realloc(buf, cap); }
        buf[len++] = (char)c;
    }
    buf[len] = '\0';
    return buf;
}

int main(void) {
    printf("文字列1を入力: ");
    char *s = readline_dynamic();
    printf("文字列2を入力: ");
    char *t = readline_dynamic();

    int m = (int)strlen(s), n = (int)strlen(t);

    /* dp[i][j] = s[0..i-1] と t[0..j-1] の LCS 長 */
    int **dp = malloc((m + 1) * sizeof(int *));
    for (int i = 0; i <= m; i++) {
        dp[i] = calloc(n + 1, sizeof(int));
    }
    for (int i = 1; i <= m; i++)
        for (int j = 1; j <= n; j++)
            dp[i][j] = (s[i-1] == t[j-1])
                        ? dp[i-1][j-1] + 1
                        : (dp[i-1][j] > dp[i][j-1] ? dp[i-1][j] : dp[i][j-1]);

    /* SCS を逆順に復元 */
    int scs_len = m + n - dp[m][n];
    char *scs = malloc(scs_len + 1);
    int idx = scs_len;
    scs[idx] = '\0';
    int i = m, j = n;
    while (i > 0 && j > 0) {
        if (s[i-1] == t[j-1]) { scs[--idx] = s[i-1]; i--; j--; }
        else if (dp[i-1][j] > dp[i][j-1]) { scs[--idx] = s[--i]; }
        else { scs[--idx] = t[--j]; }
    }
    while (i > 0) scs[--idx] = s[--i];
    while (j > 0) scs[--idx] = t[--j];

    printf("最短共通包含列: %s\n", scs);
    printf("長さ: %d\n", scs_len);

    free(scs);
    for (int k = 0; k <= m; k++) free(dp[k]);
    free(dp); free(s); free(t);
    return 0;
}
