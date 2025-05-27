import React from "react";
import SideBarMaterials from "./side-bar-material/index";
import { Layout, Menu } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
const { Sider } = Layout;

export default function SideBar() {
  const { sortingItems } = SideBarMaterials();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleMenuClick = ({ key }) => {
    const currentPage = searchParams.get("page") || 1;

    if (key >= 1 && key <= 4) {
      let sort = "";
      switch (parseInt(key)) {
        case 1:
          sort = "price_desc";
          break;
        case 2:
          sort = "price_asc";
          break;
        case 3:
          sort = "name_asc";
          break;
        case 4:
          sort = "name_desc";
          break;
      }
      router.push(`/?page=${currentPage}&sort=${sort}`);
    }
  };

  const renderMenuItems = (menuItems) => {
    return menuItems.map((menuItem) => {
      if (menuItem.items) {
        return {
          key: menuItem.key,
          icon: menuItem.icon,
          label: menuItem.label,
          children: renderMenuItems(menuItem.items),
        };
      } else {
        return {
          key: menuItem.key,
          icon: menuItem.icon,
          label: menuItem.label,
        };
      }
    });
  };

  const menuItems = [...renderMenuItems(sortingItems)];

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
        items={menuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  );
}
