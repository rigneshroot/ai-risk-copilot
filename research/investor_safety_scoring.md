# The Multi-Dimensional Investor Safety Score (ISS) Framework
## Mathematical Formulations, Categorical Weights, and Standardizing Calibrations

### Author
**Rignesh P**

---

## 1. Executive Summary
The **Investor Safety Score (ISS)** is the central composite metric used by the **AI Financial Risk Copilot** to quantify the overall risk exposure and cognitive health of a retail investor. 

Traditional finance primarily measures risk using single-dimensional parameters, such as beta or standard deviation. In contrast, the $ISS$ merges **quantitative portfolio dynamics** (diversification, volatility, liquidity, leverage, concentration) with **qualitative behavioral sentiment indicators** (emotional distress, revenge trading, FOMO) to compute a holistic safety score ranging from $0$ (extreme hazard) to $100$ (optimal safety).

---

## 2. The Six Core Core Categories

The $ISS$ is computed as a weighted subtraction from a baseline score of $100$:

$$ISS = 100 - \sum_{k \in \mathcal{K}} w_k \cdot \mathcal{R}_k$$

Where:
*   $\mathcal{K} = \{CR, VR, LR, LEV, \mathcal{B}, DR\}$ represents the set of six core risk categories.
*   $w_k$ is the weight assigned to category $k$, satisfying $\sum_{k} w_k = 1.0$.
*   $\mathcal{R}_k$ is the standardized risk score for category $k$, scaled from $0$ (no risk) to $100$ (maximum risk).

```txt
Default Category Weights:
- Concentration Risk (CR):       w_con = 0.25
- Volatility Risk (VR):          w_vol = 0.20
- Liquidity Risk (LR):           w_liq = 0.10
- Leverage Exposure (LEV):       w_lev = 0.15
- Emotional Risk (B):            w_emo = 0.20
- Diversification Score (DR):    w_div = 0.10
```

---

## 3. Mathematical Formulations of Risk Categories

### 3.1 Concentration Risk ($CR$)
Concentration Risk measures the exposure of the portfolio to a narrow set of assets, calculated using the adapted Herfindahl-Hirschman Index ($HHI$):

$$HHI = \sum_{i=1}^{N} w_i^2$$

Where $w_i$ represents the decimal weight of asset $i$ (such that $\sum w_i = 1.0$).
The Concentration Risk index is standardized as:

$$CR = HHI \times 100$$

---

### 3.2 Volatility Risk ($VR$)
Volatility Risk measures the historical standard deviation of the portfolio returns based on asset correlations:

$$\sigma_p = \sqrt{\mathbf{w}^T \mathbf{\Sigma} \mathbf{w}} = \sqrt{\sum_{i=1}^N \sum_{j=1}^N w_i w_j \sigma_{ij}}$$

We standardize the Volatility Risk relative to the historical standard deviation of the benchmark S&P 500 ($\sigma_{SPY} \approx 15\%$ annualized):

$$VR = \min \left( 100, \, \frac{\sigma_p}{\sigma_{SPY}} \times 50 \right)$$

---

### 3.3 Liquidity Risk ($LR$)
Liquidity Risk represents the portion of the portfolio locked in illiquid or high-spread assets relative to cash-equivalents:

$$LR = 100 \times \left( 1.0 - \frac{W_{cash} + W_{blue\_chips}}{W_{total}} \right)$$

Where $W_{cash}$ and $W_{blue\_chips}$ represent highly liquid, low-spread assets, and $W_{total}$ is the total portfolio valuation.

---

### 3.4 Leverage Exposure ($LEV$)
Leverage Risk represents the magnification of gains and losses through margin borrowing or options trading:

$$LEV = \min \left( 100, \, 100 \times \left[ \frac{\text{Margin Borrowed}}{\text{Net Asset Value}} + \sum_{j=1}^{M} w_{opt, j} \cdot \Delta_j \right] \right)$$

Where $w_{opt, j}$ is the weight of option contract $j$ and $\Delta_j$ represents its delta coefficient.

---

### 3.5 Emotional Risk ($\mathcal{B}$)
Emotional Risk is the qualitative behavioral parameter determined by the Natural Language Processing (NLP) module. It scans investor chat inputs for specific cognitive biases:

$$\mathcal{B} = \max \left( \mathcal{B}_{fomo}, \, \mathcal{B}_{loss}, \, \mathcal{B}_{over} \right)$$

Where:
*   $\mathcal{B}_{fomo}$ is the parsed score for Fear of Missing Out and Herd Behavior.
*   $\mathcal{B}_{loss}$ is the parsed score for Panic Selling and Revenge Trading.
*   $\mathcal{B}_{over}$ is the parsed score for Overconfidence and Self-Attribution Bias.

---

### 3.6 Diversification Score ($DR$)
While concentration checks single asset weights, the **Diversification Score** quantifies the average correlation profile of the portfolio. A portfolio of 10 assets that are all highly correlated (e.g., 10 different technology companies) has high systemic risk:

$$DR = 100 \times \left( \frac{\sum_{i=1}^N \sum_{j \ne i}^N w_i w_j \rho_{ij}}{1.0 - HHI} \right)$$

Where $\rho_{ij}$ is the correlation coefficient between asset $i$ and asset $j$.

---

## 4. Scoring Thresholds & Strategic Directives

The resulting $ISS$ score categorizes the investor's exposure state and triggers targeted educational prompts:

| ISS Score | Safety Category | Strategic System Directive |
| :--- | :--- | :--- |
| **80 – 100** | **Secure / Healthy** | Keep active allocations. Educational prompts focus on long-term compound interest, tax-loss harvesting, and index rebalancing. |
| **50 – 79** | **Elevated Cautious** | Highlight mild concentration or rising volatility. Nudge investor to review high-beta assets and consider shifting 10% into liquid broad market ETFs. |
| **0 – 49** | **Hyper Speculative** | **Activate Cognitive Circuit-Breaker.** Flag revenge trading or extreme FOMO herding. Present clear analogies on crash drawdowns, recommend cooling-off periods, and suggest defensive portfolio diversification. |

This multi-dimensional scoring framework ensures that the AI Financial Risk Copilot acts as a rigorous mathematical and behavioral shield, safeguarding retail capital and fostering positive investing behaviors.

---

## 5. References & Citations

1. Markowitz, H. (1952). Portfolio Selection. *The Journal of Finance*, 7(1), 77-91.
2. Sharpe, W. F. (1966). Mutual Fund Performance. *The Journal of Business*, 39(1), 119-138.
3. Herfindahl, O. C. (1950). *Concentration in the Steel Industry* (Doctoral dissertation, Columbia University).
4. Lintner, J. (1965). The Valuation of Risk Assets and the Selection of Risky Investments in Stock Portfolios and Capital Budgets. *The Review of Economics and Statistics*, 47(1), 13-37.
