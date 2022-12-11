import { getProviders, signIn } from "next-auth/react"
import { useRouter } from 'next/router'
import { useEffect, useState } from "react"

export default function SignIn({providers}:Record<string,string>) {
  const [content, setContent] = useState({"name":"test"})
  const awsMarketplace = useRouter().query["x-amz-key"] || null; 

// Fetch content from protected route
    useEffect(() => {
      const fetchData = async () => {
        if (awsMarketplace) {
          const res = await fetch("/api/marketplace", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              awsMarketplace,
            }),
          })
          const json = await res.json()
          if (json) {
            // use customer id data
            setContent(json)
          }
          console.log(json)
        }
      }
      fetchData()
    }, [awsMarketplace])
   


  return (
    <>
      {Object.values(providers).map((provider) => (
        <div key={provider.name}>
          <button onClick={() => signIn(provider.id)}>
            Sign in with {provider.name}
          </button>
        </div>
      ))}
                {content.name}

    </>
  )
}

export async function getServerSideProps(context) {
  const providers = await getProviders()
  return {
    props: { providers },
  }
}