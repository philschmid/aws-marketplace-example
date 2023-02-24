import boto3
from datetime import datetime
import json
import os
from boto3.dynamodb.conditions import Key, Attr

CROSS_ACCOUNT_ROLE = os.environ.get(
    "CROSS_ACCOUNT_ROLE", "arn:aws:iam::558105141721:role/marketplace-test-cross-account-table-role-907797767998"
)
DYNAMODB_TABLE = os.environ.get("DYNAMODB_TABLE", "marketplace-test-user-table")
DYNAMODB_REGION = os.environ.get("DYNAMODB_REGION", "us-east-1")


def create_cross_account_dyamodb():
    sts_client = boto3.client("sts")
    sts_session = sts_client.assume_role(RoleArn=CROSS_ACCOUNT_ROLE, RoleSessionName="cross-account-dynamodb")
    dynamodb = boto3.resource(
        "dynamodb",
        region_name=DYNAMODB_REGION,
        aws_access_key_id=sts_session["Credentials"]["AccessKeyId"],
        aws_secret_access_key=sts_session["Credentials"]["SecretAccessKey"],
        aws_session_token=sts_session["Credentials"]["SessionToken"],
    )
    return dynamodb.Table(DYNAMODB_TABLE)


# https://docs.aws.amazon.com/lambda/latest/dg/with-sqs-example.html
# {\n  "Type" : "Notification",\n  "MessageId" : "fac5c73a-a549-54ed-a32a-9b4bcf08f882",\n  "TopicArn" : "arn:aws:sns:us-east-1:287250355862:aws-mp-subscription-notification-2qmywxoiv58nm308h0zrd2q0k",\n  "Message" : "{\\n\\"action\\": \\"subscribe-success\\",\\n\\"customer-identifier\\": \\"3yvX23Yyuvm\\",\\n\\"product-code\\": \\"2qmywxoiv58nm308h0zrd2q0k\\",\\n\\"isFreeTrialTermPresent\\": \\"false\\"\\n}


def parse_sqs_message(sqs_message):
    parsed_list_of_messages = []
    for record in sqs_message["Records"]:
        body = json.loads(record["body"])
        if "Message" in body:
            parsed_list_of_messages.append(json.loads(body["Message"]))
    return parsed_list_of_messages


def handler(sqs_message, context):
    db = create_cross_account_dyamodb()
    # body = json.loads(sqs_message["Records"][0]["body"])
    print("sqs_message", sqs_message)
    # print("message", json.loads(body["Message"]))

    sqs_message = parse_sqs_message(sqs_message)

    print(sqs_message)
    for message in sqs_message:
        # check if user already exists
        items = db.query(KeyConditionExpression=Key("pk").eq(f'MARKETPLACE#{message["customer-identifier"]}'))
        user = items["Items"][0] if len(items["Items"]) > 0 else None
        if not user:
            raise Exception("User does not exist")

        # update user status
        if message["action"] == "subscribe-success":
            user["status"] = "ACTIVE"
        elif message["action"] == "subscribe-failure":
            user["status"] = "FAILED"
        elif message["action"] == "unsubscribe-pending":
            user["status"] = "INACTIVE"
        elif message["action"] == "unsubscribe-success":
            user["status"] = "TERMINATED"
        # update user status
        db.put_item(Item=user)


test_event = {
    "Records": [
        {
            "messageId": "b692b0c1-929a-4ae6-b427-45645989e48c",
            "receiptHandle": "AQEBwJtI3JZK1nS3mxrvZCK+AQN7yHac0fkHK8rSdtik/W1/S6jLFy5PesD1teTnnr2eMJQtAyx0pqPGta0wCkHQ6A/+dGCHy9qSTYQSi5ptzvmG5/CKqd5giPubznNXZfDV+asKE6JrYAnx1LlZGHPPJ1uus8uFIv+vJZLUaIfnM5DtM5GBHn4D4Tr8tSdmGNNUX0qTbDjl57avqVvRNDmXCGUW/lZq1+xOTP98vWZyKgTFmVuvUT4/DOtyq1pUDvBSK6aS86FmBSSgHVgTU+Ww4ChEf/6yURp2M2zMfuaCYLLLSMtLAgB8dQArhSua7llnEEDqoJpFqbeR5rID8YjLMQ8SIogCJQ9aRopHCwkWBMH0MKx7o+5FTlzVeNpoDKiRDEsQANWRReqC/1B1vj5qnWkbd44UkJzBZb1RCUsgwV0=",
            "body": '{\n  "Type" : "Notification",\n  "MessageId" : "8d62b43c-9432-5579-825d-e84de3c6abfb",\n  "TopicArn" : "arn:aws:sns:us-east-1:287250355862:aws-mp-subscription-notification-2qmywxoiv58nm308h0zrd2q0k",\n  "Message" : "{\\n\\"action\\": \\"subscribe-success\\",\\n\\"customer-identifier\\": \\"gmEGnEoSxoP\\",\\n\\"product-code\\": \\"2qmywxoiv58nm308h0zrd2q0k\\"\\n}",\n  "Timestamp" : "2023-02-23T14:18:28.171Z",\n  "SignatureVersion" : "1",\n  "Signature" : "cQ440ATScJGHIiIoBR5UYbGNzTvgS+uxE1NzmTiu/btNdPeS2qmGC8KtKGjxP7+y6IlYxomaCVrLcsVx1Kp++1mIhW3jDWjJ3gCAnFp0hc5KX+19sKyyWP2DVUBlULNkekT66++jKPLtJgbk7zg/yZ66NkhdFiYkNcghVRcFTsvBZSouLC0mkR9VcCUAY9R0np4hLHZFQwQR5ThprG1lHcfePBRuCxHpeK5pD2X7a28ot/+7l04N3oPs4ZKBr8QFMZZlKe8lOg0iiFcS+oOOj18qVFZ80GfHCILJBSjipEhx/T8uWl/QiIwivxWRc0EKqSu92Hn+iBOgjr9Ma9d/mQ==",\n  "SigningCertURL" : "https://sns.us-east-1.amazonaws.com/SimpleNotificationService-56e67fcb41f6fec09b0196692625d385.pem",\n  "UnsubscribeURL" : "https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-1:287250355862:aws-mp-subscription-notification-2qmywxoiv58nm308h0zrd2q0k:05fba02d-2224-4904-b194-1b5bb6741d5e"\n}',
            "attributes": {
                "ApproximateReceiveCount": "3",
                "SentTimestamp": "1677161908215",
                "SenderId": "AIDAIT2UOQQY3AUEKVGXU",
                "ApproximateFirstReceiveTimestamp": "1677161918215",
            },
            "messageAttributes": {},
            "md5OfBody": "b688739284b25b199be6222d2368e249",
            "eventSource": "aws:sqs",
            "eventSourceARN": "arn:aws:sqs:us-east-1:907797767998:marketplace-test-infrastructure-queue",
            "awsRegion": "us-east-1",
        }
    ]
}


if __name__ == "__main__":
    handler(test_event, None)
