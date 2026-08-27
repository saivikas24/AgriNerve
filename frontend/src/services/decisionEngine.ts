export interface DecisionEngineInput {
  cropName?: string | null;

  waterStatus?:
    | "Good"
    | "Moderate"
    | "Low"
    | "Critical"
    | null;

  waterAvailability?: string | null;

  marketTrend?:
    | "rising"
    | "falling"
    | "stable"
    | null;

  marketAvailable?: boolean;
}

export interface DecisionEngineResult {
  title: string;
  message: string;
  action: string;
  confidence: string;
  priority: "Low" | "Medium" | "High";
}

export function generateDecision(
  input: DecisionEngineInput,
): DecisionEngineResult {
  const {
    cropName,
    waterStatus,
    waterAvailability,
    marketTrend,
    marketAvailable,
  } = input;

  const cropText = cropName
    ? ` for your ${cropName} farm`
    : "";

  /*
   * ==================================================
   * 1. CRITICAL WATER
   *
   * Water shortage takes highest priority.
   * Market conditions must not override a critical
   * irrigation situation.
   * ==================================================
   */

  if (waterStatus === "Critical") {
    return {
      title:
        "Water availability requires urgent attention",

      message:
        `Water availability${cropText} is currently critical. ` +
        "Field conditions should be reviewed before the next irrigation cycle.",

      action:
        "Prioritize irrigation planning and check the field condition.",

      confidence: waterAvailability
        ? "High — based on current water data"
        : "Medium — based on water status",

      priority: "High",
    };
  }

  /*
   * ==================================================
   * 2. LOW WATER
   *
   * Low water also takes priority over market advice.
   * ==================================================
   */

  if (waterStatus === "Low") {
    return {
      title:
        "Water availability is low",

      message:
        `Current water availability${cropText} is low. ` +
        "Irrigation should be planned carefully to avoid unnecessary water use.",

      action:
        "Prioritize essential irrigation and monitor field conditions.",

      confidence: waterAvailability
        ? "High — based on current water data"
        : "Medium — based on water status",

      priority: "High",
    };
  }

  /*
   * ==================================================
   * 3. MODERATE WATER + FALLING MARKET
   *
   * Both conditions matter. Water remains a concern,
   * while the market adds selling caution.
   * ==================================================
   */

  if (
    waterStatus === "Moderate" &&
    marketAvailable &&
    marketTrend === "falling"
  ) {
    return {
      title:
        "Monitor water and market conditions",

      message:
        "Water availability is moderate while the selected market is showing a falling price trend. " +
        "Both irrigation efficiency and selling decisions should be considered carefully.",

      action:
        "Conserve water and review the current market price before selling.",

      confidence:
        "Medium — based on water and market intelligence",

      priority: "Medium",
    };
  }

  /*
   * ==================================================
   * 4. MODERATE WATER
   * ==================================================
   */

  if (waterStatus === "Moderate") {
    return {
      title:
        "Monitor water conditions",

      message:
        `Water availability${cropText} is moderate. ` +
        "Irrigation should be planned according to current field conditions.",

      action:
        "Monitor water availability and avoid unnecessary irrigation.",

      confidence:
        "Medium — based on current water data",

      priority: "Medium",
    };
  }

  /*
   * ==================================================
   * 5. FALLING MARKET
   * ==================================================
   */

  if (
    marketAvailable &&
    marketTrend === "falling"
  ) {
    return {
      title:
        "Market prices are showing a falling trend",

      message:
        "The selected market is currently showing a downward price trend.",

      action:
        "Review the current market price before deciding when to sell.",

      confidence:
        "High — based on market intelligence",

      priority: "Medium",
    };
  }

  /*
   * ==================================================
   * 6. RISING MARKET
   * ==================================================
   */

  if (
    marketAvailable &&
    marketTrend === "rising"
  ) {
    return {
      title:
        "Market prices are showing an improving trend",

      message:
        "The selected market is currently showing a rising price trend.",

      action:
        "Consider monitoring the market before making a selling decision.",

      confidence:
        "High — based on market intelligence",

      priority: "Medium",
    };
  }

  /*
   * ==================================================
   * 7. GOOD WATER + STABLE MARKET
   *
   * This is our normal/stable scenario.
   * ==================================================
   */

  if (
    waterStatus === "Good" &&
    marketAvailable &&
    marketTrend === "stable"
  ) {
    return {
      title:
        "Farm conditions are currently stable",

      message:
        "Water availability is good and the selected market is currently stable.",

      action:
        "Continue normal crop management and monitor conditions.",

      confidence:
        "High — based on available farm, water and market data",

      priority: "Low",
    };
  }

  /*
   * ==================================================
   * 8. GOOD WATER
   * ==================================================
   */

  if (waterStatus === "Good") {
    return {
      title:
        "Water conditions are favorable",

      message:
        `Water availability${cropText} is currently good. ` +
        "Normal irrigation planning can continue while monitoring market conditions.",

      action:
        "Continue normal irrigation and monitor farm conditions.",

      confidence:
        "High — based on current water data",

      priority: "Low",
    };
  }

  /*
   * ==================================================
   * 9. MARKET STABLE WITHOUT WATER DATA
   * ==================================================
   */

  if (
    marketAvailable &&
    marketTrend === "stable"
  ) {
    return {
      title:
        "Market conditions are currently stable",

      message:
        "The selected market is currently showing a stable price trend.",

      action:
        "Continue monitoring the market before making a selling decision.",

      confidence:
        "Medium — based on market intelligence",

      priority: "Low",
    };
  }

  /*
   * ==================================================
   * 10. FALLBACK
   *
   * Never invent a recommendation when important
   * intelligence is missing.
   * ==================================================
   */

  return {
    title:
      "Continue monitoring your farm",

    message:
      "AgriNerve does not currently have enough information to generate a strong agricultural decision.",

    action:
      "Review farm, water and market conditions before taking action.",

    confidence:
      "Low — limited data available",

    priority: "Low",
  };
}