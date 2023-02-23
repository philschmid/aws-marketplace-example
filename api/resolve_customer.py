# Import AWS Python SDK and urllib.parse
import boto3
from urllib.parse import urlencode, parse_qs
import os
import json

REDIRECT_URL = os.environ.get("REDIRECT_URL", None)


def handler(event, context=None):
    print(event)
    # Resolving Customer Registration Token
    formFields = parse_qs(event["body"])
    regToken = formFields["x-amzn-marketplace-token"][0]

    print(regToken)
    # If regToken present in POST request, exchange for customerID
    if regToken:
        marketplaceClient = boto3.client("meteringmarketplace")
        customerData = marketplaceClient.resolve_customer(RegistrationToken=regToken)
        print(customerData)
        customer = {
            "CustomerIdentifier": customerData["CustomerIdentifier"],
            "ProductCode": customerData["ProductCode"],
            # "CustomerAWSAccountId": customerData["CustomerAWSAccountId"], # not available
        }

        query_params = urlencode(customer)
        print("query_params: " + query_params)
        # Redirect to the redirect to application register page with correct parameters
        return {
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Credentials": True,
            },
            "body": json.dumps(customer),
        }

        # TODO: add when SaaS url is changed to remove nextjs API call
        # return {
        #     "statusCode": 302,
        #     "headers": {"Location": f"{REDIRECT_URL}?{query_params}"},
        # }

    return {
        "statusCode": 400,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": True,
        },
        "body": json.dumps({"error": "No registration token found"}),
    }
