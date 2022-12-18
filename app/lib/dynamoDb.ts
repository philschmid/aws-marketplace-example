import { DynamoDB, QueryCommand, QueryCommandInput } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
export const config = {
  region: process.env.NEXT_AUTH_AWS_REGION,
  credentials: {
    accessKeyId: process.env.NEXT_AUTH_AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.NEXT_AUTH_AWS_SECRET_ACCESS_KEY,
  },
};

export const ddbClient = new DynamoDB(config);


export const getUserInformation = async ({ email }: { email: string }) => {
  // get PK from GSIPK
  const getInputs: QueryCommandInput = {
    TableName: process.env.NEXT_AUTH_DYNAMODB_TABLE,
    IndexName: process.env.NEXT_AUTH_DYNAMODB_GSI_NAME,
    KeyConditionExpression: 'GSI1PK = :email',
    ExpressionAttributeValues: { ':email': { S: `USER#${email}` } },
  };
  const data = await ddbClient.send(new QueryCommand(getInputs));

  if (data.Items?.length == 1) {
    return unmarshall(data.Items[0]);
  }
}