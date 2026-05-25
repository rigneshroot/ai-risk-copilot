import os
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.gridspec import GridSpec

# Ensure output directory exists
assets_dir = "/Users/subramanyaacharpadamanur/Documents/ai-risk-copilot/docs/assets"
os.makedirs(assets_dir, exist_ok=True)

# Sleek Dark-Mode Color Palette
BG_COLOR = "#0F172A"       # Deep slate 900
CARD_BG = "#1E293B"        # Slate 800
BORDER_COLOR = "#334155"   # Slate 700
TEXT_MAIN = "#F8FAFC"      # White slate
TEXT_MUTED = "#94A3B8"     # Gray slate

COLOR_NEON_CYAN = "#06B6D4"    # Cyan
COLOR_NEON_PINK = "#F43F5E"    # Pink/Rose (Critical)
COLOR_NEON_PURPLE = "#A855F7"  # Purple
COLOR_NEON_AMBER = "#F59E0B"   # Yellow/Amber
COLOR_NEON_EMERALD = "#10B981" # Emerald Green (Safe)

# Standard matplotlib styling
plt.rcParams['text.color'] = TEXT_MAIN
plt.rcParams['axes.labelcolor'] = TEXT_MUTED
plt.rcParams['xtick.color'] = TEXT_MUTED
plt.rcParams['ytick.color'] = TEXT_MUTED
plt.rcParams['font.sans-serif'] = 'sans-serif'
plt.rcParams['font.family'] = 'sans-serif'


def generate_emotional_radar():
    """Generates a beautiful 5-axis emotional-risk radar chart."""
    labels = ['FOMO\n(Herd Chasing)', 'Revenge Trading\n(Loss Panic)', 'Overconfidence\n(Self-Attribution)', 'Recency Bias\n(Short-term Focus)', 'Rationality\n(Safety Anchor)']
    num_vars = len(labels)
    
    # Angles for each axis
    angles = np.linspace(0, 2 * np.pi, num_vars, endpoint=False).tolist()
    angles += angles[:1] # Close the circle
    
    # Case study 2 values (Meme stock revenge trader)
    values = [60, 95, 55, 50, 15]
    values += values[:1] # Close the circle
    
    fig, ax = plt.subplots(figsize=(6, 6), subplot_kw=dict(polar=True), facecolor=BG_COLOR)
    ax.set_facecolor(CARD_BG)
    
    # Draw axes and labels
    plt.xticks(angles[:-1], labels, color=TEXT_MAIN, size=10, weight='bold')
    
    # Draw radial lines and y-ticks
    ax.set_rlabel_position(30)
    plt.yticks([25, 50, 75, 100], ["25", "50", "75", "100"], color=TEXT_MUTED, size=8)
    plt.ylim(0, 100)
    
    # Grid customization
    ax.grid(color=BORDER_COLOR, linestyle='--', linewidth=0.8)
    ax.spines['polar'].set_color(BORDER_COLOR)
    
    # Plot the polygon path and fill it
    ax.plot(angles, values, color=COLOR_NEON_PINK, linewidth=2, linestyle='solid', label="Active Cognitive Bias Map")
    ax.fill(angles, values, color=COLOR_NEON_PINK, alpha=0.35)
    
    # Plot dots at vertices
    ax.scatter(angles[:-1], values[:-1], color=COLOR_NEON_AMBER, s=80, zorder=5, edgecolors=BG_COLOR)
    
    plt.title("Active Emotional-Risk Radar Profile", size=14, color=COLOR_NEON_CYAN, weight='bold', pad=20)
    
    # Clean save
    plt.tight_layout()
    plt.savefig(os.path.join(assets_dir, "emotional_radar.png"), facecolor=BG_COLOR, dpi=150)
    plt.close()
    print("✓ Saved emotional_radar.png")


