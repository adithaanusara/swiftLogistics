import os, requests
CMS_URL = os.environ["CMS_URL"]

def cms_create_order(order_id: str, payload: dict):
    # minimal SOAP envelope
    envelope = f"""<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <CreateOrderRequest>
      <orderId>{order_id}</orderId>
    </CreateOrderRequest>
  </soap:Body>
</soap:Envelope>"""
    r = requests.post(CMS_URL, data=envelope, headers={"Content-Type": "text/xml"}, timeout=5)
    r.raise_for_status()
    return r.text