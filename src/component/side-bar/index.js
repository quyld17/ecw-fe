import React from "react";
import SideBarMaterials from "./side-bar-material/index";
import { Layout, Menu } from "antd";
const { Sider } = Layout;

export default function SideBar() {
  const { sortingItems, categoryItems } = SideBarMaterials();

  const renderMenuItems = (menuItems) => {
    return menuItems.map((menuItem) => {
      if (menuItem.items) {
        return {
          key: menuItem.key,
          icon: menuItem.icon,
          label: menuItem.label, // Removed icon here
          children: renderMenuItems(menuItem.items),
        };
      } else {
        return {
          key: menuItem.key,
          icon: menuItem.icon,
          label: menuItem.label, // Removed icon here
        };
      }
    });
  };

  // Generate the items for both sortingItems and categoryItems
  const menuItems = [
    ...renderMenuItems(sortingItems),
    ...renderMenuItems(categoryItems),
  ];

  return (
    <Sider
      width={200}
      style={{
        backgroundColor: "white",
      }}
    >
      <Menu
        mode="inline"
        defaultSelectedKeys={[""]}
        defaultOpenKeys={[""]}
        style={{
          height: "100%",
          borderRight: 0,
          boxShadow: "0 2px 30px rgba(0, 0, 0, 0.1)",
        }}
        items={menuItems} // Use items prop here
      />
    </Sider>
  );
}