def generate_concentration_heatmap():
    """Generates a stunning grid heatmap showing asset weight allocations."""
    fig, ax = plt.subplots(figsize=(7, 4), facecolor=BG_COLOR)
    ax.set_facecolor(BG_COLOR)
    
    # We will draw simulated visual grid blocks representing asset allocations
    assets = [
        {"name": "TSLA (Tesla Inc.)", "weight": 80.0, "color": COLOR_NEON_PINK, "desc": "Critical Concentration"},
        {"name": "BTC (Bitcoin)", "weight": 20.0, "color": COLOR_NEON_AMBER, "desc": "High Volatility Asset"},
        {"name": "USD Cash Buffer", "weight": 0.0, "color": BORDER_COLOR, "desc": "Critical Illiquidity"}
    ]
    
    # Position mappings
    y_pos = np.arange(len(assets))
    weights = [a["weight"] for a in assets]
    colors = [a["color"] for a in assets]
    
    bars = ax.barh(y_pos, weights, color=colors, edgecolor=BORDER_COLOR, height=0.55, zorder=3)
    
    # Add text labels inside or beside the bars
    for bar, asset in zip(bars, assets):
        width = bar.get_width()
        # Draw percentage text
        ax.text(width + 2 if width < 90 else width - 8, bar.get_y() + bar.get_height()/2, 
                f"{asset['weight']}%", 
                va='center', ha='left' if width < 90 else 'right',
                color=TEXT_MAIN, weight='bold', size=11)
        
        # Draw status description
        ax.text(1, bar.get_y() + bar.get_height() + 0.03, 
                f"{asset['name']} — {asset['desc']}", 
                va='bottom', ha='left',
                color=TEXT_MAIN if asset['weight'] > 0 else TEXT_MUTED, 
                size=10, weight='semibold')

    # Style axes
    ax.set_yticks([])
    ax.set_xlim(0, 100)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_visible(False)
    ax.spines['bottom'].set_color(BORDER_COLOR)
    ax.grid(axis='x', color=BORDER_COLOR, linestyle=':', alpha=0.6)
    
    plt.title("Portfolio Asset Concentration Grid", size=14, color=COLOR_NEON_CYAN, weight='bold', pad=25)
    plt.xlabel("Allocation Weight (%)", color=TEXT_MUTED, size=10, labelpad=10)
    
    plt.tight_layout()
    plt.savefig(os.path.join(assets_dir, "concentration_heatmap.png"), facecolor=BG_COLOR, dpi=150)
    plt.close()
    print("✓ Saved concentration_heatmap.png")


def generate_scoring_cards():
    """Generates high-fidelity visual scoring cards with detailed numbers."""
    fig, ax = plt.subplots(figsize=(8, 4.5), facecolor=BG_COLOR)
    ax.set_facecolor(CARD_BG)
    
    # Metric scores
    metrics = [
        {"name": "Concentration Risk (CR)", "score": 68, "color": COLOR_NEON_AMBER, "desc": "High Single-Stock Exposure"},
        {"name": "Volatility Risk (VR)", "score": 100, "color": COLOR_NEON_PINK, "desc": "Standard Dev: 54% (Leads to Drawdowns)"},
        {"name": "Liquidity Risk (LR)", "score": 95, "color": COLOR_NEON_PINK, "desc": "Critical Cash-Buffer Deficit"},
        {"name": "Leverage Exposure (LEV)", "score": 50, "color": COLOR_NEON_AMBER, "desc": "2.0x Active Margin Borrowing"},
        {"name": "Behavioral Risk (B)", "score": 95, "color": COLOR_NEON_PINK, "desc": "Revenge Trading & Panic Loop Detected"},
        {"name": "Diversification Score (DR)", "score": 32, "color": COLOR_NEON_PINK, "desc": "Elevated Positional Correlation"}
    ]
    
    y_pos = np.arange(len(metrics))
    scores = [m["score"] for m in metrics]
    colors = [m["color"] for m in metrics]
    
    bars = ax.barh(y_pos, scores, color=colors, edgecolor=BORDER_COLOR, height=0.45, zorder=3)
    
    # Style bars
    for bar, metric in zip(bars, metrics):
        width = bar.get_width()
        # Draw metric name and description
        ax.text(2, bar.get_y() + bar.get_height() + 0.05, 
                f"{metric['name']} — {metric['desc']}", 
                va='bottom', ha='left', color=TEXT_MAIN, size=9, weight='bold')
        # Draw score bubble
        ax.text(width + 2, bar.get_y() + bar.get_height()/2, 
                f"{metric['score']}/100", 
                va='center', ha='left', color=metric['color'], size=10, weight='bold')

    ax.set_yticks([])
    ax.set_xlim(0, 110)
    ax.spines['top'].set_visible(False)
    ax.spines['right'].set_visible(False)
    ax.spines['left'].set_color(BORDER_COLOR)
    ax.spines['bottom'].set_color(BORDER_COLOR)
    ax.grid(axis='x', color=BORDER_COLOR, linestyle=':', alpha=0.5)
    
    plt.title("Investor Safety Score (ISS) Categorical Metrics", size=14, color=COLOR_NEON_CYAN, weight='bold', pad=25)
    plt.xlabel("Risk Factor Intensity Score", color=TEXT_MUTED, size=10, labelpad=10)
    
    plt.tight_layout()
    plt.savefig(os.path.join(assets_dir, "scoring_cards.png"), facecolor=BG_COLOR, dpi=150)
    plt.close()
    print("✓ Saved scoring_cards.png")


