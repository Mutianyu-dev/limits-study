/*
 * 极限研习 · 命令行训练器
 * ------------------------------------------------------------
 * 一个「只用函数 + 循环 + 分支」就能写完的小项目：
 *   1. 极限口算：随机出题、判分、连对奖励诗句
 *   2. 打印菱形：经典嵌套循环题
 *   3. 规则页：把四步法讲清楚
 *
 * 刻意不用数组、指针、结构体，方便刚学完函数的同学逐行读懂、亲手重写。
 *
 * 编译（gcc）：
 *   gcc -std=c99 -Wall -Wextra -o limits_trainer limits_trainer.c
 * 运行：
 *   ./limits_trainer        （Windows 下是 limits_trainer.exe）
 */

#include <stdio.h>
#include <stdlib.h>
#include <time.h>

/* ---------- 界面 ---------- */

static void print_line(void);
static void print_menu(void);
static void print_rule(void);

/* ---------- 输入 ---------- */

static int read_int(const char *prompt);
static double read_double(const char *prompt);

/* ---------- 功能 ---------- */

static void play_limits(void);
static int ask_limit_question(int qno, int type, int k);
static void reward(int streak);
static void play_diamond(void);
static void print_diamond(int n);

/* ---------- 入口 ---------- */

int main(void)
{
    int choice;

#ifdef _WIN32
    /* 让 Windows 控制台按 UTF-8 显示中文；如果你用 Dev-C++ 保存成 GBK，可删掉这一行 */
    system("chcp 65001 > nul");
#endif

    srand((unsigned int)time(NULL));

    do {
        print_menu();
        choice = read_int("请选择：");

        switch (choice) {
        case 1:
            play_limits();
            break;
        case 2:
            play_diamond();
            break;
        case 3:
            print_rule();
            break;
        case 0:
            printf("\n辛苦了。下次见。\n\n");
            break;
        default:
            printf("\n没有这个选项，请重新输入。\n");
            break;
        }
    } while (choice != 0);

    return 0;
}

/* ---------- 界面实现 ---------- */

static void print_line(void)
{
    int i;
    for (i = 0; i < 34; i++) {
        printf("-");
    }
    printf("\n");
}

static void print_menu(void)
{
    printf("\n");
    print_line();
    printf("        极 限 研 习 · 训 练 器\n");
    print_line();
    printf("   1  极限口算（5 题）\n");
    printf("   2  打印菱形\n");
    printf("   3  训练规则\n");
    printf("   0  退出\n");
    print_line();
}

static void print_rule(void)
{
    printf("\n");
    printf("四步法：\n");
    printf("  1. 定型    先代入，看是不是 0/0、无穷/无穷、0*无穷、1^无穷……\n");
    printf("  2. 化简    因式分解、有理化、通分、等价替换（只在乘除里换）\n");
    printf("  3. 选法    洛必达、泰勒、重要极限、夹逼、中值定理\n");
    printf("  4. 校验    回代检查，方法失效就回到第 1 步\n");
    printf("\n记住：等价替换在加减里会丢阶，tan x - sin x 不能各自换成 x。\n");
}

/* ---------- 输入实现 ---------- */

static int read_int(const char *prompt)
{
    int value;
    int ch;

    printf("%s", prompt);
    while (scanf("%d", &value) != 1) {
        while ((ch = getchar()) != '\n' && ch != EOF) {
            /* 清空这一行的非法输入 */
        }
        printf("请输入一个整数：");
    }
    return value;
}

static double read_double(const char *prompt)
{
    double value;
    int ch;

    printf("%s", prompt);
    while (scanf("%lf", &value) != 1) {
        while ((ch = getchar()) != '\n' && ch != EOF) {
            /* 清空这一行的非法输入 */
        }
        printf("请输入一个数字（可以是小数）：");
    }
    return value;
}

/* ---------- 极限口算 ---------- */

