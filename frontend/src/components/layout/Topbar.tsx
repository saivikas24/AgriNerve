import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getFarms } from "../../api/farms";
import { getCrops, type CropResponse } from "../../api/crops";

import "./Topbar.css";

const API_BASE_URL = "http://127.0.0.1:8000/api/v1";

interface CurrentUser {
  id: number;
  email: string;
  role: string;
  email_verified?: boolean;
  mobile_verified?: boolean;
}

function Topbar() {
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);
  const [farmLoading, setFarmLoading] = useState(false);

  const [farm, setFarm] = useState<Awaited<ReturnType<typeof getFarms>>[number] | null>(
    null,
  );

  const [crop, setCrop] = useState<CropResponse | null>(null);
  const [userEmail, setUserEmail] = useState("");

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadProfileData() {
      try {
        setFarmLoading(true);

        const token = localStorage.getItem(
          "agrinerve_access_token",
        );

        if (!token) {
          return;
        }

        // Load authenticated user
        const userResponse = await fetch(
          `${API_BASE_URL}/auth/me`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (userResponse.ok) {
          const user: CurrentUser =
            await userResponse.json();

          setUserEmail(user.email);
        }

        // Load farms
        const farms = await getFarms();

        const activeFarmId =
          localStorage.getItem(
            "agrinerve_active_farm_id",
          );

        const activeFarm =
          farms.find(
            (item) =>
              item.id === Number(activeFarmId),
          ) ?? farms[0] ?? null;

        setFarm(activeFarm);

        // Load active farm crop
        if (activeFarm) {
          const crops = await getCrops(
            activeFarm.id,
          );

          setCrop(crops[0] ?? null);
        }
      } catch {
        // Keep the topbar usable even if profile
        // information cannot be loaded.
      } finally {
        setFarmLoading(false);
      }
    }

    loadProfileData();
  }, []);

  useEffect(() => {
    function handleOutsideClick(
      event: MouseEvent,
    ) {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target as Node,
        )
      ) {
        setProfileOpen(false);
      }
    }

    if (profileOpen) {
      document.addEventListener(
        "mousedown",
        handleOutsideClick,
      );
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, [profileOpen]);

  function handleLogout() {
    localStorage.removeItem(
      "agrinerve_access_token",
    );

    localStorage.removeItem(
      "agrinerve_active_farm_id",
    );

    navigate("/login");
  }

  function goToFarmSetup() {
    setProfileOpen(false);
    navigate("/farmer/setup");
  }

  function goToCropSetup() {
    setProfileOpen(false);
    navigate("/farmer/crop-setup");
  }

  const farmerInitial =
    farm?.farm_name
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "F";

  return (
    <header className="agri-topbar">
      <div className="topbar-heading">
        <span className="topbar-eyebrow">
          AGRI-NERVE FARMER PORTAL
        </span>

        <h2>Good morning 👋</h2>

        <p>
          Your agricultural intelligence at a glance
        </p>
      </div>

      <div className="topbar-actions">
        <button
          type="button"
          className="notification-button"
          aria-label="Notifications"
        >
          🔔
        </button>

        <div
          className="profile-wrapper"
          ref={profileRef}
        >
          <button
            type="button"
            className={`profile-area ${
              profileOpen
                ? "profile-area-open"
                : ""
            }`}
            onClick={() =>
              setProfileOpen(
                (previous) => !previous,
              )
            }
            aria-expanded={profileOpen}
            aria-haspopup="true"
          >
            <div className="profile-avatar">
              {farmerInitial}
            </div>

            <div className="profile-details">
              <strong>Farmer</strong>

              <span>
                {farm?.state ||
                  "Andhra Pradesh"}
              </span>
            </div>

            <span className="profile-chevron">
              {profileOpen ? "▲" : "▼"}
            </span>
          </button>

          {profileOpen && (
            <div className="profile-dropdown">
              <div className="profile-dropdown-header">
                <div className="profile-dropdown-avatar">
                  {farmerInitial}
                </div>

                <div>
                  <strong>
                    {farm?.farm_name ||
                      "Farmer Account"}
                  </strong>

                  <span>
                    {userEmail ||
                      "Farmer"}
                  </span>
                </div>
              </div>

              <div className="profile-dropdown-section">
                <span className="profile-section-label">
                  FARM DETAILS
                </span>

                {farmLoading ? (
                  <p className="profile-loading">
                    Loading farm details...
                  </p>
                ) : farm ? (
                  <div className="profile-info-list">
                    <div>
                      <span>Farm</span>
                      <strong>
                        {farm.farm_name}
                      </strong>
                    </div>

                    <div>
                      <span>District</span>
                      <strong>
                        {farm.district ||
                          "Not provided"}
                      </strong>
                    </div>

                    <div>
                      <span>Area</span>
                      <strong>
                        {farm.area_acres} acres
                      </strong>
                    </div>

                    <div>
                      <span>Irrigation</span>
                      <strong>
                        {farm.irrigation_type ||
                          "Not provided"}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <p className="profile-empty">
                    No farm details available.
                  </p>
                )}

                <button
                  type="button"
                  className="profile-action-button"
                  onClick={goToFarmSetup}
                >
                  ✏️ Edit Farm Details
                </button>
              </div>

              <div className="profile-dropdown-section">
                <span className="profile-section-label">
                  CROP DETAILS
                </span>

                {farmLoading ? (
                  <p className="profile-loading">
                    Loading crop details...
                  </p>
                ) : crop ? (
                  <div className="profile-info-list">
                    <div>
                      <span>Crop</span>
                      <strong>
                        {crop.crop_name}
                      </strong>
                    </div>

                    <div>
                      <span>Variety</span>
                      <strong>
                        {crop.variety ||
                          "Not provided"}
                      </strong>
                    </div>

                    <div>
                      <span>Season</span>
                      <strong>
                        {crop.season ||
                          "Not provided"}
                      </strong>
                    </div>

                    <div>
                      <span>Crop area</span>
                      <strong>
                        {crop.area_acres} acres
                      </strong>
                    </div>
                  </div>
                ) : (
                  <p className="profile-empty">
                    No crop added yet.
                  </p>
                )}

                <button
                  type="button"
                  className="profile-action-button"
                  onClick={goToCropSetup}
                >
                  ✏️ Edit Crop Details
                </button>
              </div>

              <div className="profile-dropdown-section profile-menu-section">
                <button
                  type="button"
                  className="profile-menu-item profile-disabled-item"
                  disabled
                >
                  ⚙️
                  <span>Settings</span>
                  <small>Upcoming</small>
                </button>
              </div>

              <div className="profile-dropdown-footer">
                <button
                  type="button"
                  className="profile-logout-button"
                  onClick={handleLogout}
                >
                  🚪
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Topbar;