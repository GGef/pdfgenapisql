import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TeamMember {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  status: 'active' | 'pending' | 'inactive';
}

interface TeamState {
  members: TeamMember[];
  inviteMember: (email: string, role: 'admin' | 'user') => void;
  removeMember: (id: string) => void;
  updateMemberRole: (id: string, role: 'admin' | 'user') => void;
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set) => ({
      members: [
        {
          id: '1',
          email: 'demo@example.com',
          name: 'Demo User',
          role: 'admin',
          status: 'active',
        },
      ],
      inviteMember: (email, role) =>
        set((state) => ({
          members: [
            ...state.members,
            {
              id: Date.now().toString(),
              email,
              name: email.split('@')[0],
              role,
              status: 'pending',
            },
          ],
        })),
      removeMember: (id) =>
        set((state) => ({
          members: state.members.filter((member) => member.id !== id),
        })),
      updateMemberRole: (id, role) =>
        set((state) => ({
          members: state.members.map((member) =>
            member.id === id ? { ...member, role } : member
          ),
        })),
    }),
    {
      name: 'team-storage',
    }
  )
);