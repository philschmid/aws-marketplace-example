# Import AWS Python SDK and urllib.parse
import boto3
import urllib.parse as urlparse


def handler(event):
    print(event)
    # Resolving Customer Registration Token
    formFields = urlparse.parse_qs(event["body"])
    regToken = formFields["x-amzn-marketplace-token"]

    # If regToken present in POST request, exchange for customerID
    if regToken:
        marketplaceClient = boto3.client("meteringmarketplace")
        customerData = marketplaceClient.resolve_customer(regToken)
        productCode = customerData["ProductCode"]
        customerID = customerData["CustomerIdentifier"]
        customerAWSAccountId = customerData["CustomerAWSAccountId"]

        print("ProductCode: " + productCode)
        print("CustomerIdentifier: " + customerID)
        print("CustomerAWSAccountId: " + customerAWSAccountId)
        # TODO: Store customer information
        # TODO: Validate no other accounts share the same customerID
