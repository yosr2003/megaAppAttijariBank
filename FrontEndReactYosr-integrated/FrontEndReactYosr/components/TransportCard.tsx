import React from "react";
import { Colors } from "../constants/home/Colors";
import InfoCard from "./InfoCard";

interface TransportCardProps {
  value: string;
}

export default function TransportCard({ value }: TransportCardProps) {
  return (
    <InfoCard icon="car-sport" iconColor={Colors.brandBlue} label="Recommended Transport" value={value} />
  );
}
