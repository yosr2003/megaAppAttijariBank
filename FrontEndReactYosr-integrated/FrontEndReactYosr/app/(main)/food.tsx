import React from "react";
import ComingSoon from "../../components/ComingSoon";
import { Colors } from "../../constants/home/Colors";

export default function FoodScreen() {
  return (
    <ComingSoon
      title="Food"
      description="Commandez vos plats préférés auprès des meilleurs restaurants tunisiens, directement depuis SuperTounsi."
      icon="fast-food"
      accentColor={Colors.serviceFood}
    />
  );
}