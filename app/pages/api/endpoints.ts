import type { NextApiRequest, NextApiResponse } from 'next';
import { getToken, JWT } from 'next-auth/jwt';
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { randomBytes } from "crypto"

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

const createEndpoint = async (input: createEndpointInput, token: JWT): Promise<Endpoint> => {
  const pkId = randomBytes(16).toString("hex")
  const dynamodbInput = {
    ...input,
    pk: `ENDPOINT#${pkId}`,
    sk: `ENDPOINT#${pkId}`,
    GSI1PK: `USER#${token.sub}`,
    GSI1SK: `ENDPOINT#${pkId}`,
    createdAt: new Date().toISOString()
  }

  const data = await ddbClient.send(new PutItemCommand({
    TableName: process.env.NEXT_AUTH_DYNAMODB_TABLE,
    Item: marshall(dynamodbInput),
    ConditionExpression: "attribute_not_exists(endpointName)",
  }));
  return dynamodbInput as Endpoint;
}

const deleteEndpoint = async (pk: string, token: JWT): Promise<void> => {
  const data = await ddbClient.send(new UpdateItemCommand({
    TableName: process.env.NEXT_AUTH_DYNAMODB_TABLE,
    Key: marshall({ pk: pk, sk: pk }),
    UpdateExpression: "SET deletedAt = :deletedAt",
    ExpressionAttributeValues: {
      ":deletedAt": { S: new Date().toISOString() }
    },
    ConditionExpression: "attribute_exists(pk)",
  }));
}


const listEndpoints = async (token: JWT): Promise<Endpoint[] | undefined> => {
  const data = await ddbClient.send(new QueryCommand({
    TableName: process.env.NEXT_AUTH_DYNAMODB_TABLE,
    IndexName: process.env.NEXT_AUTH_DYNAMODB_GSI_NAME,
    KeyConditionExpression: "GSI1PK = :id",
    ExpressionAttributeValues: {
      ":id": { S: `USER#${token.sub}` }
    },
    FilterExpression: "attribute_not_exists(deletedAt)"
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
        const postBody = JSON.parse(req.body);
        const createdEndpoint = await createEndpoint(postBody, token);
        return res.status(200).json(createdEndpoint)
      case 'GET':
        const endpoints = await listEndpoints(token);
        return res.status(200).json({ endpoints: endpoints })
      // handle other HTTP methods
      case 'DELETE':
        const deleteBody = JSON.parse(req.body);
        await deleteEndpoint(deleteBody, token);
        return res.status(200).json({ message: "Endpoint deleted" })
      // handle other HTTP methods
    }
  } catch (error: ConditionalCheckFailedException | any) {
    if (error instanceof ConditionalCheckFailedException) {
      return res.status(error.$metadata.httpStatusCode || 400).send({ error: error.message })
    }
    return res.status(500).send({ error: error.message })
  }
}