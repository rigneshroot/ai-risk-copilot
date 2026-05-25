import math
import re
from typing import Dict, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# --- FastAPI Initialization ---
app = FastAPI(
    title="AI Financial Risk Copilot & Cognition Framework Backend",
    description="An AI-powered investor safety and financial cognition framework serving six-category ISS analytics",
    version="1.2.0"
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

class ParametersInput(BaseModel):
    leverage: float = Field(1.0, ge=1.0, le=3.0, description="Margin leverage multiplier factor", example=2.0)
    liquidity: float = Field(15.0, ge=0.0, le=50.0, description="High-liquidity cash percentage balance", example=10.0)

class FrameworkInput(BaseModel):
    assets: List[AssetAllocation] = Field(..., min_items=1)
    parameters: ParametersInput = Field(default_factory=ParametersInput)

class ConversationalInput(BaseModel):
    text: str = Field(..., example="I lost $1,500 on meme stocks yesterday. I'm panic-selling everything to buy highly leveraged margin options and get it back immediately!")

class SixCategoryRiskResponse(BaseModel):
    concentration_risk: float = Field(..., description="CR: HHI * 100")
    volatility_risk: float = Field(..., description="VR: Annualized portfolio volatility scaled by leverage relative to VOO")
    liquidity_risk: float = Field(..., description="LR: High-liquidity cash and index inverse weights")
    leverage_risk: float = Field(..., description="LEV: Margin borrows hazard index")
    emotional_risk: float = Field(..., description="B: NLP sentiment active bias coefficient")
    diversification_risk: float = Field(..., description="DR: Inverse HHI correlation ratio")

class PortfolioRiskResponse(BaseModel):
    hhi: float
    diversification_health_score: float
    estimated_portfolio_volatility: float
    rating: str

class BehavioralBiasResponse(BaseModel):
    detected_biases: List[str]
    behavioral_risk_score: float
    bias_alert_triggered: bool

class SafetyScoreResponse(BaseModel):
    investor_safety_score: int
    portfolio_analytics: PortfolioRiskResponse
    behavioral_analysis: BehavioralBiasResponse
    six_category_breakdown: SixCategoryRiskResponse
    explainable_guidance: List[str]
    humanised_analogy: str

# --- Helper Algorithms ---
def calculate_portfolio_volatility(assets: List[AssetAllocation], leverage: float) -> float:
    """
    Computes portfolio volatility using covariance assumptions, scaled by margin leverage.
    Var_p = sum(w_i^2 * vol_i^2) + 2 * sum(w_i * w_j * corr * vol_i * vol_j)
    """
    correlation = 0.22  # Positive market correlation baseline
    variance = 0.0
    
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
            
    # Portfolio volatility is standard deviation scaled directly by leverage
    return math.sqrt(variance) * leverage

# --- Routes ---
@app.get("/")
def read_root():
    return {
        "status": "healthy",
        "project": "AI Financial Risk Copilot & Cognition Framework API",
        "description": "An AI-powered investor safety and financial cognition framework serving six-category ISS analytics",
        "version": "1.2.0"
    }

@app.post("/analyze-portfolio", response_model=PortfolioRiskResponse)
def analyze_portfolio(input_data: FrameworkInput):
    assets = input_data.assets
    total_weight = sum(a.weight for a in assets)
    
    if not (99.0 <= total_weight <= 101.0):
        raise HTTPException(status_code=400, detail=f"Portfolio weights must sum to approximately 100%. Current sum: {total_weight}%")

    # 1. HHI concentration
    hhi = sum((a.weight / 100.0) ** 2 for a in assets)
    dhs = (1.0 - hhi) * 100.0
    
    # 2. Covariance volatility scaled by margin
    p_vol = calculate_portfolio_volatility(assets, input_data.parameters.leverage)
    
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
        rating=rating
    )

@app.post("/analyze-sentiment", response_model=BehavioralBiasResponse)
def analyze_sentiment(chat_input: ConversationalInput):
    text = chat_input.text.lower()
    detected = []
    score = 25.0  # Baseline curiosity risk

    fomo_keywords = r"(moon|rocket|trending|tiktok|hype|everyone is|all savings|doge|crypto|bubble|double|fomo|chasing|get rich)"
    loss_keywords = r"(lost|panic|revenge|double down|get it back|down|options|crash|sell everything|drawdown|anxious|scared|worried|losses)"
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
def explain_safety(input_data: FrameworkInput, chat_input: ConversationalInput):
    # Process portfolio analytics & text sentiment
    portfolio_res = analyze_portfolio(input_data)
    behavioral_res = analyze_sentiment(chat_input)

    # 1. Concentration Risk (CR = HHI * 100)
    cr = portfolio_res.hhi * 100.0
    
    # 2. Volatility Risk (VR = portfolio standard deviation relative to VOO 15%)
    p_vol = portfolio_res.estimated_portfolio_volatility / 100.0
    vr = min(100.0, (p_vol / 0.15) * 50.0)
    
    # 3. Liquidity Risk (LR = 100 - (cash + index_safe))
    index_weight = sum(a.weight for a in input_data.assets if a.category == "index_safe")
    lr = max(0.0, 100.0 - (input_data.parameters.liquidity + index_weight))
    
    # 4. Leverage Risk (LEV = (leverage - 1.0) * 50)
    lev = min(100.0, (input_data.parameters.leverage - 1.0) * 50.0)
    
    # 5. Emotional Risk (B)
    b_score = behavioral_res.behavioral_risk_score
    
    # 6. Diversification Risk (DR = HHI inverse)
    dr = max(0.0, 100.0 - cr)

    # Proprietary Safety Score Equations
    # ISS = 100 - (0.25*CR + 0.20*VR + 0.10*LR + 0.15*LEV + 0.20*Behavioral + 0.10*DR_risk)
    weighted_sum = (0.25 * cr) + (0.20 * vr) + (0.10 * lr) + (0.15 * lev) + (0.20 * b_score) + (0.10 * (100.0 - dr))
    iss_score = round(100 - weighted_sum)
    iss_score = max(0, min(100, iss_score))

    # Formulate Case Studies outputs and guidance
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
        guidance.append("Chasing 'rocket' trends on social media is highly risky. Hype curves usually crash just as fast as they rocket.")
    if "Loss Aversion / Revenge Trading" in biases:
        guidance.append("We understand that seeing assets slide is painful. But double-down revenge trading on margin options often results in a total wipeout.")

    six_cat = SixCategoryRiskResponse(
        concentration_risk=round(cr, 2),
        volatility_risk=round(vr, 2),
        liquidity_risk=round(lr, 2),
        leverage_risk=round(lev, 2),
        emotional_risk=round(b_score, 2),
        diversification_risk=round(100.0 - dr, 2)
    )

    return SafetyScoreResponse(
        investor_safety_score=iss_score,
        portfolio_analytics=portfolio_res,
        behavioral_analysis=behavioral_res,
        six_category_breakdown=six_cat,
        explainable_guidance=guidance,
        humanised_analogy=analogy
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
