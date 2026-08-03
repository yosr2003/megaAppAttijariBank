import React from "react";
import { Colors } from "../constants/home/Colors";
import InfoCard from "./InfoCard";

interface HotelCardProps {
  value: string;
}

export default function HotelCard({ value }: HotelCardProps) {
  return <InfoCard icon="business" iconColor={Colors.brandPurple} label="Nearby Hotels" value={value} />;
}
