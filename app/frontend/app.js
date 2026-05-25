/**
 * AI Financial Risk Copilot - Frontend Engine
 * Human-Centered Explainable AI (XAI) Simulation
 */

document.addEventListener("DOMContentLoaded", () => {
    
    // --- State Variables ---
    let portfolio = {
        tech: 35,   // Equity (Low Volatility)
        meme: 15,   // Speculative (High Volatility)
        crypto: 40, // Cryptocurrency (Hyper Volatility)
        index: 10   // Index Funds (Safe Volatility)
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

    let activeBehavioralScore = 25; // Baseline curiosity risk
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
    const projectionCanvas = document.getElementById("projection-line-chart");

    // --- Slider Allocation Balancer ---
    // Distributes changes proportionally to other sliders to maintain exactly 100% total
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
            // If others were zero, divide target equally
            otherAssets.forEach(key => {
                portfolio[key] = Math.round(targetOthers / otherAssets.length);
            });
        }

        // Adjust for rounding errors to guarantee sum is exactly 100
        let total = Object.values(portfolio).reduce((sum, v) => sum + v, 0);
        if (total !== 100) {
            let error = 100 - total;
            portfolio[otherAssets[0]] += error;
        }

        // Sync inputs
        Object.keys(sliders).forEach(key => {
            sliders[key].value = portfolio[key];
            weightVals[key].innerText = portfolio[key] + "%";
        });

        recalculateAnalytics();
    }

    // Bind slider listeners
    Object.keys(sliders).forEach(key => {
        sliders[key].addEventListener("input", (e) => {
            adjustSliders(key, parseInt(e.target.value) || 0);
        });
    });

    // --- Portfolio Mathematics & Analytics Engine ---
    function recalculateAnalytics() {
        // 1. Double check total weight
        let total = Object.values(portfolio).reduce((sum, v) => sum + v, 0);
        totalValEl.innerText = total + "%";
        
        if (total === 100) {
            totalMsgEl.className = "portfolio-total-check total-ok";
        } else {
            totalMsgEl.className = "portfolio-total-check total-error";
        }

        // 2. Compute Herfindahl-Hirschman Index (HHI) for concentration
        let hhi = 0;
        Object.keys(portfolio).forEach(key => {
            let w = portfolio[key] / 100;
            hhi += w * w;
        });

        // 3. Compute Diversification Health Score (DHS)
        let dhs = (1 - hhi) * 100;
        dhsValEl.innerText = dhs.toFixed(1);
        dhsBarEl.style.width = dhs.toFixed(1) + "%";

        // DHS thresholds and descriptors
        let dhsRating = "";
        dhsBarEl.className = "dhs-meter-bar";
        if (dhs >= 70) {
            dhsRating = "Excellent Diversification (Balanced)";
            dhsValEl.className = "analytics-value text-success";
            dhsBarEl.classList.add("bg-success");
        } else if (dhs >= 50) {
            dhsRating = "Moderate Diversification (Concentrated)";
            dhsValEl.className = "analytics-value text-warning";
            dhsBarEl.classList.add("bg-warning");
        } else {
            dhsRating = "Poor Diversification (High Concentration Risk!)";
            dhsValEl.className = "analytics-value text-danger";
            dhsBarEl.classList.add("bg-danger");
        }
        dhsDescEl.innerText = dhsRating;

        // 4. Compute Portfolio Volatility (incorporating a simple covariance matrix)
        // Var_p = sum(w_i^2 * vol_i^2) + 2 * sum(w_i * w_j * cov(i, j))
        // Assuming correlation of 0.22 between all assets
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

        let pVol = Math.sqrt(pVar) * 100;
        volValEl.innerText = pVol.toFixed(1) + "%";
        if (pVol > 40) {
            volValEl.className = "analytics-value text-danger";
        } else if (pVol > 20) {
            volValEl.className = "analytics-value text-warning";
        } else {
            volValEl.className = "analytics-value text-success";
        }

        // 5. Volatility Risk Factor (VRF) - benchmarked to S&P 500 (15%)
        let vrf = Math.min(100, (pVol / 15) * 50);

        // 6. Concentration Risk Score (CR = HHI * 100)
        let cr = hhi * 100;

        // 7. Calculate composite Investor Safety Score (ISS)
        // ISS = 100 - (0.40 * CR + 0.35 * VRF + 0.25 * BehavioralRisk)
        let iss = Math.round(100 - (0.40 * cr + 0.35 * vrf + 0.25 * activeBehavioralScore));
        iss = Math.max(0, Math.min(100, iss));

        issNumberEl.innerText = iss;
        breakdownCR.innerText = Math.round(cr);
        breakdownVRF.innerText = Math.round(vrf);
        breakdownB.innerText = Math.round(activeBehavioralScore);

        // ISS Rating descriptor
        if (iss >= 75) {
            issRatingEl.innerText = "Secure / Healthy";
            issRatingEl.className = "text-success";
        } else if (iss >= 50) {
            issRatingEl.innerText = "Cautious / Elevated Risk";
            issRatingEl.className = "text-warning";
        } else {
            issRatingEl.innerText = "Danger / Hyper Speculative";
            issRatingEl.className = "text-danger";
        }

        // Trigger Canvas updates
        drawPieChart();
        drawSafetyGauge(iss);
        drawScenarioProjections(pVol);
    }

    // --- Canvas Donut Pie Chart ---
    function drawPieChart() {
        const ctx = pieCanvas.getContext("2d");
        ctx.clearRect(0, 0, pieCanvas.width, pieCanvas.height);
        
        let startAngle = -Math.PI / 2;
        let keys = Object.keys(portfolio);
        let centerX = pieCanvas.width / 2;
        let centerY = pieCanvas.height / 2;
        let radius = 60;
        let innerRadius = 38; // Donut style

        keys.forEach(key => {
            let sliceAngle = (portfolio[key] / 100) * (2 * Math.PI);
            
            if (sliceAngle > 0) {
                // Outer circle arc
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
                ctx.arc(centerX, centerY, innerRadius, startAngle + sliceAngle, startAngle, true);
                ctx.closePath();
                ctx.fillStyle = assetColors[key];
                ctx.fill();
                
                startAngle += sliceAngle;
            }
        });

        // Write central percentage text
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px Outfit, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("Portfolio", centerX, centerY - 6);
        ctx.font = "bold 11px Inter, sans-serif";
        ctx.fillStyle = "hsl(215, 20%, 75%)";
        ctx.fillText("Sandbox", centerX, centerY + 8);

        // Update HTML Legend
        const legendEl = document.getElementById("chart-legend");
        legendEl.innerHTML = "";
        
        const labels = {
            tech: "Tech Giants",
            meme: "Hype Equities",
            crypto: "Meme Cryptos",
            index: "Broad Indexes"
        };

        keys.forEach(key => {
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

    // --- Canvas Safety Gauge (ISS Score) ---
    function drawSafetyGauge(score) {
        const ctx = gaugeCanvas.getContext("2d");
        ctx.clearRect(0, 0, gaugeCanvas.width, gaugeCanvas.height);

        let cx = gaugeCanvas.width / 2;
        let cy = gaugeCanvas.height / 2;
        let r = 45;

        // Draw track base arc (glowing slate)
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0.75 * Math.PI, 2.25 * Math.PI);
        ctx.lineWidth = 8;
        ctx.strokeStyle = "hsla(222, 10%, 25%, 0.4)";
        ctx.lineCap = "round";
        ctx.stroke();

        // Determine glow colors based on score
        let gaugeColor = "hsl(38, 92%, 53%)"; // Warning
        if (score >= 75) gaugeColor = "hsl(142, 72%, 48%)"; // Success
        if (score < 50) gaugeColor = "hsl(355, 84%, 55%)"; // Danger

        // Active Score Arc
        let activeEndAngle = 0.75 * Math.PI + (score / 100) * (1.5 * Math.PI);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0.75 * Math.PI, activeEndAngle);
        ctx.lineWidth = 8;
        ctx.strokeStyle = gaugeColor;
        ctx.lineCap = "round";
        
        // Add shadow glow
        ctx.shadowColor = gaugeColor;
        ctx.shadowBlur = 10;
        ctx.stroke();
        
        // Reset shadows
        ctx.shadowBlur = 0;
    }

    // --- Scenario Projections Simulator Line Chart (Section 7.5) ---
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

        // Draw Grid Lines
        ctx.strokeStyle = "hsla(222, 10%, 25%, 0.2)";
        ctx.lineWidth = 1;
        
        // Y grid lines
        for (let i = 0; i <= 4; i++) {
            let y = paddingTop + (chartH / 4) * i;
            ctx.beginPath();
            ctx.moveTo(paddingLeft, y);
            ctx.lineTo(w - paddingRight, y);
            ctx.stroke();
        }

        // Draw Axis labels
        ctx.fillStyle = "hsl(215, 12%, 55%)";
        ctx.font = "9px Inter, sans-serif";
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText("$20k", paddingLeft - 8, paddingTop);
        ctx.fillText("$10k", paddingLeft - 8, paddingTop + chartH / 2);
        ctx.fillText("$0k", paddingLeft - 8, paddingTop + chartH);

        // X labels (Years)
        ctx.textAlign = "center";
        for (let i = 0; i <= 5; i++) {
            let x = paddingLeft + (chartW / 5) * i;
            ctx.fillText("Yr " + i, x, h - 8);
        }

        // Simulation parameters
        let initialCapital = 10000;
        let maxVal = 20000; // Cap visual chart ceiling
        
        // Convert portfolio to expected growth drag
        // More volatile portfolios have slightly higher speculative return potential but severe crash exposure
        let expectedReturnRate = 0.08 - (volatility / 100) * 0.02; // volatile drag
        
        // Draw 3 paths: Baseline Growth, Optimistic Growth, Severe Market Crash Scenario
        
        // Helper to convert data value to Y coordinate
        function valToY(val) {
            let ratio = Math.max(0, Math.min(1.0, val / maxVal));
            return paddingTop + chartH - ratio * chartH;
        }

        // 1. EXPECTED BASELINE PATH (Broad Market Steady Growth)
        ctx.beginPath();
        for (let yr = 0; yr <= 5; yr++) {
            let val = initialCapital * Math.pow(1 + expectedReturnRate, yr);
            let x = paddingLeft + (chartW / 5) * yr;
            let y = valToY(val);
            if (yr === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = "hsl(199, 89%, 52%)"; // Blue baseline
        ctx.lineWidth = 2.5;
        ctx.setLineDash([4, 4]); // Dashed line
        ctx.stroke();
        ctx.setLineDash([]); // Reset dash

        // 2. OPTIMISTIC/SPECULATIVE SCENARIO (Highly volatile peaks)
        ctx.beginPath();
        let currentOptVal = initialCapital;
        for (let yr = 0; yr <= 5; yr++) {
            let x = paddingLeft + (chartW / 5) * yr;
            let y = valToY(currentOptVal);
            if (yr === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            
            // Compounding with volatile swings
            let swing = (yr === 0) ? 0 : (yr % 2 === 0 ? -0.15 : 0.35) * (volatility / 60);
            currentOptVal = currentOptVal * (1 + expectedReturnRate + swing);
        }
        ctx.strokeStyle = "hsla(142, 72%, 48%, 0.7)"; // Success Emerald (Faded)
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 3. SEVERE CRASH PATH (Illustrates downside of high concentration risk)
        ctx.beginPath();
        let currentCrashVal = initialCapital;
        for (let yr = 0; yr <= 5; yr++) {
            let x = paddingLeft + (chartW / 5) * yr;
            let y = valToY(currentCrashVal);
            if (yr === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            
            // Year 2 has a crash: more volatility = bigger crash plunge!
            let returnFactor = 1 + expectedReturnRate;
            if (yr === 2) {
                // Plunge factor directly correlated to portfolio volatility!
                let crashPlunge = (volatility / 100) * 0.65; // up to 65% loss!
                returnFactor = 1 - Math.max(0.12, crashPlunge); 
            }
            if (yr > 0) currentCrashVal = currentCrashVal * returnFactor;
        }
        ctx.strokeStyle = "hsl(355, 84%, 55%)"; // Danger Red
        ctx.lineWidth = 3;
        ctx.stroke();

        // Scenario label
        ctx.fillStyle = "hsla(355, 84%, 55%, 0.15)";
        ctx.fillRect(paddingLeft + 10, paddingTop + 8, 120, 16);
        ctx.fillStyle = "hsl(355, 84%, 75%)";
        ctx.font = "9px Outfit, sans-serif";
        ctx.textAlign = "left";
        ctx.fillText("⚠️ Plunge Scenario (Year 2)", paddingLeft + 16, paddingTop + 16);
    }

    // --- NLP Sentiment Scan & Empathy Engine ---
    function scanBehavioralBias(text) {
        text = text.toLowerCase();
        let tags = [];
        let score = 25; // Default baseline curiosity score

        // 1. FOMO / Herd Behavior Triggers
        const fomoRegex = /(moon|rocket|trending|tiktok|hype|everyone is|all savings|doge|crypto|bubble|double|fomo|chasing|get rich)/i;
        if (fomoRegex.test(text)) {
            tags.push("FOMO / Herd Behavior");
            score += 35;
        }

        // 2. Loss Aversion / Revenge Trading Triggers
        const lossRegex = /(lost|panic|revenge|double down|get it back|down|options|crash|sell everything|drawdown|anxious|scared|worried)/i;
        if (lossRegex.test(text)) {
            tags.push("Loss Aversion / Panic");
            score += 45;
        }

        // 3. Overconfidence Triggers
        const confidenceRegex = /(guaranteed|can't lose|100%|sure|risk-free|easy money|masterclass|expert|predict)/i;
        if (confidenceRegex.test(text)) {
            tags.push("Overconfidence Bias");
            score += 30;
        }

        // Cap at 100
        activeBehavioralScore = Math.min(100, score);
        activeBiases = tags;

        // Update alert bar
        if (tags.length > 0) {
            biasAlertEl.className = "bias-alert-bar bias-active";
            biasTagsEl.innerHTML = tags.map(t => `<span class="text-danger"><b>${t}</b></span>`).join(" & ");
        } else {
            biasAlertEl.className = "bias-alert-bar";
            biasTagsEl.innerText = "None Active (Healthy State)";
        }

        // Sync with dashboard ISS score recalculations
        recalculateAnalytics();
    }

    // --- Copilot Response Generation (Empathetic & Humanised) ---
    function generateCopilotResponse(userText) {
        scanBehavioralBias(userText); // Scan to set active variables

        let responseHTML = "";
        let portfolioSummary = `You have a portfolio split: <b>Tech (${portfolio.tech}%)</b>, <b>Hype stocks (${portfolio.meme}%)</b>, <b>Meme Crypto (${portfolio.crypto}%)</b>, and <b>Broad Indexes (${portfolio.index}%)</b>.`;

        // 1. If FOMO bias triggered
        if (activeBiases.includes("FOMO / Herd Behavior")) {
            responseHTML = `
                <p><strong>It's completely natural to feel excited when an asset is soaring.</strong> We see numbers going up, read social media excitement, and our brains release dopamine telling us not to miss out. But buying into "rocket" hype is a risky psychological trap.</p>
                <p>Based on your current portfolio sliders, your allocation is highly concentrated: ${portfolioSummary}.</p>
                <ul>
                    <li>⚠️ <b>Meme assets</b> can swing 50-90% downwards just as quickly as they went up.</li>
                    <li>💡 <b>Explainable Check:</b> Think of trending assets as a roaring bonfire. It's beautiful to look at, but standing directly in it will burn your savings.</li>
                    <li>📘 <b>Next Step:</b> Spread the heat. Try lowering your volatile crypto/meme sliders to 15% and boosting broad mutual funds to 45% to shield your portfolio against sharp drops.</li>
                </ul>
            `;
        } 
        // 2. If Loss Aversion triggered
        else if (activeBiases.includes("Loss Aversion / Panic")) {
            responseHTML = `
                <p><strong>I hear you, and seeing your hard-earned money dip is deeply stressful.</strong> Psychological studies prove that the pain of losing money is twice as sharp as the joy of making it. Panic-selling during a drop locks in those losses permanently.</p>
                <ul>
                    <li>⚠️ <b>Your Volatility Risk:</b> Your estimated portfolio volatility is ${volValEl.innerText}. This is high, meaning a rollercoaster ride is expected.</li>
                    <li>💡 <b>Explainable Check:</b> Checking the stock ticker during market corrections is like staring at a storm out your window—it causes anxiety, but won't change the weather. Long-term markets have historically bounced back.</li>
                    <li>📘 <b>Empathetic Lesson:</b> Revenge trading (taking massive risks to get back lost money) is how small investors face catastrophic wipes. Let's look at adding broad, steady index funds (e.g. up to 40%) to act as an anchor, smoothing out the swings.</li>
                </ul>
            `;
        }
        // 3. If Overconfidence triggered
        else if (activeBiases.includes("Overconfidence Bias")) {
            responseHTML = `
                <p><strong>Believing a trade is "100% risk-free" is the most dangerous bias in retail finance.</strong> The market is an incredibly complex system; there are no guarantees, and even Nobel-prize-winning firms face catastrophic losses when they assume their models are flawless.</p>
                <ul>
                    <li>⚠️ <b>Your Risk Structure:</b> Concentration in single assets dramatically increases idiosyncratic risk.</li>
                    <li>💡 <b>Explainable Check:</b> Driving without a seatbelt because you're a "great driver" works perfectly... until someone else hits you. Diversification is your seatbelt against unpredictable crashes.</li>
                    <li>📘 <b>Core Education:</b> No single trade should represent all your capital. Try allocating 50% to highly diversified indexes (like SPY/VOO) as a safety cushion. Let's research historical concentration drops together.</li>
                </ul>
            `;
        }
        // 4. Default baseline response
        else {
            responseHTML = `
                <p><strong>Thanks for sharing your thoughts. Let's evaluate this intention together through a risk-aware lens.</strong></p>
                <p>Your current sandbox metrics are:</p>
                <ul>
                    <li>💼 <b>Diversification Score:</b> ${dhsValEl.innerText} (${dhsDescEl.innerText})</li>
                    <li>📈 <b>Annualized Volatility:</b> ${volValEl.innerText}</li>
                    <li>🛡️ <b>Investor Safety Score:</b> ${issNumberEl.innerText} / 100</li>
                </ul>
                <p>💡 <b>Humanised Advice:</b> A healthy, safe portfolio is a boring portfolio. It works quietly in the background like compound interest, rather than giving you daily emotional shocks. Let's try maintaining a Diversification Health Score above 75 by keeping broad index funds as your largest holding.</p>
            `;
        }

        // Add Copilot response after a tiny delay to simulate parsing
        setTimeout(() => {
            appendMessage("🤖 Copilot Risk Assistant", responseHTML, "copilot");
        }, 600);
    }

    // --- Chat Interface Actions ---
    function appendMessage(sender, text, type) {
        const messageDiv = document.createElement("div");
        messageDiv.className = `message message-${type}`;
        
        messageDiv.innerHTML = `
            <div class="message-sender">${sender}</div>
            <div class="message-content">${text}</div>
        `;
        
        chatMessagesEl.appendChild(messageDiv);
        
        // Auto scroll to bottom
        chatContainerScrollToBottom();
    }

    function chatContainerScrollToBottom() {
        const container = document.querySelector(".chat-container");
        container.scrollTop = container.scrollHeight;
    }

    function handleSendMessage() {
        const text = chatInputEl.value.trim();
        if (!text) return;

        // Append User Message
        appendMessage("👤 Retail Investor (You)", `<p>${escapeHTML(text)}</p>`, "user");
        chatInputEl.value = "";

        // Trigger analysis and response
        generateCopilotResponse(text);
    }

    // Preset button trigger
    presetBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            let text = btn.getAttribute("data-statement");
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

    // --- Init Call ---
    recalculateAnalytics();
});
