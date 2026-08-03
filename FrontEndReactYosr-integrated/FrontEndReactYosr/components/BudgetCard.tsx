import React from "react";
import { Colors } from "../constants/home/Colors";
import InfoCard from "./InfoCard";

interface BudgetCardProps {
  value: string;
}

export default function BudgetCard({ value }: BudgetCardProps) {
  return (
    <InfoCard icon="cash" iconColor={Colors.success} label="Estimated Total Budget" value={value} />
  );
}
