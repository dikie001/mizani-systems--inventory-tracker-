"use client"

const CHECK = ({ color = "#7a7890" }) => (
  <svg viewBox="0 0 10 10" fill="none" width="9" height="9">
    <path
      d="M2 5l2.5 2.5L8 3"
      stroke={color}
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const PLANS = [
  {
    id: "trial",
    name: "Free Trial",
    badge: "14 days",
    badgeStyle: "green",
    monthly: 0,
    desc: "No card required. Try the full platform risk-free.",
    features: [
      "Up to 200 SKUs",
      "1 admin user",
      "Standard dashboard",
      "Email support",
    ],
    cta: "Start Free Trial",
    btnStyle: "green",
    highlight: false,
  },
  {
    id: "pro",
    name: "Professional",
    badge: "Most Popular",
    badgeStyle: "gold",
    monthly: 3999, // KES 3,999
    desc: "For growing teams that need the full platform.",
    features: [
      "Unlimited SKUs",
      "Unlimited users",
      "Advanced analytics",
      "API access",
      "Priority 24/7 support",
      "Custom integrations",
    ],
    cta: "Start Professional",
    btnStyle: "gold",
    highlight: true,
  },
  {
    id: "basic",
    name: "Basic",
    badge: null,
    monthly: 999, // KES 999
    desc: "For small operations getting off spreadsheets.",
    features: [
      "Up to 1,000 SKUs",
      "2 admin users",
      "Standard dashboard",
      "Email support",
      "CSV import/export",
    ],
    cta: "Start Basic",
    btnStyle: "outline",
    highlight: false,
  },
]

export default function PricingSection() {
  const formatKES = (n: number) => {
    try {
      return new Intl.NumberFormat("en-KE", {
        style: "currency",
        currency: "KES",
        currencyDisplay: "code",
        maximumFractionDigits: 0,
      }).format(n)
    } catch (e) {
      return `KES ${n}`
    }
  }

  return (
    <section
      style={{
        // Shadcn default dark background (Zinc-950) and foreground (Zinc-50)
        background: "#09090b",
        minHeight: "100vh",
        padding: "64px 20px",
        fontFamily: "'DM Sans', sans-serif",
        color: "#fafafa",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');
        .pricing-card { transition: border-color 0.2s, transform 0.2s; }
        .pricing-card:hover { border-color: rgba(255,255,255,0.18) !important; transform: translateY(-2px); }
        .pricing-card.pro:hover { border-color: #c8a96e !important; }
        .pricing-btn { transition: opacity 0.18s, transform 0.15s; cursor: pointer; }
        .pricing-btn:hover { opacity: 0.84; transform: translateY(-1px); }
        .pricing-btn:active { transform: translateY(0); }
        .ent-btn { transition: border-color 0.2s, color 0.2s, transform 0.15s; cursor: pointer; }
        .ent-btn:hover { border-color: #c8a96e !important; color: #c8a96e !important; transform: translateY(-1px); }
      `}</style>

      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 18,
            }}
          >
            <span
              style={{
                display: "block",
                width: 24,
                height: 1,
                background: "#c8a96e",
                opacity: 0.5,
              }}
            />
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "#c8a96e",
              }}
            >
              Pricing
            </span>
            <span
              style={{
                display: "block",
                width: 24,
                height: 1,
                background: "#c8a96e",
                opacity: 0.5,
              }}
            />
          </div>
          <h2
            style={{
              fontFamily: "'DM Serif Display', serif",
              fontSize: "clamp(2rem, 5vw, 3rem)",
              lineHeight: 1.12,
              letterSpacing: "-0.02em",
              marginBottom: 14,
            }}
          >
            Simple,{" "}
            <em style={{ fontStyle: "italic", color: "#c8a96e" }}>
              transparent
            </em>{" "}
            pricing
          </h2>
          <p
            style={{
              fontSize: 15,
              color: "#a1a1aa", // Shadcn muted-foreground (Zinc-400)
              maxWidth: 400,
              margin: "0 auto",
              lineHeight: 1.65,
              fontWeight: 300,
            }}
          >
            No hidden fees. No seat limits on the plans that matter. Cancel
            anytime.
          </p>
        </div>

        {/* Cards - Premium Colors Maintained */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 16,
            marginBottom: 18,
          }}
        >
          {PLANS.map((plan) => {
            const isGold = plan.highlight
            const isFree = plan.id === "trial"
            const price =
              plan.id === "trial" ? formatKES(0) : formatKES(plan.monthly)
            const checkColor = isGold
              ? "#c8a96e"
              : isFree
                ? "#5ec97a"
                : "#7a7890"

            return (
              <div
                key={plan.id}
                className={`pricing-card${isGold ? "pro" : ""}`}
                style={{
                  position: "relative",
                  borderRadius: 16,
                  border: isGold
                    ? "1px solid #c8a96e"
                    : "1px solid rgba(255,255,255,0.07)",
                  background: isGold ? "#1a1a22" : "#131318",
                  boxShadow: isGold ? "0 0 40px rgba(200,169,110,0.2)" : "none",
                  padding: "26px 22px 22px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {isGold && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 16,
                      pointerEvents: "none",
                      background:
                        "radial-gradient(ellipse at top, rgba(200,169,110,0.08) 0%, transparent 60%)",
                    }}
                  />
                )}
                {isGold && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 1,
                      borderRadius: "16px 16px 0 0",
                      background:
                        "linear-gradient(90deg, transparent, rgba(200,169,110,0.5), transparent)",
                    }}
                  />
                )}

                {/* Plan top */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: isGold ? "#c8a96e" : "#7a7890",
                    }}
                  >
                    {plan.name}
                  </span>
                  {plan.badge && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        padding: "3px 9px",
                        borderRadius: 99,
                        background:
                          plan.badgeStyle === "gold"
                            ? "rgba(200,169,110,0.12)"
                            : "rgba(94,201,122,0.1)",
                        color:
                          plan.badgeStyle === "gold" ? "#c8a96e" : "#5ec97a",
                      }}
                    >
                      {plan.badge}
                    </span>
                  )}
                </div>

                {/* Price */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: 4,
                    marginBottom: 6,
                  }}
                >
                  <span
                    style={{
                      fontFamily: "'DM Serif Display', serif",
                      fontSize: "2.4rem",
                      lineHeight: 1,
                      letterSpacing: "-0.03em",
                      color: "#fafafa",
                    }}
                  >
                    {price}
                  </span>
                  {plan.id !== "trial" && (
                    <span
                      style={{
                        fontSize: 13,
                        color: "#7a7890",
                        paddingBottom: 4,
                      }}
                    >
                      /mo
                    </span>
                  )}
                </div>

                <p
                  style={{
                    fontSize: 13,
                    color: "#7a7890",
                    lineHeight: 1.5,
                    marginBottom: 20,
                    fontWeight: 300,
                  }}
                >
                  {plan.desc}
                </p>

                <div
                  style={{
                    height: 1,
                    background: isGold
                      ? "rgba(200,169,110,0.15)"
                      : "rgba(255,255,255,0.07)",
                    marginBottom: 18,
                  }}
                />

                {/* Features */}
                <ul
                  style={{
                    listStyle: "none",
                    flex: 1,
                    marginBottom: 22,
                    display: "flex",
                    flexDirection: "column",
                    gap: 9,
                    padding: 0,
                  }}
                >
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                        fontSize: 13.5,
                        color: "#7a7890",
                        lineHeight: 1.4,
                      }}
                    >
                      <span
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: "50%",
                          flexShrink: 0,
                          marginTop: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: isGold
                            ? "rgba(200,169,110,0.12)"
                            : isFree
                              ? "rgba(94,201,122,0.1)"
                              : "rgba(255,255,255,0.05)",
                        }}
                      >
                        <CHECK color={checkColor} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  className="pricing-btn"
                  style={{
                    width: "100%",
                    padding: "11px 0",
                    borderRadius: 10,
                    border: "none",
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "0.03em",
                    ...(plan.btnStyle === "gold"
                      ? {
                          background: "#c8a96e",
                          color: "#1a1208",
                          boxShadow: "0 4px 20px rgba(200,169,110,0.25)",
                        }
                      : plan.btnStyle === "green"
                        ? {
                            background: "rgba(94,201,122,0.1)",
                            color: "#5ec97a",
                            border: "1px solid rgba(94,201,122,0.2)",
                          }
                        : {
                            background: "transparent",
                            color: "#f0ede8",
                            border: "1px solid rgba(255,255,255,0.18)",
                          }),
                  }}
                >
                  {plan.cta}
                </button>
              </div>
            )
          })}
        </div>

        {/* Enterprise */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 14,
            background: "#131318",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 14,
            padding: "18px 24px",
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 3 }}>
              Enterprise
            </div>
            <div style={{ fontSize: 12.5, color: "#7a7890", fontWeight: 300 }}>
              Custom contracts · SLA guarantees · SSO · Dedicated infrastructure
            </div>
          </div>
          <button
            className="ent-btn"
            style={{
              background: "transparent",
              color: "#fafafa",
              border: "1px solid rgba(255,255,255,0.18)",
              padding: "9px 20px",
              borderRadius: 9,
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 12.5,
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            Contact Sales →
          </button>
        </div>
      </div>
    </section>
  )
}
 