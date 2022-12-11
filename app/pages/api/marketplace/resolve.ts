// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = {
  ProductCode: string
  CustomerIdentifier: string
  CustomerAWSAccountId: string
  error?: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data | Record<string, string>>
) {
  const xAmzKey = req.query["x-amzn-marketplace-token"]
  if (xAmzKey) {
      // await resolveAWSCustomer({ name, message })
    console.log("solve marketplace")
    const result = { "ProductCode": "123456", "CustomerIdentifier": "abc", "CustomerAWSAccountId": "123456" }
    
    const awsQueryParameter = new URLSearchParams(result).toString();
 
    res.redirect(302, `/auth/signIn?${awsQueryParameter}`)
  }
  else { res.status(500).send({ error: 'Missing x-amzn-marketplace-token key in request' }) }
}