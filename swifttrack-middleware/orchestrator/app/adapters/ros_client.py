import os, requests
ROS_URL = os.environ["ROS_URL"]

def ros_plan_route(order_id: str, payload: dict):
    r = requests.post(f"{ROS_URL}/routes/plan", json={"order_id": order_id, "stops": payload.get("stops", [])}, timeout=5)
    r.raise_for_status()
    return r.json()