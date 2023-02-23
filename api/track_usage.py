import boto3
import time
import json
import os

PRODUCT_CODE = os.environ.get("PRODUCT_CODE", None)

def handler(event, context=None):
    print(event)
    # loads the incoming event into a dictonary
    body = json.loads(event["body"])
    marketplaceClient = boto3.client("meteringmarketplace")
    usageRecord = [
        {
            "Timestamp": int(time.time()),
            "CustomerIdentifier": body["CustomerIdentifier"],
            "Dimension": "cpu_count",
            "Quantity": 1,
        }
    ]

    # send usage record to AWS Marketplace
    response = marketplaceClient.batch_meter_usage(UsageRecords=usageRecord, ProductCode=PRODUCT_CODE)
    
    # check if any Status any UsageRecord is Successs
    if any(record["Status"] == "Success" for record in response["Results"]):
        return  {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": True,
            }
        }

    
    raise Exception("Failed to meter usage")


if __name__ == "__main__":
    event = {
        "body": '{"CustomerIdentifier": "gmEGnEoSxoP"}',
    }
    print(handler(event))
    