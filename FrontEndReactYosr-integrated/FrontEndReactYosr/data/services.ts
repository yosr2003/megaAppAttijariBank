import { ServiceItem } from "../types";
import { Colors } from "../constants/home/Colors";

export const services: ServiceItem[] = [
  {
    id: "taxi",
    title: "Book Taxi",
    subtitle: "8 min · 12 DT",
    icon: "car",
    color: Colors.serviceTaxi,
  },
  {
    id: "hotel",
    title: "Reserve Hotel",
    subtitle: "From 180 DT",
    icon: "business",
    color: Colors.serviceHotel,
  },
  {
    id: "food",
    title: "Order Food",
    subtitle: "Pre-event meal",
    icon: "restaurant",
    color: Colors.serviceFood,
  },
  {
    id: "wallet",
    title: "Pay with Wallet",
    subtitle: "847.50 DT balance",
    icon: "wallet",
    color: Colors.serviceWallet,
  },
  {
    id: "friends",
    title: "Invite Friends",
    subtitle: "12 going",
    icon: "person-add",
    color: Colors.serviceFriends,
  },
  {
    id: "calendar",
    title: "Add to Calendar",
    subtitle: "Jul 20, 2026",
    icon: "calendar",
    color: Colors.serviceCalendar,
  },
];
