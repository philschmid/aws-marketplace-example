// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken, JWT } from 'next-auth/jwt';
import {
  PutItemCommand,
} from '@aws-sdk/client-dynamodb';
import { ddbClient } from '../../../lib/dynamoDb';
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";


type marketplaceData = {
  ProductCode: string;
  CustomerIdentifier: string;
  status: 'PENDING' | 'ACTIVE' | 'FAILED' | 'TERMINATED'
};

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

    // check if query parameters are present
    if (productCode && customerIdentifier) {
      // updates user data with marketplace data
      await saveCustomer({
        ProductCode: productCode,
        CustomerIdentifier: customerIdentifier,
        status: 'PENDING'
      }, token);
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

const saveCustomer = async (input: marketplaceData, token: JWT): Promise<void> => {
  const dynamodbInput = {
    ...input,
    pk: `MARKETPLACE#${input.CustomerIdentifier}`,
    sk: `USER#${token.sub}`,
    GSI1PK: `USER#${token.email}`,
    GSI1SK: `MARKETPLACE#${input.CustomerIdentifier}`,
    createdAt: new Date().toISOString()
  }
  // save marketplace information to dynamodb
  await ddbClient.send(new PutItemCommand({
    TableName: process.env.NEXT_AUTH_DYNAMODB_TABLE,
    Item: marshall(dynamodbInput),
    ConditionExpression: "attribute_not_exists(endpointName)",
  }));
};
