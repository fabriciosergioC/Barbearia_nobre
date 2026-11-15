import { useQuery } from '@tanstack/react-query'

import { listTeamMembers, type TeamMember } from './api'

export function useTeamMembers() {
  return useQuery<TeamMember[]>({
    queryKey: ['team-members'],
    queryFn: listTeamMembers,
    staleTime: 60_000,
  })
}
