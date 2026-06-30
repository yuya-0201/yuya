import numpy as np
import matplotlib.pyplot as plt
from scipy.io import loadmat

# Load the data
data = loadmat('time_series_data.mat')
z = data['z'].flatten()

N_tr = 300  # Number of training samples
K = 10      # Number of past observations used as inputs

# Plot the data
plt.figure(1)
plt.plot(range(1, len(z) + 1), z, 'x-', label='z', linewidth=1.5)
plt.grid(True)
plt.axis([1, K + N_tr, -1.5, 1.5])
plt.xlabel('$t$', fontsize=12, fontstyle='italic')
plt.ylabel('$z$', fontsize=12, fontstyle='italic')
plt.tick_params(axis='both', which='major', labelsize=12)

plt.figure(2)
plt.plot(range(1, len(z) + 1), z, 'x-', label='z', linewidth=1.5)
plt.grid(True)
plt.axis([350, 470, -1.5, 1.5])
plt.xlabel('$t$', fontsize=12, fontstyle='italic')
plt.ylabel('$z$', fontsize=12, fontstyle='italic')
plt.tick_params(axis='both', which='major', labelsize=12)

# Construct the training data
X_tilde = np.ones((N_tr, 1))
X_tilde = np.hstack([X_tilde, np.array([z[i:i + K] for i in range(N_tr)])])
y = z[K:K + N_tr]

# Estimate the coefficient vector a_hat
a_hat = np.linalg.inv(X_tilde.T @ X_tilde) @ X_tilde.T @ y

# Compute predictions
f = X_tilde @ a_hat

# Plot predictions for the training data
plt.figure(1)
plt.plot(range(K + 1, K + N_tr + 1), f, label='f', linewidth=1.5)
plt.legend(fontsize=12)

# Construct the test data
N_test = 100
X_tilde_test = np.ones((N_test, 1))
X_tilde_test = np.hstack([X_tilde_test,
                           np.array([z[350 + i:350 + i + K] for i in range(N_test)])])

# Compute predictions for the test data
f_test = X_tilde_test @ a_hat

# Plot predictions for the test data
plt.figure(2)
plt.plot(range(350 + K + 1, 350 + K + N_test + 1), f_test, label='f', linewidth=1.5)
plt.legend(fontsize=12)

plt.show()
