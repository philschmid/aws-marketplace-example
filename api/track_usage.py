import boto3
import time
import json
import os

PRODUCT_CODE = os.environ.get("PRODUCT_CODE", None)


def handler(event):
    print(event)
    # loads the incoming event into a dictonary
    body = json.loads(event["body"])

    usageRecord = [
        {
            "Timestamp": int(time.time()),
            "CustomerIdentifier": body["customerID"],
            "Dimension": "cpu_count",
            "Quantity": 1,
        }
    ]

    marketplaceClient = boto3.client("meteringmarketplace")

    response = marketplaceClient.batch_meter_usage(UsageRecords=usageRecord, ProductCode=PRODUCT_CODE)

    return True