static void play_limits(void)
{
    int i;
    int correct = 0;
    int streak = 0;
    int best_streak = 0;

    printf("\n本轮 5 题，连对 3 题会有一句诗。\n");

    for (i = 1; i <= 5; i++) {
        int type = rand() % 3;          /* 0、1、2 三种题型 */
        int k = 2 + rand() % 4;         /* k 取 2 到 5 */

        if (ask_limit_question(i, type, k)) {
            correct++;
            streak++;
            if (streak > best_streak) {
                best_streak = streak;
            }
            reward(streak);
        } else {
            streak = 0;
        }
    }

    printf("\n本轮结束：答对 %d / 5", correct);
    if (best_streak >= 3) {
        printf("，最佳连对 %d 题", best_streak);
    }
    printf("。\n");

    if (correct == 5) {
        printf("全对。\"数风流人物，还看今朝。\"\n");
    } else if (correct >= 3) {
        printf("稳住，这个正确率已经能进面试的及格线了。\n");
    } else {
        printf("把错题抄下来，明天再做一遍。\n");
    }
}

static int ask_limit_question(int qno, int type, int k)
{
    double answer = 0.0;
    double user = 0.0;
    double diff;

    printf("\n第 %d 题\n", qno);

    if (type == 0) {
        printf("  lim(x->0) sin(%dx) / x = ", k);
        answer = (double)k;
    } else if (type == 1) {
        printf("  lim(x->0) (1 - cos(%dx)) / x^2 = ", k);
        answer = (double)k * (double)k / 2.0;
    } else {
        printf("  lim(x->0) (e^(%dx) - 1) / x = ", k);
        answer = (double)k;
    }

    printf("\n");
    user = read_double("  你的答案：");

    diff = user - answer;
    if (diff < 0) {
        diff = -diff;
    }

    if (diff < 0.000001) {
        printf("  正确。\n");
        return 1;
    }

    printf("  不对，正确答案是 %.2f。\n", answer);
    return 0;
}

static void reward(int streak)
{
    int pick;

    if (streak % 3 != 0) {
        return;
    }

    pick = rand() % 4;
    if (pick == 0) {
        printf("  连对 %d 题！\"千磨万击心铸铁，殚精竭虑铸一剑。\"\n", streak);
    } else if (pick == 1) {
        printf("  连对 %d 题！\"雄关漫道真如铁，而今迈步从头越。\"\n", streak);
    } else if (pick == 2) {
        printf("  连对 %d 题！\"一路寒风身如絮，命海沉浮客独行。\"\n", streak);
    } else {
        printf("  连对 %d 题！\"世上无难事，只要肯登攀。\"\n", streak);
    }
}

/* ---------- 打印菱形 ---------- */

static void play_diamond(void)
{
    int n;

    printf("\n");
    do {
        n = read_int("输入菱形的边长（1 到 15 的奇数，例如 7）：");
        if (n < 1 || n > 15 || n % 2 == 0) {
            printf("必须是 1 到 15 之间的奇数，请重新输入。\n");
        }
    } while (n < 1 || n > 15 || n % 2 == 0);

    print_diamond(n);
    printf("菱形的行数是 %d 行（上半 %d 行 + 下半 %d 行）。\n",
           n, (n + 1) / 2, (n - 1) / 2);
}

static void print_diamond(int n)
{
    int i;
    int j;

    /* 上半部分（含中间最长的一行） */
    for (i = 1; i <= n; i += 2) {
        for (j = 0; j < (n - i) / 2; j++) {
            printf(" ");
        }
        for (j = 0; j < i; j++) {
            printf("*");
        }
        printf("\n");
    }

    /* 下半部分：从最长行的上一行开始，逐行减少 */
    for (i = n - 2; i >= 1; i -= 2) {
        for (j = 0; j < (n - i) / 2; j++) {
            printf(" ");
        }
        for (j = 0; j < i; j++) {
            printf("*");
        }
        printf("\n");
    }
}
