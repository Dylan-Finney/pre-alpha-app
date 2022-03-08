/* eslint-disable react/display-name */
/* eslint-disable react/no-multi-comp */

import React from "react";

export default { title: "App Studio" };

import Home from "./pages/AppMarket";

export const defaultApp = props => {
  return <Home />;
};

defaultApp.story = {
  name: "App Studio",
};
