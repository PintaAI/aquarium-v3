'use client';

import { useState, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CertificateEligibilityToggle } from '@/components/dashboard/CertificateEligibilityToggle';
import { ArrowUpDown, ArrowUp, ArrowDown, TrendingUp, Ban, Target } from 'lucide-react'; // Import additional icons
import { Button } from '@/components/ui/button'; // For clickable headers

// Define the structure of a user object with the calculated score
type UserWithScore = {
  id: string;
  email: string | null;
  name: string | null;
  image: string | null;
  isCertificateEligible: boolean | null;
  tryoutParticipations: {
    id: number; // Corrected type to number based on error
    score: number | null;
    tryout: {
      nama: string | null;
    };
  }[];
  totalScore: number;
};

// Define the props for the UserTable component
interface UserTableProps {
  initialUsers: UserWithScore[];
  isGuru: boolean;
}

// Define the type for our sort configuration
type SortConfig = {
  key: keyof UserWithScore | 'name' | null; // Allow sorting by 'name' specifically
  direction: 'ascending' | 'descending';
};

export function UserTable({ initialUsers, isGuru }: UserTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'totalScore', direction: 'descending' });

  const sortedUsers = useMemo(() => {
    let sortableItems = [...initialUsers];
    if (sortConfig.key !== null) {
      sortableItems.sort((a, b) => {
        let aValue: string | number | null = null;
        let bValue: string | number | null = null;

        // Handle sorting by name (case-insensitive)
        if (sortConfig.key === 'name') {
          aValue = a.name?.toLowerCase() ?? '';
          bValue = b.name?.toLowerCase() ?? '';
        } else if (sortConfig.key === 'totalScore') {
            aValue = a.totalScore;
            bValue = b.totalScore;
        }
        // Add other sortable keys if needed here

        if (aValue === null || bValue === null) return 0; // Or handle nulls differently

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [initialUsers, sortConfig]);

  const requestSort = (key: keyof UserWithScore | 'name') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof UserWithScore | 'name') => {
    if (sortConfig.key !== key) {
      // Icon shown when the column is not sorted
      return <ArrowUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />;
    }
    // Icon shown when the column is sorted
    return sortConfig.direction === 'ascending' ?
      <ArrowUp className="ml-2 h-4 w-4" /> :
      <ArrowDown className="ml-2 h-4 w-4" />;
  };


  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>
             <Button variant="ghost" onClick={() => requestSort('name')} className="px-0 hover:bg-transparent">
                User Info
                {getSortIndicator('name')}
             </Button>
          </TableHead>
          <TableHead>Tryouts & Scores</TableHead>
          {/* Corrected TableHead structure for Total Score */}
          <TableHead className="text-center">
            <Button variant="ghost" onClick={() => requestSort('totalScore')} className="px-0 hover:bg-transparent w-full justify-center">
              Total Score
              {getSortIndicator('totalScore')}
            </Button>
          </TableHead>
          {isGuru && <TableHead className="text-center">Certificate Eligible</TableHead>}
        </TableRow>
      </TableHeader>
      {/* Add zebra striping */}
      <TableBody className="[&_tr:nth-child(even)]:bg-muted/30">
        {sortedUsers.map((user) => (
          // Add hover effect
          <TableRow key={user.id} className="hover:bg-muted/50">
            <TableCell>
              <div className="flex items-center gap-3 py-1"> {/* Added slight vertical padding */}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'User Avatar'} />
                  <AvatarFallback>{user.name?.charAt(0).toUpperCase() ?? 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{user.name ?? 'N/A'}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              {user.tryoutParticipations.length > 0 ? (
                <ul className="space-y-1 text-sm">
                  {user.tryoutParticipations.map((participation) => (
                    <li key={participation.id}>
                      {/* Remove "Tryout" (case-insensitive) from the displayed name */}
                      <span className="flex items-center gap-1">
                        <Target className={`h-4 w-4 ${participation.score && participation.score > 80 ? 'text-green-500' : participation.score && participation.score > 60 ? 'text-yellow-500' : 'text-red-500'}`} />
                        {participation.tryout.nama?.replace(/tryout/gi, '').trim()}: <span className="font-bold">{participation.score ?? 'N/A'}</span>
                      </span>
                    </li>
                  ))}
                 </ul>
              ) : (
                <span className="text-xs text-muted-foreground italic flex items-center gap-2">
                  <Ban className="h-4 w-4" />
                  No tryouts taken
                </span> 
              )}
            </TableCell>
            <TableCell className="text-center font-medium">
              <div className="flex items-center justify-center gap-2">
              <TrendingUp className={`h-4 w-4 ${user.totalScore > 80 ? 'text-green-500' : user.totalScore > 60 ? 'text-yellow-500' : 'text-red-500'}`} />
              <span className="font-bold">{user.totalScore}</span>
              </div>
            </TableCell>
            {isGuru && (
              <TableCell className="text-center">
                <CertificateEligibilityToggle
                  userId={user.id}
                  isInitiallyEligible={user.isCertificateEligible ?? false} // Handle null case
                />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
