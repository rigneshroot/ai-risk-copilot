import math
import re
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# --- FastAPI Initialization ---
app = FastAPI(
    title="AI Financial Risk Copilot Backend Engine",
    description="A human-centered explainable AI framework for retail investor safety",
    version="1.0.0"
)

# Enable CORS for standard frontend calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Asset Metadata & Baseline Volatilities ---
ASSET_VOLATILITIES = {
    "equity_low": 0.18,       # Core Blue-Chip Equities
    "equity_speculative": 0.75, # High-Beta Meme Stocks (e.g., GME, AMC)
    "crypto": 0.95,           # Volatile Cryptocurrencies (e.g., DOGE, SHIB)
    "index_safe": 0.15        # Broad diversified Mutual Funds/ETFs (e.g., SPY, VOO)
}

# --- Pydantic Data Schemas ---
class AssetAllocation(BaseModel):
    name: str = Field(..., example="Cryptocurrency Allocation")
    category: str = Field(..., description="Category must be one of: equity_low, equity_speculative, crypto, index_safe")
    weight: float = Field(..., ge=0.0, le=100.0, description="Percentage weight from 0 to 100", example=40.0)

class PortfolioInput(BaseModel):
    assets: List[AssetAllocation] = Field(..., min_items=1)

class ConversationalInput(BaseModel):
    text: str = Field(..., example="Everyone is buying Dogecoin right now, I want to invest all of my college savings to double it quickly!")

class PortfolioRiskResponse(BaseModel):
    hhi: float
    diversification_health_score: float
    estimated_portfolio_volatility: float
    volatility_risk_factor: float
    concentration_risk: float
    rating: str

class BehavioralBiasResponse(BaseModel):
    detected_biases: List[str]
    behavioral_risk_score: float
    bias_alert_triggered: bool

class SafetyScoreResponse(BaseModel):
    investor_safety_score: int
    portfolio_analytics: PortfolioRiskResponse
    behavioral_analysis: BehavioralBiasResponse
    explainable_guidance: List[str]
    humanised_analogy: str

# --- Helper Algorithms ---
def calculate_portfolio_volatility(assets: List[AssetAllocation]) -> float:
    """
    Computes portfolio volatility using covariance assumptions.
    Var_p = sum(w_i^2 * vol_i^2) + 2 * sum(w_i * w_j * corr * vol_i * vol_j)
    """
    correlation = 0.22  # Positive market correlation baseline
    variance = 0.0
    
    # Scale allocations so they represent fraction weights summing to 1.0
    total_weight = sum(a.weight for a in assets)
    if total_weight == 0:
        return 0.0
        
    weights = [a.weight / total_weight for a in assets]
    vols = [ASSET_VOLATILITIES.get(a.category, 0.20) for a in assets]
    
    for i in range(len(assets)):
        variance += (weights[i] ** 2) * (vols[i] ** 2)
        for j in range(i + 1, len(assets)):
            cov = correlation * vols[i] * vols[j]
            variance += 2 * weights[i] * weights[j] * cov
            
    return math.sqrt(variance)

# --- Routes ---
@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "project": "AI Financial Risk Copilot Framework",
        "description": "Human-Centered Explainable AI (XAI) protecting beginner retail investors",
        "version": "1.0.0"
    }

@app.post("/analyze-portfolio", response_model=PortfolioRiskResponse)
def analyze_portfolio(portfolio: PortfolioInput):
    assets = portfolio.assets
    total_weight = sum(a.weight for a in assets)
    
    if not (99.0 <= total_weight <= 101.0):
        raise HTTPException(status_code=400, detail=f"Portfolio weights must sum to approximately 100%. Current sum: {total_weight}%")

    # 1. Herfindahl-Hirschman Index (HHI)
    hhi = sum((a.weight / 100.0) ** 2 for a in assets)
    
    # 2. Diversification Health Score (DHS)
    dhs = (1.0 - hhi) * 100.0
    
    # 3. Covariance Volatility
    p_vol = calculate_portfolio_volatility(assets)
    
    # 4. Volatility Risk Factor (VRF) benchmarked to S&P 500 (15%)
    vrf = min(100.0, (p_vol / 0.15) * 50.0)
    
    # 5. Rating
    if dhs >= 75:
        rating = "Healthy & Well-Diversified"
    elif dhs >= 50:
        rating = "Cautious (Moderate Concentration)"
    else:
        rating = "High Risk (Sub-optimal Concentration)"

    return PortfolioRiskResponse(
        hhi=round(hhi, 4),
        diversification_health_score=round(dhs, 2),
        estimated_portfolio_volatility=round(p_vol * 100.0, 2),
        volatility_risk_factor=round(vrf, 2),
        concentration_risk=round(hhi * 100.0, 2),
        rating=rating
    )

