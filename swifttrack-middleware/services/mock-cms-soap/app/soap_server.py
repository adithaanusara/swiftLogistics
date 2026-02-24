from fastapi import FastAPI, Request, Response

app = FastAPI(title="Mock CMS SOAP")

@app.post("/soap")
async def soap(req: Request):
    _ = await req.body()
    resp = """<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <CreateOrderResponse>OK</CreateOrderResponse>
  </soap:Body>
</soap:Envelope>"""
    return Response(content=resp, media_type="text/xml")