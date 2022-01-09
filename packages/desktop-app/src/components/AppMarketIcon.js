import React from "react";
import { ReactComponent as AppMarket } from "../assets/app-market.svg";
import AppIcon from "./AppIcon";

import { i18n } from "@prifina-apps/utils";
//import i18n from "../lib/i18n";
i18n.init();

const AppMarketIcon = () => (
  <AppIcon title={i18n.__("App Market")} icon={AppMarket} />
);

AppMarketIcon.displayName = "AppMarketIcon";
export default AppMarketIcon;
