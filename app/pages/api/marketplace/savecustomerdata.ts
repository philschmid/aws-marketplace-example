// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import {
  QueryCommand,
  QueryCommandInput,
  UpdateItemCommand,
  UpdateItemInput,
} from '@aws-sdk/client-dynamodb';
import { ddbClient } from '../../../lib/dynamoDb';


type marketplaceData = {
  ProductCode: string;
  CustomerIdentifier: string;
  CustomerAWSAccountId: string;
};
type userDataWithMarketplace = marketplaceData & { email: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const token = await getToken({ req });
  // check if token is valid and not expired
  if (token) {
    // extract query parameters for aws marketplace metering
    const productCode = req.query['ProductCode'] as string;
    const customerIdentifier = req.query['CustomerIdentifier'] as string;
    const customerAWSAccountId = req.query['CustomerAWSAccountId'] as string;

    // check if query parameters are present
    if (productCode && customerIdentifier && customerAWSAccountId) {
      // updates user data with marketplace data
      await saveCustomer({
        email: token.email,
        ProductCode: productCode,
        CustomerIdentifier: customerIdentifier,
        CustomerAWSAccountId: customerAWSAccountId,
      });
      // redirect to homepage
      res.redirect(302, '/');
    } else {
      res
        .status(401)
        .send({
          error: 'Missing ProductCode or customerIdentifier in request',
        });
    }
  } else {
    res.status(403).send({
      error:
        'You must be signed in to view the protected content on this page.',
    });
  }
}

const saveCustomer = async (input: userDataWithMarketplace): Promise<void> => {
  // get PK from GSIPK
  const getInputs: QueryCommandInput = {
    TableName: process.env.NEXT_AUTH_DYNAMODB_TABLE,
    IndexName: process.env.NEXT_AUTH_DYNAMODB_GSI_NAME,
    KeyConditionExpression: 'GSI1PK = :email',
    ExpressionAttributeValues: { ':email': { S: `USER#${input.email}` } },
  };
  const data = await ddbClient.send(new QueryCommand(getInputs));

  if (data.Items) {
    const updateInputs: UpdateItemInput = {
      TableName: process.env.NEXT_AUTH_DYNAMODB_TABLE,
      Key: {
        pk: data.Items[0].pk,
        sk: data.Items[0].sk,
      },
      UpdateExpression: 'set marketplace = :m', // For example, "'set Title = :t, Subtitle = :s'"
      ExpressionAttributeValues: {
        ':m': {
          M: {
            ProductCode: { S: input.ProductCode },
            CustomerIdentifier: { S: input.CustomerIdentifier },
            CustomerAWSAccountId: { S: input.CustomerAWSAccountId },
          },
        },
      },
    };
    await ddbClient.send(new UpdateItemCommand(updateInputs));
  }
};
