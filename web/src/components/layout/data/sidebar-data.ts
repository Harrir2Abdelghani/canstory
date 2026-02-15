import {
  LayoutDashboard,
  Users,
  Command,
  BookText,
  Utensils,
  FileText,
  Home,
  Stethoscope,
  Megaphone,
  Cog,
  UserCheck,
  MessageSquare,
  Info,
  Tag,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'Admin',
    email: 'admin@canstory.app',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Canstory Admin',
      logo: Command,
      plan: 'Tableau de bord Admin',
    },
  ],
  navGroups: [
    {
      title: 'Tableau de bord',
      items: [
        {
          title: 'Aperçu',
          url: '/overview',
          icon: LayoutDashboard,
        },
      ],
    },
    {
      title: 'Gestion des utilisateurs',
      items: [
        {
          title: 'Utilisateurs',
          url: '/users',
          icon: Users,
        },
        {
          title: 'Gestion Annuaire',
          url: '/annuaire',
          icon: Stethoscope,
        },
      ],
    },
    {
      title: 'Gestion du contenu',
      items: [
        {
          title: 'I3lam - News',
          url: '/i3lam',
          icon: BookText,
        },
        {
          title: 'Ghida2ak - Nutrition',
          url: '/ghida2ak',
          icon: Utensils,
        },
        {
          title: 'Nassa2ih - Guides',
          url: '/nassa2ih',
          icon: FileText,
        },
        {
          title: 'Logements',
          url: '/accommodations',
          icon: Home,
        },
        {
          title: 'Qui sommes-nous',
          url: '/about-management',
          icon: Info,
        },
      ],
    },
    {
      title: 'Modération',
      items: [
        {
          title: 'Khibrati - Publications',
          url: '/khibrati',
          icon: UserCheck,
        },
        {
          title: 'Commentaires',
          url: '/comments',
          icon: MessageSquare,
        },
        {
          title: 'Demandes publicitaires',
          url: '/advertising',
          icon: Megaphone,
        },
      ],
    },
    {
      title: 'Configuration',
      items: [
        {
          title: 'Catégories',
          url: '/categories',
          icon: Tag,
        },
        {
          title: 'Paramètres de la plateforme',
          url: '/platform-config',
          icon: Cog,
        },
      ],
    },
  ],
}
