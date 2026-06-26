#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

int main() {
    std::string s, t;
    std::cout << "文字列1を入力: ";
    std::getline(std::cin, s);
    std::cout << "文字列2を入力: ";
    std::getline(std::cin, t);

    int m = (int)s.size(), n = (int)t.size();

    // LCS DP
    std::vector<std::vector<int>> dp(m + 1, std::vector<int>(n + 1, 0));
    for (int i = 1; i <= m; ++i)
        for (int j = 1; j <= n; ++j)
            dp[i][j] = (s[i-1] == t[j-1])
                       ? dp[i-1][j-1] + 1
                       : std::max(dp[i-1][j], dp[i][j-1]);

    // SCS 復元
    std::string scs;
    scs.reserve(m + n - dp[m][n]);
    int i = m, j = n;
    while (i > 0 && j > 0) {
        if (s[i-1] == t[j-1]) { scs += s[i-1]; --i; --j; }
        else if (dp[i-1][j] > dp[i][j-1]) { scs += s[--i]; }
        else { scs += t[--j]; }
    }
    while (i > 0) scs += s[--i];
    while (j > 0) scs += t[--j];
    std::reverse(scs.begin(), scs.end());

    std::cout << "最短共通包含列: " << scs << "\n";
    std::cout << "長さ: " << scs.size() << "\n";
    return 0;
}
