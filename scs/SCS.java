import java.util.Scanner;

public class SCS {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("文字列1を入力: ");
        String s = sc.nextLine();
        System.out.print("文字列2を入力: ");
        String t = sc.nextLine();

        int m = s.length(), n = t.length();

        // LCS DP
        int[][] dp = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++)
            for (int j = 1; j <= n; j++)
                dp[i][j] = (s.charAt(i-1) == t.charAt(j-1))
                            ? dp[i-1][j-1] + 1
                            : Math.max(dp[i-1][j], dp[i][j-1]);

        // SCS 復元
        StringBuilder sb = new StringBuilder();
        int i = m, j = n;
        while (i > 0 && j > 0) {
            if (s.charAt(i-1) == t.charAt(j-1)) { sb.append(s.charAt(--i)); j--; }
            else if (dp[i-1][j] > dp[i][j-1]) { sb.append(s.charAt(--i)); }
            else { sb.append(t.charAt(--j)); }
        }
        while (i > 0) sb.append(s.charAt(--i));
        while (j > 0) sb.append(t.charAt(--j));

        String scs = sb.reverse().toString();
        System.out.println("最短共通包含列: " + scs);
        System.out.println("長さ: " + scs.length());
    }
}
