
import pandas as pd
import matplotlib.pyplot as plt

left = "left.csv"
right = "right.csv"
xm = "xm.csv"

left_csv = pd.read_csv(left)
right_csv = pd.read_csv(right)
xm_csv = pd.read_csv(xm)

# print(left_csv['x'])
# print(left_csv['fx'])

# print(right_csv['x'])
# print(right_csv['fx'])

fig, ax = plt.subplots()

if not left_csv.empty:  
  ax.plot(left_csv['x'], left_csv['fx'], label="Xl")

if not right_csv.empty:
  ax.plot(right_csv['x'], right_csv['fx'], label="Xr")

if not xm_csv.empty:
  ax.plot(xm_csv['x'], xm_csv['fx'], label="Xm")

plt.legend(["Xl","Xr","Xm"])
plt.grid()
plt.savefig("./public/graph.png")

# left_file = open(left, "w+")
# left_file.close()

# right_file = open(right, "w+")
# right_file.close()