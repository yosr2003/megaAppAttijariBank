import React from "react";
import { Colors } from "../constants/home/Colors";
import InfoCard from "./InfoCard";

interface DinnerCardProps {
  value: string;
}

export default function DinnerCard({ value }: DinnerCardProps) {
  return <InfoCard icon="restaurant" iconColor={Colors.danger} label="Pre-event Dinner" value={value} />;
}
