import Layout from "@/components/Layout";
import {useSession} from "next-auth/react";

export default function Home() {
  const {data: session} = useSession();

  // console.log({session});
  // because in return, we have session? << this question mark act like if statement
  // if (!session) return;

  return (
    <Layout>
      <div className="text-blue-900 flex justify-between items-center">
        <h2>
          Hello, <b>{session?.user?.name}</b>
        </h2>
        <div className="flex bg-gray-300 gap-1 text-black p-2 rounded-lg">
          <img
            src={session?.user?.image}
            alt=""
            className="w-6 h-6 rounded-full"
          />
          <span>{session?.user?.name}</span>
        </div>
      </div>
    </Layout>
  );
}