def generate_system_architecture():
    """Generates a highly professional vector system architecture flow diagram."""
    fig, ax = plt.subplots(figsize=(10, 5), facecolor=BG_COLOR)
    ax.set_facecolor(BG_COLOR)
    
    # Hide axes
    ax.axis('off')
    
    # 6 pipeline nodes
    nodes = [
        {"x": 1.0, "y": 4.0, "title": "1. User Input Ingest", "body": "Asset Weights, Margins,\nText Statement Queries", "color": COLOR_NEON_CYAN},
        {"x": 4.5, "y": 4.0, "title": "2. Portfolio Analytics", "body": "Computes Covariance,\nStandard Dev, & HHI Index", "color": COLOR_NEON_PURPLE},
        {"x": 8.0, "y": 4.0, "title": "3. Behavioral NLP Layer", "body": "Scans Regex Sentiment\nFOMO & Revenge Trading", "color": COLOR_NEON_AMBER},
        {"x": 8.0, "y": 1.0, "title": "4. Multi-Category ISS", "body": "Aggregates 6 Standardized\nWeighted Risk Metrics", "color": COLOR_NEON_PINK},
        {"x": 4.5, "y": 1.0, "title": "5. Explainable AI Engine", "body": "Maps Quantitative Data\nto Empathetic Analogies", "color": COLOR_NEON_EMERALD},
        {"x": 1.0, "y": 1.0, "title": "6. Safety Nudges Output", "body": "Circular Safety Gauges,\nRadar Charts, Action Nudges", "color": COLOR_NEON_CYAN}
    ]
    
    # Draw boxes
    box_width = 2.8
    box_height = 1.3
    
    for node in nodes:
        # Draw card background
        rect = patches.FancyBboxPatch(
            (node["x"] - box_width/2, node["y"] - box_height/2), 
            box_width, box_height, 
            boxstyle="round,pad=0.1",
            facecolor=CARD_BG, edgecolor=node["color"], linewidth=1.5, zorder=2
        )
        ax.add_patch(rect)
        
        # Card title
        ax.text(node["x"], node["y"] + 0.35, node["title"], 
                color=node["color"], ha='center', va='center', size=10, weight='bold', zorder=3)
        # Card body
        ax.text(node["x"], node["y"] - 0.1, node["body"], 
                color=TEXT_MAIN, ha='center', va='center', size=8.5, zorder=3)
        
    # Draw connections
    def draw_arrow(x1, y1, x2, y2):
        ax.annotate("", xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="->", color=TEXT_MUTED, lw=2, mutation_scale=15), zorder=1)
                    
    # Draw flow paths
    draw_arrow(1.0 + box_width/2 + 0.1, 4.0, 4.5 - box_width/2 - 0.1, 4.0) # 1 -> 2
    draw_arrow(4.5 + box_width/2 + 0.1, 4.0, 8.0 - box_width/2 - 0.1, 4.0) # 2 -> 3
    draw_arrow(8.0, 4.0 - box_height/2 - 0.1, 8.0, 1.0 + box_height/2 + 0.1) # 3 -> 4
    draw_arrow(8.0 - box_width/2 - 0.1, 1.0, 4.5 + box_width/2 + 0.1, 1.0) # 4 -> 5
    draw_arrow(4.5 - box_width/2 - 0.1, 1.0, 1.0 + box_width/2 + 0.1, 1.0) # 5 -> 6
    
    # Title
    ax.text(5.0, 5.0, "AI Financial Risk Copilot: Systemic Architecture Pipeline", 
            color=TEXT_MAIN, ha='center', va='center', size=13, weight='bold')
            
    ax.set_xlim(-0.8, 10.8)
    ax.set_ylim(0.0, 5.5)
    
    plt.tight_layout()
    plt.savefig(os.path.join(assets_dir, "system_architecture.png"), facecolor=BG_COLOR, dpi=150)
    plt.close()
    print("✓ Saved system_architecture.png")


