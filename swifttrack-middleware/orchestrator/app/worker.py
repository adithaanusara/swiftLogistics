import json, os, time
import pika
from .db import init_db, update_order
from .adapters.cms_client import cms_create_order
from .adapters.ros_client import ros_plan_route
from .adapters.wms_client import wms_register_package

RABBIT_URL = os.environ["RABBIT_URL"]

def main():
    init_db()
    params = pika.URLParameters(RABBIT_URL)
    conn = pika.BlockingConnection(params)
    ch = conn.channel()
    ch.queue_declare(queue="order.created", durable=True)

    def handle(ch_, method, props, body):
        msg = json.loads(body.decode())
        order_id = msg["order_id"]
        payload = msg["payload"]

        # Saga (simple): step-by-step + compensations (prototype-level)
        try:
            update_order(order_id, "PROCESSING")

            cms_create_order(order_id, payload)       # SOAP
            update_order(order_id, "CMS_OK")

            wms_register_package(order_id, payload)   # TCP
            update_order(order_id, "WMS_OK")

            ros_plan_route(order_id, payload)         # REST
            update_order(order_id, "ROUTE_PLANNED")

            update_order(order_id, "READY_FOR_DRIVER")
            ch_.basic_ack(delivery_tag=method.delivery_tag)

        except Exception as e:
            # Recovery approach (describe in report): retry + DLQ + compensation
            update_order(order_id, f"FAILED")
            time.sleep(1)
            ch_.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

    ch.basic_qos(prefetch_count=1)
    ch.basic_consume(queue="order.created", on_message_callback=handle)
    ch.start_consuming()

if __name__ == "__main__":
    main()