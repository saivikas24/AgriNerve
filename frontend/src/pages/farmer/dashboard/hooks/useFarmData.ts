import { useEffect, useState } from "react";

import { getFarms } from "../../../../api/farms";
import { getCrops } from "../../../../api/crops";

import type { FarmResponse } from "../../../../api/farms";
import type { CropResponse } from "../../../../api/crops";

export function useFarmData() {
  const [farm, setFarm] =
    useState<FarmResponse | null>(null);

  const [farmLoading, setFarmLoading] =
    useState(true);

  const [farmError, setFarmError] =
    useState("");

  const [crops, setCrops] =
    useState<CropResponse[]>([]);

  useEffect(() => {
    const loadFarm = async () => {
      try {
        setFarmLoading(true);
        setFarmError("");

        const farms = await getFarms();

        const activeFarmId = localStorage.getItem(
          "agrinerve_active_farm_id",
        );

        const activeFarm = activeFarmId
          ? farms.find(
              (item) =>
                item.id === Number(activeFarmId),
            )
          : farms[0];

        if (!activeFarm) {
          window.location.href = "/farmer/setup";
          return;
        }

        setFarm(activeFarm);

        try {
          const farmCrops = await getCrops(activeFarm.id);
          setCrops(farmCrops);
        } catch (cropError) {
          console.error(
            "Crop loading error:",
            cropError,
          );
          setCrops([]);
        }
      } catch (error) {
        console.error(
          "Farm loading error:",
          error,
        );

        setFarmError(
          error instanceof Error
            ? error.message
            : "Unable to load your farm.",
        );
      } finally {
        setFarmLoading(false);
      }
    };

    loadFarm();
  }, []);

  return {
    farm,
    farmLoading,
    farmError,
    crops,
  };
}
