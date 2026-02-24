import json, os, time
import pika
from .db import pick_driver_id, assign_driver, update_status
from .adapters.cms_client import cms_create_order
from .adapters.wms_client import wms_register_package
from .adapters.ros_client import ros_plan_route

RABBIT_URL = os.environ["RABBIT_URL"]

def main():
    conn = pika.BlockingConnection(pika.URLParameters(RABBIT_URL))
    ch = conn.channel()
    ch.queue_declare(queue="order.created", durable=True)

    def handle(ch_, method, props, body):
        msg = json.loads(body.decode())
        order_id = msg["order_id"]

        try:
            update_status(order_id, "PROCESSING")

            driver_id = pick_driver_id()
            if driver_id is None:
                update_status(order_id, "FAILED_NO_DRIVER")
                ch_.basic_ack(delivery_tag=method.delivery_tag)
                return

            assign_driver(order_id, driver_id)

            # integration demo steps
            cms_create_order(order_id, {})
            update_status(order_id, "CMS_OK")

            wms_register_package(order_id, {})
            update_status(order_id, "WMS_OK")

            ros_plan_route(order_id, {})
            update_status(order_id, "ROUTE_PLANNED")

            update_status(order_id, "READY_FOR_PICKUP")
            ch_.basic_ack(delivery_tag=method.delivery_tag)

        except Exception:
            update_status(order_id, "FAILED")
            time.sleep(1)
            ch_.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

    ch.basic_qos(prefetch_count=1)
    ch.basic_consume(queue="order.created", on_message_callback=handle)
    ch.start_consuming()

if __name__ == "__main__":
    main()