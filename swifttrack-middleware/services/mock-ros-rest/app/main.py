from fastapi import FastAPI
app = FastAPI(title="Mock ROS")

@app.post("/routes/plan")
def plan(payload: dict):
    return {"route_id": "R-001", "order_id": payload["order_id"], "eta_minutes": 45}