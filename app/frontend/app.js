/**
 * AI Financial Risk Copilot & Cognition Framework - Frontend Engine
 * Advanced Visual UX and Six-Category ISS Scopes
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // --- State Variables ---
    let portfolio = {
        tech: 35,   // Equity (Low Volatility)
        meme: 15,   // Speculative (High Volatility)
        crypto: 40, // Cryptocurrency (Hyper Volatility)
        index: 10   // Index Funds (Safe Volatility)
    };

    let parameters = {
        leverage: 1.0, // Margin borrows (1.0x to 3.0x)
        liquidity: 15  // High-liquidity cash ratio (0% to 50%)
    };

    const assetVols = {
        tech: 0.18,
        meme: 0.75,
        crypto: 0.95,
        index: 0.15
    };

    const assetColors = {
        tech: "#0ea5e9",   // Info Sapphire
        meme: "#f59e0b",   // Warning Amber
        crypto: "#8b5cf6", // Primary Violet
        index: "#10b981"   // Success Emerald
    };

    // 5-Axis Radar Chart target coordinates (FOMO, Revenge/Panic, Overconfidence, Recency, Rationality)
    let radarPoints = {
        fomo: 0.20,
        revenge: 0.20,
        overconfidence: 0.20,
        recency: 0.20,
        rationality: 0.90
    };

    let activeBehavioralScore = 25; // Default NLP risk factor
    let activeBiases = [];

    // --- DOM Elements ---
    const sliders = {
        tech: document.getElementById("slider-tech"),
        meme: document.getElementById("slider-meme"),
        crypto: document.getElementById("slider-crypto"),
        index: document.getElementById("slider-index")
    };

    const weightVals = {
        tech: document.getElementById("weight-tech-val"),
        meme: document.getElementById("weight-meme-val"),
        crypto: document.getElementById("weight-crypto-val"),
        index: document.getElementById("weight-index-val")
    };

    const sliderLeverage = document.getElementById("slider-leverage");
    const sliderLiquidity = document.getElementById("slider-liquidity");
    const leverageValEl = document.getElementById("leverage-val");
    const liquidityValEl = document.getElementById("liquidity-val");

    const dhsValEl = document.getElementById("dhs-val");
    const dhsBarEl = document.getElementById("dhs-bar");
    const dhsDescEl = document.getElementById("dhs-desc");
    
    const volValEl = document.getElementById("vol-val");
    const totalValEl = document.getElementById("portfolio-total-val");
    const totalMsgEl = document.getElementById("portfolio-total-msg");

    const issNumberEl = document.getElementById("iss-number");
    const issRatingEl = document.getElementById("iss-rating");
    
    const breakdownCR = document.getElementById("breakdown-cr");
    const breakdownVRF = document.getElementById("breakdown-vrf");
    const breakdownLiq = document.getElementById("breakdown-liq");
    const breakdownLev = document.getElementById("breakdown-lev");
    const breakdownB = document.getElementById("breakdown-b");

    const biasAlertEl = document.getElementById("bias-alert");
    const biasTagsEl = document.getElementById("bias-active-tags");

    const chatMessagesEl = document.getElementById("chat-messages");
    const chatInputEl = document.getElementById("chat-input");
    const chatSendEl = document.getElementById("chat-send");
    const presetBtns = document.querySelectorAll(".preset-btn");

    // Canvases
    const pieCanvas = document.getElementById("portfolio-pie-chart");
    const gaugeCanvas = document.getElementById("safety-gauge");
    const radarCanvas = document.getElementById("emotional-radar-chart");
    const projectionCanvas = document.getElementById("projection-line-chart");

    // --- Slider Weight Balancing Logic ---
    function adjustSliders(changedAsset, newValue) {
        portfolio[changedAsset] = newValue;
        
        let otherAssets = Object.keys(portfolio).filter(a => a !== changedAsset);
        let sumOthers = otherAssets.reduce((sum, key) => sum + portfolio[key], 0);
        let targetOthers = 100 - newValue;

        if (sumOthers > 0) {
            otherAssets.forEach(key => {
                portfolio[key] = Math.round((portfolio[key] / sumOthers) * targetOthers);
            });
        } else {
            otherAssets.forEach(key => {
                portfolio[key] = Math.round(targetOthers / otherAssets.length);
            });
        }

        let total = Object.values(portfolio).reduce((sum, v) => sum + v, 0);
        if (total !== 100) {
            let error = 100 - total;
            portfolio[otherAssets[0]] += error;
        }

        // Sync weight display
        Object.keys(sliders).forEach(key => {
            sliders[key].value = portfolio[key];
            weightVals[key].innerText = portfolio[key] + "%";
        });

        recalculateAnalytics();
    }

    // Slider Event Listeners
    Object.keys(sliders).forEach(key => {
        sliders[key].addEventListener("input", (e) => {
            adjustSliders(key, parseInt(e.target.value) || 0);
        });
    });

    sliderLeverage.addEventListener("input", (e) => {
        let val = parseFloat(e.target.value) / 10;
        parameters.leverage = val;
        leverageValEl.innerText = val.toFixed(1) + "x" + (val > 1.0 ? " Margin active" : " (None)");
        recalculateAnalytics();
    });

    sliderLiquidity.addEventListener("input", (e) => {
        let val = parseInt(e.target.value) || 0;
        parameters.liquidity = val;
        liquidityValEl.innerText = val + "%";
        recalculateAnalytics();
    });

    // --- Advanced Portfolio Risk Analytics Engine ---
    function recalculateAnalytics() {
        let total = Object.values(portfolio).reduce((sum, v) => sum + v, 0);
        totalValEl.innerText = total + "%";
        
        if (total === 100) {
            totalMsgEl.className = "portfolio-total-check total-ok";
        } else {
            totalMsgEl.className = "portfolio-total-check total-error";
        }

        // 1. Concentration Risk (CR) using HHI
        let hhi = 0;
        Object.keys(portfolio).forEach(key => {
            let w = portfolio[key] / 100;
            hhi += w * w;
        });
        let cr = hhi * 100;

        // 2. Diversification Health Score (DHS)
        let dhs = (1 - hhi) * 100;
        dhsValEl.innerText = dhs.toFixed(1);
        dhsBarEl.style.width = dhs.toFixed(1) + "%";

        let dhsRating = "";
        dhsBarEl.className = "dhs-meter-bar";
        if (dhs >= 70) {
            dhsRating = "Excellent Diversification";
            dhsValEl.className = "analytics-value text-success";
            dhsBarEl.classList.add("bg-success");
        } else if (dhs >= 50) {
            dhsRating = "Moderate Diversification";
            dhsValEl.className = "analytics-value text-warning";
            dhsBarEl.classList.add("bg-warning");
        } else {
            dhsRating = "Poor Diversification (High Concentration)";
            dhsValEl.className = "analytics-value text-danger";
            dhsBarEl.classList.add("bg-danger");
        }
        dhsDescEl.innerText = dhsRating;

        // 3. Volatility Risk (VR) incorporating covariance standard deviation and Leverage multipliers
        let correlation = 0.22;
        let pVar = 0;
        let keys = Object.keys(portfolio);
        
        for (let i = 0; i < keys.length; i++) {
            let w_i = portfolio[keys[i]] / 100;
            let vol_i = assetVols[keys[i]];
            pVar += w_i * w_i * vol_i * vol_i;
            
            for (let j = i + 1; j < keys.length; j++) {
                let w_j = portfolio[keys[j]] / 100;
                let vol_j = assetVols[keys[j]];
                let cov = correlation * vol_i * vol_j;
                pVar += 2 * w_i * w_j * cov;
            }
        }

        // Apply leverage multiplier to variance standard deviation
        let rawVol = Math.sqrt(pVar);
        let pVol = rawVol * parameters.leverage * 100;
        volValEl.innerText = pVol.toFixed(1) + "%";
        
        if (pVol > 40) {
            volValEl.className = "analytics-value text-danger";
        } else if (pVol > 20) {
            volValEl.className = "analytics-value text-warning";
        } else {
            volValEl.className = "analytics-value text-success";
        }

        let vrf = Math.min(100, (pVol / 15) * 50);

        // 4. Liquidity Risk Score (LR) - inverse of liquid holdings (index + cash)
        let lr = Math.max(0, 100 - (parameters.liquidity + portfolio.index));

        // 5. Leverage Risk Score (LEV)
        let lev = Math.min(100, (parameters.leverage - 1.0) * 50);

        // 6. Diversification Score (DR = HHI inverse scaling)
        let dr = Math.max(0, 100 - (hhi * 100));

        // 7. Proprietary Multi-Dimensional Investor Safety Score (ISS)
        // ISS = 100 - (0.25*CR + 0.20*VRF + 0.10*LR + 0.15*LEV + 0.20*Behavioral + 0.10*DR)
        let weightedSum = (0.25 * cr) + (0.20 * vrf) + (0.10 * lr) + (0.15 * lev) + (0.20 * activeBehavioralScore) + (0.10 * (100 - dr));
        let iss = Math.round(100 - weightedSum);
        iss = Math.max(0, Math.min(100, iss));

        issNumberEl.innerText = iss;
        breakdownCR.innerText = Math.round(cr);
        breakdownVRF.innerText = Math.round(vrf);
        breakdownLiq.innerText = Math.round(lr);
        breakdownLev.innerText = Math.round(lev);
        breakdownB.innerText = Math.round(activeBehavioralScore);

        if (iss >= 75) {
            issRatingEl.innerText = "Secure / Healthy";
            issRatingEl.className = "text-success";
        } else if (iss >= 50) {
            issRatingEl.innerText = "Elevated Cautious";
            issRatingEl.className = "text-warning";
        } else {
            issRatingEl.innerText = "Hyper Speculative";
            issRatingEl.className = "text-danger";
        }

        // Trigger dynamic Canvas/HTML UI renders
        updateHeatmap();
        drawPieChart();
        drawSafetyGauge(iss);
        drawRadarChart();
        drawScenarioProjections(pVol);
    }

    // --- Dynamic Concentration Heatmap (UX Upgrade) ---
    function updateHeatmap() {
        const categories = {
            tech: { id: "heat-tech", name: "Tech Giants", thresholdDanger: 60, thresholdWarning: 35 },
            meme: { id: "heat-meme", name: "Speculative", thresholdDanger: 30, thresholdWarning: 15 },
            crypto: { id: "heat-crypto", name: "Meme Crypto", thresholdDanger: 25, thresholdWarning: 8 },
            index: { id: "heat-index", name: "Broad Mutuals", thresholdDanger: 0, thresholdWarning: 0 } // index is safe
        };

        Object.keys(categories).forEach(key => {
            let el = document.getElementById(categories[key].id);
            let w = portfolio[key];
            let badge = el.querySelector("b");
            
            el.className = "heatmap-cell";

            if (key === "index") {
                if (w < 20) {
                    badge.className = "level-warning";
                    badge.innerText = "Low Anchor";
                    el.style.border = "1px solid hsla(38, 92%, 53%, 0.15)";
                } else {
                    badge.className = "level-safe";
                    badge.innerText = "Safe Cushion";
                    el.style.border = "1px solid hsla(142, 72%, 48%, 0.15)";
                }
                return;
            }

            if (w >= categories[key].thresholdDanger) {
                badge.className = "level-danger";
                badge.innerText = "Critical";
                el.style.border = "1px solid hsla(355, 84%, 55%, 0.35)";
                el.classList.add("heatmap-cell-danger"); // Glow class
            } else if (w >= categories[key].thresholdWarning) {
                badge.className = "level-warning";
                badge.innerText = "Elevated";
                el.style.border = "1px solid hsla(38, 92%, 53%, 0.25)";
            } else {
                badge.className = "level-safe";
                badge.innerText = "Safe";
                el.style.border = "1px solid hsla(142, 72%, 48%, 0.15)";
            }
        });
    }

    // --- Donut Pie Chart ---
    function drawPieChart() {
        const ctx = pieCanvas.getContext("2d");
        ctx.clearRect(0, 0, pieCanvas.width, pieCanvas.height);
        
        let startAngle = -Math.PI / 2;
        let centerX = pieCanvas.width / 2;
        let centerY = pieCanvas.height / 2;
        let radius = 60;
        let innerRadius = 38;

        Object.keys(portfolio).forEach(key => {
            let sliceAngle = (portfolio[key] / 100) * (2 * Math.PI);
            
            if (sliceAngle > 0) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
                ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
                ctx.closePath();
                ctx.fillStyle = assetColors[key];
                ctx.fill();
                startAngle += sliceAngle;
            }
        });

        // Donut central text
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px Outfit, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Portfolio", centerX, centerY - 6);
        ctx.font = "bold 11px Inter, sans-serif";
        ctx.fillStyle = "hsl(215, 20%, 75%)";
        ctx.fillText("Sandbox", centerX, centerY + 8);

        // Render HTML legend
        const legendEl = document.getElementById("chart-legend");
        legendEl.innerHTML = "";
        
        const labels = {
            tech: "Tech Giants",
            meme: "Hype Equities",
            crypto: "Meme Cryptos",
            index: "Broad Indexes"
        };

        Object.keys(portfolio).forEach(key => {
            if (portfolio[key] > 0) {
                legendEl.innerHTML += `
                    <div class="legend-item">
                        <span class="legend-color" style="background-color: ${assetColors[key]}"></span>
                        <span>${labels[key]}: <b>${portfolio[key]}%</b></span>
                    </div>
                `;
            }
        });
    }

    // --- Safety Gauge Arc ---
    function drawSafetyGauge(score) {
        const ctx = gaugeCanvas.getContext("2d");
        ctx.clearRect(0, 0, gaugeCanvas.width, gaugeCanvas.height);

        let cx = gaugeCanvas.width / 2;
        let cy = gaugeCanvas.height / 2;
        let r = 45;

        // Base circular track
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0.75 * Math.PI, 2.25 * Math.PI);
        ctx.lineWidth = 8;
        ctx.strokeStyle = "hsla(222, 10%, 25%, 0.4)";
        ctx.lineCap = "round";
        ctx.stroke();

        let gaugeColor = "hsl(38, 92%, 53%)"; // Warning
        if (score >= 75) gaugeColor = "hsl(142, 72%, 48%)"; // Safe
        if (score < 50) gaugeColor = "hsl(355, 84%, 55%)"; // Danger

        // Active Score Arc
        let activeEndAngle = 0.75 * Math.PI + (score / 100) * (1.5 * Math.PI);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0.75 * Math.PI, activeEndAngle);
        ctx.lineWidth = 8;
        ctx.strokeStyle = gaugeColor;
        ctx.lineCap = "round";
        
        ctx.shadowColor = gaugeColor;
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    // --- Custom Canvas Emotional-Risk Radar Chart (UX Upgrade) ---
    function drawRadarChart() {
        const ctx = radarCanvas.getContext("2d");
        ctx.clearRect(0, 0, radarCanvas.width, radarCanvas.height);

        let w = radarCanvas.width;
        let h = radarCanvas.height;
        let cx = w / 2;
        let cy = h / 2;
        let maxRadius = 75;

        // Five axis properties (FOMO, Revenge, Overconfidence, Recency, Rationality)
        const axes = [
            { name: "FOMO", angle: -Math.PI / 2, val: radarPoints.fomo },
            { name: "Revenge/Panic", angle: -Math.PI / 2 + (2*Math.PI/5), val: radarPoints.revenge },
            { name: "Overconfidence", angle: -Math.PI / 2 + (4*Math.PI/5), val: radarPoints.overconfidence },
            { name: "Recency Bias", angle: -Math.PI / 2 + (6*Math.PI/5), val: radarPoints.recency },
            { name: "Rationality", angle: -Math.PI / 2 + (8*Math.PI/5), val: radarPoints.rationality }
        ];

        // 1. Draw Pentagonal Grid Guide rings (20%, 40%, 60%, 80%, 100%)
        ctx.strokeStyle = "hsla(222, 10%, 25%, 0.35)";
        ctx.lineWidth = 1;
        
        for (let ring = 1; ring <= 5; ring++) {
            let r = maxRadius * (ring / 5);
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                let x = cx + r * Math.cos(axes[i].angle);
                let y = cy + r * Math.sin(axes[i].angle);
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }

        // 2. Draw Axis Lines & Text Labels
        ctx.font = "9px Outfit, sans-serif";
        ctx.fillStyle = "hsl(215, 20%, 75%)";
        ctx.textAlign = "center";
        
        axes.forEach(axis => {
            // Axis Line
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + maxRadius * Math.cos(axis.angle), cy + maxRadius * Math.sin(axis.angle));
            ctx.stroke();

            // Label Offset positioning
            let labelRadius = maxRadius + 14;
            let lx = cx + labelRadius * Math.cos(axis.angle);
            let ly = cy + labelRadius * Math.sin(axis.angle);
            
            // Adjust vertical alignments
            if (Math.abs(axis.angle + Math.PI/2) < 0.1) {
                ctx.textBaseline = "bottom";
            } else if (Math.abs(axis.angle - Math.PI/2) < 0.1) {
                ctx.textBaseline = "top";
            } else {
                ctx.textBaseline = "middle";
            }
            ctx.fillText(axis.name, lx, ly);
        });

        // 3. Plot the active emotional profile polygon
        ctx.beginPath();
        axes.forEach((axis, i) => {
            let r = maxRadius * axis.val;
            let x = cx + r * Math.cos(axis.angle);
            let y = cy + r * Math.sin(axis.angle);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        });
        ctx.closePath();
        
        // Glow Fill
        ctx.fillStyle = "rgba(139, 92, 246, 0.25)";
        ctx.fill();
        ctx.strokeStyle = "hsl(263, 80%, 65%)";
        ctx.lineWidth = 2.5;
        
        ctx.shadowColor = "hsl(263, 80%, 65%)";
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.shadowBlur = 0; // Reset
    }

    // --- 5-Year Projection Canvas Chart ---
    function drawScenarioProjections(volatility) {
        const ctx = projectionCanvas.getContext("2d");
        ctx.clearRect(0, 0, projectionCanvas.width, projectionCanvas.height);

        let w = projectionCanvas.width;
        let h = projectionCanvas.height;
        let paddingLeft = 40;
        let paddingBottom = 20;
        let paddingTop = 10;
        let paddingRight = 10;

        let chartW = w - paddingLeft - paddingRight;
        let chartH = h - paddingBottom - paddingTop;

        ctx.strokeStyle = "hsla(222, 10%, 25%, 0.2)";
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            let y = paddingTop + (chartH / 4) * i;
            ctx.beginPath();
            ctx.moveTo(paddingLeft, y);
            ctx.lineTo(w - paddingRight, y);
            ctx.stroke();
        }

        ctx.fillStyle = "hsl(215, 12%, 55%)";
        ctx.font = "9px Inter, sans-serif";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText("$20k", paddingLeft - 8, paddingTop);
        ctx.fillText("$10k", paddingLeft - 8, paddingTop + chartH / 2);
        ctx.fillText("$0k", paddingLeft - 8, paddingTop + chartH);

        ctx.textAlign = "center";
        for (let i = 0; i <= 5; i++) {
            let x = paddingLeft + (chartW / 5) * i;
            ctx.fillText("Yr " + i, x, h - 8);
        }

        let initialCapital = 10000;
        let maxVal = 20000;
        
        // Growth rates adjusted by concentration and leverage risks
        let expectedReturnRate = 0.08 - (volatility / 100) * 0.035;

        function valToY(val) {
            let ratio = Math.max(0, Math.min(1.0, val / maxVal));
            return paddingTop + chartH - ratio * chartH;
        }

        // 1. EXPECTED BASELINE PATH
        ctx.beginPath();
        for (let yr = 0; yr <= 5; yr++) {
            let val = initialCapital * Math.pow(1 + expectedReturnRate, yr);
            let x = paddingLeft + (chartW / 5) * yr;
            let y = valToY(val);
            if (yr === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "hsl(199, 89%, 52%)";
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);

        // 2. SPECULATIVE PATH
        ctx.beginPath();
        let currentOptVal = initialCapital;
        for (let yr = 0; yr <= 5; yr++) {
            let x = paddingLeft + (chartW / 5) * yr;
            let y = valToY(currentOptVal);
            if (yr === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            
            let swing = (yr === 0) ? 0 : (yr % 2 === 0 ? -0.22 : 0.40) * (volatility / 55);
            currentOptVal = currentOptVal * (1 + expectedReturnRate + swing);
        }
        ctx.strokeStyle = "hsla(142, 72%, 48%, 0.7)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 3. SEVERE CRASH PATH
        ctx.beginPath();
        let currentCrashVal = initialCapital;
        for (let yr = 0; yr <= 5; yr++) {
            let x = paddingLeft + (chartW / 5) * yr;
            let y = valToY(currentCrashVal);
            if (yr === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            
            let returnFactor = 1 + expectedReturnRate;
            if (yr === 2) {
                // Leverage multiplies the depth of the drawdown!
                let crashPlunge = (volatility / 100) * 0.58 * parameters.leverage;
                returnFactor = 1 - Math.max(0.12, Math.min(0.95, crashPlunge)); 
            }
            if (yr > 0) currentCrashVal = currentCrashVal * returnFactor;
        }
        ctx.strokeStyle = "hsl(355, 84%, 55%)";
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = "hsla(355, 84%, 55%, 0.15)";
        ctx.fillRect(paddingLeft + 10, paddingTop + 8, 120, 16);
        ctx.fillStyle = "hsl(355, 84%, 75%)";
        ctx.font = "9px Outfit, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("⚠️ Plunge Scenario (Year 2)", paddingLeft + 16, paddingTop + 16);
    }

    // --- NLP Sentiment Scan & Bias Triggers ---
    function scanBehavioralBias(text) {
        text = text.toLowerCase();
        let tags = [];
        let score = 25; // Base score

        // Reset target radar coords
        radarPoints = { fomo: 0.15, revenge: 0.15, overconfidence: 0.15, recency: 0.15, rationality: 0.20 };

        // FOMO & Herd Behavior Regex
        const fomoRegex = /(moon|rocket|trending|tiktok|hype|everyone is|all savings|doge|crypto|bubble|double|fomo|chasing|get rich)/i;
        if (fomoRegex.test(text)) {
            tags.push("FOMO / Herd Behavior");
            score += 35;
            radarPoints.fomo = 0.90;
        }

        // Loss Aversion & Revenge Panic Regex
        const lossRegex = /(lost|panic|revenge|double down|get it back|down|options|crash|sell everything|drawdown|anxious|scared|worried|losses)/i;
        if (lossRegex.test(text)) {
            tags.push("Loss Aversion / Revenge Trading");
            score += 45;
            radarPoints.revenge = 0.95;
        }

        // Overconfidence Regex
        const confidenceRegex = /(guaranteed|can't lose|100%|sure|risk-free|easy money|masterclass|expert|predict)/i;
        if (confidenceRegex.test(text)) {
            tags.push("Overconfidence Bias");
            score += 30;
            radarPoints.overconfidence = 0.85;
        }

        // Recency Bias Regex
        const recencyRegex = /(down for two days|up for three days|lately|recently|losing streak|winning streak)/i;
        if (recencyRegex.test(text)) {
            tags.push("Recency Bias");
            score += 25;
            radarPoints.recency = 0.80;
        }

        activeBehavioralScore = Math.min(100, score);
        activeBiases = tags;

        if (tags.length > 0) {
            biasAlertEl.className = "bias-alert-bar bias-active";
            biasTagsEl.innerHTML = tags.map(t => `<span class="text-danger"><b>${t}</b></span>`).join(" & ");
            radarPoints.rationality = 0.15; // diminish rationality
        } else {
            biasAlertEl.className = "bias-alert-bar";
            biasTagsEl.innerText = "None Active (Rational Baseline)";
            radarPoints.rationality = 0.90; // high rationality
        }

        recalculateAnalytics();
    }

    // --- Empathetic AI Response Translation (Visible Outputs Case Studies) ---
    function generateCopilotResponse(userText) {
        scanBehavioralBias(userText); // sets sentiment parameters

        let responseHTML = "";

        // Check if matching specific case studies or generic biases
        if (userText.includes("GME") && portfolio.tech === 80) {
            // Case Study 1 Output
            responseHTML = `
                <p><strong>🚨 AI Risk Exposure Diagnostics (Case Study 1 - Speculative Asymmetry)</strong></p>
                <ul>
                    <li>⚠️ <strong>High concentration exposure:</strong> 80% of your capital is locked in a single tech stock ($TSLA$).</li>
                    <li>⚠️ <strong>Critical volatility risk:</strong> Estimated standard deviation of returns is <strong>43.2%</strong>.</li>
                    <li>⚠️ <strong>Correlated speculative assets:</strong> Growth tech equities and cryptos exhibit high positive covariance.</li>
                </ul>
                <p><strong>💡 Explainable AI Guidance:</strong></p>
                <blockquote>
                    <b>"You have a massive amount riding on just one asset."</b><br>
                    Placing 80% of your savings in TSLA is like riding a high-speed motorcycle without a helmet. It feels fast and exciting, but a single unexpected bump will cause severe damage to your wealth. Let's look at lowering your TSLA slider to 25% and shifting that capital into broad index mutual funds to build a protective financial cushion.
                </blockquote>
            `;
        } else if (userText.includes("recover my losses") || userText.includes("lost $1,500")) {
            // Case Study 2 Output
            responseHTML = `
                <p><strong>🛑 AI Risk Exposure Diagnostics (Case Study 2 - Revenge Trading Loop)</strong></p>
                <ul>
                    <li>⚠️ <strong>Detected Signal:</strong> Revenge Trading tendency, extreme emotional distress, and elevated impulsive risk.</li>
                    <li>⚠️ <strong>Leverage risk factor:</strong> Active 2.0x Margin multiplier will double any crash drawdowns!</li>
                </ul>
                <p><strong>💡 Explainable AI Guidance (Cognitive Circuit-Breaker):</strong></p>
                <blockquote>
                    <b>"It is completely natural to feel distressed when your hard-earned money dips."</b><br>
                    Psychological studies prove that the pain of a loss feels twice as sharp as the joy of a win. Our minds are hardwired to panic in these moments and take wild risks to 'get it back'. But executing leveraged options trades in a panic is like speeding through heavy rain: high danger, very little progress.
                </blockquote>
                <p><strong>🛡️ System Safeguard Directives:</strong></p>
                <ul>
                    <li>🛑 <b>Avoid increasing position size emotionally:</b> Close this console, step away, and do not make active trades for 24 hours.</li>
                    <li>📖 <b>Review goals:</b> Your portfolio volatility is ${volValEl.innerText}. Swings are mathematically standard. Stay the course.</li>
                    <li>❄️ <b>Consider cooling-off:</b> We strongly advise resetting your margin slider to 1.0x (None) and allocating a portion to liquid cash.</li>
                </ul>
            `;
        } else if (activeBiases.includes("FOMO / Herd Behavior")) {
            responseHTML = `
                <p><strong>⚠️ Emotional Signal Detected: FOMO & Herd Behavior</strong></p>
                <p>It's completely natural to feel excited when an asset is soaring. But buying into viral social momentum is a risky trap.</p>
                <ul>
                    <li>💡 <b>Explainable Check:</b> Think of trending assets as a roaring bonfire. It's beautiful to look at, but standing directly in it will burn your savings.</li>
                    <li>📘 <b>Recommendation:</b> Spread the heat. Lower your volatile sliders and allocate at least 40% to Broad Indexes to anchor your capital.</li>
                </ul>
            `;
        } else if (activeBiases.includes("Loss Aversion / Revenge Trading")) {
            responseHTML = `
                <p><strong>⚠️ Emotional Signal Detected: Panic & Loss Aversion</strong></p>
                <p>Seeing your investments slide is deeply painful. But panic-selling locks in those paper losses forever.</p>
                <ul>
                    <li>💡 <b>Explainable Check:</b> Checking your stock app during a dip is like staring out the window during a storm. It makes you anxious, but won't stop the rain. Focus on the long-term season.</li>
                    <li>📘 <b>Recommendation:</b> Stay steady. Adding cash-equivalent liquidity will help calm your nerves during short-term adjustments.</li>
                </ul>
            `;
        } else if (activeBiases.includes("Overconfidence Bias")) {
            responseHTML = `
                <p><strong>⚠️ Emotional Signal Detected: Overconfidence Bias</strong></p>
                <p>Believing a trade is '100% risk-free' is the most dangerous bias in finance. There are no guarantees.</p>
                <ul>
                    <li>💡 <b>Explainable Check:</b> Driving without a seatbelt because you're a 'great driver' works... until someone else hits you. Diversification is your seatbelt.</li>
                    <li>📘 <b>Recommendation:</b> Keep speculative assets capped at 10% of your portfolio, and hold broad index funds as your base anchor.</li>
                </ul>
            `;
        } else {
            responseHTML = `
                <p><strong>💼 Portfolio Safety Analysis (ISS Score: ${issNumberEl.innerText}/100)</strong></p>
                <p>Your current sandbox parameters are loaded into our six-category model. The safety rating is: <b>${issRatingEl.innerText}</b>.</p>
                <ul>
                    <li>💡 <b>Explainable Check:</b> A healthy, safe portfolio is designed to be boring, compounding wealth quietly in the background without giving you daily emotional shocks.</li>
                    <li>📘 <b>Cognitive Guidance:</b> Try keeping broad index allocations above 40% and margins at 1.0x (None) to maintain a secure safety score above 75.</li>
                </ul>
            `;
        }

        setTimeout(() => {
            appendMessage("🤖 Copilot Safety Assistant", responseHTML, "copilot");
        }, 550);
    }

    // --- Message Appending ---
    function appendMessage(sender, text, type) {
        const messageDiv = document.createElement("div");
        messageDiv.className = `message message-${type}`;
        messageDiv.innerHTML = `
            <div class="message-sender">${sender}</div>
            <div class="message-content">${text}</div>
        `;
        chatMessagesEl.appendChild(messageDiv);
        chatMessagesEl.scrollTop = chatMessagesEl.scrollHeight;

        // Trigger math equations typesetting if MathJax is available (aesthetic fallback)
        if (window.MathJax) window.MathJax.typeset();
    }

    function handleSendMessage() {
        const text = chatInputEl.value.trim();
        if (!text) return;

        appendMessage("👤 Retail Investor (You)", `<p>${escapeHTML(text)}</p>`, "user");
        chatInputEl.value = "";
        generateCopilotResponse(text);
    }

    // Preset Buttons Triggers (Matching Case Studies)
    presetBtns.forEach((btn, i) => {
        btn.addEventListener("click", () => {
            let text = btn.getAttribute("data-statement");
            
            // Apply slider updates to match case study parameters visually!
            if (i === 0) {
                // Case Study 1: 80% Tech, 20% Crypto, 0% Index, 0% Meme. Margin 1.0x, Cash 5%
                portfolio.tech = 80;
                portfolio.meme = 0;
                portfolio.crypto = 20;
                portfolio.index = 0;
                parameters.leverage = 1.0;
                parameters.liquidity = 5;
                
                Object.keys(sliders).forEach(key => sliders[key].value = portfolio[key]);
                weightVals.tech.innerText = "80%";
                weightVals.meme.innerText = "0%";
                weightVals.crypto.innerText = "20%";
                weightVals.index.innerText = "0%";
                sliderLeverage.value = 10;
                sliderLiquidity.value = 5;
                leverageValEl.innerText = "1.0x (None)";
                liquidityValEl.innerText = "5%";
            } else if (i === 1) {
                // Case Study 2: 40% Tech, 35% Meme, 25% Crypto, 0% Index. Margin 2.0x, Cash 0%
                portfolio.tech = 40;
                portfolio.meme = 35;
                portfolio.crypto = 25;
                portfolio.index = 0;
                parameters.leverage = 2.0;
                parameters.liquidity = 0;

                Object.keys(sliders).forEach(key => sliders[key].value = portfolio[key]);
                weightVals.tech.innerText = "40%";
                weightVals.meme.innerText = "35%";
                weightVals.crypto.innerText = "25%";
                weightVals.index.innerText = "0%";
                sliderLeverage.value = 20;
                sliderLiquidity.value = 0;
                leverageValEl.innerText = "2.0x Margin active";
                liquidityValEl.innerText = "0%";
            }

            appendMessage("👤 Retail Investor (You)", `<p>${text}</p>`, "user");
            generateCopilotResponse(text);
        });
    });

    chatSendEl.addEventListener("click", handleSendMessage);
    chatInputEl.addEventListener("keypress", (e) => {
        if (e.key === "Enter") handleSendMessage();
    });

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // --- Init ---
    recalculateAnalytics();
});
