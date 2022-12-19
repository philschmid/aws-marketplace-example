import { useSession, signOut } from 'next-auth/react';
import ThemeToggler from './themeToggler';
import Image from 'next/image';

export const Header = () => {
  const { data: session } = useSession();

  return (
    <header>
      <nav className="border-b-2 border-gray-100 dark:border-gray-800 px-4 lg:px-6 py-2.5 flex flex-row justify-between w-full">
        <a href="" className="flex items- justify-center">
          {/* <Image
            src={''}
            width={32}
            height={32}
            className="h-8 w-8 mr-4 my-auto"
            alt="logo"
          /> */}
          <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
            Logo
          </span>
        </a>
        <div>
          <div className="flex flex-row gap-2 justify-center items-center">
            <ThemeToggler />
            <button onClick={() => signOut()}>Sign out</button>
            <div className="h-12 w-12 relative">
              <Image
                src={session?.user?.image || '/static/profile-placeholder.png'}
                alt={`Picture of ${session?.user?.name}`}
                fill
                className="rounded-full"
              />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
