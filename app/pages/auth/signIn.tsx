import { getProviders, signIn } from 'next-auth/react'
import { useRouter } from 'next/router'
import type { ClientSafeProvider, LiteralUnion } from 'next-auth/react'
import type { BuiltInProviderType } from 'next-auth/providers'
import { GetServerSidePropsContext } from 'next'
import Image from 'next/image'

type marketplaceCustomerProps = {
  ProductCode: string
  CustomerIdentifier: string
  CustomerAWSAccountId: string
}

interface SignInProps {
  providers: Record<LiteralUnion<BuiltInProviderType, string>, ClientSafeProvider>
  marketplaceCustomer?: marketplaceCustomerProps
}

export default function SignIn({ providers, marketplaceCustomer }: SignInProps) {
  // console.log(marketplaceCustomer)
  let callbackUrl = '/'
  if (marketplaceCustomer?.ProductCode && marketplaceCustomer?.CustomerIdentifier && marketplaceCustomer?.CustomerAWSAccountId) {
    const awsQueryParameter = new URLSearchParams(marketplaceCustomer).toString()
    callbackUrl = `/api/marketplace/savecustomerdata?${awsQueryParameter}`
  }
  // console.log(providers)
  return (
    <>
      <div
        style={{
          margin: 'auto',
          maxWidth: 500,
          display: 'flex',
          flexFlow: 'column',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <h1>👋 Hello there! Please sign in to continue.</h1>
        <button
          style={{
            background: 'transparent',
            border: '1px solid white',
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: 400,
            margin: '1rem auto',
          }}
          onClick={() => signIn('github', {callbackUrl, redirect: false })}
        >
          <span style={{ marginRight: 8 }}>
            <Image src="/static/github-white.svg" alt="Github Logo" width={24} height={24} />
          </span>{' '}
          Sign in with GitHub
        </button>
        <p>By signing in, you agree to our terms of service and privacy policy.</p>
      </div>
    </>
  )
}

//  Sign In With GitHub

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const providers = await getProviders()
  return {
    props: { providers, marketplaceCustomer: context.query },
  }
}
