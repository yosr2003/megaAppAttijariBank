import React from "react";
import { Colors } from "../constants/home/Colors";
import InfoCard from "./InfoCard";

interface LocalTipsCardProps {
  value: string;
}

export default function LocalTipsCard({ value }: LocalTipsCardProps) {
  return <InfoCard icon="globe" iconColor="#22D3EE" label="Local Tips" value={value} />;
}
