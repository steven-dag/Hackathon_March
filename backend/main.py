from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import onboarding, grants, plan, portal

app = FastAPI(
    title=".birdie API",
    description="Digitalisierungsförderung für Handwerk & KMU",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:3000",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routes ──────────────────────────────────────────────────────────────────
app.include_router(onboarding.router)
app.include_router(grants.router)
app.include_router(plan.router)
app.include_router(portal.router)


# ─── Health ──────────────────────────────────────────────────────────────────
@app.get("/api/health")
def health_check():
    return {"status": "ok", "app": ".birdie"}
