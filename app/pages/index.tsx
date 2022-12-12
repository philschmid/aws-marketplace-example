import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { signIn, signOut, useSession } from 'next-auth/react'
import { Header } from '../components/header'

export default function Home() {
  const { data: session, status } = useSession()

  const loading = status === 'loading'
  console.log(session)
  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
    
      <Header/>
      <main className='container max-w-2xl m-auto mt-4' >
        <h1 className='text-4xl' >
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>
      </main>
    </>
  )
}
