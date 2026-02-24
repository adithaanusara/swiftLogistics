import json, os, time
import pika

from .db import init_db, update_order
from .adapters.cms_client import cms_create_order
from .adapters.wms_client import wms_register_package
from .adapters.ros_client import ros_plan_route

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

        try:
            # Saga steps
            update_order(order_id, "PROCESSING")

            cms_create_order(order_id, payload)
            update_order(order_id, "CMS_OK")

            wms_register_package(order_id, payload)
            update_order(order_id, "WMS_OK")

            ros_plan_route(order_id, payload)
            update_order(order_id, "ROUTE_PLANNED")

            update_order(order_id, "READY_FOR_DRIVER")

            ch_.basic_ack(delivery_tag=method.delivery_tag)

        except Exception:
            update_order(order_id, "FAILED")
            # prototype retry (simple)
            time.sleep(1)
            ch_.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

    ch.basic_qos(prefetch_count=1)
    ch.basic_consume(queue="order.created", on_message_callback=handle)
    ch.start_consuming()

if __name__ == "__main__":
    main()