@app.post("/analyze-sentiment", response_model=BehavioralBiasResponse)
def analyze_sentiment(chat_input: ConversationalInput):
    text = chat_input.text.lower()
    detected = []
    score = 25.0  # Baseline curiosity risk score

    # NLP Dictionary regex triggers
    fomo_keywords = r"(moon|rocket|trending|tiktok|hype|everyone is|all savings|doge|crypto|bubble|double|fomo|chasing|get rich)"
    loss_keywords = r"(lost|panic|revenge|double down|get it back|down|options|crash|sell everything|drawdown|anxious|scared|worried)"
    overconfidence_keywords = r"(guaranteed|can't lose|100%|sure|risk-free|easy money|masterclass|expert|predict)"

    if re.search(fomo_keywords, text):
        detected.append("FOMO / Herd Behavior")
        score += 35.0
        
    if re.search(loss_keywords, text):
        detected.append("Loss Aversion / Revenge Trading")
        score += 45.0
        
    if re.search(overconfidence_keywords, text):
        detected.append("Overconfidence Bias")
        score += 30.0

    score = min(100.0, score)
    alert = len(detected) > 0

    return BehavioralBiasResponse(
        detected_biases=detected,
        behavioral_risk_score=score,
        bias_alert_triggered=alert
    )

@app.post("/explain-safety", response_model=SafetyScoreResponse)
def explain_safety(portfolio: PortfolioInput, chat_input: ConversationalInput):
    # Run analytical modules
    portfolio_res = analyze_portfolio(portfolio)
    behavioral_res = analyze_sentiment(chat_input)

    # ISS Equation: ISS = 100 - (0.40 * CR + 0.35 * VRF + 0.25 * BehavioralRisk)
    cr = portfolio_res.concentration_risk
    vrf = portfolio_res.volatility_risk_factor
    b_score = behavioral_res.behavioral_risk_score
    
    iss_score = round(100 - (0.40 * cr + 0.35 * vrf + 0.25 * b_score))
    iss_score = max(0, min(100, iss_score))

    # Formulate Humanised Guidance & Analogies (Section 7 Empathetic Translation Layer)
    guidance = []
    analogy = "Driving at moderate speeds in clear daylight."

    # Concentration check
    if cr > 50:
        guidance.append("You have a heavy amount of your funds riding on just one or two volatile assets. If these slide, your whole savings will take a major hit.")
        analogy = "Putting all your precious glass eggs in one single basket."
    else:
        guidance.append("Your diversification is looking healthy. Spreading your holdings reduces potential downside impact.")

    # Volatility Check
    if portfolio_res.estimated_portfolio_volatility > 40:
        guidance.append("Your portfolio is currently a financial rollercoaster. Expect stomach-churning dips alongside spikes.")
        analogy = "Riding a wild, high-speed rollercoaster without a safety harness."
    
    # Emotional alerts
    biases = behavioral_res.detected_biases
    if "FOMO / Herd Behavior" in biases:
        guidance.append("Chasing 'rocket' trends is highly risky. Hype curves usually crash just as fast as they rocket.")
    if "Loss Aversion / Revenge Trading" in biases:
        guidance.append("We understand that seeing assets slide is painful. But double-down revenge trading often results in a total wipeout.")

    return SafetyScoreResponse(
        investor_safety_score=iss_score,
        portfolio_analytics=portfolio_res,
        behavioral_analysis=behavioral_res,
        explainable_guidance=guidance,
        humanised_analogy=analogy
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
