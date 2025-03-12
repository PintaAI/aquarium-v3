"use client";
import { useMemo, useState } from "react";
import * as FaIcons from "react-icons/fa";

type Icons = {
  name: string;
  friendly_name: string;
  Component: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export const useIconPicker = (): {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  icons: Icons[];
} => {
  const icons: Icons[] = useMemo(
    () =>
      Object.entries(FaIcons)
        .filter(([name]) => name.startsWith("Fa"))
        .map(([iconName, IconComponent]) => ({
          name: iconName,
          friendly_name: iconName.replace("Fa", "").match(/[A-Z][a-z]+/g)?.join(" ") ?? iconName,
          Component: IconComponent,
        })),
    []
  );

  const [search, setSearch] = useState("");

  const filteredIcons = useMemo(() => {
    return icons.filter((icon) => {
      if (search === "") return true;
      return (
        icon.name.toLowerCase().includes(search.toLowerCase()) ||
        icon.friendly_name.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [icons, search]);

  return { search, setSearch, icons: filteredIcons };
};
