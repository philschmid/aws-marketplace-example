import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import { signIn, signOut, useSession } from "next-auth/react"

export default function Home() {
  const { data: session, status } = useSession()
  const loading = status === "loading"
  return (
   <h1>
    Test
   </h1>  )
}
