import React from "react";
import { TbArrowsSort } from "react-icons/tb";
import {
  BsSortUp,
  BsSortDown,
  BsSortAlphaDown,
  BsSortAlphaUp,
} from "react-icons/bs";

export default function SideBarMaterials() {
  function getItem(label, key, icon, items) {
    return {
      key,
      icon,
      items,
      label,
    };
  }

  const sortingItems = [
    getItem(
      "Sorted by",
      "sub1",
      <TbArrowsSort style={{ fontSize: "20px" }} />,
      [
        getItem("Price: High-Low", 1, <BsSortDown />),
        getItem("Price: Low-High", 2, <BsSortUp />),
        getItem("Name: A-Z", 3, <BsSortAlphaDown />),
        getItem("Name: Z-A", 4, <BsSortAlphaUp />),
      ]
    ),
  ];

  return { sortingItems };
}
