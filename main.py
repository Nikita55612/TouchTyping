import matplotlib.pyplot as plt
import matplotlib
import json


matplotlib.use('Agg')
with open("stat.json") as f:
    data = json.load(f)
chars_per_sec = []
typos_percent = []
press_speed_list = []
miss_list = []
key_miss = {}
x_miss = []
y_miss = []
for i in data:
    chars_per_sec.append(i["chars_per_sec"])
    typos_percent.append(i["typos_percent"])
    for pt in i["press_time_list"]:
        if pt > 0.009:
            press_speed_list.append(1 / pt)
        else:
            press_speed_list.append(sum(press_speed_list) / len(press_speed_list))
    for key, miss in zip(i["char_list"], i["miss_list"]):
        miss_list.append(miss)
        if key in key_miss:
            key_miss[key] += miss
        else:
            key_miss[key] = miss
typos_percent = [i * 100 for i in typos_percent]
max_key_miss = max(key_miss.values())
ma20_press_speed_list = [sum(press_speed_list[i:i + 20]) / 20 for i in range(0, len(press_speed_list) - 20 + 1)]
ma100_press_speed_list = [sum(press_speed_list[i:i + 100]) / 100 for i in range(0, len(press_speed_list) - 100 + 1)]
if len(press_speed_list) >= 1001:
    ma1000_press_speed_list = [sum(press_speed_list[i:i + 1000]) / 1000 for i in range(0, len(press_speed_list) - 1000 + 1)]
else:
    ma1000_press_speed_list = None
del_ma100 = round(len(ma100_press_speed_list) / 3)
avg_gain = round(((sum(ma100_press_speed_list[del_ma100:]) / len(ma100_press_speed_list[del_ma100:])) / (sum(ma100_press_speed_list[:del_ma100]) / len(ma100_press_speed_list[:del_ma100]))) * 100 - 100, 2)
for n, i in enumerate(miss_list):
    if i == 1:
        x_miss.append(n)
        y_miss.append(ma20_press_speed_list[n - 20] if n > 19 else ma20_press_speed_list[0])
plt.style.use("dark_background")
#plt.plot(press_speed_list, color="#9645ff", linewidth= 0.15, label="cps")
plt.plot([i for i in range(19, len(ma20_press_speed_list) + 19)], ma20_press_speed_list, linewidth= 0.32, color="#ff084e", label="sma20")
plt.plot([i for i in range(99, len(ma100_press_speed_list) + 99)], ma100_press_speed_list, linewidth= 0.9, color="#f5f5f5", label="sma99")
plt.plot(x_miss, y_miss, "X", color="#ffc117", markersize=0.75, label="miss")
plt.legend(fontsize=5)
plt.title(f"Average gain: {avg_gain}%")
plt.savefig("pressing_speed.png", dpi=600)
plt.close()
if ma1000_press_speed_list:
    plt.plot(x_miss, y_miss, "X", color="#ffc117", markersize=0.75, label="miss")
    plt.plot([i for i in range(999, len(ma1000_press_speed_list) + 999)], ma1000_press_speed_list, linewidth= 1, color="#f5f5f5", label="sma999")
    plt.legend(fontsize=5)
    plt.title(f"Average gain: {avg_gain}%")
    plt.savefig("sma999_pressing_speed.png", dpi=600)
    plt.close()
for n, i in enumerate(key_miss):
    row = 0. if n <= 10 else 0.1 if n <= 20 else 0.2
    col = n if n <= 10 else n - 11  if n <= 20 else n - 21
    avg_key = key_miss[i] / max_key_miss
    plt.text(0.08 * col, 0.4 + row, i, color='black', size=16,
            bbox=dict(facecolor=(avg_key, 0.0, 0.0), edgecolor='black', boxstyle='square'))
plt.axis('off')
plt.savefig("key_map.png", dpi=600)
plt.close()