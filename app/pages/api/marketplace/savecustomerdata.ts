// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { unstable_getServerSession } from "next-auth/next"
import type { NextApiRequest, NextApiResponse } from "next"
import { authOptions } from "../auth/[...nextauth]"

type Data = {
  ProductCode: string
  CustomerIdentifier: string
  CustomerAWSAccountId: string
  error?: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions)
  if (session) {
    const productCode = req.query["ProductCode"]
    const customerIdentifier = req.query["CustomerIdentifier"]
    const customerAWSAccountId = req.query["CustomerAWSAccountId"]


    if (productCode && customerIdentifier && customerAWSAccountId) {
      // await resolveAWSCustomer({ name, message })
      console.log("save customer information into database")
      console.log({id: session.user.id, productCode, customerIdentifier, customerAWSAccountId})
      res.redirect(302, '/')
    }
    else { res.status(500).send({ error: 'Missing ProductCode key in request' }) }
  } else {
    res.send({
      error: "You must be signed in to view the protected content on this page.",
    })
  }
}
