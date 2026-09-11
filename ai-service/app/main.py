from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from app.schemas.forecast import DemandForecastRequest, DemandForecastResponse
from app.forecasting.model import forecaster

app = FastAPI(
    title="Cooperative Labour Marketplace - AI Forecasting Microservice",
    version="1.0.0",
    description="Scikit-Learn ML quantitative demand prediction & workforce gap analyzer"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {"status": "UP", "service": "ai-forecasting-service", "timestamp": datetime.now().isoformat()}

@app.post("/forecast/demand", response_model=DemandForecastResponse)
def forecast_demand(request: DemandForecastRequest):
    try:
        target_date = request.target_date or datetime.now().strftime("%Y-%m-%d")
        result = forecaster.predict_demand(
            category_name=request.service_category,
            target_date_str=target_date,
            current_workers=request.current_worker_count
        )

        return DemandForecastResponse(
            zone_id=request.zone_id,
            service_category=request.service_category,
            forecast_date=target_date,
            predicted_demand=result['predicted_demand'],
            current_available_workers=request.current_worker_count,
            workforce_gap=result['workforce_gap'],
            peak_hours=result['peak_hours'],
            explainability=result['explainability'],
            feature_importance=result['feature_importance']
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
