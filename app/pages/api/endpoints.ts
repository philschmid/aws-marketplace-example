import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken } from 'next-auth/jwt';
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

import {
  ConditionalCheckFailedException,
  GetItemCommand,
  PutItemCommand,
  QueryCommand,
  QueryCommandInput,
  UpdateItemCommand,
  UpdateItemInput,
} from '@aws-sdk/client-dynamodb';
import { ddbClient } from '../../lib/dynamoDb';


export type Endpoint = {
  userId: string; // pk USER#schmidphilipp1995@gmail.com
  endpointName: string; // sk 
  repository: string
  accelerator: 'CPU' | 'GPU' | 'TPU';
  createdAt: string;
  deletedAt?: string;
};

export type createEndpointInput = Omit<Endpoint, "createdAt" | "deletedAt">;
type listEndpointInput = {
  userId: string;
}

const createEndpoint = async (input: createEndpointInput): Promise<Endpoint> => {
  const dynamodbInput = { ...input, createdAt: new Date().toISOString() }

  const data = await ddbClient.send(new PutItemCommand({
    TableName: process.env.NEXT_ENDPOINT_DYNAMODB_TABLE,
    Item: marshall(dynamodbInput),
    ConditionExpression: "attribute_not_exists(endpointName)",
  }));
  return dynamodbInput as Endpoint;
}

const listEndpoints = async (input: listEndpointInput): Promise<Endpoint[] | undefined> => {
  const data = await ddbClient.send(new QueryCommand({
    TableName: process.env.NEXT_ENDPOINT_DYNAMODB_TABLE,
    KeyConditionExpression: "userId = :id",
    ExpressionAttributeValues: {
      ":id": { S: input.userId }
    },
  }));
  if (data.Items && data.Items.length > 0) {
    return data.Items.map((item) => unmarshall(item) as Endpoint);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const token = await getToken({ req });
    // check if token is valid and not expired
    if (!token) {
      return res.status(403).send({
        error:
          'You must be signed in to view the protected content on this page.',
      });
    }

    switch (req.method) {
      case 'POST':
        const body = JSON.parse(req.body);
        const createdEndpoint = await createEndpoint({ ...body, userId: `USER#${token.email}` });
        return res.status(200).json(createdEndpoint)
      case 'GET':
        const endpoints = await listEndpoints({ userId: `USER#${token.email}` });
        return res.status(200).json({ endpoints: endpoints })
      // handle other HTTP methods
    }
  } catch (error: ConditionalCheckFailedException | any) {
    if (error instanceof ConditionalCheckFailedException) {
      res.status(error.$metadata.httpStatusCode || 400).send({ error: error.message })
    }
    res.status(500).send({ error: error.message })
  }
}