def generate_unified_dashboard():
    """Generates the grand ecosystem-wide master dashboard screenshot mockup."""
    fig = plt.figure(figsize=(15, 9), facecolor=BG_COLOR)
    
    # Grid layout mapping panels
    gs = GridSpec(3, 4, figure=fig, hspace=0.35, wspace=0.35)
    
    # TITLE BAR
    fig.text(0.03, 0.96, "AI FINANCIAL RISK COPILOT", color=COLOR_NEON_CYAN, size=18, weight='black')
    fig.text(0.03, 0.92, "Investor Safety & Cognition Research Dashboard | Demographics: Small Retail Participant", color=TEXT_MUTED, size=11, weight='semibold')
    fig.text(0.97, 0.96, "COGNITIVE ACTIVE SHIELD STATUS: ARMED", color=COLOR_NEON_PINK, size=12, weight='bold', ha='right')
    
    # PANEL A: Composite ISS Score Circular Gauge (Top Left)
    ax_a = fig.add_subplot(gs[0:2, 0], facecolor=CARD_BG)
    ax_a.spines['top'].set_visible(False)
    ax_a.spines['right'].set_visible(False)
    ax_a.spines['left'].set_visible(False)
    ax_a.spines['bottom'].set_visible(False)
    ax_a.set_xticks([])
    ax_a.set_yticks([])
    
    # Draw circular outer dial
    circle_outer = patches.Circle((0.5, 0.5), 0.4, color=BORDER_COLOR, fill=False, lw=8, linestyle='solid')
    circle_progress = patches.Arc((0.5, 0.5), 0.8, 0.8, angle=90, theta1=0, theta2=147, color=COLOR_NEON_PINK, lw=10) # 41% arc length
    ax_a.add_patch(circle_outer)
    ax_a.add_patch(circle_progress)
    
    # Large centered text
    ax_a.text(0.5, 0.54, "41", color=COLOR_NEON_PINK, ha='center', va='center', size=55, weight='black')
    ax_a.text(0.5, 0.40, "SAFETY SCORE", color=TEXT_MAIN, ha='center', va='center', size=11, weight='bold')
    ax_a.text(0.5, 0.33, "DANGER / SPECULATIVE", color=COLOR_NEON_PINK, ha='center', va='center', size=9, weight='bold')
    
    # Default weighting note
    ax_a.text(0.5, 0.14, "ISS Metric Aggregation:\nWeight w_k Sum = 1.0", color=TEXT_MUTED, ha='center', va='center', size=8, style='italic')
    ax_a.set_title("1. Overall Investor Safety", color=TEXT_MAIN, size=12, weight='bold', pad=15)
    
    # PANEL B: Diversification Asset Donut Chart (Bottom Left)
    ax_b = fig.add_subplot(gs[2, 0], facecolor=CARD_BG)
    ax_b.set_facecolor(CARD_BG)
    labels = ['TSLA', 'BTC', 'Cash']
    sizes = [80, 20, 0]
    colors = [COLOR_NEON_PINK, COLOR_NEON_AMBER, BORDER_COLOR]
    
    wedges, texts, autotexts = ax_b.pie(sizes, labels=labels, autopct='%1.0f%%', startangle=90,
                                      colors=colors, pctdistance=0.75,
                                      textprops=dict(color=TEXT_MAIN, weight='bold', size=9),
                                      wedgeprops=dict(width=0.35, edgecolor=BORDER_COLOR))
    
    # Set labels styling
    for text in texts:
        text.set_color(TEXT_MUTED)
        
    ax_b.set_title("2. Diversification Splits", color=TEXT_MAIN, size=12, weight='bold', pad=15)
    
    # PANEL C: 5-Axis Emotional Radar Chart (Top Center-Right Grid)
    # Recreate the polar coordinates inside the grid
    ax_c = fig.add_subplot(gs[0:2, 1:3], projection='polar', facecolor=CARD_BG)
    radar_labels = ['FOMO\n(Herd)', 'Revenge Trading\n(Loss Panic)', 'Overconfidence\n(Self-Attribution)', 'Recency Bias\n(Short-term)', 'Rationality\n(Safety)']
    num_vars = len(radar_labels)
    radar_angles = np.linspace(0, 2 * np.pi, num_vars, endpoint=False).tolist()
    radar_angles += radar_angles[:1]
    radar_values = [60, 95, 55, 50, 15]
    radar_values += radar_values[:1]
    
    ax_c.set_xticks(radar_angles[:-1])
    ax_c.set_xticklabels(radar_labels, color=TEXT_MAIN, size=9, weight='bold')
    ax_c.set_rlabel_position(45)
    ax_c.set_yticks([25, 50, 75, 100])
    ax_c.set_yticklabels(["25", "50", "75", "100"], color=TEXT_MUTED, size=7)
    ax_c.set_ylim(0, 100)
    ax_c.grid(color=BORDER_COLOR, linestyle='--', linewidth=0.7)
    ax_c.spines['polar'].set_color(BORDER_COLOR)
    
    ax_c.plot(radar_angles, radar_values, color=COLOR_NEON_PINK, linewidth=2)
    ax_c.fill(radar_angles, radar_values, color=COLOR_NEON_PINK, alpha=0.30)
    ax_c.scatter(radar_angles[:-1], radar_values[:-1], color=COLOR_NEON_AMBER, s=50, zorder=5)
    ax_c.set_title("3. Active Emotional-Risk Radar Map", color=TEXT_MAIN, size=12, weight='bold', pad=25)
    
    # PANEL D: Multi-Category ISS Scoring Cards (Bottom Center-Right Grid)
    ax_d = fig.add_subplot(gs[2, 1:3], facecolor=CARD_BG)
    ax_d.set_facecolor(CARD_BG)
    metric_names = ["CR", "VR", "LR", "LEV", "B", "DR"]
    metric_scores = [68, 100, 95, 50, 95, 32]
    metric_colors = [COLOR_NEON_AMBER, COLOR_NEON_PINK, COLOR_NEON_PINK, COLOR_NEON_AMBER, COLOR_NEON_PINK, COLOR_NEON_PINK]
    
    y_p = np.arange(len(metric_names))
    rects = ax_d.bar(y_p, metric_scores, color=metric_colors, edgecolor=BORDER_COLOR, width=0.45, zorder=3)
    
    # Label scores
    for rect, score in zip(rects, metric_scores):
        height = rect.get_height()
        ax_d.text(rect.get_x() + rect.get_width()/2., height + 3,
                  f"{score}", ha='center', va='bottom', color=TEXT_MAIN, size=9, weight='bold')
                  
    ax_d.set_xticks(y_p)
    ax_d.set_xticklabels(["Concentration\n(CR)", "Volatility\n(VR)", "Liquidity\n(LR)", "Leverage\n(LEV)", "Emotional\n(B)", "Diversification\n(DR)"], color=TEXT_MAIN, size=8.5, weight='bold')
    ax_d.set_ylim(0, 115)
    ax_d.spines['top'].set_visible(False)
    ax_d.spines['right'].set_visible(False)
    ax_d.spines['left'].set_color(BORDER_COLOR)
    ax_d.spines['bottom'].set_color(BORDER_COLOR)
    ax_d.grid(axis='y', color=BORDER_COLOR, linestyle=':', alpha=0.5)
    ax_d.set_title("4. Weighted Metric Breakdown Cards", color=TEXT_MAIN, size=12, weight='bold', pad=15)
    
    # PANEL E: AI Copilot Chat Interface (Right Column Sidebar)
    ax_e = fig.add_subplot(gs[0:3, 3], facecolor=CARD_BG)
    ax_e.spines['top'].set_color(BORDER_COLOR)
    ax_e.spines['right'].set_color(BORDER_COLOR)
    ax_e.spines['left'].set_color(BORDER_COLOR)
    ax_e.spines['bottom'].set_color(BORDER_COLOR)
    ax_e.set_xticks([])
    ax_e.set_yticks([])
    
    # Simulated conversational layout in a glassmorphism style card
    ax_e.text(0.05, 0.93, "🤖 EMOTEPATHIC COGNITIVE COPILOT", color=COLOR_NEON_CYAN, size=10, weight='bold')
    ax_e.text(0.05, 0.90, "Scanning user statement for sentiment biases...", color=TEXT_MUTED, size=8, style='italic')
    
    # User Box
    rect_user = patches.FancyBboxPatch((0.05, 0.72), 0.9, 0.14, boxstyle="round,pad=0.02", facecolor=BG_COLOR, edgecolor=BORDER_COLOR)
    ax_e.add_patch(rect_user)
    ax_e.text(0.08, 0.83, "USER INPUT DIALOGUE:", color=COLOR_NEON_AMBER, size=7.5, weight='bold')
    ax_e.text(0.08, 0.74, '"I lost $1,500 yesterday.\n I need to get it back quickly\n using 2x leveraged options!"', color=TEXT_MAIN, size=8, weight='medium')
    
    # Copilot Response Box
    rect_cop = patches.FancyBboxPatch((0.05, 0.20), 0.9, 0.46, boxstyle="round,pad=0.02", facecolor=BG_COLOR, edgecolor=COLOR_NEON_PINK)
    ax_e.add_patch(rect_cop)
    ax_e.text(0.08, 0.62, "🤖 AI COGNITIVE CIRCUIT-BREAKER:", color=COLOR_NEON_PINK, size=7.5, weight='bold')
    ax_e.text(0.08, 0.58, "🛑 ACTIVE ALERT: LOSS AVERSION LOOP", color=COLOR_NEON_PINK, size=8, weight='bold')
    
    analogy_text = (
        "\"It is completely natural to feel\n"
        "distressed when your hard-earned\n"
        "money dips. Our brains are hardwired\n"
        "to panic and take wild risks to get\n"
        "it back.\n\n"
        "But executing leveraged option\n"
        "trades in a panic is like speeding\n"
        "through heavy rain: high danger,\n"
        "very little progress.\n\n"
        "Let's reset your margin borrow to\n"
        "1.0x and review your long-term\n"
        "5-year strategies together.\""
    )
    ax_e.text(0.08, 0.22, analogy_text, color=TEXT_MAIN, size=8, style='italic', va='bottom')
    
    # Rebalance button
    rect_btn = patches.FancyBboxPatch((0.05, 0.05), 0.9, 0.10, boxstyle="round,pad=0.02", facecolor=COLOR_NEON_CYAN, edgecolor=COLOR_NEON_CYAN)
    ax_e.add_patch(rect_btn)
    ax_e.text(0.5, 0.09, "PROCEED TO REBALANCE ALLOCATIONS", color=BG_COLOR, ha='center', va='center', size=9, weight='bold')
    ax_e.set_title("5. Empathetic Risk Advice Panel", color=TEXT_MAIN, size=12, weight='bold', pad=15)
    
    # Save unified dashboard
    plt.savefig(os.path.join(assets_dir, "dashboard_screenshot.png"), facecolor=BG_COLOR, dpi=180)
    plt.close()
    print("✓ Saved dashboard_screenshot.png")


if __name__ == "__main__":
    print("Starting visual assets generation...")
    generate_emotional_radar()
    generate_concentration_heatmap()
    generate_scoring_cards()
    generate_system_architecture()
    generate_unified_dashboard()
    print("Visual assets compilation completed successfully!")
