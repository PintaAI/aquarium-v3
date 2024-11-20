import { useSession } from "next-auth/react";

export const UseCurrentUser = () => {
    const session = useSession();

    return session.data?.user;
}