import React from "react";
import { Colors } from "../constants/home/Colors";
import InfoCard from "./InfoCard";

interface WeatherCardProps {
  value: string;
}

export default function WeatherCard({ value }: WeatherCardProps) {
  return <InfoCard icon="thermometer" iconColor={Colors.warning} label="Weather Forecast" value={value} />;
}
