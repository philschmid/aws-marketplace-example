// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import {
  MarketplaceMeteringClient,
  BatchMeterUsageCommand,
  ResolveCustomerCommand,
  ResolveCustomerCommandOutput,
  ResolveCustomerRequest,
} from '@aws-sdk/client-marketplace-metering';
import { config } from '../../../lib/dynamoDb';

type Data = {
  ProductCode: string;
  CustomerIdentifier: string;
  CustomerAWSAccountId: string;
  error?: string;
};

// const client = new MarketplaceMeteringClient(config);

// const resolveAWSCustomer = async (xAmzKey: string): Promise<ResolveCustomerCommandOutput> => {
//   const input: ResolveCustomerRequest = { RegistrationToken: xAmzKey }
//   const command = new ResolveCustomerCommand(input);
//   const response = await client.send(command);
//   return response;
// }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | Record<string, string>>,
) {
  console.log(req.body);

  const xAmzKey = req.query['x-amzn-marketplace-token'] as string;
  if (xAmzKey) {
    // const resolvedCustomer = await resolveAWSCustomer(xAmzKey)
    console.log('solve marketplace');
    const result = {
      ProductCode: '123456',
      CustomerIdentifier: 'abc',
      CustomerAWSAccountId: '123456',
    };
    const awsQueryParameter = new URLSearchParams(result).toString();

    // redirect to signin page with query parameters
    res.redirect(302, `/auth/signIn?${awsQueryParameter}`);
  } else {
    res
      .status(500)
      .send({ error: 'Missing x-amzn-marketplace-token key in request' });
  }
}
