import { getProviders, signIn } from 'next-auth/react';
import type { ClientSafeProvider, LiteralUnion } from 'next-auth/react';
import type { BuiltInProviderType } from 'next-auth/providers';
import { GetServerSidePropsContext } from 'next';

type marketplaceCustomerProps = {
  ProductCode: string;
  CustomerIdentifier: string;
  CustomerAWSAccountId: string;
};

interface SignInProps {
  providers: Record<
    LiteralUnion<BuiltInProviderType, string>,
    ClientSafeProvider
  >;
  marketplaceCustomer?: marketplaceCustomerProps;
}

export default function SignIn({
  providers,
  marketplaceCustomer,
}: SignInProps) {
  // console.log(marketplaceCustomer)
  let callbackUrl = '/';
  if (
    marketplaceCustomer?.ProductCode &&
    marketplaceCustomer?.CustomerIdentifier &&
    marketplaceCustomer?.CustomerAWSAccountId
  ) {
    const awsQueryParameter = new URLSearchParams(
      marketplaceCustomer,
    ).toString();
    callbackUrl = `/api/marketplace/savecustomerdata?${awsQueryParameter}`;
  }
  // console.log(providers)
  return (
    <>
      <div className="m-auto max-w-lg flex justify-center flex-col h-screen gap-4">
        <h1 className="text-2xl">
          👋 Hello there! Please sign in to continue.
        </h1>
        <button
          className="border border-black dark:border-white px-1 py-2 rounded-lg flex items-center justify-center w-64 mx-auto dark:hover:bg-gray-900 hover:bg-gray-100 transition-all duration-300 gap-4"
          onClick={() => signIn('github', { callbackUrl, redirect: false })}
        >
          <svg
            className="w-6 h-6 dark:text-white text-black"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"></path>
          </svg>
          Sign in with GitHub
        </button>
        <p>
          By signing in, you agree to our terms of service and privacy policy.
        </p>
      </div>
    </>
  );
}

//  Sign In With GitHub

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const providers = await getProviders();
  return {
    props: { providers, marketplaceCustomer: context.query },
  };
}
