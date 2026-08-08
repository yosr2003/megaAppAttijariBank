import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";
import { Colors } from "../constants/home/Colors";

export interface HomeModule {
  id: string;
  title: string;
  subtitle: string;
  icon: ComponentProps<typeof Ionicons>["name"];
  color: string;
  route: string;
  comingSoon?: boolean;
}

export const homeModules: HomeModule[] = [
  {
    id: "food",
    title: "Food",
    subtitle: "Commandez vos repas préférés",
    icon: "fast-food",
    color: Colors.serviceFood,
    route: "/food",
    comingSoon: true,
  },
  {
    id: "taxi",
    title: "Taxi",
    subtitle: "Réservez une course en quelques secondes",
    icon: "car-sport",
    color: Colors.serviceTaxi,
    route: "/taxi",
    comingSoon: true,
  },
  {
    id: "events",
    title: "Event Service",
    subtitle: "Découvrez et réservez des événements",
    icon: "calendar",
    color: Colors.brandBlue,
    route: "/events",
  },
  {
    id: "blog",
    title: "Blog",
    subtitle: "Actualités, conseils et communauté",
    icon: "newspaper",
    color: Colors.brandPurple,
    route: "/blog",
  },
  {
    id: "messages",
    title: "Messagerie",
    subtitle: "Discutez avec vos contacts",
    icon: "chatbubbles",
    color: Colors.serviceFriends,
    route: "/messages",
  },
];