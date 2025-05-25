// This remains a server component to fetch data initially
import { db } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserById } from "@/data/user";
import { auth } from "@/auth";
import { UserTable } from '@/components/dashboard/UserTable'; // Import the new table component

// Function to calculate total score (placeholder)
type TryoutParticipation = {
  score: number | null;
  tryout: {
    nama: string | null;
  };
};

const calculateTotalScore = (participations: TryoutParticipation[]) => {
  // Ensure score is treated as a number, default to 0 if null/undefined
  return participations.reduce((sum, p) => sum + (Number(p.score) || 0), 0);
};

export default async function DashboardUsersPage() {
  const session = await auth();
  // Ensure session and user exist before fetching user data
  const currentUser = session?.user?.id ? await getUserById(session.user.id) : null;
  const isGuru = currentUser?.role === "GURU";

  const users = await db.user.findMany({
    select: { // Select specific fields including the new one
      id: true,
      email: true,
      name: true,
      image: true,
      isCertificateEligible: true, // Fetch the eligibility status
      tryoutParticipations: {
        include: {
          tryout: { // Include tryout details to display tryout name
            select: {
              nama: true,
            },
          },
        },
        orderBy: {
          tryout: {
            startTime: 'asc', // Order tryouts chronologically
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc', // Initial fetch order (can be removed if sorting overrides)
    },
  });

  // Calculate total score for each user and add it to the user object
  const usersWithScores = users.map(user => ({
    ...user,
    totalScore: calculateTotalScore(user.tryoutParticipations),
  }));

  // No need to sort here anymore, the client component handles it.

  // Calculate Statistics
  const totalUsers = usersWithScores.length;
  const eligibleUsers = usersWithScores.filter(user => user.isCertificateEligible).length;
  const totalScoreSum = usersWithScores.reduce((sum, user) => sum + user.totalScore, 0);
  const averageScore = totalUsers > 0 ? (totalScoreSum / totalUsers).toFixed(2) : 0; // Calculate average, handle division by zero


  return (
    <div className="container mx-auto py-10 space-y-6"> {/* Added space-y-6 */}
      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle>User Statistics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="flex flex-col items-center justify-center rounded-lg border p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Users</div>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border p-4">
            <div className="text-sm font-medium text-muted-foreground">Certificate Eligible</div>
            <div className="text-2xl font-bold">{eligibleUsers}</div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg border p-4">
            <div className="text-sm font-medium text-muted-foreground">Average Score</div>
            <div className="text-2xl font-bold">{averageScore}</div>
          </div>
        </CardContent>
      </Card>

      {/* User Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>User Tryout Performance</CardTitle> {/* Simplified title */}
        </CardHeader>
        <CardContent>
          {/* Render the client component table, passing data */}
          <UserTable initialUsers={usersWithScores} isGuru={isGuru} />
        </CardContent>
      </Card>
    </div>
  );
}
