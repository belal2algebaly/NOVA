# NOVA v0.5.0

Evidence-first ecommerce CRO scanner by Belal Algebaly.

## What changed
- Page-type knowledge models for PDP, PLP, Cart, Checkout and Homepage.
- Deep PDP review detection with review-summary + review-content verification.
- Visual hierarchy checks for title, price and purchase action.
- Rendered visibility / contrast checks for key decision elements.
- Fixed/sticky overlap detection for purchase actions.
- Current-navigation performance signals: LCP, CLS, INP when observed, and TTFB.
- Page-type CRO scores now work beyond PDP when enough evidence exists.
- Stronger evidence coverage and score caps.

## Important
NOVA reports what it can verify in the rendered DOM. It does not claim that automated heuristics replace analytics, user research, experiments, field Core Web Vitals, or expert review. Unknown evidence is not silently passed.
